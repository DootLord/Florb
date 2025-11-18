import React, { useRef, useEffect, useState } from 'react';
import './Florb.css';

export interface FlorbData {
  id?: string;
  florb_id: string | null;
  name?: string;
  base_image_path: string | null;
  rarity: string | null;
  special_effects: string[];
  gradient_colors: any | null; // Json
  gradient_direction: string | null;
  gradient_intensity: number | null;
  description?: string | null;
  tags?: any | null; // Json
  created_at?: Date | null;
  updated_at?: Date | null;
  collection_id?: string | null;
}

export interface FlorbProps {
  florbData: FlorbData;
  size?: number;
  enableTilt?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Florb: React.FC<FlorbProps> = ({
  florbData,
  size = 200,
  enableTilt = true,
  className = '',
  style,
  onClick,
}) => {
  const florbRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const { base_image_path, gradient_colors, gradient_direction, gradient_intensity, special_effects, name, rarity } = florbData;

  useEffect(() => {
    if (!enableTilt) return;

    function handleMouseMove(e: MouseEvent) {
      if (!florbRef.current) return;

      const rect = florbRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on mouse position
      const rotateX = ((y - centerY) / centerY) * 15; // Max 15 degrees
      const rotateY = ((centerX - x) / centerX) * 15; // Max 15 degrees

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      });
    }

    function handleMouseLeave() {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.3s ease-out',
      });
    }

    const element = florbRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [enableTilt]);

  // Generate gradient string based on config
  function generateGradient() {
    const colors = gradient_colors || [];
    const direction = gradient_direction || 'radial';
    if (direction === 'radial') {
      return `radial-gradient(circle, ${colors.join(', ')})`;
    }
    return `linear-gradient(45deg, ${colors.join(', ')})`;
  }

  // Check for special effects
  const hasHolo = special_effects?.includes('Holo') || false;
  const hasFoil = special_effects?.includes('Foil') || false;
  const hasShimmer = special_effects?.includes('Shimmer') || false;
  const hasGlow = special_effects?.includes('Glow') || false;

  // Build class names
  const classNames = [
    'florb',
    `florb-rarity-${(rarity || 'Common').toLowerCase()}`,
    hasHolo && 'florb-holo',
    hasFoil && 'florb-foil',
    hasShimmer && 'florb-shimmer',
    hasGlow && 'florb-glow',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={florbRef}
      className={classNames}
      style={{
        width: size,
        height: size,
        '--florb-mask-image': `url(${base_image_path})`,
        ...style,
        ...tiltStyle,
      } as React.CSSProperties & { '--florb-mask-image': string }}
      onClick={onClick}
      title={name || 'Florb'}
    >
      {/* Base Image */}
      <img
        src={base_image_path || ''}
        alt={name || 'Florb'}
        className="florb-base-image"
        draggable={false}
      />
      
      {/* Gradient Overlay */}
      <div
        className="florb-gradient-overlay"
        style={{
          background: generateGradient(),
          opacity: gradient_intensity || 0.5,
        }}
      />
      
      {/* Foil Effect */}
      {hasFoil && (
        <div className="florb-foil-effect">
          <div className="foil-shimmer" />
        </div>
      )}
      
      {/* Holo Effect */}
      {hasHolo && (
        <div className="florb-holo-effect">
          <div className="holo-rainbow" />
          <div className="holo-sparkles" />
        </div>
      )}
      
      {/* Shimmer Effect */}
      {hasShimmer && (
        <div className="florb-shimmer-effect">
          <div className="shimmer-wave" />
        </div>
      )}
      
      {/* Glow Effect */}
      {hasGlow && <div className="florb-glow-effect" />}
    </div>
  );
};

export default Florb;
