const ROLE_PERMISSIONS = {
    super_admin: { "*": "manage" },
    admin: { Supplier: "manage", NoteEntry: "manage", User: "manage" },
    admin_store: {
        Supplier: "manage",
        Material: "manage",
        Subarticle: "manage",
        NoteEntry: "manage",
        EntrySubarticle: "manage",
        Request: "manage",
        User: "manage"
    },
    observador_almacen: {
        Supplier: "read",
        Material: "read",
        Subarticle: "read",
        NoteEntry: "read",
        EntrySubarticle: "read",
        Request: "read",
        User: "read"
    }
}

const LEVEL_RANK = { read: 1, manage: 2 }

export function can(role, resource, level) {
    const rules = ROLE_PERMISSIONS[role]
    if (!rules) return false

    const grant = rules["*"] ?? rules[resource]
    if (!grant) return false

    return LEVEL_RANK[grant] >= LEVEL_RANK[level]
}
