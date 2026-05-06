"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Bus, Search, MapPin, Navigation, UserCircle, LogOut, Loader2, ArrowRight, Clock, Banknote, Train, CarFront, Zap, Map as MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { searchRoutes, getStopsForAutocomplete } from "./actions"

const Map = dynamic(() => import("@/components/Map"), { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center"><MapIcon className="h-10 w-10 text-slate-300 animate-bounce" /></div> })

import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { signOut } from "@/lib/auth-client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function UserClient() {
  const router = useRouter()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/"
        }
      }
    });
  }

  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [mapStops, setMapStops] = useState<any[]>([])

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) setShowFromSuggestions(false)
      if (toRef.current && !toRef.current.contains(event.target as Node)) setShowToSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchFrom = async () => {
      if (from.length > 1) {
        const res = await getStopsForAutocomplete(from)
        setFromSuggestions(res)
      } else {
        setFromSuggestions([])
      }
    }
    const timeout = setTimeout(fetchFrom, 300)
    return () => clearTimeout(timeout)
  }, [from])

  useEffect(() => {
    const fetchTo = async () => {
      if (to.length > 1) {
        const res = await getStopsForAutocomplete(to)
        setToSuggestions(res)
      } else {
        setToSuggestions([])
      }
    }
    const timeout = setTimeout(fetchTo, 300)
    return () => clearTimeout(timeout)
  }, [to])

  const getTransportIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("krl") || t.includes("kereta")) return <Train className="h-5 w-5" />;
    if (t.includes("angkot") || t.includes("mobil")) return <CarFront className="h-5 w-5" />;
    return <Bus className="h-5 w-5" />;
  }

  const handleSearch = async () => {
    if (!from || !to) {
      alert("Mohon isi titik jemput dan tujuan.")
      return
    }

    setIsLoading(true)
    setMessage("")
    setHasSearched(true)
    
    try {
      const res = await searchRoutes(from, to)
      if (res.success) {
        // Add a fake estimated time property so it's consistent across renders
        const dataWithTime = res.data.map((r: any) => ({
          ...r,
          estimatedTime: `${Math.floor(Math.random() * 15) + 15} - ${Math.floor(Math.random() * 20) + 35} Menit`
        }))
        setResults(dataWithTime)
        setMessage(res.message)
        
        // Update map stops
        if (dataWithTime.length > 0) {
          const stopsForMap = [];
          if (dataWithTime[0].originStop) stopsForMap.push(dataWithTime[0].originStop);
          if (dataWithTime[0].destinationStop) stopsForMap.push(dataWithTime[0].destinationStop);
          setMapStops(stopsForMap);
        } else {
          setMapStops([]);
        }
      } else {
        setResults([])
        setMessage(res.message)
        setMapStops([]);
      }
    } catch (error) {
      setMessage("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <Logo textSize="text-xl" iconSize={20} />
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-4">
            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-slate-500" />
            </div>
            <span className="text-sm font-medium text-slate-700">Penumpang</span>
          </div>
          <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="rounded-full text-slate-600" />
            }>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-center text-xl font-bold text-[#0F172A]">Konfirmasi Keluar</DialogTitle>
                <DialogDescription className="text-center text-slate-500">
                  Apakah Anda yakin ingin keluar dari CAKRA? Anda perlu masuk kembali jika ingin memesan atau melihat rute eksklusif.
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
      </header>

      {/* Main Content Area - Split Layout */}
      <main className="flex-1 flex flex-col md:flex-row-reverse relative overflow-hidden">
        
        {/* Map Background Area */}
        <div className="flex-1 w-full h-[45vh] md:h-full relative z-0">
          <Map stops={mapStops} />
        </div>

        {/* Floating/Sidebar Search Panel */}
        <div className="w-full md:w-[450px] lg:w-[500px] bg-white md:h-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl z-10 flex flex-col transition-all duration-300 relative rounded-t-3xl md:rounded-none -mt-6 md:mt-0 overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 pb-20 scrollbar-hide">
            
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 md:hidden"></div>

            <div className="text-left space-y-1 mb-6">
              <h1 className="text-2xl font-extrabold text-[#0F172A]">Cari Rute Angkot</h1>
              <p className="text-sm text-slate-500">Temukan angkot terdekat ke tujuanmu.</p>
            </div>

            {/* Search Route Widget */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative z-10 mb-8">
              <div className="flex flex-col gap-5">
                <div className="relative flex flex-col gap-4">
                  <div className="absolute left-[20px] top-[36px] bottom-[36px] w-[2px] bg-slate-100 hidden sm:block z-0" />
                  
                  <div className="flex items-center gap-3 relative z-20" ref={fromRef}>
                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full z-10 relative bg-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 relative z-20">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Titik Jemput</label>
                      <input 
                        type="text" 
                        placeholder="Cari titik jemput..." 
                        value={from}
                        onChange={(e) => {setFrom(e.target.value); setShowFromSuggestions(true)}}
                        onFocus={() => setShowFromSuggestions(true)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0053db]/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {showFromSuggestions && fromSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                          {fromSuggestions.map((s, i) => (
                            <li 
                              key={i} 
                              className="px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-100 last:border-0 flex items-center gap-2 transition-colors"
                              onClick={() => { setFrom(s); setShowFromSuggestions(false); }}
                            >
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10" ref={toRef}>
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full z-10 relative bg-white">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div className="flex-1 relative z-20">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tujuan</label>
                      <input 
                        type="text" 
                        placeholder="Cari titik tujuan..." 
                        value={to}
                        onChange={(e) => {setTo(e.target.value); setShowToSuggestions(true)}}
                        onFocus={() => setShowToSuggestions(true)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0053db]/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {showToSuggestions && toSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                          {toSuggestions.map((s, i) => (
                            <li 
                              key={i} 
                              className="px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-100 last:border-0 flex items-center gap-2 transition-colors"
                              onClick={() => { setTo(s); setShowToSuggestions(false); }}
                            >
                              <Navigation className="h-3.5 w-3.5 text-slate-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full bg-[#0053db] hover:bg-blue-700 text-white rounded-xl h-12 text-base font-bold mt-2 shadow-md shadow-blue-500/20"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  {isLoading ? "Mencari Rute..." : "Temukan Rute"}
                </Button>
              </div>
            </div>

            {/* Search Results Area */}
            {hasSearched && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-lg font-bold text-[#0F172A] border-b border-slate-200 pb-2 flex items-center justify-between">
                  Rekomendasi Armada
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{results.length} ditemukan</span>
                </h2>
                
                {message && !results.length && (
                  <p className="text-sm text-slate-500 mb-4">{message}</p>
                )}

                {results.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <Bus className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-600 text-sm">Tidak Ada Rute Ditemukan</h3>
                    <p className="text-xs text-slate-500 mt-1 px-4">Kami tidak dapat menemukan angkot yang melayani rute tersebut. Coba lokasi lain.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {results.map((r, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`text-white p-2 rounded-xl font-bold flex items-center gap-1.5 ${
                              r.transportation?.type?.toLowerCase().includes("krl") ? "bg-orange-500" :
                              r.transportation?.type?.toLowerCase().includes("angkot") ? "bg-emerald-500" :
                              "bg-[#0F172A]"
                            }`}>
                              {getTransportIcon(r.transportation?.type)}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-[#0F172A]">{r.name}</h3>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{r.transportation?.name || "Angkot"}</p>
                            </div>
                          </div>
                          
                          {r.fares && r.fares.length > 0 && (
                            <div className="text-right bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                              <span className="font-black text-[#0053db] text-sm flex items-center gap-1">
                                <Banknote className="h-3.5 w-3.5" />
                                Rp {parseInt(r.fares[0].baseFare).toLocaleString("id-ID")}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg text-xs font-medium text-slate-600 mb-3 border border-slate-100">
                          <span className="truncate max-w-[40%]">{r.originStop?.name}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate max-w-[40%]">{r.destinationStop?.name}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/50">
                             <Zap className="h-3.5 w-3.5 text-amber-500" />
                             <span>{r.estimatedTime}</span>
                          </div>

                          {r.schedules && r.schedules.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{String(r.schedules[0].startTime).substring(0, 5)} - {String(r.schedules[0].endTime).substring(0, 5)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Suggestions / Info (Only show if not searched) */}
            {!hasSearched && (
              <div className="grid gap-3 mt-2">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => {setFrom("SGC"); setTo("Lippo Cikarang");}}>
                  <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl shrink-0">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A]">Rute Populer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">SGC - Lippo Cikarang (K.17)</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-600 p-2.5 rounded-xl shrink-0">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A]">Info Tarif 2026</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tarif dasar angkot Cikarang tahun ini berkisar Rp 5.000 - Rp 10.000</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
