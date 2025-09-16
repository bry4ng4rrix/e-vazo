from fastapi import FastAPI 
from database import create_db_and_tables , get_session


from routers.musique import musique_router
from routers.user import user_router
from routers.auth import router as auth_router






app = FastAPI()

app.include_router(auth_router, prefix="/api", tags=["Authentification"])
app.include_router(user_router, prefix="/api/user", tags=["Utilisateurs"])
app.include_router(musique_router, prefix="/api/musique", tags=["Musique"])


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000 ,reload=True)