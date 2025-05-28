"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useSocket } from '@/components/socket-provider';
import OrderCard from '@/components/order-card';
import api from '@/lib/api';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  vendorId: string;
  deliveryPartnerId?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/orders/customer');
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for order status updates
    socket.on('order:status_updated', (data) => {
      setOrders(prev => 
        prev.map(order => 
          order._id === data.orderId 
            ? { ...order, status: data.status } 
            : order
        )
      );
    });

    // Cleanup
    return () => {
      socket.off('order:status_updated');
    };
  }, [socket]);

  // Calculate order stats
  const pendingOrders = orders.filter(order => ['pending', 'accepted', 'assigned'].includes(order.status)).length;
  const activeDeliveries = orders.filter(order => ['picked_up', 'in_transit'].includes(order.status)).length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Customer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-bold">{pendingOrders}</p>
              </div>
              <div className="rounded-full p-3 bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Delivery</p>
                <p className="text-3xl font-bold">{activeDeliveries}</p>
              </div>
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30">
                <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedOrders}</p>
              </div>
              <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
              </div>
              <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <h2 className="text-xl font-semibold">Active Orders</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders
                  .filter(order => ['pending', 'accepted', 'assigned', 'picked_up', 'in_transit'].includes(order.status))
                  .map(order => (
                    <OrderCard
                      key={order._id}
                      id={order._id}
                      orderNumber={order.orderNumber}
                      status={order.status}
                      totalAmount={order.totalAmount}
                      items={order.items}
                      createdAt={order.createdAt}
                      deliveryAddress={order.deliveryAddress}
                      pickupAddress={order.pickupAddress}
                      userRole="customer"
                    />
                  ))}
                {orders.filter(order => ['pending', 'accepted', 'assigned', 'picked_up', 'in_transit'].includes(order.status)).length === 0 && (
                  <p className="text-muted-foreground col-span-full">No active orders</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <h2 className="text-xl font-semibold">Completed Orders</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders
                  .filter(order => order.status === 'delivered')
                  .map(order => (
                    <OrderCard
                      key={order._id}
                      id={order._id}
                      orderNumber={order.orderNumber}
                      status={order.status}
                      totalAmount={order.totalAmount}
                      items={order.items}
                      createdAt={order.createdAt}
                      deliveryAddress={order.deliveryAddress}
                      pickupAddress={order.pickupAddress}
                      userRole="customer"
                    />
                  ))}
                {orders.filter(order => order.status === 'delivered').length === 0 && (
                  <p className="text-muted-foreground col-span-full">No completed orders</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}