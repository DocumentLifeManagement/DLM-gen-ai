from app.core.database import SessionLocal
from app.models.user import User
from app.models.role import Role
import json

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"DEBUG: Found {len(users)} users")
    for u in users:
        print(f"--- User ID: {u.id} ---")
        print(f"Email: {u.email}")
        print(f"Role ID: {u.role_id}")
        print(f"Role Object: {u.role}")
        if u.role:
            print(f"Role Name: {u.role.name}")
        print(f"Is Active: {u.is_active}")
except Exception as e:
    import traceback
    print(traceback.format_exc())
finally:
    db.close()
