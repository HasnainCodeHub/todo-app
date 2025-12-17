# WARNING: This file is not used in the project. It is a placeholder for the authentication system.

import jwt
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Header, status
from typing import Optional

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    password = password[:72] # Truncate password to 72 characters as bcrypt has a limit
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.BETTER_AUTH_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_test_token(user_id: str | int) -> str:
    """Create a test token for use in unit tests.

    Args:
        user_id: The user ID to encode in the token.

    Returns:
        A valid JWT token for testing.
    """
    return create_access_token({"sub": str(user_id)})

async def get_current_user_id(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> int:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return int(user_id) # Ensure user_id is an int
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
