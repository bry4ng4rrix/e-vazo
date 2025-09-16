# 🎵 E-Vazo API

**API pour plateforme de musique collaborative avec FastAPI et SQLModel**

Une plateforme musicale moderne permettant aux artistes de partager leur musique (gratuite ou payante) et aux clients d'acheter, écouter et télécharger des morceaux via un système de codes de paiement locaux.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com)
[![SQLModel](https://img.shields.io/badge/SQLModel-0.0.14-blue.svg)](https://sqlmodel.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab.svg?style=flat&logo=python)](https://www.python.org)

## ✨ Fonctionnalités

- 🎨 **Multi-rôles** : Admin, Artiste, Client avec permissions spécifiques
- 🎵 **Gestion de musiques** : Upload, streaming, téléchargement avec limitations
- 💳 **Système de paiement local** : Codes de paiement avec expiration automatique
- ⭐ **Interactions sociales** : Favoris, historique d'écoute, statistiques
- 🛡️ **Sécurité** : JWT, authentification par rôle, validation des fichiers
- 📊 **Monitoring** : Health check, statistiques, informations système
- 🚀 **Production-ready** : Gestion d'erreurs, logging, configuration flexible

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.10+
- pip ou Poetry

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/e-vazo-api.git
cd e-vazo-api

# Installer les dépendances
pip install -r requirements.txt

# Configuration
cp .env.example .env
# Modifier les variables dans .env

# Initialiser la base de données
python scripts/init_db.py

# Lancer l'application
uvicorn main:app --reload
```

### Premier démarrage

L'application sera accessible sur **http://localhost:8000**


## 📚 Documentation

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc
- **Endpoints** : http://localhost:8000/endpoints
- **Health Check** : http://localhost:8000/health

## 🎯 Architecture

```
E-Vazo API/
├── 🏠 Accueil & Utilitaires     # Health, storage, endpoints
├── 🔐 Authentification         # Login, register, JWT
├── 🎨 Espace Artiste           # Upload, gestion musiques, codes paiement
├── 👤 Espace Client            # Navigation, achat, favoris, streaming
└── ⚙️ Administration          # Gestion utilisateurs, modération, stats
```

## 📋 API Endpoints

### 🏠 **Endpoints Utilitaires**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Page d'accueil | ❌ |
| `GET` | `/endpoints` | Liste tous les endpoints | ❌ |
| `GET` | `/health` | État de santé de l'API | ❌ |
| `GET` | `/storage` | Informations stockage | ❌ |
| `GET` | `/system-info` | Informations système | ❌ |
| `GET` | `/stats` | Statistiques rapides | ❌ |
| `GET` | `/version` | Version de l'API | ❌ |

### 🔐 **Authentification**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/register` | Inscription utilisateur | ❌ |
| `POST` | `/api/token` | Connexion (login) | ❌ |
| `GET` | `/api/me` | Profil utilisateur connecté | 🔒 |
| `PUT` | `/api/me` | Modifier son profil | 🔒 |
| `POST` | `/api/logout` | Déconnexion | 🔒 |
| `POST` | `/api/refresh` | Rafraîchir token | 🔒 |

### 🎨 **Espace Artiste** `(Rôle: ARTISTE)`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/artiste/me` | Profil de l'artiste | 🎨 |
| `PUT` | `/api/artiste/me` | Modifier profil artiste | 🎨 |
| `GET` | `/api/artiste/musiques` | Mes musiques | 🎨 |
| `POST` | `/api/artiste/musiques` | Upload nouvelle musique | 🎨 |
| `GET` | `/api/artiste/musiques/{music_id}` | Détails d'une musique | 🎨 |
| `PUT` | `/api/artiste/musiques/{music_id}` | Modifier musique | 🎨 |
| `DELETE` | `/api/artiste/musiques/{music_id}` | Supprimer musique | 🎨 |
| `POST` | `/api/artiste/musiques/{music_id}/publier` | Publier musique | 🎨 |
| `POST` | `/api/artiste/musiques/{music_id}/archiver` | Archiver musique | 🎨 |
| `POST` | `/api/artiste/musiques/{music_id}/generate-code` | Générer code paiement | 🎨 |
| `GET` | `/api/artiste/codes-paiement` | Mes codes de paiement | 🎨 |
| `GET` | `/api/artiste/statistiques` | Statistiques artiste | 🎨 |

### 👤 **Espace Client** `(Rôle: CLIENT)`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/client/me` | Profil du client | 👤 |
| `PUT` | `/api/client/me` | Modifier profil client | 👤 |
| `GET` | `/api/client/musiques` | Parcourir les musiques | 👤 |
| `GET` | `/api/client/musiques/{music_id}` | Détails d'une musique | 👤 |
| `POST` | `/api/client/purchase` | Acheter une musique | 👤 |
| `GET` | `/api/client/purchases` | Mes achats | 👤 |
| `POST` | `/api/client/favorites` | Ajouter aux favoris | 👤 |
| `GET` | `/api/client/favorites` | Mes favoris | 👤 |
| `DELETE` | `/api/client/favorites/{favorite_id}` | Supprimer des favoris | 👤 |
| `GET` | `/api/client/stream/{music_id}` | Écouter en streaming | 👤 |
| `GET` | `/api/client/download/{music_id}` | Télécharger musique | 👤 |
| `GET` | `/api/client/play-history` | Historique d'écoute | 👤 |
| `POST` | `/api/client/play-history` | Enregistrer écoute | 👤 |
| `GET` | `/api/client/statistics` | Statistiques client | 👤 |

### ⚙️ **Administration** `(Rôle: ADMIN)`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/users` | Tous les utilisateurs | 👑 |
| `GET` | `/api/admin/users/artists` | Tous les artistes | 👑 |
| `GET` | `/api/admin/users/clients` | Tous les clients | 👑 |
| `GET` | `/api/admin/users/{user_id}` | Détails utilisateur | 👑 |
| `PUT` | `/api/admin/users/{user_id}` | Modifier utilisateur | 👑 |
| `DELETE` | `/api/admin/users/{user_id}` | Supprimer utilisateur | 👑 |
| `POST` | `/api/admin/users/{user_id}/activate` | Activer utilisateur | 👑 |
| `POST` | `/api/admin/users/{user_id}/deactivate` | Désactiver utilisateur | 👑 |
| `GET` | `/api/admin/musics` | Toutes les musiques | 👑 |
| `GET` | `/api/admin/musics/{music_id}` | Détails musique | 👑 |
| `PUT` | `/api/admin/musics/{music_id}/status` | Modifier statut musique | 👑 |
| `DELETE` | `/api/admin/musics/{music_id}` | Supprimer musique | 👑 |
| `GET` | `/api/admin/statistics` | Stats globales | 👑 |
| `GET` | `/api/admin/statistics/users` | Stats utilisateurs | 👑 |
| `GET` | `/api/admin/statistics/musics` | Stats musiques | 👑 |
| `GET` | `/api/admin/payment-codes` | Codes de paiement | 👑 |
| `GET` | `/api/admin/recent-activity` | Activité récente | 👑 |

**Légende Auth :**
- ❌ Public (pas d'authentification)
- 🔒 Utilisateur connecté
- 🎨 Artiste uniquement
- 👤 Client uniquement  
- 👑 Admin uniquement

## 🔧 Configuration

### Variables d'environnement `.env`

```env
# Base de données
DATABASE_URL=sqlite:///./music_platform.db

# Sécurité
SECRET_KEY=your_super_secret_key_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
ENVIRONMENT=development

# Upload
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_AUDIO_EXTENSIONS=.mp3,.wav,.flac,.m4a,.ogg
ALLOWED_IMAGE_EXTENSIONS=.jpg,.jpeg,.png,.webp

# Codes de paiement
DEFAULT_CODE_EXPIRY_HOURS=24
MAX_DOWNLOADS_PER_PURCHASE=5
```

## 🎵 Utilisation

### 1. **En tant qu'Artiste**

```bash
# 1. S'inscrire comme artiste
curl -X POST "http://localhost:8000/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MonArtiste",
    "email": "artiste@example.com", 
    "password": "password123",
    "role": "artiste",
    "artist_bio": "Musicien passionné"
  }'

# 2. Se connecter
curl -X POST "http://localhost:8000/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=artiste@example.com&password=password123"

# 3. Upload une musique (avec token)
curl -X POST "http://localhost:8000/api/artiste/musiques" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Ma Nouvelle Chanson" \
  -F "genre=Pop" \
  -F "is_free=false" \
  -F "price=2.99" \
  -F "audio_file=@chanson.mp3"

# 4. Générer un code de paiement
curl -X POST "http://localhost:8000/api/artiste/musiques/1/generate-code" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. **En tant que Client**

```bash
# 1. Parcourir les musiques
curl -X GET "http://localhost:8000/api/client/musiques?genre=Pop&is_free=false" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Acheter avec un code
curl -X POST "http://localhost:8000/api/client/purchase" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "music_id": 1,
    "payment_code": "ABC123DEF456"
  }'

# 3. Télécharger
curl -X GET "http://localhost:8000/api/client/download/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o "musique.mp3"

# 4. Écouter en streaming
curl -X GET "http://localhost:8000/api/client/stream/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. **Monitoring & Health Check**

```bash
# État de santé
curl -X GET "http://localhost:8000/health"

# Statistiques rapides
curl -X GET "http://localhost:8000/stats"

# Informations de stockage
curl -X GET "http://localhost:8000/storage"

# Liste des endpoints
curl -X GET "http://localhost:8000/endpoints"
```

## 🗄️ Structure de la Base de Données

### Modèles Principaux

- **User** - Utilisateurs (admin/artiste/client)
- **Music** - Morceaux de musique avec fichiers
- **PaymentCode** - Codes de paiement avec expiration
- **Purchase** - Historique des achats
- **Favorite** - Système de favoris
- **PlayHistory** - Historique d'écoute
- **DownloadLog** - Logs de téléchargements

### Relations

```mermaid
erDiagram
    User ||--o{ Music : "crée"
    User ||--o{ Purchase : "achète"
    User ||--o{ Favorite : "aime"
    Music ||--o{ PaymentCode : "génère"
    Music ||--o{ Purchase : "vendu"
    PaymentCode ||--o| Purchase : "utilisé pour"
```

## 🔒 Sécurité

- **JWT Authentication** avec expiration
- **Validation des rôles** sur chaque endpoint
- **Validation des fichiers** (format, taille)
- **Blacklist des tokens** pour déconnexion sécurisée  
- **Limitation des téléchargements** par achat
- **Expiration automatique** des codes de paiement
- **Hashage des mots de passe** avec bcrypt

## 📊 Exemples de Réponses

### Health Check
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "version": "1.0.0",
  "database_status": "connected",
  "uptime_seconds": 3600.5
}
```

### Statistiques Client
```json
{
  "total_purchases": 15,
  "total_spent": 45.50,
  "total_favorites": 23,
  "total_play_time": 7200,
  "favorite_genre": "Rock",
  "total_downloads": 12
}
```

### Informations de Stockage
```json
{
  "uploads_folder": {
    "music_folder": {
      "size_mb": 150.5,
      "file_count": 45
    },
    "total_uploads": {
      "size_mb": 200.0,
      "file_count": 60
    }
  },
  "system_storage": {
    "total_gb": 500.0,
    "free_gb": 249.5,
    "usage_percent": 50.1
  }
}
```

## 🧪 Tests

```bash
# Installer les dépendances de test
pip install -r requirements-dev.txt

# Lancer les tests
pytest

# Tests avec couverture
pytest --cov=app tests/

# Tests spécifiques
pytest tests/test_auth.py -v
```

## 🐳 Docker

```bash
# Développement
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Build custom
docker build -t e-vazo-api .
docker run -p 8000:8000 e-vazo-api
```

## 🚀 Déploiement

### Prérequis Production
- PostgreSQL au lieu de SQLite
- Variables d'environnement sécurisées
- HTTPS avec certificats SSL
- Monitoring (logs, métriques)

### Configuration Production

```env
DATABASE_URL=postgresql://user:pass@host:5432/e_vazo
SECRET_KEY=super_secure_key_64_characters_minimum
DEBUG=False
ENVIRONMENT=production
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pousser (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Changelog

### v1.0.0 (2024-01-15)
- 🎉 Version initiale
- ✅ Authentification JWT multi-rôles
- ✅ Upload et gestion de musiques
- ✅ Système de codes de paiement
- ✅ Streaming et téléchargements
- ✅ Panel d'administration
- ✅ Monitoring et health checks

## 🔗 Liens Utiles

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [Swagger UI](http://localhost:8000/docs)
- [ReDoc](http://localhost:8000/redoc)

## 📞 Support

- 📧 Email: bryanmfb4@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/bry4ng4rrix/e-vazo-api/issues)
- 📖 Wiki: [Documentation Wiki](https://github.com/bry4ng4rrix/e-vazo-api/wiki)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <p>Développé avec ❤️ pour la communauté musicale</p>
  <p><strong>E-Vazo API v1.0.0</strong></p>
</div>