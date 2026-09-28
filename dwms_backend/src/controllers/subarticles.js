import { and, asc, desc, eq, gt, gte, isNull, like, lte, max, or, sql } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { entradasSalidas, materials, subarticles } from "../db/schema.js"
import { firstDayOfYear, isValidDate, nowForDb, today } from "../utils/dates.js"

const MAX_INT = 2147483647

const PESO_STOCK_MINIMO = 1.25

const DETALLES = { REINGRESO: "INGRESO SIN COSTO" }

const aDetalle = (detalle) => DETALLES[detalle] ?? detalle

const stockPorSubarticulo = db
    .select({
        subarticleId: entradasSalidas.subarticleId,
        stock: sql`SUM(${entradasSalidas.cantidad})`.as("stock"),
    })
    .from(entradasSalidas)
    .groupBy(entradasSalidas.subarticleId)
    .as("stock_por_subarticulo")

const stockExpr = sql`COALESCE(${stockPorSubarticulo.stock}, 0)`

const SUBARTICLE_FIELDS = {
    id: subarticles.id,
    code: subarticles.code,
    codeOld: subarticles.codeOld,
    barcode: subarticles.barcode,
    description: subarticles.description,
    unit: subarticles.unit,
    minimum: subarticles.minimum,
    stock: stockExpr.mapWith(Number),
    incremento: subarticles.incremento,
    status: subarticles.status,
    materialId: subarticles.materialId,
    materialCode: materials.code,
    materialDescription: materials.description,
    createdAt: subarticles.createdAt,
    updatedAt: subarticles.updatedAt,
}

const SEARCHABLE_COLUMNS = {
    code: subarticles.code,
    codeOld: subarticles.codeOld,
    description: subarticles.description,
    unit: subarticles.unit,
    barcode: subarticles.barcode,
    material: materials.description,
}

const SORTABLE_COLUMNS = {
    code: subarticles.code,
    codeOld: subarticles.codeOld,
    description: subarticles.description,
    unit: subarticles.unit,
    material: materials.description,
    stock: stockExpr,
    status: subarticles.status,
}

const selectSubarticles = () => db
    .select(SUBARTICLE_FIELDS)
    .from(subarticles)
    .leftJoin(materials, eq(subarticles.materialId, materials.id))
    .leftJoin(stockPorSubarticulo, eq(stockPorSubarticulo.subarticleId, subarticles.id))

const findSubarticle = async (id) => {
    const [subarticle] = await selectSubarticles().where(eq(subarticles.id, id))
    return subarticle
}

const MINIMUM_MESSAGE = `El mínimo debe ser un número entero entre 0 y ${MAX_INT}`

const validarMinimo = (minimum) =>
    minimum === undefined || minimum === null || (Number.isInteger(minimum) && minimum >= 0 && minimum <= MAX_INT)

const redondear = (numero) => Math.round(numero * 10000) / 10000

const validarRangoFechas = (query) => {
    const desde = query.desde ?? firstDayOfYear()
    const hasta = query.hasta ?? today()

    const errors = {}

    if (!isValidDate(desde)) errors.desde = "La fecha debe tener el formato aaaa-mm-dd"
    if (!isValidDate(hasta)) errors.hasta = "La fecha debe tener el formato aaaa-mm-dd"
    if (!errors.desde && !errors.hasta && desde > hasta) errors.desde = "La fecha desde no puede ser mayor a la fecha hasta"

    return { desde, hasta, errors }
}

export const siguienteCodigo = async (tx, material) => {
    const [{ maxIncremento }] = await tx
        .select({ maxIncremento: max(subarticles.incremento) })
        .from(subarticles)
        .where(eq(subarticles.materialId, material.id))

    let incremento = (maxIncremento ?? 0) + 1

    while (true) {
        const barcode = `${material.code}${incremento}`
        const [ocupado] = await tx
            .select({ id: subarticles.id })
            .from(subarticles)
            .where(or(eq(subarticles.barcode, barcode), eq(subarticles.code, Number(barcode))))
            .limit(1)

        if (!ocupado) return { incremento, barcode, code: Number(barcode) }

        incremento++
    }
}

