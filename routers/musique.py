from fastapi import APIRouter ,Depends, HTTPException
from database import get_session 
from sqlmodel import Session ,select
from models import User, Music ,Purchase ,Favorite
from typing import List
from routers.auth import get_current_user



musique_router = APIRouter()



@musique_router.get("/all" ,response_model=List[Music])
async def get_musique(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Pour l'admin seulements")
    musique = session.exec(select(Music)).all()
    return musique


@musique_router.get("/client/purchased" ,response_model=List[Music])
def get_purchased_musique(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "client":
        raise HTTPException(status_code=403, detail="Pour le client seulements")
    musique = session.exec(select(Music).where(Music.purchases.any(client_id=user.id))).all()
    return musique

@musique_router.get("/client/favorite" ,response_model=List[Music])
def get_favorite_musique(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "client":
        raise HTTPException(status_code=403, detail="Pour le client seulements")
    musique = session.exec(select(Music).where(Music.favorites.any(user_id=user.id))).all()    
    return musique

@musique_router.post("/client/favorite/{musique_id}", response_model=Music)
def add_favorite_musique(musique_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "client":
        raise HTTPException(status_code=403, detail="Pour le client seulements")
    musique = session.get(Music, musique_id)
    if not musique:
        raise HTTPException(status_code=404, detail="Musique non trouvée")

    existing_favorite = session.exec(
        select(Favorite).where(Favorite.user_id == user_id, Favorite.music_id == music_id)
    ).first()
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Musique déjà dans les favoris")

    favorite = Favorite(user_id=user_id, music_id=music_id)
    session.add(favorite)
    session.commit()
    session.refresh(favorite)
    return musique

@musique_router.delete("/client/favorite/{musique_id}", response_model=Music)
def remove_favorite_musique(musique_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "client":    
        raise HTTPException(status_code=403, detail="Pour le client seulements")
    musique = session.get(Music, musique_id)
    if not musique:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    musique.favorites = [fav for fav in musique.favorites if fav.user_id != user.id]
    session.add(musique)
    session.commit()
    session.refresh(musique)
    return musique


@musique_router.get("/artiste/musique" ,response_model=List[Music])
async def get_musique_artiste(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "artiste":
        raise HTTPException(status_code=403, detail="Pour l'artiste seulements")
    musique = session.exec(select(Music).where(Music.artist_id == user.id)).all()
    return musique



@musique_router.delete("/artiste/{musique_id}/me")
def delete_musique(musique_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if user.role != "artiste":
        raise HTTPException(status_code=403, detail="Pour l'artiste seulements")
    musique = session.get(Music, musique_id)
    if not musique or musique.artist_id != user.id:
        raise HTTPException(status_code=404, detail="Musique non trouvée ou accès refusé")
    session.delete(musique)
    session.commit()
    return {"detail": "Musique supprimée avec succès"}