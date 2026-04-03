import re

from pydantic import BaseModel, EmailStr, field_validator

PASSWORD_MIN_LENGTH = 8
_LOWER_RE = re.compile(r"[a-z]")
_UPPER_RE = re.compile(r"[A-Z]")
_DIGIT_RE = re.compile(r"\d")


def _validate_password_strength(password: str) -> None:
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long.")

    missing: list[str] = []
    if not _UPPER_RE.search(password):
        missing.append("an uppercase letter")
    if not _LOWER_RE.search(password):
        missing.append("a lowercase letter")
    if not _DIGIT_RE.search(password):
        missing.append("a digit")

    if missing:
        missing_text = ", ".join(missing)
        raise ValueError(
            "Password is too weak. "
            f"Missing: {missing_text}. "
            f"It must include at least one uppercase letter, one lowercase letter, and one digit."
        )
PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")
PASSWORD_RULES = (
    f"Password must be at least {PASSWORD_MIN_LENGTH} characters "
    "and contain at least one uppercase letter, one lowercase letter, and one digit"
)


def _validate_password(value: str) -> str:
    if len(value) < PASSWORD_MIN_LENGTH:
        raise ValueError(PASSWORD_RULES)
    if not PASSWORD_PATTERN.match(value):
        raise ValueError(PASSWORD_RULES)
    return value


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        _validate_password_strength(v)
        return v
    def password_strength(cls, v: str) -> str:
        return _validate_password(v)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        _validate_password_strength(v)
        return v
    def new_password_strength(cls, v: str) -> str:
        return _validate_password(v)
