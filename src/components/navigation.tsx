// src/components/navigation.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  Home,
  Settings,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Clubs', href: '/clubs', icon: Users },
  { name: 'Meetings', href: '/meetings', icon: Calendar },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#772432]">
            <span className="text-lg font-bold text-white">TM</span>
          </div>
          <span className="hidden font-semibold text-[#772432] sm:inline-block">
            Toastmasters Hub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#772432] text-white'
                    : 'text-foreground hover:bg-[#772432]/10 hover:text-[#772432]'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 pt-4">
              <div className="flex items-center space-x-2 pb-4 border-b">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#772432]">
                  <span className="text-lg font-bold text-white">TM</span>
                </div>
                <span className="font-semibold text-[#772432]">
                  Toastmasters Hub
                </span>
              </div>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 rounded-md px-3 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-[#772432] text-white'
                        : 'text-foreground hover:bg-[#772432]/10 hover:text-[#772432]'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
