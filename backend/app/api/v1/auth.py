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

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

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
        "name": user.full_name or user.email.split("@")[0],
        "role": user.role.name
    })

    return {
        "access_token": token, 
        "token_type": "bearer",
        "full_name": user.full_name or user.email.split("@")[0]
    }

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    from app.models.role import Role
    from app.core.security import hash_password
    
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not role:
        raise HTTPException(status_code=500, detail="Default role not found")
        
    user = User(
        email=request.email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
        role_id=role.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({
        "sub": user.email,
        "name": user.full_name or user.email.split("@")[0],
        "role": user.role.name
    })

    return {
        "access_token": token, 
        "token_type": "bearer", 
        "role": user.role.name,
        "full_name": user.full_name
    }
