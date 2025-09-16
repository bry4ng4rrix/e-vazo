from fastapi import FastAPI 
from database import create_db_and_tables , get_session


from routers.musique import musique_router
from routers.artiste import artiste_router
from routers.user import admin_router
from routers.auth import router as auth_router
from routers.client import client_router






app = FastAPI()

app.include_router(auth_router, prefix="/api", tags=["Authentification"])
app.include_router(artiste_router, prefix="/api/artiste", tags=["Artiste"])
app.include_router(client_router, prefix="/api/client", tags=["Client"])
app.include_router(admin_router, prefix="/api/admin", tags=["Utilisateurs"])


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000 ,reload=True)