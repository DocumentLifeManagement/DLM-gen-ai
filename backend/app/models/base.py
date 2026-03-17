# Re-export Base from the single source of truth to avoid duplicate Base instances.
# All models must use this Base so their tables are registered on the same metadata.
from app.core.database import Base

__all__ = ["Base"]