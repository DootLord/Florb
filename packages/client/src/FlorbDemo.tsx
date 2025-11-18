import { useState } from 'react';
import Florb, { FlorbData } from './components/Florb';
import FlorbUnboxing from './components/FlorbUnboxing';
import FlorbInventory from './components/FlorbInventory';
import WorldMap from './components/WorldMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faBox, faGlobe } from '@fortawesome/free-solid-svg-icons';
import './FlorbDemo.css';

// Sample Florb data based on your DB example
const sampleFlorbData: FlorbData = {
  florb_id: "florb_dc0a11c3feec326c",
  name: "Grey Florb",
  base_image_path: "/sharp.png",
  rarity: "Common",
  special_effects: [],
  gradient_colors: ["#404040", "#606060", "#505050", "#454545"],
  gradient_direction: "radial",
  gradient_intensity: 0.3,
  description: "A grey rarity florb with none effects.",
  tags: ["grey", "none"]
};

// Sample Florb with special effects
const holoFlorbData: FlorbData = {
  florb_id: "florb_holo_example",
  name: "Legendary Holo Florb",
  base_image_path: "/sharp.png",
  rarity: "Legendary",
  special_effects: ["Holo", "Glow"],
  gradient_colors: ["#f59e0b", "#fbbf24", "#f97316", "#ea580c"],
  gradient_direction: "radial",
  gradient_intensity: 0.5,
  description: "A legendary florb with holographic effects.",
  tags: ["legendary", "holo", "glow"]
};

const foilFlorbData: FlorbData = {
  florb_id: "florb_foil_example",
  name: "Epic Foil Florb",
  base_image_path: "/sharp.png",
  rarity: "Epic",
  special_effects: ["Foil", "Shimmer"],
  gradient_colors: ["#a855f7", "#c084fc", "#8b5cf6", "#7c3aed"],
  gradient_direction: "linear",
  gradient_intensity: 0.4,
  description: "An epic florb with foil and shimmer effects.",
  tags: ["epic", "foil", "shimmer"]
};

function FlorbDemo() {
  const [currentView, setCurrentView] = useState<'demo' | 'unboxing' | 'inventory' | 'worldmap'>('demo');

  function handleFlorbClick(florbData: FlorbData) {
    console.log('Florb clicked:', florbData.name);
  }

  if (currentView === 'inventory') {
    return (
      <div className="demo-container">
        <button 
          onClick={() => setCurrentView('demo')}
          className="back-button"
        >
          ← Back to Demo
        </button>
        <FlorbInventory />
      </div>
    );
  }

  if (currentView === 'worldmap') {
    return <WorldMap onBack={() => setCurrentView('demo')} />;
  }

  if (currentView === 'unboxing') {
    return (
      <div className="demo-container">
        <button 
          onClick={() => setCurrentView('demo')}
          className="back-button"
        >
          ← Back to Demo
        </button>
        <FlorbUnboxing />
      </div>
    );
  }

  return (
    <div className="demo-container">
      <h1 className="demo-title">
        Florb Component Demo
      </h1>
      
      <div className="florb-grid">
        <div className="florb-showcase">
          <h3 className="florb-showcase-title">Grey Florb (Basic)</h3>
          <Florb
            florbData={sampleFlorbData}
            size={200}
            onClick={() => handleFlorbClick(sampleFlorbData)}
          />
        </div>
        
        <div className="florb-showcase">
          <h3 className="florb-showcase-title">Legendary Holo Florb</h3>
          <Florb
            florbData={holoFlorbData}
            size={200}
            onClick={() => handleFlorbClick(holoFlorbData)}
          />
        </div>
        
        <div className="florb-showcase">
          <h3 className="florb-showcase-title">Epic Foil Florb</h3>
          <Florb
            florbData={foilFlorbData}
            size={200}
            onClick={() => handleFlorbClick(foilFlorbData)}
          />
        </div>
      </div>
      
      <div className="demo-info">
        <h2>Features:</h2>
        <ul className="features-list">
          <li>Mouse tilt effect that follows cursor position</li>
          <li>Grayscale base images with customizable gradients</li>
          <li>Multiple special effects: Holo, Foil, Shimmer, Glow</li>
          <li>Rarity-based styling and colors</li>
          <li>Responsive design and accessibility features</li>
          <li>Smooth animations and transitions</li>
        </ul>
        
        <div className="demo-actions">
          <button
            onClick={() => setCurrentView('unboxing')}
            className="unboxing-cta-button"
          >
            <FontAwesomeIcon icon={faGift} /> Try Florb Unboxing Experience
          </button>
          
          <button
            onClick={() => setCurrentView('inventory')}
            className="inventory-cta-button"
          >
            <FontAwesomeIcon icon={faBox} /> View Florb Inventory
          </button>

          <button
            onClick={() => setCurrentView('worldmap')}
            className="worldmap-cta-button"
          >
            <FontAwesomeIcon icon={faGlobe} /> Explore World Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlorbDemo;
