'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const Header = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <div className="header-inner">
        <Link href="/" className="shrink-0">
          <Image src="/logo.svg" alt="CoinPulse logo" width={112} height={34} />
        </Link>

        {/* Nav — hidden on mobile, shown at md+ */}
        <nav className="hidden md:flex">
          <Link
            href="/dashboard"
            className={cn('nav-link', { 'is-active': pathname === '/dashboard' })}
          >
            Dashboard
          </Link>
          <span className="nav-link cursor-pointer">Wallet</span>
          <span className="nav-link cursor-pointer">Profile</span>
          <span className="nav-link cursor-pointer">History</span>
          <span className="nav-link cursor-pointer">Support</span>
        </nav>

        <div className="header-right">
          {/* Account stats — shown at lg+ */}
          <div className="account-stats">
            <div className="stat-item">
              <span className="stat-label">Available:</span>
              <span className="stat-value">$3,474.00</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Margin:</span>
              <span className="stat-value">$6,526.00</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Profit:</span>
              <span className="stat-value text-red-500">-$123.89</span>
            </div>
          </div>

          {/* Language selector — shown at lg+ */}
          <button className="hover:text-foreground hidden items-center justify-center rounded border border-[color:var(--dark-400)] bg-[color:var(--dark-500)] px-2.5 py-1.5 text-xs font-semibold text-purple-100 transition-all lg:flex">
            EN
          </button>

          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button className="user-icon-btn" aria-label="Account">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
