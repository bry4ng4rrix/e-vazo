from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from fastapi.responses import FileResponse, StreamingResponse
from database import get_session
from sqlmodel import Session, select, and_, or_, func, desc
from models import (
    User, Music, MusicStatus, UserRole, PaymentCode, Purchase, 
    Favorite, PlayHistory, PaymentStatus, DownloadLog, UserReade, UserUpdate
)
from typing import List, Optional
from routers.auth import get_current_client, get_current_user, get_current_active_user
from decimal import Decimal
from datetime import datetime
import os
from models import ClientStats ,MusicRead, PurchaseRead, PurchaseCreate, FavoriteRead, FavoriteCreate, PlayHistoryRead, PlayHistoryCreate






client_router = APIRouter()



def validate_payment_code(session: Session, code: str) -> Optional[PaymentCode]:
    """Valider un code de paiement et retourner l'objet si valide"""
    statement = select(PaymentCode).where(PaymentCode.code == code)
    payment_code = session.exec(statement).first()
    
    if not payment_code:
        return None
    
    if payment_code.is_used:
        return None
    
    if payment_code.expires_at < datetime.utcnow():
        return None
    
    return payment_code

def calculate_client_stats(session: Session, client_id: int) -> ClientStats:
    purchases_result = session.exec(
        select(
            func.count(Purchase.id).label('total_purchases'),
            func.sum(Purchase.amount_paid).label('total_spent'),
            func.sum(Purchase.download_count).label('total_downloads')
        ).where(Purchase.client_id == client_id)
    ).first()
    
    total_purchases = purchases_result.total_purchases if purchases_result and purchases_result.total_purchases else 0
    total_spent = purchases_result.total_spent if purchases_result and purchases_result.total_spent else Decimal('0.00')
    total_downloads = purchases_result.total_downloads if purchases_result and purchases_result.total_downloads else 0
    
    # Nombre de favoris
    total_favorites = session.exec(
        select(func.count(Favorite.id)).where(Favorite.user_id == client_id)
    ).one() or 0
    
    # Temps total d'écoute
    total_play_time = session.exec(
        select(func.sum(PlayHistory.duration_played)).where(PlayHistory.user_id == client_id)
    ).one() or 0
    
    # Genre favori
    favorite_genre_result = session.exec(
        select(Music.genre, func.count(PlayHistory.id).label('play_count'))
        .select_from(PlayHistory)
        .join(Music)
        .where(and_(PlayHistory.user_id == client_id, Music.genre.isnot(None)))
        .group_by(Music.genre)
        .order_by(desc(func.count(PlayHistory.id)))
        .limit(1)
    ).first()
    
    favorite_genre = favorite_genre_result.genre if favorite_genre_result else None
    
    return ClientStats(
        total_purchases=total_purchases,
        total_spent=total_spent,
        total_favorites=total_favorites,
        total_play_time=total_play_time,
        favorite_genre=favorite_genre,
        total_downloads=total_downloads
    )

def convert_music_to_read(music: Music, artist: Optional[User] = None) -> MusicRead:
    """Convertir un objet Music en MusicRead"""
    artist_data = None
    if artist:
        artist_data = UserReade(
            id=artist.id,
            email=artist.email,
            username=artist.username,
            full_name=artist.full_name or "",
            role=artist.role.value,
            is_active=artist.is_active
        )
    
    return MusicRead(
        id=music.id,
        title=music.title,
        description=music.description,
        genre=music.genre,
        duration=music.duration,
        cover_image_path=music.cover_image_path,
        is_free=music.is_free,
        price=music.price,
        status=music.status,
        play_count=music.play_count,
        download_count=music.download_count,
        artist_id=music.artist_id,
        created_at=music.created_at,
        artist=artist_data
    )

