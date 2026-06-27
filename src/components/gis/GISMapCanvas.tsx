import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Marker, Popup,
} from 'react-leaflet';
import { projects, municipalities } from '../../data/mockData';
import {
  municipalityGeo, projectLocations, roadNetwork, hazardZones, catchmentZones,
  heatmapData, maxHeatmapBudget, geomismatchDetectedLocations,
} from '../../data/gisData';
import type { ProjectStatus } from '../../types';

export interface LayerState {
  adminBoundaries: boolean;
  projects: boolean;
  roads: boolean;
  flood: boolean;
  landslide: boolean;
  seismic: boolean;
  catchment: boolean;
  fundHeatmap: boolean;
  accomplishmentHeatmap: boolean;
  geomismatch: boolean;
}

export interface FilterState {
  status: string;
  fund: string;
  sector: string;
}

interface Props {
  layers: LayerState;
  filters: FilterState;
  onProjectSelect: (id: string) => void;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planned:   '#94a3b8',
  ongoing:   '#3b82f6',
  delayed:   '#f59e0b',
  completed: '#10b981',
  suspended: '#ef4444',
};

function makeProjectIcon(status: ProjectStatus, ghost: boolean) {
  const color = STATUS_COLORS[status];
  const glow = ghost
    ? `box-shadow:0 0 0 3px rgba(139,92,246,0.5),0 2px 6px rgba(0,0,0,0.4)`
    : `box-shadow:0 2px 6px rgba(0,0,0,0.4)`;
  return L.divIcon({
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;${glow}"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function makeMismatchIcon() {
  return L.divIcon({
    html: `<div style="background:#ef4444;width:13px;height:13px;border-radius:50%;border:2px solid white;opacity:0.85;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [13, 13],
    iconAnchor: [6, 6],
    popupAnchor: [0, -9],
  });
}

function heatColor(ratio: number, type: 'fund' | 'acc'): string {
  if (type === 'fund') {
    const r = Math.round(59  + ratio * 96);
    const g = Math.round(130 - ratio * 80);
    const b = Math.round(246 - ratio * 180);
    return `rgb(${r},${g},${b})`;
  }
  // accomplishment: red → amber → green
  if (ratio < 0.5) {
    return `rgb(${Math.round(239 - ratio * 40)},${Math.round(ratio * 2 * 140)},50)`;
  }
  return `rgb(${Math.round(220 - (ratio - 0.5) * 2 * 200)},${Math.round(140 + (ratio - 0.5) * 2 * 35)},50)`;
}

const ROAD_STYLE: Record<string, { color: string; weight: number; dash?: string }> = {
  national:       { color: '#1e293b', weight: 3 },
  provincial:     { color: '#6366f1', weight: 2 },
  'farm-to-market': { color: '#a16207', weight: 2, dash: '6 4' },
  bridge:         { color: '#78350f', weight: 5 },
};

export default function GISMapCanvas({ layers, filters, onProjectSelect }: Props) {
  const munMap = Object.fromEntries(municipalities.map(m => [m.id, m.name]));

  const filtered = projects.filter(p => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.fund   !== 'all' && p.fundSource !== filters.fund) return false;
    if (filters.sector !== 'all' && p.sector !== filters.sector) return false;
    return true;
  });

  return (
    <MapContainer
      center={[16.30, 121.45]}
      zoom={9}
      style={{ height: '100%', width: '100%' }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={18}
      />

      {/* Admin Boundaries */}
      {layers.adminBoundaries && Object.entries(municipalityGeo).map(([id, geo]) => (
        <Polygon
          key={id}
          positions={geo.polygon}
          pathOptions={{ color: '#3b82f6', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.04 }}
        >
          <Popup>
            <div style={{ fontSize: 12, minWidth: 140 }}>
              <strong style={{ color: '#1e293b' }}>{geo.name}</strong>
              <p style={{ color: '#64748b', margin: '3px 0 0' }}>Population: {geo.population.toLocaleString()}</p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Road & Bridge Network */}
      {layers.roads && roadNetwork.map(road => {
        const s = ROAD_STYLE[road.type] ?? ROAD_STYLE.provincial;
        return (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{ color: s.color, weight: s.weight, dashArray: s.dash }}
          >
            <Popup>
              <div style={{ fontSize: 12 }}>
                <strong>{road.name}</strong>
                <p style={{ color: '#64748b', margin: '2px 0 0', textTransform: 'capitalize' }}>{road.type.replace('-', ' ')} road</p>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Flood Hazard Overlay */}
      {layers.flood && hazardZones.flood.map(z => (
        <Polygon
          key={z.id}
          positions={z.coordinates}
          pathOptions={{ color: '#1d4ed8', weight: 1.5, fillColor: '#93c5fd', fillOpacity: 0.40 }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong style={{ color: '#1d4ed8' }}>Flood Hazard Zone</strong>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>{z.name}</p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Landslide Hazard Overlay */}
      {layers.landslide && hazardZones.landslide.map(z => (
        <Polygon
          key={z.id}
          positions={z.coordinates}
          pathOptions={{ color: '#b45309', weight: 1.5, fillColor: '#fcd34d', fillOpacity: 0.40 }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong style={{ color: '#b45309' }}>Landslide Hazard Zone</strong>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>{z.name}</p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Seismic / Fault Zone Overlay */}
      {layers.seismic && hazardZones.seismic.map(z => (
        <Polygon
          key={z.id}
          positions={z.coordinates}
          pathOptions={{ color: '#b91c1c', weight: 1.5, fillColor: '#fca5a5', fillOpacity: 0.25, dashArray: '5 4' }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong style={{ color: '#b91c1c' }}>Seismic / Fault Zone</strong>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>{z.name}</p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* Beneficiary Catchment Zones */}
      {layers.catchment && catchmentZones.map(c => (
        <CircleMarker
          key={c.id}
          center={c.center}
          radius={c.radiusMeters / 500}
          pathOptions={{ color: c.color, weight: 1.5, fillColor: c.color, fillOpacity: 0.13, dashArray: '5 4' }}
        >
          <Popup>
            <div style={{ fontSize: 12 }}>
              <strong style={{ color: '#0f172a' }}>{c.name}</strong>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>Beneficiaries: {c.beneficiaries.toLocaleString()}</p>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>Radius: ~{(c.radiusMeters / 1000).toFixed(0)} km</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Fund Density Heatmap */}
      {layers.fundHeatmap && heatmapData.map((pt, i) => {
        const ratio = pt.totalBudget / maxHeatmapBudget;
        return (
          <CircleMarker
            key={`fund-${i}`}
            center={pt.coords}
            radius={Math.round(ratio * 45 + 18)}
            pathOptions={{ color: 'transparent', fillColor: heatColor(ratio, 'fund'), fillOpacity: 0.52 }}
          >
            <Popup>
              <div style={{ fontSize: 12 }}>
                <strong>{pt.name}</strong>
                <p style={{ color: '#64748b', margin: '2px 0 0' }}>
                  Total Budget: ₱{(pt.totalBudget / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Accomplishment Rate Heatmap */}
      {layers.accomplishmentHeatmap && heatmapData.map((pt, i) => {
        const ratio = pt.avgAccomplishment / 100;
        return (
          <CircleMarker
            key={`acc-${i}`}
            center={pt.coords}
            radius={30}
            pathOptions={{ color: 'transparent', fillColor: heatColor(ratio, 'acc'), fillOpacity: 0.55 }}
          >
            <Popup>
              <div style={{ fontSize: 12 }}>
                <strong>{pt.name}</strong>
                <p style={{ color: '#64748b', margin: '2px 0 0' }}>
                  Avg. Accomplishment: {pt.avgAccomplishment}%
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* AI Geotag Mismatch — detected (true) locations */}
      {layers.geomismatch && Object.entries(geomismatchDetectedLocations).map(([pid, coords]) => (
        <Marker
          key={`mismatch-${pid}`}
          position={coords}
          icon={makeMismatchIcon()}
        >
          <Popup>
            <div style={{ fontSize: 12, minWidth: 160 }}>
              <strong style={{ color: '#dc2626' }}>AI-Detected Location</strong>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>Discrepancy from submitted coordinates</p>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>Project: {pid}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Project Pins */}
      {layers.projects && filtered.map(project => {
        const loc = projectLocations[project.id];
        if (!loc) return null;
        const munName = munMap[project.municipalityId] ?? '';
        return (
          <Marker
            key={project.id}
            position={loc}
            icon={makeProjectIcon(project.status, project.isGhostFlagged)}
            eventHandlers={{ click: () => onProjectSelect(project.id) }}
          >
            <Popup>
              <div style={{ fontSize: 12, minWidth: 200 }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: 4, lineHeight: 1.3 }}>{project.name}</strong>
                <p style={{ color: '#64748b', margin: '2px 0' }}>Municipality: {munName}</p>
                <p style={{ color: '#64748b', margin: '2px 0' }}>Fund: {project.fundSource}</p>
                <p style={{ color: '#64748b', margin: '2px 0' }}>
                  Contract: ₱{(project.contractAmount / 1_000_000).toFixed(2)}M
                </p>
                <p style={{ color: '#64748b', margin: '2px 0' }}>
                  Progress: {project.actualProgress}% actual / {project.plannedProgress}% planned
                </p>
                <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                  <span style={{
                    background: STATUS_COLORS[project.status] + '25',
                    color: STATUS_COLORS[project.status],
                    fontSize: 10, fontWeight: 600,
                    padding: '2px 6px', borderRadius: 10,
                  }}>
                    {project.status.toUpperCase()}
                  </span>
                  {project.isGhostFlagged && (
                    <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10 }}>
                      GHOST-FLAGGED
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
