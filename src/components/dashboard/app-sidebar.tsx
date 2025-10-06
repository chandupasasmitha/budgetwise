
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Settings,
  LineChart,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/records', icon: LineChart, label: 'Records' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const NavLink = isMobile ? 'div' : Link;

  return (
    <div className={cn("hidden border-r bg-card md:block", { "block": isMobile })}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Logo className="h-6 w-6" />
            <span className="">BudgetWise</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              const linkContent = (
                 <div className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary'
                )}>
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
              );

              return (
                <Link href={href} key={href}>
                   {linkContent}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
