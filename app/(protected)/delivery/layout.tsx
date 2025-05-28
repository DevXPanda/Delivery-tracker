import { ReactNode } from 'react';
import { Truck, Navigation, Home, Settings, Menu, X, LogOut, Bell, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Truck className="h-5 w-5 text-primary" />
            <span>DeliveryTrack</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-1">
              Delivery
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/delivery/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
              </Link>
            </Button>
            
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-4 mt-8">
                    <Link href="/delivery" className="flex items-center gap-2 py-2">
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/delivery/orders" className="flex items-center gap-2 py-2">
                      <Navigation className="h-5 w-5" />
                      <span>Deliveries</span>
                    </Link>
                    <Link href="/delivery/history" className="flex items-center gap-2 py-2">
                      <Clock className="h-5 w-5" />
                      <span>History</span>
                    </Link>
                    <Link href="/delivery/settings" className="flex items-center gap-2 py-2">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    <div className="mt-auto py-2">
                      <div className="flex items-center gap-2 text-destructive cursor-pointer">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-60 flex-col border-r bg-card">
          <div className="flex flex-col gap-1 p-4">
            <Link href="/delivery">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <div>
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </div>
              </Button>
            </Link>
            <Link href="/delivery/orders">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <div>
                  <Navigation className="h-5 w-5" />
                  <span>Deliveries</span>
                </div>
              </Button>
            </Link>
            <Link href="/delivery/history">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <div>
                  <Clock className="h-5 w-5" />
                  <span>History</span>
                </div>
              </Button>
            </Link>
            <Link href="/delivery/settings">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <div>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
              </Button>
            </Link>
          </div>

          <div className="mt-auto p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}