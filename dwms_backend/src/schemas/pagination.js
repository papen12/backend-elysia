import { t } from 'elysia'

const MAX = 2147483647

export const page = t.Optional(t.Numeric({ minimum: 1, maximum: MAX, multipleOf: 1, error: `page debe ser un número entero entre 1 y ${MAX}` }))

export const perPage = t.Optional(t.Numeric({ minimum: 1, maximum: MAX, multipleOf: 1, error: `perPage debe ser un número entero entre 1 y ${MAX}` }))
