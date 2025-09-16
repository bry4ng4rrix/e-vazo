from fastapi import APIRouter, Depends, HTTPException, Query, status
from models import (
    User, UserReade, UserUpdate, Music, MusicStatus, UserRole, 
    Purchase, PaymentCode, Favorite, PlayHistory, PaymentStatus
)
from sqlmodel import Session, select, func, desc, and_, or_
from typing import List, Dict, Optional
from database import get_session
from routers.auth import get_current_admin, get_current_user
from decimal import Decimal
from datetime import datetime, timedelta
import os

admin_router = APIRouter(prefix="/admin", tags=["Administration"])

# ===== MODÈLES POUR LES RÉPONSES ADMIN =====

from sqlmodel import SQLModel

class MusicRead(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    duration: Optional[int] = None
    file_path: str
    cover_image_path: Optional[str] = None
    is_free: bool
    price: Decimal
    status: MusicStatus
    play_count: int
    download_count: int
    artist_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Relations
    artist: Optional[UserReade] = None

class AdminStats(SQLModel):
    total_users: int
    total_artists: int
    total_clients: int
    active_users: int
    inactive_users: int
    total_musics: int
    published_musics: int
    draft_musics: int
    archived_musics: int
    total_purchases: int
    total_revenue: Decimal
    total_payment_codes: int
    active_payment_codes: int
    expired_payment_codes: int

class UserStats(SQLModel):
    user: UserReade
    music_count: int
    purchase_count: int
    favorite_count: int
    play_count: int
    revenue: Decimal

class MusicStats(SQLModel):
    music: MusicRead
    purchase_count: int
    revenue: Decimal
    favorite_count: int
    play_count: int

# ===== FONCTIONS UTILITAIRES =====

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
        file_path=music.file_path,
        cover_image_path=music.cover_image_path,
        is_free=music.is_free,
        price=music.price,
        status=music.status,
        play_count=music.play_count,
        download_count=music.download_count,
        artist_id=music.artist_id,
        created_at=music.created_at,
        updated_at=music.updated_at,
        artist=artist_data
    )

def calculate_admin_stats(session: Session) -> AdminStats:
    """Calculer les statistiques globales de la plateforme"""
    
    # Statistiques utilisateurs
    total_users = session.exec(select(func.count(User.id))).one() or 0
    total_artists = session.exec(
        select(func.count(User.id)).where(User.role == UserRole.ARTISTE)
    ).one() or 0
    total_clients = session.exec(
        select(func.count(User.id)).where(User.role == UserRole.CLIENT)
    ).one() or 0
    active_users = session.exec(
        select(func.count(User.id)).where(User.is_active == True)
    ).one() or 0
    inactive_users = total_users - active_users
    
    # Statistiques musiques
    total_musics = session.exec(select(func.count(Music.id))).one() or 0
    published_musics = session.exec(
        select(func.count(Music.id)).where(Music.status == MusicStatus.PUBLISHED)
    ).one() or 0
    draft_musics = session.exec(
        select(func.count(Music.id)).where(Music.status == MusicStatus.DRAFT)
    ).one() or 0
    archived_musics = session.exec(
        select(func.count(Music.id)).where(Music.status == MusicStatus.ARCHIVED)
    ).one() or 0
    
    # Statistiques achats
    purchases_result = session.exec(
        select(
            func.count(Purchase.id).label('total_purchases'),
            func.sum(Purchase.amount_paid).label('total_revenue')
        ).where(Purchase.status == PaymentStatus.COMPLETED)
    ).first()
    
    total_purchases = purchases_result.total_purchases if purchases_result and purchases_result.total_purchases else 0
    total_revenue = purchases_result.total_revenue if purchases_result and purchases_result.total_revenue else Decimal('0.00')
    
    # Statistiques codes de paiement
    total_payment_codes = session.exec(select(func.count(PaymentCode.id))).one() or 0
    active_payment_codes = session.exec(
        select(func.count(PaymentCode.id)).where(
            and_(
                PaymentCode.is_used == False,
                PaymentCode.expires_at > datetime.utcnow()
            )
        )
    ).one() or 0
    expired_payment_codes = session.exec(
        select(func.count(PaymentCode.id)).where(PaymentCode.expires_at <= datetime.utcnow())
    ).one() or 0
    
    return AdminStats(
        total_users=total_users,
        total_artists=total_artists,
        total_clients=total_clients,
        active_users=active_users,
        inactive_users=inactive_users,
        total_musics=total_musics,
        published_musics=published_musics,
        draft_musics=draft_musics,
        archived_musics=archived_musics,
        total_purchases=total_purchases,
        total_revenue=total_revenue,
        total_payment_codes=total_payment_codes,
        active_payment_codes=active_payment_codes,
        expired_payment_codes=expired_payment_codes
    )

