from fastapi import APIRouter, Depends, HTTPException


user_router = APIRouter()



@user_router.get("/user")
async def get_user():
    return {"message": "User endpoint"}