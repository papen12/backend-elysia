import { t } from 'elysia'
import { page, perPage } from './pagination.js'

export const noteEntriesQuery = t.Object({
    q: t.Optional(t.String()),
    searchColumn: t.Optional(t.String()),
    sortColumn: t.Optional(t.String()),
    sortDirection: t.Optional(t.String()),
    tipo: t.Optional(t.String()),
    anuladas: t.Optional(t.String()),
    page,
    perPage
})

const noteEntryFields = {
    id: t.Number(),
    nroNotaIngreso: t.Nullable(t.Number()),
    tipo: t.String(),
    fecha: t.Nullable(t.String()),
    documentoNumero: t.Nullable(t.String()),
    documentoFecha: t.Nullable(t.String()),
    notaEntregaFecha: t.Nullable(t.String()),
    supplierId: t.Nullable(t.Number()),
    supplierName: t.Nullable(t.String()),
    userId: t.Nullable(t.Number()),
    userName: t.Nullable(t.String()),
    total: t.Nullable(t.Number()),
    anulada: t.Boolean()
}

export const noteEntriesList = t.Array(t.Object(noteEntryFields))

export const noteEntryDetail = t.Object({
    ...noteEntryFields,
    autorizacion: t.Nullable(t.String()),
    notaEntregaNumero: t.Nullable(t.String()),
    c31: t.Nullable(t.String()),
    c31Fecha: t.Nullable(t.String()),
    supplierNit: t.Nullable(t.String()),
    subtotal: t.Nullable(t.Number()),
    descuento: t.Nullable(t.Number()),
    observacion: t.Nullable(t.String()),
    motivoAnulacion: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    usuario: t.Record(t.String(), t.Any()),
    items: t.Array(t.Object({
        id: t.Number(),
        subarticleId: t.Nullable(t.Number()),
        code: t.Nullable(t.Number()),
        description: t.Nullable(t.String()),
        unit: t.Nullable(t.String()),
        cantidad: t.Number(),
        costoUnitario: t.Number(),
        costoTotal: t.Number(),
        stock: t.Number(),
        consumido: t.Number()
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

const texto = (campo) => t.String({ maxLength: 255, error: `${campo} debe tener como máximo 255 caracteres` })
const fecha = (campo) => t.String({ error: `${campo} debe tener el formato aaaa-mm-dd` })

export const noteEntryCreateBody = t.Object({
    tipo: t.String({ error: "El tipo de ingreso es requerido: compra o sin_costo" }),
    supplierId: t.Optional(t.Number({ error: "El proveedor debe ser un id numérico" })),
    documentoNumero: t.Optional(texto("El número de documento")),
    documentoFecha: t.String({ minLength: 1, error: "La fecha del documento es requerida" }),
    autorizacion: t.Optional(texto("La autorización")),
    notaEntregaNumero: t.Optional(texto("El número de nota de entrega")),
    notaEntregaFecha: t.Optional(fecha("La fecha de nota de entrega")),
    c31: t.Optional(texto("El C31")),
    c31Fecha: t.Optional(fecha("La fecha del C31")),
    descuento: t.Optional(t.Number({ error: "El descuento debe ser un número" })),
    observacion: t.Optional(texto("La observación")),
    items: t.Array(t.Object({
        subarticleId: t.Number({ error: "El artículo es requerido" }),
        cantidad: t.Number({ error: "La cantidad debe ser un número" }),
        costoUnitario: t.Optional(t.Number({ error: "El costo unitario debe ser un número" }))
    }), { minItems: 1, error: "La nota debe tener al menos un artículo" })
})

export const noteEntryUpdateBody = t.Object({
    documentoNumero: t.Optional(texto("El número de documento")),
    autorizacion: t.Optional(texto("La autorización")),
    notaEntregaNumero: t.Optional(texto("El número de nota de entrega")),
    notaEntregaFecha: t.Optional(t.Nullable(fecha("La fecha de nota de entrega"))),
    c31: t.Optional(texto("El C31")),
    c31Fecha: t.Optional(t.Nullable(fecha("La fecha del C31"))),
    observacion: t.Optional(texto("La observación")),
    tipo: t.Optional(t.Any()),
    supplierId: t.Optional(t.Any()),
    documentoFecha: t.Optional(t.Any()),
    descuento: t.Optional(t.Any()),
    items: t.Optional(t.Any())
})

export const noteEntryCancelBody = t.Object({
    motivo: t.String({ minLength: 1, maxLength: 255, error: "El motivo es requerido y debe tener como máximo 255 caracteres" })
})

export const noteEntryErrors = t.Object({
    errors: t.Record(t.String(), t.String())
})

export const noteEntryIdParams = t.Object({
    id: t.Numeric()
})

export const noteEntryMessage = t.Object({
    message: t.String()
})