const lotesConSaldo = (movimientos, fecha) => {
    const hastaFecha = movimientos.filter((movimiento) => movimiento.fecha <= fecha)
    if (hastaFecha.length === 0) return []

    let saldo = redondear(hastaFecha.reduce((suma, movimiento) => suma + movimiento.cantidad, 0))
    const entradas = hastaFecha.filter((movimiento) => movimiento.tipo === "entrada")
    const lotes = []

    for (let i = entradas.length - 1; i >= 0; i--) {
        const lote = { ...entradas[i], cantidadSaldo: entradas[i].cantidad }
        lotes.unshift(lote)

        if (redondear(saldo - lote.cantidadSaldo) > 0) {
            saldo = redondear(saldo - lote.cantidadSaldo)
        } else {
            lote.cantidadSaldo = saldo
            break
        }
    }

    return lotes
}

export const getSubarticles = async ({ query }) => {
    const { q, searchColumn, sortColumn, sortDirection, status, materialId, page, perPage } = query

    const orderColumn = SORTABLE_COLUMNS[sortColumn] ?? subarticles.code
    const orderBy = sortDirection === "desc" ? desc(orderColumn) : asc(orderColumn)

    const conditions = []

    if (status) conditions.push(eq(subarticles.status, status))
    if (materialId) conditions.push(eq(subarticles.materialId, materialId))

    if (q) {
        const column = searchColumn ? SEARCHABLE_COLUMNS[searchColumn] : null
        conditions.push(
            column
                ? like(column, `%${q}%`)
                : or(
                    like(subarticles.code, `%${q}%`),
                    like(subarticles.codeOld, `%${q}%`),
                    like(subarticles.description, `%${q}%`),
                    like(subarticles.unit, `%${q}%`),
                    like(subarticles.barcode, `%${q}%`),
                    like(materials.description, `%${q}%`)
                )
        )
    }

    let listado = selectSubarticles().where(and(...conditions)).orderBy(orderBy)

    if (perPage) {
        const currentPage = page ?? 1
        listado = listado.limit(perPage).offset((currentPage - 1) * perPage)
    }

    return await listado
}

export const searchSubarticles = async ({ query }) => {
    const q = query.q ?? ""

    const encontrados = await db
        .select({
            id: subarticles.id,
            code: subarticles.code,
            description: subarticles.description,
            unit: subarticles.unit,
            stock: stockExpr.mapWith(Number),
        })
        .from(subarticles)
        .leftJoin(stockPorSubarticulo, eq(stockPorSubarticulo.subarticleId, subarticles.id))
        .where(and(
            eq(subarticles.status, "1"),
            or(
                like(subarticles.code, `%${q}%`),
                like(subarticles.codeOld, `%${q}%`),
                like(subarticles.description, `%${q}%`),
                like(subarticles.barcode, `%${q}%`)
            )
        ))
        .orderBy(asc(subarticles.code))

    return encontrados.map((subarticle) => ({ ...subarticle, existencia: subarticle.stock > 0 }))
}

export const getMinimumStock = async () => {
    const enAlerta = await selectSubarticles()
        .where(and(
            eq(subarticles.status, "1"),
            gt(subarticles.minimum, 0),
            sql`${stockExpr} <= ${subarticles.minimum} * ${PESO_STOCK_MINIMO}`
        ))
        .orderBy(asc(subarticles.code))

    return enAlerta.map((subarticle) => ({
        ...subarticle,
        nivel: subarticle.stock <= subarticle.minimum ? "critico" : "alerta",
    }))
}

export const getSubarticleById = async ({ params, set }) => {
    const subarticle = await findSubarticle(params.id)

    if (!subarticle) {
        set.status = 404
        return { message: "Subartículo no encontrado" }
    }

    return subarticle
}

