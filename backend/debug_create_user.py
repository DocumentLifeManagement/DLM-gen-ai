from app.core.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.security import hash_password
import traceback

db = SessionLocal()
try:
    # Try to find/create a test role
    role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not role:
        role = Role(name="ADMIN")
        db.add(role)
        db.commit()
        db.refresh(role)
        print("Created ADMIN role")

    email = "test_create@example.com"
    # Cleanup if exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.delete(existing)
        db.commit()
        print("Deleted existing test user")

    print(f"Attempting to create user with email: {email}")
    new_user = User(
        email=email,
        hashed_password=hash_password("password123"),
        role_id=role.id
    )
    db.add(new_user)
    db.commit()
    print("User created successfully!")
except Exception:
    print("FAILED to create user")
    print(traceback.format_exc())
finally:
    db.close()
