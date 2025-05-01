// MeterProblemDialog.js - Dialogue pour signaler ou résoudre un problème
import React, { useState } from 'react';
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
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/toast/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate; 


const problemTypeLabels = {
    blocage_mecanisme: "Blocage du mécanisme",
    fuite_interne: "Fuite interne",
    casse_fissure: "Casse ou fissure",
    deterioration_joints: "Détérioration des joints",
    mauvais_positionnement: "Mauvais positionnement",
    usure_composants: "Usure des composants",
    sous_comptage: "Sous-comptage",
    sur_comptage: "Sur-comptage",
    lecture_illisible: "Lecture illisible",
    absence_entretien: "Absence d'entretien",
    conditions_climatiques: "Conditions climatiques extrêmes",
    environnement_non_protege: "Environnement non protégé",
    bulles_air: "Bulles d'air dans les canalisations",
    fraude_manipulation: "Fraude ou manipulation",
    autre: "Autre problème"
  };


const MeterProblemDialog = ({ isOpen, onClose, meter, onSuccess }) => {
  const [formData, setFormData] = useState({
    problem_type: meter?.problem_type || '',
    problem_description: meter?.problem_description || '',
    resolution_notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      let response;
      
      if (meter?.has_problem) {
        // Résoudre un problème existant
        response = await api.post(`/meters/${meter.id}/resolve-problem`, {
          resolution_notes: formData.resolution_notes
        });
        toast({
          title: "Succès",
          description: "Le problème a été marqué comme résolu"
        });
      } else {
        // Signaler un nouveau problème
        if (!formData.problem_type) {
          toast({
            title: "Erreur",
            description: "Veuillez sélectionner un type de problème",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        response = await api.post(`/meters/${meter.id}/report-problem`, {
          problem_type: formData.problem_type,
          problem_description: formData.problem_description
        });
        toast({
          title: "Succès",
          description: "Le problème a été signalé avec succès"
        });
      }
      
      onSuccess && onSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {meter?.has_problem 
              ? "Résoudre le problème" 
              : "Signaler un problème"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!meter?.has_problem ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de problème</label>
                <Select
                  value={formData.problem_type}
                  onValueChange={(value) => handleChange('problem_type', value)}
                >
                  <SelectTrigger>
  <SelectValue placeholder="Sélectionner un type de problème" />
</SelectTrigger>
<SelectContent>
  {/* Ajoutez le ScrollArea ici */}
  <ScrollArea className="h-60"> {/* Définissez une hauteur fixe */}
    <SelectItem value="blocage_mecanisme">Blocage du mécanisme</SelectItem>
    <SelectItem value="fuite_interne">Fuite interne</SelectItem>
    <SelectItem value="casse_fissure">Casse ou fissure</SelectItem>
    <SelectItem value="deterioration_joints">Détérioration des joints</SelectItem>
    <SelectItem value="mauvais_positionnement">Mauvais positionnement</SelectItem>
    <SelectItem value="usure_composants">Usure des composants</SelectItem>
    <SelectItem value="sous_comptage">Sous-comptage</SelectItem>
    <SelectItem value="sur_comptage">Sur-comptage</SelectItem>
    <SelectItem value="lecture_illisible">Lecture illisible</SelectItem>
    <SelectItem value="absence_entretien">Absence d'entretien</SelectItem>
    <SelectItem value="conditions_climatiques">Conditions climatiques extrêmes</SelectItem>
    <SelectItem value="environnement_non_protege">Environnement non protégé</SelectItem>
    <SelectItem value="bulles_air">Bulles d'air dans les canalisations</SelectItem>
    <SelectItem value="fraude_manipulation">Fraude ou manipulation</SelectItem>
    <SelectItem value="autre">Autre problème</SelectItem>
  </ScrollArea>
</SelectContent>

                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description du problème</label>
                <Textarea
                  placeholder="Décrivez le problème en détail..."
                  value={formData.problem_description}
                  onChange={(e) => handleChange('problem_description', e.target.value)}
                  rows={4}
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-yellow-50 rounded-md mb-4">
                <h3 className="font-medium">Problème actuel:</h3>
                <p className="text-sm my-1">{problemTypeLabels[meter.problem_type] || "Type non spécifié"}</p>
                <p className="text-sm">{meter.problem_description || "Aucune description"}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes de résolution</label>
                <Textarea
                  placeholder="Décrivez comment le problème a été résolu..."
                  value={formData.resolution_notes}
                  onChange={(e) => handleChange('resolution_notes', e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "En cours..." : (meter?.has_problem ? "Marquer comme résolu" : "Signaler le problème")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeterProblemDialog;