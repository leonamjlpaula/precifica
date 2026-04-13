'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  DollarSign,
  Package,
  ClipboardList,
  BarChart2,
  Clock,
  Download,
  LogOut,
  MoreHorizontal,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/presentation/components/ui/button'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Custos Fixos', href: '/custos-fixos', icon: DollarSign },
  { label: 'Materiais', href: '/materiais', icon: Package },
  { label: 'Procedimentos', href: '/procedimentos', icon: ClipboardList },
  { label: 'Comparativo VRPO', href: '/comparativo-vrpo', icon: BarChart2 },
  { label: 'Histórico', href: '/historico', icon: Clock },
  { label: 'Exportar', href: '/exportar', icon: Download },
  { label: 'Primeiros Passos', href: '/primeiros-passos', icon: BookOpen },
]

const mobileMainItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Procedimentos', href: '/procedimentos', icon: ClipboardList },
  { label: 'Custos', href: '/custos-fixos', icon: DollarSign },
]

const mobileMoreItems = [
  { label: 'Materiais', href: '/materiais', icon: Package },
  { label: 'Comparativo VRPO', href: '/comparativo-vrpo', icon: BarChart2 },
  { label: 'Histórico', href: '/historico', icon: Clock },
  { label: 'Exportar', href: '/exportar', icon: Download },
  { label: 'Primeiros Passos', href: '/primeiros-passos', icon: BookOpen },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
}

export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  function isActive(href: string) {
    const baseHref = '/' + href.split('/')[1]
    const basePathname = '/' + pathname.split('/')[1]
    return baseHref === basePathname
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r shrink-0">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">Precifica</h1>
          <p className="text-xs text-muted-foreground mt-1">Precificação Odontológica</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const href =
              item.href === '/procedimentos'
                ? '/procedimentos/diagnostico'
                : item.href
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-card shrink-0">
          {/* Mobile: show logo */}
          <h1 className="md:hidden text-lg font-bold text-primary">Precifica</h1>
          {/* Desktop: spacer */}
          <div className="hidden md:block" />

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden md:block">{userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex items-center z-50">
        {mobileMainItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const href =
            item.href === '/procedimentos'
              ? '/procedimentos/diagnostico'
              : item.href
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}

        {/* More button */}
        <button
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
            moreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setMoreOpen(!moreOpen)}
        >
          <MoreHorizontal className="h-5 w-5" />
          Mais
        </button>

        {/* More menu overlay */}
        {moreOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMoreOpen(false)}
            />
            <div className="fixed bottom-14 left-0 right-0 bg-card border-t z-50 p-4 grid grid-cols-4 gap-2">
              {mobileMoreItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-3 px-2 rounded-md text-xs font-medium transition-colors',
                      active
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>
    </div>
  )
}
