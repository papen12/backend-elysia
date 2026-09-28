const erroresDeValidacion = (error) => {
    const errors = {}

    for (const detalle of error.all ?? []) {
        const campo = detalle.path?.split("/").filter(Boolean)[0] ?? "parametros"
        errors[campo] ??= detalle.schema?.error ?? detalle.message
    }

    if (Object.keys(errors).length === 0) errors.parametros = "Datos inválidos"

    return errors
}

export const handleError = ({ code, error, set }) => {
    if (code === "VALIDATION" && error.type !== "response") {
        set.status = 422
        return { errors: erroresDeValidacion(error) }
    }

    if (code === "NOT_FOUND") {
        set.status = 404
        return { message: "Ruta no encontrada" }
    }

    if (code === "PARSE") {
        set.status = 400
        return { message: "El cuerpo de la petición no es un JSON válido" }
    }

    console.error(error)
    set.status = 500
    return { message: "Error interno del servidor" }
}
