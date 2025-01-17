import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Droplet, MapPin, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, LayerGroup, Polygon } from 'react-leaflet';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from "../ui/toast/use-toast";
import 'leaflet/dist/leaflet.css';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from "../ui/select";

const calculateBounds = (points) => {
  if (!points.length) return null;
  const latitudes = points.map(p => parseFloat(p[0]));
  const longitudes = points.map(p => parseFloat(p[1]));
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)]
  ];
};

const groupMetersByQuartier = (meters) => {
  return meters.reduce((groups, meter) => {
    const quartierId = meter.quartier?.id;
    if (!quartierId) return groups;
    
    if (!groups[quartierId]) {
      groups[quartierId] = {
        name: meter.quartier.name,
        meters: []
      };
    }
    groups[quartierId].meters.push([parseFloat(meter.latitude), parseFloat(meter.longitude)]);
    return groups;
  }, {});
};

const MAP_LAYERS = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
};

const getQuartierColor = (quartierId) => {
  const hue = (quartierId * 137.5) % 360; // Nombre d'or pour distribution optimale
  const saturation = 70; // Fixe pour consistance
  const lightness = 45; // Assez foncé pour être visible
  const alpha = 0.2; // Transparence
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
};

const MapLayer = ({ mapType }) => {
  const { url, attribution } = MAP_LAYERS[mapType];
  return (
    <TileLayer
      url={url}
      attribution={attribution}
    />
  );
};

const MapBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};



const MapPage = () => {
  const { toast } = useToast();
  const [meters, setMeters] = useState([]);
  const [sources, setSources] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [showQuartiers, setShowQuartiers] = useState(true);
  const [showNetwork, setShowNetwork] = useState(true);
  const [initialCenter, setInitialCenter] = useState([14.4974, -14.4524]); // Default center, will be updated
  const [mapType, setMapType] = useState('standard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metersResponse, sourcesResponse] = await Promise.all([
          api.get('/meters'),
          api.get('/water-quality/sources')
        ]);

        const metersData = metersResponse.data.data;
        const sourcesData = sourcesResponse.data;
        
        setMeters(metersData);
        setSources(sourcesData);

        // Calculate bounds and center from all points
        const allPoints = [
          ...metersData.map(m => [m.latitude, m.longitude]),
          ...sourcesData.map(s => [s.latitude, s.longitude])
        ];
        
        setBounds(calculateBounds(allPoints));
        
        // Update center if points exist
        if (allPoints.length > 0) {
          const center = [
            allPoints.reduce((sum, point) => sum + parseFloat(point[0]), 0) / allPoints.length,
            allPoints.reduce((sum, point) => sum + parseFloat(point[1]), 0) / allPoints.length
          ];
          setInitialCenter(center);
        }

      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  const quarterGroups = groupMetersByQuartier(meters);

  return (
    <div className="p-6 space-y-6 relative z-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Réseau de Distribution d'Eau</h1>
        <div className="flex space-x-4 items-center">
          <Select value={mapType} onValueChange={setMapType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de carte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Vue standard</SelectItem>
              <SelectItem value="satellite">Vue satellite</SelectItem>
            </SelectContent>
          </Select>


        <div className="space-x-4">
          <Button 
            variant="outline"
            onClick={() => setShowQuartiers(!showQuartiers)}
          >
            {showQuartiers ? 'Masquer Quartiers' : 'Afficher Quartiers'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowNetwork(!showNetwork)}
          >
            {showNetwork ? 'Masquer Réseau' : 'Afficher Réseau'}
          </Button>
        </div>
      </div>
      </div>
      
      

      <Card className="p-4 relative z-0">
        <MapContainer 
          center={initialCenter}
          zoom={7}
          className="h-[800px] w-full rounded-lg"
        >
          
          
          <MapLayer mapType={mapType} />

          {/* Sources d'eau */}
          <LayerGroup>
            {sources.map(source => (
              <CircleMarker
                key={source.id}
                center={[parseFloat(source.latitude), parseFloat(source.longitude)]}
                radius={10}
                pathOptions={{
                  fillColor: source.status === 'active' ? '#2563EB' : '#94A3B8',
                  fillOpacity: 0.7,
                  color: 'white',
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{source.name}</h3>
                    <p>Capacité: {source.capacity} m³/j</p>
                    <Badge variant={source.status === 'active' ? 'success' : 'secondary'}>
                      {source.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>

          {/* Quartiers */}
          {showQuartiers && (
            <LayerGroup>
              {Object.entries(quarterGroups).map(([id, quartier]) => (
                <Polygon
                  key={id}
                  positions={quartier.meters}
                  pathOptions={{
                    fillColor: getQuartierColor(parseInt(id)),
                    fillOpacity: 0.3,
                    color: '#2563EB',
                    weight: 2,
                    dashArray: '5'
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{quartier.name}</h3>
                      <p>{quartier.meters.length} compteurs</p>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          )}

          {/* Compteurs */}
          <LayerGroup>
            {meters.map(meter => (
              <CircleMarker
                key={meter.id}
                center={[parseFloat(meter.latitude), parseFloat(meter.longitude)]}
                radius={6}
                pathOptions={{
                  fillColor: '#22c55e',
                  fillOpacity: 0.7,
                  color: 'white',
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{meter.meter_number}</h3>
                    <p>{meter.user.first_name} {meter.user.last_name}</p>
                    <p>{meter.quartier.name}</p>
                    <Badge variant={meter.status === 'active' ? 'success' : 'secondary'}>
                      {meter.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>

          {/* Réseau simulé */}
          {showNetwork && sources.map(source => (
            source.status === 'active' && Object.values(quarterGroups).map((quartier, idx) => {
              const centerPoint = [
                quartier.meters.reduce((sum, point) => sum + point[0], 0) / quartier.meters.length,
                quartier.meters.reduce((sum, point) => sum + point[1], 0) / quartier.meters.length
              ];
              
              return (
                <Polygon
                  key={`${source.id}-${idx}`}
                  positions={[
                    [parseFloat(source.latitude), parseFloat(source.longitude)],
                    centerPoint
                  ]}
                  pathOptions={{
                    color: '#2563EB',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5,10'
                  }}
                />
              );
            })
          ))}

          {/* Légende */}
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md z-[1000]">
            <h4 className="font-semibold mb-2">Légende</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>Source active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Source inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Compteur</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 opacity-50"></div>
                <span>Zone de quartier</span>
              </div>
              {showNetwork && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-blue-500"></div>
                  <span>Réseau de distribution</span>
                </div>
              )}
            </div>
          </div>
        </MapContainer>
      </Card>
    </div>
  );
};

export default MapPage;