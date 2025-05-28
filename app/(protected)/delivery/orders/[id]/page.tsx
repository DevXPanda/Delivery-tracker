"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Package, User, Clock, Check, X, Navigation, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { useSocket } from '@/components/socket-provider';
import MapView from '@/components/map-view';
import LocationSimulator from '@/components/location-simulator';
import api from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  customerId: string;
  vendorId: string;
  deliveryPartnerId?: string;
  deliveryAddress: Address;
  pickupAddress: Address;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryOrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/orders/${id}`);
        setOrder(response.data);
        
        // Fetch additional details if needed
        // This would be implemented in a real app
        setCustomer({ name: 'Customer Name' });
        setVendor({ name: 'Vendor Name' });
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !order) return;

    // Join order-specific room for real-time updates
    socket.emit('order:join', order._id);

    // Listen for order status updates
    socket.on('order:status_updated', (data) => {
      if (data.orderId === order._id) {
        setOrder(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    // Cleanup
    return () => {
      socket.off('order:status_updated');
      socket.emit('order:leave', order._id);
    };
  }, [socket, order]);

  // Handle order status change
  const handleStatusChange = async (status: string) => {
    if (!order) return;
    
    try {
      await api.put(`/api/orders/${order._id}/status`, { status });
      // Update will come through socket
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'picked_up':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Order not found or you don't have permission to view it.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Created on {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1 font-medium`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Map View */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Route</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView 
                orderId={order._id} 
                initialPosition={[
                  order.pickupAddress.lat || 12.9716,
                  order.pickupAddress.lng || 77.5946
                ]}
                pickupLocation={[
                  order.pickupAddress.lat || 12.9716,
                  order.pickupAddress.lng || 77.5946
                ]}
                deliveryLocation={[
                  order.deliveryAddress.lat || 12.9796,
                  order.deliveryAddress.lng || 77.6096
                ]}
              />
            </CardContent>
          </Card>

          {/* Location Simulator (for delivery partners only) */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Location Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <LocationSimulator 
                  orderId={order._id}
                  initialPosition={[
                    order.pickupAddress.lat || 12.9716,
                    order.pickupAddress.lng || 77.5946
                  ]}
                  destination={[
                    order.deliveryAddress.lat || 12.9796,
                    order.deliveryAddress.lng || 77.6096
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div key={index} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="py-3 flex justify-between font-bold">
                  <p>Total</p>
                  <p>${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.status === 'assigned' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('picked_up')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark as Picked Up
                </Button>
              )}
              
              {order.status === 'picked_up' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('in_transit')}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Start Delivery
                </Button>
              )}
              
              {order.status === 'in_transit' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('delivered')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Delivered
                </Button>
              )}
              
              {order.status === 'delivered' && (
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-md">
                  <p className="text-green-800 dark:text-green-300 font-medium flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Delivery completed!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Pickup From</h3>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>
                    {order.pickupAddress.street}, {order.pickupAddress.city},{' '}
                    {order.pickupAddress.state} {order.pickupAddress.postalCode}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Deliver To</h3>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                    {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <div className="mt-1 flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>{customer?.name || 'Customer'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Vendor</h3>
                <div className="mt-1 flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>{vendor?.name || 'Vendor'}</p>
                </div>
              </div>

              {order.estimatedDeliveryTime && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Estimated Delivery</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>{format(new Date(order.estimatedDeliveryTime), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}