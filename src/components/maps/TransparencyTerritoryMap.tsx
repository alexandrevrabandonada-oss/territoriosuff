import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type TerritoryMapItem = {
  name: string;
  count: number;
  coordinates: [number, number];
};

export function TransparencyTerritoryMap({
  territories
}: {
  territories: TerritoryMapItem[];
}) {
  const maxCount = Math.max(1, ...territories.map((item) => item.count));

  return (
    <MapContainer center={[-22.5155, -44.104]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {territories.map((territory) => (
        <CircleMarker
          key={territory.name}
          center={territory.coordinates}
          radius={8 + (territory.count / maxCount) * 18}
          pathOptions={{
            color: "#0f172a",
            weight: 1.5,
            fillColor: "#10b981",
            fillOpacity: 0.68
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-sm font-black text-slate-950">{territory.name}</p>
              <p className="mt-1 text-sm text-slate-600">{territory.count} registro(s) publicados</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
