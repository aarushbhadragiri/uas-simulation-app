import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Line } from 'recharts';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { simulationData } from './simulationData.js';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Landing page
import { LandingPage } from '@/components/LandingPage';
import { ScrollProgress } from '@/components/scroll-progress';

// Animation components
import { FadeIn, StaggerChildren, ScaleOnHover } from '@/components/ui/animated';

// Lucide icons
import { BarChart3, Database, Map, Cloud, Shield, Layers, Plane, DollarSign, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Info, Sun, Moon, Play, Settings, Zap, Wind, Battery, Package, Gauge, Clock, AlertCircle, Home, Monitor, Download, FileJson, FileSpreadsheet } from 'lucide-react';

// Hummingbird Logo Component
function HummingbirdLogo({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <path d="M48 32 A13 13 0 1 1 48 58 L48 32"/>
        <path d="M61 40 L98 36 L61 50 Z"/>
        <path d="M55 50 L78 80 L25 65 Z"/>
        <path d="M25 65 L8 85 L18 58 Z"/>
      </g>
    </svg>
  );
}

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ============================================
// DATA - Updated for 5400 simulations across 5 cities
// ============================================
const planningData = [
  { name: 'Baseline', efficiency: 92.3, violations: 0.24, cost: 185.42, success: 87.2, reroutes: 0.58 },
  { name: 'GIS Basic', efficiency: 91.8, violations: 0.08, cost: 178.91, success: 89.4, reroutes: 0.72 },
  { name: 'GIS Enhanced', efficiency: 95.1, violations: 0.05, cost: 152.38, success: 91.8, reroutes: 0.31 }
];

const weatherData = [
  { condition: 'Clear', abortRate: 0, energyFactor: 1.0, count: 612 },
  { condition: 'Light Wind', abortRate: 0, energyFactor: 1.08, count: 598 },
  { condition: 'Moderate Wind', abortRate: 2, energyFactor: 1.20, count: 605 },
  { condition: 'Heavy Wind', abortRate: 15, energyFactor: 1.45, count: 589 },
  { condition: 'Light Rain', abortRate: 1, energyFactor: 1.10, count: 621 },
  { condition: 'Heavy Rain', abortRate: 20, energyFactor: 1.30, count: 594 },
  { condition: 'Thunderstorm', abortRate: 95, energyFactor: 1.50, count: 608 },
  { condition: 'Extreme Heat', abortRate: 5, energyFactor: 1.25, count: 587 },
  { condition: 'Extreme Cold', abortRate: 8, energyFactor: 1.35, count: 586 }
];

const gisLayers = [
  { layer: 'Terrain Elevation', gain: 3.2 },
  { layer: 'Building Footprints', gain: 5.4 },
  { layer: 'Weather (Current)', gain: 8.1 },
  { layer: 'Weather (1h)', gain: 11.8 },
  { layer: 'Weather (3h)', gain: 14.6 },
  { layer: 'Privacy Zones', gain: 6.3 },
  { layer: 'TFR Real-time', gain: 7.2 },
  { layer: 'Traffic Real-time', gain: 4.5 }
];

const droneRadarData = [
  { metric: 'Energy Eff.', M350: 75, Mavic3E: 95, FC30: 25, SkydioX10: 88, EVOMax: 82, ANAFI: 90 },
  { metric: 'Speed', M350: 75, Mavic3E: 75, FC30: 100, SkydioX10: 80, EVOMax: 80, ANAFI: 70 },
  { metric: 'Wind Resist.', M350: 100, Mavic3E: 80, FC30: 80, SkydioX10: 87, EVOMax: 80, ANAFI: 93 },
  { metric: 'Sensors', M350: 95, Mavic3E: 90, FC30: 97, SkydioX10: 98, EVOMax: 92, ANAFI: 88 },
  { metric: 'Payload', M350: 27, Mavic3E: 2, FC30: 100, SkydioX10: 5, EVOMax: 8, ANAFI: 3 },
  { metric: 'Endurance', M350: 98, Mavic3E: 80, FC30: 50, SkydioX10: 71, EVOMax: 75, ANAFI: 57 }
];

const costBreakdown = [
  { name: 'Energy', value: 30, color: 'hsl(25 5% 45%)' },    /* Stone gray */
  { name: 'Time', value: 25, color: 'hsl(25 8% 60%)' },      /* Light stone */
  { name: 'Risk', value: 25, color: 'hsl(0 0% 20%)' },       /* Near black */
  { name: 'Privacy', value: 20, color: 'hsl(25 4% 30%)' }    /* Dark stone */
];

const seasonalData = [
  { season: 'Spring', wildlife: 7.8, obstacles: 1.15, efficiency: 92.4 },
  { season: 'Summer', wildlife: 4.2, obstacles: 0.85, efficiency: 93.8 },
  { season: 'Fall', wildlife: 9.6, obstacles: 1.32, efficiency: 91.9 },
  { season: 'Winter', wildlife: 3.1, obstacles: 0.72, efficiency: 94.2 }
];

const freshnessData = [
  { freshness: 'New (<30d)', reroutes: 0.21, efficiency: 96.2, gisGain: 42 },
  { freshness: 'Recent (30-90d)', reroutes: 0.68, efficiency: 94.8, gisGain: 35 },
  { freshness: 'Old (>90d)', reroutes: 1.24, efficiency: 92.1, gisGain: 26 }
];

const cityData = [
  { city: 'Dallas', trials: 1080, success: 89.8, efficiency: 93.4, avgCost: 168.2 },
  { city: 'New York', trials: 1080, success: 86.4, efficiency: 91.2, avgCost: 182.5 },
  { city: 'San Francisco', trials: 1080, success: 87.9, efficiency: 92.1, avgCost: 175.8 },
  { city: 'Chicago', trials: 1080, success: 85.2, efficiency: 90.8, avgCost: 186.3 },
  { city: 'Los Angeles', trials: 1080, success: 88.5, efficiency: 92.8, avgCost: 171.4 }
];

