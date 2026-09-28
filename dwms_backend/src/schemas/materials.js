import { t } from 'elysia'
import { page, perPage } from './pagination.js'

export const materialsQuery = t.Object({
    q: t.Optional(t.String()),
    searchColumn: t.Optional(t.String()),
    sortColumn: t.Optional(t.String()),
    sortDirection: t.Optional(t.String()),
    status: t.Optional(t.String()),
    page,
    perPage
})

export const materialItem = t.Object({
    id: t.Number(),
    code: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    status: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String())
})

export const materialsList = t.Array(materialItem)

const code = t.String({ minLength: 1, error: "El código es requerido" })
const description = t.String({ minLength: 1, maxLength: 255, error: "La descripción es requerida y debe tener como máximo 255 caracteres" })

export const materialCreateBody = t.Object({
    code,
    description
})

export const materialErrors = t.Object({
    errors: t.Record(t.String(), t.String())
})

export const materialIdParams = t.Object({
    id: t.Numeric()
})

export const materialNotFound = t.Object({
    message: t.String()
})

export const materialMessage = t.Object({
    message: t.String()
})

export const materialUpdateBody = t.Object({
    code: t.Optional(code),
    description: t.Optional(description)
})
