from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User


def require_role(*roles: str):
    """
    Dependency factory to restrict access based on user roles.
    Usage: Depends(require_role("ngo", "admin"))
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: insufficient permissions"
            )
        return current_user

    return role_checker