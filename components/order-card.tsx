"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, User, Package, Clock, ArrowRight } from 'lucide-react';

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

interface OrderCardProps {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  customerName?: string;
  deliveryPartnerName?: string;
  deliveryAddress: Address;
  pickupAddress: Address;
  userRole: 'vendor' | 'delivery' | 'customer';
  onAssign?: () => void;
  onStatusChange?: (status: string) => void;
}

export default function OrderCard({
  id,
  orderNumber,
  status,
  totalAmount,
  items,
  createdAt,
  customerName,
  deliveryPartnerName,
  deliveryAddress,
  pickupAddress,
  userRole,
  onAssign,
  onStatusChange,
}: OrderCardProps) {
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

  // Format address for display
  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  // Get next available status options based on current status and user role
  const getNextStatusOptions = () => {
    if (userRole === 'vendor') {
      switch (status) {
        case 'pending':
          return [{ value: 'accepted', label: 'Accept Order' }];
        default:
          return [];
      }
    } else if (userRole === 'delivery') {
      switch (status) {
        case 'assigned':
          return [{ value: 'picked_up', label: 'Mark as Picked Up' }];
        case 'picked_up':
          return [{ value: 'in_transit', label: 'Start Delivery' }];
        case 'in_transit':
          return [{ value: 'delivered', label: 'Mark as Delivered' }];
        default:
          return [];
      }
    }
    return [];
  };

  const nextStatusOptions = getNextStatusOptions();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{orderNumber}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Date:</span>
            <span className="font-medium">
              {format(new Date(createdAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>

          {customerName && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-muted-foreground">Customer</div>
                <div className="font-medium">{customerName}</div>
              </div>
            </div>
          )}

          {deliveryPartnerName && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-muted-foreground">Delivery Partner</div>
                <div className="font-medium">{deliveryPartnerName}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-muted-foreground">Delivery Address</div>
              <div className="font-medium">{formatAddress(deliveryAddress)}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-muted-foreground">Items</div>
              <div className="font-medium">{items.length} items</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {/* Status update buttons for vendors and delivery partners */}
        {nextStatusOptions.length > 0 && onStatusChange && (
          <div className="grid grid-cols-1 gap-2 w-full">
            {nextStatusOptions.map((option) => (
              <Button 
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className="w-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        {/* Assign button for vendors when status is accepted */}
        {userRole === 'vendor' && status === 'accepted' && onAssign && (
          <Button onClick={onAssign} className="w-full">
            Assign Delivery Partner
          </Button>
        )}

        {/* View details link */}
        <Link href={`/${userRole}/orders/${id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}