export const getSubarticleKardex = async ({ params, query, set }) => {
    const subarticle = await findSubarticle(params.id)
    if (!subarticle) {
        set.status = 404
        return { message: "Subartículo no encontrado" }
    }

    const { desde, hasta, errors } = validarRangoFechas(query)
    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const inicioRango = `${desde} 00:00:00`
    const finRango = `${hasta} 23:59:59`

    const sinCantidad = await db
        .selectDistinct({ nroPedido: entradasSalidas.nroPedido, fecha: entradasSalidas.fecha })
        .from(entradasSalidas)
        .where(and(
            eq(entradasSalidas.subarticleId, subarticle.id),
            isNull(entradasSalidas.cantidad),
            gte(entradasSalidas.fecha, inicioRango),
            lte(entradasSalidas.fecha, finRango)
        ))

    if (sinCantidad.length > 0) {
        const solicitudes = sinCantidad.map((salida) => `N° ${salida.nroPedido} (${salida.fecha})`).join(", ")
        set.status = 409
        return { message: `No se puede generar el kardex: la solicitud ${solicitudes} tiene cantidades entregadas sin registrar` }
    }

    const [[filas]] = await db.execute(
        sql`CALL genera_kardex_v2(${subarticle.id}, ${inicioRango}, ${finRango})`
    )

    const movimientos = filas.map((fila) => ({
        nro: fila.nro,
        id: fila.id,
        fecha: fila.fecha,
        tipo: fila.tipo,
        detalle: aDetalle(fila.detalle),
        factura: fila.factura || null,
        nroPedido: fila.nro_pedido || null,
        citeEmsPlantillas: fila.cite_ems_plantillas || null,
        costoUnitario: Number(fila.costo_unitario),
        cantidadIngreso: Number(fila.cantidad_ingreso),
        cantidadEgreso: Number(fila.cantidad_egreso),
        cantidadSaldo: Number(fila.cantidad_saldo),
        importeIngreso: Number(fila.importe_ingreso),
        importeEgreso: Number(fila.importe_egreso),
        importeSaldo: Number(fila.importe_saldo),
    }))

    const sumar = (campo) => redondear(movimientos.reduce((suma, movimiento) => suma + movimiento[campo], 0))
    const ultimo = movimientos.at(-1)

    return {
        subarticle,
        desde,
        hasta,
        movimientos,
        totales: {
            cantidadIngreso: sumar("cantidadIngreso"),
            cantidadEgreso: sumar("cantidadEgreso"),
            cantidadSaldo: ultimo?.cantidadSaldo ?? 0,
            importeIngreso: sumar("importeIngreso"),
            importeEgreso: sumar("importeEgreso"),
            importeSaldo: ultimo?.importeSaldo ?? 0,
        },
    }
}

export const getSubarticleMovements = async ({ params, query, set }) => {
    const subarticle = await findSubarticle(params.id)
    if (!subarticle) {
        set.status = 404
        return { message: "Subartículo no encontrado" }
    }

    const { desde, hasta, errors } = validarRangoFechas(query)
    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const inicioRango = `${desde} 00:00:00`
    const finRango = `${hasta} 23:59:59`

    const registros = await db
        .select()
        .from(entradasSalidas)
        .where(and(eq(entradasSalidas.subarticleId, subarticle.id), lte(entradasSalidas.fecha, finRango)))
        .orderBy(asc(entradasSalidas.fecha), asc(entradasSalidas.id), desc(entradasSalidas.cantidad), asc(entradasSalidas.createdAt))

    const todos = registros.map((registro) => ({
        ...registro,
        cantidad: Number(registro.cantidad),
        costoUnitario: Number(registro.costoUnitario),
    }))

    const base = (movimiento) => ({
        id: movimiento.id,
        tipo: movimiento.tipo,
        modeloId: movimiento.modeloId,
        createdAt: movimiento.createdAt,
    })

    let saldo = 0
    const movimientos = []

    for (const lote of lotesConSaldo(todos, inicioRango)) {
        saldo = redondear(saldo + lote.cantidadSaldo)
        movimientos.push({
            ...base(lote),
            inicial: true,
            fecha: inicioRango,
            factura: null,
            notaEntrega: null,
            nroPedido: null,
            citeEmsPlantillas: null,
            detalle: "SALDO INICIAL",
            cantidad: 0,
            saldo,
            costoUnitario: lote.costoUnitario,
        })
    }

    for (const movimiento of todos.filter((registro) => registro.fecha > inicioRango)) {
        saldo = redondear(saldo + movimiento.cantidad)

        const costoUnitario = movimiento.tipo === "entrada"
            ? movimiento.costoUnitario
            : (lotesConSaldo(todos, movimiento.fecha)[0]?.costoUnitario ?? 0)

        movimientos.push({
            ...base(movimiento),
            inicial: false,
            fecha: movimiento.fecha,
            factura: movimiento.factura || null,
            notaEntrega: movimiento.notaEntrega,
            nroPedido: movimiento.nroPedido && movimiento.nroPedido !== "0" ? movimiento.nroPedido : null,
            citeEmsPlantillas: movimiento.citeEmsPlantillas || null,
            detalle: aDetalle(movimiento.detalle),
            cantidad: movimiento.cantidad,
            saldo,
            costoUnitario,
        })
    }

    return { subarticle, desde, hasta, movimientos, stock: saldo }
}

