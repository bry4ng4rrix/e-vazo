from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlmodel import Session, select, SQLModel, Field
from passlib.context import CryptContext
from typing import Optional
from database import get_session
from models import User, UserRole

router = APIRouter()

SECRET_KEY = "bryangarrix"  # Change to a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ===== MODÈLES POUR L'AUTH =====

class UserCreate(SQLModel):
    name: str
    email: str
    password: str
    role: UserRole = UserRole.CLIENT  # Par défaut client
    full_name: Optional[str] = None
    artist_bio: Optional[str] = None
    artist_website: Optional[str] = None

class UserRead(SQLModel):
    id: int
    name: str
    email: str
    role: UserRole
    full_name: Optional[str] = None
    artist_bio: Optional[str] = None
    artist_website: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class TokenBlacklist(SQLModel, table=True):
    __tablename__ = "token_blacklist"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(unique=True, index=True)
    blacklisted_at: datetime = Field(default_factory=datetime.utcnow)

# ===== FONCTIONS UTILITAIRES =====

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_by_email(email: str, session: Session):
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()

def authenticate_user(email: str, password: str, session: Session):
    user = get_user_by_email(email, session)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "sub": str(data["user_id"])})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def is_token_blacklisted(token: str, session: Session) -> bool:
    """Vérifier si un token est dans la blacklist"""
    statement = select(TokenBlacklist).where(TokenBlacklist.token == token)
    blacklisted = session.exec(statement).first()
    return blacklisted is not None

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    """Récupérer l'utilisateur actuel avec vérification de blacklist"""
    try:
        # Vérifier si le token est blacklisté
        if is_token_blacklisted(token, session):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token has been revoked"
            )
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token"
        )
    
    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="User not found"
        )
    return user

async def get_user_from_token(token: str, session: Session) -> User:

    try:
        # Vérifier si le token est blacklisté
        if is_token_blacklisted(token, session):
            return None
        
        # Décoder le token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
        
        # Récupérer l'utilisateur
        user = session.get(User, int(user_id))
        return user
        
    except JWTError:
        return None

# ===== DÉPENDANCES POUR LES RÔLES =====

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Vérifier que l'utilisateur est actif"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Vérifier que l'utilisateur est admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_current_artist(current_user: User = Depends(get_current_active_user)) -> User:
    """Vérifier que l'utilisateur est artiste"""
    if current_user.role != UserRole.ARTISTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artists can access this resource"
        )
    return current_user

async def get_current_client(current_user: User = Depends(get_current_active_user)) -> User:
    """Vérifier que l'utilisateur est client"""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can access this resource"
        )
    return current_user

async def get_artist_or_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Vérifier que l'utilisateur est artiste ou admin"""
    if current_user.role not in [UserRole.ARTISTE, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only artists and admins can access this resource"
        )
    return current_user

# ===== ROUTES D'AUTHENTIFICATION =====

@router.post("/register", response_model=UserRead)
async def register_user(user: UserCreate, session: Session = Depends(get_session)):
    """Inscription d'un nouvel utilisateur"""
    # Vérifier si l'email existe déjà
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Vérifier si le nom d'utilisateur existe (utiliser name comme username)
    statement = select(User).where(User.username == user.name)
    existing_username = session.exec(statement).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Créer l'utilisateur
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.name,  # Mapper name -> username
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        full_name=user.full_name,
        artist_bio=user.artist_bio if user.role == UserRole.ARTISTE else None,
        artist_website=user.artist_website if user.role == UserRole.ARTISTE else None
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Retourner avec le format attendu
    return UserRead(
        id=db_user.id,
        name=db_user.username,  # Mapper username -> name
        email=db_user.email,
        role=db_user.role,
        full_name=db_user.full_name,
        artist_bio=db_user.artist_bio,
        artist_website=db_user.artist_website,
        is_active=db_user.is_active,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

@router.post("/login")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: Session = Depends(get_session)
):
  
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(
        data={"user_id": user.id}, 
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_user)):
    """Obtenir les informations de l'utilisateur connecté"""
    return UserRead(
        id=current_user.id,
        name=current_user.username,  # Mapper username -> name
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name,
        artist_bio=current_user.artist_bio,
        artist_website=current_user.artist_website,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/me", response_model=UserRead)
async def update_current_user(
    current_user: User = Depends(get_current_user), 
    user_update: UserCreate = Depends(), 
    session: Session = Depends(get_session)
):  
    user_update_dict = user_update.dict(exclude_unset=True)
    for key, value in user_update_dict.items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return UserRead(
        id=current_user.id,
        name=current_user.username,  # Mapper username -> name
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name,
        artist_bio=current_user.artist_bio,
        artist_website=current_user.artist_website,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    
    try:
        # Vérifier que le token est valide avant de le blacklister
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Ajouter le token à la blacklist
        blacklisted_token = TokenBlacklist(
            token=token,
            blacklisted_at=datetime.utcnow()
        )
        session.add(blacklisted_token)
        session.commit()
        
        return {"message": "Successfully logged out"}
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token"
        )

@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Rafraîchir le token d'accès"""
    access_token = create_access_token(
        data={"user_id": current_user.id}, 
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}


