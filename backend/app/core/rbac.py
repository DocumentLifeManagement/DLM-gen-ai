# app/core/rbac.py
from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.jwt import SECRET_KEY, ALGORITHM

auth_scheme = HTTPBearer()

def require_role(allowed_roles: list[str]):
    def role_checker(auth: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        token = auth.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            role = payload.get("role")

            if role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Access forbidden")
            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    return role_checker
