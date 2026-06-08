import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { SENSITIVE_FACILITIES, Facility } from '../../data/social/sensitive-facilities';

// Create a custom styled marker icon for facilities
function getFacilityIcon(type: Facility['type']) {
  let color = '#3B82F6'; // Blue default
  let symbol = '🏠';

  if (type === 'Creche') {
    color = '#F59E0B'; // Amber
    symbol = '🧸';
  } else if (type === 'Escola') {
    color = '#D97706'; // Dark Amber
    symbol = '✏️';
  } else if (type === 'UBS') {
    color = '#10B981'; // Emerald
    symbol = '🩺';
  } else if (type === 'UPA') {
    color = '#EF4444'; // Red
    symbol = '🚨';
  } else if (type === 'Hospital') {
    color = '#DC2626'; // Deep Red
    symbol = '🏥';
  } else if (type === 'CRAS') {
    color = '#8B5CF6'; // Purple
    symbol = '🤝';
  }

  return new L.DivIcon({
    html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 3px 6px rgba(0,0,0,0.3);" title="${type}">
             <span>${symbol}</span>
           </div>`,
    className: 'facility-marker-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

interface SensitiveFacilitiesLayerProps {
  visible: boolean;
  selectedTypes: Facility['type'][];
}

export function SensitiveFacilitiesLayer({ visible, selectedTypes }: SensitiveFacilitiesLayerProps) {
  if (!visible) return null;

  const filteredFacilities = SENSITIVE_FACILITIES.filter(facility => {
    return selectedTypes.includes(facility.type);
  });

  return (
    <>
      {filteredFacilities.map((facility, idx) => (
        <Marker
          key={idx}
          position={[facility.lat, facility.lng]}
          icon={getFacilityIcon(facility.type)}
        >
          <Popup>
            <div className="text-slate-900 p-1 font-sans">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                {facility.type}
              </span>
              <h4 className="font-extrabold text-sm text-slate-800 leading-tight mt-0.5">{facility.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Bairro: {facility.bairro}</p>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] mt-3 pt-2 border-t border-slate-100 font-mono">
                <span>Distância CSN:</span>
                <span className="font-bold text-right">{facility.distanceToIndustrialAreaM}m</span>
                
                <span>Estação Próxima:</span>
                <span className="font-bold text-right text-indigo-600">{facility.nearestAirStation}</span>
              </div>

              <div className="mt-2.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-500 leading-normal">
                Nota: Equipamento que atende população de sensibilidade biológica relevante (crianças, idosos, enfermos).
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
