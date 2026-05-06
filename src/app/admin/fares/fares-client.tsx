"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Banknote, 
  Plus, 
  Search, 
  ChevronRight,
  Filter,
  Edit,
  Trash2,
  Receipt,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createFare, updateFare, deleteFare } from "./actions"
import { useRouter } from "next/navigation"

export function FaresClient({ 
  initialFares, 
  transportations,
  routes
}: { 
  initialFares: any[];
  transportations: any[];
  routes: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({ 
    transportationId: "", 
    routeId: "", 
    baseFare: "", 
    farePerKm: "0" 
  })
  const router = useRouter()

  const filteredData = initialFares.filter(item => 
    (item.transportation?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.route?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this fare configuration?")) return;
    setIsDeleting(id)
    await deleteFare(id)
    setIsDeleting(null)
    router.refresh()
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({ transportationId: "", routeId: "", baseFare: "", farePerKm: "0" })
    setIsDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      transportationId: item.transportationId ? item.transportationId.toString() : "",
      routeId: item.routeId ? item.routeId.toString() : "",
      baseFare: item.baseFare ? item.baseFare.toString() : "",
      farePerKm: item.farePerKm ? item.farePerKm.toString() : "0"
    })
    setIsDialogOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const submitData = new FormData(e.currentTarget)
    
    let result;
    if (editingId) {
      result = await updateFare(editingId, submitData)
    } else {
      result = await createFare(submitData)
    }
    
    setIsSubmitting(false)

    if (!result.success) {
      alert("Error: " + result.error)
    } else {
      setIsDialogOpen(false)
      router.refresh()
    }
  }

  // Helper to format currency
  const formatRupiah = (amount: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount))
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center text-sm text-slate-500 mb-1">
            <span>Home</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-[#0F172A]">Fares</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Tariffs & Fares</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={openAdd} className="rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium shadow-sm px-6" />
          }>
              <Plus className="mr-2 h-4 w-4" />
              Add Fare
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Fare Configuration" : "Add Fare Configuration"}</DialogTitle>
                <DialogDescription>
                  Set base fares and per-kilometer rates for transport fleets.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="transportationId">Fleet / Transportation</Label>
                  <select 
                    id="transportationId" 
                    name="transportationId" 
                    value={formData.transportationId}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>Select Transportation</option>
                    {transportations.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routeId">Route (Optional)</Label>
                  <select 
                    id="routeId" 
                    name="routeId" 
                    value={formData.routeId}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Global (All Routes)</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">Leave empty to apply to all routes for this fleet.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseFare">Base Fare (Rp)</Label>
                    <Input id="baseFare" name="baseFare" type="number" step="100" value={formData.baseFare} onChange={handleChange} placeholder="e.g. 5000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farePerKm">Fare Per Km (Rp)</Label>
                    <Input id="farePerKm" name="farePerKm" type="number" step="10" value={formData.farePerKm} onChange={handleChange} placeholder="e.g. 500" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1e293b]">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Fare
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-bold text-[#0F172A]">Fares Configuration</CardTitle>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by fleet or route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full rounded-xl border-slate-200 focus-visible:ring-2 focus-visible:ring-[#E3F2FD] focus-visible:border-[#0F172A]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <div className="bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-600">ID / Fleet</TableHead>
                <TableHead className="font-semibold text-slate-600">Scope</TableHead>
                <TableHead className="font-semibold text-slate-600">Base Fare</TableHead>
                <TableHead className="font-semibold text-slate-600">Rate / Km</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No fare configurations found.
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#E3F2FD] p-2 rounded-lg shrink-0">
                        <Banknote className="h-4 w-4 text-[#0053db]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0F172A]">{item.transportation?.name || "Unknown Fleet"}</span>
                        <span className="text-xs text-slate-500">ID: {item.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.routeId ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 text-sm">{item.route?.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Specific Route</span>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">Global</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-[#0F172A]">
                      {formatRupiah(item.baseFare)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Receipt className="h-3 w-3 text-slate-400" />
                      +{formatRupiah(item.farePerKm)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-[#0053db] hover:bg-[#E3F2FD] rounded-lg"
                        onClick={() => openEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting === item.id}
                      >
                        {isDeleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
