from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from database import create_db_and_tables, get_session
from routers.musique import musique_router
from routers.artiste import artiste_router
from routers.admin import admin_router
from routers.auth import router as auth_router
from routers.client import client_router
from sqlmodel import Session, select, func
from models import User, Music, Purchase , EndpointInfo, HealthStatus, StorageInfo, SystemInfo
import psutil
import os
import shutil
from datetime import datetime
from typing import Dict, List, Any , Optional
import platform
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="E-Vazo API", 
    version="1.0.0", 
    description="API pour la plateforme de musique E-Vazo"
)

# Configuration CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permettre toutes les origines (à restreindre en production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers
app.include_router(auth_router, prefix="/api", tags=["Authentification"])
app.include_router(artiste_router, prefix="/api/artiste", tags=["Artiste"])
app.include_router(client_router, prefix="/api/client", tags=["Client"])
app.include_router(admin_router, prefix="/api/admin", tags=["Administration"])






# ===== FONCTIONS UTILITAIRES =====

def get_directory_size(path: str) -> Dict[str, Any]:
    """Calculer la taille d'un dossier"""
    if not os.path.exists(path):
        return {
            "exists": False,
            "size_bytes": 0,
            "size_mb": 0,
            "file_count": 0
        }
    
    total_size = 0
    file_count = 0
    
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                if os.path.exists(filepath):
                    total_size += os.path.getsize(filepath)
                    file_count += 1
    except PermissionError:
        pass
    
    return {
        "exists": True,
        "size_bytes": total_size,
        "size_mb": round(total_size / (1024 * 1024), 2),
        "file_count": file_count
    }

def get_database_status(session: Session) -> str:
    """Vérifier le statut de la base de données"""
    try:
        # Test simple de connexion
        session.exec(select(func.count(User.id))).one()
        return "connected"
    except Exception as e:
        return f"error: {str(e)}"

def get_system_storage_info() -> Dict[str, Any]:
    """Obtenir les informations de stockage système"""
    try:
        disk_usage = shutil.disk_usage("/")
        return {
            "total_gb": round(disk_usage.total / (1024**3), 2),
            "used_gb": round(disk_usage.used / (1024**3), 2),
            "free_gb": round(disk_usage.free / (1024**3), 2),
            "usage_percent": round((disk_usage.used / disk_usage.total) * 100, 2)
        }
    except Exception as e:
        return {
            "error": str(e),
            "total_gb": 0,
            "used_gb": 0,
            "free_gb": 0,
            "usage_percent": 0
        }

# ===== ROUTES UTILITAIRES =====

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "Bienvenue sur E-Vazo API",
        "Codeur" : "Milson Fanoela Bryan",
        "Pseudo Code" : "Garrix",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/health",
        "endpoints_list": "/endpoints",
        "storage_info": "/storage"
    }

@app.get("/endpoints", response_model=List[EndpointInfo])
async def get_all_endpoints():
    """Lister tous les endpoints disponibles dans l'API"""
    endpoints = []
    
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            # Filtrer les méthodes HTTP valides
            methods = [method for method in route.methods if method != 'HEAD']
            
            # Obtenir les informations de l'endpoint
            endpoint_info = EndpointInfo(
                path=route.path,
                methods=methods,
                name=route.name or "unknown",
                summary=getattr(route, 'summary', None),
                tags=getattr(route, 'tags', [])
            )
            
            endpoints.append(endpoint_info)
    
    # Trier par chemin
    endpoints.sort(key=lambda x: x.path)
    
    return endpoints

@app.get("/health", response_model=HealthStatus)
async def health_check(session: Session = Depends(get_session)):
    """Vérification de l'état de santé de l'API"""
    
    # Calculer l'uptime (approximatif)
    uptime = psutil.boot_time()
    current_time = datetime.now().timestamp()
    uptime_seconds = current_time - uptime
    
    # Vérifier le statut de la base de données
    db_status = get_database_status(session)
    
    # Déterminer le statut global
    overall_status = "healthy" if db_status == "connected" else "unhealthy"
    
    return HealthStatus(
        status=overall_status,
        timestamp=datetime.now(),
        version="1.0.0",
        database_status=db_status,
        uptime_seconds=round(uptime_seconds, 2)
    )

