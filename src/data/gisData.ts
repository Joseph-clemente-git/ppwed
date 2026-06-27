export const municipalityGeo: Record<string, {
  name: string;
  center: [number, number];
  polygon: [number, number][];
  population: number;
}> = {
  'mun-01': {
    name: 'Cabarroguis',
    center: [16.512, 121.556],
    population: 35200,
    polygon: [
      [16.460, 121.483], [16.460, 121.628],
      [16.563, 121.628], [16.563, 121.483],
    ],
  },
  'mun-02': {
    name: 'Diffun',
    center: [16.378, 121.509],
    population: 28500,
    polygon: [
      [16.330, 121.440], [16.330, 121.577],
      [16.428, 121.577], [16.428, 121.440],
    ],
  },
  'mun-03': {
    name: 'Maddela',
    center: [16.289, 121.436],
    population: 52800,
    polygon: [
      [16.185, 121.335], [16.185, 121.537],
      [16.392, 121.537], [16.392, 121.335],
    ],
  },
  'mun-04': {
    name: 'Nagtipunan',
    center: [16.002, 121.484],
    population: 22100,
    polygon: [
      [15.853, 121.378], [15.853, 121.592],
      [16.190, 121.592], [16.190, 121.378],
    ],
  },
  'mun-05': {
    name: 'Aglipay',
    center: [16.630, 121.567],
    population: 32400,
    polygon: [
      [16.563, 121.537], [16.563, 121.668],
      [16.725, 121.668], [16.725, 121.537],
    ],
  },
  'mun-06': {
    name: 'Saguday',
    center: [16.666, 121.530],
    population: 18900,
    polygon: [
      [16.618, 121.448], [16.618, 121.558],
      [16.762, 121.558], [16.762, 121.448],
    ],
  },
  'mun-07': {
    name: 'Dupax del Norte',
    center: [16.290, 121.100],
    population: 24300,
    polygon: [
      [16.227, 121.030], [16.227, 121.178],
      [16.380, 121.178], [16.380, 121.030],
    ],
  },
};

export const projectLocations: Record<string, [number, number]> = {
  'prj-001': [16.451, 121.533],
  'prj-002': [16.292, 121.421],
  'prj-003': [16.015, 121.480],
  'prj-004': [16.623, 121.572],
  'prj-005': [16.672, 121.527],
  'prj-006': [16.388, 121.508],
  'prj-007': [16.287, 121.103],
};

// AI-detected true locations (differ from reported)
export const geomismatchDetectedLocations: Record<string, [number, number]> = {
  'prj-002': [16.265, 121.388],
  'prj-005': [16.651, 121.508],
};

export const roadNetwork = [
  {
    id: 'road-01',
    name: 'Prov. Road — Cabarroguis–Diffun (PRJ-001)',
    type: 'provincial' as const,
    projectId: 'prj-001',
    coordinates: [
      [16.512, 121.556], [16.490, 121.543], [16.465, 121.530],
      [16.430, 121.521], [16.400, 121.513], [16.378, 121.509],
    ] as [number, number][],
  },
  {
    id: 'road-02',
    name: 'National Highway (Quirino Spine Road)',
    type: 'national' as const,
    coordinates: [
      [16.762, 121.510], [16.705, 121.528], [16.666, 121.530],
      [16.620, 121.545], [16.562, 121.556], [16.512, 121.556],
      [16.465, 121.540], [16.378, 121.509], [16.289, 121.436],
      [16.150, 121.450], [16.002, 121.484], [15.870, 121.480],
    ] as [number, number][],
  },
  {
    id: 'road-03',
    name: 'FMR — Diffun Sitio Cabaruan (PRJ-006)',
    type: 'farm-to-market' as const,
    projectId: 'prj-006',
    coordinates: [
      [16.385, 121.505], [16.393, 121.518], [16.400, 121.533], [16.410, 121.547],
    ] as [number, number][],
  },
  {
    id: 'bridge-01',
    name: 'Maddela Cagayan River Bridge',
    type: 'bridge' as const,
    coordinates: [
      [16.278, 121.434], [16.284, 121.438],
    ] as [number, number][],
  },
  {
    id: 'bridge-02',
    name: 'Diffun River Crossing',
    type: 'bridge' as const,
    coordinates: [
      [16.370, 121.503], [16.374, 121.506],
    ] as [number, number][],
  },
];

export const hazardZones = {
  flood: [
    {
      id: 'flood-01',
      name: 'Maddela Flood Plain (Cagayan River Tributary)',
      coordinates: [
        [16.263, 121.407], [16.263, 121.463],
        [16.315, 121.463], [16.315, 121.407],
      ] as [number, number][],
    },
    {
      id: 'flood-02',
      name: 'Nagtipunan River Basin',
      coordinates: [
        [15.975, 121.458], [15.975, 121.513],
        [16.025, 121.513], [16.025, 121.458],
      ] as [number, number][],
    },
    {
      id: 'flood-03',
      name: 'Diffun River Banks',
      coordinates: [
        [16.358, 121.488], [16.358, 121.528],
        [16.395, 121.528], [16.395, 121.488],
      ] as [number, number][],
    },
  ],
  landslide: [
    {
      id: 'ls-01',
      name: 'Maddela Upland Slopes',
      coordinates: [
        [16.315, 121.345], [16.315, 121.385],
        [16.380, 121.385], [16.380, 121.345],
      ] as [number, number][],
    },
    {
      id: 'ls-02',
      name: 'Nagtipunan Eastern Ridge',
      coordinates: [
        [16.015, 121.545], [16.015, 121.575],
        [16.065, 121.575], [16.065, 121.545],
      ] as [number, number][],
    },
    {
      id: 'ls-03',
      name: 'Aglipay Hillside Areas',
      coordinates: [
        [16.595, 121.558], [16.595, 121.590],
        [16.640, 121.590], [16.640, 121.558],
      ] as [number, number][],
    },
  ],
  seismic: [
    {
      id: 'seis-01',
      name: 'Philippine Fault Zone — Eastern Quirino',
      coordinates: [
        [15.880, 121.558], [15.880, 121.595],
        [16.720, 121.595], [16.720, 121.558],
      ] as [number, number][],
    },
  ],
};

