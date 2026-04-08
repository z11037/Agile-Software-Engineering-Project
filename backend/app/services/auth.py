import hashlib
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.refresh_token import RefreshToken
from app.models.token_blacklist import TokenBlacklist
from app.models.user import User

SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15   # short-lived; silently refreshed via refresh token
REFRESH_TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── password helpers ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


# ── access token ──────────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def blacklist_token(token: str, db: Session) -> None:
    """Add a token's JTI to the blacklist so it cannot be reused."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti: str | None = payload.get("jti")
        exp = payload.get("exp")
        if not jti or exp is None:
            return

        expires_at = datetime.fromtimestamp(float(exp), tz=timezone.utc)
        exists = db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first()
        if exists:
            return

        db.add(TokenBlacklist(jti=jti, expires_at=expires_at))
        db.commit()
    except JWTError:
        pass


def purge_expired_blacklist(db: Session) -> None:
    db.query(TokenBlacklist).filter(
        TokenBlacklist.expires_at < datetime.now(timezone.utc)
    ).delete(synchronize_session=False)
    db.commit()


# ── refresh token ─────────────────────────────────────────────────────────────

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def create_refresh_token(user_id: int, db: Session) -> str:
    """Generate a new refresh token, persist its hash, and return the raw value."""
    raw = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=_hash_token(raw),
            expires_at=expires_at,
        )
    )
    db.commit()
    return raw


def verify_and_rotate_refresh_token(raw: str, db: Session) -> tuple[int, str]:
    """
    Validate a refresh token, revoke it, and issue a replacement.

    Returns ``(user_id, new_raw_refresh_token)``.
    Raises HTTP 401 on any validation failure.
    """
    record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == _hash_token(raw))
        .first()
    )

    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )

    if not record:
        raise invalid
    if record.revoked:
        # Possible token reuse attack — revoke every token for this user.
        db.query(RefreshToken).filter(RefreshToken.user_id == record.user_id).update(
            {"revoked": True}
        )
        db.commit()
        raise invalid

    # SQLite stores naive datetimes; normalise before comparing.
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise invalid

    record.revoked = True
    db.commit()

    new_raw = create_refresh_token(record.user_id, db)
    return record.user_id, new_raw


def revoke_all_refresh_tokens(user_id: int, db: Session) -> None:
    """Revoke every active refresh token for a user (called on logout)."""
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked.is_(False),
    ).update({"revoked": True})
    db.commit()


# ── current-user dependency ───────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str | None = payload.get("sub")
        jti: str | None = payload.get("jti")
        if sub is None or jti is None:
            raise credentials_exception
        user_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception

    blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first()
    if blacklisted:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
