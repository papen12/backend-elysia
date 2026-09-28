import { relations } from "drizzle-orm/relations";
import { bajas, assets, users, ubicaciones, ingresos, auxiliaries, assetsSeguros, seguros, proceedings, assetProceedings, accounts, entities, buildings, gestiones, cierreGestiones, departments, subarticles, entrySubarticles, noteEntries, suppliers, requests, materials, subarticleRequests } from "./schema";

export const assetsRelations = relations(assets, ({one, many}) => ({
	baja: one(bajas, {
		fields: [assets.bajaId],
		references: [bajas.id]
	}),
	user: one(users, {
		fields: [assets.userId],
		references: [users.id]
	}),
	ubicacione: one(ubicaciones, {
		fields: [assets.ubicacionId],
		references: [ubicaciones.id]
	}),
	ingreso: one(ingresos, {
		fields: [assets.ingresoId],
		references: [ingresos.id]
	}),
	auxiliary: one(auxiliaries, {
		fields: [assets.auxiliaryId],
		references: [auxiliaries.id]
	}),
	assetsSeguros: many(assetsSeguros),
	assetProceedings: many(assetProceedings),
	cierreGestiones: many(cierreGestiones),
}));

export const bajasRelations = relations(bajas, ({one, many}) => ({
	assets: many(assets),
	user: one(users, {
		fields: [bajas.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	assets: many(assets),
	bajas: many(bajas),
	gestiones: many(gestiones),
	ingresos: many(ingresos),
	noteEntries: many(noteEntries),
	proceedings_userId: many(proceedings, {
		relationName: "proceedings_userId_users_id"
	}),
	proceedings_adminId: many(proceedings, {
		relationName: "proceedings_adminId_users_id"
	}),
	requests_userId: many(requests, {
		relationName: "requests_userId_users_id"
	}),
	requests_adminId: many(requests, {
		relationName: "requests_adminId_users_id"
	}),
	seguros: many(seguros),
}));

export const ubicacionesRelations = relations(ubicaciones, ({many}) => ({
	assets: many(assets),
}));

export const ingresosRelations = relations(ingresos, ({one, many}) => ({
	assets: many(assets),
	supplier: one(suppliers, {
		fields: [ingresos.supplierId],
		references: [suppliers.id]
	}),
	user: one(users, {
		fields: [ingresos.userId],
		references: [users.id]
	}),
}));

export const auxiliariesRelations = relations(auxiliaries, ({one, many}) => ({
	assets: many(assets),
	account: one(accounts, {
		fields: [auxiliaries.accountId],
		references: [accounts.id]
	}),
}));

export const assetsSegurosRelations = relations(assetsSeguros, ({one}) => ({
	asset: one(assets, {
		fields: [assetsSeguros.assetId],
		references: [assets.id]
	}),
	seguro: one(seguros, {
		fields: [assetsSeguros.seguroId],
		references: [seguros.id]
	}),
}));

export const segurosRelations = relations(seguros, ({one, many}) => ({
	assetsSeguros: many(assetsSeguros),
	supplier: one(suppliers, {
		fields: [seguros.supplierId],
		references: [suppliers.id]
	}),
	seguro: one(seguros, {
		fields: [seguros.seguroId],
		references: [seguros.id],
		relationName: "seguros_seguroId_seguros_id"
	}),
	seguros: many(seguros, {
		relationName: "seguros_seguroId_seguros_id"
	}),
	user: one(users, {
		fields: [seguros.userId],
		references: [users.id]
	}),
}));

export const assetProceedingsRelations = relations(assetProceedings, ({one}) => ({
	proceeding: one(proceedings, {
		fields: [assetProceedings.proceedingId],
		references: [proceedings.id]
	}),
	asset: one(assets, {
		fields: [assetProceedings.assetId],
		references: [assets.id]
	}),
}));

export const proceedingsRelations = relations(proceedings, ({one, many}) => ({
	assetProceedings: many(assetProceedings),
	user_userId: one(users, {
		fields: [proceedings.userId],
		references: [users.id],
		relationName: "proceedings_userId_users_id"
	}),
	user_adminId: one(users, {
		fields: [proceedings.adminId],
		references: [users.id],
		relationName: "proceedings_adminId_users_id"
	}),
}));

export const accountsRelations = relations(accounts, ({many}) => ({
	auxiliaries: many(auxiliaries),
}));

export const buildingsRelations = relations(buildings, ({one, many}) => ({
	entity: one(entities, {
		fields: [buildings.entityId],
		references: [entities.id]
	}),
	departments: many(departments),
}));

export const entitiesRelations = relations(entities, ({many}) => ({
	buildings: many(buildings),
}));

export const cierreGestionesRelations = relations(cierreGestiones, ({one}) => ({
	gestione: one(gestiones, {
		fields: [cierreGestiones.gestionId],
		references: [gestiones.id]
	}),
	asset: one(assets, {
		fields: [cierreGestiones.assetId],
		references: [assets.id]
	}),
}));

export const gestionesRelations = relations(gestiones, ({one, many}) => ({
	cierreGestiones: many(cierreGestiones),
	user: one(users, {
		fields: [gestiones.userId],
		references: [users.id]
	}),
}));

export const departmentsRelations = relations(departments, ({one}) => ({
	building: one(buildings, {
		fields: [departments.buildingId],
		references: [buildings.id]
	}),
}));

export const entrySubarticlesRelations = relations(entrySubarticles, ({one}) => ({
	subarticle: one(subarticles, {
		fields: [entrySubarticles.subarticleId],
		references: [subarticles.id]
	}),
	noteEntry: one(noteEntries, {
		fields: [entrySubarticles.noteEntryId],
		references: [noteEntries.id]
	}),
}));

export const subarticlesRelations = relations(subarticles, ({one, many}) => ({
	entrySubarticles: many(entrySubarticles),
	material: one(materials, {
		fields: [subarticles.materialId],
		references: [materials.id]
	}),
	subarticleRequests: many(subarticleRequests),
}));

export const noteEntriesRelations = relations(noteEntries, ({one, many}) => ({
	entrySubarticles: many(entrySubarticles),
	user: one(users, {
		fields: [noteEntries.userId],
		references: [users.id]
	}),
	supplier: one(suppliers, {
		fields: [noteEntries.supplierId],
		references: [suppliers.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	ingresos: many(ingresos),
	noteEntries: many(noteEntries),
	seguros: many(seguros),
}));

export const requestsRelations = relations(requests, ({one, many}) => ({
	user_userId: one(users, {
		fields: [requests.userId],
		references: [users.id],
		relationName: "requests_userId_users_id"
	}),
	user_adminId: one(users, {
		fields: [requests.adminId],
		references: [users.id],
		relationName: "requests_adminId_users_id"
	}),
	subarticleRequests: many(subarticleRequests),
}));

export const materialsRelations = relations(materials, ({many}) => ({
	subarticles: many(subarticles),
}));

export const subarticleRequestsRelations = relations(subarticleRequests, ({one}) => ({
	subarticle: one(subarticles, {
		fields: [subarticleRequests.subarticleId],
		references: [subarticles.id]
	}),
	request: one(requests, {
		fields: [subarticleRequests.requestId],
		references: [requests.id]
	}),
}));