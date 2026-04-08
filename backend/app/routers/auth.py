from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    UserUpdate,
    ChangePasswordRequest,
    RefreshRequest,
)
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_and_rotate_refresh_token,
    revoke_all_refresh_tokens,
    get_current_user,
    blacklist_token,
    purge_expired_blacklist,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(user.id, db)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    """
    Exchange a valid refresh token for a new access token + rotated refresh token.
    The old refresh token is immediately revoked (rotation prevents replay attacks).
    """
    user_id, new_refresh = verify_and_rotate_refresh_token(body.refresh_token, db)
    new_access = create_access_token(data={"sub": str(user_id)})
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_data.username:
        exists = (
            db.query(User)
            .filter(User.username == user_data.username, User.id != user.id)
            .first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = user_data.username

    if user_data.email:
        exists = (
            db.query(User)
            .filter(User.email == user_data.email, User.id != user.id)
            .first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_data.email

    db.commit()
    db.refresh(user)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    blacklist_token(token, db)
    revoke_all_refresh_tokens(user.id, db)
    purge_expired_blacklist(db)


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(req.old_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"detail": "Password updated"}
