import React, { useState, useRef, useEffect } from 'react';
import { animate, createTimeline, Timeline } from 'animejs';
import Florb, { FlorbData } from './Florb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift } from '@fortawesome/free-solid-svg-icons';
import './FlorbUnboxing.css';

interface UnboxingState {
  phase: 'idle' | 'unwrapping' | 'opening' | 'complete';
  florb: FlorbData | null;
  error: string | null;
  unwrapProgress: number; // 0-1, how much the ribbon is pulled
}

const FlorbUnboxing: React.FC = () => {
  // Helper function to get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('userToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const [unboxingState, setUnboxingState] = useState<UnboxingState>({
    phase: 'idle',
    florb: null,
    error: null,
    unwrapProgress: 0,
  });

  // Refs for animation targets
  const giftBoxRef = useRef<HTMLDivElement>(null);
  const boxLidRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const pullTabRef = useRef<HTMLDivElement>(null);
  const explosionEffectsRef = useRef<HTMLDivElement>(null);

  // Animation timeline
  const timelineRef = useRef<Timeline | null>(null);

  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentPullDistance, setCurrentPullDistance] = useState(0);
  const maxPullDistance = 150; // Maximum distance to pull the ribbon down

  // Idle floating animation for the gift box
  function startIdleAnimation() {
    if (!giftBoxRef.current) return;

    animate(giftBoxRef.current, {
      translateY: [0, -5, 0],
      scale: [1, 1.02, 1],
      duration: 3000,
      ease: 'inOut(2)',
      loop: true
    });

    // Subtle ribbon shimmer
    if (ribbonRef.current) {
      animate(ribbonRef.current, {
        opacity: [0.9, 1, 0.9],
        duration: 2000,
        ease: 'inOut(2)',
        loop: true
      });
    }
  }

  // Stop all animations
  function stopAllAnimations() {
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
  }

  // Gift box opening animation sequence
  async function startBoxOpeningAnimation() {
    console.log('Box opening animation started');

    if (!giftBoxRef.current) {
      console.error('Missing refs for box opening animation');
      return Promise.resolve();
    }

    stopAllAnimations();

    // Create a timeline for the dramatic opening sequence
    const tl = createTimeline({
      autoplay: false
    });

    // 1. Box shakes with anticipation
    tl.add(giftBoxRef.current, {
      scale: [1, 1.1, 1.05],
      rotateZ: [0, 2, -2, 1, -1, 0],
      translateY: [0, -3, 0],
      duration: 600,
      ease: 'out(3)'
    });

    // 2. Box expands and reveals contents
    tl.add(giftBoxRef.current, {
      scale: [1.05, 1.2, 0],
      opacity: [1, 0.8, 0],
      duration: 800,
      ease: 'out(3)'
    }, '-=200');

    // 3. Magical effects burst out
    if (explosionEffectsRef.current) {
      const particles = explosionEffectsRef.current.querySelectorAll('.explosion-particle');
      const shockwave = explosionEffectsRef.current.querySelector('.shockwave');

      // Shockwave
      if (shockwave) {
        tl.add(shockwave, {
          scale: [0, 15],
          opacity: [1, 0.6, 0],
          duration: 1000,
          ease: 'out(4)'
        }, '-=400');
      }

      // Particles explode outward
      if (particles.length > 0) {
        tl.add(particles, {
          scale: [0, 1.2, 0],
          translateX: () => Math.random() * 400 - 200,
          translateY: () => Math.random() * 400 - 200,
          rotate: () => Math.random() * 720,
          opacity: [0, 1, 0.8, 0],
          duration: () => Math.random() * 1500 + 1000,
          delay: (_, i) => i * 50,
          ease: 'out(3)'
        }, '-=600');
      }
    }

    timelineRef.current = tl;
    tl.play();

    return tl.then(() => { });
  };

  // Celebration animation
  function startCelebrationAnimation() {
    // Gentle confetti animation
    animate('.confetti', {
      translateY: ['-50vh', '100vh'],
      rotate: () => Math.random() * 360,
      scale: [0.8, 1, 0.6],
      opacity: [0.8, 1, 0],
      duration: 4000,
      delay: (_, i) => i * 150,
      ease: 'in(2)',
      loop: 3
    });

    // Subtle spotlight pulse
    animate('.florb-spotlight', {
      scale: [1, 1.05, 1],
      opacity: [0.2, 0.4, 0.2],
      duration: 3000,
      ease: 'inOut(2)',
      loop: 5
    });
  };

  // Mouse interaction handlers for ribbon pulling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (unboxingState.phase !== 'idle') return;

    setIsDragging(true);
    setDragStartY(e.clientY);
    setCurrentPullDistance(0);

    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || unboxingState.phase !== 'idle') return;

    const deltaY = e.clientY - dragStartY; // Positive when pulling down
    const newDistance = Math.max(0, Math.min(maxPullDistance, deltaY));
    setCurrentPullDistance(newDistance);

    const progress = newDistance / maxPullDistance;
    setUnboxingState(prev => ({ ...prev, unwrapProgress: progress }));

    // Update visual feedback - lift the lid and move the tab
    if (boxLidRef.current) {
      const lidLift = newDistance * 0.6; // Lid lifts less than tab moves
      const lidTilt = Math.min(progress * 15, 15); // Tilt up to 15 degrees
      boxLidRef.current.style.transform = `translateX(-50%) translateY(-${lidLift}px) rotateX(-${lidTilt}deg)`;
      boxLidRef.current.style.transformOrigin = 'bottom center';
    }

    if (pullTabRef.current) {
      pullTabRef.current.style.transform = `translateX(-50%) translateY(${newDistance}px)`;
    }

    // Add glow effect as we get closer to opening
    if (giftBoxRef.current) {
      const glowOpacity = progress * 0.5;
      giftBoxRef.current.style.filter = `drop-shadow(0 0 ${progress * 20}px rgba(255, 255, 136, ${glowOpacity}))`;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Check if pulled enough to trigger unboxing
    if (currentPullDistance >= maxPullDistance * 0.7) {
      // Success! Start the unboxing process
      generateFlorb();
    } else {
      // Not enough pull, reset with smooth animation
      setUnboxingState(prev => ({ ...prev, unwrapProgress: 0 }));

      // Smooth reset animation
      if (boxLidRef.current) {
        boxLidRef.current.style.transition = 'transform 0.4s ease-out';
        boxLidRef.current.style.transform = 'translateX(-50%)';
        setTimeout(() => {
          if (boxLidRef.current) {
            boxLidRef.current.style.transition = '';
          }
        }, 400);
      }

      if (pullTabRef.current) {
        pullTabRef.current.style.transition = 'transform 0.4s ease-out';
        pullTabRef.current.style.transform = 'translateX(-50%)';
        setTimeout(() => {
          if (pullTabRef.current) {
            pullTabRef.current.style.transition = '';
          }
        }, 400);
      }

      if (giftBoxRef.current) {
        giftBoxRef.current.style.transition = 'filter 0.4s ease-out';
        giftBoxRef.current.style.filter = '';
        setTimeout(() => {
          if (giftBoxRef.current) {
            giftBoxRef.current.style.transition = '';
          }
        }, 400);
      }
    }

    setCurrentPullDistance(0);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const deltaY = e.clientY - dragStartY;
        const newDistance = Math.max(0, Math.min(maxPullDistance, deltaY));
        setCurrentPullDistance(newDistance);

        const progress = newDistance / maxPullDistance;

        // Update lid animation
        if (boxLidRef.current) {
          const lidLift = newDistance * 0.6;
          const lidTilt = Math.min(progress * 15, 15);
          boxLidRef.current.style.transform = `translateX(-50%) translateY(-${lidLift}px) rotateX(-${lidTilt}deg)`;
          boxLidRef.current.style.transformOrigin = 'bottom center';
        }

        if (pullTabRef.current) {
          pullTabRef.current.style.transform = `translateX(-50%) translateY(${newDistance}px)`;
        }

        // Add progressive glow
        if (giftBoxRef.current) {
          const glowOpacity = progress * 0.5;
          giftBoxRef.current.style.filter = `drop-shadow(0 0 ${progress * 20}px rgba(255, 255, 136, ${glowOpacity}))`;
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);

        if (currentPullDistance >= maxPullDistance * 0.7) {
          generateFlorb();
        } else {
          setUnboxingState(prev => ({ ...prev, unwrapProgress: 0 }));

          // Smooth reset animation
          if (boxLidRef.current) {
            boxLidRef.current.style.transition = 'transform 0.4s ease-out';
            boxLidRef.current.style.transform = 'translateX(-50%)';
            setTimeout(() => {
              if (boxLidRef.current) {
                boxLidRef.current.style.transition = '';
              }
            }, 400);
          }

          if (pullTabRef.current) {
            pullTabRef.current.style.transition = 'transform 0.4s ease-out';
            pullTabRef.current.style.transform = 'translateX(-50%)';
            setTimeout(() => {
              if (pullTabRef.current) {
                pullTabRef.current.style.transition = '';
              }
            }, 400);
          }

          if (giftBoxRef.current) {
            giftBoxRef.current.style.transition = 'filter 0.4s ease-out';
            giftBoxRef.current.style.filter = '';
            setTimeout(() => {
              if (giftBoxRef.current) {
                giftBoxRef.current.style.transition = '';
              }
            }, 400);
          }
        }

        setCurrentPullDistance(0);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, currentPullDistance, maxPullDistance]);

  async function generateFlorb() {
    console.log('Ribbon pulled! Starting unboxing sequence...');
    setUnboxingState({
      phase: 'opening',
      florb: null,
      error: null,
      unwrapProgress: 1,
    });

    try {
      // Start box opening animation
      console.log('Starting box opening animation...');
      const openingPromise = startBoxOpeningAnimation();

      // Fetch the new Florb while opening animation plays
      const response = await fetch('/api/florbs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);

      // Extract the florb data from the response
      let newFlorb = responseData.data;

      // Transform the base_image_path to match our component expectations
      if (newFlorb.base_image_path) {
        let transformedPath = newFlorb.base_image_path;

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

        newFlorb = {
          ...newFlorb,
          base_image_path: transformedPath,
        };
      }

      console.log('Generated Florb (transformed):', newFlorb);

      // Validate that we have the required florb data
      if (!newFlorb || !newFlorb.florb_id) {
        throw new Error('Florb generation failed - the magical energies couldn\'t create a proper Florb. Please try again!');
      }

      // Ensure rarity has a default value if not provided
      if (!newFlorb.rarity) {
        newFlorb.rarity = 'Common';
      }

      // Ensure special_effects is an array
      if (!newFlorb.special_effects) {
        newFlorb.special_effects = [];
      }

      // Wait for opening to complete, then reveal
      await openingPromise;

      // Skip revealing phase and go directly to complete
      setUnboxingState({
        phase: 'complete',
        florb: newFlorb,
        error: null,
        unwrapProgress: 1,
      });

      // Start celebration immediately
      startCelebrationAnimation();

    } catch (error) {
      console.error('Error generating Florb:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to generate Florb';
      if (error instanceof Error) {
        if (error.message.includes('Florb generation failed')) {
          errorMessage = error.message; // Use our custom message
        } else if (error.message.includes('HTTP error')) {
          errorMessage = 'Connection issue with the Florb Universe. Please check your connection and try again!';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Unable to connect to the Florb Universe. Please check your internet connection!';
        } else {
          errorMessage = 'Something magical went wrong during unboxing. Please try again!';
        }
      }

      setUnboxingState({
        phase: 'idle',
        florb: null,
        error: errorMessage,
        unwrapProgress: 0,
      });
    }
  };

  function resetUnboxing() {
    stopAllAnimations();
    setUnboxingState({
      phase: 'idle',
      florb: null,
      error: null,
      unwrapProgress: 0,
    });
  };

  // Start idle animation when component mounts or returns to idle
  useEffect(() => {
    if (unboxingState.phase === 'idle') {
      // Add a longer delay to ensure refs are set
      setTimeout(() => {
        console.log('Starting idle animation, giftBoxRef:', giftBoxRef.current);
        startIdleAnimation();
      }, 300);
    }
  }, [unboxingState.phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAnimations();
    };
  }, []);

  return (
    <div className="florb-unboxing">
      <div className="unboxing-container">

        {/* Idle State - Show Cyberpunk Data Container */}
        {unboxingState.phase === 'idle' && (
          <div className="unboxing-idle">
            <div className="gift-box-container">
              <div className="gift-box" ref={giftBoxRef}>
                {/* Cyber glow effects */}
                <div className="cyber-glow"></div>

                {/* Main container body */}
                <div className="box-body">
                  <div className="box-pattern"></div>
                  <div className="data-streams">
                    <div className="data-stream"></div>
                    <div className="data-stream"></div>
                    <div className="data-stream"></div>
                  </div>
                  <div className="status-leds">
                    <div className="status-led led-power"></div>
                    <div className="status-led led-data"></div>
                    <div className="status-led led-network"></div>
                  </div>
                </div>

                {/* Container lid/top panel */}
                <div className="box-lid" ref={boxLidRef}>
                  <div className="box-pattern"></div>
                </div>

                {/* Access panel */}
                <div className="access-panel"></div>

                {/* Interactive hack terminal */}
                <div
                  className="pull-tab"
                  ref={pullTabRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <div className="tab-handle">Pull</div>
                </div>
              </div>

              {/* Floating cyber particles */}
              <div className="cyber-particles">
                <div className="cyber-particle"></div>
                <div className="cyber-particle"></div>
                <div className="cyber-particle"></div>
                <div className="cyber-particle"></div>
                <div className="cyber-particle"></div>
              </div>

              <div className="instruction-text">
                <p>Florb Unboxing</p>
              </div>
            </div>
          </div>
        )}

        {/* Opening Animation */}
        {unboxingState.phase === 'opening' && (
          <div className="unboxing-opening">
            <div className="gift-box-container">
              <div className="gift-box" ref={giftBoxRef}>
                {/* Cyber glow effects */}
                <div className="cyber-glow"></div>

                {/* Main container body */}
                <div className="box-body">
                  <div className="box-pattern"></div>
                  <div className="data-streams">
                    <div className="data-stream"></div>
                    <div className="data-stream"></div>
                    <div className="data-stream"></div>
                  </div>
                  <div className="status-leds">
                    <div className="status-led led-power"></div>
                    <div className="status-led led-data"></div>
                    <div className="status-led led-network"></div>
                  </div>
                </div>

                {/* Container lid/top panel */}
                <div className="box-lid" ref={boxLidRef}>
                  <div className="box-pattern"></div>
                </div>

                {/* Access panel */}
                <div className="access-panel"></div>
              </div>

              <div className="opening-effects" ref={explosionEffectsRef}>
                <div className="shockwave"></div>
                <div className="explosion-particles">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} className={`explosion-particle particle-${i % 3}`}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="opening-text">
              <h2>IT'S FLORBIN TIME</h2>
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}

        {/* Complete State - Show Florb */}
        {unboxingState.phase === 'complete' && unboxingState.florb && (
          <div className="unboxing-complete">
            <div className="florb-presentation">
              <div className="florb-wrapper">
                <Florb
                  florbData={unboxingState.florb}
                  size={280}
                  enableTilt={true}
                />
              </div>
            </div>

            <div className="florb-details">
              <h2 className="florb-name">{unboxingState.florb.name}</h2>
              <div className={`florb-rarity rarity-${(unboxingState.florb.rarity || 'Common').toLowerCase()}`}>
                {unboxingState.florb.rarity || 'Common'}
              </div>
              <p className="florb-description">{unboxingState.florb.description}</p>

              {unboxingState.florb.special_effects && unboxingState.florb.special_effects.length > 0 && (
                <div className="special-effects">
                  <h4>Special Effects:</h4>
                  <div className="effects-list">
                    {unboxingState.florb.special_effects.map((effect, index) => (
                      <span key={index} className={`effect-tag effect-${effect.toLowerCase()}`}>
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="unbox-again-button"
              onClick={resetUnboxing}
            >
              Unbox Another Florb
            </button>
          </div>
        )}

        {/* Error State */}
        {unboxingState.error && (
          <div className="unboxing-error">
            <div className="error-message">
              <h3><FontAwesomeIcon icon={faGift} /> Unboxing Failed</h3>
              <p>{unboxingState.error}</p>
              <button onClick={resetUnboxing} className="retry-button">
                Try Unboxing Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlorbUnboxing;