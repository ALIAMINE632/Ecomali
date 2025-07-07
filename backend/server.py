from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List, Optional
import os
import uuid
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.magasin
products_collection = db.produits

# Pydantic models
class Product(BaseModel):
    id: str
    nom: str
    prix: float
    image: str
    description: str
    categorie: str
    date_ajout: str

class ProductCreate(BaseModel):
    nom: str
    prix: float
    image: str
    description: str
    categorie: str

# Sample products data
sample_products = [
    {
        "id": str(uuid.uuid4()),
        "nom": "T-shirt Noir Premium",
        "prix": 29.99,
        "image": "https://images.unsplash.com/photo-1610502778270-c5c6f4c7d575",
        "description": "T-shirt noir de qualité premium, 100% coton. Coupe moderne et confortable.",
        "categorie": "Vêtements",
        "date_ajout": datetime.now().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "nom": "Appareil Photo Zenit",
        "prix": 299.99,
        "image": "https://images.unsplash.com/photo-1656452991253-7aad419e6cea",
        "description": "Appareil photo vintage Zenit, parfait pour les amateurs de photographie analogique.",
        "categorie": "Électronique",
        "date_ajout": datetime.now().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "nom": "Écouteurs Apple",
        "prix": 199.99,
        "image": "https://images.pexels.com/photos/14272792/pexels-photo-14272792.jpeg",
        "description": "Écouteurs Apple blancs avec qualité audio exceptionnelle et design élégant.",
        "categorie": "Électronique",
        "date_ajout": datetime.now().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "nom": "Casque Audio Noir",
        "prix": 89.99,
        "image": "https://images.unsplash.com/photo-1641563786213-185d68345426",
        "description": "Casque audio noir professionnel avec réduction de bruit et confort optimal.",
        "categorie": "Électronique",
        "date_ajout": datetime.now().isoformat()
    }
]

@app.on_event("startup")
async def startup_event():
    """Initialize database with sample products if empty"""
    if products_collection.count_documents({}) == 0:
        products_collection.insert_many(sample_products)
        print("Sample products initialized")

# API Routes
@app.get("/api/products", response_model=List[Product])
async def get_products():
    """Récupérer tous les produits"""
    try:
        products = list(products_collection.find({}, {"_id": 0}))
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

@app.post("/api/products", response_model=Product)
async def add_product(product: ProductCreate):
    """Ajouter un nouveau produit"""
    try:
        # Create product with unique ID and timestamp
        new_product = {
            "id": str(uuid.uuid4()),
            "nom": product.nom,
            "prix": product.prix,
            "image": product.image,
            "description": product.description,
            "categorie": product.categorie,
            "date_ajout": datetime.now().isoformat()
        }
        
        # Insert into database
        products_collection.insert_one(new_product)
        
        return Product(**new_product)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'ajout: {str(e)}")

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    """Supprimer un produit"""
    try:
        result = products_collection.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        return {"message": "Produit supprimé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Récupérer un produit spécifique"""
    try:
        product = products_collection.find_one({"id": product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        return Product(**product)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

@app.get("/api/categories")
async def get_categories():
    """Récupérer toutes les catégories"""
    try:
        categories = products_collection.distinct("categorie")
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

@app.get("/")
async def root():
    return {"message": "API E-commerce - Magasin"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)