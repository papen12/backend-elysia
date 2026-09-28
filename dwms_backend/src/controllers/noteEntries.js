import { and, asc, desc, eq, inArray, like, max, or, sql } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { entrySubarticles, noteEntries, subarticles, suppliers, users } from "../db/schema.js"
import { isValidDate, nowForDb, today } from "../utils/dates.js"
import { datosPersona, leerJson, obtenerPersona } from "../utils/personas.js"

const TIPOS = { compra: "compra", sin_costo: "reingreso" }
const TIPOS_API = { compra: "compra", reingreso: "sin_costo", donacion_transferencia: "donacion_transferencia" }

const SOLO_COMPRA = ["supplierId", "autorizacion", "notaEntregaNumero", "notaEntregaFecha", "c31", "c31Fecha", "descuento"]
const NO_EDITABLES = ["tipo", "supplierId", "documentoFecha", "descuento", "items"]

const MAX_CANTIDAD = 999999
const MAX_COSTO = 999999.9999
const MAX_CENTAVOS = 9999999999
const COSTO_FORMAT = /^\d+(\.\d{1,4})?$/
const DESCUENTO_FORMAT = /^\d+(\.\d{1,2})?$/

const NOTE_FIELDS = {
    id: noteEntries.id,
    nroNotaIngreso: noteEntries.nroNotaIngreso,
    tipoIngreso: noteEntries.tipoIngreso,
    reingreso: noteEntries.reingreso,
    fecha: noteEntries.noteEntryDate,
    documentoNumero: noteEntries.invoiceNumber,
    documentoFecha: noteEntries.invoiceDate,
    autorizacion: noteEntries.invoiceAutorizacion,
    notaEntregaNumero: noteEntries.deliveryNoteNumber,
    notaEntregaFecha: noteEntries.deliveryNoteDate,
    c31: noteEntries.c31,
    c31Fecha: noteEntries.c31Fecha,
    supplierId: noteEntries.supplierId,
    supplierName: suppliers.name,
    supplierNit: suppliers.nit,
    userId: noteEntries.userId,
    userName: users.name,
    subtotal: noteEntries.subtotal,
    descuento: noteEntries.descuento,
    total: noteEntries.total,
    observacion: noteEntries.observacion,
    invalidate: noteEntries.invalidate,
    motivoAnulacion: noteEntries.message,
    jsonUsuarios: noteEntries.jsonUsuarios,
    createdAt: noteEntries.createdAt,
}

const SEARCHABLE_COLUMNS = {
    nroNotaIngreso: noteEntries.nroNotaIngreso,
    supplier: suppliers.name,
    user: users.name,
    documentoNumero: noteEntries.invoiceNumber,
    total: noteEntries.total,
    observacion: noteEntries.observacion,
}

const SORTABLE_COLUMNS = {
    fecha: noteEntries.noteEntryDate,
    nroNotaIngreso: noteEntries.nroNotaIngreso,
    supplier: suppliers.name,
    user: users.name,
    total: noteEntries.total,
    notaEntregaFecha: noteEntries.deliveryNoteDate,
}

const LIST_FIELDS = ["id", "nroNotaIngreso", "tipo", "fecha", "documentoNumero", "documentoFecha", "notaEntregaFecha", "supplierId", "supplierName", "userId", "userName", "total", "anulada"]

const selectNotes = () => db
    .select(NOTE_FIELDS)
    .from(noteEntries)
    .leftJoin(suppliers, eq(noteEntries.supplierId, suppliers.id))
    .leftJoin(users, eq(noteEntries.userId, users.id))

const aNumero = (valor) => (valor === null ? null : Number(valor))

const tipoDeNota = (nota) => TIPOS_API[nota.tipoIngreso] ?? (nota.reingreso === 1 ? "sin_costo" : "compra")

const aNota = ({ tipoIngreso, reingreso, invalidate, jsonUsuarios, ...fila }) => ({
    ...fila,
    tipo: tipoDeNota({ tipoIngreso, reingreso }),
    documentoNumero: fila.documentoNumero || null,
    autorizacion: fila.autorizacion || null,
    notaEntregaNumero: fila.notaEntregaNumero || null,
    c31: fila.c31 || null,
    observacion: fila.observacion || null,
    subtotal: aNumero(fila.subtotal),
    descuento: aNumero(fila.descuento),
    total: aNumero(fila.total),
    anulada: invalidate === 1,
    usuario: leerJson(jsonUsuarios),
})

const validarFechaDocumento = (fecha) => {
    if (!isValidDate(fecha)) return "La fecha debe tener el formato aaaa-mm-dd"
    if (fecha.slice(0, 4) !== today().slice(0, 4)) return "La fecha debe ser del año en curso"
    if (fecha > today()) return "La fecha no puede ser futura"
    return null
}

