import { t } from 'elysia'
import { page, perPage } from './pagination.js'

export const subarticlesQuery = t.Object({
    q: t.Optional(t.String()),
    searchColumn: t.Optional(t.String()),
    sortColumn: t.Optional(t.String()),
    sortDirection: t.Optional(t.String()),
    status: t.Optional(t.String()),
    materialId: t.Optional(t.Numeric()),
    page,
    perPage
})

export const subarticleItem = t.Object({
    id: t.Number(),
    code: t.Nullable(t.Number()),
    codeOld: t.Nullable(t.String()),
    barcode: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    unit: t.Nullable(t.String()),
    minimum: t.Nullable(t.Number()),
    stock: t.Number(),
    incremento: t.Nullable(t.Number()),
    status: t.Nullable(t.String()),
    materialId: t.Nullable(t.Number()),
    materialCode: t.Nullable(t.String()),
    materialDescription: t.Nullable(t.String()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String())
})

export const subarticlesList = t.Array(subarticleItem)

export const subarticleSearchQuery = t.Object({
    q: t.Optional(t.String())
})

export const subarticleSearchList = t.Array(t.Object({
    id: t.Number(),
    code: t.Nullable(t.Number()),
    description: t.Nullable(t.String()),
    unit: t.Nullable(t.String()),
    stock: t.Number(),
    existencia: t.Boolean()
}))

export const minimumStockList = t.Array(t.Object({
    ...subarticleItem.properties,
    nivel: t.String()
}))

export const dateRangeQuery = t.Object({
    desde: t.Optional(t.String()),
    hasta: t.Optional(t.String())
})

export const subarticleKardex = t.Object({
    subarticle: subarticleItem,
    desde: t.String(),
    hasta: t.String(),
    movimientos: t.Array(t.Object({
        nro: t.Number(),
        id: t.Nullable(t.Number()),
        fecha: t.Nullable(t.String()),
        tipo: t.String(),
        detalle: t.Nullable(t.String()),
        factura: t.Nullable(t.String()),
        nroPedido: t.Nullable(t.String()),
        citeEmsPlantillas: t.Nullable(t.String()),
        costoUnitario: t.Number(),
        cantidadIngreso: t.Number(),
        cantidadEgreso: t.Number(),
        cantidadSaldo: t.Number(),
        importeIngreso: t.Number(),
        importeEgreso: t.Number(),
        importeSaldo: t.Number()
    })),
    totales: t.Object({
        cantidadIngreso: t.Number(),
        cantidadEgreso: t.Number(),
        cantidadSaldo: t.Number(),
        importeIngreso: t.Number(),
        importeEgreso: t.Number(),
        importeSaldo: t.Number()
    })
})

export const subarticleMovements = t.Object({
    subarticle: subarticleItem,
    desde: t.String(),
    hasta: t.String(),
    movimientos: t.Array(t.Object({
        id: t.Number(),
        tipo: t.String(),
        inicial: t.Boolean(),
        fecha: t.Nullable(t.String()),
        factura: t.Nullable(t.String()),
        notaEntrega: t.Nullable(t.String()),
        nroPedido: t.Nullable(t.String()),
        citeEmsPlantillas: t.Nullable(t.String()),
        detalle: t.Nullable(t.String()),
        cantidad: t.Number(),
        saldo: t.Number(),
        costoUnitario: t.Number(),
        modeloId: t.Nullable(t.Number()),
        createdAt: t.Nullable(t.String())
    })),
    stock: t.Number()
})

const materialId = t.Number({ error: "El material es requerido" })
const description = t.String({ minLength: 1, maxLength: 255, error: "La descripción es requerida y debe tener como máximo 255 caracteres" })
const unit = t.String({ minLength: 1, maxLength: 255, error: "La unidad es requerida y debe tener como máximo 255 caracteres" })
const codeOld = t.String({ maxLength: 255, error: "El código antiguo debe tener como máximo 255 caracteres" })
const minimum = t.Nullable(t.Number({ error: "El mínimo debe ser un número" }))

export const subarticleCreateBody = t.Object({
    materialId,
    description,
    unit,
    codeOld: t.Optional(codeOld),
    minimum: t.Optional(minimum)
})

export const subarticleErrors = t.Object({
    errors: t.Record(t.String(), t.String())
})

export const subarticleIdParams = t.Object({
    id: t.Numeric()
})

export const subarticleNotFound = t.Object({
    message: t.String()
})

export const subarticleMessage = t.Object({
    message: t.String()
})

export const subarticleUpdateBody = t.Object({
    materialId: t.Optional(materialId),
    description: t.Optional(description),
    unit: t.Optional(unit),
    codeOld: t.Optional(codeOld),
    minimum: t.Optional(minimum)
})