# ===== ROUTES GESTION DES UTILISATEURS =====

@admin_router.get("/users", response_model=List[UserReade])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    role: Optional[UserRole] = Query(None, description="Filtrer par rôle"),
    is_active: Optional[bool] = Query(None, description="Filtrer par statut"),
    search: Optional[str] = Query(None, description="Rechercher dans nom/email"),
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_admin)
):
    """Obtenir tous les utilisateurs avec filtres"""
    statement = select(User)
    
    # Appliquer les filtres
    if role:
        statement = statement.where(User.role == role)
    
    if is_active is not None:
        statement = statement.where(User.is_active == is_active)
    
    if search:
        statement = statement.where(
            or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%")
            )
        )
    
    statement = statement.offset(skip).limit(limit).order_by(desc(User.created_at))
    users = session.exec(statement).all()
    
    return [UserReade(
        id=u.id,
        email=u.email,
        username=u.username,
        full_name=u.full_name or "",
        role=u.role.value,
        is_active=u.is_active
    ) for u in users]

@admin_router.get("/users/artists", response_model=List[UserReade])
def get_all_artists(
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_admin)
):
    """Obtenir tous les artistes"""
    statement = select(User).where(User.role == UserRole.ARTISTE).order_by(desc(User.created_at))
    artists = session.exec(statement).all()
    
    return [UserReade(
        id=a.id,
        email=a.email,
        username=a.username,
        full_name=a.full_name or "",
        role=a.role.value,
        is_active=a.is_active
    ) for a in artists]

@admin_router.get("/users/clients", response_model=List[UserReade])
def get_all_clients(
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_admin)
):
    """Obtenir tous les clients"""
    statement = select(User).where(User.role == UserRole.CLIENT).order_by(desc(User.created_at))
    clients = session.exec(statement).all()
    
    return [UserReade(
        id=c.id,
        email=c.email,
        username=c.username,
        full_name=c.full_name or "",
        role=c.role.value,
        is_active=c.is_active
    ) for c in clients]

@admin_router.get("/users/{user_id}", response_model=UserReade)
def get_user_by_id(
    user_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir un utilisateur spécifique"""
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return UserReade(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        full_name=target_user.full_name or "",
        role=target_user.role.value,
        is_active=target_user.is_active
    )

@admin_router.put("/users/{user_id}", response_model=UserReade)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Modifier un utilisateur (admin uniquement)"""
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Mettre à jour les champs fournis
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(target_user, field):
            setattr(target_user, field, value)
    
    session.add(target_user)
    session.commit()
    session.refresh(target_user)
    
    return UserReade(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        full_name=target_user.full_name or "",
        role=target_user.role.value,
        is_active=target_user.is_active
    )

@admin_router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Activer un utilisateur"""
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    target_user.is_active = True
    session.add(target_user)
    session.commit()
    
    return {"message": f"Utilisateur {target_user.username} activé avec succès"}

@admin_router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Désactiver un utilisateur"""
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if target_user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Impossible de désactiver un administrateur"
        )
    
    target_user.is_active = False
    session.add(target_user)
    session.commit()
    
    return {"message": f"Utilisateur {target_user.username} désactivé avec succès"}

