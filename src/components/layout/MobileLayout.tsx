import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Settings, Music } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();

  const navigationItems = [
    { path: '/mobile-player', icon: Music, label: 'Player' },
    { path: '/dashboard', icon: Calendar, label: 'Schedule' },
    { path: '/', icon: Home, label: 'Home' },
    { path: '/mobile-settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <Card className="fixed bottom-0 left-0 right-0 rounded-none border-t border-l-0 border-r-0 border-b-0">
        <CardContent className="p-0">
          <nav className="flex justify-around items-center h-16">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center space-y-1 h-full rounded-none ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  asChild
                >
                  <Link to={item.path}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}