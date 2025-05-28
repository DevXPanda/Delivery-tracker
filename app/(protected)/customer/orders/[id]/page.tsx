"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Package, User, Clock, Navigation, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { useSocket } from '@/components/socket-provider';
import MapView from '@/components/map-view';
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
  vendorId: string;
  deliveryPartnerId?: string;
  deliveryAddress: Address;
  pickupAddress: Address;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null);
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
        setDeliveryPartner({ name: 'Delivery Partner Name' });
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

  // Get status details text
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is pending confirmation from the vendor.';
      case 'accepted':
        return 'Your order has been accepted by the vendor and is being prepared.';
      case 'assigned':
        return 'A delivery partner has been assigned to your order.';
      case 'picked_up':
        return 'Your order has been picked up and is on its way.';
      case 'in_transit':
        return 'Your order is being delivered to your location.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      default:
        return '';
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
            Placed on {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
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

      <Alert className={getStatusColor(order.status)}>
        <Navigation className="h-4 w-4" />
        <AlertTitle>Order Status</AlertTitle>
        <AlertDescription>{getStatusDetails(order.status)}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Map View - Only show for active deliveries */}
          {(['picked_up', 'in_transit'].includes(order.status) && order.deliveryPartnerId) && (
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
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
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Delivery Address</h3>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                    {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
                  </p>
                </div>
              </div>

              {order.deliveryPartnerId && deliveryPartner && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Delivery Partner</h3>
                  <div className="mt-1 flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p>{deliveryPartner.name}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Vendor</h3>
                <div className="mt-1 flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
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

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-muted ml-2">
                <li className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3">
                    <Package className="w-3 h-3 text-primary" />
                  </span>
                  <h3 className="font-medium">Order Placed</h3>
                  <time className="block mb-2 text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                  </time>
                </li>
                
                {order.status !== 'pending' && (
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3">
                      <Check className="w-3 h-3 text-primary" />
                    </span>
                    <h3 className="font-medium">Order Accepted</h3>
                    <time className="block mb-2 text-sm text-muted-foreground">
                      {/* This would be a real timestamp in a full implementation */}
                      {format(new Date(new Date(order.createdAt).getTime() + 10 * 60000), 'MMM d, yyyy h:mm a')}
                    </time>
                  </li>
                )}
                
                {['assigned', 'picked_up', 'in_transit', 'delivered'].includes(order.status) && (
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3">
                      <User className="w-3 h-3 text-primary" />
                    </span>
                    <h3 className="font-medium">Delivery Partner Assigned</h3>
                    <time className="block mb-2 text-sm text-muted-foreground">
                      {/* This would be a real timestamp in a full implementation */}
                      {format(new Date(new Date(order.createdAt).getTime() + 20 * 60000), 'MMM d, yyyy h:mm a')}
                    </time>
                  </li>
                )}
                
                {['picked_up', 'in_transit', 'delivered'].includes(order.status) && (
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3">
                      <Package className="w-3 h-3 text-primary" />
                    </span>
                    <h3 className="font-medium">Order Picked Up</h3>
                    <time className="block mb-2 text-sm text-muted-foreground">
                      {/* This would be a real timestamp in a full implementation */}
                      {format(new Date(new Date(order.createdAt).getTime() + 30 * 60000), 'MMM d, yyyy h:mm a')}
                    </time>
                  </li>
                )}
                
                {['in_transit', 'delivered'].includes(order.status) && (
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3">
                      <Navigation className="w-3 h-3 text-primary" />
                    </span>
                    <h3 className="font-medium">Out for Delivery</h3>
                    <time className="block mb-2 text-sm text-muted-foreground">
                      {/* This would be a real timestamp in a full implementation */}
                      {format(new Date(new Date(order.createdAt).getTime() + 40 * 60000), 'MMM d, yyyy h:mm a')}
                    </time>
                  </li>
                )}
                
                {order.status === 'delivered' && (
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full -left-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </span>
                    <h3 className="font-medium">Delivered</h3>
                    <time className="block mb-2 text-sm text-muted-foreground">
                      {order.actualDeliveryTime 
                        ? format(new Date(order.actualDeliveryTime), 'MMM d, yyyy h:mm a')
                        : format(new Date(new Date(order.createdAt).getTime() + 60 * 60000), 'MMM d, yyyy h:mm a')}
                    </time>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}