"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSocket } from '@/components/socket-provider';

// Fix Leaflet marker icon issue in Next.js
useEffect(() => {
  // This runs only on client side
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}, []);

interface MapViewProps {
  orderId: string;
  initialPosition?: [number, number];
  pickupLocation?: [number, number];
  deliveryLocation?: [number, number];
}

// Component to update map view when location changes
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function MapView({
  orderId,
  initialPosition = [12.9716, 77.5946], // Default to Bangalore
  pickupLocation,
  deliveryLocation,
}: MapViewProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(initialPosition);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join order-specific room for real-time updates
    socket.emit('order:join', orderId);

    // Listen for location updates
    socket.on('location:updated', (data) => {
      if (data.orderId === orderId) {
        setCurrentPosition([data.lat, data.lng]);
      }
    });

    // Cleanup
    return () => {
      socket.off('location:updated');
      socket.emit('order:leave', orderId);
    };
  }, [socket, orderId]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={currentPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Current location of delivery partner */}
        <Marker position={currentPosition}>
          <Popup>
            Delivery Partner Current Location
          </Popup>
        </Marker>
        
        {/* Pickup location if provided */}
        {pickupLocation && (
          <Marker 
            position={pickupLocation}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              Pickup Location
            </Popup>
          </Marker>
        )}
        
        {/* Delivery location if provided */}
        {deliveryLocation && (
          <Marker 
            position={deliveryLocation}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              Delivery Location
            </Popup>
          </Marker>
        )}
        
        <MapUpdater position={currentPosition} />
      </MapContainer>
    </div>
  );
}