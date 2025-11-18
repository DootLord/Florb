import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { LatLngTuple, Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';

// Import Florb component and types
import Florb, { FlorbData } from './Florb';

// Resource types
export interface ResourceNode {
  id: string;
  position: LatLngTuple;
  type: 'Shleep' | 'Mlorp' | 'Spoonch';
  amount: number;
}

// Placed Florb on map
export interface PlacedFlorb {
  id: string;
  florbData: FlorbData;
  position: LatLngTuple;
  placedAt: Date;
  gatheringRadius: number;
  duration: number; // in hours
  effectiveness: number; // multiplier for gathering
  lastGathered?: Date;
  totalGathered?: { Shleep: number; Mlorp: number; Spoonch: number };
}

// Rarity configurations for gathering mechanics
const RARITY_CONFIGS = {
  Grey: { radius: 50, duration: 2, effectiveness: 1.0 },
  Common: { radius: 75, duration: 4, effectiveness: 1.2 },
  Uncommon: { radius: 100, duration: 6, effectiveness: 1.5 },
  Rare: { radius: 150, duration: 8, effectiveness: 2.0 },
  Epic: { radius: 200, duration: 12, effectiveness: 2.5 },
  Legendary: { radius: 300, duration: 24, effectiveness: 3.0 },
};

// Helper function to get color based on rarity
function getRarityColor(rarity: string): string {
  const colors = {
    Grey: '#9e9e9e',
    Common: '#8bc34a',
    Uncommon: '#2196f3',
    Rare: '#9c27b0',
    Epic: '#ff9800',
    Legendary: '#ff5722'
  };
  return colors[rarity as keyof typeof colors] || '#9e9e9e';
}

// Component for handling map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (position: LatLngTuple) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Component for handling map drop events with proper Leaflet integration
function MapDropHandler({ onMapDrop }: { onMapDrop: (position: LatLngTuple) => void }) {
  const map = useMapEvents({
    // This component will be used to get access to the map instance
  });

  // Use useEffect to attach DOM event listeners to the map container
  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getContainer();

    function handleDragOver(e: Event) {
      e.preventDefault();
    }

    function handleDrop(e: Event) {
      e.preventDefault();
      const dragEvent = e as DragEvent;

      if (!dragEvent.dataTransfer) return;

      // Get the point relative to the map container
      const rect = mapContainer.getBoundingClientRect();
      const x = dragEvent.clientX - rect.left;
      const y = dragEvent.clientY - rect.top;

      // Convert to Leaflet Point and then to LatLng
      const point = new (window as any).L.Point(x, y);
      const latlng = map.containerPointToLatLng(point);

      onMapDrop([latlng.lat, latlng.lng]);
    }

    mapContainer.addEventListener('dragover', handleDragOver);
    mapContainer.addEventListener('drop', handleDrop);

    return () => {
      mapContainer.removeEventListener('dragover', handleDragOver);
      mapContainer.removeEventListener('drop', handleDrop);
    };
  }, [map, onMapDrop]);

  return null;
}