const validarFechaOpcional = (fecha) => {
    if (!isValidDate(fecha)) return "La fecha debe tener el formato aaaa-mm-dd"
    if (fecha > today()) return "La fecha no puede ser futura"
    return null
}

const siguienteNumero = async (executor, anio, bloquear = false) => {
    let consulta = executor
        .select({ maximo: max(noteEntries.nroNotaIngreso) })
        .from(noteEntries)
        .where(sql`YEAR(${noteEntries.invoiceDate}) = ${anio}`)

    if (bloquear) consulta = consulta.for("update")

    const [{ maximo }] = await consulta
    return (maximo ?? 0) + 1
}

const detalleNota = async (id) => {
    const [fila] = await selectNotes().where(eq(noteEntries.id, id))
    if (!fila) return null

    const lotes = await db
        .select({
            id: entrySubarticles.id,
            subarticleId: entrySubarticles.subarticleId,
            code: subarticles.code,
            description: subarticles.description,
            unit: subarticles.unit,
            amount: entrySubarticles.amount,
            unitCost: entrySubarticles.unitCost,
            totalCost: entrySubarticles.totalCost,
            stock: entrySubarticles.stock,
        })
        .from(entrySubarticles)
        .leftJoin(subarticles, eq(entrySubarticles.subarticleId, subarticles.id))
        .where(and(
            eq(entrySubarticles.noteEntryId, id),
            fila.invalidate === 1 ? undefined : eq(entrySubarticles.invalidate, 0)
        ))
        .orderBy(asc(entrySubarticles.id))

    return {
        ...aNota(fila),
        items: lotes.map(({ amount, unitCost, totalCost, ...lote }) => ({
            ...lote,
            cantidad: Number(amount),
            costoUnitario: Number(unitCost),
            costoTotal: Number(totalCost),
            consumido: Number(amount) - lote.stock,
        })),
    }
}

export const getNoteEntries = async ({ query }) => {
    const { q, searchColumn, sortColumn, sortDirection, tipo, anuladas, page, perPage } = query

    const direccion = sortDirection ?? (sortColumn ? "asc" : "desc")
    const ordenar = direccion === "desc" ? desc : asc
    const orderColumn = SORTABLE_COLUMNS[sortColumn] ?? noteEntries.noteEntryDate

    const conditions = [eq(noteEntries.invalidate, anuladas === "true" ? 1 : 0)]

    if (tipo) conditions.push(eq(noteEntries.tipoIngreso, TIPOS[tipo] ?? tipo))

    if (q) {
        const column = searchColumn ? SEARCHABLE_COLUMNS[searchColumn] : null
        conditions.push(
            column
                ? like(column, `%${q}%`)
                : or(
                    like(noteEntries.nroNotaIngreso, `%${q}%`),
                    like(suppliers.name, `%${q}%`),
                    like(users.name, `%${q}%`),
                    like(noteEntries.invoiceNumber, `%${q}%`),
                    like(noteEntries.total, `%${q}%`)
                )
        )
    }

    let listado = selectNotes()
        .where(and(...conditions))
        .orderBy(ordenar(orderColumn), ordenar(noteEntries.nroNotaIngreso))

    if (perPage) {
        const currentPage = page ?? 1
        listado = listado.limit(perPage).offset((currentPage - 1) * perPage)
    }

    const filas = await listado

    return filas.map((fila) => {
        const nota = aNota(fila)
        return Object.fromEntries(LIST_FIELDS.map((campo) => [campo, nota[campo]]))
    })
}

export const getNoteEntryById = async ({ params, set }) => {
    const nota = await detalleNota(params.id)

    if (!nota) {
        set.status = 404
        return { message: "Nota de ingreso no encontrada" }
    }

    return nota
}

export const getNextNumber = async ({ query, set }) => {
    const fecha = query.fecha ?? today()

    const error = validarFechaDocumento(fecha)
    if (error) {
        set.status = 422
        return { errors: { fecha: error } }
    }

    const anio = Number(fecha.slice(0, 4))
    const numero = await siguienteNumero(db, anio)

    const [{ ultima }] = await db
        .select({ ultima: max(noteEntries.noteEntryDate) })
        .from(noteEntries)
        .where(and(sql`YEAR(${noteEntries.invoiceDate}) = ${anio}`, eq(noteEntries.invalidate, 0)))

    return {
        fecha,
        numero,
        ultimaFecha: ultima ?? null,
        retroactiva: Boolean(ultima) && fecha < ultima,
    }
}

