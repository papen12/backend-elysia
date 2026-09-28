import { and, asc, desc, eq, like, ne, or } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { suppliers } from "../db/schema.js"
import { nowForDb } from "../utils/dates.js"

const SORTABLE_COLUMNS = {
    name: suppliers.name,
    nit: suppliers.nit,
    telefono: suppliers.telefono,
    contacto: suppliers.contacto,
}

export const getSuppliers = async ({ query }) => {
    const { q, searchColumn, sortColumn, sortDirection, page, perPage } = query

    const orderColumn = SORTABLE_COLUMNS[sortColumn] ?? suppliers.name
    const orderBy = sortDirection === "desc" ? desc(orderColumn) : asc(orderColumn)

    let listado = db.select().from(suppliers)

    if (q) {
        const column = searchColumn ? SORTABLE_COLUMNS[searchColumn] : null
        listado = listado.where(
            column
                ? like(column, `%${q}%`)
                : or(
                    like(suppliers.name, `%${q}%`),
                    like(suppliers.nit, `%${q}%`),
                    like(suppliers.telefono, `%${q}%`),
                    like(suppliers.contacto, `%${q}%`)
                )
        )
    }

    listado = listado.orderBy(orderBy)

    if (perPage) {
        const currentPage = page ?? 1
        listado = listado.limit(perPage).offset((currentPage - 1) * perPage)
    }

    return await listado
}

export const getSupplierById = async ({ params, set }) => {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, params.id))

    if (!supplier) {
        set.status = 404
        return { message: "Proveedor no encontrado" }
    }

    return supplier
}

export const createSupplier = async ({ body, set }) => {
    const { name, nit, telefono, contacto } = body

    if (!name || !name.trim()) {
        set.status = 422
        return { errors: { name: "El nombre es requerido" } }
    }

    const [duplicado] = await db.select().from(suppliers).where(eq(suppliers.name, name))
    if (duplicado) {
        set.status = 422
        return { errors: { name: "Ya existe un proveedor con ese nombre" } }
    }

    const timestamp = nowForDb()
    const [insertResult] = await db.insert(suppliers).values({
        name,
        nit: nit || null,
        telefono: telefono || null,
        contacto: contacto || null,
        createdAt: timestamp,
        updatedAt: timestamp,
    })

    const [created] = await db.select().from(suppliers).where(eq(suppliers.id, insertResult.insertId))

    set.status = 201
    return created
}

export const updateSupplier = async ({ params, body, set }) => {
    const [target] = await db.select().from(suppliers).where(eq(suppliers.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Proveedor no encontrado" }
    }

    const { name, nit, telefono, contacto } = body

    if (name !== undefined && !name.trim()) {
        set.status = 422
        return { errors: { name: "El nombre es requerido" } }
    }

    if (name !== undefined && name !== target.name) {
        const [duplicado] = await db.select().from(suppliers).where(and(eq(suppliers.name, name), ne(suppliers.id, target.id)))
        if (duplicado) {
            set.status = 422
            return { errors: { name: "Ya existe un proveedor con ese nombre" } }
        }
    }

    const values = { updatedAt: nowForDb() }
    if (name !== undefined) values.name = name
    if (nit !== undefined) values.nit = nit || null
    if (telefono !== undefined) values.telefono = telefono || null
    if (contacto !== undefined) values.contacto = contacto || null

    await db.update(suppliers).set(values).where(eq(suppliers.id, target.id))

    const [updated] = await db.select().from(suppliers).where(eq(suppliers.id, target.id))
    return updated
}
