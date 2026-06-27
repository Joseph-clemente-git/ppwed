import { useState, lazy, Suspense } from 'react';
import { Layers } from 'lucide-react';
import Header from '../components/common/Header';
import GISFilterPanel from '../components/gis/GISFilterPanel';
import AIGISPanel from '../components/gis/AIGISPanel';
import type { LayerState, FilterState } from '../components/gis/GISMapCanvas';

// Lazy-load the map to avoid SSR issues with Leaflet
const GISMapCanvas = lazy(() => import('../components/gis/GISMapCanvas'));

const DEFAULT_LAYERS: LayerState = {
  adminBoundaries:       true,
  projects:              true,
  roads:                 false,
  flood:                 false,
  landslide:             false,
  seismic:               false,
  catchment:             false,
  fundHeatmap:           false,
  accomplishmentHeatmap: false,
  geomismatch:           false,
};

const DEFAULT_FILTERS: FilterState = {
  status: 'all',
  fund:   'all',
  sector: 'all',
};

function MapLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading map…</p>
      </div>
    </div>
  );
}

export default function GISMap() {
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  function handleLayer(key: keyof LayerState, value: boolean) {
    // Heatmaps are mutually exclusive for clarity
    if (key === 'fundHeatmap' && value) {
      setLayers(l => ({ ...l, accomplishmentHeatmap: false, [key]: value }));
      return;
    }
    if (key === 'accomplishmentHeatmap' && value) {
      setLayers(l => ({ ...l, fundHeatmap: false, [key]: value }));
      return;
    }
    setLayers(l => ({ ...l, [key]: value }));
  }

  function handleFilter(key: keyof FilterState, value: string) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        title="GIS Mapping"
        subtitle="Interactive provincial map — projects, hazards, heatmaps & AI spatial analysis"
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 flex flex-col shrink-0 border-r border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Controls</span>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full">
              {activeLayerCount} active
            </span>
          </div>

          {/* Filter panel (scrolls) + AI panel (pinned below) */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <GISFilterPanel
                layers={layers}
                onLayer={handleLayer}
                filters={filters}
                onFilter={handleFilter}
              />
            </div>
            <AIGISPanel />
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          {/* Active layer chips */}
          <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 max-w-xs pointer-events-none">
            {layers.fundHeatmap && (
              <span className="bg-indigo-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">Fund Heatmap</span>
            )}
            {layers.accomplishmentHeatmap && (
              <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">Accomplishment Heatmap</span>
            )}
            {layers.flood && (
              <span className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">Flood Zones</span>
            )}
            {layers.landslide && (
              <span className="bg-amber-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">Landslide</span>
            )}
            {layers.seismic && (
              <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">Seismic</span>
            )}
            {layers.geomismatch && (
              <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">AI Geomismatch</span>
            )}
          </div>

          {/* Project count badge */}
          {selectedProjectId && (
            <div className="absolute bottom-6 right-4 z-[1000] bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-2">
              <p className="text-xs text-slate-600">Selected: <strong className="text-slate-800">{selectedProjectId}</strong></p>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="text-[10px] text-blue-600 hover:underline mt-0.5 block"
              >
                Clear selection
              </button>
            </div>
          )}

          <Suspense fallback={<MapLoader />}>
            <GISMapCanvas
              layers={layers}
              filters={filters}
              onProjectSelect={setSelectedProjectId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
