import { t } from 'elysia'
import { page, perPage } from './pagination.js'

export const usersQuery = t.Object({
    q: t.Optional(t.String()),
    searchColumn: t.Optional(t.String()),
    sortColumn: t.Optional(t.String()),
    sortDirection: t.Optional(t.String()),
    page,
    perPage,
})

export const userListItem = t.Object({
    id: t.Number(),
    code: t.Nullable(t.Number()),
    ci: t.Nullable(t.String()),
    name: t.Nullable(t.String()),
    title: t.Nullable(t.String()),
    email: t.String(),
    phone: t.Nullable(t.String()),
    mobile: t.Nullable(t.String()),
    status: t.Nullable(t.String()),
    role: t.Nullable(t.String()),
    departmentId: t.Nullable(t.Number()),
    departmentName: t.Nullable(t.String()),
})

export const usersList = t.Array(userListItem)

export const userSearchQuery = t.Object({
    q: t.Optional(t.String())
})

export const userSearchList = t.Array(t.Object({
    id: t.Number(),
    name: t.Nullable(t.String()),
    title: t.Nullable(t.String())
}))

const name = t.String({ minLength: 1, maxLength: 230, error: "El nombre es requerido y debe tener como máximo 230 caracteres" })
const title = t.String({ minLength: 1, maxLength: 230, error: "El cargo es requerido y debe tener como máximo 230 caracteres" })
const ci = t.String({ minLength: 1, maxLength: 255, error: "El CI es requerido y debe tener como máximo 255 caracteres" })
const email = t.String({ minLength: 1, maxLength: 255, error: "El email es requerido y debe tener como máximo 255 caracteres" })
const phone = t.String({ maxLength: 230, error: "El teléfono debe tener como máximo 230 caracteres" })
const mobile = t.String({ maxLength: 230, error: "El celular debe tener como máximo 230 caracteres" })
const departmentId = t.Number({ error: "La unidad es requerida" })
const role = t.String({ maxLength: 255, error: "El rol debe tener como máximo 255 caracteres" })
const password = t.String({ maxLength: 128, error: "La contraseña debe tener como máximo 128 caracteres" })

export const userCreateBody = t.Object({
    name,
    title,
    ci,
    email,
    phone: t.Optional(phone),
    mobile: t.Optional(mobile),
    departmentId,
    role: t.Optional(role),
    password: t.Optional(password)
})

export const userDetail = t.Object({
    id: t.Number(),
    username: t.String(),
    code: t.Nullable(t.Number()),
    ci: t.Nullable(t.String()),
    name: t.Nullable(t.String()),
    title: t.Nullable(t.String()),
    email: t.String(),
    phone: t.Nullable(t.String()),
    mobile: t.Nullable(t.String()),
    status: t.Nullable(t.String()),
    role: t.Nullable(t.String()),
    departmentId: t.Nullable(t.Number()),
    createdAt: t.Nullable(t.String()),
    updatedAt: t.Nullable(t.String())
})

export const userErrors = t.Object({
    errors: t.Record(t.String(), t.String())
})

export const userIdParams = t.Object({
    id: t.Numeric()
})

export const userNotFound = t.Object({
    message: t.String()
})

export const changePasswordBody = t.Object({
    currentPassword: t.String({ minLength: 1, maxLength: 128, error: "La contraseña actual es requerida y debe tener como máximo 128 caracteres" }),
    password: t.String({ minLength: 1, maxLength: 128, error: "La contraseña es requerida y debe tener como máximo 128 caracteres" }),
    passwordConfirmation: t.String({ minLength: 1, maxLength: 128, error: "La confirmación es requerida y debe tener como máximo 128 caracteres" })
})

export const userMessage = t.Object({
    message: t.String()
})

export const userHistoricoQuery = t.Object({
    q: t.Optional(t.String()),
    sortBy: t.Optional(t.String())
})

export const userHistoricoList = t.Array(t.Object({
    fechaEntrega: t.Nullable(t.String()),
    requestId: t.Number(),
    subarticuloId: t.Number(),
    subarticuloCodigo: t.Nullable(t.Number()),
    descripcion: t.Nullable(t.String()),
    numeroSolicitud: t.Nullable(t.Number()),
    cantidadEntregado: t.Nullable(t.String())
}))

export const userUpdateBody = t.Object({
    name: t.Optional(name),
    title: t.Optional(title),
    ci: t.Optional(ci),
    email: t.Optional(email),
    phone: t.Optional(phone),
    mobile: t.Optional(mobile),
    departmentId: t.Optional(departmentId),
    role: t.Optional(t.Nullable(role)),
    password: t.Optional(password)
})
