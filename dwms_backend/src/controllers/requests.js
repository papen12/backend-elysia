import { and, asc, desc, eq, gt, inArray, like, max, or, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/mysql-core"
import { db } from "../db/bd_conection.js"
import { entrySubarticles, requests, subarticleRequests, subarticles, users } from "../db/schema.js"
import { isValidDate, nowForDb, today } from "../utils/dates.js"
import { datosPersona, leerJson, obtenerPersona } from "../utils/personas.js"
import { stockDeSubarticulos } from "../utils/stock.js"

const MAX_CANTIDAD = 99999999

const ESTADOS = { delivered: "entregada", canceled: "anulada" }

const admins = alias(users, "admins")

const REQUEST_FIELDS = {
    id: requests.id,
    nroSolicitud: requests.nroSolicitud,
    fecha: requests.createdAt,
    fechaEntrega: requests.deliveryDate,
    status: requests.status,
    observacion: requests.observacion,
    message: requests.message,
    userId: requests.userId,
    userName: users.name,
    userTitleActual: users.title,
    adminId: requests.adminId,
    adminName: admins.name,
    jsonUsuarios: requests.jsonUsuarios,
}

const SEARCHABLE_COLUMNS = {
    nroSolicitud: requests.nroSolicitud,
    fecha: requests.createdAt,
    name: users.name,
    title: users.title,
    observacion: requests.observacion,
}

const SORTABLE_COLUMNS = {
    fecha: requests.createdAt,
    nroSolicitud: requests.nroSolicitud,
    name: users.name,
    title: users.title,
    status: requests.status,
}

const selectRequests = () => db
    .select(REQUEST_FIELDS)
    .from(requests)
    .leftJoin(users, eq(requests.userId, users.id))
    .leftJoin(admins, eq(requests.adminId, admins.id))

const aSolicitud = ({ jsonUsuarios, userTitleActual, ...fila }) => {
    const usuarios = leerJson(jsonUsuarios)
    return { ...fila, userTitle: usuarios.solicitado_por?.cargo || userTitleActual, usuarios }
}

const aNumero = (valor) => (valor === null ? null : Number(valor))

const validarFecha = (fecha) => {
    if (!isValidDate(fecha)) return "La fecha debe tener el formato aaaa-mm-dd"
    if (fecha.slice(0, 4) !== today().slice(0, 4)) return "La fecha debe ser del año en curso"
    if (fecha > today()) return "La fecha no puede ser futura"
    return null
}

const siguienteNumero = async (executor, anio, bloquear = false) => {
    let consulta = executor
        .select({ maximo: max(requests.nroSolicitud) })
        .from(requests)
        .where(sql`YEAR(${requests.createdAt}) = ${anio}`)

    if (bloquear) consulta = consulta.for("update")

    const [{ maximo }] = await consulta
    return (maximo ?? 0) + 1
}

const detalleSolicitud = async (id) => {
    const [fila] = await selectRequests().where(and(eq(requests.id, id), eq(requests.invalidate, 0)))
    if (!fila) return null

    const renglones = await db
        .select({
            id: subarticleRequests.id,
            subarticleId: subarticleRequests.subarticleId,
            code: subarticles.code,
            description: subarticles.description,
            unit: subarticles.unit,
            amount: subarticleRequests.amount,
            amountDelivered: subarticleRequests.amountDelivered,
            totalDelivered: subarticleRequests.totalDelivered,
        })
        .from(subarticleRequests)
        .leftJoin(subarticles, eq(subarticleRequests.subarticleId, subarticles.id))
        .where(and(eq(subarticleRequests.requestId, id), eq(subarticleRequests.invalidate, 0)))
        .orderBy(asc(subarticleRequests.id))

    const subarticleIds = [...new Set(renglones.map((renglon) => renglon.subarticleId).filter(Boolean))]
    const stocks = await stockDeSubarticulos(db, subarticleIds)

    return {
        ...aSolicitud(fila),
        items: renglones.map((renglon) => ({
            ...renglon,
            amount: aNumero(renglon.amount),
            amountDelivered: aNumero(renglon.amountDelivered),
            totalDelivered: aNumero(renglon.totalDelivered),
            stock: stocks.get(renglon.subarticleId) ?? 0,
        })),
    }
}

const bloquearSolicitud = async (tx, id) => {
    const [solicitud] = await tx
        .select()
        .from(requests)
        .where(and(eq(requests.id, id), eq(requests.invalidate, 0)))
        .for("update")

    if (!solicitud) return { error: { status: 404, body: { message: "Solicitud no encontrada" } } }
    if (solicitud.status !== "initiation") {
        return { error: { status: 409, body: { message: `La solicitud ya fue ${ESTADOS[solicitud.status] ?? "procesada"}` } } }
    }

    return { solicitud }
}

export const getRequests = async ({ query }) => {
    const { q, searchColumn, sortColumn, sortDirection, status, page, perPage } = query

    const direccion = sortDirection ?? (sortColumn ? "asc" : "desc")
    const ordenar = direccion === "desc" ? desc : asc
    const orderColumn = SORTABLE_COLUMNS[sortColumn] ?? requests.createdAt

    const conditions = [eq(requests.invalidate, 0)]

    if (status) conditions.push(eq(requests.status, status))

    if (q) {
        const column = searchColumn ? SEARCHABLE_COLUMNS[searchColumn] : null
        conditions.push(
            column
                ? like(column, `%${q}%`)
                : or(
                    like(requests.nroSolicitud, `%${q}%`),
                    like(requests.createdAt, `%${q}%`),
                    like(users.name, `%${q}%`),
                    like(users.title, `%${q}%`)
                )
        )
    }

    let listado = selectRequests()
        .where(and(...conditions))
        .orderBy(ordenar(orderColumn), ordenar(requests.nroSolicitud))

    if (perPage) {
        const currentPage = page ?? 1
        listado = listado.limit(perPage).offset((currentPage - 1) * perPage)
    }

    const filas = await listado

    return filas.map((fila) => {
        const { usuarios, message, ...solicitud } = aSolicitud(fila)
        return solicitud
    })
}

export const getRequestById = async ({ params, set }) => {
    const solicitud = await detalleSolicitud(params.id)

    if (!solicitud) {
        set.status = 404
        return { message: "Solicitud no encontrada" }
    }

    return solicitud
}

export const getNextNumber = async ({ query, set }) => {
    const fecha = query.fecha ?? today()

    const error = validarFecha(fecha)
    if (error) {
        set.status = 422
        return { errors: { fecha: error } }
    }

    const anio = Number(fecha.slice(0, 4))
    const numero = await siguienteNumero(db, anio)

    const [{ ultima }] = await db
        .select({ ultima: max(requests.createdAt) })
        .from(requests)
        .where(sql`YEAR(${requests.createdAt}) = ${anio}`)

    return {
        fecha,
        numero,
        ultimaFecha: ultima ?? null,
        retroactiva: Boolean(ultima) && fecha < ultima.slice(0, 10),
    }
}

export const createRequest = async ({ body, currentUser, set }) => {
    const { userId, fecha, observacion, items } = body

    const errors = {}

    const errorFecha = validarFecha(fecha)
    if (errorFecha) errors.fecha = errorFecha

    const vistos = new Set()
    items.forEach((item, indice) => {
        if (!Number.isInteger(item.cantidad) || item.cantidad <= 0 || item.cantidad > MAX_CANTIDAD) {
            errors[`items.${indice}`] = "La cantidad debe ser un número entero mayor a 0"
        }
        if (vistos.has(item.subarticleId)) errors[`items.${indice}`] = "El artículo está repetido en la solicitud"
        vistos.add(item.subarticleId)
    })

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const solicitante = await obtenerPersona(db, userId)
    if (!solicitante) errors.userId = "El funcionario no existe"
    else if (solicitante.status !== "1") errors.userId = "El funcionario está inactivo"

    const subarticleIds = items.map((item) => item.subarticleId)
    const encontrados = await db
        .select({ id: subarticles.id, status: subarticles.status })
        .from(subarticles)
        .where(inArray(subarticles.id, subarticleIds))
    const porId = new Map(encontrados.map((subarticle) => [subarticle.id, subarticle]))
    const stocks = await stockDeSubarticulos(db, subarticleIds)

    items.forEach((item, indice) => {
        const subarticle = porId.get(item.subarticleId)
        if (!subarticle) errors[`items.${indice}`] = "El artículo no existe"
        else if (subarticle.status !== "1") errors[`items.${indice}`] = "El artículo está inactivo"
        else if ((stocks.get(item.subarticleId) ?? 0) <= 0) errors[`items.${indice}`] = "El artículo no tiene stock"
    })

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const ahora = nowForDb()

    const id = await db.transaction(async (tx) => {
        const numero = await siguienteNumero(tx, Number(fecha.slice(0, 4)), true)

        const [insertResult] = await tx.insert(requests).values({
            userId,
            adminId: currentUser.id,
            status: "initiation",
            nroSolicitud: numero,
            observacion: observacion || null,
            invalidate: 0,
            jsonUsuarios: JSON.stringify({ solicitado_por: datosPersona(solicitante) }),
            createdAt: `${fecha} ${ahora.slice(11)}`,
            updatedAt: ahora,
        })

        await tx.insert(subarticleRequests).values(items.map((item) => ({
            requestId: insertResult.insertId,
            subarticleId: item.subarticleId,
            amount: String(item.cantidad),
            invalidate: 0,
        })))

        return insertResult.insertId
    })

    set.status = 201
    return await detalleSolicitud(id)
}

export const deliverRequest = async ({ params, body, currentUser, set }) => {
    const errors = {}

    const vistos = new Set()
    body.items.forEach((item, indice) => {
        if (!Number.isInteger(item.cantidad) || item.cantidad < 0 || item.cantidad > MAX_CANTIDAD) {
            errors[`items.${indice}`] = "La cantidad a entregar debe ser un número entero mayor o igual a 0"
        }
        if (vistos.has(item.id)) errors[`items.${indice}`] = "El renglón está repetido"
        vistos.add(item.id)
    })

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const resultado = await db.transaction(async (tx) => {
        const { solicitud, error } = await bloquearSolicitud(tx, params.id)
        if (error) return error

        const renglones = await tx
            .select({ id: subarticleRequests.id, subarticleId: subarticleRequests.subarticleId, amount: subarticleRequests.amount })
            .from(subarticleRequests)
            .where(and(eq(subarticleRequests.requestId, solicitud.id), eq(subarticleRequests.invalidate, 0)))
            .orderBy(asc(subarticleRequests.id))
            .for("update")

        const subarticleIds = [...new Set(renglones.map((renglon) => renglon.subarticleId))]

        const lotes = subarticleIds.length === 0 ? [] : await tx
            .select({ id: entrySubarticles.id, subarticleId: entrySubarticles.subarticleId, stock: entrySubarticles.stock })
            .from(entrySubarticles)
            .where(and(
                inArray(entrySubarticles.subarticleId, subarticleIds),
                eq(entrySubarticles.invalidate, 0),
                gt(entrySubarticles.stock, 0)
            ))
            .orderBy(asc(entrySubarticles.createdAt), asc(entrySubarticles.id))
            .for("update")

        const stocks = await stockDeSubarticulos(tx, subarticleIds)
        const stockEnLotes = new Map()
        for (const lote of lotes) stockEnLotes.set(lote.subarticleId, (stockEnLotes.get(lote.subarticleId) ?? 0) + lote.stock)

        const entregas = new Map(body.items.map((item, indice) => [item.id, { cantidad: item.cantidad, indice }]))
        const erroresEntrega = {}

        body.items.forEach((item, indice) => {
            if (!renglones.some((renglon) => renglon.id === item.id)) {
                erroresEntrega[`items.${indice}`] = "El renglón no pertenece a la solicitud"
            }
        })

        const faltantes = renglones.filter((renglon) => !entregas.has(renglon.id))
        if (faltantes.length > 0) {
            erroresEntrega.items = `Falta indicar la cantidad a entregar de los renglones ${faltantes.map((renglon) => renglon.id).join(", ")}`
        }

        const entregaPorSubarticulo = new Map()

        for (const renglon of renglones) {
            const entrega = entregas.get(renglon.id)
            if (!entrega) continue

            const solicitado = Number(renglon.amount)
            if (entrega.cantidad > solicitado) {
                erroresEntrega[`items.${entrega.indice}`] = `La cantidad a entregar (${entrega.cantidad}) supera la solicitada (${solicitado})`
            }

            entregaPorSubarticulo.set(renglon.subarticleId, (entregaPorSubarticulo.get(renglon.subarticleId) ?? 0) + entrega.cantidad)
        }

        for (const renglon of renglones) {
            const entrega = entregas.get(renglon.id)
            if (!entrega || erroresEntrega[`items.${entrega.indice}`]) continue

            const aEntregar = entregaPorSubarticulo.get(renglon.subarticleId)
            const stock = stocks.get(renglon.subarticleId) ?? 0
            const enLotes = stockEnLotes.get(renglon.subarticleId) ?? 0

            if (aEntregar > stock) {
                erroresEntrega[`items.${entrega.indice}`] = `La cantidad a entregar supera el stock disponible (${stock})`
            } else if (aEntregar > enLotes) {
                erroresEntrega[`items.${entrega.indice}`] = `Los lotes del artículo solo tienen ${enLotes} unidades aunque el stock es ${stock}: el stock de los lotes no coincide con el de los movimientos`
            }
        }

        if (Object.keys(erroresEntrega).length > 0) return { status: 422, body: { errors: erroresEntrega } }

        const ahora = nowForDb()

        for (const renglon of renglones) {
            const { cantidad } = entregas.get(renglon.id)

            let pendiente = cantidad
            for (const lote of lotes) {
                if (pendiente === 0) break
                if (lote.subarticleId !== renglon.subarticleId || lote.stock === 0) continue

                const descontar = Math.min(lote.stock, pendiente)
                lote.stock -= descontar
                pendiente -= descontar

                await tx
                    .update(entrySubarticles)
                    .set({ stock: lote.stock, updatedAt: ahora })
                    .where(eq(entrySubarticles.id, lote.id))
            }

            await tx
                .update(subarticleRequests)
                .set({ amountDelivered: String(cantidad), totalDelivered: String(cantidad) })
                .where(eq(subarticleRequests.id, renglon.id))
        }

        const entregado = renglones.some((renglon) => entregas.get(renglon.id).cantidad > 0)
        const usuarios = leerJson(solicitud.jsonUsuarios)
        usuarios.entregado_por = datosPersona(await obtenerPersona(tx, currentUser.id))

        await tx
            .update(requests)
            .set({
                status: entregado ? "delivered" : "canceled",
                deliveryDate: solicitud.createdAt,
                adminId: currentUser.id,
                jsonUsuarios: JSON.stringify(usuarios),
                updatedAt: ahora,
            })
            .where(eq(requests.id, solicitud.id))

        return { status: 200 }
    })

    if (resultado.status !== 200) {
        set.status = resultado.status
        return resultado.body
    }

    return await detalleSolicitud(params.id)
}

export const cancelRequest = async ({ params, body, currentUser, set }) => {
    const motivo = body.motivo.trim()
    if (!motivo) {
        set.status = 422
        return { errors: { motivo: "El motivo es requerido" } }
    }

    const resultado = await db.transaction(async (tx) => {
        const { solicitud, error } = await bloquearSolicitud(tx, params.id)
        if (error) return error

        await tx
            .update(subarticleRequests)
            .set({ amountDelivered: "0", totalDelivered: "0" })
            .where(and(eq(subarticleRequests.requestId, solicitud.id), eq(subarticleRequests.invalidate, 0)))

        const usuarios = leerJson(solicitud.jsonUsuarios)
        usuarios.anulado_por = datosPersona(await obtenerPersona(tx, currentUser.id))

        await tx
            .update(requests)
            .set({
                status: "canceled",
                deliveryDate: solicitud.createdAt,
                adminId: currentUser.id,
                message: motivo,
                jsonUsuarios: JSON.stringify(usuarios),
                updatedAt: nowForDb(),
            })
            .where(eq(requests.id, solicitud.id))

        return { status: 200 }
    })

    if (resultado.status !== 200) {
        set.status = resultado.status
        return resultado.body
    }

    return await detalleSolicitud(params.id)
}
