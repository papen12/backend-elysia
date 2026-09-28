import { eq } from "drizzle-orm"
import { db } from "../db/bd_conection.js"
import { users } from "../db/schema.js"
import { verifyLegacyPassword } from "../auth/security.js"

export const login = async ({ body, jwt, set }) => {
    const { username, password } = body

    const [user] = await db.select().from(users).where(eq(users.username, username))

    if (!user) {
        set.status = 401
        return { message: "Usuario o contraseña incorrectos" }
    }

    const passwordMatches = await verifyLegacyPassword(user.encryptedPassword, password)

    if (!passwordMatches) {
        set.status = 401
        return { message: "Usuario o contraseña incorrectos" }
    }

    if (user.status !== "1") {
        set.status = 403
        return { message: "Usuario inactivo" }
    }

    const token_login = await jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role
    })

    return { token_login }
}
