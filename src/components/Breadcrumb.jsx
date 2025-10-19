"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({ items = [] }) {
  const router = useRouter();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <button
        onClick={() => router.push('/dashboard/admin')}
        className="flex items-center space-x-1 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <button
              onClick={() => router.push(item.href)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
