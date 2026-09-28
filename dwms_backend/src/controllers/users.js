import { and, asc, desc, eq, gt, isNull, like, ne, or } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { departments, requests, subarticleRequests, subarticles, users } from "../db/schema.js"
import { hashLegacyPassword, verifyLegacyPassword } from "../auth/security.js"
import { nowForDb } from "../utils/dates.js"

const CI_FORMAT = /^[1-9][0-9]{4,15}(-[a-zA-Z0-9]{2})?$/
const EMAIL_FORMAT = /^[^@\s]+@(?:[-a-z0-9]+\.)+[a-z]{2,}$/i
const ROLES = ["admin", "admin_store", "observador_almacen"]

const SORTABLE_COLUMNS = {
    code: users.code,
    ci: users.ci,
    name: users.name,
    title: users.title,
    role: users.role,
    department: departments.name,
}

export const getUsers = async ({ query }) => {
    const { q, searchColumn, sortColumn, sortDirection, page, perPage } = query

    const orderColumn = SORTABLE_COLUMNS[sortColumn] ?? users.name
    const orderBy = sortDirection === "desc" ? desc(orderColumn) : asc(orderColumn)

    const conditions = [or(isNull(users.role), ne(users.role, "super_admin"))]

    if (q) {
        const column = searchColumn ? SORTABLE_COLUMNS[searchColumn] : null
        conditions.push(
            column
                ? like(column, `%${q}%`)
                : or(
                    like(users.code, `%${q}%`),
                    like(users.ci, `%${q}%`),
                    like(users.name, `%${q}%`),
                    like(users.title, `%${q}%`),
                    like(departments.name, `%${q}%`)
                )
        )
    }

    let listado = db
        .select({
            id: users.id,
            code: users.code,
            ci: users.ci,
            name: users.name,
            title: users.title,
            email: users.email,
            phone: users.phone,
            mobile: users.mobile,
            status: users.status,
            role: users.role,
            departmentId: users.departmentId,
            departmentName: departments.name,
        })
        .from(users)
        .leftJoin(departments, eq(users.departmentId, departments.id))
        .where(and(...conditions))
        .orderBy(orderBy)

    if (perPage) {
        const currentPage = page ?? 1
        listado = listado.limit(perPage).offset((currentPage - 1) * perPage)
    }

    return await listado
}

export const searchUsers = async ({ query }) => {
    const q = query.q ?? ""

    return await db
        .select({ id: users.id, name: users.name, title: users.title })
        .from(users)
        .where(and(eq(users.status, "1"), like(users.name, `%${q}%`), ne(users.username, "admin")))
        .orderBy(asc(users.name))
}

export const getUserById = async ({ params, set }) => {
    const [user] = await db.select().from(users).where(eq(users.id, params.id))

    if (!user) {
        set.status = 404
        return { message: "Usuario no encontrado" }
    }

    const { encryptedPassword: _omit, ...safeUser } = user
    return safeUser
}

export const createUser = async ({ body, currentUser, set }) => {
    const actorIsSuperAdmin = currentUser.role === "super_admin"
    const { name, title, ci, email, phone, mobile, departmentId, role, password } = body

    const errors = {}

    if (!ci || !CI_FORMAT.test(ci)) errors.ci = "El CI es inválido"
    if (!name) errors.name = "El nombre es requerido"
    if (!title) errors.title = "El cargo es requerido"
    if (!departmentId) errors.departmentId = "La unidad es requerida"
    if (!email || !EMAIL_FORMAT.test(email)) errors.email = "El email es inválido"
    if (phone && !/^\d+$/.test(phone)) errors.phone = "El teléfono debe ser numérico"
    if (mobile && !/^\d+$/.test(mobile)) errors.mobile = "El celular debe ser numérico"

    if (actorIsSuperAdmin) {
        if (!role || !ROLES.includes(role)) errors.role = "El rol es inválido"
        if (!password || password.length < 7) errors.password = "La contraseña debe tener al menos 7 caracteres"
    }

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    const [department] = await db.select().from(departments).where(eq(departments.id, departmentId))
    if (!department) {
        set.status = 422
        return { errors: { departmentId: "La unidad no existe" } }
    }

    const [ciDuplicado] = await db.select().from(users).where(eq(users.ci, ci))
    if (ciDuplicado) {
        set.status = 422
        return { errors: { ci: "Ya existe un usuario con ese CI" } }
    }

    const [emailDuplicado] = await db.select().from(users).where(eq(users.email, email))
    if (emailDuplicado) {
        set.status = 422
        return { errors: { email: "Ya existe un usuario con ese email" } }
    }

    const finalPassword = actorIsSuperAdmin ? password : (password || ci)
    const encryptedPassword = await hashLegacyPassword(finalPassword)
    const timestamp = nowForDb()

    const [insertResult] = await db.insert(users).values({
        username: ci,
        ci,
        name: name.toUpperCase(),
        title: title.toUpperCase(),
        email,
        phone: phone || null,
        mobile: mobile || null,
        departmentId,
        role: actorIsSuperAdmin ? role : null,
        encryptedPassword,
        status: "1",
        passwordChange: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    })

    const [created] = await db.select().from(users).where(eq(users.id, insertResult.insertId))
    const { encryptedPassword: _omit, ...safeUser } = created

    set.status = 201
    return safeUser
}

