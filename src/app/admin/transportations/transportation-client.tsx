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
  Bus, 
  Plus, 
  Search, 
  ChevronRight,
  Filter,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteTransportation, createTransportation, updateTransportation } from "./actions"
import { useRouter } from "next/navigation"
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

export function TransportationClient({ initialData }: { initialData: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", type: "Angkot", capacity: "", facilities: "" })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: "" })
  const router = useRouter()

  const filteredData = initialData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(deleteConfirm.id)
    setDeleteConfirm({ open: false, id: null, name: "" })
    await deleteTransportation(deleteConfirm.id)
    setIsDeleting(null)
    router.refresh()
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({ name: "", type: "Angkot", capacity: "", facilities: "" })
    setIsDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      type: item.type,
      capacity: item.capacity ? item.capacity.toString() : "",
      facilities: item.facilities || ""
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
      result = await updateTransportation(editingId, submitData)
    } else {
      result = await createTransportation(submitData)
    }
    
    setIsSubmitting(false)
    if (result && !result.success) {
      alert("Error: " + result.error)
      return
    }

    setIsDialogOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center text-sm text-slate-500 mb-1">
            <span>Home</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-[#0F172A]">Transportations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Transportation Management</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={openAdd} className="rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium shadow-sm px-6" />
          }>
              <Plus className="mr-2 h-4 w-4" />
              Add Transport
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Transportation" : "Add Transportation"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Modify the transportation details below." : "Enter details for the new transportation fleet."} Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name / Code</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. K.17, AO5" required />
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
                    <option value="Angkot">Angkot</option>
                    <option value="Bus">Bus</option>
                    <option value="Shuttle">Shuttle</option>
                    <option value="Train">Train</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (Seats)</Label>
                  <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} placeholder="e.g. 12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities</Label>
                  <Input id="facilities" name="facilities" value={formData.facilities} onChange={handleChange} placeholder="e.g. AC, Music (comma separated)" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1e293b]">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Fleet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-bold text-[#0F172A]">Fleet Database</CardTitle>
            
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
                <TableHead className="font-semibold text-slate-600">Capacity</TableHead>
                <TableHead className="font-semibold text-slate-600">Facilities</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No transportations found.
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#E3F2FD] p-2 rounded-lg shrink-0">
                        <Bus className="h-4 w-4 text-[#0053db]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0F172A]">{item.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">{item.type}</span>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {item.capacity ? `${item.capacity} seats` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {item.facilities ? item.facilities.split(',').map((fac: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-medium text-[10px]">
                          {fac.trim()}
                        </Badge>
                      )) : '-'}
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
            <DialogTitle className="text-center text-xl font-bold text-[#0F172A]">Hapus Armada?</DialogTitle>
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
