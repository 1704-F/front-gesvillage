import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { axiosPrivate } from '../../utils/axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const api = axiosPrivate;

// Composant personnalisé pour le nœud central (compteur)
const CenterNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 rounded-md shadow-md text-center bg-indigo-600 text-white">
      <div className="font-bold">{data.label}</div>
      {data.subLabel && <div className="text-sm">{data.subLabel}</div>}
      
      {/* Handles dans les 4 directions pour permettre des connexions de n'importe où */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top" 
        isConnectable={isConnectable} 
        className="w-2 h-2"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right" 
        isConnectable={isConnectable} 
        className="w-2 h-2"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom" 
        isConnectable={isConnectable} 
        className="w-2 h-2"
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left" 
        isConnectable={isConnectable} 
        className="w-2 h-2"
      />
    </div>
  );
};

// Composant personnalisé pour les nœuds consommateurs
const UserNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 rounded-md shadow-md text-center bg-blue-100 border border-blue-300">
      <div className="font-bold">{data.label}</div>
      {data.period && <div className="text-xs mt-1">{data.period}</div>}
      {data.reason && <div className="text-xs italic mt-1 max-w-[150px]">{data.reason}</div>}
      
      {/* Poignée de connexion pour le cible (entrée), visible pour le débogage */}
      <Handle 
        type="target" 
        position={data.handlePosition} 
        id={`target-${data.handlePosition}`} 
        isConnectable={isConnectable} 
        className="w-2 h-2 bg-red-500"
      />
    </div>
  );
};

// Définition des types de nœuds personnalisés
const nodeTypes = {
  center: CenterNode,
  user: UserNode,
};

const MeterUserHistoryMap = ({ isOpen, onClose, meterId }) => {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [meter, setMeter] = useState(null);

  useEffect(() => {
    if (isOpen && meterId) {
      fetchHistory();
    }
  }, [isOpen, meterId]);

  // Fonction pour déterminer la position du handle en fonction de l'angle
  const getHandlePosition = (angle) => {
    // Quadrant supérieur droit (0 à π/2)
    if (angle >= 0 && angle < Math.PI/2) {
      return Position.Bottom;
    } 
    // Quadrant supérieur gauche (π/2 à π)
    else if (angle >= Math.PI/2 && angle < Math.PI) {
      return Position.Left;
    }
    // Quadrant inférieur gauche (π à 3π/2)
    else if (angle >= Math.PI && angle < 3*Math.PI/2) {
      return Position.Top;
    }
    // Quadrant inférieur droit (3π/2 à 2π)
    else {
      return Position.Right;
    }
  };
  
  // Fonction pour obtenir l'ID du handle source sur le nœud central en fonction de l'angle
  const getSourceHandleId = (angle) => {
    // Quadrant supérieur droit (0 à π/2)
    if (angle >= 0 && angle < Math.PI/2) {
      return "top";
    } 
    // Quadrant supérieur gauche (π/2 à π)
    else if (angle >= Math.PI/2 && angle < Math.PI) {
      return "right";
    }
    // Quadrant inférieur gauche (π à 3π/2)
    else if (angle >= Math.PI && angle < 3*Math.PI/2) {
      return "bottom";
    }
    // Quadrant inférieur droit (3π/2 à 2π)
    else {
      return "left";
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meters/${meterId}/user-history`);
      const history = response.data.data.history;
      const meter = response.data.data.meter;
      
      setMeter(meter);
      
      // Créer le nœud central
      const centerNode = {
        id: 'meter',
        type: 'center',
        data: { 
          label: meter.meter_number,
          subLabel: 'Compteur'
        },
        position: { x: 250, y: 250 }
      };
      
      const flowNodes = [centerNode];
      const flowEdges = [];
      
      // Créer les nœuds et les liens
      history.forEach((entry, index) => {
        const nodeId = `user-${entry.id}`;
        const dateStart = format(new Date(entry.start_date), 'dd/MM/yyyy', { locale: fr });
        const dateEnd = entry.end_date ? format(new Date(entry.end_date), 'dd/MM/yyyy', { locale: fr }) : 'présent';
        
        // Placer les nœuds en cercle autour du centre
        const angle = (index * (2 * Math.PI / history.length));
        const radius = 200;
        const x = 250 + radius * Math.cos(angle);
        const y = 250 + radius * Math.sin(angle);
        
        // Obtenir la position du handle appropriée pour cet angle
        const handlePosition = getHandlePosition(angle);
        
        flowNodes.push({
          id: nodeId,
          type: 'user',
          data: { 
            label: `${entry.user.first_name} ${entry.user.last_name}`,
            period: `${dateStart} - ${dateEnd}`,
            reason: entry.change_reason,
            handlePosition: handlePosition
          },
          position: { x, y }
        });
        
        // Obtenir l'identifiant du handle source sur le nœud central
        const sourceHandleId = getSourceHandleId(angle);
        const targetHandleId = `target-${handlePosition}`;
        
        flowEdges.push({
          id: `edge-${nodeId}`,
          source: 'meter',
          target: nodeId,
          label: `${dateStart} - ${dateEnd}`,
          labelStyle: { fill: '#666', fontSize: 10 },
          style: { stroke: entry.end_date ? '#d1d5db' : '#3b82f6', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: entry.end_date ? '#d1d5db' : '#3b82f6',
          },
          animated: !entry.end_date,
          // Spécifier les identifiants des handles pour la connexion
          sourceHandle: sourceHandleId,
          targetHandle: targetHandleId
        });
      });
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-xl">
            Historique des consommateurs pour le compteur {meter?.meter_number}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-4">Chargement...</div>
        ) : (
          <div style={{ height: 500, width: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.5}
              maxZoom={1.5}
              defaultZoom={0.85}
              attributionPosition="bottom-left"
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeterUserHistoryMap;