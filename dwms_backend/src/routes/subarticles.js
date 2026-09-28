import Elysia from "elysia"
import { authGuard } from "../auth/guard.js"
import { requireAbility } from "../auth/roleGuard.js"
import { changeSubarticleStatus, createSubarticle, getMinimumStock, getSubarticleById, getSubarticleKardex, getSubarticleMovements, getSubarticles, searchSubarticles, updateSubarticle } from "../controllers/subarticles.js"
import { dateRangeQuery, minimumStockList, subarticleCreateBody, subarticleErrors, subarticleIdParams, subarticleItem, subarticleKardex, subarticleMessage, subarticleMovements, subarticleNotFound, subarticleSearchList, subarticleSearchQuery, subarticlesList, subarticlesQuery, subarticleUpdateBody } from "../schemas/subarticles.js"

export const subarticles = new Elysia({ prefix: "/subarticles" })
    .use(authGuard)
    .guard({ detail: { tags: ["Subarticles"] } }, (app) => app
        .use(requireAbility("Subarticle", "read"))
        .get("/", getSubarticles, {
            query: subarticlesQuery,
            response: {
                200: subarticlesList
            }
        })
        .get("/search", searchSubarticles, {
            query: subarticleSearchQuery,
            response: {
                200: subarticleSearchList
            }
        })
        .get("/minimum-stock", getMinimumStock, {
            response: {
                200: minimumStockList
            }
        })
        .get("/:id", getSubarticleById, {
            params: subarticleIdParams,
            response: {
                200: subarticleItem,
                404: subarticleNotFound
            }
        })
        .get("/:id/kardex", getSubarticleKardex, {
            params: subarticleIdParams,
            query: dateRangeQuery,
            response: {
                200: subarticleKardex,
                404: subarticleNotFound,
                409: subarticleMessage,
                422: subarticleErrors
            }
        })
        .get("/:id/movements", getSubarticleMovements, {
            params: subarticleIdParams,
            query: dateRangeQuery,
            response: {
                200: subarticleMovements,
                404: subarticleNotFound,
                422: subarticleErrors
            }
        })
    )
    .guard({ detail: { tags: ["Subarticles"] } }, (app) => app
        .use(requireAbility("Subarticle", "manage"))
        .post("/", createSubarticle, {
            body: subarticleCreateBody,
            response: {
                201: subarticleItem,
                422: subarticleErrors
            }
        })
        .patch("/:id", updateSubarticle, {
            params: subarticleIdParams,
            body: subarticleUpdateBody,
            response: {
                200: subarticleItem,
                404: subarticleNotFound,
                422: subarticleErrors
            }
        })
        .post("/:id/change-status", changeSubarticleStatus, {
            params: subarticleIdParams,
            response: {
                200: subarticleItem,
                404: subarticleNotFound,
                422: subarticleMessage
            }
        })
    )