export const createSubarticle = async ({ body, set }) => {
    const { materialId, description, unit, codeOld, minimum } = body

    const errors = {}

    if (!description.trim()) errors.description = "La descripción es requerida"
    if (!unit.trim()) errors.unit = "La unidad es requerida"
    if (!validarMinimo(minimum)) errors.minimum = MINIMUM_MESSAGE

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const resultado = await db.transaction(async (tx) => {
        const [material] = await tx.select().from(materials).where(eq(materials.id, materialId)).for("update")

        if (!material) return { errors: { materialId: "El material no existe" } }
        if (material.status !== "1") return { errors: { materialId: "El material está inactivo" } }

        const { incremento, barcode, code } = await siguienteCodigo(tx, material)

        if (code > MAX_INT) return { errors: { materialId: "El código generado excede el máximo permitido" } }

        const timestamp = nowForDb()
        const [insertResult] = await tx.insert(subarticles).values({
            code,
            barcode,
            incremento,
            description,
            unit,
            codeOld: codeOld || null,
            minimum: minimum ?? null,
            materialId: material.id,
            status: "1",
            createdAt: timestamp,
            updatedAt: timestamp,
        })

        return { id: insertResult.insertId }
    })

    if (resultado.errors) {
        set.status = 422
        return { errors: resultado.errors }
    }

    set.status = 201
    return await findSubarticle(resultado.id)
}

export const updateSubarticle = async ({ params, body, set }) => {
    const [target] = await db.select().from(subarticles).where(eq(subarticles.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Subartículo no encontrado" }
    }

    const { materialId, description, unit, codeOld, minimum } = body

    const errors = {}

    if (materialId !== undefined && materialId !== target.materialId) errors.materialId = "No se puede cambiar el material de un subartículo"
    if (description !== undefined && !description.trim()) errors.description = "La descripción es requerida"
    if (unit !== undefined && !unit.trim()) errors.unit = "La unidad es requerida"
    if (!validarMinimo(minimum)) errors.minimum = MINIMUM_MESSAGE

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const values = { updatedAt: nowForDb() }
    if (description !== undefined) values.description = description
    if (unit !== undefined) values.unit = unit
    if (codeOld !== undefined) values.codeOld = codeOld || null
    if (minimum !== undefined) values.minimum = minimum

    await db.update(subarticles).set(values).where(eq(subarticles.id, target.id))

    return await findSubarticle(target.id)
}

export const changeSubarticleStatus = async ({ params, set }) => {
    const [target] = await db.select().from(subarticles).where(eq(subarticles.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Subartículo no encontrado" }
    }

    const nuevoEstado = target.status === "0" ? "1" : "0"

    if (nuevoEstado === "1") {
        const [material] = await db.select({ status: materials.status }).from(materials).where(eq(materials.id, target.materialId))
        if (material?.status !== "1") {
            set.status = 422
            return { message: "No se puede activar el subartículo: su material está inactivo" }
        }
    }

    await db.update(subarticles)
        .set({ status: nuevoEstado, updatedAt: nowForDb() })
        .where(eq(subarticles.id, target.id))

    return await findSubarticle(target.id)
}
