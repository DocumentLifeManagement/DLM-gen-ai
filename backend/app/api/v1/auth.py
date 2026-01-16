# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import verify_password
from app.core.jwt import create_access_token

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email
    password = request.password
    role = request.role
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify role matches
    if user.role.name != role:
        raise HTTPException(status_code=403, detail="Invalid role")

    token = create_access_token({
        "sub": user.email,
        "role": user.role.name
    })

    return {"access_token": token, "token_type": "bearer"}