// ============================================
// CITY-SPECIFIC PRIVACY ZONES & ALTITUDE RESTRICTIONS
// ============================================
const CITY_PRIVACY_ZONES = {
  dallas: {
    name: 'Dallas, TX',
    maxAltitude: 400, // feet AGL (standard FAA limit)
    zones: [
      { type: 'Schools', sensitivity: 100, buffer: 300, hours: '7am - 6pm', count: 847 },
      { type: 'Hospitals', sensitivity: 95, buffer: 400, hours: '24/7', count: 42 },
      { type: 'Residential (Premium)', sensitivity: 95, buffer: 100, hours: '6am - 10pm', count: 156 },
      { type: 'Residential (Standard)', sensitivity: 75, buffer: 100, hours: '6am - 10pm', count: 2341 },
      { type: 'Parks', sensitivity: 60, buffer: 50, hours: '6am - 9pm', count: 382 },
      { type: 'Government Buildings', sensitivity: 90, buffer: 500, hours: '24/7', count: 28 }
    ],
    altitudeRestrictions: [
      { area: 'Downtown Core', maxAlt: 400, reason: 'Standard airspace' },
      { area: 'DFW Airport Vicinity', maxAlt: 200, reason: 'Class B airspace' },
      { area: 'Love Field Area', maxAlt: 300, reason: 'Class D airspace' }
    ]
  },
  new_york: {
    name: 'New York, NY',
    maxAltitude: 200, // Heavily restricted due to skyscrapers
    zones: [
      { type: 'Schools', sensitivity: 100, buffer: 400, hours: '6am - 8pm', count: 1842 },
      { type: 'Hospitals', sensitivity: 100, buffer: 500, hours: '24/7', count: 78 },
      { type: 'Residential (High-Rise)', sensitivity: 98, buffer: 150, hours: '24/7', count: 4521 },
      { type: 'Residential (Standard)', sensitivity: 85, buffer: 100, hours: '6am - 10pm', count: 8934 },
      { type: 'Parks (Central Park)', sensitivity: 80, buffer: 100, hours: '6am - 10pm', count: 1 },
      { type: 'Parks (Other)', sensitivity: 65, buffer: 50, hours: '6am - 9pm', count: 1700 },
      { type: 'Government/Landmarks', sensitivity: 100, buffer: 1000, hours: '24/7', count: 156 },
      { type: 'Heliports', sensitivity: 100, buffer: 800, hours: '24/7', count: 8 }
    ],
    altitudeRestrictions: [
      { area: 'Manhattan (Below 14th St)', maxAlt: 200, reason: 'Dense skyscraper zone' },
      { area: 'Midtown (14th-59th)', maxAlt: 150, reason: 'Empire State, Chrysler buildings - extreme restriction' },
      { area: 'Hudson Yards', maxAlt: 100, reason: 'New supertall cluster - severe restriction' },
      { area: 'Financial District', maxAlt: 150, reason: 'One WTC vicinity - security zone' },
      { area: 'Upper Manhattan', maxAlt: 250, reason: 'Moderate building heights' },
      { area: 'JFK/LGA Approach', maxAlt: 0, reason: 'No-fly zone - Class B airspace' },
      { area: 'Brooklyn Heights', maxAlt: 300, reason: 'Mixed residential/commercial' },
      { area: 'Outer Boroughs', maxAlt: 350, reason: 'Residential areas' }
    ]
  },
  san_francisco: {
    name: 'San Francisco, CA',
    maxAltitude: 300,
    zones: [
      { type: 'Schools', sensitivity: 100, buffer: 350, hours: '7am - 7pm', count: 412 },
      { type: 'Hospitals', sensitivity: 95, buffer: 450, hours: '24/7', count: 24 },
      { type: 'Residential (Pacific Heights)', sensitivity: 98, buffer: 150, hours: '24/7', count: 892 },
      { type: 'Residential (Standard)', sensitivity: 80, buffer: 100, hours: '6am - 10pm', count: 3421 },
      { type: 'Parks (Golden Gate)', sensitivity: 70, buffer: 100, hours: '6am - 8pm', count: 1 },
      { type: 'Tech Campuses', sensitivity: 85, buffer: 200, hours: '24/7', count: 34 },
      { type: 'Port/Waterfront', sensitivity: 60, buffer: 100, hours: '24/7', count: 12 }
    ],
    altitudeRestrictions: [
      { area: 'Financial District', maxAlt: 200, reason: 'Salesforce Tower area' },
      { area: 'SFO Approach Corridor', maxAlt: 100, reason: 'Class B airspace' },
      { area: 'Downtown/SOMA', maxAlt: 250, reason: 'Mixed high-rise zone' },
      { area: 'Residential Hills', maxAlt: 350, reason: 'Terrain considerations' },
      { area: 'Golden Gate Bridge', maxAlt: 200, reason: 'Landmark protection' }
    ]
  },
  chicago: {
    name: 'Chicago, IL',
    maxAltitude: 300,
    zones: [
      { type: 'Schools', sensitivity: 100, buffer: 350, hours: '7am - 6pm', count: 892 },
      { type: 'Hospitals', sensitivity: 95, buffer: 400, hours: '24/7', count: 56 },
      { type: 'Residential (Gold Coast)', sensitivity: 95, buffer: 125, hours: '24/7', count: 1234 },
      { type: 'Residential (Standard)', sensitivity: 78, buffer: 100, hours: '6am - 10pm', count: 5678 },
      { type: 'Parks (Millennium)', sensitivity: 75, buffer: 75, hours: '6am - 11pm', count: 1 },
      { type: 'Parks (Other)', sensitivity: 60, buffer: 50, hours: '6am - 9pm', count: 580 },
      { type: 'Lakefront', sensitivity: 50, buffer: 50, hours: '6am - 10pm', count: 26 }
    ],
    altitudeRestrictions: [
      { area: 'Loop/Downtown', maxAlt: 200, reason: 'Willis Tower, Hancock area' },
      { area: 'Streeterville', maxAlt: 250, reason: 'High-rise residential' },
      { area: "O'Hare Approach", maxAlt: 0, reason: 'No-fly zone - busiest airport' },
      { area: 'Midway Area', maxAlt: 150, reason: 'Class C airspace' },
      { area: 'North Side', maxAlt: 350, reason: 'Residential areas' },
      { area: 'South Side', maxAlt: 400, reason: 'Standard limit' }
    ]
  },
  los_angeles: {
    name: 'Los Angeles, CA',
    maxAltitude: 350,
    zones: [
      { type: 'Schools', sensitivity: 100, buffer: 300, hours: '7am - 6pm', count: 1456 },
      { type: 'Hospitals', sensitivity: 95, buffer: 400, hours: '24/7', count: 89 },
      { type: 'Residential (Beverly Hills)', sensitivity: 98, buffer: 200, hours: '24/7', count: 2341 },
      { type: 'Residential (Hollywood Hills)', sensitivity: 95, buffer: 150, hours: '24/7', count: 1892 },
      { type: 'Residential (Standard)', sensitivity: 75, buffer: 100, hours: '6am - 10pm', count: 12456 },
      { type: 'Studios/Lots', sensitivity: 90, buffer: 500, hours: '24/7', count: 28 },
      { type: 'Parks/Beaches', sensitivity: 55, buffer: 50, hours: '6am - 9pm', count: 467 },
      { type: 'Airports (LAX vicinity)', sensitivity: 100, buffer: 1500, hours: '24/7', count: 1 }
    ],
    altitudeRestrictions: [
      { area: 'Downtown LA', maxAlt: 300, reason: 'Wilshire Grand area' },
      { area: 'Century City', maxAlt: 300, reason: 'High-rise cluster' },
      { area: 'LAX 5-mile radius', maxAlt: 0, reason: 'No-fly zone' },
      { area: 'Burbank Airport', maxAlt: 200, reason: 'Class C airspace' },
      { area: 'Santa Monica Airport', maxAlt: 250, reason: 'Class D airspace' },
      { area: 'Hollywood/Beverly Hills', maxAlt: 350, reason: 'Privacy-sensitive' },
      { area: 'Beach Communities', maxAlt: 400, reason: 'Standard limit' }
    ]
  }
};

// ============================================
// SIMULATION CONFIGURATION DATA
// ============================================

const DRONE_PRESETS = [
  {
    id: 'custom',
    name: 'Custom Configuration',
    manufacturer: '-',
    specs: { maxSpeed: 15, energyPerKm: 50, payload: 1.0, windResistance: 12, flightTime: 30, sensorFidelity: 90 }
  },
  {
    id: 'm350_rtk',
    name: 'DJI Matrice 350 RTK',
    manufacturer: 'DJI',
    specs: { maxSpeed: 15, energyPerKm: 43.3, payload: 2.7, windResistance: 15, flightTime: 55, sensorFidelity: 95 }
  },
  {
    id: 'mavic_3e',
    name: 'DJI Mavic 3 Enterprise',
    manufacturer: 'DJI',
    specs: { maxSpeed: 15, energyPerKm: 5.67, payload: 0.2, windResistance: 12, flightTime: 45, sensorFidelity: 90 }
  },
  {
    id: 'flycart_30',
    name: 'DJI FlyCart 30',
    manufacturer: 'DJI',
    specs: { maxSpeed: 20, energyPerKm: 275, payload: 30, windResistance: 12, flightTime: 28, sensorFidelity: 97 }
  },
  {
    id: 'skydio_x10',
    name: 'Skydio X10',
    manufacturer: 'Skydio',
    specs: { maxSpeed: 16, energyPerKm: 12.5, payload: 0.5, windResistance: 13, flightTime: 40, sensorFidelity: 98 }
  },
  {
    id: 'autel_evo_max',
    name: 'Autel EVO Max 4T',
    manufacturer: 'Autel',
    specs: { maxSpeed: 16, energyPerKm: 15.2, payload: 0.8, windResistance: 12, flightTime: 42, sensorFidelity: 92 }
  },
  {
    id: 'parrot_anafi',
    name: 'Parrot ANAFI Ai',
    manufacturer: 'Parrot',
    specs: { maxSpeed: 14, energyPerKm: 8.5, payload: 0.3, windResistance: 14, flightTime: 32, sensorFidelity: 88 }
  },
  {
    id: 'wingtra_one',
    name: 'WingtraOne GEN II',
    manufacturer: 'Wingtra',
    specs: { maxSpeed: 18, energyPerKm: 22.0, payload: 0.8, windResistance: 14, flightTime: 59, sensorFidelity: 94 }
  },
  {
    id: 'freefly_alta_x',
    name: 'Freefly Alta X',
    manufacturer: 'Freefly',
    specs: { maxSpeed: 13, energyPerKm: 85.0, payload: 15.9, windResistance: 11, flightTime: 50, sensorFidelity: 85 }
  }
];

const CITY_PRESETS = [
  { id: 'dallas', name: 'Dallas, TX', lat: 32.7767, lng: -96.7970, avgTemp: 19, windPattern: 'moderate', airspaceComplexity: 'medium' },
  { id: 'new_york', name: 'New York, NY', lat: 40.7128, lng: -74.0060, avgTemp: 12, windPattern: 'variable', airspaceComplexity: 'very_high' },
  { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, avgTemp: 10, windPattern: 'high', airspaceComplexity: 'high' },
  { id: 'los_angeles', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, avgTemp: 18, windPattern: 'low', airspaceComplexity: 'high' },
  { id: 'houston', name: 'Houston, TX', lat: 29.7604, lng: -95.3698, avgTemp: 21, windPattern: 'moderate', airspaceComplexity: 'medium' },
  { id: 'phoenix', name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, avgTemp: 24, windPattern: 'low', airspaceComplexity: 'low' },
  { id: 'denver', name: 'Denver, CO', lat: 39.7392, lng: -104.9903, avgTemp: 11, windPattern: 'variable', airspaceComplexity: 'medium' },
  { id: 'seattle', name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, avgTemp: 11, windPattern: 'moderate', airspaceComplexity: 'medium' },
  { id: 'miami', name: 'Miami, FL', lat: 25.7617, lng: -80.1918, avgTemp: 25, windPattern: 'moderate', airspaceComplexity: 'high' },
  { id: 'boston', name: 'Boston, MA', lat: 42.3601, lng: -71.0589, avgTemp: 11, windPattern: 'variable', airspaceComplexity: 'high' },
  { id: 'san_francisco', name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, avgTemp: 14, windPattern: 'high', airspaceComplexity: 'high' },
  { id: 'atlanta', name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880, avgTemp: 17, windPattern: 'moderate', airspaceComplexity: 'very_high' }
];

const PLANNING_MODES = [
  { id: 'baseline', name: 'Baseline', description: 'Direct point-to-point routing without GIS optimization' },
  { id: 'gis_basic', name: 'GIS Basic', description: 'Basic terrain and obstacle avoidance' },
  { id: 'gis_enhanced', name: 'GIS Enhanced', description: 'Full GIS integration with weather, privacy zones, and real-time data' }
];

const WEATHER_PROFILES = [
  { id: 'clear', name: 'Clear Skies', abortChance: 0, energyMultiplier: 1.0 },
  { id: 'mixed', name: 'Mixed Conditions', abortChance: 5, energyMultiplier: 1.15 },
  { id: 'challenging', name: 'Challenging Weather', abortChance: 15, energyMultiplier: 1.3 },
  { id: 'realistic', name: 'Realistic Distribution', abortChance: 8, energyMultiplier: 1.2 }
];

// ============================================
// HELPER COMPONENTS
// ============================================

