import Elysia from "elysia"
import { authGuard } from "../auth/guard.js"
import { requireAbility } from "../auth/roleGuard.js"
import { cancelRequest, createRequest, deliverRequest, getNextNumber, getRequestById, getRequests } from "../controllers/requests.js"
import { nextNumber, nextNumberQuery, requestCancelBody, requestCreateBody, requestDeliverBody, requestDetail, requestErrors, requestIdParams, requestMessage, requestNotFound, requestsList, requestsQuery } from "../schemas/requests.js"

export const requests = new Elysia({ prefix: "/requests" })
    .use(authGuard)
    .guard({ detail: { tags: ["Requests"] } }, (app) => app
        .use(requireAbility("Request", "read"))
        .get("/", getRequests, {
            query: requestsQuery,
            response: {
                200: requestsList
            }
        })
        .get("/next-number", getNextNumber, {
            query: nextNumberQuery,
            response: {
                200: nextNumber,
                422: requestErrors
            }
        })
        .get("/:id", getRequestById, {
            params: requestIdParams,
            response: {
                200: requestDetail,
                404: requestNotFound
            }
        })
    )
    .guard({ detail: { tags: ["Requests"] } }, (app) => app
        .use(requireAbility("Request", "manage"))
        .post("/", createRequest, {
            body: requestCreateBody,
            response: {
                201: requestDetail,
                422: requestErrors
            }
        })
        .post("/:id/deliver", deliverRequest, {
            params: requestIdParams,
            body: requestDeliverBody,
            response: {
                200: requestDetail,
                404: requestNotFound,
                409: requestMessage,
                422: requestErrors
            }
        })
        .post("/:id/cancel", cancelRequest, {
            params: requestIdParams,
            body: requestCancelBody,
            response: {
                200: requestDetail,
                404: requestNotFound,
                409: requestMessage,
                422: requestErrors
            }
        })
    )
