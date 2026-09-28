import Elysia from "elysia"
import { authGuard } from "../auth/guard.js"
import { requireAbility } from "../auth/roleGuard.js"
import { createSupplier, getSupplierById, getSuppliers, updateSupplier } from "../controllers/suppliers.js"
import { supplierCreateBody, supplierErrors, supplierIdParams, supplierItem, supplierNotFound, supplierUpdateBody, suppliersQuery, suppliersList } from "../schemas/suppliers.js"

export const suppliers = new Elysia({ prefix: "/suppliers" })
    .use(authGuard)
    .guard({ detail: { tags: ["Suppliers"] } }, (app) => app
        .use(requireAbility("Supplier", "read"))
        .get("/", getSuppliers, {
            query: suppliersQuery,
            response: {
                200: suppliersList
            }
        })
        .get("/:id", getSupplierById, {
            params: supplierIdParams,
            response: {
                200: supplierItem,
                404: supplierNotFound
            }
        })
    )
    .guard({ detail: { tags: ["Suppliers"] } }, (app) => app
        .use(requireAbility("Supplier", "manage"))
        .post("/", createSupplier, {
            body: supplierCreateBody,
            response: {
                201: supplierItem,
                422: supplierErrors
            }
        })
        .patch("/:id", updateSupplier, {
            params: supplierIdParams,
            body: supplierUpdateBody,
            response: {
                200: supplierItem,
                404: supplierNotFound,
                422: supplierErrors
            }
        })
    )