// Descriptions for stat cards
const statDescriptions = {
  'Avg Flight Time': 'Average duration of 5,400 simulated flights across 5 cities, all weather conditions, and 6 drone types.',
  'Avg Energy': 'Mean energy consumption in Watt-hours, factoring in weather conditions and route efficiency across all platforms.',
  'Path Efficiency': 'Ratio of straight-line distance to actual flight path, indicating route optimization across all cities.',
  'Privacy Violations': 'Average number of privacy zone infractions per flight across all planning modes and cities.',
  'Avg Cost Score': 'Weighted cost combining energy, time, risk, and privacy factors across the full dataset.',
  'Baseline Violations': 'Privacy zone violations using baseline planning without GIS data.',
  'GIS-Enhanced Violations': 'Privacy zone violations with full GIS-enhanced route planning.',
  'Reduction': 'Percentage decrease in privacy violations using GIS-enhanced planning.',
  'Cost Reduction (GIS-Enhanced)': '17.8% lower operational costs compared to baseline planning across 5 cities.',
  'Privacy Violation Reduction': 'GIS-enhanced planning reduces privacy zone violations by 79% across all test cities.',
  'Thunderstorm Abort Rate': '95% of flights abort during thunderstorm conditions for safety.',
  'Reroute Increase (Old Maps)': 'Using outdated map data (>90 days) increases rerouting by 490%.',
};

