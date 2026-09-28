import Elysia from "elysia"
import { authGuard } from "../auth/guard.js"
import { requireAbility } from "../auth/roleGuard.js"
import { changeMaterialStatus, createMaterial, getMaterialById, getMaterials, updateMaterial } from "../controllers/materials.js"
import { materialCreateBody, materialErrors, materialIdParams, materialItem, materialMessage, materialNotFound, materialsList, materialsQuery, materialUpdateBody } from "../schemas/materials.js"

export const materials = new Elysia({ prefix: "/materials" })
    .use(authGuard)
    .guard({ detail: { tags: ["Materials"] } }, (app) => app
        .use(requireAbility("Material", "read"))
        .get("/", getMaterials, {
            query: materialsQuery,
            response: {
                200: materialsList
            }
        })
        .get("/:id", getMaterialById, {
            params: materialIdParams,
            response: {
                200: materialItem,
                404: materialNotFound
            }
        })
    )
    .guard({ detail: { tags: ["Materials"] } }, (app) => app
        .use(requireAbility("Material", "manage"))
        .post("/", createMaterial, {
            body: materialCreateBody,
            response: {
                201: materialItem,
                422: materialErrors
            }
        })
        .patch("/:id", updateMaterial, {
            params: materialIdParams,
            body: materialUpdateBody,
            response: {
                200: materialItem,
                404: materialNotFound,
                422: materialErrors
            }
        })
        .post("/:id/change-status", changeMaterialStatus, {
            params: materialIdParams,
            response: {
                200: materialItem,
                404: materialNotFound,
                422: materialMessage
            }
        })
    )
