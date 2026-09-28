import Elysia from "elysia";
import {swagger} from "@elysiajs/swagger"
import { jwtConfig } from "./auth/jwt";
import { auth } from "./routes/auth.js"
import { users } from "./routes/users.js"
import { suppliers } from "./routes/suppliers.js"
import { materials } from "./routes/materials.js"
import { subarticles } from "./routes/subarticles.js"
import { requests } from "./routes/requests.js"
import { noteEntries } from "./routes/noteEntries.js"
import { handleError } from "./utils/errors.js"

const app= new Elysia( { prefix:"/api" } )
const port=Bun.env.PORT

app.use(swagger({
    documentation: {
        tags: [
            { name: "Auth", description: "Autenticación" },
            { name: "Users", description: "Gestión de usuarios" },
            { name: "Suppliers", description: "Gestión de proveedores" },
            { name: "Materials", description: "Gestión de grupos contables (materiales)" },
            { name: "Subarticles", description: "Gestión de subartículos (artículos de almacén)" },
            { name: "Requests", description: "Solicitudes de material (salidas de almacén)" },
            { name: "NoteEntries", description: "Notas de ingreso (entradas de almacén)" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
            }
        },
        security: [{ bearerAuth: [] }]
    }
}))
app.onError({ as: "global" }, handleError)
app.use(jwtConfig)
app.use(auth)
app.use(users)
app.use(suppliers)
app.use(materials)
app.use(subarticles)
app.use(requests)
app.use(noteEntries)

app.get("/",()=>console.log("Hola Elyssia"))

app.listen(port)

console.log(`Backend corriendo en: http://localhost:${port}/api`)
console.log(`Documentacion en: http://localhost:${port}/api/swagger`)