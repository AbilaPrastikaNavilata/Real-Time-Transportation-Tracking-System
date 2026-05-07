"use server"

import { db } from "@/db"
import { routes, stops, transportations, fares, schedules } from "@/db/schema"
import { eq, like, or, and, inArray, isNotNull } from "drizzle-orm"

export async function searchRoutes(from: string, to: string) {
  try {
    // Find stops matching 'from' and 'to' (by name or type)
    const fromStops = await db.select({ id: stops.id, name: stops.name })
      .from(stops)
      .where(or(like(stops.name, `%${from}%`), like(stops.type, `%${from}%`)));
    
    const toStops = await db.select({ id: stops.id, name: stops.name })
      .from(stops)
      .where(or(like(stops.name, `%${to}%`), like(stops.type, `%${to}%`)));

    if (fromStops.length === 0 || toStops.length === 0) {
      return { success: false, data: [], message: "Titik jemput atau tujuan tidak ditemukan." }
    }

    const fromStopIds = fromStops.map(s => s.id);
    const toStopIds = toStops.map(s => s.id);

    // Fetch all routes with relations
    const allRoutes = await db.query.routes.findMany({
      with: {
        transportation: true,
        originStop: true,
        destinationStop: true,
        routeStops: {
          with: { stop: true }
        },
        fares: true,
        schedules: true
      }
    });

    const directRoutes = [];
    const fallbackRoutes = [];

    for (const route of allRoutes) {
      // Build the ordered sequence of stop IDs for this route
      const sortedIntermediate = route.routeStops ? [...route.routeStops].sort((a, b) => a.stopOrder - b.stopOrder) : [];
      
      const fullPathObjects = [];
      if (route.originStop) fullPathObjects.push(route.originStop);
      sortedIntermediate.forEach(rs => {
        if (rs.stop) fullPathObjects.push(rs.stop);
      });
      if (route.destinationStop) fullPathObjects.push(route.destinationStop);

      const routeSequence = fullPathObjects.map(s => s.id);

      // Check if any fromStopId comes before any toStopId in the sequence
      let isDirect = false;
      let goesToDest = false;
      let matchedPath: any[] = [];

      for (const fId of fromStopIds) {
        for (const tId of toStopIds) {
          const fIndex = routeSequence.indexOf(fId);
          const tIndex = routeSequence.lastIndexOf(tId);
          
          if (fIndex !== -1 && tIndex !== -1) {
            isDirect = true;
            const start = Math.min(fIndex, tIndex);
            const end = Math.max(fIndex, tIndex);
            matchedPath = fullPathObjects.slice(start, end + 1);
          }
          if (tIndex !== -1) {
            goesToDest = true;
            if (!isDirect && matchedPath.length === 0) {
              matchedPath = fullPathObjects.slice(0, tIndex + 1);
            }
          }
        }
      }

      if (isDirect) {
        directRoutes.push({ ...route, matchedPath });
      } else if (goesToDest) {
        fallbackRoutes.push({ ...route, matchedPath });
      }
    }

    if (directRoutes.length > 0) {
      return { success: true, data: directRoutes, message: "Rute ditemukan." };
    }

    if (fallbackRoutes.length > 0) {
      return {
        success: true,
        data: fallbackRoutes.slice(0, 5),
        message: "Tidak ada rute langsung. Menampilkan alternatif rute menuju tujuan Anda."
      };
    }

    return {
      success: true,
      data: [],
      message: "Tidak Ada Rute Ditemukan"
    };

  } catch (error: any) {
    console.error("Error searching routes:", error);
    return { success: false, data: [], message: "Terjadi kesalahan saat mencari rute." }
  }
}

export async function getStopsForAutocomplete(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    const matchedStops = await db.query.stops.findMany({
      where: or(like(stops.name, `%${query}%`), like(stops.type, `%${query}%`)),
      columns: { name: true },
      limit: 8,
    });
    const uniqueNames = Array.from(new Set(matchedStops.map((s) => s.name)));
    return uniqueNames;
  } catch (error) {
    console.error("Error fetching stops:", error);
    return [];
  }
}
