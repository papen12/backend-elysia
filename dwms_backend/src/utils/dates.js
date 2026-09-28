import { format, isValid, parseISO, startOfYear } from "date-fns"

export function nowForDb() {
    return format(new Date(), "yyyy-MM-dd HH:mm:ss")
}

export function today() {
    return format(new Date(), "yyyy-MM-dd")
}

export function firstDayOfYear() {
    return format(startOfYear(new Date()), "yyyy-MM-dd")
}

export function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value))
}