export const createNoteEntry = async ({ body, currentUser, set }) => {
    const { tipo, items } = body
    const esCompra = tipo === "compra"

    const errors = {}

    if (!TIPOS[tipo]) errors.tipo = "El tipo de ingreso debe ser compra o sin_costo"

    const errorFecha = validarFechaDocumento(body.documentoFecha)
    if (errorFecha) errors.documentoFecha = errorFecha

    if (esCompra) {
        if (body.supplierId === undefined) errors.supplierId = "El proveedor es requerido"
        for (const campo of ["notaEntregaFecha", "c31Fecha"]) {
            const error = body[campo] ? validarFechaOpcional(body[campo]) : null
            if (error) errors[campo] = error
        }
        if (body.descuento !== undefined && (body.descuento < 0 || !DESCUENTO_FORMAT.test(String(body.descuento)))) {
            errors.descuento = "El descuento debe ser un número mayor o igual a 0 con hasta 2 decimales"
        }
    }

    if (tipo === "sin_costo") {
        for (const campo of SOLO_COMPRA) {
            if (body[campo] !== undefined) errors[campo] = "El ingreso sin costo no lleva este dato"
        }
        if (!body.observacion?.trim()) errors.observacion = "El motivo (observación) es requerido en un ingreso sin costo"
    }

    const vistos = new Set()
    items.forEach((item, indice) => {
        const clave = `items.${indice}`
        const costo = item.costoUnitario

        if (!Number.isInteger(item.cantidad) || item.cantidad <= 0 || item.cantidad > MAX_CANTIDAD) {
            errors[clave] = `La cantidad debe ser un número entero entre 1 y ${MAX_CANTIDAD}`
        } else if (esCompra && (costo === undefined || costo <= 0 || costo > MAX_COSTO || !COSTO_FORMAT.test(String(costo)))) {
            errors[clave] = "El costo unitario debe ser mayor a 0 y tener hasta 4 decimales"
        } else if (tipo === "sin_costo" && costo !== undefined && costo !== 0) {
            errors[clave] = "El ingreso sin costo no lleva costo unitario"
        }

        if (vistos.has(item.subarticleId)) errors[clave] = "El artículo está repetido en la nota"
        vistos.add(item.subarticleId)
    })

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    if (esCompra) {
        const [proveedor] = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.id, body.supplierId))
        if (!proveedor) errors.supplierId = "El proveedor no existe"
    }

    const subarticleIds = items.map((item) => item.subarticleId)
    const encontrados = await db
        .select({ id: subarticles.id, status: subarticles.status })
        .from(subarticles)
        .where(inArray(subarticles.id, subarticleIds))
    const porId = new Map(encontrados.map((subarticle) => [subarticle.id, subarticle]))

    items.forEach((item, indice) => {
        const subarticle = porId.get(item.subarticleId)
        if (!subarticle) errors[`items.${indice}`] = "El artículo no existe"
        else if (subarticle.status !== "1") errors[`items.${indice}`] = "El artículo está inactivo"
    })

    const lineas = items.map((item) => {
        const costo = esCompra ? item.costoUnitario : 0
        return { ...item, costo, centavos: Math.round(item.cantidad * Math.round(costo * 10000) / 100) }
    })
    const subtotalCentavos = lineas.reduce((suma, linea) => suma + linea.centavos, 0)
    const descuentoCentavos = esCompra ? Math.round((body.descuento ?? 0) * 100) : 0

    if (subtotalCentavos > MAX_CENTAVOS) errors.items = "El total de la nota excede el máximo permitido"
    if (descuentoCentavos > subtotalCentavos) errors.descuento = "El descuento no puede ser mayor al subtotal"

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const encargado = await obtenerPersona(db, currentUser.id)
    const ahora = nowForDb()
    const fechaNota = body.documentoFecha

    const id = await db.transaction(async (tx) => {
        const numero = await siguienteNumero(tx, Number(fechaNota.slice(0, 4)), true)

        const [insertResult] = await tx.insert(noteEntries).values({
            tipoIngreso: TIPOS[tipo],
            reingreso: esCompra ? 0 : 1,
            supplierId: esCompra ? body.supplierId : null,
            userId: currentUser.id,
            invoiceNumber: body.documentoNumero || "",
            invoiceAutorizacion: body.autorizacion || null,
            invoiceDate: fechaNota,
            deliveryNoteNumber: body.notaEntregaNumero || null,
            deliveryNoteDate: body.notaEntregaFecha || null,
            c31: body.c31 || null,
            c31Fecha: body.c31Fecha || null,
            subtotal: (subtotalCentavos / 100).toFixed(2),
            descuento: (descuentoCentavos / 100).toFixed(2),
            total: ((subtotalCentavos - descuentoCentavos) / 100).toFixed(2),
            observacion: body.observacion || null,
            noteEntryDate: fechaNota,
            nroNotaIngreso: numero,
            invalidate: 0,
            jsonUsuarios: JSON.stringify(datosPersona(encargado)),
            createdAt: ahora,
            updatedAt: ahora,
        })

        await tx.insert(entrySubarticles).values(lineas.map((linea) => ({
            noteEntryId: insertResult.insertId,
            subarticleId: linea.subarticleId,
            amount: String(linea.cantidad),
            unitCost: String(linea.costo),
            totalCost: (linea.centavos / 100).toFixed(2),
            stock: linea.cantidad,
            date: fechaNota,
            invoice: "",
            invalidate: 0,
            createdAt: ahora,
            updatedAt: ahora,
        })))

        return insertResult.insertId
    })

    set.status = 201
    return await detalleNota(id)
}

