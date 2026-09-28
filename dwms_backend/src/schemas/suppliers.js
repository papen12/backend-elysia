import { t } from 'elysia'
import { page, perPage } from './pagination.js'

export const suppliersQuery = t.Object({
    q: t.Optional(t.String()),
    searchColumn: t.Optional(t.String()),
    sortColumn: t.Optional(t.String()),
    sortDirection: t.Optional(t.String()),
    page,
    perPage
})

export const supplierItem = t.Object({
    id: t.Number(),
    name: t.Nullable(t.String()),
    nit: t.Nullable(t.String()),
    telefono: t.Nullable(t.String()),
    contacto: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String())
})

export const suppliersList = t.Array(supplierItem)

const name = t.String({ minLength: 1, maxLength: 255, error: "El nombre es requerido y debe tener como máximo 255 caracteres" })
const nit = t.String({ maxLength: 255, error: "El NIT debe tener como máximo 255 caracteres" })
const telefono = t.String({ maxLength: 255, error: "El teléfono debe tener como máximo 255 caracteres" })
const contacto = t.String({ maxLength: 255, error: "El contacto debe tener como máximo 255 caracteres" })

export const supplierCreateBody = t.Object({
    name,
    nit: t.Optional(nit),
    telefono: t.Optional(telefono),
    contacto: t.Optional(contacto)
})

export const supplierErrors = t.Object({
    errors: t.Record(t.String(), t.String())
})

export const supplierIdParams = t.Object({
    id: t.Numeric()
})

export const supplierNotFound = t.Object({
    message: t.String()
})

export const supplierUpdateBody = t.Object({
    name: t.Optional(name),
    nit: t.Optional(nit),
    telefono: t.Optional(telefono),
    contacto: t.Optional(contacto)
})
