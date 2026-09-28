import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema.js"

export const pool = mysql.createPool({
    host: Bun.env.DB_HOST,
    port: Number(Bun.env.DB_PORT),
    user: Bun.env.DB_USER,
    password: Bun.env.DB_PASSWORD,
    database: Bun.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
})

pool.on("connection", (conexion) => {
    conexion.on("error", (error) => console.error("Error en conexión a la base:", error.code ?? error.message))
})

export const db = drizzle(pool, { schema, mode: "default" })
