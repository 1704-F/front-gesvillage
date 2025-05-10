import React, { useState, useEffect } from 'react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card } from "../../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useToast } from "../../ui/toast/use-toast";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  Pencil, 
  Trash2, 
  Check,
  Download
} from 'lucide-react';
import { axiosPrivate as api } from '../../../utils/axios';

import ViewDistributionRecordModal from './ViewDistributionRecordModal';
import SingleDistributionRecordPDFButton from './SingleDistributionRecordPDFButton';
import DistributionRecordPDFDownloadButton from './DistributionRecordPDFDownloadButton';

const DistributionRecordsTab = ({ 
  sources, 
  onEdit = (record) => {}, 
  shouldRefresh = false,
  onRefreshComplete = () => {}
}) => {
  const { toast } = useToast();
  const [distributionRecords, setDistributionRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDistributionModal, setViewDistributionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // États pour les filtres
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [paginatedRecords, setPaginatedRecords] = useState([]);

  // Définir filteredRecords en tant qu'état
  const [filteredRecords, setFilteredRecords] = useState([]);

  // Chargement initial des données
  useEffect(() => {
    fetchDistributionRecords().finally(() => setLoading(false));
  }, []);

  // Mettre à jour les records filtrés quand les filtres ou les données changent
  useEffect(() => {
    if (distributionRecords.length > 0) {
      const filtered = distributionRecords.filter(record => {
        let matches = true;
        
        // Filtre par source
        if (sourceFilter !== 'all') {
          matches = matches && record.source?.id.toString() === sourceFilter;
        }
        
        // Filtre par statut
        if (statusFilter !== 'all') {
          matches = matches && record.status === statusFilter;
        }
        
        return matches;
      });
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  }, [distributionRecords, sourceFilter, statusFilter]);

  // Mettre à jour la pagination quand les données filtrées changent
  useEffect(() => {
    // Calculer le nombre total de pages
    const totalPagesCount = Math.ceil(filteredRecords.length / pageSize);
    setTotalPages(totalPagesCount);
    
    // S'assurer que la page courante est valide
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    } else {
      // Extraire les enregistrements pour la page courante
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setPaginatedRecords(filteredRecords.slice(startIndex, endIndex));
    }
  }, [filteredRecords, currentPage, pageSize]);

  // Si currentPage est modifié ailleurs, mettre à jour les enregistrements paginés
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedRecords(filteredRecords.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredRecords]);

  useEffect(() => {
    if (shouldRefresh) {
      fetchDistributionRecords().then(() => {
        onRefreshComplete();
      });
    }
  }, [shouldRefresh, onRefreshComplete]);

  // Récupération des enregistrements de distribution
  const fetchDistributionRecords = async () => {
    try {
      const response = await api.get('/water-quality/distribution');
      setDistributionRecords(response.data);
      setCurrentPage(1); // Réinitialiser à la première page lors du chargement des données
      return response.data;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les enregistrements de distribution",
        variant: "destructive",
      });
      return [];
    }
  };

  // Suppression d'un enregistrement de distribution
  const handleDeleteDistribution = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
      return;
    }
    try {
      await api.delete(`/water-quality/distribution/${id}`);
      toast({
        title: "Succès",
        description: "Enregistrement supprimé avec succès"
      });
      fetchDistributionRecords();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Validation d'un enregistrement de distribution
  const handleValidateDistribution = async (id) => {
    try {
      await api.patch(`/water-quality/distribution/${id}/validate`);
      
      // Mise à jour de l'état local
      setDistributionRecords(distributionRecords.map(record => {
        if (record.id === id) {
          return {
            ...record,
            status: 'validated'
          };
        }
        return record;
      }));

      toast({
        title: "Succès",
        description: "Enregistrement validé avec succès"
      });
      
      // Rechargement des données
      fetchDistributionRecords();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Affichage des détails d'un enregistrement
  const handleViewDistribution = async (id) => {
    try {
      const response = await api.get(`/water-quality/distribution/${id}`);
      setSelectedRecord(response.data);
      setViewDistributionModal(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Formatage de la durée en heures et minutes
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Composant de pagination
  const Pagination = ({ filteredCount }) => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Affichage de {filteredCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} à {Math.min(currentPage * pageSize, filteredCount)} sur {filteredCount} enregistrements
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(totalPages, 5)).keys()].map(index => {
              // Afficher jusqu'à 5 boutons de page
              let pageNumber;
              if (totalPages <= 5) {
                // Si moins de 5 pages, afficher toutes les pages
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                // Si on est près du début
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                // Si on est près de la fin
                pageNumber = totalPages - 4 + index;
              } else {
                // Si on est au milieu
                pageNumber = currentPage - 2 + index;
              }
              
              return (
                <Button 
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1">...</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Suivant
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Éléments par page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1); // Retour à la première page lors du changement de taille
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-6">Chargement...</div>;
  }

  return (
    <>
      {/* Filtres et bouton de téléchargement */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Select
            value={sourceFilter}
            onValueChange={setSourceFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source.id} value={source.id.toString()}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bouton de téléchargement PDF pour tous les enregistrements filtrés */}
        <DistributionRecordPDFDownloadButton 
          distributionRecords={filteredRecords} 
          sources={sources}
          filterStatus={statusFilter}
          sourceFilter={sourceFilter}
        />
      </div>

      {/* Tableau des enregistrements */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Employé</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Volume (m³)</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Aucun enregistrement de distribution trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.source?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(record.distribution_date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {record.employee ? 
                      `${record.employee.first_name} ${record.employee.last_name}` : 
                      'N/A'
                    }
                  </TableCell>

                  <TableCell>
  {record.quartiers && record.quartiers.length > 0 
    ? record.quartiers.map(q => q.name).join(', ')
    : 'N/A'
  }
</TableCell>

                  <TableCell>{record.volume_distributed} m³</TableCell>
                  <TableCell>{formatDuration(record.distribution_duration)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'validated' ? 'success' : 'warning'}>
                      {record.status === 'validated' ? 'Validé' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDistribution(record.id)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      
                      {/* Bouton de téléchargement PDF individuel */}
                      <SingleDistributionRecordPDFButton record={record} />
                      
                      {record.status !== 'validated' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEdit(record)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidateDistribution(record.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteDistribution(record.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination en bas du tableau */}
      {filteredRecords.length > 0 && <Pagination filteredCount={filteredRecords.length} />}

      {/* Modal de détails */}
      <ViewDistributionRecordModal
        isOpen={viewDistributionModal}
        onClose={() => {
          setViewDistributionModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />
    </>
  );
};

export default DistributionRecordsTab;