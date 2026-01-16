# app/core/rbac.py
from fastapi import Depends, HTTPException
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from app.core.jwt import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def require_role(allowed_roles: list[str]):
    def role_checker(token: str = Depends(oauth2_scheme)):
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")

        if role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return payload

    return role_checker