function StatCard({ value, label, className = '' }) {
  const description = statDescriptions[label];

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className={`cursor-pointer transition-colors hover:bg-accent/50 ${className}`}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      {description && (
        <HoverCardContent className="w-72">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateFlightPath(origin, dest, efficiency, reroutes, cityId = null) {
  const path = [origin];
  // Significantly more waypoints for more visible path planning changes
  const baseWaypoints = 12;  // Increased from 3
  const rerouteWaypoints = Math.floor(reroutes * 4);  // More impact from reroutes
  const numWaypoints = baseWaypoints + rerouteWaypoints;

  // Get city-specific altitude restrictions for path planning
  const cityRestrictions = cityId ? CITY_PRIVACY_ZONES[cityId]?.altitudeRestrictions : null;
  const hasSkyscraperZone = cityRestrictions?.some(r => r.maxAlt <= 200);

  for (let i = 1; i <= numWaypoints; i++) {
    const t = i / (numWaypoints + 1);
    const lat = origin[0] + (dest[0] - origin[0]) * t;
    const lng = origin[1] + (dest[1] - origin[1]) * t;

    // Higher deviation for lower efficiency (more path planning visible)
    let deviation = (100 - efficiency) / 100 * 0.012;  // Increased from 0.005

    // Add extra deviation for skyscraper zones (simulating building avoidance)
    if (hasSkyscraperZone && Math.random() < 0.3) {
      deviation *= 1.5;
    }

    // Add periodic larger deviations to simulate privacy zone avoidance
    if (i % 3 === 0 && reroutes > 0) {
      deviation *= 2;
    }

    path.push([
      lat + (Math.random() - 0.5) * deviation,
      lng + (Math.random() - 0.5) * deviation
    ]);
  }
  path.push(dest);
  return path;
}

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getOutcomeColor(outcome) {
  // Stone/black themed outcome colors
  const colors = {
    success: 'hsl(25 8% 60%)',    // Light stone
    rerouted: 'hsl(30 15% 40%)',  // Warm dark
    delayed: 'hsl(25 5% 45%)',    // Stone gray
    aborted: 'hsl(0 0% 20%)'      // Near black
  };
  return colors[outcome] || 'hsl(var(--muted-foreground))';
}

function getOutcomeVariant(outcome) {
  const variants = { success: 'success', rerouted: 'warning', delayed: 'info', aborted: 'error' };
  return variants[outcome] || 'secondary';
}

// ============================================
// MAP COMPONENTS
// ============================================

function MapBounds({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  return null;
}

function FlightMap({ selectedFlight, isDarkMode }) {
  if (!selectedFlight) {
    return (
      <div className="h-96 rounded-lg flex items-center justify-center border-2 border-dashed border-border bg-muted/50">
        <div className="text-center text-muted-foreground">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a flight from the table below to view its path</p>
        </div>
      </div>
    );
  }

  const origin = [selectedFlight.originLat, selectedFlight.originLng];
  const dest = [selectedFlight.destinationLat, selectedFlight.destinationLng];
  const path = generateFlightPath(origin, dest, selectedFlight.pathEfficiency, selectedFlight.reroutes, selectedFlight.cityId);
  const bounds = L.latLngBounds([origin, dest]);

  // Select tile layer based on theme
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={[(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2]}
      zoom={13}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url={tileUrl}
        key={isDarkMode ? 'dark' : 'light'}
      />
      <MapBounds bounds={bounds} />
      <Polyline
        positions={path}
        color={getOutcomeColor(selectedFlight.missionOutcome)}
        weight={4}
        opacity={0.8}
        {...(selectedFlight.missionOutcome === 'aborted' ? { dashArray: '10, 10' } : {})}
      />
      <Marker position={origin} icon={originIcon}>
        <Popup><strong>Origin</strong><br/>Lat: {origin[0].toFixed(4)}<br/>Lng: {origin[1].toFixed(4)}</Popup>
      </Marker>
      <Marker position={dest} icon={destIcon}>
        <Popup><strong>Destination</strong><br/>Lat: {dest[0].toFixed(4)}<br/>Lng: {dest[1].toFixed(4)}</Popup>
      </Marker>
    </MapContainer>
  );
}

// ============================================
// DATA TABLE COMPONENT
// ============================================

function DataTableComponent({ data, selectedId, onSelectFlight, filters, onFilterChange, searchQuery, onSearchChange }) {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          row.id?.toString(),
          row.droneShortName,
          row.droneModel,
          row.planningMode,
          row.weatherCondition,
          row.missionOutcome,
          row.environment,
          row.season
        ];
        const matchesSearch = searchableFields.some(field =>
          field?.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }
      // Apply dropdown filters
      if (filters.city && row.city !== filters.city) return false;
      if (filters.drone && row.droneShortName !== filters.drone) return false;
      if (filters.planning && row.planningMode !== filters.planning) return false;
      if (filters.weather && row.weatherCondition !== filters.weather) return false;
      if (filters.outcome && row.missionOutcome !== filters.outcome) return false;
      return true;
    });
  }, [data, filters, searchQuery]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const uniqueValues = (key) => [...new Set(data.map(d => d[key]))];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search flights..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-[200px]"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        <Select value={filters.city || 'all'} onValueChange={v => onFilterChange('city', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {uniqueValues('city').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.drone || 'all'} onValueChange={v => onFilterChange('drone', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Drones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drones</SelectItem>
            {uniqueValues('droneShortName').map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.planning || 'all'} onValueChange={v => onFilterChange('planning', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Planning" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Planning</SelectItem>
            {uniqueValues('planningMode').map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.weather || 'all'} onValueChange={v => onFilterChange('weather', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Weather" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Weather</SelectItem>
            {uniqueValues('weatherCondition').map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.outcome || 'all'} onValueChange={v => onFilterChange('outcome', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Outcomes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            {uniqueValues('missionOutcome').map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground font-medium">{sortedData.length} flights</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: 'id', label: 'ID' },
                { key: 'city', label: 'City' },
                { key: 'droneShortName', label: 'Drone' },
                { key: 'planningMode', label: 'Planning' },
                { key: 'weatherCondition', label: 'Weather' },
                { key: 'straightLineDistance', label: 'Distance' },
                { key: 'totalTime', label: 'Time' },
                { key: 'totalEnergy', label: 'Energy' },
                { key: 'pathEfficiency', label: 'Efficiency' },
                { key: 'reroutes', label: 'Reroutes' },
                { key: 'totalWeightedCost', label: 'Cost' },
                { key: 'missionOutcome', label: 'Outcome' },
              ].map(col => (
                <TableHead
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {col.label} {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(row => (
              <TableRow
                key={row.id}
                className={`cursor-pointer ${selectedId === row.id ? 'bg-accent' : ''}`}
                onClick={() => onSelectFlight(row)}
              >
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell className="text-xs">{row.city}</TableCell>
                <TableCell>{row.droneShortName}</TableCell>
                <TableCell className={row.planningMode === 'gis_enhanced' ? 'text-stone-400 font-medium' : ''}>{row.planningMode}</TableCell>
                <TableCell>{row.weatherCondition}</TableCell>
                <TableCell>{row.straightLineDistance?.toLocaleString()}m</TableCell>
                <TableCell>{formatTime(row.totalTime)}</TableCell>
                <TableCell>{row.totalEnergy?.toFixed(1)} Wh</TableCell>
                <TableCell>{row.pathEfficiency?.toFixed(1)}%</TableCell>
                <TableCell>{row.reroutes}</TableCell>
                <TableCell>{row.totalWeightedCost?.toFixed(1)}</TableCell>
                <TableCell><Badge variant={getOutcomeVariant(row.missionOutcome)}>{row.missionOutcome}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-4 text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// FLIGHT DETAILS PANEL
// ============================================

function FlightDetails({ flight }) {
  if (!flight) return null;

  const sections = [
    {
      title: 'Mission Info',
      items: [
        ['Drone', flight.droneModel],
        ['Planning', flight.planningMode],
        ['Environment', flight.environment],
        ['Freshness', flight.freshness],
        ['Season', flight.season],
      ]
    },
    {
      title: 'Weather',
      items: [
        ['Condition', flight.weatherCondition],
        ['Wind', `${flight.windSpeed} m/s`],
        ['Precipitation', `${flight.precipitation} mm`],
        ['Temperature', `${flight.temperature}°C`],
        ['Visibility', `${flight.visibility} km`],
      ]
    },
    {
      title: 'Performance',
      items: [
        ['Distance', `${flight.straightLineDistance?.toLocaleString()}m`],
        ['Actual Path', `${flight.totalDistance?.toLocaleString()}m`],
        ['Flight Time', formatTime(flight.totalTime)],
        ['Energy', `${flight.totalEnergy?.toFixed(1)} Wh`],
        ['Efficiency', `${flight.pathEfficiency?.toFixed(1)}%`],
      ]
    },
    {
      title: 'Cost Breakdown',
      items: [
        ['Energy Cost', flight.energyCost?.toFixed(1)],
        ['Time Cost', flight.timeCost?.toFixed(1)],
        ['Risk Cost', flight.riskCost?.toFixed(1)],
        ['Privacy Cost', flight.privacyCost?.toFixed(1)],
        ['Total', flight.totalWeightedCost?.toFixed(1), true],
      ]
    },
  ];

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">Flight #{flight.id} Details</h3>
        <Badge variant={getOutcomeVariant(flight.missionOutcome)}>{flight.missionOutcome?.toUpperCase()}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {section.items.map(([label, value, highlight], j) => (
                  <div key={j} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-medium ${highlight ? 'text-stone-300' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SIMULATION TRIAL TABLE COMPONENT
// ============================================

function SimulationTrialTable({ data, selectedId, onSelectTrial, filters, onFilterChange }) {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          row.id?.toString(),
          row.droneShortName,
          row.planningMode,
          row.weatherCondition,
          row.missionOutcome,
          row.city
        ];
        if (!searchableFields.some(field => field?.toLowerCase().includes(query))) return false;
      }
      if (filters.planning && row.planningMode !== filters.planning) return false;
      if (filters.weather && row.weatherCondition !== filters.weather) return false;
      if (filters.outcome && row.missionOutcome !== filters.outcome) return false;
      return true;
    });
  }, [data, filters, searchQuery]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const uniqueValues = (key) => [...new Set(data.map(d => d[key]))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search trials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[180px]"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        <Select value={filters.planning || 'all'} onValueChange={v => onFilterChange('planning', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Planning" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Planning</SelectItem>
            {uniqueValues('planningMode').map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.weather || 'all'} onValueChange={v => onFilterChange('weather', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Weather" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Weather</SelectItem>
            {uniqueValues('weatherCondition').map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.outcome || 'all'} onValueChange={v => onFilterChange('outcome', v === 'all' ? null : v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Outcomes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            {uniqueValues('missionOutcome').map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground font-medium">{sortedData.length} trials</span>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: 'id', label: 'ID' },
                { key: 'city', label: 'City' },
                { key: 'planningMode', label: 'Planning' },
                { key: 'weatherCondition', label: 'Weather' },
                { key: 'straightLineDistance', label: 'Distance' },
                { key: 'totalTime', label: 'Time' },
                { key: 'totalEnergy', label: 'Energy' },
                { key: 'pathEfficiency', label: 'Efficiency' },
                { key: 'reroutes', label: 'Reroutes' },
                { key: 'totalWeightedCost', label: 'Cost' },
                { key: 'missionOutcome', label: 'Outcome' },
              ].map(col => (
                <TableHead
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer select-none hover:text-primary transition-colors"
                >
                  {col.label} {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(row => (
              <TableRow
                key={row.id}
                className={`cursor-pointer ${selectedId === row.id ? 'bg-accent' : ''}`}
                onClick={() => onSelectTrial(row)}
              >
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell className="text-xs">{row.city}</TableCell>
                <TableCell className={row.planningMode === 'gis_enhanced' ? 'text-stone-400 font-medium' : ''}>{row.planningMode}</TableCell>
                <TableCell>{row.weatherCondition}</TableCell>
                <TableCell>{row.straightLineDistance?.toLocaleString()}m</TableCell>
                <TableCell>{formatTime(row.totalTime)}</TableCell>
                <TableCell>{row.totalEnergy?.toFixed(1)} Wh</TableCell>
                <TableCell>{row.pathEfficiency?.toFixed(1)}%</TableCell>
                <TableCell>{row.reroutes}</TableCell>
                <TableCell>{row.totalWeightedCost?.toFixed(1)}</TableCell>
                <TableCell><Badge variant={getOutcomeVariant(row.missionOutcome)}>{row.missionOutcome}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-4 text-sm text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// CHART TOOLTIP STYLE
// ============================================
const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    color: 'hsl(var(--popover-foreground))',
    padding: '12px 16px',
  },
  cursor: { fill: 'hsl(var(--accent))', fillOpacity: 0.1 },
  animationDuration: 200,
  animationEasing: 'ease-out',
};

// Custom Tooltip Component for enhanced styling
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-4 animate-scale-in">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
            </span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart colors - Stone/Black theme (muted, no bright colors)
const CHART_COLORS = {
  primary: 'hsl(25 5% 45%)',      // Stone gray
  secondary: 'hsl(25 8% 60%)',    // Light stone
  tertiary: 'hsl(25 4% 30%)',     // Dark stone
  quaternary: 'hsl(25 6% 75%)',   // Pale stone
  quinary: 'hsl(0 0% 20%)',       // Near black
  accent: 'hsl(25 3% 50%)',       // Medium stone
  success: 'hsl(25 10% 55%)',     // Warm stone (for success states)
  warning: 'hsl(30 15% 40%)',     // Warm dark (for warnings)
};

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  // Theme mode: 'dark', 'light', or 'system'
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('uas-theme-mode');
      return saved || 'system';
    }
    return 'system';
  });

  // Actual dark mode state (resolved from themeMode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('uas-theme-mode');
      if (savedMode === 'dark') return true;
      if (savedMode === 'light') return false;
      // System preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Landing page state
  const [showLanding, setShowLanding] = useState(true);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      if (themeMode === 'system') {
        setIsDarkMode(e.matches);
      }
    };

    // Set initial value based on themeMode
    if (themeMode === 'system') {
      setIsDarkMode(mediaQuery.matches);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }

    // Listen for changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Save theme mode preference
    localStorage.setItem('uas-theme-mode', themeMode);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleSearchChange = (value) => setSearchQuery(value);

  // Cycle through theme modes: system -> light -> dark -> system
  const cycleThemeMode = () => {
    setThemeMode(prev => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  // Simulation state with multi-planning mode support
  const [simConfig, setSimConfig] = useState({
    selectedCity: 'dallas',
    selectedDrone: 'm350_rtk',
    selectedWeather: 'realistic',
    // Multi-planning mode with individual trial counts
    planningModes: {
      baseline: { enabled: true, count: 50 },
      gis_basic: { enabled: true, count: 50 },
      gis_enhanced: { enabled: true, count: 50 }
    },
    customDrone: {
      maxSpeed: 15,
      energyPerKm: 50,
      payload: 1.0,
      windResistance: 12,
      flightTime: 30,
      sensorFidelity: 90
    }
  });
  const [simResults, setSimResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  // Accumulated trials across all simulation runs - persisted to localStorage
  const [accumulatedTrials, setAccumulatedTrials] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('uas-simulation-trials');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved simulation trials');
        }
      }
    }
    return [];
  });
  const [selectedSimTrial, setSelectedSimTrial] = useState(null);
  const [simTrialFilters, setSimTrialFilters] = useState({});
  const [nextTrialId, setNextTrialId] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('uas-simulation-trials');
      if (saved) {
        try {
          const trials = JSON.parse(saved);
          return trials.length > 0 ? Math.max(...trials.map(t => t.id || t.trialId || 0)) + 1 : 1;
        } catch (e) {
          console.warn('Failed to parse saved simulation trials');
        }
      }
    }
    return 1;
  });

  // Persist accumulated trials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('uas-simulation-trials', JSON.stringify(accumulatedTrials));
  }, [accumulatedTrials]);

  const updateSimConfig = (key, value) => {
    setSimConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateCustomDrone = (key, value) => {
    setSimConfig(prev => ({
      ...prev,
      customDrone: { ...prev.customDrone, [key]: value }
    }));
  };

  const updatePlanningMode = (modeId, field, value) => {
    setSimConfig(prev => ({
      ...prev,
      planningModes: {
        ...prev.planningModes,
        [modeId]: { ...prev.planningModes[modeId], [field]: value }
      }
    }));
  };

  const getTotalSimulations = () => {
    return Object.values(simConfig.planningModes)
      .filter(m => m.enabled)
      .reduce((sum, m) => sum + m.count, 0);
  };

  // Distribute total simulations evenly across enabled planning modes
  const distributeTotalSimulations = (total) => {
    const enabledModes = Object.entries(simConfig.planningModes)
      .filter(([_, config]) => config.enabled)
      .map(([id]) => id);

    if (enabledModes.length === 0) return;

    const perMode = Math.floor(total / enabledModes.length);
    const remainder = total % enabledModes.length;

    setSimConfig(prev => {
      const newPlanningModes = { ...prev.planningModes };
      enabledModes.forEach((modeId, index) => {
        newPlanningModes[modeId] = {
          ...newPlanningModes[modeId],
          count: perMode + (index < remainder ? 1 : 0)
        };
      });
      return { ...prev, planningModes: newPlanningModes };
    });
  };

  // Generate a single trial with realistic data
  const generateTrial = (id, city, drone, planningMode, weather, runId) => {
    const weatherConditions = ['Clear', 'Light Wind', 'Moderate Wind', 'Light Rain', 'Heavy Wind', 'Heavy Rain'];
    const weatherWeights = weather.id === 'clear' ? [1, 0, 0, 0, 0, 0] :
                          weather.id === 'mixed' ? [0.5, 0.2, 0.15, 0.1, 0.03, 0.02] :
                          weather.id === 'challenging' ? [0.2, 0.15, 0.2, 0.2, 0.15, 0.1] :
                          [0.45, 0.15, 0.12, 0.12, 0.08, 0.08]; // realistic

    // Pick weather condition based on weights
    const rand = Math.random();
    let cumWeight = 0;
    let selectedWeather = weatherConditions[0];
    for (let i = 0; i < weatherConditions.length; i++) {
      cumWeight += weatherWeights[i];
      if (rand <= cumWeight) {
        selectedWeather = weatherConditions[i];
        break;
      }
    }

    const isAborted = selectedWeather === 'Heavy Rain' ? Math.random() < 0.2 :
                     selectedWeather === 'Heavy Wind' ? Math.random() < 0.15 : false;

    const baseEfficiency = planningMode === 'gis_enhanced' ? 94.2 :
                          planningMode === 'gis_basic' ? 90.7 : 98.0;
    const cityFactor = city.airspaceComplexity === 'very_high' ? 0.92 :
                      city.airspaceComplexity === 'high' ? 0.95 : 1.0;
    const weatherEnergyFactor = selectedWeather.includes('Wind') ? 1.15 :
                               selectedWeather.includes('Rain') ? 1.2 : 1.0;

    const efficiency = baseEfficiency * cityFactor * (0.95 + Math.random() * 0.1);
    // Longer distances for more visible path planning changes (5km - 15km)
    const distance = 5000 + Math.random() * 10000;
    const actualDistance = distance * (100 / efficiency);
    const flightTime = (actualDistance / drone.specs.maxSpeed) * (1 + Math.random() * 0.2);
    const energy = (actualDistance / 1000) * drone.specs.energyPerKm * weatherEnergyFactor;

    const reroutes = isAborted ? 0 :
                    planningMode === 'gis_enhanced' ? (Math.random() < 0.7 ? 0 : 1) :
                    planningMode === 'gis_basic' ? (Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 2) + 1) :
                    Math.floor(Math.random() * 2);

    const privacyViolations = planningMode === 'gis_enhanced' ? (Math.random() < 0.94 ? 0 : 1) :
                             planningMode === 'gis_basic' ? (Math.random() < 0.94 ? 0 : 1) :
                             (Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 2) + 1);

    const outcome = isAborted ? 'aborted' :
                   reroutes > 0 ? 'rerouted' :
                   Math.random() < 0.04 ? 'delayed' : 'success';

    const energyCost = energy * 0.3;
    const timeCost = flightTime * 0.25;
    const riskCost = (selectedWeather.includes('Wind') || selectedWeather.includes('Rain') ? 30 : 10) * 0.25;
    const privacyCost = privacyViolations * 25 * 0.2;

    return {
      id,
      runId,
      droneModel: drone.name,
      droneShortName: drone.name.split(' ').slice(-2).join(' '),
      planningMode,
      weatherCondition: selectedWeather,
      missionOutcome: outcome,
      originLat: city.lat + (Math.random() - 0.5) * 0.1,
      originLng: city.lng + (Math.random() - 0.5) * 0.1,
      destinationLat: city.lat + (Math.random() - 0.5) * 0.1,
      destinationLng: city.lng + (Math.random() - 0.5) * 0.1,
      straightLineDistance: Math.round(distance),
      totalDistance: Math.round(actualDistance),
      totalTime: Math.round(flightTime),
      totalEnergy: energy,
      pathEfficiency: efficiency,
      reroutes,
      privacyViolations,
      energyCost,
      timeCost,
      riskCost,
      privacyCost,
      totalWeightedCost: energyCost + timeCost + riskCost + privacyCost,
      city: city.name,
      cityId: city.id, // For altitude restriction awareness in path planning
      windSpeed: selectedWeather.includes('Wind') ? 8 + Math.random() * 7 : 2 + Math.random() * 4,
      precipitation: selectedWeather.includes('Rain') ? 2 + Math.random() * 8 : 0,
      temperature: city.avgTemp + (Math.random() - 0.5) * 10,
      visibility: selectedWeather.includes('Rain') ? 3 + Math.random() * 5 : 8 + Math.random() * 4,
      environment: 'Urban',
      season: ['Spring', 'Summer', 'Fall', 'Winter'][Math.floor(Math.random() * 4)],
      freshness: ['New (<30d)', 'Recent (30-90d)', 'Old (>90d)'][Math.floor(Math.random() * 3)]
    };
  };

  // Run simulation with multi-planning mode support
  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const city = CITY_PRESETS.find(c => c.id === simConfig.selectedCity);
      const drone = simConfig.selectedDrone === 'custom'
        ? { name: 'Custom Drone', specs: simConfig.customDrone }
        : DRONE_PRESETS.find(d => d.id === simConfig.selectedDrone);
      const weather = WEATHER_PROFILES.find(w => w.id === simConfig.selectedWeather);

      const runId = Date.now();
      const newTrials = [];
      let currentId = nextTrialId;

      // Generate trials for each enabled planning mode
      Object.entries(simConfig.planningModes).forEach(([modeId, modeConfig]) => {
        if (modeConfig.enabled && modeConfig.count > 0) {
          for (let i = 0; i < modeConfig.count; i++) {
            newTrials.push(generateTrial(currentId++, city, drone, modeId, weather, runId));
          }
        }
      });

      setNextTrialId(currentId);

      // Add new trials to accumulated trials
      const allTrials = [...accumulatedTrials, ...newTrials];
      setAccumulatedTrials(allTrials);

      // Calculate cumulative results from all trials
      const calculateMetrics = (trials) => {
        if (trials.length === 0) return null;

        const successCount = trials.filter(t => t.missionOutcome === 'success').length;
        const reroutedCount = trials.filter(t => t.missionOutcome === 'rerouted').length;
        const delayedCount = trials.filter(t => t.missionOutcome === 'delayed').length;
        const abortedCount = trials.filter(t => t.missionOutcome === 'aborted').length;

        const avgEfficiency = trials.reduce((sum, t) => sum + t.pathEfficiency, 0) / trials.length;
        const avgEnergy = trials.reduce((sum, t) => sum + t.totalEnergy, 0) / trials.length;
        const avgCost = trials.reduce((sum, t) => sum + t.totalWeightedCost, 0) / trials.length;
        const totalPrivacyViolations = trials.reduce((sum, t) => sum + t.privacyViolations, 0);
        const avgReroutes = trials.reduce((sum, t) => sum + t.reroutes, 0) / trials.length;
        const avgFlightTime = trials.reduce((sum, t) => sum + t.totalTime, 0) / trials.length;

        return {
          successRate: ((successCount / trials.length) * 100).toFixed(1),
          avgEfficiency: avgEfficiency.toFixed(1),
          avgEnergy: avgEnergy.toFixed(1),
          avgCost: avgCost.toFixed(1),
          privacyViolations: (totalPrivacyViolations / trials.length).toFixed(2),
          avgFlightTime: (avgFlightTime / 60).toFixed(1),
          abortRate: ((abortedCount / trials.length) * 100).toFixed(1),
          reroutes: avgReroutes.toFixed(2)
        };
      };

      // Calculate per-planning-mode breakdown
      const modeBreakdown = {};
      PLANNING_MODES.forEach(mode => {
        const modeTrials = allTrials.filter(t => t.planningMode === mode.id);
        if (modeTrials.length > 0) {
          modeBreakdown[mode.id] = {
            name: mode.name,
            count: modeTrials.length,
            metrics: calculateMetrics(modeTrials)
          };
        }
      });

      const results = {
        config: {
          city: city.name,
          drone: drone.name,
          weather: weather.name,
          totalTrials: allTrials.length,
          newTrials: newTrials.length
        },
        metrics: calculateMetrics(allTrials),
        breakdown: {
          successful: allTrials.filter(t => t.missionOutcome === 'success').length,
          rerouted: allTrials.filter(t => t.missionOutcome === 'rerouted').length,
          delayed: allTrials.filter(t => t.missionOutcome === 'delayed').length,
          aborted: allTrials.filter(t => t.missionOutcome === 'aborted').length
        },
        modeBreakdown
      };

      setSimResults(results);
      setIsSimulating(false);
    }, 1500);
  };

  // Clear all accumulated trials
  const clearTrials = () => {
    setAccumulatedTrials([]);
    setSimResults(null);
    setSelectedSimTrial(null);
    setNextTrialId(1);
  };

  // Download trials data
  const downloadTrials = async (format) => {
    if (accumulatedTrials.length === 0) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let content, defaultName, filters;

    if (format === 'csv') {
      const headers = [
        'Trial ID', 'Run ID', 'City', 'Drone Model', 'Planning Mode', 'Weather Condition',
        'Mission Outcome', 'Origin Lat', 'Origin Lng', 'Destination Lat', 'Destination Lng',
        'Straight Line Distance (m)', 'Total Distance (m)', 'Total Time (s)',
        'Total Energy (Wh)', 'Path Efficiency (%)', 'Reroutes', 'Privacy Violations',
        'Energy Cost', 'Time Cost', 'Risk Cost', 'Privacy Cost', 'Total Weighted Cost',
        'Wind Speed (m/s)', 'Precipitation (mm)', 'Temperature (C)', 'Visibility (km)',
        'Environment', 'Season', 'Data Freshness'
      ];
      const rows = accumulatedTrials.map(t => [
        t.trialId || t.id, t.runId, `"${t.city}"`, `"${t.droneModel}"`, t.planningMode, `"${t.weatherCondition}"`,
        t.missionOutcome, t.originLat?.toFixed(6), t.originLng?.toFixed(6),
        t.destinationLat?.toFixed(6), t.destinationLng?.toFixed(6),
        t.straightLineDistance, t.totalDistance, t.totalTime,
        t.totalEnergy?.toFixed(4), t.pathEfficiency?.toFixed(4), t.reroutes, t.privacyViolations,
        t.energyCost?.toFixed(4), t.timeCost?.toFixed(4), t.riskCost?.toFixed(4),
        t.privacyCost?.toFixed(4), t.totalWeightedCost?.toFixed(4),
        t.windSpeed?.toFixed(2), t.precipitation?.toFixed(2),
        t.temperature?.toFixed(1), t.visibility?.toFixed(1),
        t.environment, t.season, `"${t.freshness}"`
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      defaultName = `uas-trials-${timestamp}.csv`;
      filters = [{ name: 'CSV Files', extensions: ['csv'] }];
    } else {
      const calculateStats = (trials) => {
        if (trials.length === 0) return null;
        const successCount = trials.filter(t => t.missionOutcome === 'success').length;
        const reroutedCount = trials.filter(t => t.missionOutcome === 'rerouted').length;
        const delayedCount = trials.filter(t => t.missionOutcome === 'delayed').length;
        const abortedCount = trials.filter(t => t.missionOutcome === 'aborted').length;
        return {
          totalTrials: trials.length,
          outcomes: { success: successCount, rerouted: reroutedCount, delayed: delayedCount, aborted: abortedCount },
          successRate: ((successCount / trials.length) * 100).toFixed(2),
          abortRate: ((abortedCount / trials.length) * 100).toFixed(2),
          avgPathEfficiency: (trials.reduce((s, t) => s + t.pathEfficiency, 0) / trials.length).toFixed(4),
          avgEnergy: (trials.reduce((s, t) => s + t.totalEnergy, 0) / trials.length).toFixed(4),
          avgFlightTime: (trials.reduce((s, t) => s + t.totalTime, 0) / trials.length).toFixed(2),
          avgWeightedCost: (trials.reduce((s, t) => s + t.totalWeightedCost, 0) / trials.length).toFixed(4),
          avgReroutes: (trials.reduce((s, t) => s + t.reroutes, 0) / trials.length).toFixed(4),
          avgPrivacyViolations: (trials.reduce((s, t) => s + t.privacyViolations, 0) / trials.length).toFixed(4),
          avgDistance: (trials.reduce((s, t) => s + t.totalDistance, 0) / trials.length).toFixed(2),
        };
      };

      const modeBreakdown = {};
      [...new Set(accumulatedTrials.map(t => t.planningMode))].forEach(mode => {
        modeBreakdown[mode] = calculateStats(accumulatedTrials.filter(t => t.planningMode === mode));
      });
      const cityBreakdown = {};
      [...new Set(accumulatedTrials.map(t => t.city))].forEach(city => {
        cityBreakdown[city] = calculateStats(accumulatedTrials.filter(t => t.city === city));
      });

      const exportData = {
        exportDate: new Date().toISOString(),
        study: 'AP Research - UAS Routing Efficiency Analysis',
        author: 'Aarush Bhadragiri',
        summary: calculateStats(accumulatedTrials),
        breakdownByPlanningMode: modeBreakdown,
        breakdownByCity: cityBreakdown,
        trials: accumulatedTrials
      };
      content = JSON.stringify(exportData, null, 2);
      defaultName = `uas-trials-${timestamp}.json`;
      filters = [{ name: 'JSON Files', extensions: ['json'] }];
    }

    // Use Electron save dialog if available, otherwise browser fallback
    try {
      if (window.electronAPI?.saveFile) {
        const result = await window.electronAPI.saveFile({ content, defaultName, filters });
        console.log('Save result:', result);
      } else {
        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = defaultName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed: ' + err.message);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'data', label: 'Data Table', icon: Database },
    { id: 'simulation', label: 'Run Simulation', icon: Play },
    { id: 'planning', label: 'Planning', icon: Map },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'gis', label: 'GIS Layers', icon: Layers },
    { id: 'drones', label: 'Drones', icon: Plane },
    { id: 'cost', label: 'Cost', icon: DollarSign }
  ];

  // Show landing page
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} isDarkMode={isDarkMode} />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Scroll Progress Bar */}
      <ScrollProgress variant="stone" size="lg" position="bottom" glow="lg" showPercentage />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <FadeIn delay={0} duration={600}>
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Home Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLanding(true)}
                  className="shrink-0 hover:scale-110 transition-transform"
                  title="Return to landing page"
                >
                  <Home className="h-5 w-5" />
                </Button>
                <HummingbirdLogo className="w-10 h-10 text-stone-400" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    UAS Flight Path Simulation
                  </h1>
                  <p className="text-muted-foreground mt-2">Multi-City Analysis | Environmental, Privacy & GIS-Enhanced Planning</p>
                </div>
              </div>
              {/* Theme Toggle - cycles through system/light/dark */}
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleThemeMode}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted"
                title={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
              >
                {themeMode === 'system' && (
                  <>
                    <Monitor className="h-4 w-4" />
                    <span className="text-xs font-medium">System</span>
                  </>
                )}
                {themeMode === 'light' && (
                  <>
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium">Light</span>
                  </>
                )}
                {themeMode === 'dark' && (
                  <>
                    <Moon className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-medium">Dark</span>
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="info" className="animate-fade-in stagger-1">5,400 Scenarios</Badge>
              <Badge variant="success" className="animate-fade-in stagger-2">5 Cities</Badge>
              <Badge variant="secondary" className="animate-fade-in stagger-3">6 Drone Models</Badge>
            </div>
          </header>
        </FadeIn>

        {/* Tab Navigation */}
        <FadeIn delay={100} duration={600}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto p-1 gap-1">
              {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 transition-all duration-200 hover:scale-105 data-[state=active]:scale-105"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard value="6:42" label="Avg Flight Time" />
              <StatCard value="158.3 Wh" label="Avg Energy" />
              <StatCard value="93.1%" label="Path Efficiency" />
              <StatCard value="0.12" label="Privacy Violations" />
              <StatCard value="176.8" label="Avg Cost Score" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Research Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  {[
                    { value: '17.8%', label: 'Cost Reduction (GIS-Enhanced)' },
                    { value: '79%', label: 'Privacy Violation Reduction' },
                    { value: '95%', label: 'Thunderstorm Abort Rate' },
                    { value: '490%', label: 'Reroute Increase (Old Maps)' }
                  ].map((item, i) => (
                    <HoverCard key={i}>
                      <HoverCardTrigger asChild>
                        <div className="cursor-pointer p-3 rounded-lg transition-colors hover:bg-accent/50">
                          <div className="text-3xl sm:text-4xl font-bold text-primary">{item.value}</div>
                          <div className="text-xs text-muted-foreground mt-2">{item.label}</div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        <div className="flex items-start gap-3">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium mb-1">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {statDescriptions[item.label] || 'Key metric from the UAS simulation study.'}
                            </p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planning Mode Cost Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={planningData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[150, 200]} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[90, 100]} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cost" fill={CHART_COLORS.primary} name="Total Cost" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="success" stroke={CHART_COLORS.secondary} strokeWidth={3} name="Success Rate %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Table Tab */}
          <TabsContent value="data" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Flight Path Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <FlightMap selectedFlight={selectedFlight} isDarkMode={isDarkMode} />
                <FlightDetails flight={selectedFlight} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Simulation Trials</CardTitle>
                <CardDescription>Click any row to view the flight path on the map above</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTableComponent
                  data={simulationData}
                  selectedId={selectedFlight?.id}
                  onSelectFlight={setSelectedFlight}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Simulation Configuration
                  </CardTitle>
                  <CardDescription>Configure parameters for your custom simulation run</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Total Simulations Slider - Interconnected */}
                  <div className="space-y-3">
                    <Label htmlFor="totalSims" className="flex items-center gap-2">
                      Total Simulations
                      <Badge variant="outline" className="text-xs">Distributes across modes</Badge>
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="totalSims"
                        min={30}
                        max={600}
                        step={30}
                        value={[getTotalSimulations()]}
                        onValueChange={([val]) => distributeTotalSimulations(val)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={getTotalSimulations()}
                        onChange={(e) => distributeTotalSimulations(Math.min(600, Math.max(30, parseInt(e.target.value) || 30)))}
                        className="w-20 text-center"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Adjusting this slider distributes trials evenly across enabled planning modes below
                    </p>
                  </div>

                  <Separator />

                  {/* City Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      City / Location
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </Label>
                    <Select value={simConfig.selectedCity} onValueChange={(val) => updateSimConfig('selectedCity', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITY_PRESETS.map(city => (
                          <SelectItem key={city.id} value={city.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{city.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {city.airspaceComplexity.replace('_', ' ')}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {simConfig.selectedCity && (
                      <div className="text-xs text-muted-foreground grid grid-cols-3 gap-2 mt-2 p-2 rounded bg-muted/50">
                        {(() => {
                          const city = CITY_PRESETS.find(c => c.id === simConfig.selectedCity);
                          return city ? (
                            <>
                              <span>Avg Temp: {city.avgTemp}°C</span>
                              <span>Wind: {city.windPattern}</span>
                              <span>Airspace: {city.airspaceComplexity.replace('_', ' ')}</span>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Multi-Planning Mode Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Planning Modes & Trial Counts
                      <Badge variant="outline" className="text-xs">At least one required</Badge>
                    </Label>
                    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                      {PLANNING_MODES.map(mode => (
                        <div key={mode.id} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              id={`mode-${mode.id}`}
                              checked={simConfig.planningModes[mode.id]?.enabled || false}
                              onChange={(e) => updatePlanningMode(mode.id, 'enabled', e.target.checked)}
                              className="h-4 w-4 rounded border-input"
                            />
                            <Label htmlFor={`mode-${mode.id}`} className="text-sm cursor-pointer flex-1">
                              {mode.name}
                            </Label>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={200}
                            value={simConfig.planningModes[mode.id]?.count || 0}
                            onChange={(e) => updatePlanningMode(mode.id, 'count', Math.min(200, Math.max(0, parseInt(e.target.value) || 0)))}
                            disabled={!simConfig.planningModes[mode.id]?.enabled}
                            className="w-20 text-center"
                          />
                          <span className="text-xs text-muted-foreground w-12">trials</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total trials:</span>
                        <Badge variant="secondary">{getTotalSimulations()}</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Weather Profile */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Weather Profile
                    </Label>
                    <Select value={simConfig.selectedWeather} onValueChange={(val) => updateSimConfig('selectedWeather', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEATHER_PROFILES.map(weather => (
                          <SelectItem key={weather.id} value={weather.id}>
                            {weather.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Drone Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Drone Configuration
                  </CardTitle>
                  <CardDescription>Select a preset or configure custom drone specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Drone Preset Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Drone Platform
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </Label>
                    <Select value={simConfig.selectedDrone} onValueChange={(val) => updateSimConfig('selectedDrone', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a drone" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRONE_PRESETS.map(drone => (
                          <SelectItem key={drone.id} value={drone.id}>
                            <div className="flex items-center gap-2">
                              <span>{drone.name}</span>
                              {drone.manufacturer !== '-' && (
                                <Badge variant="secondary" className="text-xs">{drone.manufacturer}</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Drone Specs Display/Edit */}
                  {simConfig.selectedDrone === 'custom' ? (
                    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                      <p className="text-sm font-medium text-primary flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Custom Drone Specifications
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxSpeed" className="text-xs flex items-center gap-1">
                            <Gauge className="h-3 w-3" /> Max Speed (m/s)
                            <Badge variant="destructive" className="text-[10px] px-1">Required</Badge>
                          </Label>
                          <Input
                            id="maxSpeed"
                            type="number"
                            value={simConfig.customDrone.maxSpeed}
                            onChange={(e) => updateCustomDrone('maxSpeed', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="energyPerKm" className="text-xs flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Energy/km (Wh)
                            <Badge variant="destructive" className="text-[10px] px-1">Required</Badge>
                          </Label>
                          <Input
                            id="energyPerKm"
                            type="number"
                            value={simConfig.customDrone.energyPerKm}
                            onChange={(e) => updateCustomDrone('energyPerKm', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payload" className="text-xs flex items-center gap-1">
                            <Package className="h-3 w-3" /> Payload (kg)
                            <Badge variant="destructive" className="text-[10px] px-1">Required</Badge>
                          </Label>
                          <Input
                            id="payload"
                            type="number"
                            step="0.1"
                            value={simConfig.customDrone.payload}
                            onChange={(e) => updateCustomDrone('payload', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="windResistance" className="text-xs flex items-center gap-1">
                            <Wind className="h-3 w-3" /> Wind Resist. (m/s)
                          </Label>
                          <Input
                            id="windResistance"
                            type="number"
                            value={simConfig.customDrone.windResistance}
                            onChange={(e) => updateCustomDrone('windResistance', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flightTime" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Flight Time (min)
                          </Label>
                          <Input
                            id="flightTime"
                            type="number"
                            value={simConfig.customDrone.flightTime}
                            onChange={(e) => updateCustomDrone('flightTime', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sensorFidelity" className="text-xs flex items-center gap-1">
                            <Battery className="h-3 w-3" /> Sensor Fidelity (%)
                          </Label>
                          <Input
                            id="sensorFidelity"
                            type="number"
                            min="0"
                            max="100"
                            value={simConfig.customDrone.sensorFidelity}
                            onChange={(e) => updateCustomDrone('sensorFidelity', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="text-sm font-medium mb-3">Selected Drone Specifications</p>
                      {(() => {
                        const drone = DRONE_PRESETS.find(d => d.id === simConfig.selectedDrone);
                        return drone ? (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Max Speed:</span>
                              <span className="font-medium">{drone.specs.maxSpeed} m/s</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Energy/km:</span>
                              <span className="font-medium">{drone.specs.energyPerKm} Wh</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Payload:</span>
                              <span className="font-medium">{drone.specs.payload} kg</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Wind Resist.:</span>
                              <span className="font-medium">{drone.specs.windResistance} m/s</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Flight Time:</span>
                              <span className="font-medium">{drone.specs.flightTime} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Sensors:</span>
                              <span className="font-medium">{drone.specs.sensorFidelity}%</span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <Separator />

                  {/* Run Simulation Button */}
                  <div className="space-y-2">
                    <Button
                      onClick={runSimulation}
                      disabled={isSimulating || getTotalSimulations() === 0}
                      className="w-full h-12 text-lg"
                      size="lg"
                    >
                      {isSimulating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                          Running Simulation...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Run {getTotalSimulations()} Simulations
                        </>
                      )}
                    </Button>
                    {accumulatedTrials.length > 0 && (
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Trials ({accumulatedTrials.length})
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-56">
                            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => downloadTrials('csv')}>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              CSV (Trial Data)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadTrials('json')}>
                              <FileJson className="h-4 w-4 mr-2" />
                              JSON (Data + Statistics)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={clearTrials}
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          title="Clear all trials"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            {simResults && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cumulative Simulation Results
                  </CardTitle>
                  <CardDescription>
                    {simResults.config.totalTrials} total trials ({simResults.config.newTrials} new) • {simResults.config.city} • {simResults.config.drone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="graphs">Graphs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <StatCard value={`${simResults.metrics.successRate}%`} label="Success Rate" />
                        <StatCard value={`${simResults.metrics.avgEfficiency}%`} label="Path Efficiency" />
                        <StatCard value={`${simResults.metrics.avgEnergy} Wh`} label="Avg Energy" />
                        <StatCard value={simResults.metrics.avgCost} label="Avg Cost Score" />
                      </div>

                      {/* Planning Mode Comparison */}
                      {Object.keys(simResults.modeBreakdown).length > 1 && (
                        <Card className="mb-6">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Planning Mode Comparison</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Mode</TableHead>
                                  <TableHead>Trials</TableHead>
                                  <TableHead>Success</TableHead>
                                  <TableHead>Efficiency</TableHead>
                                  <TableHead>Avg Cost</TableHead>
                                  <TableHead>Violations</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(simResults.modeBreakdown).map(([modeId, data]) => (
                                  <TableRow key={modeId}>
                                    <TableCell className={`font-semibold ${modeId === 'gis_enhanced' ? 'text-stone-400' : ''}`}>
                                      {data.name}
                                    </TableCell>
                                    <TableCell>{data.count}</TableCell>
                                    <TableCell>{data.metrics.successRate}%</TableCell>
                                    <TableCell>{data.metrics.avgEfficiency}%</TableCell>
                                    <TableCell className={modeId === 'gis_enhanced' ? 'text-stone-400 font-medium' : ''}>
                                      {data.metrics.avgCost}
                                    </TableCell>
                                    <TableCell>{data.metrics.privacyViolations}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Configuration Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">City:</span>
                                <span className="font-medium">{simResults.config.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Drone:</span>
                            <span className="font-medium">{simResults.config.drone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weather Profile:</span>
                            <span className="font-medium">{simResults.config.weather}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Trials:</span>
                            <Badge variant="secondary">{simResults.config.totalTrials}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Outcome Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Successful:</span>
                            <Badge variant="success">{simResults.breakdown.successful} flights</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Rerouted:</span>
                            <Badge variant="warning">{simResults.breakdown.rerouted} flights</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Delayed:</span>
                            <Badge variant="info">{simResults.breakdown.delayed} flights</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Aborted:</span>
                            <Badge variant="error">{simResults.breakdown.aborted} flights</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{simResults.metrics.privacyViolations}</div>
                      <div className="text-xs text-muted-foreground">Avg Privacy Violations</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{simResults.metrics.reroutes}</div>
                      <div className="text-xs text-muted-foreground">Avg Reroutes</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{simResults.metrics.avgFlightTime} min</div>
                      <div className="text-xs text-muted-foreground">Avg Flight Time</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-lg font-bold">{simResults.metrics.abortRate}%</div>
                      <div className="text-xs text-muted-foreground">Abort Rate</div>
                    </div>
                  </div>
                    </TabsContent>

                    {/* Graphs Tab */}
                    <TabsContent value="graphs">
                      <div className="space-y-6">
                        {/* Planning Mode Performance Chart */}
                        {Object.keys(simResults.modeBreakdown).length > 1 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Planning Mode Performance Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                  data={Object.entries(simResults.modeBreakdown).map(([id, data]) => ({
                                    name: data.name,
                                    'Success Rate': parseFloat(data.metrics.successRate),
                                    'Efficiency': parseFloat(data.metrics.avgEfficiency),
                                    'Cost': parseFloat(data.metrics.avgCost)
                                  }))}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                  <Tooltip {...tooltipStyle} />
                                  <Legend />
                                  <Bar dataKey="Success Rate" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="Efficiency" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        )}

                        {/* Outcome Distribution Pie Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Outcome Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'Successful', value: simResults.breakdown.successful, color: CHART_COLORS.secondary },
                                      { name: 'Rerouted', value: simResults.breakdown.rerouted, color: CHART_COLORS.warning },
                                      { name: 'Delayed', value: simResults.breakdown.delayed, color: CHART_COLORS.accent },
                                      { name: 'Aborted', value: simResults.breakdown.aborted, color: CHART_COLORS.quinary }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {[
                                      { name: 'Successful', value: simResults.breakdown.successful, color: CHART_COLORS.secondary },
                                      { name: 'Rerouted', value: simResults.breakdown.rerouted, color: CHART_COLORS.warning },
                                      { name: 'Delayed', value: simResults.breakdown.delayed, color: CHART_COLORS.accent },
                                      { name: 'Aborted', value: simResults.breakdown.aborted, color: CHART_COLORS.quinary }
                                    ].map((entry, index) => (
                                      <Cell key={index} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip {...tooltipStyle} />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          {/* Key Metrics Radar */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={[
                                  { metric: 'Success', value: parseFloat(simResults.metrics.successRate), fullMark: 100 },
                                  { metric: 'Efficiency', value: parseFloat(simResults.metrics.avgEfficiency), fullMark: 100 },
                                  { metric: 'Low Violations', value: Math.max(0, 100 - parseFloat(simResults.metrics.privacyViolations) * 50), fullMark: 100 },
                                  { metric: 'Low Reroutes', value: Math.max(0, 100 - parseFloat(simResults.metrics.reroutes) * 30), fullMark: 100 },
                                  { metric: 'Low Abort', value: Math.max(0, 100 - parseFloat(simResults.metrics.abortRate)), fullMark: 100 }
                                ]}>
                                  <PolarGrid stroke="hsl(var(--border))" />
                                  <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--border))" fontSize={10} />
                                  <Radar name="Performance" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.4} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Cost vs Efficiency Trend */}
                        {accumulatedTrials.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Cost vs Efficiency by Trial</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={accumulatedTrials.slice(-50).map((t, i) => ({
                                  trial: i + 1,
                                  efficiency: t.pathEfficiency,
                                  cost: t.totalWeightedCost,
                                  mode: t.planningMode
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis dataKey="trial" stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Trial #', position: 'bottom', offset: -5 }} />
                                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                  <Tooltip {...tooltipStyle} />
                                  <Legend />
                                  <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke={CHART_COLORS.primary} strokeWidth={2} name="Efficiency %" dot={{ r: 2 }} />
                                  <Bar yAxisId="right" dataKey="cost" fill={CHART_COLORS.tertiary} name="Cost Score" radius={[2, 2, 0, 0]} />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Simulation Data Visualization */}
            {accumulatedTrials.length > 0 && (
              <>
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Simulated Flight Path Visualization</CardTitle>
                    <CardDescription>Select a trial from the table below to view its flight path</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FlightMap selectedFlight={selectedSimTrial} isDarkMode={isDarkMode} />
                    <FlightDetails flight={selectedSimTrial} />
                  </CardContent>
                </Card>

                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>All Simulated Trials</CardTitle>
                    <CardDescription>
                      {accumulatedTrials.length} trials from all simulation runs • Click any row to view the flight path
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimulationTrialTable
                      data={accumulatedTrials}
                      selectedId={selectedSimTrial?.id}
                      onSelectTrial={setSelectedSimTrial}
                      filters={simTrialFilters}
                      onFilterChange={(key, value) => setSimTrialFilters(prev => ({ ...prev, [key]: value }))}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Planning Mode Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mode</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Reroutes</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Success</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planningData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className={`font-semibold ${i === 2 ? 'text-stone-400' : ''}`}>{row.name}</TableCell>
                        <TableCell>{row.efficiency}%</TableCell>
                        <TableCell>{row.reroutes}</TableCell>
                        <TableCell>{row.violations}</TableCell>
                        <TableCell className={i === 2 ? 'text-stone-400 font-medium' : ''}>{row.cost}</TableCell>
                        <TableCell>{row.success}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Map Freshness Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={freshnessData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="freshness" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 50]} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="reroutes" fill={CHART_COLORS.quinary} name="Avg Reroutes" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="gisGain" stroke={CHART_COLORS.primary} strokeWidth={3} name="GIS Gain %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Weather Condition Abort Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={weatherData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="condition" type="category" stroke="hsl(var(--muted-foreground))" width={110} fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="abortRate" name="Abort Rate %" radius={[0, 4, 4, 0]}>
                      {weatherData.map((entry, index) => (
                        <Cell key={index} fill={entry.abortRate > 50 ? CHART_COLORS.quinary : entry.abortRate > 10 ? CHART_COLORS.tertiary : CHART_COLORS.secondary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="season" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[90, 100]} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="wildlife" fill={CHART_COLORS.secondary} name="Wildlife %" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="obstacles" fill={CHART_COLORS.tertiary} name="Avg Obstacles" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke={CHART_COLORS.primary} strokeWidth={3} name="Efficiency %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard value="0.20" label="Baseline Violations" />
              <StatCard value="0.06" label="GIS-Enhanced Violations" />
              <StatCard value="70%" label="Reduction" />
            </div>

            {/* City Privacy Zones with Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Zones & Altitude Restrictions by City
                </CardTitle>
                <CardDescription>
                  City-specific privacy zones and altitude restrictions based on local regulations, building heights, and airspace complexity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dallas" className="w-full">
                  <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
                    <TabsTrigger value="dallas">Dallas</TabsTrigger>
                    <TabsTrigger value="new_york">New York</TabsTrigger>
                    <TabsTrigger value="san_francisco">San Francisco</TabsTrigger>
                    <TabsTrigger value="chicago">Chicago</TabsTrigger>
                    <TabsTrigger value="los_angeles">Los Angeles</TabsTrigger>
                  </TabsList>

                  {Object.entries(CITY_PRIVACY_ZONES).map(([cityId, cityData]) => (
                    <TabsContent key={cityId} value={cityId} className="space-y-4">
                      {/* City Summary */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <h4 className="font-semibold">{cityData.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Max Default Altitude: {cityData.maxAltitude} ft AGL
                          </p>
                        </div>
                        <Badge variant={cityData.maxAltitude <= 200 ? 'destructive' : cityData.maxAltitude <= 300 ? 'warning' : 'secondary'}>
                          {cityData.maxAltitude <= 200 ? 'Highly Restricted' : cityData.maxAltitude <= 300 ? 'Restricted' : 'Standard'}
                        </Badge>
                      </div>

                      {/* Privacy Zones Table */}
                      <div>
                        <h5 className="text-sm font-medium mb-2">Privacy Zones</h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Zone Type</TableHead>
                              <TableHead>Sensitivity</TableHead>
                              <TableHead>Buffer</TableHead>
                              <TableHead>Restricted Hours</TableHead>
                              <TableHead>Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cityData.zones.map((zone, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{zone.type}</TableCell>
                                <TableCell>
                                  <Badge variant={zone.sensitivity >= 95 ? 'destructive' : zone.sensitivity >= 80 ? 'warning' : 'secondary'}>
                                    {zone.sensitivity}%
                                  </Badge>
                                </TableCell>
                                <TableCell>{zone.buffer}m</TableCell>
                                <TableCell>{zone.hours}</TableCell>
                                <TableCell className="text-muted-foreground">{zone.count.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Altitude Restrictions Table */}
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Altitude Restrictions
                          {cityId === 'new_york' && <Badge variant="destructive" className="text-xs">Skyscraper Zone</Badge>}
                        </h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Area</TableHead>
                              <TableHead>Max Altitude</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cityData.altitudeRestrictions.map((restriction, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{restriction.area}</TableCell>
                                <TableCell>
                                  <Badge variant={restriction.maxAlt === 0 ? 'destructive' : restriction.maxAlt <= 150 ? 'warning' : 'secondary'}>
                                    {restriction.maxAlt === 0 ? 'NO-FLY' : `${restriction.maxAlt} ft`}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{restriction.reason}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GIS Tab */}
          <TabsContent value="gis" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Gain per GIS Data Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={gisLayers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 16]} stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                    <YAxis dataKey="layer" type="category" stroke="hsl(var(--muted-foreground))" width={130} fontSize={12} />
                    <Tooltip {...tooltipStyle} formatter={(v) => `+${v}%`} />
                    <Bar dataKey="gain" fill={CHART_COLORS.primary} name="Efficiency Gain" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { param: 'Weather Forecast (1h)', gain: '+12%' },
                { param: 'Sensor Fidelity', gain: '+5%' },
                { param: 'Privacy Zone Data', gain: '+6%' },
                { param: 'Real-time TFR', gain: '+7%' }
              ].map((item, i) => (
                <StatCard key={i} value={item.gain} label={item.param} />
              ))}
            </div>
          </TabsContent>

          {/* Drones Tab */}
          <TabsContent value="drones" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Drone Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={droneRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Radar name="M350 RTK" dataKey="M350" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.25} />
                    <Radar name="Mavic 3E" dataKey="Mavic3E" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.25} />
                    <Radar name="FlyCart 30" dataKey="FC30" stroke={CHART_COLORS.quinary} fill={CHART_COLORS.quinary} fillOpacity={0.25} />
                    <Legend />
                    <Tooltip {...tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drone Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Energy/km</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Payload</TableHead>
                      <TableHead>Wind Resist.</TableHead>
                      <TableHead>Success</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: 'DJI Matrice 350 RTK', energy: '43.3 Wh', speed: '15 m/s', payload: '2.7 kg', wind: '15 m/s', success: '89.4%' },
                      { name: 'DJI Mavic 3 Enterprise', energy: '5.67 Wh', speed: '15 m/s', payload: '0.2 kg', wind: '12 m/s', success: '88.7%' },
                      { name: 'DJI FlyCart 30', energy: '275 Wh', speed: '20 m/s', payload: '30 kg', wind: '12 m/s', success: '87.2%' },
                      { name: 'Skydio X10', energy: '12.5 Wh', speed: '16 m/s', payload: '0.5 kg', wind: '13 m/s', success: '90.1%' },
                      { name: 'Autel EVO Max 4T', energy: '15.2 Wh', speed: '16 m/s', payload: '0.8 kg', wind: '12 m/s', success: '88.3%' },
                      { name: 'Parrot ANAFI Ai', energy: '8.5 Wh', speed: '14 m/s', payload: '0.3 kg', wind: '14 m/s', success: '89.8%' }
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-semibold">{row.name}</TableCell>
                        <TableCell>{row.energy}</TableCell>
                        <TableCell>{row.speed}</TableCell>
                        <TableCell>{row.payload}</TableCell>
                        <TableCell>{row.wind}</TableCell>
                        <TableCell>{row.success}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Tab */}
          <TabsContent value="cost" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Cost Function</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <ResponsiveContainer width={280} height={250}>
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Card className="flex-1">
                    <CardContent className="p-4 font-mono text-sm">
                      <div className="mb-3">
                        <span className="text-primary font-semibold">C_total</span>
                        <span className="text-foreground"> = 0.30×Energy + 0.25×Time + 0.25×Risk + 0.20×Privacy</span>
                      </div>
                      <div className="text-muted-foreground mb-2">Where:</div>
                      <div className="ml-4 space-y-1 text-muted-foreground text-xs">
                        <div>Energy = base_energy × weather_factor</div>
                        <div>Time = flight_time + delay_minutes</div>
                        <div>Risk = weather_risk + obstacle_risk + reliability</div>
                        <div>Privacy = violations × severity × 25</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Planning Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={planningData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 200]} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="cost" name="Total Weighted Cost" radius={[4, 4, 0, 0]}>
                      {planningData.map((entry, index) => (
                        <Cell key={index} fill={index === 2 ? CHART_COLORS.secondary : CHART_COLORS.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center mt-4 text-stone-400 font-medium">
                  GIS-Enhanced achieves 17.8% cost reduction vs Baseline across 5 cities
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={300} duration={600}>
          <footer className="text-center mt-12 pt-6 border-t text-muted-foreground text-xs">
            <p className="font-medium">UAS Routing Efficiency Simulation</p>
            <p className="mt-1">AP Research Study by Aarush Bhadragiri</p>
            <p className="mt-1 text-muted-foreground/70">Cities: New York, Dallas, San Francisco, Chicago, Los Angeles</p>
          </footer>
        </FadeIn>
      </div>
    </div>
  );
}