interface WorldMapProps {
  onBack: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ onBack }) => {
  // Helper function to get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('userToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  // Create Florb icon for placed Florbs with full styling
  function createFlorbIcon(florbData: FlorbData) {
    // Create a div element to hold the Florb component
    const florbElement = document.createElement('div');
    florbElement.style.width = '40px';
    florbElement.style.height = '40px';
    florbElement.style.position = 'relative';
    florbElement.style.borderRadius = '50%';
    florbElement.style.overflow = 'hidden';
    florbElement.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    florbElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    florbElement.style.background = 'rgba(255, 255, 255, 0.9)';

    // Create the Florb component HTML structure
    const florbContainer = document.createElement('div');
    florbContainer.style.width = '100%';
    florbContainer.style.height = '100%';
    florbContainer.style.position = 'relative';

    // Base image
    const baseImage = document.createElement('img');
    baseImage.src = florbData.base_image_path || '';
    baseImage.style.width = '100%';
    baseImage.style.height = '100%';
    baseImage.style.objectFit = 'cover';
    baseImage.style.borderRadius = '50%';
    baseImage.draggable = false;

    // Gradient overlay
    const gradientOverlay = document.createElement('div');
    const gradient = generateGradientString(florbData);
    gradientOverlay.style.position = 'absolute';
    gradientOverlay.style.top = '0';
    gradientOverlay.style.left = '0';
    gradientOverlay.style.width = '100%';
    gradientOverlay.style.height = '100%';
    gradientOverlay.style.background = gradient;
    gradientOverlay.style.opacity = (florbData.gradient_intensity || 0.5).toString();
    gradientOverlay.style.borderRadius = '50%';
    gradientOverlay.style.pointerEvents = 'none';

    // Special effects
    const hasHolo = florbData.special_effects?.includes('Holo') || false;
    const hasFoil = florbData.special_effects?.includes('Foil') || false;
    const hasShimmer = florbData.special_effects?.includes('Shimmer') || false;
    const hasGlow = florbData.special_effects?.includes('Glow') || false;

    // Add CSS classes for effects
    const classNames = [
      'florb-map-marker',
      hasHolo && 'florb-holo',
      hasFoil && 'florb-foil',
      hasShimmer && 'florb-shimmer',
      hasGlow && 'florb-glow',
    ].filter(Boolean).join(' ');

    florbElement.className = classNames;

    // Assemble the elements
    florbContainer.appendChild(baseImage);
    florbContainer.appendChild(gradientOverlay);
    florbElement.appendChild(florbContainer);

    return new DivIcon({
      html: florbElement.outerHTML,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'florb-div-icon'
    });
  };

  // Helper function to generate gradient string
  function generateGradientString(florbData: FlorbData) {
    const colors = florbData.gradient_colors || [];
    const direction = florbData.gradient_direction || 'radial';
    if (direction === 'radial') {
      return `radial-gradient(circle, ${colors.join(', ')})`;
    }
    return `linear-gradient(45deg, ${colors.join(', ')})`;
  };

  // Create resource node icon
  function createResourceIcon(type: 'Shleep' | 'Mlorp' | 'Spoonch') {
    const colors = {
      Shleep: '#4caf50',
      Mlorp: '#2196f3',
      Spoonch: '#ff9800'
    };

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="${colors[type]}" stroke="white" stroke-width="2"/>
          <text x="15" y="19" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
            ${type.charAt(0)}
          </text>
        </svg>
      `)}`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      className: `resource-${type.toLowerCase()}`
    });
  };

  // Default center position (somewhere in the world)
  const defaultCenter: LatLngTuple = [40.7128, -74.0060]; // New York City
  const defaultZoom = 13; // Increased zoom for better radius visibility

  const [placedFlorbs, setPlacedFlorbs] = useState<PlacedFlorb[]>([]);
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedFlorb, setDraggedFlorb] = useState<FlorbData | null>(null);
  const [playerResources, setPlayerResources] = useState({ Shleep: 0, Mlorp: 0, Spoonch: 0 });
  const [inventoryFlorbs, setInventoryFlorbs] = useState<FlorbData[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [showRadii, setShowRadii] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load placed Florbs
        const florbsResponse = await fetch('/api/world-map/florbs', {
          headers: getAuthHeaders()
        });
        if (florbsResponse.ok) {
          const florbsData = await florbsResponse.json();
          const parsedFlorbs = florbsData.map((florb: any) => ({
            ...florb,
            placedAt: new Date(florb.placedAt),
            lastGathered: florb.lastGathered ? new Date(florb.lastGathered) : undefined,
          }));
          setPlacedFlorbs(parsedFlorbs);
        }

        // Load resource nodes
        const resourcesResponse = await fetch('/api/world-map/resources', {
          headers: getAuthHeaders()
        });
        if (resourcesResponse.ok) {
          const resourcesData = await resourcesResponse.json();
          setResourceNodes(resourcesData);
        } else {
          // Generate dummy resource nodes if API fails
          generateResourceNodes();
        }

        // Load player resources
        const playerResourcesResponse = await fetch('/api/world-map/player-resources', {
          headers: getAuthHeaders()
        });
        if (playerResourcesResponse.ok) {
          const playerResourcesData = await playerResourcesResponse.json();
          setPlayerResources(playerResourcesData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to generating resource nodes
        generateResourceNodes();
      }
    };

    loadInitialData();
  }, []);

  // Fetch Florbs from API
  useEffect(() => {
    const fetchFlorbs = async () => {
      try {
        setInventoryLoading(true);
        setInventoryError(null);

        const response = await fetch('/api/florbs', {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched Florbs for WorldMap:', data);

        // Extract florbs from the nested data structure (same logic as FlorbInventory)
        let florbsArray = [];
        if (Array.isArray(data)) {
          florbsArray = data;
        } else if (data.data && Array.isArray(data.data.florbs)) {
          florbsArray = data.data.florbs;
        } else if (Array.isArray(data.florbs)) {
          florbsArray = data.florbs;
        }

        // Transform the florb data to match our component expectations
        const transformedFlorbs = florbsArray.map((florb: any) => {
          // Convert API path format to public path format
          let transformedPath = florb.baseImagePath;

          // Handle different possible API path formats
          if (transformedPath.startsWith('src/assets/florb_base/')) {
            // Remove the src/assets/florb_base/ prefix and keep just the filename
            transformedPath = '/' + transformedPath.replace('src/assets/florb_base/', '');
          } else if (transformedPath.startsWith('assets/florb_base/')) {
            // Remove the assets/florb_base/ prefix
            transformedPath = '/' + transformedPath.replace('assets/florb_base/', '');
          } else if (transformedPath.startsWith('florb_base/')) {
            // Remove the florb_base/ prefix
            transformedPath = '/' + transformedPath.replace('florb_base/', '');
          } else if (!transformedPath.startsWith('/') && !transformedPath.startsWith('http')) {
            // If it's just a filename, add the leading slash
            transformedPath = '/' + transformedPath;
          }

          return {
            ...florb,
            baseImagePath: transformedPath,
          };
        });

        console.log('WorldMap extracted florbs array:', transformedFlorbs);

        setInventoryFlorbs(transformedFlorbs);
        setInventoryLoading(false);
      } catch (error) {
        console.error('Error fetching Florbs for WorldMap:', error);
        setInventoryError(error instanceof Error ? error.message : 'Failed to fetch Florbs');
        setInventoryLoading(false);
      }
    };

    fetchFlorbs();
  }, []);

  // API helper functions
  async function savePlacedFlorbs(florbs: PlacedFlorb[]) {
    try {
      await fetch('/api/world-map/florbs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(florbs),
      });
    } catch (error) {
      console.error('Error saving placed Florbs:', error);
    }
  };

  async function saveResourceNodes(resources: ResourceNode[]) {
    try {
      await fetch('/api/world-map/resources', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(resources),
      });
    } catch (error) {
      console.error('Error saving resource nodes:', error);
    }
  };

  async function savePlayerResources(resources: { Shleep: number; Mlorp: number; Spoonch: number }) {
    try {
      await fetch('/api/world-map/player-resources', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(resources),
      });
    } catch (error) {
      console.error('Error saving player resources:', error);
    }
  };

  // Save placed Florbs whenever they change
  useEffect(() => {
    if (placedFlorbs.length > 0) {
      savePlacedFlorbs(placedFlorbs);
    }
  }, [placedFlorbs]);

  // Save resource nodes whenever they change
  useEffect(() => {
    if (resourceNodes.length > 0) {
      saveResourceNodes(resourceNodes);
    }
  }, [resourceNodes]);

  // Save player resources whenever they change
  useEffect(() => {
    savePlayerResources(playerResources);
  }, [playerResources]);

  // Periodic gathering effect
  useEffect(() => {
    const gatheringInterval = setInterval(() => {
      performGathering();
    }, 10000); // Gather every 10 seconds for demo purposes

    return () => clearInterval(gatheringInterval);
  }, [placedFlorbs, resourceNodes]);

  // Generate random resource nodes across the map
  function generateResourceNodes() {
    const nodes: ResourceNode[] = [];
    const resourceTypes: ('Shleep' | 'Mlorp' | 'Spoonch')[] = ['Shleep', 'Mlorp', 'Spoonch'];

    for (let i = 0; i < 50; i++) {
      const lat = defaultCenter[0] + (Math.random() - 0.5) * 10; // Within ~10 degrees lat
      const lng = defaultCenter[1] + (Math.random() - 0.5) * 10; // Within ~10 degrees lng
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const amount = Math.floor(Math.random() * 100) + 10; // 10-110 resources

      nodes.push({
        id: `resource_${i}`,
        position: [lat, lng],
        type,
        amount,
      });
    }

    setResourceNodes(nodes);
  };

  // Calculate distance between two lat/lng points in meters
  function calculateDistance(pos1: LatLngTuple, pos2: LatLngTuple): number {
    const R = 6371e3; // Earth's radius in meters
    const lat1Rad = pos1[0] * Math.PI / 180;
    const lat2Rad = pos2[0] * Math.PI / 180;
    const deltaLatRad = (pos2[0] - pos1[0]) * Math.PI / 180;
    const deltaLngRad = (pos2[1] - pos1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Perform gathering for all placed Florbs
  async function performGathering() {
    const now = new Date();
    let totalGathered = { Shleep: 0, Mlorp: 0, Spoonch: 0 };

    setPlacedFlorbs(prevFlorbs => {
      return prevFlorbs.map(florb => {
        // Check if Florb has expired
        const hoursSincePlaced = (now.getTime() - florb.placedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSincePlaced >= florb.duration) {
          return florb; // Keep expired Florbs for now, just don't gather from them
        }

        // Find resource nodes within gathering radius
        const nearbyNodes = resourceNodes.filter(node => {
          const distance = calculateDistance(florb.position, node.position);
          return distance <= florb.gatheringRadius;
        });

        if (nearbyNodes.length === 0) return florb;

        // Calculate gathering amount based on effectiveness and time since last gather
        const timeSinceLastGather = florb.lastGathered
          ? (now.getTime() - florb.lastGathered.getTime()) / (1000 * 60 * 60) // hours
          : 1; // First gather

        const baseGatherRate = 1; // Base resources per hour
        const gatherAmount = Math.floor(baseGatherRate * florb.effectiveness * timeSinceLastGather);

        // Gather from nearby nodes
        nearbyNodes.forEach(node => {
          if (node.amount > 0) {
            const amountToGather = Math.min(gatherAmount, node.amount);
            totalGathered[node.type as keyof typeof totalGathered] += amountToGather;

            // Update resource node amount
            setResourceNodes(prevNodes =>
              prevNodes.map(n =>
                n.id === node.id
                  ? { ...n, amount: Math.max(0, n.amount - amountToGather) }
                  : n
              )
            );
          }
        });

        // Update Florb's gathering stats
        return {
          ...florb,
          lastGathered: now,
          totalGathered: {
            Shleep: (florb.totalGathered?.Shleep || 0) + totalGathered.Shleep,
            Mlorp: (florb.totalGathered?.Mlorp || 0) + totalGathered.Mlorp,
            Spoonch: (florb.totalGathered?.Spoonch || 0) + totalGathered.Spoonch,
          }
        };
      });
    });

    // Update player resources
    if (totalGathered.Shleep > 0 || totalGathered.Mlorp > 0 || totalGathered.Spoonch > 0) {
      setPlayerResources(prev => ({
        Shleep: prev.Shleep + totalGathered.Shleep,
        Mlorp: prev.Mlorp + totalGathered.Mlorp,
        Spoonch: prev.Spoonch + totalGathered.Spoonch,
      }));

      // Send gathering results to API
      try {
        await fetch('/api/world-map/gather', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            gathered: totalGathered,
            timestamp: now.toISOString(),
          }),
        });
      } catch (error) {
        console.error('Error sending gathering data to API:', error);
        // Continue with local updates even if API fails
      }

      // Show gathering notification
      console.log(`Gathered: ${totalGathered.Shleep} Shleep, ${totalGathered.Mlorp} Mlorp, ${totalGathered.Spoonch} Spoonch`);
    }
  };

  // Handle map click for placing Florbs (now used for drag and drop)
  function handleMapClick(position: LatLngTuple) {
    if (draggedFlorb) {
      placeFlorbAt(position);
      setDraggedFlorb(null);
    }
  };

  // Handle drop on map
  function handleMapDrop(position: LatLngTuple) {
    if (draggedFlorb) {
      placeFlorbAt(position);
      setDraggedFlorb(null);
    }
  };

  // Place a Florb at the specified position
  async function placeFlorbAt(position: LatLngTuple) {
    const florbToPlace = draggedFlorb;
    if (!florbToPlace) return;

    const config = RARITY_CONFIGS[florbToPlace.rarity as keyof typeof RARITY_CONFIGS] || RARITY_CONFIGS.Grey;

    const newPlacedFlorb: PlacedFlorb = {
      id: `placed_${Date.now()}`,
      florbData: florbToPlace,
      position,
      placedAt: new Date(),
      gatheringRadius: config.radius,
      duration: config.duration,
      effectiveness: config.effectiveness,
    };

    // Optimistically update UI
    setPlacedFlorbs(prev => [...prev, newPlacedFlorb]);

    try {
      // Send to API
      const response = await fetch('/api/world-map/florbs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(newPlacedFlorb),
      });

      if (!response.ok) {
        throw new Error('Failed to save Florb placement');
      }

      const savedFlorb = await response.json();
      // Ensure dates are properly converted to Date objects
      const processedSavedFlorb = {
        ...savedFlorb,
        placedAt: new Date(savedFlorb.placedAt),
        lastGathered: savedFlorb.lastGathered ? new Date(savedFlorb.lastGathered) : undefined,
      };
      // Update with server response (might have different ID or additional data)
      setPlacedFlorbs(prev => prev.map(f => f.id === newPlacedFlorb.id ? processedSavedFlorb : f));
    } catch (error) {
      console.error('Error placing Florb:', error);
      // Revert optimistic update
      setPlacedFlorbs(prev => prev.filter(f => f.id !== newPlacedFlorb.id));
      // Could show error toast here
    }

    setDraggedFlorb(null);
  };

  return (
    <div className="world-map-container">
      <div className="world-map-header">
        <button onClick={onBack} className="back-button">
          ← Back to Demo
        </button>
        <h1 className="world-map-title">Florb World Map</h1>
        <div className="map-controls">
          <div className="resource-counters">
            <div className="resource-item">
              <span className="resource-icon">🟢</span>
              <span className="resource-name">Shleep:</span>
              <span className="resource-amount">{playerResources.Shleep}</span>
            </div>
            <div className="resource-item">
              <span className="resource-icon">�</span>
              <span className="resource-name">Mlorp:</span>
              <span className="resource-amount">{playerResources.Mlorp}</span>
            </div>
            <div className="resource-item">
              <span className="resource-icon">�</span>
              <span className="resource-name">Spoonch:</span>
              <span className="resource-amount">{playerResources.Spoonch}</span>
            </div>
          </div>
          <button
            onClick={() => setShowRadii(!showRadii)}
            className={`radius-toggle ${showRadii ? 'active' : ''}`}
            title={showRadii ? 'Hide Gathering Radii' : 'Show Gathering Radii'}
          >
            {showRadii ? '�️' : '👁️‍🗨️'} Radius
          </button>
          <div className="map-stats">
            <span>Placed Florbs: {placedFlorbs.length}</span>
            <span>Resources: {resourceNodes.length}</span>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`sidebar-toggle ${isSidebarOpen ? 'open' : ''}`}
      >
        {isSidebarOpen ? '←' : '→'} Florbs
      </button>

      {/* Florb Sidebar */}
      {isSidebarOpen && (
        <div className="florb-sidebar">
          <h3>Your Florbs</h3>
          {inventoryLoading ? (
            <div className="sidebar-loading">
              <div className="loading-spinner"></div>
              <p>Loading Florbs...</p>
            </div>
          ) : inventoryError ? (
            <div className="sidebar-error">
              <p>Failed to load Florbs</p>
              <p className="error-details">{inventoryError}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="florb-inventory">
              {inventoryFlorbs.length === 0 ? (
                <p className="no-florbs">No Florbs in inventory</p>
              ) : (
                inventoryFlorbs.map((florb) => (
                  <div
                    key={florb.florb_id}
                    className="florb-inventory-item"
                    draggable
                    onDragStart={(e) => {
                      setDraggedFlorb(florb);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                      setDraggedFlorb(null);
                    }}
                  >
                    <Florb
                      florbData={florb}
                      size={80}
                      enableTilt={false}
                    />
                    <div className="florb-inventory-info">
                      <h4>{florb.name}</h4>
                      <p>Rarity: {florb.rarity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="map-wrapper">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapClickHandler onMapClick={handleMapClick} />
          <MapDropHandler onMapDrop={handleMapDrop} />

          {/* Render placed Florbs */}
          {placedFlorbs.map((placedFlorb) => (
            <Marker
              key={placedFlorb.id}
              position={placedFlorb.position}
              icon={createFlorbIcon(placedFlorb.florbData)}
            >
              <Popup>
                <div className="florb-popup">
                  <Florb
                    florbData={placedFlorb.florbData}
                    size={80}
                    enableTilt={false}
                  />
                  <div className="florb-info">
                    <h4>{placedFlorb.florbData.name}</h4>
                    <p>Rarity: {placedFlorb.florbData.rarity}</p>
                    <p>Gathering Radius: {placedFlorb.gatheringRadius}m</p>
                    <p>Duration: {placedFlorb.duration}h</p>
                    <p>Effectiveness: {placedFlorb.effectiveness}x</p>
                    <p>Placed: {placedFlorb.placedAt.toLocaleString()}</p>
                    {placedFlorb.totalGathered && (
                      <div className="gathering-stats">
                        <p><strong>Total Gathered:</strong></p>
                        <p>Shleep: {placedFlorb.totalGathered.Shleep}</p>
                        <p>Mlorp: {placedFlorb.totalGathered.Mlorp}</p>
                        <p>Spoonch: {placedFlorb.totalGathered.Spoonch}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render gathering radii circles */}
          {showRadii && placedFlorbs.map((placedFlorb) => (
            <Circle
              key={`radius-${placedFlorb.id}`}
              center={placedFlorb.position}
              radius={placedFlorb.gatheringRadius}
              pathOptions={{
                color: getRarityColor(placedFlorb.florbData.rarity || 'Common'),
                fillColor: getRarityColor(placedFlorb.florbData.rarity || 'Common'),
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '8, 4'
              }}
            />
          ))}

          {/* Render resource nodes */}
          {resourceNodes.map((node) => (
            <Marker
              key={node.id}
              position={node.position}
              icon={createResourceIcon(node.type)}
            >
              <Popup>
                <div className="resource-popup">
                  <h4>{node.type} Node</h4>
                  <p>Amount: {node.amount}</p>
                  <p>Type: {node.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default WorldMap;