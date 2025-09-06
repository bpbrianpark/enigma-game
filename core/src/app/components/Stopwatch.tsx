'use client'

import "./stopwatch.css";

import { useState, useEffect, useRef, useImperativeHandle } from 'react';

interface StopwatchProps {
  isRunning?: boolean;
  shouldReset?: boolean;
  onResetComplete?: () => void;
  onTimeUpdate?: (time: number) => void;
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function Stopwatch({ isRunning = true, shouldReset, onResetComplete, onTimeUpdate }: StopwatchProps) {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (shouldReset) {
      setTime(0);
      onResetComplete?.();
    }
  }, [shouldReset])

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now() - startTimeRef.current;
        setTime(currentTime);
        
        if (onTimeUpdate) {
          onTimeUpdate(currentTime);
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
  }, [isRunning, onTimeUpdate, time]);

  return (
      <div className="stopwatch-time">
        {formatTime(time)}
      </div>
  );
}