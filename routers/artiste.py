from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from database import get_session
from sqlmodel import Session, select, and_
from models import (
    User, Music, MusicStatus, UserRole, PaymentCode, Purchase, 
    generate_payment_code, create_payment_code_expires_at
)
from typing import List, Optional
from routers.auth import get_current_artist, get_current_user
from decimal import Decimal
from datetime import datetime, timedelta
import os
import shutil
import uuid

artiste_router = APIRouter()

# Configuration pour les uploads
UPLOAD_DIR = "uploads"
MUSIC_DIR = os.path.join(UPLOAD_DIR, "music")
COVERS_DIR = os.path.join(UPLOAD_DIR, "covers")

# Créer les dossiers s'ils n'existent pas
os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(COVERS_DIR, exist_ok=True)

# Formats autorisés
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.flac', '.m4a', '.ogg'}
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

# ===== MODÈLES POUR LES RÉPONSES =====

from sqlmodel import SQLModel

class UserRead(SQLModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    artist_bio: Optional[str] = None
    artist_website: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserUpdate(SQLModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    artist_bio: Optional[str] = None
    artist_website: Optional[str] = None

class MusicCreate(SQLModel):
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    is_free: bool = True
    price: Optional[Decimal] = Decimal('0.00')

class MusicUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    is_free: Optional[bool] = None
    price: Optional[Decimal] = None
    status: Optional[MusicStatus] = None

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

class PaymentCodeRead(SQLModel):
    id: int
    code: str
    music_id: int
    price: Decimal
    is_used: bool
    expires_at: datetime
    created_at: datetime
    used_at: Optional[datetime] = None
    used_by_client_id: Optional[int] = None

class ArtisteStats(SQLModel):
    total_musics: int
    total_plays: int
    total_downloads: int
    total_revenue: Decimal
    total_sales: int
    published_musics: int
    draft_musics: int

# ===== FONCTIONS UTILITAIRES =====

def validate_audio_file(filename: str, content_type: str) -> bool:
    """Valider si le fichier est un fichier audio accepté"""
    if not filename:
        return False
    extension = os.path.splitext(filename.lower())[1]
    return extension in ALLOWED_AUDIO_EXTENSIONS

def validate_image_file(filename: str, content_type: str) -> bool:
    """Valider si le fichier est une image acceptée"""
    if not filename:
        return False
    extension = os.path.splitext(filename.lower())[1]
    return extension in ALLOWED_IMAGE_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    """Générer un nom de fichier unique"""
    name, ext = os.path.splitext(original_filename)
    unique_id = str(uuid.uuid4())[:8]
    return f"{name}_{unique_id}{ext}"

def generate_unique_payment_code(session: Session) -> str:
    """Génère un code de paiement unique en vérifiant l'unicité en base"""
    while True:
        code = generate_payment_code()
        statement = select(PaymentCode).where(PaymentCode.code == code)
        existing = session.exec(statement).first()
        if not existing:
            return code

def calculate_artist_stats(session: Session, artist_id: int) -> ArtisteStats:
    """Calculer les statistiques d'un artiste"""
    from sqlmodel import func
    
    # Compter les musiques
    total_musics = session.exec(
        select(func.count(Music.id)).where(Music.artist_id == artist_id)
    ).one() or 0
    
    published_musics = session.exec(
        select(func.count(Music.id)).where(
            and_(Music.artist_id == artist_id, Music.status == MusicStatus.PUBLISHED)
        )
    ).one() or 0
    
    draft_musics = session.exec(
        select(func.count(Music.id)).where(
            and_(Music.artist_id == artist_id, Music.status == MusicStatus.DRAFT)
        )
    ).one() or 0
    
    # Statistiques de lecture et téléchargement
    total_plays = session.exec(
        select(func.sum(Music.play_count)).where(Music.artist_id == artist_id)
    ).one() or 0
    
    total_downloads = session.exec(
        select(func.sum(Music.download_count)).where(Music.artist_id == artist_id)
    ).one() or 0
    
    # Statistiques de vente
    sales_result = session.exec(
        select(
            func.count(Purchase.id).label('total_sales'),
            func.sum(Purchase.amount_paid).label('total_revenue')
        ).select_from(Purchase).join(Music).where(Music.artist_id == artist_id)
    ).first()
    
    total_sales = sales_result.total_sales if sales_result and sales_result.total_sales else 0
    total_revenue = sales_result.total_revenue if sales_result and sales_result.total_revenue else Decimal('0.00')
    
    return ArtisteStats(
        total_musics=total_musics,
        total_plays=total_plays,
        total_downloads=total_downloads,
        total_revenue=total_revenue,
        total_sales=total_sales,
        published_musics=published_musics,
        draft_musics=draft_musics
    )

# ===== ROUTES ARTISTE =====

@artiste_router.get("/me", response_model=UserRead)
def get_artiste_profile(
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_artist)
):
    """Obtenir le profil de l'artiste connecté"""
    return UserRead(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        artist_bio=user.artist_bio,
        artist_website=user.artist_website,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@artiste_router.put("/me", response_model=UserRead)
def update_artiste_profile(
    updated_user: UserUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Mettre à jour le profil de l'artiste"""
    artiste = session.get(User, user.id)
    if not artiste:
        raise HTTPException(status_code=404, detail="Artiste non trouvé")
    
    # Mettre à jour uniquement les champs fournis
    update_data = updated_user.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(artiste, field):
            setattr(artiste, field, value)
    
    session.add(artiste)
    session.commit()
    session.refresh(artiste)
    
    return UserRead(
        id=artiste.id,
        username=artiste.username,
        email=artiste.email,
        full_name=artiste.full_name,
        role=artiste.role,
        is_active=artiste.is_active,
        artist_bio=artiste.artist_bio,
        artist_website=artiste.artist_website,
        created_at=artiste.created_at,
        updated_at=artiste.updated_at
    )

@artiste_router.get("/musiques", response_model=List[MusicRead])
def get_all_musiques(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Obtenir toutes les musiques de l'artiste"""
    statement = select(Music).where(Music.artist_id == user.id)
    musiques = session.exec(statement).all()
    
    return [MusicRead(
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
        updated_at=music.updated_at
    ) for music in musiques]

@artiste_router.post("/musiques", response_model=MusicRead)
async def create_musique(
    title: str = Form(...),
    description: str = Form(""),
    genre: str = Form(""),
    is_free: bool = Form(True),
    price: float = Form(0.0),
    audio_file: UploadFile = File(...),
    cover_image: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Créer une nouvelle musique avec upload de fichier"""
    
    # Valider le fichier audio
    if not validate_audio_file(audio_file.filename, audio_file.content_type):
        raise HTTPException(
            status_code=400,
            detail="Format de fichier audio non valide. Formats acceptés: mp3, wav, flac, m4a, ogg"
        )
    
    # Sauvegarder le fichier audio
    audio_filename = generate_unique_filename(audio_file.filename)
    audio_path = os.path.join(MUSIC_DIR, audio_filename)
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Sauvegarder l'image de couverture si fournie
    cover_path = None
    if cover_image and cover_image.filename:
        if not validate_image_file(cover_image.filename, cover_image.content_type):
            os.remove(audio_path)  # Supprimer le fichier audio en cas d'erreur
            raise HTTPException(
                status_code=400,
                detail="Format d'image non valide. Formats acceptés: jpg, jpeg, png, webp"
            )
        
        cover_filename = generate_unique_filename(cover_image.filename)
        cover_path = os.path.join(COVERS_DIR, cover_filename)
        
        with open(cover_path, "wb") as buffer:
            shutil.copyfileobj(cover_image.file, buffer)
    
    # Créer l'entrée en base de données
    new_music = Music(
        title=title,
        description=description,
        genre=genre,
        is_free=is_free,
        price=Decimal(str(price)) if not is_free else Decimal('0.00'),
        file_path=audio_path,
        cover_image_path=cover_path,
        artist_id=user.id,
        status=MusicStatus.DRAFT
    )
    
    session.add(new_music)
    session.commit()
    session.refresh(new_music)
    
    return MusicRead(
        id=new_music.id,
        title=new_music.title,
        description=new_music.description,
        genre=new_music.genre,
        duration=new_music.duration,
        file_path=new_music.file_path,
        cover_image_path=new_music.cover_image_path,
        is_free=new_music.is_free,
        price=new_music.price,
        status=new_music.status,
        play_count=new_music.play_count,
        download_count=new_music.download_count,
        artist_id=new_music.artist_id,
        created_at=new_music.created_at,
        updated_at=new_music.updated_at
    )

@artiste_router.get("/musiques/{music_id}", response_model=MusicRead)
def get_musique(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Obtenir une musique spécifique de l'artiste"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.artist_id == user.id)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
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
        updated_at=music.updated_at
    )

@artiste_router.put("/musiques/{music_id}", response_model=MusicRead)
def update_musique(
    music_id: int,
    music_update: MusicUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Mettre à jour une musique de l'artiste"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.artist_id == user.id)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Mettre à jour uniquement les champs fournis
    update_data = music_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(music, field):
            setattr(music, field, value)
    
    session.add(music)
    session.commit()
    session.refresh(music)
    
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
        updated_at=music.updated_at
    )

@artiste_router.delete("/musiques/{music_id}")
def delete_musique(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Supprimer une musique de l'artiste"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.artist_id == user.id)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    # Supprimer les fichiers physiques
    if os.path.exists(music.file_path):
        os.remove(music.file_path)
    
    if music.cover_image_path and os.path.exists(music.cover_image_path):
        os.remove(music.cover_image_path)
    
    # Supprimer de la base de données
    session.delete(music)
    session.commit()
    
    return {"message": "Musique supprimée avec succès"}

@artiste_router.post("/musiques/{music_id}/generate-code", response_model=PaymentCodeRead)
def generate_payment_code_for_music(
    music_id: int,
    expiry_hours: int = 24,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Générer un code de paiement pour une musique payante"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.artist_id == user.id)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    if music.is_free:
        raise HTTPException(
            status_code=400,
            detail="Impossible de générer un code de paiement pour une musique gratuite"
        )
    
    # Générer le code unique
    code = generate_unique_payment_code(session)
    expires_at = create_payment_code_expires_at(expiry_hours)
    
    # Créer le code de paiement
    payment_code = PaymentCode(
        code=code,
        music_id=music_id,
        price=music.price,
        expires_at=expires_at
    )
    
    session.add(payment_code)
    session.commit()
    session.refresh(payment_code)
    
    return PaymentCodeRead(
        id=payment_code.id,
        code=payment_code.code,
        music_id=payment_code.music_id,
        price=payment_code.price,
        is_used=payment_code.is_used,
        expires_at=payment_code.expires_at,
        created_at=payment_code.created_at,
        used_at=payment_code.used_at,
        used_by_client_id=payment_code.used_by_client_id
    )

@artiste_router.get("/codes-paiement", response_model=List[PaymentCodeRead])
def get_payment_codes(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Obtenir tous les codes de paiement générés par l'artiste"""
    statement = select(PaymentCode).join(Music).where(Music.artist_id == user.id)
    codes = session.exec(statement).all()
    
    return [PaymentCodeRead(
        id=code.id,
        code=code.code,
        music_id=code.music_id,
        price=code.price,
        is_used=code.is_used,
        expires_at=code.expires_at,
        created_at=code.created_at,
        used_at=code.used_at,
        used_by_client_id=code.used_by_client_id
    ) for code in codes]

@artiste_router.get("/statistiques", response_model=ArtisteStats)
def get_artist_statistics(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Obtenir les statistiques de l'artiste"""
    return calculate_artist_stats(session, user.id)

@artiste_router.post("/musiques/{music_id}/publier")
def publish_music(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Publier une musique (changer son statut à PUBLISHED)"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.artist_id == user.id)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    music.status = MusicStatus.PUBLISHED
    session.add(music)
    session.commit()
    
    return {"message": "Musique publiée avec succès"}

@artiste_router.post("/musiques/{music_id}/archiver")
def archive_music(
    music_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_artist)
):
    """Archiver une musique (changer son statut à ARCHIVED)"""
    statement = select(Music).where(
        and_(Music.id == music_id, Music.artist_id == user.id)
    )
    music = session.exec(statement).first()
    
    if not music:
        raise HTTPException(status_code=404, detail="Musique non trouvée")
    
    music.status = MusicStatus.ARCHIVED
    session.add(music)
    session.commit()
    
    return {"message": "Musique archivée avec succès"}