const CANNOT_EDIT_TARGET_ROLE = {
    admin: ["super_admin", "admin_store"],
    admin_store: ["super_admin", "admin"],
}

export const updateUser = async ({ params, body, currentUser, set }) => {
    const [target] = await db.select().from(users).where(eq(users.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Usuario no encontrado" }
    }

    const bloqueados = CANNOT_EDIT_TARGET_ROLE[currentUser.role] ?? []
    if (bloqueados.includes(target.role)) {
        set.status = 403
        return { message: "No autorizado para editar este usuario" }
    }

    const actorIsSuperAdmin = currentUser.role === "super_admin"
    const { name, title, ci, email, phone, mobile, departmentId, role, password } = body

    const errors = {}

    if (ci !== undefined && !CI_FORMAT.test(ci)) errors.ci = "El CI es inválido"
    if (name !== undefined && !name) errors.name = "El nombre es requerido"
    if (title !== undefined && !title) errors.title = "El cargo es requerido"
    if (departmentId !== undefined && !departmentId) errors.departmentId = "La unidad es requerida"
    if (email !== undefined && !EMAIL_FORMAT.test(email)) errors.email = "El email es inválido"
    if (phone && !/^\d+$/.test(phone)) errors.phone = "El teléfono debe ser numérico"
    if (mobile && !/^\d+$/.test(mobile)) errors.mobile = "El celular debe ser numérico"
    if (actorIsSuperAdmin && role !== undefined && role !== null && !ROLES.includes(role)) {
        errors.role = "El rol es inválido"
    }
    if (actorIsSuperAdmin && password !== undefined && password.length < 7) {
        errors.password = "La contraseña debe tener al menos 7 caracteres"
    }

    if (Object.keys(errors).length > 0) {
        set.status = 422
        return { errors }
    }

    if (departmentId !== undefined) {
        const [department] = await db.select().from(departments).where(eq(departments.id, departmentId))
        if (!department) {
            set.status = 422
            return { errors: { departmentId: "La unidad no existe" } }
        }
    }

    if (ci !== undefined && ci !== target.ci) {
        const [ciDuplicado] = await db.select().from(users).where(and(eq(users.ci, ci), ne(users.id, target.id)))
        if (ciDuplicado) {
            set.status = 422
            return { errors: { ci: "Ya existe un usuario con ese CI" } }
        }
    }

    if (email !== undefined && email !== target.email) {
        const [emailDuplicado] = await db.select().from(users).where(and(eq(users.email, email), ne(users.id, target.id)))
        if (emailDuplicado) {
            set.status = 422
            return { errors: { email: "Ya existe un usuario con ese email" } }
        }
    }

    const values = { updatedAt: nowForDb() }
    if (name !== undefined) values.name = name.toUpperCase()
    if (title !== undefined) values.title = title.toUpperCase()
    if (ci !== undefined) {
        values.ci = ci
        values.username = ci
    }
    if (email !== undefined) values.email = email
    if (phone !== undefined) values.phone = phone || null
    if (mobile !== undefined) values.mobile = mobile || null
    if (departmentId !== undefined) values.departmentId = departmentId
    if (actorIsSuperAdmin && role !== undefined) values.role = role || null
    if (actorIsSuperAdmin && password) values.encryptedPassword = await hashLegacyPassword(password)

    await db.update(users).set(values).where(eq(users.id, target.id))

    const [updated] = await db.select().from(users).where(eq(users.id, target.id))
    const { encryptedPassword: _omit, ...safeUser } = updated
    return safeUser
}

export const getUserHistoricoAlmacen = async ({ params, query, set }) => {
    const [user] = await db.select().from(users).where(eq(users.id, params.id))
    if (!user) {
        set.status = 404
        return { message: "Usuario no encontrado" }
    }

    const conditions = [
        eq(requests.status, "delivered"),
        eq(requests.userId, user.id),
        gt(subarticleRequests.totalDelivered, 0),
    ]

    if (query.q) {
        conditions.push(
            or(
                like(subarticles.code, `%${query.q}%`),
                like(subarticles.description, `%${query.q}%`),
                like(requests.nroSolicitud, `%${query.q}%`)
            )
        )
    }

    const orderBy = query.sortBy === "subarticulo"
        ? [asc(subarticles.code), asc(requests.deliveryDate)]
        : [asc(requests.deliveryDate), asc(requests.nroSolicitud)]

    return await db
        .select({
            fechaEntrega: requests.deliveryDate,
            requestId: requests.id,
            subarticuloId: subarticles.id,
            subarticuloCodigo: subarticles.code,
            descripcion: subarticles.description,
            numeroSolicitud: requests.nroSolicitud,
            cantidadEntregado: subarticleRequests.totalDelivered,
        })
        .from(subarticles)
        .innerJoin(subarticleRequests, eq(subarticleRequests.subarticleId, subarticles.id))
        .innerJoin(requests, eq(subarticleRequests.requestId, requests.id))
        .where(and(...conditions))
        .orderBy(...orderBy)
}

export const changeOwnPassword = async ({ body, currentUser, set }) => {
    const [user] = await db.select().from(users).where(eq(users.id, currentUser.id))
    if (!user) {
        set.status = 404
        return { message: "Usuario no encontrado" }
    }

    const { currentPassword, password, passwordConfirmation } = body

    const matches = await verifyLegacyPassword(user.encryptedPassword, currentPassword)
    if (!matches) {
        set.status = 422
        return { errors: { currentPassword: "La contraseña actual es incorrecta" } }
    }

    if (!password || password.length < 7) {
        set.status = 422
        return { errors: { password: "La contraseña debe tener al menos 7 caracteres" } }
    }

    if (password !== passwordConfirmation) {
        set.status = 422
        return { errors: { passwordConfirmation: "Las contraseñas no coinciden" } }
    }

    const encryptedPassword = await hashLegacyPassword(password)

    await db.update(users)
        .set({ encryptedPassword, passwordChange: 1, updatedAt: nowForDb() })
        .where(eq(users.id, user.id))

    return { message: "Contraseña actualizada correctamente" }
}

export const hideOwnAnnouncement = async ({ currentUser, set }) => {
    const [user] = await db.select().from(users).where(eq(users.id, currentUser.id))
    if (!user) {
        set.status = 404
        return { message: "Usuario no encontrado" }
    }

    await db.update(users)
        .set({ passwordChange: 1, updatedAt: nowForDb() })
        .where(eq(users.id, user.id))

    return { message: "Aviso ocultado" }
}

export const changeUserStatus = async ({ params, set }) => {
    const [target] = await db.select().from(users).where(eq(users.id, params.id))
    if (!target) {
        set.status = 404
        return { message: "Usuario no encontrado" }
    }

    const nuevoEstado = target.status === "1" ? "0" : "1"

    await db.update(users)
        .set({ status: nuevoEstado, updatedAt: nowForDb() })
        .where(eq(users.id, target.id))

    const [updated] = await db.select().from(users).where(eq(users.id, target.id))
    const { encryptedPassword: _omit, ...safeUser } = updated
    return safeUser
}
