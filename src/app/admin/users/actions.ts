"use server"

import { db } from "@/db"
import { account } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
// Fallback manual update jika plugin admin better-auth sulit diakses:
// Namun karena kita tidak tahu salt bcrypt better auth, lebih baik pakai plugin.
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    // Mencoba menggunakan plugin admin dari better-auth
    const headersList = await headers();
    
    // Asumsi: betterAuth expose setUserPassword melalui auth.api
    // jika error, kita setidaknya return response error
    try {
        await auth.api.setUserPassword({
            headers: headersList,
            body: {
                userId,
                password: newPassword
            }
        } as any);
        
        revalidatePath("/admin/users");
        return { success: true };
    } catch (e: any) {
        console.error("Error dari better-auth API:", e);
        return { success: false, error: "Gagal mereset password via API Admin: " + (e.message || "Unknown Error") };
    }
  } catch (error: any) {
    console.error("Gagal mereset password:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}
