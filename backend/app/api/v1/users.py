from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.role import Role
from app.core.security import hash_password
import logging

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    role: str

class UserUpdate(BaseModel):
    full_name: str | None = None
    password: str | None = None
    role: str | None = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    role: str
    is_active: bool | None = True

    class Config:
        from_attributes = True

@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.name if u.role else "N/A",
            "is_active": u.is_active if u.is_active is not None else True
        } for u in users
    ]

@router.post("")
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # Get role (case-insensitive)
        role_name = user_in.role.upper() if user_in.role else "UPLOADER"
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            # Fallback to create role if missing, or just error
            raise HTTPException(status_code=400, detail=f"Role {role_name} not found in database")

        # Create user
        new_user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hash_password(user_in.password),
            role_id=role.id,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User created successfully", "id": new_user.id}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logging.error(f"FATAL ERROR in create_user: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    
    if user_in.password is not None:
        user.hashed_password = hash_password(user_in.password)
    
    if user_in.role is not None:
        role_name = user_in.role.upper()
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            raise HTTPException(status_code=400, detail=f"Role {role_name} not found")
        user.role_id = role.id
        
    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully"}



@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    return [r.name for r in roles]
