import Elysia from "elysia"
import { eq } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { users } from "../db/schema.js"
import { jwtConfig } from "./jwt.js"

export const authGuard = new Elysia()
    .use(jwtConfig)
    .derive({ as: "scoped" }, async ({ jwt, headers }) => {
        const authHeader = headers.authorization
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

        const payload = token ? await jwt.verify(token) : false
        if (!payload) return { currentUser: false }

        const [user] = await db
            .select({ id: users.id, username: users.username, role: users.role, status: users.status })
            .from(users)
            .where(eq(users.id, payload.id))

        if (!user || user.status !== "1") return { currentUser: false }

        return { currentUser: { id: user.id, username: user.username, role: user.role } }
    })
    .onBeforeHandle({ as: "scoped" }, ({ currentUser, set }) => {
        if (!currentUser) {
            set.status = 401
            return { message: "No autenticado" }
        }
    })
