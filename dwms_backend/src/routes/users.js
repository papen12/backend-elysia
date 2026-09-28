import Elysia from "elysia"
import { authGuard } from "../auth/guard.js"
import { requireAbility } from "../auth/roleGuard.js"
import { changeOwnPassword, changeUserStatus, createUser, getUserById, getUserHistoricoAlmacen, getUsers, hideOwnAnnouncement, searchUsers, updateUser } from "../controllers/users.js"
import { changePasswordBody, userCreateBody, userDetail, userErrors, userHistoricoQuery, userHistoricoList, userIdParams, userMessage, userNotFound, userSearchList, userSearchQuery, userUpdateBody, usersQuery, usersList } from "../schemas/users.js"

export const users = new Elysia({ prefix: "/users" })
    .use(authGuard)
    .guard({ detail: { tags: ["Users"] } }, (app) => app
        .patch("/me/password", changeOwnPassword, {
            body: changePasswordBody,
            response: {
                200: userMessage,
                404: userNotFound,
                422: userErrors
            }
        })
        .post("/me/hide-announcement", hideOwnAnnouncement, {
            response: {
                200: userMessage,
                404: userNotFound
            }
        })
    )
    .guard({ detail: { tags: ["Users"] } }, (app) => app
        .use(requireAbility("User", "read"))
        .get("/", getUsers, {
            query: usersQuery,
            response: {
                200: usersList
            }
        })
        .get("/search", searchUsers, {
            query: userSearchQuery,
            response: {
                200: userSearchList
            }
        })
        .get("/:id", getUserById, {
            params: userIdParams,
            response: {
                200: userDetail,
                404: userNotFound
            }
        })
        .get("/:id/historico-almacen", getUserHistoricoAlmacen, {
            params: userIdParams,
            query: userHistoricoQuery,
            response: {
                200: userHistoricoList,
                404: userNotFound
            }
        })
    )
    .guard({ detail: { tags: ["Users"] } }, (app) => app
        .use(requireAbility("User", "manage"))
        .post("/", createUser, {
            body: userCreateBody,
            response: {
                201: userDetail,
                422: userErrors
            }
        })
        .patch("/:id", updateUser, {
            params: userIdParams,
            body: userUpdateBody,
            response: {
                200: userDetail,
                403: userNotFound,
                404: userNotFound,
                422: userErrors
            }
        })
        .post("/:id/change-status", changeUserStatus, {
            params: userIdParams,
            response: {
                200: userDetail,
                404: userNotFound
            }
        })
    )
