"use client";

import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { NeuralBackground } from "@/components/3d/NeuralBackground";
import { FloatingQuickActions } from "./FloatingQuickActions";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("codemind/ai-core");

  return (
    <div className="min-h-screen bg-transparent text-ink selection:bg-accent/30 selection:text-white relative">
      {/* 3D Animated Neural Universe Background Canvas */}
      <NeuralBackground />

      {/* Main Responsive Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Content wrapper tracking sidebar width */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[250px]"
        }`}
      >
        <Header
          onOpenMobile={() => setMobileOpen(true)}
          selectedRepo={selectedRepo}
          onSelectRepo={setSelectedRepo}
        />

        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-8">
          {children}
        </main>

        {/* Floating Quick Action Button & Help Dock */}
        <FloatingQuickActions />
      </div>
    </div>
  );
}
