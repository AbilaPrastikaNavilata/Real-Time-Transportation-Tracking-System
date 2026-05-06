"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Settings, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = async () => {
    setIsLogoutModalOpen(false)
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login"
        }
      }
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <SidebarProvider>
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 print:h-auto print:overflow-visible print:bg-white print:block">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-6 bg-white z-10 print:hidden">
          <div className="flex items-center gap-4 flex-1 relative">
            <SidebarTrigger className="text-slate-500 hover:text-[#0F172A]" />
            <div className="relative w-full max-w-md hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search transportations, routes, stops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 w-full rounded-full border-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E3F2FD] focus-visible:border-[#0F172A]"
                />
              </form>

              {/* Live Search Suggestions */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                    Quick Navigation
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {[
                      { name: "Dashboard", url: "/admin", keyword: "home main overview statistik" },
                      { name: "Transportations", url: "/admin/transportations", keyword: "fleet armada angkot mobil kendaraan" },
                      { name: "Stops", url: "/admin/stops", keyword: "halte terminal titik henti" },
                      { name: "Routes", url: "/admin/routes", keyword: "rute jalur lintasan trayek" },
                      { name: "Schedules", url: "/admin/schedules", keyword: "jadwal waktu operasional jam" },
                      { name: "Fares", url: "/admin/fares", keyword: "tarif harga bayar ongkos" }
                    ]
                    .filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.keyword.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((page, idx) => (
                      <li key={idx}>
                        <button 
                          onClick={() => {
                            setSearchQuery("");
                            router.push(page.url);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[#E3F2FD] focus:bg-[#E3F2FD] outline-none transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="font-semibold text-[#0F172A]">{page.name}</div>
                          <div className="text-xs text-slate-400 capitalize">Go to {page.name}</div>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button 
                        onClick={() => {
                          router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 outline-none transition-colors text-[#0053db] font-semibold text-sm flex items-center justify-between"
                      >
                        Search all data for "{searchQuery}"
                        <Search className="h-4 w-4" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end min-w-[120px]">
                {isPending ? (
                  <>
                    <div className="h-5 w-24 bg-slate-200 animate-pulse rounded mb-1"></div>
                    <div className="h-4 w-12 bg-slate-200 animate-pulse rounded"></div>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-[#0F172A] truncate w-full text-right">
                      {session?.user?.name || "Admin User"}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {session?.user?.role || "Admin"}
                    </span>
                  </>
                )}
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#E3F2FD] border border-[#bac9d3] flex items-center justify-center text-[#0053db] font-bold overflow-hidden">
                {isPending ? (
                  <div className="h-full w-full bg-slate-200 animate-pulse"></div>
                ) : session?.user?.name ? (
                  session.user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                <DialogTrigger render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-1 rounded-full"
                    title="Logout"
                  />
                }>
                  <LogOut className="h-5 w-5" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                      <LogOut className="h-6 w-6 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold text-[#0F172A]">Konfirmasi Keluar</DialogTitle>
                    <DialogDescription className="text-center text-slate-500">
                      Apakah Anda yakin ingin keluar dari akun admin ini? Anda harus masuk kembali untuk mengakses dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex sm:justify-center gap-2 mt-4 bg-transparent border-0 mx-0 mb-0">
                    <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)} className="rounded-xl flex-1">
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white">
                      Ya, Keluar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 print:overflow-visible print:p-0 print:m-0">
          <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
            <h1 className="text-3xl font-black text-slate-900">Laporan Umum CAKRA</h1>
            <p className="text-slate-500" suppressHydrationWarning>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
