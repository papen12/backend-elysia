import { and, asc, desc, eq, like, ne, or, sql } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { materials, subarticles } from "../db/schema.js"
import { nowForDb } from "../utils/dates.js"

const CODE_FORMAT = /^(0|[1-9]\d{0,4})$/
const CODE_FORMAT_MESSAGE = "El código debe ser un número entero de hasta 5 dígitos, sin ceros a la izquierda"

const SEARCHABLE_COLUMNS = {
    code: materials.code,
    description: materials.description,
}

const SORTABLE_COLUMNS = {
    code: sql`CAST(${materials.code} AS UNSIGNED)`,
    description: materials.description,
    status: materials.status,
}

const tieneSubarticulos = async (materialId) => {
    const [subarticulo] = await db
        .select({ id: subarticles.id })
        .from(subarticles)
        .where(eq(subarticles.materialId, materialId))
        .limit(1)

    return Boolean(subarticulo)
}

export const getMaterials = async ({ query }) => {
    const { q, searchColumn, sortColumn, sortDirection, status, page, perPage } = query

    const orderColumn = SORTABLE_COLUMNS[sortColumn] ?? SORTABLE_COLUMNS.code
    const orderBy = sortDirection === "desc" ? desc(orderColumn) : asc(orderColumn)

    const conditions = []

    if (status) conditions.push(eq(materials.status, status))

    if (q) {
        const column = searchColumn ? SEARCHABLE_COLUMNS[searchColumn] : null
        conditions.push(
            column
                ? like(column, `%${q}%`)
                : or(
                    like(materials.code, `%${q}%`),
                    like(materials.description, `%${q}%`)
                )
        )
    }

    let listado = db.select().from(materials).where(and(...conditions)).orderBy(orderBy)

    if (perPage) {
        const currentPage = page ?? 1
        listado = listado.limit(perPage).offset((currentPage - 1) * perPage)
    }

    return await listado
}

export const getMaterialById = async ({ params, set }) => {
    const [material] = await db.select().from(materials).where(eq(materials.id, params.id))

    if (!material) {
        set.status = 404
        return { message: "Material no encontrado" }
    }

    return material
}

export const createMaterial = async ({ body, set }) => {
    const { code, description } = body

    const errors = {}

    if (!CODE_FORMAT.test(code)) errors.code = CODE_FORMAT_MESSAGE
    if (!description.trim()) errors.description = "La descripción es requerida"

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const [duplicado] = await db.select().from(materials).where(eq(materials.code, code))
    if (duplicado) {
        set.status = 422
        return { errors: { code: "Ya existe un material con ese código" } }
    }

    const timestamp = nowForDb()
    const [insertResult] = await db.insert(materials).values({
        code,
        description,
        status: "1",
        createdAt: timestamp,
        updatedAt: timestamp,
    })

    const [created] = await db.select().from(materials).where(eq(materials.id, insertResult.insertId))

    set.status = 201
    return created
}

export const updateMaterial = async ({ params, body, set }) => {
    const [target] = await db.select().from(materials).where(eq(materials.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Material no encontrado" }
    }

    const { code, description } = body

    const errors = {}

    if (code !== undefined && code !== target.code && !CODE_FORMAT.test(code)) errors.code = CODE_FORMAT_MESSAGE
    if (description !== undefined && !description.trim()) errors.description = "La descripción es requerida"

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    if (code !== undefined && code !== target.code && await tieneSubarticulos(target.id)) {
        set.status = 422
        return { errors: { code: "No se puede cambiar el código: el material tiene subartículos asociados" } }
    }

    if (code !== undefined && code !== target.code) {
        const [duplicado] = await db.select().from(materials).where(and(eq(materials.code, code), ne(materials.id, target.id)))
        if (duplicado) {
            set.status = 422
            return { errors: { code: "Ya existe un material con ese código" } }
        }
    }

    const values = { updatedAt: nowForDb() }
    if (code !== undefined) values.code = code
    if (description !== undefined) values.description = description

    await db.update(materials).set(values).where(eq(materials.id, target.id))

    const [updated] = await db.select().from(materials).where(eq(materials.id, target.id))
    return updated
}

export const changeMaterialStatus = async ({ params, set }) => {
    const [target] = await db.select().from(materials).where(eq(materials.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Material no encontrado" }
    }

    if (await tieneSubarticulos(target.id)) {
        set.status = 422
        return { message: "No se puede cambiar el estado: el material tiene subartículos asociados" }
    }

    const nuevoEstado = target.status === "0" ? "1" : "0"

    await db.update(materials)
        .set({ status: nuevoEstado, updatedAt: nowForDb() })
        .where(eq(materials.id, target.id))

    const [updated] = await db.select().from(materials).where(eq(materials.id, target.id))
    return updated
}
