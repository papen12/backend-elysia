import { eq } from "drizzle-orm"
import { db, pool } from "./src/db/bd_conection.js"
import { entities, assets, users } from "./src/db/schema.js"

console.log("Probando conexion a la base de datos...")

try {
    const filas = await db.select().from(entities).limit(1)
    console.log("OK - conexion y schema.js cargaron sin errores.")
    console.log("Muestra de 'entities':", filas)
} catch (error) {
    console.error("FALLO en la consulta plana (schema.js):")
    console.error(error)
}

try {
    const activos = await db
        .select({ code: assets.code, descripcion: assets.description, usuario: users.name })
        .from(assets)
        .leftJoin(users, eq(assets.userId, users.id))
        .limit(1)
    console.log("OK - leftJoin manual funciona (patron estandar del proyecto).")
    console.log("Muestra de 'assets' con su 'user':", activos)
} catch (error) {
    console.error("FALLO en el leftJoin manual:")
    console.error(error)
}

await pool.end()
console.log("Conexion cerrada.")
