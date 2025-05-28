import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck, Package, User, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">DeliveryTrack</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Real-time Delivery Tracking for Every Stakeholder
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Track deliveries in real-time with our comprehensive platform that connects vendors, 
              delivery partners, and customers in one seamless experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register?role=vendor">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign Up as Vendor
                </Button>
              </Link>
              <Link href="/register?role=delivery">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Join as Delivery Partner
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-accent/50 flex items-center justify-center">
              <div className="w-full h-full bg-[url('https://images.pexels.com/photos/7706434/pexels-photo-7706434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-80"></div>
              <div className="absolute inset-0 bg-background/10 backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Order #DT-2305</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      In Transit
                    </span>
                  </div>
                  <div className="h-32 bg-muted rounded-md mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Live Map View
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>ETA: 15 mins</span>
                    <span>3.2 km away</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-16">Features for Every Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 shadow-md transition-all hover:shadow-lg">
              <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">For Vendors</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>View and manage all orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Assign delivery partners</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Track delivery in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Manage multiple stores</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-md transition-all hover:shadow-lg">
              <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">For Delivery Partners</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>View assigned deliveries</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Start/end delivery with one tap</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Auto location updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Navigate to destination</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-md transition-all hover:shadow-lg">
              <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">For Customers</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Track orders in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Live map with delivery location</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Order history & status updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full h-5 w-5 bg-primary/20 flex items-center justify-center mt-0.5">✓</div>
                  <span>Accurate delivery estimates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-12 mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Truck className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">DeliveryTrack</h2>
            </div>
            <div className="flex gap-8">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DeliveryTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}