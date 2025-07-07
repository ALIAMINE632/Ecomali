import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    image: '',
    description: '',
    categorie: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new product
  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          prix: parseFloat(formData.prix)
        })
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
        setFormData({
          nom: '',
          prix: '',
          image: '',
          description: '',
          categorie: ''
        });
        alert('Produit ajouté avec succès !');
        setCurrentView('products');
      } else {
        alert('Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
          alert('Produit supprimé avec succès !');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur réseau');
      }
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🛍️ Mon Magasin</h1>
        <div className="space-x-4">
          <button 
            className={`px-4 py-2 rounded ${currentView === 'home' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
            onClick={() => setCurrentView('home')}
          >
            Accueil
          </button>
          <button 
            className={`px-4 py-2 rounded ${currentView === 'products' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
            onClick={() => setCurrentView('products')}
          >
            Produits
          </button>
          <button 
            className={`px-4 py-2 rounded ${currentView === 'add' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
            onClick={() => setCurrentView('add')}
          >
            Ajouter Produit
          </button>
        </div>
      </div>
    </nav>
  );

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Bienvenue dans Mon Magasin</h1>
          <p className="text-xl mb-8">Découvrez notre collection de produits exceptionnels</p>
          <button 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            onClick={() => setCurrentView('products')}
          >
            Voir nos produits
          </button>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Produits en Vedette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={product.image} 
                alt={product.nom}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{product.nom}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{product.prix.toFixed(2)} €</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {product.categorie}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Products Page Component
  const ProductsPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tous nos Produits</h1>
          <span className="text-gray-600">{products.length} produit(s)</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des produits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={product.image} 
                  alt={product.nom}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.nom}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-blue-600">{product.prix.toFixed(2)} €</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {product.categorie}
                    </span>
                  </div>
                  <button 
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun produit disponible</p>
            <button 
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => setCurrentView('add')}
            >
              Ajouter le premier produit
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Add Product Page Component
  const AddProductPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Ajouter un Produit</h1>
          
          <form onSubmit={addProduct} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nom du produit</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Prix (€)</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">URL de l'image</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Catégorie</label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="Vêtements">Vêtements</option>
                <option value="Électronique">Électronique</option>
                <option value="Accessoires">Accessoires</option>
                <option value="Maison">Maison</option>
                <option value="Sport">Sport</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="App">
      <Navigation />
      
      {currentView === 'home' && <HomePage />}
      {currentView === 'products' && <ProductsPage />}
      {currentView === 'add' && <AddProductPage />}
    </div>
  );
};

export default App;