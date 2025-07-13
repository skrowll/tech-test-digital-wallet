"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="px-4 py-2  bg-red-800 dark:bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-900 dark:hover:bg-red-700 transition-colors cursor-pointer"
    >
      <span className="flex items-center gap-2">
        <LogOut className="w-5 h-5" />
        Logout
      </span>
    </button>
  );
}