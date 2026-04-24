import React, { useMemo } from 'react';

/**
 * BloodEffects - A haunting visual manifestation of the Crimson Ritual.
 * Renders slow-drifting blood drips and scattered splatters.
 */
export function BloodEffects() {
  // We use useMemo to ensure the random positions stay consistent between renders for a single mount
  const drips = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${(i * 15) + (Math.random() * 5)}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 15}s`,
      height: `${100 + Math.random() * 200}px`,
      width: `${1 + Math.random() * 2}px`
    }));
  }, []);

  const splatters = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${50 + Math.random() * 150}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${8 + Math.random() * 12}s`
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
      {/* Background Splatters */}
      {splatters.map(s => (
        <div 
          key={`splat-${s.id}`}
          className="blood-splatter opacity-0"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `blood-splatter-fade ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay
          }}
        />
      ))}

      {/* Dripping Blood */}
      {drips.map(d => (
        <div 
          key={`drip-${d.id}`}
          className="blood-drip opacity-0"
          style={{
            left: d.left,
            height: d.height,
            width: d.width,
            animation: `blood-drip ${d.duration} linear infinite`,
            animationDelay: d.delay
          }}
        />
      ))}
    </div>
  );
}