@admin_router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Supprimer un utilisateur (attention: suppression définitive)"""
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if target_user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Impossible de supprimer un administrateur"
        )
    
    if target_user.id == user.id:
        raise HTTPException(
            status_code=403, 
            detail="Impossible de se supprimer soi-même"
        )
    
    session.delete(target_user)
    session.commit()
    
    return {"message": f"Utilisateur {target_user.username} supprimé avec succès"}

# ===== ROUTES GESTION DES MUSIQUES =====

@admin_router.get("/musics", response_model=List[MusicRead])
def get_all_musics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    status: Optional[MusicStatus] = Query(None, description="Filtrer par statut"),
    artist_id: Optional[int] = Query(None, description="Filtrer par artiste"),
    genre: Optional[str] = Query(None, description="Filtrer par genre"),
    is_free: Optional[bool] = Query(None, description="Filtrer par type"),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir toutes les musiques avec filtres"""
    statement = select(Music)
    
    # Appliquer les filtres
    if status:
        statement = statement.where(Music.status == status)
    
    if artist_id:
        statement = statement.where(Music.artist_id == artist_id)
    
    if genre:
        statement = statement.where(Music.genre.ilike(f"%{genre}%"))
    
    if is_free is not None:
        statement = statement.where(Music.is_free == is_free)
    
    statement = statement.offset(skip).limit(limit).order_by(desc(Music.created_at))
    musics = session.exec(statement).all()
    
    # Charger les artistes
    result = []
    for music in musics:
        artist = session.get(User, music.artist_id)
        result.append(convert_music_to_read(music, artist))
    
    return result

