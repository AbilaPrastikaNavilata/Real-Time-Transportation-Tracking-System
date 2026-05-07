"use server"

import { db } from "@/db"
import { routes, transportations, stops, routeStops } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getRoutesData() {
  try {
    // We use Drizzle Relational Queries to get joined data
    const routesData = await db.query.routes.findMany({
      with: {
        transportation: true,
        originStop: true,
        destinationStop: true,
        routeStops: {
          with: { stop: true }
        }
      },
      orderBy: (routes, { desc }) => [desc(routes.id)]
    })
    
    // Also fetch transportations and stops for the select dropdowns in the form
    const transportationsData = await db.select().from(transportations).orderBy(transportations.name)
    const stopsData = await db.select().from(stops).orderBy(stops.name)

    return { 
      success: true, 
      routes: routesData, 
      transportations: transportationsData,
      stops: stopsData
    }
  } catch (error: any) {
    console.error("Error fetching routes data:", error)
    return { success: false, error: error.message }
  }
}

export async function createRoute(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const transportationIdStr = formData.get("transportationId") as string
    const originStopIdStr = formData.get("originStopId") as string
    const destinationStopIdStr = formData.get("destinationStopId") as string

    if (!name || !transportationIdStr || !originStopIdStr || !destinationStopIdStr) {
      return { success: false, error: "All fields are required" }
    }

    const transportationId = parseInt(transportationIdStr)
    const originStopId = parseInt(originStopIdStr)
    const destinationStopId = parseInt(destinationStopIdStr)

    const intermediateStopsStr = formData.get("intermediateStops") as string
    let intermediateStopIds: number[] = []
    if (intermediateStopsStr) {
      try {
        intermediateStopIds = JSON.parse(intermediateStopsStr)
      } catch (e) {}
    }

    const [result] = await db.insert(routes).values({
      name,
      transportationId,
      originStopId,
      destinationStopId
    })

    const routeId = result.insertId
    
    if (intermediateStopIds.length > 0) {
      await db.insert(routeStops).values(
        intermediateStopIds.map((stopId, index) => ({
          routeId,
          stopId,
          stopOrder: index + 1
        }))
      )
    }

    revalidatePath("/admin/routes")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating route:", error)
    return { success: false, error: error.message }
  }
}

export async function updateRoute(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const transportationIdStr = formData.get("transportationId") as string
    const originStopIdStr = formData.get("originStopId") as string
    const destinationStopIdStr = formData.get("destinationStopId") as string

    if (!name || !transportationIdStr || !originStopIdStr || !destinationStopIdStr) {
      return { success: false, error: "All fields are required" }
    }

    const transportationId = parseInt(transportationIdStr)
    const originStopId = parseInt(originStopIdStr)
    const destinationStopId = parseInt(destinationStopIdStr)

    const intermediateStopsStr = formData.get("intermediateStops") as string
    let intermediateStopIds: number[] = []
    if (intermediateStopsStr) {
      try {
        intermediateStopIds = JSON.parse(intermediateStopsStr)
      } catch (e) {}
    }

    await db.update(routes).set({
      name,
      transportationId,
      originStopId,
      destinationStopId
    }).where(eq(routes.id, id))

    await db.delete(routeStops).where(eq(routeStops.routeId, id))
    
    if (intermediateStopIds.length > 0) {
      await db.insert(routeStops).values(
        intermediateStopIds.map((stopId, index) => ({
          routeId: id,
          stopId,
          stopOrder: index + 1
        }))
      )
    }

    revalidatePath("/admin/routes")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating route:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteRoute(id: number) {
  try {
    await db.delete(routes).where(eq(routes.id, id))
    revalidatePath("/admin/routes")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting route:", error)
    return { success: false, error: error.message }
  }
}
