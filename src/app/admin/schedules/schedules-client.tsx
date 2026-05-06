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
  CalendarClock, 
  Plus, 
  Search, 
  ChevronRight,
  Filter,
  Edit,
  Trash2,
  Clock,
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
import { createSchedule, updateSchedule, deleteSchedule } from "./actions"
import { useRouter } from "next/navigation"

export function SchedulesClient({ 
  initialSchedules, 
  routes 
}: { 
  initialSchedules: any[];
  routes: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({ 
    routeId: "", 
    startTime: "05:00", 
    endTime: "22:00", 
    headwayMinutes: "15",
    operationalDays: "Everyday"
  })
  const router = useRouter()

  const filteredData = initialSchedules.filter(item => 
    (item.route?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    setIsDeleting(id)
    await deleteSchedule(id)
    setIsDeleting(null)
    router.refresh()
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({ routeId: "", startTime: "05:00", endTime: "22:00", headwayMinutes: "15", operationalDays: "Everyday" })
    setIsDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      routeId: item.routeId ? item.routeId.toString() : "",
      startTime: item.startTime ? item.startTime.substring(0, 5) : "05:00",
      endTime: item.endTime ? item.endTime.substring(0, 5) : "22:00",
      headwayMinutes: item.headwayMinutes ? item.headwayMinutes.toString() : "15",
      operationalDays: item.operationalDays || "Everyday"
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
      result = await updateSchedule(editingId, submitData)
    } else {
      result = await createSchedule(submitData)
    }
    
    setIsSubmitting(false)

    if (!result.success) {
      alert("Error: " + result.error)
    } else {
      setIsDialogOpen(false)
      router.refresh()
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
            <span className="font-medium text-[#0F172A]">Schedules</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Operational Schedules</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button onClick={openAdd} className="rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-medium shadow-sm px-6" />
          }>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
                <DialogDescription>
                  Configure operational hours and frequency for a route.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="routeId">Route</Label>
                  <select 
                    id="routeId" 
                    name="routeId" 
                    value={formData.routeId}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>Select Route</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headwayMinutes">Frequency / Headway (Minutes)</Label>
                  <Input id="headwayMinutes" name="headwayMinutes" type="number" value={formData.headwayMinutes} onChange={handleChange} placeholder="e.g. 15" required />
                </div>
                <div className="space-y-3">
                  <Label>Operational Days</Label>
                  <input type="hidden" name="operationalDays" value={formData.operationalDays} />
                  
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({ ...formData, operationalDays: "Everyday" })}
                      className={`h-8 rounded-md text-xs ${formData.operationalDays === "Everyday" ? "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1e293b] hover:text-white" : ""}`}
                    >
                      Everyday
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({ ...formData, operationalDays: "Weekdays" })}
                      className={`h-8 rounded-md text-xs ${formData.operationalDays === "Weekdays" ? "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1e293b] hover:text-white" : ""}`}
                    >
                      Weekdays
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData({ ...formData, operationalDays: "Weekends" })}
                      className={`h-8 rounded-md text-xs ${formData.operationalDays === "Weekends" ? "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1e293b] hover:text-white" : ""}`}
                    >
                      Weekends
                    </Button>
                  </div>

                  {/* Individual Checkboxes */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isSelected = 
                        formData.operationalDays === "Everyday" || 
                        (formData.operationalDays === "Weekdays" && ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day)) ||
                        (formData.operationalDays === "Weekends" && ["Sat", "Sun"].includes(day)) ||
                        formData.operationalDays.includes(day);

                      return (
                        <div 
                          key={day}
                          onClick={() => {
                            let current = [];
                            if (formData.operationalDays === "Everyday") current = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                            else if (formData.operationalDays === "Weekdays") current = ["Mon", "Tue", "Wed", "Thu", "Fri"];
                            else if (formData.operationalDays === "Weekends") current = ["Sat", "Sun"];
                            else if (formData.operationalDays) current = formData.operationalDays.split(", ");

                            if (isSelected) {
                              current = current.filter(d => d !== day);
                            } else {
                              current.push(day);
                            }

                            // Optional: auto-convert back to presets
                            let newDays = current.join(", ");
                            if (current.length === 7) newDays = "Everyday";
                            else if (current.length === 5 && !current.includes("Sat") && !current.includes("Sun")) newDays = "Weekdays";
                            else if (current.length === 2 && current.includes("Sat") && current.includes("Sun")) newDays = "Weekends";

                            setFormData({ ...formData, operationalDays: newDays });
                          }}
                          className={`cursor-pointer border rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected 
                              ? "bg-[#E3F2FD] border-[#bbdefb] text-[#0053db]" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {day}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1e293b]">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-bold text-[#0F172A]">Schedule Master</CardTitle>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by route..."
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
                <TableHead className="font-semibold text-slate-600">ID / Route</TableHead>
                <TableHead className="font-semibold text-slate-600">Operating Hours</TableHead>
                <TableHead className="font-semibold text-slate-600">Frequency (Headway)</TableHead>
                <TableHead className="font-semibold text-slate-600">Operating Days</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No schedules found.
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#E3F2FD] p-2 rounded-lg shrink-0">
                        <CalendarClock className="h-4 w-4 text-[#0053db]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0F172A]">{item.route?.name || "Unknown Route"}</span>
                        <span className="text-xs text-slate-500">ID: {item.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <Badge variant="outline" className="font-medium bg-white text-slate-600">
                      {item.headwayMinutes} min
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium text-xs text-slate-600">
                      <span className={item.operationalDays === 'Everyday' ? 'text-emerald-600' : ''}>
                        {item.operationalDays}
                      </span>
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
