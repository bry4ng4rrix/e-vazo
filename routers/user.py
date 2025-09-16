from fastapi import APIRouter, Depends, HTTPException
from models import User ,UserReade
from sqlmodel import Session, select
from typing import List, Dict, Set
from database import get_session
from routers.auth import get_current_user


user_router = APIRouter()



@user_router.get("/all", response_model=List[UserReade])
def get_all_users(session : Session = Depends(get_session), user : User = Depends(get_current_user)):
    users  = session.exec(select(User)).first()
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Pour l'admin seulements")  
    return users

@user_router.get("/artiste", response_model=List[UserReade])
def get_all_artist(session : Session = Depends(get_session), user : User = Depends(get_current_user)):
    artiste = session.exec(select(User).where(User.role == "artiste")).all()
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Pour l'admin seulements")  
    return artiste

@user_router.get("/client", response_model=List[UserReade])
def get_all_artist(session : Session = Depends(get_session), user : User = Depends(get_current_user)):
    clients = session.exec(select(User).where(User.role == "client")).all()
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Pour l'admin seulements")  
    return clients