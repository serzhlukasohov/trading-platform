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
      <div className="main-container inner">
        <Link href="/">
          <Image src="/logo.svg" alt="CoinPulse logo" width={132} height={40} />
        </Link>

        <nav>
          <Link
            href="/dashboard"
            className={cn('nav-link', {
              'is-active': pathname === '/dashboard',
              'is-home': true,
            })}
          >
            Dashboard
          </Link>

          <Link
            href="/pairs"
            className={cn('nav-link', {
              'is-active': pathname.startsWith('/pairs'),
            })}
          >
            Trading Pairs
          </Link>

          <span className="nav-link cursor-pointer">Wallet</span>
          <span className="nav-link cursor-pointer max-sm:hidden">History</span>
          <span className="nav-link cursor-pointer max-sm:hidden">Support</span>
        </nav>

        <div className="header-right">
          <div className="account-stats">
            <div className="stat-item">
              <span className="stat-label">Available</span>
              <span className="stat-value">$3,474.00</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Margin</span>
              <span className="stat-value">$0.00</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Profit</span>
              <span className="stat-value text-green-500">+$0.00</span>
            </div>
          </div>

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
