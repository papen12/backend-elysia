import Elysia from "elysia"
import { authGuard } from "../auth/guard.js"
import { requireAbility } from "../auth/roleGuard.js"
import { cancelNoteEntry, createNoteEntry, getNextNumber, getNoteEntries, getNoteEntryById, updateNoteEntry } from "../controllers/noteEntries.js"
import { nextNumber, nextNumberQuery, noteEntriesList, noteEntriesQuery, noteEntryCancelBody, noteEntryCreateBody, noteEntryDetail, noteEntryErrors, noteEntryIdParams, noteEntryMessage, noteEntryUpdateBody } from "../schemas/noteEntries.js"

export const noteEntries = new Elysia({ prefix: "/note-entries" })
    .use(authGuard)
    .guard({ detail: { tags: ["NoteEntries"] } }, (app) => app
        .use(requireAbility("NoteEntry", "read"))
        .get("/", getNoteEntries, {
            query: noteEntriesQuery,
            response: {
                200: noteEntriesList
            }
        })
        .get("/next-number", getNextNumber, {
            query: nextNumberQuery,
            response: {
                200: nextNumber,
                422: noteEntryErrors
            }
        })
        .get("/:id", getNoteEntryById, {
            params: noteEntryIdParams,
            response: {
                200: noteEntryDetail,
                404: noteEntryMessage
            }
        })
    )
    .guard({ detail: { tags: ["NoteEntries"] } }, (app) => app
        .use(requireAbility("NoteEntry", "manage"))
        .post("/", createNoteEntry, {
            body: noteEntryCreateBody,
            response: {
                201: noteEntryDetail,
                422: noteEntryErrors
            }
        })
        .patch("/:id", updateNoteEntry, {
            params: noteEntryIdParams,
            body: noteEntryUpdateBody,
            response: {
                200: noteEntryDetail,
                404: noteEntryMessage,
                409: noteEntryMessage,
                422: noteEntryErrors
            }
        })
        .post("/:id/cancel", cancelNoteEntry, {
            params: noteEntryIdParams,
            body: noteEntryCancelBody,
            response: {
                200: noteEntryDetail,
                404: noteEntryMessage,
                409: noteEntryMessage,
                422: noteEntryErrors
            }
        })
    )
