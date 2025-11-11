"use client"

import { BarChartIcon, BrainIcon, HistoryIcon, TrendingUpIcon } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navItems = [
  { icon: BarChartIcon, label: "Overview", href: "/" },
  { icon: BrainIcon, label: "Predictions", href: "/" },
  { icon: TrendingUpIcon, label: "Performance", href: "/performance" },
  { icon: HistoryIcon, label: "Backtesting", href: "/backtesting" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 px-4 lg:px-6 py-3 border-b border-border">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.label} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-2", isActive && "bg-secondary text-secondary-foreground")}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
