// MeterProblemBadge.js - Indicateur visuel pour les problèmes
import React from 'react';
import { Badge } from "../ui/badge";
import { AlertTriangle } from 'lucide-react';

// Traduction des types de problèmes pour l'affichage
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

const MeterProblemBadge = ({ meter }) => {
  if (!meter.has_problem) {
    return null;
  }

  const problemLabel = problemTypeLabels[meter.problem_type] || "Problème non spécifié";
  const reportedDate = meter.problem_reported_at 
    ? new Date(meter.problem_reported_at).toLocaleDateString('fr-FR') 
    : 'Date inconnue';

  return (
    <Badge variant="destructive" className="flex items-center gap-1" title={`Signalé le: ${reportedDate}\n${meter.problem_description || ""}`}>
      <AlertTriangle className="h-3 w-3" />
      {problemLabel}
    </Badge>
  );
};

export default MeterProblemBadge;