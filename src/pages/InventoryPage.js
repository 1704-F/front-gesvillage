// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Package, 
  Folder, 
  ArrowLeftRight, 
  Plus,
  BarChart
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { axiosPrivate as api } from '../utils/axios';

import InventoryItemsTab from '../components/inventory/InventoryItemsTab';
import CategoriesTab from '../components/inventory/CategoriesTab';
import MovementsTab from '../components/inventory/MovementsTab';
import StatsTab from '../components/inventory/StatsTab';
import CategoryForm from '../components/inventory/CategoryForm';
import ItemForm from '../components/inventory/ItemForm';
import MovementForm from '../components/inventory/MovementForm';

const InventoryPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("items");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);

  // États pour les modaux
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, editing: null });
  const [itemModal, setItemModal] = useState({ isOpen: false, editing: null });
  const [movementModal, setMovementModal] = useState({ isOpen: false, type: 'in', itemId: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pour la liste des articles (à ajouter après setItems)
const totalPagesItems = Math.ceil(items.length / itemsPerPage);
const startIndexItems = (currentPage - 1) * itemsPerPage;
const endIndexItems = startIndexItems + itemsPerPage;
const currentItems = items.slice(startIndexItems, endIndexItems);

// Pour les catégories
const totalPagesCategories = Math.ceil(categories.length / itemsPerPage);
const startIndexCategories = (currentPage - 1) * itemsPerPage;
const endIndexCategories = startIndexCategories + itemsPerPage;
const currentCategories = categories.slice(startIndexCategories, endIndexCategories);

// Pour les mouvements si nécessaire
const totalPagesMovements = Math.ceil(movements.length / itemsPerPage);
const startIndexMovements = (currentPage - 1) * itemsPerPage;
const endIndexMovements = startIndexMovements + itemsPerPage;
const currentMovements = movements.slice(startIndexMovements, endIndexMovements);

  // Chargement initial des données
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/inventory/dashboard');
        const { categories, items, movements, stats, employees } = response.data;
        
        setCategories(categories);
        setItems(items);
        setMovements(movements);
        setStats(stats);
        setEmployees(employees);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données du dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/inventory/categories');
      setCategories(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les catégories",
        variant: "destructive",
      });
    }
  };

  // Récupération des articles
  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/items');
      setItems(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les articles",
        variant: "destructive",
      });
    }
  };

  // Récupération des mouvements
  const fetchMovements = async () => {
    try {
      const response = await api.get('/inventory/movements');
      setMovements(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les mouvements",
        variant: "destructive",
      });
    }
  };

  // Récupération des employés
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Erreur:", error);
      setEmployees([]);
    }
  };

  // Récupération des statistiques
  const fetchStats = async () => {
    try {
      const response = await api.get('/inventory/stats');
      setStats(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les statistiques",
        variant: "destructive",
      });
    }
  };

  // Gestion des catégories
  const handleCategorySubmit = async (data) => {
    try {
      if (categoryModal.editing) {
        await api.put(`/inventory/categories/${categoryModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Catégorie modifiée avec succès"
        });
      } else {
        await api.post('/inventory/categories', data);
        toast({
          title: "Succès",
          description: "Catégorie ajoutée avec succès"
        });
      }
      setCategoryModal({ isOpen: false, editing: null });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }
    try {
      await api.delete(`/inventory/categories/${id}`);
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès"
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    }
  };

  // Gestion des articles
  const handleItemSubmit = async (data) => {
    try {
      if (itemModal.editing) {
        await api.put(`/inventory/items/${itemModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Article modifié avec succès"
        });
      } else {
        await api.post('/inventory/items', data);
        toast({
          title: "Succès",
          description: "Article ajouté avec succès"
        });
      }
      setItemModal({ isOpen: false, editing: null });
      fetchItems();
      fetchStats(); // Mettre à jour les stats après modification des articles
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }
    try {
      await api.delete(`/inventory/items/${id}`);
      toast({
        title: "Succès",
        description: "Article supprimé avec succès"
      });
      fetchItems();
      fetchStats();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer l'article",
        variant: "destructive",
      });
    }
  };

  // Gestion des mouvements
  const handleMovementSubmit = async (data) => {
    try {
      await api.post('/inventory/movements', data);
      toast({
        title: "Succès",
        description: `${data.movement_type === 'in' ? 'Entrée' : 'Sortie'} enregistrée avec succès`
      });
      setMovementModal({ isOpen: false, type: 'in', itemId: null });
      fetchMovements();
      fetchItems(); // Mettre à jour les quantités des articles
      fetchStats();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion de Stock</h1>
        
        {activeTab === 'items' && (
          <Button onClick={() => setItemModal({ isOpen: true, editing: null })}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un article
          </Button>
        )}
        
        {activeTab === 'categories' && (
          <Button onClick={() => setCategoryModal({ isOpen: true, editing: null })}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter une catégorie
          </Button>
        )}
        
        {activeTab === 'movements' && (
          <div className="flex space-x-2">
            <Button onClick={() => setMovementModal({ isOpen: true, type: 'in', itemId: null })} variant="default">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle entrée
            </Button>
            <Button onClick={() => setMovementModal({ isOpen: true, type: 'out', itemId: null })} variant="outline">
              <ArrowLeftRight className="w-4 h-4 mr-2" /> Nouvelle sortie
            </Button>
          </div>
        )}
      </div> 

      <Tabs value={activeTab} onValueChange={(value) => {
  setActiveTab(value);
  setCurrentPage(1); // Réinitialiser à la première page lors du changement d'onglet
}}>

      
        <TabsList>
          <TabsTrigger value="items">
            <Package className="w-4 h-4 mr-2" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Folder className="w-4 h-4 mr-2" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Mouvements
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart className="w-4 h-4 mr-2" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
  <InventoryItemsTab 
    items={currentItems}  // Changement ici
    categories={categories}
    onEdit={(item) => setItemModal({ isOpen: true, editing: item })}
    onDelete={handleDeleteItem}
    onAddMovement={(item, type) => setMovementModal({ isOpen: true, type, itemId: item.id })}
  />
</TabsContent>

        

        <TabsContent value="categories">
          <CategoriesTab 
            categories={currentCategories} 
            onEdit={(category) => setCategoryModal({ isOpen: true, editing: category })}
            onDelete={handleDeleteCategory}
          />
        </TabsContent>

        <TabsContent value="movements">
          <MovementsTab 
            movements={currentMovements}
          />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab stats={stats} />
        </TabsContent>
      </Tabs>

      {activeTab !== 'stats' && (

      <div className="flex items-center justify-between mt-4 px-2">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Lignes par page:</span>
    <Select
      value={String(itemsPerPage)}
      onValueChange={(value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-[70px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="100">100</SelectItem>
        <SelectItem value="500">500</SelectItem>
        <SelectItem value="1000">1000</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="flex items-center gap-2">

  <span className="text-sm text-gray-600">
  {activeTab === 'items' 
    ? items.length === 0 ? 'Aucun article' : `${startIndexItems + 1}-${Math.min(endIndexItems, items.length)} sur ${items.length}`
    : activeTab === 'movements'
    ? movements.length === 0 ? 'Aucun mouvement' : `${startIndexMovements + 1}-${Math.min(endIndexMovements, movements.length)} sur ${movements.length}`
    : activeTab === 'categories'
    ? categories.length === 0 ? 'Aucune catégorie' : `${startIndexCategories + 1}-${Math.min(endIndexCategories, categories.length)} sur ${categories.length}`
    : activeTab === 'stats'
    ? 'Statistiques'
    : ''}
</span>

  

    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1 || 
        (activeTab === 'items' && items.length === 0) ||
        (activeTab === 'movements' && movements.length === 0) ||
        (activeTab === 'categories' && categories.length === 0)}

      
    >
      Précédent
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => {
        const maxPage = activeTab === 'items' ? totalPagesItems : 
               activeTab === 'movements' ? totalPagesMovements : 
               activeTab === 'categories' ? totalPagesCategories : 1;

        return Math.min(prev + 1, maxPage);
      })}

      disabled={(activeTab === 'items' && (currentPage === totalPagesItems || items.length === 0)) || 
        (activeTab === 'movements' && (currentPage === totalPagesMovements || movements.length === 0)) ||
        (activeTab === 'categories' && (currentPage === totalPagesCategories || categories.length === 0)) ||
        (activeTab === 'stats')}
      

    >
      Suivant
    </Button>
  </div>
</div>
)}


      {/* Modaux de formulaires */}
      {categoryModal.isOpen && (
        <CategoryForm 
          isOpen={categoryModal.isOpen}
          onClose={() => setCategoryModal({ isOpen: false, editing: null })}
          editingCategory={categoryModal.editing}
          onSubmit={handleCategorySubmit}
        />
      )}
      
      {itemModal.isOpen && (
        <ItemForm 
          isOpen={itemModal.isOpen}
          onClose={() => setItemModal({ isOpen: false, editing: null })}
          editingItem={itemModal.editing}
          categories={categories}
          onSubmit={handleItemSubmit}
        />
      )}
      
      {movementModal.isOpen && (
        <MovementForm 
          isOpen={movementModal.isOpen}
          onClose={() => setMovementModal({ isOpen: false, type: 'in', itemId: null })}
          type={movementModal.type}
          itemId={movementModal.itemId}
          items={items}
          employees={employees}
          onSubmit={handleMovementSubmit}
        />
      )}
    </div>
  );
};

export default InventoryPage; 