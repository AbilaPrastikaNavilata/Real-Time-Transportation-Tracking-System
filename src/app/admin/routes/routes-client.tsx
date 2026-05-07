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
  Route as RouteIcon, 
  Plus, 
  Search, 
  ChevronRight,
  Filter,
  Edit,
  Trash2,
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  MinusCircle,
  PlusCircle
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
import { createRoute, updateRoute, deleteRoute } from "./actions"
import { useRouter } from "next/navigation"

export function RoutesClient({ 
  initialRoutes, 
  transportations, 
  stops 
}: { 
  initialRoutes: any[];
  transportations: any[];
  stops: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ 
    name: "", 
    transportationId: "", 
    originStopId: "", 
    destinationStopId: "" 
  })
  const [intermediateStops, setIntermediateStops] = useState<string[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: "" })
  const router = useRouter()

  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, ""])
  }

  const removeIntermediateStop = (index: number) => {
    const newStops = [...intermediateStops]
    newStops.splice(index, 1)
    setIntermediateStops(newStops)
  }

  const handleIntermediateStopChange = (index: number, value: string) => {
    const newStops = [...intermediateStops]
    newStops[index] = value
    setIntermediateStops(newStops)
  }

  const filteredData = initialRoutes.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.transportation?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(deleteConfirm.id)
    setDeleteConfirm({ open: false, id: null, name: "" })
    await deleteRoute(deleteConfirm.id)
    setIsDeleting(null)
    router.refresh()
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({ name: "", transportationId: "", originStopId: "", destinationStopId: "" })
    setIntermediateStops([])
    setIsDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      transportationId: item.transportationId ? item.transportationId.toString() : "",
      originStopId: item.originStopId ? item.originStopId.toString() : "",
      destinationStopId: item.destinationStopId ? item.destinationStopId.toString() : ""
    })
    const sortedStops = item.routeStops ? [...item.routeStops].sort((a: any, b: any) => a.stopOrder - b.stopOrder) : []
    setIntermediateStops(sortedStops.map((rs: any) => rs.stopId.toString()))
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
      result = await updateRoute(editingId, submitData)
    } else {
      result = await createRoute(submitData)
    }
    
    setIsSubmitting(false)

    if (result && !result.success) {
      alert("Error: " + result.error)
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
            <span className="font-medium text-[#0F172A]">Routes</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Routes & Trajectories</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={openAdd} className="rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium shadow-sm px-6" />
          }>
              <Plus className="mr-2 h-4 w-4" />
              Create Route
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Route" : "Create Route"}</DialogTitle>
                <DialogDescription>
                  Define the path of the route including its origin and destination.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Route Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Cikarang - Cibarusah" required />
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originStopId">Origin (Start)</Label>
                    <select 
                      id="originStopId" 
                      name="originStopId" 
                      value={formData.originStopId}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="" disabled>Select Stop</option>
                      {stops.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationStopId">Destination (End)</Label>
                    <select 
                      id="destinationStopId" 
                      name="destinationStopId" 
                      value={formData.destinationStopId}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="" disabled>Select Stop</option>
                      {stops.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-700">Intermediate Stops (Optional)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addIntermediateStop}
                      className="h-7 text-xs flex items-center gap-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Add Stop
                    </Button>
                  </div>
                  
                  {intermediateStops.map((stopId, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-medium text-slate-500 shrink-0">
                        {index + 1}
                      </div>
                      <select 
                        value={stopId}
                        onChange={(e) => handleIntermediateStopChange(index, e.target.value)}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        required
                      >
                        <option value="" disabled>Select Stop</option>
                        {stops.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeIntermediateStop(index)}
                        className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {intermediateStops.length > 0 && (
                     <p className="text-xs text-slate-500 italic mt-1">Stops will be visited in the order listed above.</p>
                  )}
                </div>

              </div>
              <input type="hidden" name="intermediateStops" value={JSON.stringify(intermediateStops.filter(id => id !== ""))} />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1e293b]">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Route
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-bold text-[#0F172A]">Route Network</CardTitle>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by route name..."
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
                <TableHead className="font-semibold text-slate-600">Route Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Transport Fleet</TableHead>
                <TableHead className="font-semibold text-slate-600">Path (Origin - Destination)</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    No routes found.
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#E3F2FD] p-2 rounded-lg shrink-0">
                        <RouteIcon className="h-4 w-4 text-[#0053db]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0F172A]">{item.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium bg-slate-50 text-slate-700">
                      {item.transportation?.name || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0F172A] truncate max-w-[120px]">{item.originStop?.name || "Unknown"}</span>
                        <ArrowRightLeft className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-medium text-[#0F172A] truncate max-w-[120px]">{item.destinationStop?.name || "Unknown"}</span>
                      </div>
                      {item.routeStops && item.routeStops.length > 0 && (
                        <div className="text-xs text-slate-500 truncate max-w-[250px]" title={`Via: ${[...item.routeStops].sort((a: any, b: any) => a.stopOrder - b.stopOrder).map((rs: any) => rs.stop?.name).join(', ')}`}>
                          Via: {[...item.routeStops].sort((a: any, b: any) => a.stopOrder - b.stopOrder).map((rs: any) => rs.stop?.name).join(', ')}
                        </div>
                      )}
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
            <DialogTitle className="text-center text-xl font-bold text-[#0F172A]">Hapus Rute?</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Anda akan menghapus rute <span className="font-semibold text-[#0F172A]">&ldquo;{deleteConfirm.name}&rdquo;</span>. Tindakan ini tidak dapat dibatalkan.
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
