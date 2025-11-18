import { useState, useEffect } from 'react';
import Florb, { FlorbData } from './Florb';
import FlorbUnboxing from './FlorbUnboxing';
import FlorbInventory from './FlorbInventory';
import WorldMap from './WorldMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faGem, faGlobe, faCoins, faGift } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface UserStats {
  totalFlorbs: number;
  rareFlorbs: number;
  totalGathered: {
    Shleep: number;
    Mlorp: number;
    Spoonch: number;
  };
  placedFlorbs: number;
}

function Dashboard({ username, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'unboxing' | 'inventory' | 'worldmap'>('dashboard');
  const [userStats, setUserStats] = useState<UserStats>({
    totalFlorbs: 0,
    rareFlorbs: 0,
    totalGathered: { Shleep: 0, Mlorp: 0, Spoonch: 0 },
    placedFlorbs: 0
  });
  const [recentFlorbs, setRecentFlorbs] = useState<FlorbData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('userToken');

        // Load user stats
        const statsResponse = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setUserStats(stats);
        }

        // Load recent florbs
        const florbsResponse = await fetch('/api/user/florbs?limit=6', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (florbsResponse.ok) {
          const florbsData = await florbsResponse.json();
          
          // Transform florb data to match component expectations
          const transformedFlorbs = (florbsData.florbs || []).map((florb: FlorbData) => {
            let transformedFlorb = { ...florb };
            
            // Transform the baseImagePath to match our component expectations
            if (transformedFlorb.baseImagePath) {
              let transformedPath = transformedFlorb.baseImagePath;
              
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
              
              transformedFlorb.baseImagePath = transformedPath;
            }
            
            // Ensure rarity has a default value
            if (!transformedFlorb.rarity) {
              transformedFlorb.rarity = 'Common';
            }
            
            // Ensure specialEffects is an array
            if (!transformedFlorb.specialEffects) {
              transformedFlorb.specialEffects = [];
            }
            
            return transformedFlorb;
          });
          
          setRecentFlorbs(transformedFlorbs);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  function handleFlorbClick(florbData: FlorbData) {
    console.log('Florb clicked:', florbData.name);
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    onLogout();
  };

  if (currentView === 'inventory') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="back-button"
          >
            ← Back to Dashboard
          </button>
          <div className="user-info">
            <span className="username">Welcome, {username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <FlorbInventory />
      </div>
    );
  }

  if (currentView === 'worldmap') {
    return <WorldMap onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'unboxing') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="back-button"
          >
            ← Back to Dashboard
          </button>
          <div className="user-info">
            <span className="username">Welcome, {username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <FlorbUnboxing />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Florb Dashboard</h1>
        <div className="user-info">
          <span className="username">Welcome, {username}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* User Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card sheen-effect" style={{ '--card-index': 0 } as React.CSSProperties}>
              <div className="stat-icon"><FontAwesomeIcon icon={faBox} /></div>
              <div className="stat-content">
                <div className="stat-number">{userStats.totalFlorbs}</div>
                <div className="stat-label">Total Florbs</div>
              </div>
            </div>

            <div className="stat-card sheen-effect" style={{ '--card-index': 1 } as React.CSSProperties}>
              <div className="stat-icon"><FontAwesomeIcon icon={faGem} /></div>
              <div className="stat-content">
                <div className="stat-number">{userStats.rareFlorbs}</div>
                <div className="stat-label">Rare Florbs</div>
              </div>
            </div>

            <div className="stat-card sheen-effect" style={{ '--card-index': 2 } as React.CSSProperties}>
              <div className="stat-icon"><FontAwesomeIcon icon={faGlobe} /></div>
              <div className="stat-content">
                <div className="stat-number">{userStats.placedFlorbs}</div>
                <div className="stat-label">Placed Florbs</div>
              </div>
            </div>

            <div className="stat-card sheen-effect" style={{ '--card-index': 3 } as React.CSSProperties}>
              <div className="stat-icon"><FontAwesomeIcon icon={faCoins} /></div>
              <div className="stat-content">
                <div className="stat-number">
                  {userStats.totalGathered.Shleep + userStats.totalGathered.Mlorp + userStats.totalGathered.Spoonch}
                </div>
                <div className="stat-label">Total Resources</div>
              </div>
            </div>
          </div>

          {/* Recent Florbs */}
          <div className="recent-florbs-section">
            <h2>Recent Florbs</h2>
            {recentFlorbs.length > 0 ? (
              <div className="recent-florbs-grid">
                {recentFlorbs.map((florb, index) => (
                  <div 
                    key={florb.florbId} 
                    className="recent-florb-card"
                    style={{ '--florb-index': index } as React.CSSProperties}
                  >
                    <Florb
                      florbData={florb}
                      size={120}
                      onClick={() => handleFlorbClick(florb)}
                    />
                    <div className="florb-info">
                      <h4>{florb.name}</h4>
                      <p>Rarity: {florb.rarity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No Florbs yet! Try unboxing some.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-actions">
            <button
              onClick={() => setCurrentView('unboxing')}
              className="action-button unboxing-button sheen-effect"
              style={{ '--action-index': 0 } as React.CSSProperties}
            >
              <div className="action-icon"><FontAwesomeIcon icon={faGift} /></div>
              <div className="action-content">
                <div className="action-title">Unbox Florbs</div>
                <div className="action-description">Try your luck and collect new Florbs</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('inventory')}
              className="action-button inventory-button sheen-effect"
              style={{ '--action-index': 1 } as React.CSSProperties}
            >
              <div className="action-icon"><FontAwesomeIcon icon={faBox} /></div>
              <div className="action-content">
                <div className="action-title">View Collection</div>
                <div className="action-description">Browse and manage your Florb collection</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('worldmap')}
              className="action-button worldmap-button sheen-effect"
              style={{ '--action-index': 2 } as React.CSSProperties}
            >
              <div className="action-icon"><FontAwesomeIcon icon={faGlobe} /></div>
              <div className="action-content">
                <div className="action-title">World Map</div>
                <div className="action-description">Place your Florbs and gather resources</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;