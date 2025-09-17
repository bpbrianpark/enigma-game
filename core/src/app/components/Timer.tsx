import "./stopwatch.css";

import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  isRunning?: boolean;
  shouldReset?: boolean;
  timeLimit: number;
  onResetComplete?: () => void;
  onTimeUpdate?: (time: number) => void;
  onTimeUp?: () => void; 
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function Timer({ isRunning = true, shouldReset, timeLimit, onResetComplete, onTimeUpdate, onTimeUp }: TimerProps) {
  const [time, setTime] = useState(timeLimit);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (shouldReset) {
      setTime(timeLimit);
      onResetComplete?.();
    }
  }, [shouldReset, timeLimit]);

  useEffect(() => {
    if (isRunning && time > 0) {
      startTimeRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remainingTime = Math.max(0, time - elapsed);
        
        setTime(remainingTime);
        
        if (onTimeUpdate) {
          onTimeUpdate(remainingTime);
        }

        if (remainingTime <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeUp?.();
        }
      }, 10); 
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate, onTimeUp, time]);

  return (
      <div className="stopwatch-time">
        {formatTime(time)}
      </div>
  );
}