export const catchmentZones = [
  {
    id: 'catch-01',
    projectId: 'prj-003',
    name: 'Water Supply Catchment — Nagtipunan',
    center: [16.015, 121.480] as [number, number],
    radiusMeters: 5000,
    beneficiaries: 1200,
    color: '#06b6d4',
  },
  {
    id: 'catch-02',
    projectId: 'prj-007',
    name: 'Health Services Catchment — Dupax del Norte',
    center: [16.287, 121.103] as [number, number],
    radiusMeters: 4000,
    beneficiaries: 3200,
    color: '#10b981',
  },
  {
    id: 'catch-03',
    projectId: 'prj-005',
    name: 'School Catchment — Saguday Central Elem.',
    center: [16.672, 121.527] as [number, number],
    radiusMeters: 3000,
    beneficiaries: 850,
    color: '#8b5cf6',
  },
];

export const heatmapData = [
  { coords: [16.512, 121.556] as [number, number], munId: 'mun-01', name: 'Cabarroguis', totalBudget: 18_500_000, avgAccomplishment: 58 },
  { coords: [16.378, 121.509] as [number, number], munId: 'mun-02', name: 'Diffun',      totalBudget: 9_800_000,  avgAccomplishment: 0  },
  { coords: [16.289, 121.436] as [number, number], munId: 'mun-03', name: 'Maddela',     totalBudget: 6_200_000,  avgAccomplishment: 40 },
  { coords: [16.002, 121.484] as [number, number], munId: 'mun-04', name: 'Nagtipunan',  totalBudget: 4_800_000,  avgAccomplishment: 100 },
  { coords: [16.630, 121.567] as [number, number], munId: 'mun-05', name: 'Aglipay',     totalBudget: 12_000_000, avgAccomplishment: 28 },
  { coords: [16.666, 121.530] as [number, number], munId: 'mun-06', name: 'Saguday',     totalBudget: 3_500_000,  avgAccomplishment: 22 },
  { coords: [16.290, 121.100] as [number, number], munId: 'mun-07', name: 'Dupax del Norte', totalBudget: 2_100_000, avgAccomplishment: 100 },
];

export const maxHeatmapBudget = Math.max(...heatmapData.map(d => d.totalBudget));

export const aiGISFindings = {
  geomismatches: [
    {
      projectId: 'prj-002',
      projectName: 'Multi-Purpose Building — Maddela',
      reportedCoords: [16.292, 121.421] as [number, number],
      detectedCoords: [16.265, 121.388] as [number, number],
      discrepancyKm: 5.2,
      confidence: 94,
    },
    {
      projectId: 'prj-005',
      projectName: 'School Building — Saguday Central Elem.',
      reportedCoords: [16.672, 121.527] as [number, number],
      detectedCoords: [16.651, 121.508] as [number, number],
      discrepancyKm: 3.1,
      confidence: 87,
    },
  ],
  photoFlags: [
    {
      id: 'pf-01',
      projectIds: ['prj-002', 'prj-005'],
      projectNames: ['Multi-Purpose Bldg, Maddela', 'School Bldg, Saguday'],
      description: '2 progress photos share 91% visual similarity — likely recycled images',
      similarity: 91,
      severity: 'high' as const,
    },
    {
      id: 'pf-02',
      projectIds: ['prj-004'],
      projectNames: ['Flood Control, Aglipay River Bank'],
      description: 'Photo EXIF GPS shows capture site 8.3 km from project coordinates',
      similarity: null,
      severity: 'medium' as const,
    },
    {
      id: 'pf-03',
      projectIds: ['prj-002'],
      projectNames: ['Multi-Purpose Bldg, Maddela'],
      description: 'Completion photo timestamp predates reported mobilization date by 14 days',
      similarity: null,
      severity: 'high' as const,
    },
  ],
  equityAnalysis: [
    { munId: 'mun-01', name: 'Cabarroguis',     budgetPerCapita: 12841, projects: 1, population: 35200, totalBudget: 18_500_000 },
    { munId: 'mun-02', name: 'Diffun',           budgetPerCapita: 8561,  projects: 2, population: 28500, totalBudget: 9_800_000  },
    { munId: 'mun-03', name: 'Maddela',          budgetPerCapita: 4163,  projects: 1, population: 52800, totalBudget: 6_200_000  },
    { munId: 'mun-04', name: 'Nagtipunan',       budgetPerCapita: 6697,  projects: 1, population: 22100, totalBudget: 4_800_000  },
    { munId: 'mun-05', name: 'Aglipay',          budgetPerCapita: 11574, projects: 1, population: 32400, totalBudget: 12_000_000 },
    { munId: 'mun-06', name: 'Saguday',          budgetPerCapita: 5556,  projects: 1, population: 18900, totalBudget: 3_500_000  },
    { munId: 'mun-07', name: 'Dupax del Norte',  budgetPerCapita: 3827,  projects: 1, population: 24300, totalBudget: 2_100_000  },
  ],
};
