"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, User, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import LogoutButton from "./LogoutButton";
import type { Account } from '@/types';

interface SidebarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accounts: Account[];
  isExpanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ user, accounts, isExpanded, onToggle }: SidebarProps) {
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      // Aguarda a transição da sidebar (300ms) antes de mostrar Account Info
      const timer = setTimeout(() => {
        setShowAccountInfo(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      // Esconde imediatamente quando a sidebar fecha
      setShowAccountInfo(false);
    }
  }, [isExpanded]);
  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          h-[calc(100vh-64px)] bg-[#1a1a1a] border-r border-[#2a2a2a] dark:bg-gray-100 dark:border-gray-300 overflow-x-hidden
          ${
            // Desktop: sempre visível, pode ser expandida ou retraída
            // Mobile: overlay quando aberta, escondida quando fechada
            isExpanded
              ? "w-80 fixed left-0 top-16 z-50 md:relative md:top-0 md:z-auto max-w-[80vw]" // Expandida
              : "w-16 hidden md:block md:relative" // Retraída - escondida em mobile, visível em desktop
          }
        `}
      >
        {/* Sidebar Content */}
        <div className="h-full flex flex-col overflow-x-hidden">
          {/* Menu Toggle Button */}
          <div className={`hidden md:flex ${isExpanded ? "justify-end" : "justify-center"} border-b border-[#2a2a2a] dark:border-gray-300`}>
            <div className="flex justify-center">
              <button
                onClick={onToggle}
                className="p-2 hover:bg-[#2a2a2a] transition-colors dark:hover:bg-gray-200 cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronLeft className="m-2 w-7 h-7 text-gray-300 dark:text-gray-700" />
                ) : (
                  <Menu className="m-2 w-7 h-7 text-gray-300 dark:text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="my-4">
            {isExpanded ? (
              <div className="space-y-4">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center dark:bg-gray-200">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center space-y-2">
                  {user.name && (
                    <h3 className="text-lg font-semibold text-white dark:text-gray-900">
                      {user.name}
                    </h3>
                  )}
                  {user.email && (
                    <p className="text-sm text-gray-400 dark:text-gray-600 break-words px-2">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Account Info */}
                {accounts && accounts.length > 0 && showAccountInfo && (
                  <div className="border-t border-[#2a2a2a] p-4 dark:border-gray-300">
                    <h4 className="text-sm font-medium text-gray-300 mb-2 dark:text-gray-700">
                      Contas
                    </h4>
                    <div className="space-y-2">
                      {accounts.map((account: Account) => (
                        <div
                          key={account.id}
                          className="bg-[#262626] p-3 rounded-lg dark:bg-gray-200"
                        >
                          <p className="text-xs text-gray-400 dark:text-gray-600">ID da Conta</p>
                          <p className="text-sm font-mono text-white dark:text-gray-900 break-words">
                            {account.id.slice(0, 12)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Collapsed state - just show profile icon */
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center dark:bg-gray-200">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button - Always at bottom */}
          <div className="mt-auto">
            {isExpanded ? (
              <div className="w-full flex justify-end p-4">
                <LogoutButton />
              </div>
            ) : (
              <div className="flex justify-center pb-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="w-10 h-10 bg-red-800 dark:bg-red-500 text-white rounded-full hover:bg-red-900 dark:hover:bg-red-700 transition-colors flex items-center justify-center cursor-pointer"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          style={{ top: '64px' }}
          onClick={onToggle}
        />
      )}
    </>
  );
}