def convert_purchase_to_read(purchase: Purchase, music: Optional[Music] = None) -> PurchaseRead:
    """Convertir un objet Purchase en PurchaseRead"""
    music_data = None
    if music:
        music_data = convert_music_to_read(music)
    
    return PurchaseRead(
        id=purchase.id,
        client_id=purchase.client_id,
        music_id=purchase.music_id,
        payment_code_id=purchase.payment_code_id,
        amount_paid=purchase.amount_paid,
        status=purchase.status,
        download_count=purchase.download_count,
        max_downloads=purchase.max_downloads,
        purchased_at=purchase.purchased_at,
        music=music_data
    )

# ===== ROUTES CLIENT =====

@client_router.get("/me", response_model=UserReade)
def get_client_profile(
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_client)
):
    """Obtenir le profil du client connecté"""
    return UserReade(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name or "",
        role=user.role.value,
        is_active=user.is_active
    )

@client_router.put("/me", response_model=UserReade)
def update_client_profile(
    updated_user: UserUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Mettre à jour le profil du client"""
    client = session.get(User, user.id)
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    
    # Mettre à jour uniquement les champs fournis (exclure les champs spécifiques aux artistes)
    update_data = updated_user.dict(exclude_unset=True, exclude={'artist_bio', 'artist_website'})
    for field, value in update_data.items():
        if hasattr(client, field):
            setattr(client, field, value)
    
    session.add(client)
    session.commit()
    session.refresh(client)
    
    return UserReade(
        id=client.id,
        email=client.email,
        username=client.username,
        full_name=client.full_name or "",
        role=client.role.value,
        is_active=client.is_active
    )

@client_router.get("/musiques", response_model=List[MusicRead])
def browse_musiques(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    genre: Optional[str] = Query(None, description="Filtrer par genre"),
    is_free: Optional[bool] = Query(None, description="Filtrer par type (gratuit/payant)"),
    artist_id: Optional[int] = Query(None, description="Filtrer par artiste"),
    search: Optional[str] = Query(None, description="Rechercher dans titre/description"),
    min_price: Optional[float] = Query(None, ge=0, description="Prix minimum"),
    max_price: Optional[float] = Query(None, ge=0, description="Prix maximum"),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Parcourir les musiques disponibles"""
    statement = select(Music).where(Music.status == MusicStatus.PUBLISHED)
    
    # Appliquer les filtres
    if genre:
        statement = statement.where(Music.genre.ilike(f"%{genre}%"))
    
    if is_free is not None:
        statement = statement.where(Music.is_free == is_free)
    
    if artist_id:
        statement = statement.where(Music.artist_id == artist_id)
    
    if search:
        statement = statement.where(
            or_(
                Music.title.ilike(f"%{search}%"),
                Music.description.ilike(f"%{search}%")
            )
        )
    
    if min_price is not None:
        statement = statement.where(Music.price >= Decimal(str(min_price)))
    
    if max_price is not None:
        statement = statement.where(Music.price <= Decimal(str(max_price)))
    
    statement = statement.offset(skip).limit(limit).order_by(desc(Music.created_at))
    musiques = session.exec(statement).all()
    
    # Charger les artistes
    result = []
    for music in musiques:
        artist = session.get(User, music.artist_id)
        result.append(convert_music_to_read(music, artist))
    
    return result

@client_router.get("/musiques/{music_id}", response_model=MusicRead)
def get_musique_details(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Obtenir les détails d'une musique"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.status == MusicStatus.PUBLISHED)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Charger l'artiste
    artist = session.get(User, music.artist_id)
    return convert_music_to_read(music, artist)

@client_router.post("/purchase", response_model=PurchaseRead)
def purchase_music(
    purchase_data: PurchaseCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Acheter une musique avec un code de paiement"""
    # Vérifier si la musique existe
    music = session.get(Music, purchase_data.music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    if music.is_free:
        raise HTTPException(
            status_code=400,
            detail="Cette musique est gratuite, aucun achat requis"
        )
    
    # Vérifier si l'utilisateur a déjà acheté cette musique
    existing_purchase = session.exec(
        select(Purchase).where(
            and_(
                Purchase.client_id == user.id,
                Purchase.music_id == purchase_data.music_id,
                Purchase.status == PaymentStatus.COMPLETED
            )
        )
    ).first()
    
    if existing_purchase:
        raise HTTPException(
            status_code=400,
            detail="Vous possédez déjà cette musique"
        )
    
    # Valider le code de paiement
    payment_code = validate_payment_code(session, purchase_data.payment_code)
    if not payment_code:
        raise HTTPException(
            status_code=400,
            detail="Code de paiement invalide ou expiré"
        )
    
    if payment_code.music_id != purchase_data.music_id:
        raise HTTPException(
            status_code=400,
            detail="Ce code de paiement n'est pas valide pour cette musique"
        )
    
    # Marquer le code comme utilisé
    payment_code.is_used = True
    payment_code.used_at = datetime.utcnow()
    payment_code.used_by_client_id = user.id
    
    # Créer l'achat
    new_purchase = Purchase(
        client_id=user.id,
        music_id=purchase_data.music_id,
        payment_code_id=payment_code.id,
        amount_paid=payment_code.price,
        status=PaymentStatus.COMPLETED
    )
    
    session.add(payment_code)
    session.add(new_purchase)
    session.commit()
    session.refresh(new_purchase)
    
    return convert_purchase_to_read(new_purchase, music)

@client_router.get("/purchases", response_model=List[PurchaseRead])
def get_my_purchases(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Obtenir l'historique des achats du client"""
    statement = select(Purchase).where(Purchase.client_id == user.id).order_by(desc(Purchase.purchased_at))
    purchases = session.exec(statement).all()
    
    # Charger les musiques associées
    result = []
    for purchase in purchases:
        music = session.get(Music, purchase.music_id)
        result.append(convert_purchase_to_read(purchase, music))
    
    return result

@client_router.post("/favorites", response_model=FavoriteRead)
def add_to_favorites(
    favorite_data: FavoriteCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Ajouter une musique aux favoris"""
    # Vérifier si la musique existe
    music = session.get(Music, favorite_data.music_id)
    if not music or music.status != MusicStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Vérifier si déjà en favoris
    existing_favorite = session.exec(
        select(Favorite).where(
            and_(
                Favorite.user_id == user.id,
                Favorite.music_id == favorite_data.music_id
            )
        )
    ).first()
    
    if existing_favorite:
        raise HTTPException(
            status_code=400,
            detail="Cette musique est déjà dans vos favoris"
        )
    
    # Créer le favori
    new_favorite = Favorite(
        user_id=user.id,
        music_id=favorite_data.music_id
    )
    
    session.add(new_favorite)
    session.commit()
    session.refresh(new_favorite)
    
    return FavoriteRead(
        id=new_favorite.id,
        user_id=new_favorite.user_id,
        music_id=new_favorite.music_id,
        created_at=new_favorite.created_at,
        music=convert_music_to_read(music)
    )

@client_router.get("/favorites", response_model=List[FavoriteRead])
def get_my_favorites(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Obtenir la liste des favoris du client"""
    statement = select(Favorite).where(Favorite.user_id == user.id).order_by(desc(Favorite.created_at))
    favorites = session.exec(statement).all()
    
    # Charger les musiques associées
    result = []
    for favorite in favorites:
        music = session.get(Music, favorite.music_id)
        if music:  # Vérifier que la musique existe encore
            music_read = convert_music_to_read(music)
            result.append(FavoriteRead(
                id=favorite.id,
                user_id=favorite.user_id,
                music_id=favorite.music_id,
                created_at=favorite.created_at,
                music=music_read
            ))
    
    return result

@client_router.delete("/favorites/{favorite_id}")
def remove_from_favorites(
    favorite_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Supprimer une musique des favoris"""
    statement = select(Favorite).where(
        and_(Favorite.id == favorite_id, Favorite.user_id == user.id)
    )
    favorite = session.exec(statement).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favori non trouvé")
    
    session.delete(favorite)
    session.commit()
    
    return {"message": "Musique supprimée des favoris avec succès"}

@client_router.get("/play-history", response_model=List[PlayHistoryRead])
def get_play_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Obtenir l'historique d'écoute du client"""
    statement = select(PlayHistory).where(
        PlayHistory.user_id == user.id
    ).order_by(desc(PlayHistory.played_at)).offset(skip).limit(limit)
    
    history = session.exec(statement).all()
    
    # Charger les musiques associées
    result = []
    for play in history:
        music = session.get(Music, play.music_id)
        if music:
            music_read = convert_music_to_read(music)
            result.append(PlayHistoryRead(
                id=play.id,
                user_id=play.user_id,
                music_id=play.music_id,
                played_at=play.played_at,
                duration_played=play.duration_played,
                music=music_read
            ))
    
    return result

@client_router.get("/statistics", response_model=ClientStats)
def get_client_statistics(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Obtenir les statistiques du client"""
    return calculate_client_stats(session, user.id)

@client_router.get("/download/{music_id}")
def download_music(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Télécharger une musique (gratuite ou achetée)"""
    music = session.get(Music, music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Vérifier les droits de téléchargement
    can_download = False
    purchase = None
    
    if music.is_free:
        can_download = True
    else:
        # Vérifier si l'utilisateur a acheté la musique
        purchase = session.exec(
            select(Purchase).where(
                and_(
                    Purchase.client_id == user.id,
                    Purchase.music_id == music_id,
                    Purchase.status == PaymentStatus.COMPLETED
                )
            )
        ).first()
        
        if purchase:
            if purchase.download_count < purchase.max_downloads:
                can_download = True
                # Incrémenter le compteur de téléchargements
                purchase.download_count += 1
                session.add(purchase)
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Limite de téléchargements atteinte"
                )
    
    if not can_download:
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas l'autorisation de télécharger cette musique"
        )
    
    # Vérifier si le fichier existe
    if not os.path.exists(music.file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    # Incrémenter le compteur de téléchargements global
    music.download_count += 1
    session.add(music)
    
    # Enregistrer le log de téléchargement si c'est un achat
    if purchase:
        download_log = DownloadLog(
            purchase_id=purchase.id,
            ip_address="127.0.0.1",  # À récupérer depuis la requête
            user_agent="FastAPI-Client"  # À récupérer depuis la requête
        )
        session.add(download_log)
    
    session.commit()
    
    # Retourner le fichier
    filename = f"{music.title}.{music.file_path.split('.')[-1]}"
    return FileResponse(
        path=music.file_path,
        media_type='application/octet-stream',
        filename=filename
    )

@client_router.get("/stream/{music_id}")
def stream_music(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Écouter une musique en streaming"""
    music = session.get(Music, music_id)
    if not music or music.status != MusicStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    if not os.path.exists(music.file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    # Incrémenter le compteur de lectures
    music.play_count += 1
    session.add(music)
    
    # Enregistrer dans l'historique de lecture
    play_history = PlayHistory(
        user_id=user.id,
        music_id=music_id,
        duration_played=0  # À mettre à jour côté client
    )
    session.add(play_history)
    session.commit()
    
    def iterfile(file_path: str):
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(music.file_path),
        media_type="audio/mpeg"
    )

@client_router.post("/play-history", response_model=PlayHistoryRead)
def record_play_session(
    play_data: PlayHistoryCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_client)
):
    """Enregistrer une session d'écoute avec la durée"""
    # Vérifier si la musique existe
    music = session.get(Music, play_data.music_id)
    if not music or music.status != MusicStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Créer l'entrée dans l'historique
    play_history = PlayHistory(
        user_id=user.id,
        music_id=play_data.music_id,
        duration_played=play_data.duration_played
    )
    
    session.add(play_history)
    session.commit()
    session.refresh(play_history)
    
    music_read = convert_music_to_read(music)
    return PlayHistoryRead(
        id=play_history.id,
        user_id=play_history.user_id,
        music_id=play_history.music_id,
        played_at=play_history.played_at,
        duration_played=play_history.duration_played,
        music=music_read
    )