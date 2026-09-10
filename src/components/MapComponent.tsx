import React, { useState } from 'react';
import { 
  APIProvider, 
  Map, 
  Polygon, 
  useMap 
} from '@vis.gl/react-google-maps';
import { ParcelModel } from '../types';
import { Layers } from 'lucide-react';

interface MapComponentProps {
  parcel?: ParcelModel;
  activeScenarioId?: number;
}

// Source: Google Maps Platform Code Assist
const FmbPolygon = ({ parcel }: { parcel: ParcelModel }) => {
  const map = useMap();
  if (!map || !parcel.geometryGeoJson) return null;

  // Assuming GeoJSON Polygon structure for simplicity
  // This needs robust handling in a production app based on actual data
  const coordinates = parcel.geometryGeoJson.geometry.coordinates[0].map(
    ([lng, lat]: [number, number]) => ({ lat, lng })
  );

  return (
    <Polygon
      paths={coordinates}
      strokeColor={'#047857'}
      strokeOpacity={1.0}
      strokeWeight={3}
      fillColor={'#059669'}
      fillOpacity={0.15}
    />
  );
};

export const MapComponent: React.FC<MapComponentProps> = ({ parcel, activeScenarioId }) => {
  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div className="w-full h-full flex items-center justify-center text-rose-600 p-4 text-center">Google Maps API Key Missing. Please configure VITE_GOOGLE_MAPS_API_KEY.</div>;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full relative">
        <Map
          defaultCenter={{ lat: parcel?.centroidCoordinates[1] || 10.9658, lng: parcel?.centroidCoordinates[0] || 76.9024 }}
          defaultZoom={15}
          mapTypeId={mapTypeId}
          mapId="DEMO_MAP_ID"
        >
          {parcel && <FmbPolygon parcel={parcel} />}
        </Map>

        {/* Map Controls HUD */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 p-3 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 text-xs backdrop-blur-xs space-y-2">
          <div className="font-bold flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Map Layers</span>
          </div>
          <select 
            className="w-full text-xs p-1 rounded border border-slate-300"
            onChange={(e) => setMapTypeId(e.target.value)}
            value={mapTypeId}
          >
            <option value="roadmap">Road Map</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </APIProvider>
  );
};
