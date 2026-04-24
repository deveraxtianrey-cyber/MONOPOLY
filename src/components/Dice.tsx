import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface DiceProps {
  value: number;
  rolling: boolean;
}

const pipPositions: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

export default function Dice({ value, rolling }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
    } else {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [rolling, value]);

  return (
    <motion.div
      animate={rolling ? { 
        rotate: [0, 90, 180, 270, 360],
        y: [0, -15, 0, -10, 0],
        scale: [1, 1.1, 0.9, 1.05, 1]
      } : { 
        rotate: 0,
        y: 0,
        scale: 1
      }}
      transition={{ 
        duration: 0.4, 
        repeat: rolling ? Infinity : 0,
        ease: "linear"
      }}
      className="w-10 h-10 md:w-14 md:h-14 bg-[#e8e5df] rounded-xl shadow-[inset_0_0_10px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.6)] border border-[#c4bcae] flex items-center justify-center"
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 place-items-center">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div 
            key={i} 
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${
              pipPositions[displayValue]?.includes(i) 
                ? 'bg-red-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8)]' 
                : 'bg-transparent'
            }`} 
          />
        ))}
      </div>
    </motion.div>
  );
}