@app.get("/storage", response_model=StorageInfo)
async def get_storage_info():
    """Obtenir les informations de stockage"""
    
    # Informations des dossiers d'upload
    uploads_info = {
        "music_folder": get_directory_size("uploads/music"),
        "covers_folder": get_directory_size("uploads/covers"),
        "total_uploads": {}
    }
    
    # Calculer le total des uploads
    total_size = uploads_info["music_folder"]["size_bytes"] + uploads_info["covers_folder"]["size_bytes"]
    total_files = uploads_info["music_folder"]["file_count"] + uploads_info["covers_folder"]["file_count"]
    
    uploads_info["total_uploads"] = {
        "size_bytes": total_size,
        "size_mb": round(total_size / (1024 * 1024), 2),
        "file_count": total_files
    }
    
    # Informations du système
    system_storage = get_system_storage_info()
    
    # Informations de la base de données
    db_info = get_directory_size(".")  # Approximation pour SQLite
    database_size = {
        "database_file": get_directory_size("music_platform.db") if os.path.exists("music_platform.db") else {"exists": False, "size_bytes": 0, "size_mb": 0},
        "logs_folder": get_directory_size("logs")
    }
    
    return StorageInfo(
        uploads_folder=uploads_info,
        system_storage=system_storage,
        database_size=database_size
    )

@app.get("/system-info", response_model=SystemInfo)
async def get_system_info():
    """Obtenir les informations système"""
    
    # Informations système
    memory = psutil.virtual_memory()
    
    return SystemInfo(
        platform=f"{platform.system()} {platform.release()}",
        python_version=platform.python_version(),
        cpu_count=psutil.cpu_count(),
        memory_total_gb=round(memory.total / (1024**3), 2),
        memory_available_gb=round(memory.available / (1024**3), 2),
        cpu_usage_percent=round(psutil.cpu_percent(interval=1), 2)
    )

@app.get("/stats", response_model=Dict[str, Any])
async def get_quick_stats(session: Session = Depends(get_session)):
    """Statistiques rapides de la plateforme"""
    try:
        # Compter les utilisateurs
        total_users = session.exec(select(func.count(User.id))).one() or 0
        active_users = session.exec(select(func.count(User.id)).where(User.is_active == True)).one() or 0
        
        # Compter les musiques
        total_musics = session.exec(select(func.count(Music.id))).one() or 0
        
        # Compter les achats
        total_purchases = session.exec(select(func.count(Purchase.id))).one() or 0
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "inactive": total_users - active_users
            },
            "content": {
                "total_musics": total_musics
            },
            "commerce": {
                "total_purchases": total_purchases
            },
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul des statistiques: {str(e)}")

@app.get("/version")
async def get_version():
    """Obtenir la version de l'API"""
    return {
        "api_version": "1.0.0",
        "name": "E-Vazo API",
        "description": "API pour la plateforme de musique E-Vazo",
        "python_version": platform.python_version(),
        "build_date": "2024-01-01",  # À adapter selon votre processus de build
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# ===== GESTION DES ERREURS =====

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint non trouvé",
            "message": f"L'endpoint {request.url.path} n'existe pas",
            "available_endpoints": "/endpoints",
            "documentation": "/docs"
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erreur interne du serveur",
            "message": "Une erreur inattendue s'est produite",
            "health_check": "/health",
            "contact_admin": True
        }
    )

# ===== ÉVÉNEMENTS DE DÉMARRAGE =====

@app.on_event("startup")
def on_startup():
    """Initialisation au démarrage"""
    print("🚀 Démarrage de E-Vazo API...")
    
    # Créer les tables de base de données
    create_db_and_tables()
    print("✅ Base de données initialisée")
    
    # Créer les dossiers nécessaires
    os.makedirs("uploads/music", exist_ok=True)
    os.makedirs("uploads/covers", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    print("✅ Dossiers créés")
    
    print("🎵 E-Vazo API prête!")
    print("📚 Documentation disponible sur: http://localhost:8000/docs")
    print("🏥 Health check: http://localhost:8000/health")
    print("📋 Endpoints: http://localhost:8000/endpoints")

@app.on_event("shutdown")
def on_shutdown():
    """Nettoyage à l'arrêt"""
    print("🛑 Arrêt de E-Vazo API...")
    print("👋 Au revoir!")

# ===== DÉMARRAGE DE L'APPLICATION =====

if __name__ == "__main__":
    import uvicorn
    
    print("🎵 Lancement de E-Vazo API...")
    print("🌐 Serveur: http://localhost:8000")
    print("📖 Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )