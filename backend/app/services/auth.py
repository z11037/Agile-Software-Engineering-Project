import os
import uuid
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.token_blacklist import TokenBlacklist

SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
_TOKEN_BLOCKLIST: dict[str, datetime] = {}


def _cleanup_blocklist(now: datetime) -> None:
    expired = [jti for jti, exp in _TOKEN_BLOCKLIST.items() if exp <= now]
    for jti in expired:
        _TOKEN_BLOCKLIST.pop(jti, None)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "jti": str(uuid.uuid4()),
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def blacklist_token(token: str, db: Session) -> None:
    """Add a token's JTI to the blacklist so it cannot be reused."""
    to_encode.update({"exp": expire, "jti": str(uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def revoke_token(token: str) -> None:
    now = datetime.now(timezone.utc)
    _cleanup_blocklist(now)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti: str | None = payload.get("jti")
        exp = payload.get("exp")
        if not jti or not exp:
            return
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
        entry = TokenBlacklist(jti=jti, expires_at=expires_at)
        db.add(entry)
        db.commit()
    except JWTError:
        pass  # token already invalid — nothing to blacklist


def _purge_expired_blacklist(db: Session) -> None:
    """Delete blacklist entries whose tokens have naturally expired."""
    db.query(TokenBlacklist).filter(
        TokenBlacklist.expires_at < datetime.now(timezone.utc)
    ).delete(synchronize_session=False)
    db.commit()

        if jti is None or exp is None:
            return
        exp_dt = datetime.fromtimestamp(float(exp), tz=timezone.utc)
        _TOKEN_BLOCKLIST[jti] = exp_dt
    except JWTError:
        # Invalid/expired tokens are treated as already unusable.
        return


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
        jti: str | None = payload.get("jti")
        if jti is not None:
            _cleanup_blocklist(datetime.now(timezone.utc))
            if jti in _TOKEN_BLOCKLIST:
                raise credentials_exception
        sub: str | None = payload.get("sub")
        jti: str | None = payload.get("jti")
        if sub is None or jti is None:
            raise credentials_exception
        user_id = int(sub)
    except (JWTError, ValueError):
        raise credentials_exception

    # Reject tokens that have been explicitly logged out
    blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first()
    if blacklisted:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
