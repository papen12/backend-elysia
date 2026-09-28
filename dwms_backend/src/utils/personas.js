import { eq } from "drizzle-orm"
import { departments, users } from "../db/schema.js"

export async function obtenerPersona(executor, userId) {
    const [persona] = await executor
        .select({
            id: users.id,
            name: users.name,
            ci: users.ci,
            title: users.title,
            email: users.email,
            status: users.status,
            departmentName: departments.name,
        })
        .from(users)
        .leftJoin(departments, eq(users.departmentId, departments.id))
        .where(eq(users.id, userId))

    return persona
}

export function datosPersona(persona) {
    return {
        id: persona.id,
        nombre: persona.name ?? "",
        numero_documento: persona.ci ?? "",
        cargo: persona.title ?? "",
        unidad: persona.departmentName ?? "",
        email: persona.email ?? "",
    }
}

export function leerJson(json) {
    try {
        const valor = JSON.parse(json)
        return valor && typeof valor === "object" ? valor : {}
    } catch {
        return {}
    }
}
