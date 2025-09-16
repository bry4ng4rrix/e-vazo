from fastapi import APIRouter









musique_router = APIRouter()



@musique_router.get("/all")
async def get_musique():
    return {"message": "Musique endpoint"}