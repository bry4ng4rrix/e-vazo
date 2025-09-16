from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
import uuid

# ===== ENUMS =====

class UserRole(str, Enum):
    ADMIN = "admin"
    ARTISTE = "artiste" 
    CLIENT = "client"

class MusicStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

# ===== MODÈLES DE TABLES SQLModel =====

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool = Field(default=True)
    
    # Champs spécifiques aux artistes
    artist_bio: Optional[str] = None
    artist_website: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None, sa_column_kwargs={"onupdate": datetime.utcnow})
    
    # Relations
    musics: List["Music"] = Relationship(back_populates="artist")
    purchases: List["Purchase"] = Relationship(back_populates="client")
    favorites: List["Favorite"] = Relationship(back_populates="user")
    play_history: List["PlayHistory"] = Relationship(back_populates="user")
    used_payment_codes: List["PaymentCode"] = Relationship(back_populates="used_by")

class UserReade(SQLModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool

class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None
    hashed_password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    artist_bio: Optional[str] = None
    artist_website: Optional[str] = None




class Music(SQLModel, table=True):
    __tablename__ = "musics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    duration: Optional[int] = None  # Durée en secondes
    
    # Fichiers
    file_path: str
    cover_image_path: Optional[str] = None
    
    # Paramètres de vente
    is_free: bool = Field(default=True)
    price: Decimal = Field(default=Decimal('0.00'))
    
    # Statut et compteurs
    status: MusicStatus = Field(default=MusicStatus.DRAFT)
    play_count: int = Field(default=0)
    download_count: int = Field(default=0)
    
    # Relation artiste
    artist_id: int = Field(foreign_key="users.id")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None, sa_column_kwargs={"onupdate": datetime.utcnow})
    
    # Relations
    artist: Optional[User] = Relationship(back_populates="musics")
    purchases: List["Purchase"] = Relationship(back_populates="music")
    favorites: List["Favorite"] = Relationship(back_populates="music")
    payment_codes: List["PaymentCode"] = Relationship(back_populates="music")
    play_history: List["PlayHistory"] = Relationship(back_populates="music")

class PaymentCode(SQLModel, table=True):
    __tablename__ = "payment_codes"
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True, index=True)
    music_id: int = Field(foreign_key="musics.id")
    # Paramètres du code
    price: Decimal
    is_used: bool = Field(default=False)
    expires_at: datetime
    # Métadonnées d'utilisation
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_at: Optional[datetime] = None
    used_by_client_id: Optional[int] = Field(default=None, foreign_key="users.id")
    # Relations
    music: Optional[Music] = Relationship(back_populates="payment_codes")
    used_by: Optional[User] = Relationship(back_populates="used_payment_codes")
    purchases: List["Purchase"] = Relationship(back_populates="payment_code")




class Purchase(SQLModel, table=True):
    __tablename__ = "purchases"
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: int = Field(foreign_key="users.id")
    music_id: int = Field(foreign_key="musics.id")
    payment_code_id: Optional[int] = Field(default=None, foreign_key="payment_codes.id")
    # Détails de l'achat
    amount_paid: Decimal
    status: PaymentStatus = Field(default=PaymentStatus.COMPLETED)
    # Gestion des téléchargements
    download_count: int = Field(default=0)
    max_downloads: int = Field(default=5)
    # Timestamp
    purchased_at: datetime = Field(default_factory=datetime.utcnow)
    # Relations
    client: Optional[User] = Relationship(back_populates="purchases")
    music: Optional[Music] = Relationship(back_populates="purchases")
    payment_code: Optional[PaymentCode] = Relationship(back_populates="purchases")
    download_logs: List["DownloadLog"] = Relationship(back_populates="purchase")

    

class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    music_id: int = Field(foreign_key="musics.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relations
    user: Optional[User] = Relationship(back_populates="favorites")
    music: Optional[Music] = Relationship(back_populates="favorites")

class PlayHistory(SQLModel, table=True):
    __tablename__ = "play_history"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    music_id: int = Field(foreign_key="musics.id")
    played_at: datetime = Field(default_factory=datetime.utcnow)
    duration_played: int = Field(default=0)  # Durée écoutée en secondes
    
    # Relations
    user: Optional[User] = Relationship(back_populates="play_history")
    music: Optional[Music] = Relationship(back_populates="play_history")

class DownloadLog(SQLModel, table=True):
    __tablename__ = "download_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    purchase_id: int = Field(foreign_key="purchases.id")
    downloaded_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Relations
    purchase: Optional[Purchase] = Relationship(back_populates="download_logs")



class MusicRead(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    duration: Optional[int] = None
    cover_image_path: Optional[str] = None
    is_free: bool
    price: Decimal
    status: MusicStatus
    play_count: int
    download_count: int
    artist_id: int
    created_at: datetime
    # Relations
    artist: Optional[UserReade] = None

class PurchaseCreate(SQLModel):
    music_id: int
    payment_code: str

class PurchaseRead(SQLModel):
    id: int
    client_id: int
    music_id: int
    payment_code_id: Optional[int] = None
    amount_paid: Decimal
    status: PaymentStatus
    download_count: int
    max_downloads: int
    purchased_at: datetime
    # Relations
    music: Optional[MusicRead] = None

class FavoriteCreate(SQLModel):
    music_id: int

class FavoriteRead(SQLModel):
    id: int
    user_id: int
    music_id: int
    created_at: datetime
    # Relations
    music: Optional[MusicRead] = None

class PlayHistoryCreate(SQLModel):
    music_id: int
    duration_played: int = 0

class PlayHistoryRead(SQLModel):
    id: int
    user_id: int
    music_id: int
    played_at: datetime
    duration_played: int
    # Relations
    music: Optional[MusicRead] = None

class ClientStats(SQLModel):
    total_purchases: int
    total_spent: Decimal
    total_favorites: int
    total_play_time: int  # en secondes
    favorite_genre: Optional[str] = None
    total_downloads: int


# ===== FONCTIONS UTILITAIRES =====

def generate_payment_code() -> str:
   
    return str(uuid.uuid4()).replace('-', '')[:12].upper()

def create_payment_code_expires_at(hours: int = 24) -> datetime:
   
    return datetime.utcnow() + timedelta(hours=hours)