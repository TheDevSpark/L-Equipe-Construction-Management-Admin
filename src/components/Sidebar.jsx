"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboardIcon, ClipboardPlusIcon, ClipboardPlus, CalendarPlus, Files, DollarSign, Users, CrownIcon, PersonStanding, Wrench, ListCheck } from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard/admin",
      icon: (
        <LayoutDashboardIcon/>
      ),
    },
    {
      name: "Daily Reports",
      href: "/dashboard/daily-reports",
      icon: (
        <ClipboardPlus/>
      ),
    },
    {
      name: "Schedule",
      href: "/dashboard/schedule",
      icon: (
          <CalendarPlus/>
      ),
    },
    {
      name: "Documents",
      href: "/dashboard/documents",
      icon: (
        <Files/>
      ),
    },
    {
      name: "Budget",
      href: "/dashboard/budget",
      icon: (
        <DollarSign/>
      ),
    },
    {
      name: "Team",
      href: "/dashboard/teams",
      icon: (
      <Wrench/>
      ),
    },
    {
      name: "Clients",
      href: "/dashboard/clients",
      icon: (
        <PersonStanding/>
      ),
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: (
        <ListCheck/>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 border-r min-h-screen bg-sidebar
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Menu
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose} // Close mobile menu when navigating
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    {item.icon}
                    <span className={isActive ? "font-medium" : ""}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
