import { t } from 'elysia'

export const login = t.Object({
    username: t.String({ minLength: 1, error: 'El usuario es requerido' }),
    password: t.String({ minLength: 1, error: 'La contraseña es requerida' })
})

export const token = t.Object({
    token_login: t.String()
})

export const authError = t.Object({
    message: t.String()
})