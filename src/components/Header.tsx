"use client";

import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ user, onMenuClick, showMenuButton = false }: HeaderProps) {
  return (
    <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow dark:bg-gray-100 dark:border-gray-300 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Menu Button for Mobile */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md hover:bg-[#2a2a2a] transition-colors dark:hover:bg-gray-200 flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-300 dark:text-gray-700" />
            </button>
          )}
          <h1 className="text-lg sm:text-2xl font-bold text-white dark:text-gray-900 truncate">My Wallet</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-600 truncate max-w-24 sm:max-w-none">
            Olá, {user.name || user.email?.split('@')[0]}!
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
