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
  MapPin, 
  Plus, 
  Search, 
  ChevronRight,
  Filter,
  Edit,
  Trash2,
  Map as MapIcon,
  Loader2,
  AlertTriangle
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
import { deleteStop, createStop, updateStop } from "./actions"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Import Map component dynamically to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading map...</div>
})

export function StopsClient({ initialData }: { initialData: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: "" })
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", type: "Halte", latitude: "", longitude: "" })
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Terminal': return 'bg-purple-100 text-purple-700'
      case 'Station': return 'bg-blue-100 text-blue-700'
      case 'Halte': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const filteredData = initialData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(deleteConfirm.id)
    setDeleteConfirm({ open: false, id: null, name: "" })
    await deleteStop(deleteConfirm.id)
    setIsDeleting(null)
    router.refresh()
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({ name: "", type: "Halte", latitude: "", longitude: "" })
    setIsDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      type: item.type,
      latitude: item.latitude ? item.latitude.toString() : "",
      longitude: item.longitude ? item.longitude.toString() : ""
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
      result = await updateStop(editingId, submitData)
    } else {
      result = await createStop(submitData)
    }
    
    setIsSubmitting(false)

    if (result && !result.success) {
      alert("Gagal menyimpan data: " + result.error)
    } else if (result && result.success) {
      setIsDialogOpen(false)
      router.refresh()
    } else {
      alert("An unexpected error occurred. Please make sure the server is running.")
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center text-sm text-slate-500 mb-1">
            <span>Home</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-[#0F172A]">Stops</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Stops & Terminals</h1>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="rounded-full border-slate-200 text-[#0F172A] font-medium shadow-sm hover:bg-slate-50" />
            }>
                <MapIcon className="mr-2 h-4 w-4 text-slate-500" />
                View Map
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Stops Map</DialogTitle>
                <DialogDescription>
                  Interactive map showing all stops and terminals in CAKRA.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2" style={{ height: "450px" }}>
                <DynamicMap stops={initialData} />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button onClick={openAdd} className="rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium shadow-sm px-6" />
            }>
                <Plus className="mr-2 h-4 w-4" />
                Add Stop
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Stop" : "Add Stop"}</DialogTitle>
                  <DialogDescription>
                    {editingId ? "Update the coordinates or details." : "Add a new stop location with its exact coordinates."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Terminal Cikarang" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select 
                      id="type" 
                      name="type" 
                      value={formData.type}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="Halte">Halte</option>
                      <option value="Terminal">Terminal</option>
                      <option value="Station">Station</option>
                      <option value="Street">Street</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} placeholder="-6.2615" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} placeholder="107.1444" required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1e293b]">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Stop
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-bold text-[#0F172A]">Stops Directory</CardTitle>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by name or type..."
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
                <TableHead className="font-semibold text-slate-600">Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Type</TableHead>
                <TableHead className="font-semibold text-slate-600">Coordinates</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    No stops found.
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#E3F2FD] p-2 rounded-lg shrink-0">
                        <MapPin className="h-4 w-4 text-[#0053db]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0F172A]">{item.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`border-none font-semibold px-2 py-0.5 ${getTypeColor(item.type)}`}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs">
                    <div>Lat: {item.latitude}</div>
                    <div>Lng: {item.longitude}</div>
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
                        onClick={() => setDeleteConfirm({ open: true, id: item.id, name: item.name })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null, name: "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-[#0F172A]">Hapus Pemberhentian?</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Anda akan menghapus <span className="font-semibold text-[#0F172A]">&ldquo;{deleteConfirm.name}&rdquo;</span>. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-center gap-3 mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })} className="rounded-xl flex-1">
              Batal
            </Button>
            <Button onClick={handleDelete} className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="h-4 w-4 mr-2" />
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
