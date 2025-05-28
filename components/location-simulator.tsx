"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/components/socket-provider';
import { Navigation, Pause, Play } from 'lucide-react';

interface LocationSimulatorProps {
  orderId: string;
  initialPosition?: [number, number];
  destination?: [number, number];
}

export default function LocationSimulator({
  orderId,
  initialPosition = [12.9716, 77.5946], // Default to Bangalore
  destination = [12.9796, 77.6096], // Slightly offset for demo
}: LocationSimulatorProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [useRealLocation, setUseRealLocation] = useState(false);
  const { socket, isConnected } = useSocket();

  // Function to get a new position that moves toward the destination
  const getNextPosition = () => {
    // Simple linear interpolation toward destination
    const stepSize = 0.0005; // Adjust for speed
    const [currentLat, currentLng] = currentPosition;
    const [destLat, destLng] = destination;
    
    // Calculate direction vector
    const latDiff = destLat - currentLat;
    const lngDiff = destLng - currentLng;
    
    // Normalize and scale
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    if (distance < stepSize) {
      // If very close to destination, just return destination
      return destination;
    }
    
    const newLat = currentLat + (latDiff / distance) * stepSize;
    const newLng = currentLng + (lngDiff / distance) * stepSize;
    
    return [newLat, newLng] as [number, number];
  };

  // Function to get the device's real location
  const getRealLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fall back to simulated movement
          setUseRealLocation(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setUseRealLocation(false);
    }
  };

  // Start/stop tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  // Toggle between real and simulated location
  const toggleLocationMode = () => {
    setUseRealLocation(!useRealLocation);
  };

  // Effect for sending location updates
  useEffect(() => {
    if (!isTracking || !socket || !isConnected) return;

    // Set up interval for location updates
    const intervalId = setInterval(() => {
      if (useRealLocation) {
        // Get real location
        getRealLocation();
      } else {
        // Use simulated movement
        setCurrentPosition(getNextPosition());
      }
      
      // Send the update via socket
      const [lat, lng] = currentPosition;
      socket.emit('location:update', {
        orderId,
        lat,
        lng,
        timestamp: Date.now(),
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, [isTracking, socket, isConnected, currentPosition, useRealLocation, orderId]);

  return (
    <div className="p-4 bg-card rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Location Simulator</h3>
      
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={toggleTracking}
            variant={isTracking ? "destructive" : "default"}
            className="w-full"
          >
            {isTracking ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Tracking
              </>
            )}
          </Button>
          
          <Button 
            onClick={toggleLocationMode}
            variant="outline"
            className="w-full"
          >
            <Navigation className="mr-2 h-4 w-4" />
            {useRealLocation ? 'Use Simulated' : 'Use Real GPS'}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div>Current location: {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}</div>
          <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
          <div>Tracking: {isTracking ? 'Active' : 'Inactive'}</div>
          <div>Mode: {useRealLocation ? 'Real GPS' : 'Simulation'}</div>
        </div>
      </div>
    </div>
  );
}