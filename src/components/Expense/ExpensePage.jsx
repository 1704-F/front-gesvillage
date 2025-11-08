// src/components/Expense/ExpensePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast/use-toast";
import ExpenseStatistics from "./ExpenseStatistics";

import {
  DollarSign, // Pour les montants
  FileText, // Pour les pièces jointes
  Calendar, // Pour les dates
  Plus, // Pour l'ajout
  Pencil, // Pour la modification
  Trash2, // Pour la suppression
  Check, // Pour l'approbation
  XCircle,
  Download // Pour le rejet
} from "lucide-react";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { axiosPrivate as api } from "../../utils/axios";

const ExpensePage = () => {
  // États
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, editing: null });
  const { toast } = useToast();

  const [categoryModal, setCategoryModal] = useState({
    isOpen: false,
    editing: null,
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Nouveaux états pour la pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // États pour les filtres
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      date.setDate(1);
      return date;
    })(),
    new Date(),
  ]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Les données de pagination viennent directement de l'API
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + expenses.length;

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchExpenses(),
      fetchCategories(),
      fetchStatistics(),
    ]).finally(() => setLoading(false));
  }, [dateRange, statusFilter, categoryFilter]);

  // Fonction de récupération des dépenses
  // Fonction de récupération des dépenses avec pagination
  const fetchExpenses = async (page = currentPage, limit = itemsPerPage) => {
    try {
      const response = await api.get("/expenses", {
        params: {
          page,
          limit,
          start_date: dateRange[0]
            ? format(dateRange[0], "yyyy-MM-dd")
            : undefined,
          end_date: dateRange[1]
            ? format(dateRange[1], "yyyy-MM-dd")
            : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          search: searchTerm || undefined,
          sort_by: sortField,
          sort_order: sortOrder,
        },
      });
      setExpenses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Erreur lors de la récupération des dépenses:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les dépenses",
        variant: "destructive",
      });
    }
  };
  // Gestionnaire de changement de page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchExpenses(newPage, itemsPerPage);
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/expenses/responsibles");
      setEmployees(response.data.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des employés",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Ajouter ces fonctions dans ExpensePage
  const handleDownloadAttachment = async (attachment) => {
    try {
      console.log("Téléchargement de la pièce jointe:", attachment); // Debug

      const response = await api.get(`/expenses/attachments/${attachment.id}`, {
        responseType: "blob",
        headers: {
          Accept: "*/*",
        },
      });

      console.log("Réponse du serveur:", response); // Debug

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Pièce jointe téléchargée avec succès",
      });
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la pièce jointe",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/expenses/${id}/approvals`, {
        status: "approved",
        comments: "Approuvé",
        // Ne pas envoyer l'approved_by car il sera géré par le middleware d'auth
      });
      toast({ title: "Succès", description: "Approuvé avec succès" });
      fetchExpenses();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/expenses/${id}/reject`);
      toast({
        title: "Succès",
        description: "Dépense rejetée avec succès",
      });
      fetchExpenses();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la dépense",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      toast({
        title: "Succès",
        description: "Dépense supprimée avec succès",
      });
      fetchExpenses();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la dépense",
        variant: "destructive",
      });
    }
  };
  const handleCategorySubmit = async (formData) => {
    try {
      if (categoryModal.editing) {
        await api.put(
          `/expenses/categories/${categoryModal.editing.id}`,
          formData
        );
        toast({
          title: "Succès",
          description: "Catégorie modifiée avec succès",
        });
      } else {
        await api.post("/expenses/categories", formData);
        toast({
          title: "Succès",
          description: "Catégorie ajoutée avec succès",
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

  // Ajouter la fonction handleSubmit dans le composant principal ExpensePage
  const handleSubmit = async (formData) => {
    try {
      let response;
      if (modal.editing) {
        response = await api.put(`/expenses/${modal.editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/expenses", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast({ title: "Succès", description: "Dépense ajoutée avec succès" });
        setModal({ isOpen: false, editing: null });
        fetchExpenses();
      }
    } catch (error) {
      console.error("Erreur:", error.response?.data);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
      });
    }
  };
  // Fonction de récupération des catégories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/expenses/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les catégories",
        variant: "destructive",
      });
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/expenses/statistics", {
        params: {
          start_date: dateRange[0]
            ? format(dateRange[0], "yyyy-MM-dd")
            : undefined,
          end_date: dateRange[1]
            ? format(dateRange[1], "yyyy-MM-dd")
            : undefined,
        },
      });
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const handleDownloadPDF = async (expenseId) => {
  try {
    const response = await api.get(`/expenses/${expenseId}/download-pdf`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `depense_${expenseId}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Succès",
      description: "PDF téléchargé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    toast({
      title: "Erreur",
      description: "Impossible de télécharger le PDF",
      variant: "destructive"
    });
  }
};



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dépenses</h2>

        <div className="flex items-center gap-4">
          {/* Filtres */}
          <div className="flex gap-2">
            {/* Sélecteur de dates */}
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg"
                value={format(dateRange[0], "yyyy-MM-dd")}
                onChange={(e) =>
                  setDateRange([new Date(e.target.value), dateRange[1]])
                }
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg"
                value={format(dateRange[1], "yyyy-MM-dd")}
                onChange={(e) =>
                  setDateRange([dateRange[0], new Date(e.target.value)])
                }
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filtre par statut */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre par catégorie */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bouton d'ajout */}
          <Button onClick={() => setModal({ isOpen: true, editing: null })}>
            <Plus className="w-4 h-4 mr-2" /> Dépense
          </Button>
          <Button
            onClick={() => setCategoryModal({ isOpen: true, editing: null })}
          >
            <Plus className="w-4 h-4 mr-2" /> Catégorie
          </Button>
        </div>
      </div>
      <ExpenseStatistics statistics={statistics} />

      {/* Table des dépenses */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Responsables</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead>Pièces jointes</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {format(new Date(expense.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{expense.category?.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {expense.type === "facture"
                      ? "Facture"
                      : expense.type === "reparation"
                      ? "Réparation"
                      : expense.type === "achat"
                      ? "Achat"
                      : expense.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {expense.responsibles?.map((resp) => (
                    <Badge key={resp.id} variant="secondary" className="mr-1">
                      {resp.first_name} {resp.last_name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {parseFloat(expense.amount).toLocaleString()} FCFA
                </TableCell>

                <TableCell>
                  {expense.attachments && expense.attachments.length > 0 ? (
                    expense.attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                        className="mr-1 max-w-[200px]"
                        title={attachment.file_name}
                      >
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="ml-1 truncate">
                          {attachment.file_name}
                        </span>
                      </Button>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      expense.status === "approved"
                        ? "success"
                        : expense.status === "rejected"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {expense.status === "approved"
                      ? "Approuvé"
                      : expense.status === "rejected"
                      ? "Rejeté"
                      : "En attente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
      variant="ghost"
      size="sm"
      onClick={() => handleDownloadPDF(expense.id)}
      title="Télécharger le justificatif PDF"
    >
      <Download className="h-4 w-4" />
    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setModal({ isOpen: true, editing: expense })
                      }
                      disabled={expense.status === "approved"} // Désactiver si approuvé
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {expense.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(expense.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      disabled={expense.status !== "pending"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                

              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Nouvelle section de pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Lignes par page:</span>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => {
                setPagination((prev) => ({ ...prev, limit: Number(value) }));
                fetchExpenses(1, Number(value));
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, pagination.total)} sur{" "}
              {pagination.total}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de formulaire */}
      <ExpenseForm
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, editing: null })}
        editingExpense={modal.editing}
        categories={categories}
        employees={employees}
        onSubmit={handleSubmit}
      />
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false, editing: null })}
        editingCategory={categoryModal.editing}
        onSubmit={handleCategorySubmit}
      />

      <ExpenseDetails
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />
    </div>
  );
};
const ExpenseForm = ({
  isOpen,
  onClose,
  editingExpense,
  categories,
  onSubmit,
  employees,
}) => {
  const { toast } = useToast();
  const initialFormState = {
    title: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    type: "",
    description: "",
    category_id: "",
    responsible_ids: [],
    attachments: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        ...editingExpense,
        date: format(new Date(editingExpense.date), "yyyy-MM-dd"),
        responsible_ids:
          editingExpense.responsibles?.map((r) => r.id.toString()) || [],
        category_id: String(editingExpense.category_id),
      });
    } else {
      // Si on n'est pas en mode édition, on réinitialise le formulaire
      setFormData(initialFormState);
    }
  }, [editingExpense, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Vérifier que toutes les données requises sont présentes
      if (
        !formData.title ||
        !formData.amount ||
        !formData.date ||
        !formData.type
      ) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      // Créer un objet FormData
      const formDataToSend = new FormData();

      // Ajouter toutes les données de base
      formDataToSend.append("title", formData.title);
      formDataToSend.append("amount", String(formData.amount));
      formDataToSend.append("date", formData.date);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("description", formData.description || "");

      // Ajouter les responsables
      if (formData.responsible_ids && formData.responsible_ids.length > 0) {
        formData.responsible_ids.forEach((id) => {
          formDataToSend.append("responsible_ids[]", String(id));
        });
      }

      // Ajouter les fichiers
      if (formData.attachments && formData.attachments.length > 0) {
        Array.from(formData.attachments).forEach((file) => {
          formDataToSend.append("file", file);
        });
      }

      await onSubmit(formDataToSend);

      // Réinitialiser le formulaire avec les valeurs initiales
      setFormData({
        title: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        type: "",
        description: "",
        category_id: "",
        responsible_ids: [],
        attachments: [],
      });

      // Fermer le modal
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de la dépense",
        variant: "destructive",
      });
    }
  };
  // Gestion de la sélection des responsables
  const handleResponsibleChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      responsible_ids: prev.responsible_ids.includes(value)
        ? prev.responsible_ids.filter((id) => id !== value)
        : [...prev.responsible_ids, value],
    }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingExpense ? "Modifier la dépense" : "Nouvelle dépense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Responsables</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.responsible_ids.map((id) => {
                  const employee = employees.find(
                    (e) => e.id.toString() === id.toString()
                  );
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {employee?.first_name} {employee?.last_name}
                      <button
                        type="button"
                        onClick={() => handleResponsibleChange(id)}
                        className="ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
              <Select value="" onValueChange={handleResponsibleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(
                      (emp) =>
                        !formData.responsible_ids.includes(emp.id.toString())
                    )
                    .map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.first_name} {employee.last_name} -{" "}
                        {employee.job_title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facture">Facture</SelectItem>
                  <SelectItem value="reparation">Réparation</SelectItem>
                  <SelectItem value="achat">Achat</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pièces jointes</label>
            <Input
              type="file"
              multiple
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attachments: [...formData.attachments, ...e.target.files],
                })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingExpense ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
const CategoryModal = ({ isOpen, onClose, editingCategory, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
    }
  }, [editingCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingCategory ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
const ExpenseDetails = ({ expense, onClose }) => {
  const { toast } = useToast();

  // Fonction helper pour formater les dates de manière sécurisée
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return isValid(date) ? format(date, "dd MMMM yyyy", { locale: fr }) : "—";
    } catch (error) {
      return "—";
    }
  };

  // Fonction helper pour formater les dates avec heures
  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return isValid(date)
        ? format(date, "dd/MM/yyyy HH:mm", { locale: fr })
        : "—";
    } catch (error) {
      return "—";
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await api.get(`/expenses/attachments/${attachment.id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la pièce jointe",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Détails de la dépense</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Titre</h3>
              <p>{expense?.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Montant</h3>
              <p>{parseFloat(expense?.amount).toLocaleString()} FCFA</p>
            </div>
            <div>
              <h3 className="font-medium">Date</h3>
              <p>{formatDate(expense?.date)}</p>{" "}
            </div>
            <div>
              <h3 className="font-medium">Catégorie</h3>
              <p>{expense?.category?.name}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium">Description</h3>
            <p>{expense?.description}</p>
          </div>

          {/* Responsables */}
          <div>
            <h3 className="font-medium">Responsables</h3>
            <div className="flex flex-wrap gap-2">
              {expense?.responsibles?.map((resp) => (
                <Badge key={resp.id} variant="secondary">
                  {resp.first_name} {resp.last_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pièces jointes */}
          <div>
            <h3 className="font-medium">Pièces jointes</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {expense?.attachments?.map((attachment) => (
                <Button
                  key={attachment.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadAttachment(attachment)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {attachment.file_name}
                </Button>
              ))}
            </div>
          </div>

          {/* Approbations */}
          <div>
            <h3 className="font-medium">Historique des approbations</h3>
            <div className="mt-2">
              {expense?.approvals?.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {approval.approver.first_name}{" "}
                      {approval.approver.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(approval.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      approval.status === "approved"
                        ? "success"
                        : approval.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {approval.status === "approved"
                      ? "Approuvé"
                      : approval.status === "rejected"
                      ? "Rejeté"
                      : "En attente"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpensePage;
