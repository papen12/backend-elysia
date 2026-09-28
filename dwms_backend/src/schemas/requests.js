import { t } from 'elysia'
import { page, perPage } from './pagination.js'

export const requestsQuery = t.Object({
    q: t.Optional(t.String()),
    searchColumn: t.Optional(t.String()),
    sortColumn: t.Optional(t.String()),
    sortDirection: t.Optional(t.String()),
    status: t.Optional(t.String()),
    page,
    perPage
})

const requestFields = {
    id: t.Number(),
    nroSolicitud: t.Nullable(t.Number()),
    fecha: t.Nullable(t.String()),
    fechaEntrega: t.Nullable(t.String()),
    status: t.Nullable(t.String()),
    observacion: t.Nullable(t.String()),
    userId: t.Nullable(t.Number()),
    userName: t.Nullable(t.String()),
    userTitle: t.Nullable(t.String()),
    adminId: t.Nullable(t.Number()),
    adminName: t.Nullable(t.String())
}

export const requestsList = t.Array(t.Object(requestFields))

export const requestDetail = t.Object({
    ...requestFields,
    message: t.Nullable(t.String()),
    usuarios: t.Record(t.String(), t.Any()),
    items: t.Array(t.Object({
        id: t.Number(),
        subarticleId: t.Nullable(t.Number()),
        code: t.Nullable(t.Number()),
        description: t.Nullable(t.String()),
        unit: t.Nullable(t.String()),
        amount: t.Nullable(t.Number()),
        amountDelivered: t.Nullable(t.Number()),
        totalDelivered: t.Nullable(t.Number()),
        stock: t.Number()
    }))
})

export const nextNumberQuery = t.Object({
    fecha: t.Optional(t.String())
})

export const nextNumber = t.Object({
    fecha: t.String(),
    numero: t.Number(),
    ultimaFecha: t.Nullable(t.String()),
    retroactiva: t.Boolean()
})

export const requestCreateBody = t.Object({
    userId: t.Number({ error: "El funcionario es requerido" }),
    fecha: t.String({ minLength: 1, error: "La fecha es requerida" }),
    observacion: t.Optional(t.String({ maxLength: 255, error: "La observación debe tener como máximo 255 caracteres" })),
    items: t.Array(t.Object({
        subarticleId: t.Number({ error: "El artículo es requerido" }),
        cantidad: t.Number({ error: "La cantidad debe ser un número" })
    }), { minItems: 1, error: "La solicitud debe tener al menos un artículo con su cantidad" })
})

export const requestDeliverBody = t.Object({
    items: t.Array(t.Object({
        id: t.Number({ error: "El renglón es requerido" }),
        cantidad: t.Number({ error: "La cantidad debe ser un número" })
    }), { minItems: 1, error: "Debe indicar la cantidad a entregar de cada artículo" })
})

export const requestCancelBody = t.Object({
    motivo: t.String({ minLength: 1, maxLength: 255, error: "El motivo es requerido y debe tener como máximo 255 caracteres" })
})

export const requestErrors = t.Object({
    errors: t.Record(t.String(), t.String())
})

export const requestIdParams = t.Object({
    id: t.Numeric()
})

export const requestNotFound = t.Object({
    message: t.String()
})

export const requestMessage = t.Object({
    message: t.String()
})
