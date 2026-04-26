import { useMemo } from 'react';
import { motion } from 'motion/react';

interface StarProps {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'small' | 'medium' | 'large';
}

const STAR_COUNT = 90;

export function StarBackground() {
  const stars = useMemo<StarProps[]>(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => {
      const r = Math.random();
      const type = r < 0.7 ? 'small' : r < 0.92 ? 'medium' : 'large';
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: type === 'small' ? 1.5 + Math.random() : type === 'medium' ? 3 + Math.random() * 2 : 5 + Math.random() * 3,
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 6,
        type,
      };
    }),
  []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background:
              star.type === 'large'
                ? 'radial-gradient(circle, #FFD700, #FFA500)'
                : star.type === 'medium'
                ? '#FFE066'
                : '#FFF0A0',
            boxShadow:
              star.type === 'large'
                ? '0 0 6px 2px rgba(255,215,0,0.6)'
                : star.type === 'medium'
                ? '0 0 4px 1px rgba(255,215,0,0.4)'
                : 'none',
          }}
          animate={{ opacity: [0.1, star.type === 'large' ? 0.9 : 0.7, 0.1] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(255,107,53,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.05) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