export const updateNoteEntry = async ({ params, body, set }) => {
    const [nota] = await db.select().from(noteEntries).where(eq(noteEntries.id, params.id))
    if (!nota) {
        set.status = 404
        return { message: "Nota de ingreso no encontrada" }
    }
    if (nota.invalidate === 1) {
        set.status = 409
        return { message: "La nota de ingreso está anulada" }
    }

    const esCompra = tipoDeNota(nota) === "compra"
    const errors = {}

    for (const campo of NO_EDITABLES) {
        if (body[campo] !== undefined) errors[campo] = "Este dato no se puede modificar"
    }

    if (!esCompra) {
        for (const campo of SOLO_COMPRA) {
            if (body[campo] !== undefined && !errors[campo]) errors[campo] = "El ingreso sin costo no lleva este dato"
        }
        if (body.observacion !== undefined && !body.observacion.trim()) {
            errors.observacion = "El motivo (observación) es requerido en un ingreso sin costo"
        }
    }

    for (const campo of ["notaEntregaFecha", "c31Fecha"]) {
        const error = body[campo] ? validarFechaOpcional(body[campo]) : null
        if (error && !errors[campo]) errors[campo] = error
    }

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const values = { updatedAt: nowForDb() }
    if (body.documentoNumero !== undefined) values.invoiceNumber = body.documentoNumero || ""
    if (body.autorizacion !== undefined) values.invoiceAutorizacion = body.autorizacion || null
    if (body.notaEntregaNumero !== undefined) values.deliveryNoteNumber = body.notaEntregaNumero || null
    if (body.notaEntregaFecha !== undefined) values.deliveryNoteDate = body.notaEntregaFecha || null
    if (body.c31 !== undefined) values.c31 = body.c31 || null
    if (body.c31Fecha !== undefined) values.c31Fecha = body.c31Fecha || null
    if (body.observacion !== undefined) values.observacion = body.observacion || null

    await db.update(noteEntries).set(values).where(eq(noteEntries.id, nota.id))

    return await detalleNota(nota.id)
}

export const cancelNoteEntry = async ({ params, body, currentUser, set }) => {
    const motivo = body.motivo.trim()
    if (!motivo) {
        set.status = 422
        return { errors: { motivo: "El motivo es requerido" } }
    }

    const resultado = await db.transaction(async (tx) => {
        const [nota] = await tx.select().from(noteEntries).where(eq(noteEntries.id, params.id)).for("update")
        if (!nota) return { status: 404, body: { message: "Nota de ingreso no encontrada" } }
        if (nota.invalidate === 1) return { status: 409, body: { message: "La nota de ingreso ya fue anulada" } }

        const lotes = await tx
            .select({ id: entrySubarticles.id, subarticleId: entrySubarticles.subarticleId, amount: entrySubarticles.amount, stock: entrySubarticles.stock })
            .from(entrySubarticles)
            .where(and(eq(entrySubarticles.noteEntryId, nota.id), eq(entrySubarticles.invalidate, 0)))
            .for("update")

        const consumidos = lotes.filter((lote) => lote.stock < Number(lote.amount))
        if (consumidos.length > 0) {
            const codigos = await tx
                .select({ code: subarticles.code })
                .from(subarticles)
                .where(inArray(subarticles.id, consumidos.map((lote) => lote.subarticleId)))
            return {
                status: 409,
                body: { message: `No se puede anular: ya hubo salidas de los artículos ${codigos.map((fila) => fila.code).join(", ")}` },
            }
        }

        const ahora = nowForDb()

        await tx
            .update(entrySubarticles)
            .set({ invalidate: 1, updatedAt: ahora })
            .where(and(eq(entrySubarticles.noteEntryId, nota.id), eq(entrySubarticles.invalidate, 0)))

        const usuario = leerJson(nota.jsonUsuarios)
        usuario.anulado_por = datosPersona(await obtenerPersona(tx, currentUser.id))

        await tx
            .update(noteEntries)
            .set({ invalidate: 1, message: motivo, jsonUsuarios: JSON.stringify(usuario), updatedAt: ahora })
            .where(eq(noteEntries.id, nota.id))

        return { status: 200 }
    })

    if (resultado.status !== 200) {
        set.status = resultado.status
        return resultado.body
    }

    return await detalleNota(params.id)
}
