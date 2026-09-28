import Elysia from "elysia"
import { can } from "./ability.js"

export const requireAbility = (resource, level) => new Elysia()
    .onBeforeHandle({ as: "scoped" }, ({ currentUser, set }) => {
        if (!can(currentUser?.role, resource, level)) {
            set.status = 403
            return { message: "No autorizado" }
        }
    })
