import Elysia from "elysia"
import { jwtConfig } from "../auth/jwt.js"
import { login as loginSchema, token, authError } from "../schemas/auth.js"
import { login as loginController } from "../controllers/auth.js"

export const auth = new Elysia({ prefix: "/auth" })
    .use(jwtConfig)
    .post("/login", loginController, {
        body: loginSchema,
        response: {
            200: token,
            401: authError,
            403: authError
        },
        detail: {
            tags: ["Auth"]
        }
    })
