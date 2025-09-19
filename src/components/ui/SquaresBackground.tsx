"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SquaresBackgroundProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[number, number]>;
  strokeDasharray?: string;
  className?: string;
  animationSpeed?: number;
  maxLitSquares?: number;
  [key: string]: any;
}

export function SquaresBackground({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  squares = [],
  strokeDasharray = "0",
  className,
  animationSpeed = 800,
  maxLitSquares = 5,
  ...props
}: SquaresBackgroundProps) {
  const id = React.useId();
  const [litSquares, setLitSquares] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setLitSquares((prev) => {
        const newLitSquares = new Set(prev);
        
        // Randomly remove some squares (fade out)
        if (newLitSquares.size > 0 && Math.random() > 0.7) {
          const squaresToRemove = Array.from(newLitSquares);
          const randomIndex = Math.floor(Math.random() * squaresToRemove.length);
          newLitSquares.delete(squaresToRemove[randomIndex]);
        }
        
        // Add new random squares (light up)
        if (newLitSquares.size < maxLitSquares && Math.random() > 0.3) {
          const availableSquares = squares.filter(
            ([x, y]) => !newLitSquares.has(`${x}-${y}`)
          );
          
          if (availableSquares.length > 0) {
            const randomSquare = availableSquares[Math.floor(Math.random() * availableSquares.length)];
            newLitSquares.add(`${randomSquare[0]}-${randomSquare[1]}`);
          }
        }
        
        return newLitSquares;
      });
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [squares, animationSpeed, maxLitSquares]);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {squares.map(([x, y], index) => {
        const squareKey = `${x}-${y}`;
        const isLit = litSquares.has(squareKey);
        
        return (
          <rect
            key={`${x}-${y}-${index}`}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            className="fill-gray-400/50 stroke-gray-400/50"
            strokeWidth="1"
            style={{
              opacity: isLit ? 0.8 : 0.1,
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        );
      })}
    </svg>
  );
}

export default SquaresBackground;