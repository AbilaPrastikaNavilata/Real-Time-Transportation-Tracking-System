"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Bus, Loader2, Lock, Mail, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react"
import { signIn } from "@/lib/auth-client"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        alert(error.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
        return;
      }

      // Check role
      const role = data?.user?.role?.toLowerCase()
      if (role === "admin" || role === "superadmin") {
        router.push("/admin")
      } else {
        router.push("/user") // CAKRA Main App
      }
    } catch (err) {
      setIsLoading(false);
      alert("Terjadi kesalahan sistem saat mencoba masuk.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] flex overflow-hidden min-h-[600px]">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-[#0F172A] p-10 flex-col justify-between relative overflow-hidden text-white">
          {/* Decorative background elements */}
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#0053db]/30 rounded-full blur-[80px] pointer-events-none" 
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" 
          />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center text-white/70 font-medium text-sm hover:text-white transition-opacity">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 mb-12"
          >
            <div className="mb-6">
              <Logo light textSize="text-5xl" iconSize={48} />
            </div>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm mt-4">
              Platform pintar untuk mencari rute, tarif, dan jadwal angkot di seluruh Cikarang.
            </p>
          </motion.div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm w-full mx-auto">
            {/* Mobile Branding Header */}
            <div className="md:hidden flex flex-col items-center mb-8 text-center">
              <Logo textSize="text-3xl" />
            </div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Selamat Datang 👋</h2>
              <p className="text-slate-500">Silakan masuk ke akun Anda.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-[#0F172A]">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-[#E3F2FD] focus-visible:border-[#0F172A]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-[#0F172A]">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-[#E3F2FD] focus-visible:border-[#0F172A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-[#0F172A] data-[state=checked]:text-white" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                  >
                    Ingat saya
                  </label>
                </div>
                <Dialog>
                  <DialogTrigger className="text-sm font-semibold text-[#0053db] hover:underline">
                      Lupa password?
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Lupa Password?</DialogTitle>
                      <DialogDescription>
                        Untuk alasan keamanan, reset password hanya dapat dilakukan oleh Admin. 
                        Silakan hubungi Admin untuk mereset password Anda.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-[#0F172A] hover:bg-[#1e293b] text-white font-semibold text-base transition-all group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-[#0053db] hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
