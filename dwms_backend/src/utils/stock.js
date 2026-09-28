import { inArray, sql } from "drizzle-orm"
import { entradasSalidas } from "../db/schema.js"

export async function stockDeSubarticulos(executor, subarticleIds) {
    const stocks = new Map(subarticleIds.map((id) => [id, 0]))
    if (subarticleIds.length === 0) return stocks

    const filas = await executor
        .select({
            subarticleId: entradasSalidas.subarticleId,
            stock: sql`SUM(${entradasSalidas.cantidad})`.mapWith(Number),
        })
        .from(entradasSalidas)
        .where(inArray(entradasSalidas.subarticleId, subarticleIds))
        .groupBy(entradasSalidas.subarticleId)

    for (const fila of filas) stocks.set(fila.subarticleId, fila.stock ?? 0)

    return stocks
}
