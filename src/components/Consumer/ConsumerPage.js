//consummer/ConsumerPage
import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, X } from 'lucide-react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../ui/toast/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { cn } from "../lib/utils";
import { Plus, Pencil, Trash2, Search, Phone, MapPin, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;


const ConsumerPage = () => {
  const { toast } = useToast();
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [consumerToDelete, setConsumerToDelete] = useState(null);
  const [formError, setFormError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  

   // Fonction de récupération des consommateurs
   const fetchConsumers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/consumers', {
        params: {
          search: searchTerm
        }
      });
      setConsumers(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les consommateurs"
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConsumers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchConsumers]);

 



// Calculer les indices et pages pour la pagination côté client
const totalPages = Math.ceil(consumers.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentConsumers = consumers.slice(startIndex, endIndex);





  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Réinitialiser l'erreur
    setFormError('');

       // Validation du format du numéro de téléphone
    if (!data.phone_number.startsWith('+')) {
      setFormError('Le numéro de téléphone doit commencer par +');
      return;
    }

    try {
      if (selectedConsumer) {
        await api.patch(`/consumers/${selectedConsumer.id}`, data);
        toast({
          title: "Succès",
          description: "Consommateur modifié avec succès"
        });
      } else {
        await api.post('/consumers', data);
        toast({
          title: "Succès",
          description: "Consommateur ajouté avec succès"
        });
      }
      setIsModalOpen(false);
      fetchConsumers();
    } catch (error) {

       // Ajout de logs pour debug
       console.log('Erreur complète:', error);
       console.log('Response data:', error.response?.data);
       console.log('Message d\'erreur:', error.response?.data?.message);

    // Vérifier spécifiquement l'erreur de contrainte unique de PostgreSQL
  if (error.response?.data?.error?.includes('users_phone_number_key')) {
    setFormError('Ce numéro de téléphone est déjà utilisé par un autre consommateur');
  } else {
    setFormError(error.response?.data?.message || "Une erreur est survenue");
  }
}
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/consumers/${consumerToDelete.id}`);
      toast({
        title: "Succès",
        description: "Consommateur supprimé avec succès"
      });
      fetchConsumers();
      setIsDeleteDialogOpen(false);
      setConsumerToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le consommateur"
      });
    }
  };

 



  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Consommateurs</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          <Button onClick={() => {
            setSelectedConsumer(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Surnom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
          {currentConsumers.map((consumer) => (
    <TableRow key={consumer.id}>
      <TableCell>{consumer.name}</TableCell>
      <TableCell>{consumer.first_name}</TableCell>
      <TableCell>{consumer.last_name}</TableCell>
      <TableCell>
        {consumer.date_of_birth ? 
          format(new Date(consumer.date_of_birth), 'dd/MM/yyyy') : 
          '-'}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{consumer.phone_number}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{consumer.address || '-'}</span>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(consumer.createdAt), 'dd/MM/yyyy')}
      </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedConsumer(consumer);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* 

                    <Button 
                      variant="destructive"  
                      size="sm"
                      onClick={() => {
                        setConsumerToDelete(consumer);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    */}

                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>


        </Table>

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
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, consumers.length)} sur {consumers.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>

        </div>


      </Card>

     

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedConsumer ? 'Modifier le consommateur' : 'Ajouter un consommateur'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">

          {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
          <Button 
            variant="ghost" 
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => setFormError('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Surnom</label>
                  <Input
                    name="name"
                    defaultValue={selectedConsumer?.name}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom</label>
                  <Input
                    name="first_name"
                    defaultValue={selectedConsumer?.first_name}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    name="last_name"
                    defaultValue={selectedConsumer?.last_name}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de naissance</label>
                  <Input
                    type="date"
                    name="date_of_birth"
                    defaultValue={selectedConsumer?.date_of_birth}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    name="phone_number"
                    defaultValue={selectedConsumer?.phone_number}
                    required
                    placeholder="Ex: +33612345678"
                    onChange={() => setFormError('')} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <Input
                    name="address"
                    defaultValue={selectedConsumer?.address}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {selectedConsumer ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement ce consommateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConsumerPage;