@admin_router.get("/musics/{music_id}", response_model=MusicRead)
def get_music_details(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir les détails d'une musique"""
    music = session.get(Music, music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    artist = session.get(User, music.artist_id)
    return convert_music_to_read(music, artist)

@admin_router.put("/musics/{music_id}/status")
def update_music_status(
    music_id: int,
    new_status: MusicStatus,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Modifier le statut d'une musique"""
    music = session.get(Music, music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    old_status = music.status
    music.status = new_status
    session.add(music)
    session.commit()
    
    return {
        "message": f"Statut de la musique '{music.title}' changé de {old_status.value} à {new_status.value}"
    }

@admin_router.delete("/musics/{music_id}")
def delete_music(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Supprimer une musique (attention: suppression définitive)"""
    music = session.get(Music, music_id)
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Supprimer les fichiers physiques
    if os.path.exists(music.file_path):
        os.remove(music.file_path)
    
    if music.cover_image_path and os.path.exists(music.cover_image_path):
        os.remove(music.cover_image_path)
    
    title = music.title
    session.delete(music)
    session.commit()
    
    return {"message": f"Musique '{title}' supprimée avec succès"}

# ===== ROUTES STATISTIQUES ET MONITORING =====

@admin_router.get("/statistics", response_model=AdminStats)
def get_platform_statistics(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir les statistiques globales de la plateforme"""
    return calculate_admin_stats(session)

@admin_router.get("/statistics/users", response_model=List[UserStats])
def get_users_statistics(
    limit: int = Query(20, le=100),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir les statistiques détaillées des utilisateurs"""
    statement = select(User).limit(limit)
    users = session.exec(statement).all()
    
    result = []
    for target_user in users:
        # Compter les musiques (pour les artistes)
        music_count = 0
        if target_user.role == UserRole.ARTISTE:
            music_count = session.exec(
                select(func.count(Music.id)).where(Music.artist_id == target_user.id)
            ).one() or 0
        
        # Compter les achats (pour les clients)
        purchase_count = 0
        revenue = Decimal('0.00')
        if target_user.role == UserRole.CLIENT:
            purchase_count = session.exec(
                select(func.count(Purchase.id)).where(Purchase.client_id == target_user.id)
            ).one() or 0
        elif target_user.role == UserRole.ARTISTE:
            revenue_result = session.exec(
                select(func.sum(Purchase.amount_paid))
                .select_from(Purchase)
                .join(Music)
                .where(Music.artist_id == target_user.id)
            ).one() or Decimal('0.00')
            revenue = revenue_result if revenue_result else Decimal('0.00')
        
        # Compter les favoris
        favorite_count = session.exec(
            select(func.count(Favorite.id)).where(Favorite.user_id == target_user.id)
        ).one() or 0
        
        # Compter les écoutes
        play_count = session.exec(
            select(func.count(PlayHistory.id)).where(PlayHistory.user_id == target_user.id)
        ).one() or 0
        
        result.append(UserStats(
            user=UserReade(
                id=target_user.id,
                email=target_user.email,
                username=target_user.username,
                full_name=target_user.full_name or "",
                role=target_user.role.value,
                is_active=target_user.is_active
            ),
            music_count=music_count,
            purchase_count=purchase_count,
            favorite_count=favorite_count,
            play_count=play_count,
            revenue=revenue
        ))
    
    return result

@admin_router.get("/statistics/musics", response_model=List[MusicStats])
def get_musics_statistics(
    limit: int = Query(20, le=100),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir les statistiques des musiques les plus populaires"""
    statement = select(Music).order_by(desc(Music.play_count)).limit(limit)
    musics = session.exec(statement).all()
    
    result = []
    for music in musics:
        # Compter les achats
        purchase_count = session.exec(
            select(func.count(Purchase.id)).where(Purchase.music_id == music.id)
        ).one() or 0
        
        # Calculer les revenus
        revenue = session.exec(
            select(func.sum(Purchase.amount_paid)).where(Purchase.music_id == music.id)
        ).one() or Decimal('0.00')
        
        # Compter les favoris
        favorite_count = session.exec(
            select(func.count(Favorite.id)).where(Favorite.music_id == music.id)
        ).one() or 0
        
        # Charger l'artiste
        artist = session.get(User, music.artist_id)
        
        result.append(MusicStats(
            music=convert_music_to_read(music, artist),
            purchase_count=purchase_count,
            revenue=revenue if revenue else Decimal('0.00'),
            favorite_count=favorite_count,
            play_count=music.play_count
        ))
    
    return result

@admin_router.get("/payment-codes")
def get_payment_codes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    is_used: Optional[bool] = Query(None, description="Filtrer par utilisation"),
    expired: Optional[bool] = Query(None, description="Filtrer par expiration"),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir tous les codes de paiement"""
    statement = select(PaymentCode)
    
    if is_used is not None:
        statement = statement.where(PaymentCode.is_used == is_used)
    
    if expired is not None:
        if expired:
            statement = statement.where(PaymentCode.expires_at <= datetime.utcnow())
        else:
            statement = statement.where(PaymentCode.expires_at > datetime.utcnow())
    
    statement = statement.offset(skip).limit(limit).order_by(desc(PaymentCode.created_at))
    codes = session.exec(statement).all()
    
    return codes

@admin_router.get("/recent-activity")
def get_recent_activity(
    limit: int = Query(50, le=200),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_admin)
):
    """Obtenir l'activité récente de la plateforme"""
    
    # Nouveaux utilisateurs
    new_users = session.exec(
        select(User)
        .where(User.created_at >= datetime.utcnow() - timedelta(days=7))
        .order_by(desc(User.created_at))
        .limit(limit // 4)
    ).all()
    
    # Nouvelles musiques
    new_musics = session.exec(
        select(Music)
        .where(Music.created_at >= datetime.utcnow() - timedelta(days=7))
        .order_by(desc(Music.created_at))
        .limit(limit // 4)
    ).all()
    
    # Achats récents
    recent_purchases = session.exec(
        select(Purchase)
        .where(Purchase.purchased_at >= datetime.utcnow() - timedelta(days=7))
        .order_by(desc(Purchase.purchased_at))
        .limit(limit // 4)
    ).all()
    
    # Écoutes récentes
    recent_plays = session.exec(
        select(PlayHistory)
        .where(PlayHistory.played_at >= datetime.utcnow() - timedelta(days=1))
        .order_by(desc(PlayHistory.played_at))
        .limit(limit // 4)
    ).all()
    
    return {
        "new_users": len(new_users),
        "new_musics": len(new_musics),
        "recent_purchases": len(recent_purchases),
        "recent_plays": len(recent_plays),
        "period": "7 derniers jours"
    }