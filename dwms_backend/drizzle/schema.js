import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, datetime, text, date, index, foreignKey, decimal, unique, double, mysqlView } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const accounts = mysqlTable("accounts", {
	id: int().autoincrement().notNull(),
	code: int().default('NULL'),
	name: varchar({ length: 230 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	vidaUtil: int("vida_util").default(0).notNull(),
	depreciar: tinyint().default(0).notNull(),
	actualizar: tinyint().default(0).notNull(),
	status: varchar({ length: 255 }).default('\'1\''),
});

export const apiTokens = mysqlTable("api_tokens", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	nombre: varchar({ length: 255 }).notNull(),
	token: text().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	fechaExpiracion: date("fecha_expiracion", { mode: 'string' }).default('NULL'),
	status: varchar({ length: 2 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

export const assets = mysqlTable("assets", {
	id: int().autoincrement().notNull(),
	code: int().default('NULL'),
	description: text().default('NULL'),
	auxiliaryId: int("auxiliary_id").default('NULL').references(() => auxiliaries.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	accountId: int("account_id").default('NULL'),
	barcode: varchar({ length: 255 }).default('NULL'),
	state: int().default('NULL'),
	observation: text().default('NULL'),
	proceso: varchar({ length: 255 }).default('NULL'),
	observaciones: varchar({ length: 255 }).default('NULL'),
	precio: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	detalle: varchar({ length: 255 }).default('NULL'),
	medidas: varchar({ length: 255 }).default('NULL'),
	material: varchar({ length: 255 }).default('NULL'),
	color: varchar({ length: 255 }).default('NULL'),
	marca: varchar({ length: 255 }).default('NULL'),
	modelo: varchar({ length: 255 }).default('NULL'),
	serie: varchar({ length: 255 }).default('NULL'),
	codeOld: varchar("code_old", { length: 255 }).default('NULL'),
	ingresoId: int("ingreso_id").default('NULL').references(() => ingresos.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	ubicacionId: int("ubicacion_id").default('NULL').references(() => ubicaciones.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	bajaId: int("baja_id").default('NULL').references(() => bajas.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	assetId: int("asset_id").default('NULL'),
},
(table) => [
	index("index_assets_on_auxiliary_id").on(table.auxiliaryId),
	index("index_assets_on_user_id").on(table.userId),
	index("index_assets_on_account_id").on(table.accountId),
	index("index_assets_on_ingreso_id").on(table.ingresoId),
	index("index_assets_on_ubicacion_id").on(table.ubicacionId),
	index("index_assets_on_baja_id").on(table.bajaId),
	index("index_assets_on_asset_id").on(table.assetId),
]);

export const assetsSeguros = mysqlTable("assets_seguros", {
	assetId: int("asset_id").notNull().references(() => assets.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	seguroId: int("seguro_id").notNull().references(() => seguros.id, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => [
	index("index_assets_seguros_on_asset_id_and_seguro_id").on(table.assetId, table.seguroId),
	index("index_assets_seguros_on_seguro_id_and_asset_id").on(table.seguroId, table.assetId),
]);

export const assetProceedings = mysqlTable("asset_proceedings", {
	id: int().autoincrement().notNull(),
	proceedingId: int("proceeding_id").default('NULL').references(() => proceedings.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	assetId: int("asset_id").default('NULL').references(() => assets.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("index_asset_proceedings_on_proceeding_id").on(table.proceedingId),
	index("index_asset_proceedings_on_asset_id").on(table.assetId),
]);

export const auxiliaries = mysqlTable("auxiliaries", {
	id: int().autoincrement().notNull(),
	code: int().default('NULL'),
	name: varchar({ length: 230 }).default('NULL'),
	accountId: int("account_id").default('NULL').references(() => accounts.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	status: varchar({ length: 255 }).default('NULL'),
},
(table) => [
	index("index_auxiliaries_on_account_id").on(table.accountId),
]);

export const bajas = mysqlTable("bajas", {
	id: int().autoincrement().notNull(),
	numero: int().default('NULL'),
	documento: varchar({ length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	fecha: date({ mode: 'string' }).default('NULL'),
	observacion: text().default('NULL'),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
	motivo: varchar({ length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	fechaDocumento: date("fecha_documento", { mode: 'string' }).default('NULL'),
	documentoId: int("documento_id").default('NULL'),
	documentoCite: varchar("documento_cite", { length: 255 }).default('NULL'),
},
(table) => [
	index("index_bajas_on_user_id").on(table.userId),
]);

export const buildings = mysqlTable("buildings", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).default('NULL'),
	name: varchar({ length: 230 }).default('NULL'),
	entityId: int("entity_id").default('NULL').references(() => entities.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	status: varchar({ length: 255 }).default('NULL'),
},
(table) => [
	index("index_buildings_on_entity_id").on(table.entityId),
	unique("index_buildings_on_code").on(table.code),
]);

export const cierreGestiones = mysqlTable("cierre_gestiones", {
	id: int().autoincrement().notNull(),
	actualizacionGestion: decimal("actualizacion_gestion", { precision: 19, scale: 6 }).default('NULL'),
	depreciacionGestion: decimal("depreciacion_gestion", { precision: 19, scale: 6 }).default('NULL'),
	indiceUfv: decimal("indice_ufv", { precision: 6, scale: 5 }).default('NULL'),
	assetId: int("asset_id").default('NULL').references(() => assets.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	gestionId: int("gestion_id").default('NULL').references(() => gestiones.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	fecha: date({ mode: 'string' }).default('NULL'),
},
(table) => [
	index("index_cierre_gestiones_on_asset_id").on(table.assetId),
	index("index_cierre_gestiones_on_gestion_id").on(table.gestionId),
]);

export const departments = mysqlTable("departments", {
	id: int().autoincrement().notNull(),
	code: int().default('NULL'),
	name: varchar({ length: 230 }).default('NULL'),
	status: varchar({ length: 2 }).default('NULL'),
	buildingId: int("building_id").default('NULL').references(() => buildings.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
},
(table) => [
	index("index_departments_on_building_id").on(table.buildingId),
]);

export const entities = mysqlTable("entities", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).default('NULL'),
	name: varchar({ length: 230 }).default('NULL'),
	acronym: varchar({ length: 50 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	header: varchar({ length: 255 }).default('NULL'),
	footer: varchar({ length: 255 }).default('NULL'),
});

export const entrySubarticles = mysqlTable("entry_subarticles", {
	id: int().autoincrement().notNull(),
	amount: decimal({ precision: 10, scale: 4 }).default('NULL'),
	unitCost: decimal("unit_cost", { precision: 10, scale: 4 }).default('NULL'),
	totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default('NULL'),
	invoice: varchar({ length: 255 }).default('\''),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).default('NULL'),
	subarticleId: int("subarticle_id").default('NULL').references(() => subarticles.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	stock: int().default(0).notNull(),
	noteEntryId: int("note_entry_id").default('NULL').references(() => noteEntries.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	invalidate: tinyint().default(0),
},
(table) => [
	index("index_entry_subarticles_on_subarticle_id").on(table.subarticleId),
]);

export const gestiones = mysqlTable("gestiones", {
	id: int().autoincrement().notNull(),
	anio: varchar({ length: 255 }).default('\'').notNull(),
	cerrado: tinyint().default(0).notNull(),
	fechaCierre: datetime("fecha_cierre", { mode: 'string'}).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => [
	index("index_gestiones_on_user_id").on(table.userId),
]);

export const ingresos = mysqlTable("ingresos", {
	id: int().autoincrement().notNull(),
	numero: int().default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	notaEntregaFecha: date("nota_entrega_fecha", { mode: 'string' }).default('NULL'),
	facturaNumero: varchar("factura_numero", { length: 255 }).default('NULL'),
	facturaAutorizacion: varchar("factura_autorizacion", { length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	facturaFecha: date("factura_fecha", { mode: 'string' }).default('NULL'),
	supplierId: int("supplier_id").default('NULL').references(() => suppliers.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	c31Numero: varchar("c31_numero", { length: 255 }).default('NULL'),
	bajaLogica: tinyint("baja_logica").default(0),
	total: decimal({ precision: 10, scale: 2 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
	notaEntregaNumero: varchar("nota_entrega_numero", { length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	c31Fecha: date("c31_fecha", { mode: 'string' }).default('NULL'),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	incrementoAlfabetico: varchar("incremento_alfabetico", { length: 255 }).default('NULL'),
	observacion: varchar({ length: 255 }).default('NULL'),
	documentoId: int("documento_id").default('NULL'),
	documentoCite: varchar("documento_cite", { length: 255 }).default('NULL'),
	tipoIngreso: varchar("tipo_ingreso", { length: 255 }).default('NULL'),
	entidadDonante: varchar("entidad_donante", { length: 255 }).default('NULL'),
},
(table) => [
	index("index_ingresos_on_supplier_id").on(table.supplierId),
	index("index_ingresos_on_user_id").on(table.userId),
]);

export const materials = mysqlTable("materials", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).default('NULL'),
	description: varchar({ length: 255 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	status: varchar({ length: 2 }).default('NULL'),
});

export const noteEntries = mysqlTable("note_entries", {
	id: int().autoincrement().notNull(),
	deliveryNoteNumber: varchar("delivery_note_number", { length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deliveryNoteDate: date("delivery_note_date", { mode: 'string' }).default('NULL'),
	invoiceNumber: varchar("invoice_number", { length: 255 }).default('\''),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	invoiceDate: date("invoice_date", { mode: 'string' }).default('NULL'),
	supplierId: int("supplier_id").default('NULL').references(() => suppliers.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	total: decimal({ precision: 10, scale: 2 }).default('NULL'),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	noteEntryDate: date("note_entry_date", { mode: 'string' }).default('NULL'),
	invalidate: tinyint().default(0),
	message: varchar({ length: 255 }).default('NULL'),
	invoiceAutorizacion: varchar("invoice_autorizacion", { length: 255 }).default('NULL'),
	c31: varchar({ length: 255 }).default('NULL'),
	nroNotaIngreso: int("nro_nota_ingreso").default(0),
	subtotal: decimal({ precision: 10, scale: 2 }).default('0.00'),
	descuento: decimal({ precision: 10, scale: 2 }).default('0.00'),
	incrementoAlfabetico: varchar("incremento_alfabetico", { length: 255 }).default('NULL'),
	observacion: varchar({ length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	c31Fecha: date("c31_fecha", { mode: 'string' }).default('NULL'),
	reingreso: tinyint().default(0).notNull(),
	documentoId: int("documento_id").default('NULL'),
	jsonUsuarios: text("json_usuarios").default('NULL'),
	documentoCite: varchar("documento_cite", { length: 255 }).default('NULL'),
	tipoIngreso: varchar("tipo_ingreso", { length: 255 }).default('NULL'),
	entidadDonante: varchar("entidad_donante", { length: 255 }).default('NULL'),
},
(table) => [
	index("index_note_entries_on_supplier_id").on(table.supplierId),
]);

export const proceedings = mysqlTable("proceedings", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	adminId: int("admin_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	proceedingType: varchar("proceeding_type", { length: 2 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	fecha: date({ mode: 'string' }).default('NULL'),
	bajaLogica: tinyint("baja_logica").default(0).notNull(),
	observaciones: varchar({ length: 255 }).default('\'Ninguno\''),
	usuarioInfo: text("usuario_info").default('NULL'),
	plantillasInfo: varchar("plantillas_info", { length: 255 }).default('NULL'),
},
(table) => [
	index("index_proceedings_on_user_id").on(table.userId),
	index("index_proceedings_on_admin_id").on(table.adminId),
]);

export const requests = mysqlTable("requests", {
	id: int().autoincrement().notNull(),
	adminId: int("admin_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	status: varchar({ length: 255 }).default('\'0\''),
	deliveryDate: datetime("delivery_date", { mode: 'string'}).default('NULL'),
	invalidate: tinyint().default(0),
	message: varchar({ length: 255 }).default('NULL'),
	nroSolicitud: int("nro_solicitud").default(0),
	incrementoAlfabetico: varchar("incremento_alfabetico", { length: 255 }).default('NULL'),
	observacion: varchar({ length: 255 }).default('NULL'),
	documentoId: int("documento_id").default('NULL'),
	jsonUsuarios: text("json_usuarios").default('NULL'),
	citeSms: varchar("cite_sms", { length: 255 }).default('NULL'),
	citeEms: varchar("cite_ems", { length: 255 }).default('NULL'),
});

export const schemaMigrations = mysqlTable("schema_migrations", {
	version: varchar({ length: 255 }).notNull(),
},
(table) => [
	unique("unique_schema_migrations").on(table.version),
]);

export const seguros = mysqlTable("seguros", {
	id: int().autoincrement().notNull(),
	supplierId: int("supplier_id").default('NULL').references(() => suppliers.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	userId: int("user_id").default('NULL').references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	numeroPoliza: varchar("numero_poliza", { length: 255 }).default('NULL'),
	numeroContrato: varchar("numero_contrato", { length: 255 }).default('NULL'),
	facturaNumero: varchar("factura_numero", { length: 255 }).default('NULL'),
	facturaAutorizacion: varchar("factura_autorizacion", { length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	facturaFecha: date("factura_fecha", { mode: 'string' }).default('NULL'),
	facturaMonto: double("factura_monto").default('NULL'),
	fechaInicioVigencia: datetime("fecha_inicio_vigencia", { mode: 'string'}).default('NULL'),
	fechaFinVigencia: datetime("fecha_fin_vigencia", { mode: 'string'}).default('NULL'),
	bajaLogica: tinyint("baja_logica").default(0),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
	seguroId: int("seguro_id").default('NULL'),
	state: varchar({ length: 255 }).default('NULL'),
	tipo: varchar({ length: 255 }).default('NULL'),
},
(table) => [
	index("index_seguros_on_seguro_id").on(table.seguroId),
	foreignKey({
			columns: [table.seguroId],
			foreignColumns: [table.id],
			name: "fk_rails_8466f2fe6f"
		}).onUpdate("restrict").onDelete("restrict"),
]);

export const subarticles = mysqlTable("subarticles", {
	id: int().autoincrement().notNull(),
	code: int().default('NULL'),
	description: varchar({ length: 255 }).default('NULL'),
	unit: varchar({ length: 255 }).default('NULL'),
	status: varchar({ length: 255 }).default('NULL'),
	articleId: int("article_id").default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	amount: int().default('NULL'),
	minimum: int().default('NULL'),
	barcode: varchar({ length: 255 }).default('NULL'),
	codeOld: varchar("code_old", { length: 255 }).default('NULL'),
	incremento: int().default('NULL'),
	materialId: int("material_id").default('NULL').references(() => materials.id, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => [
	index("index_subarticles_on_article_id").on(table.articleId),
	index("index_subarticles_on_material_id").on(table.materialId),
]);

export const subarticleRequests = mysqlTable("subarticle_requests", {
	id: int().autoincrement().notNull(),
	subarticleId: int("subarticle_id").default('NULL').references(() => subarticles.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	requestId: int("request_id").default('NULL').references(() => requests.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	amount: decimal({ precision: 10, scale: 2 }).default('NULL'),
	amountDelivered: decimal("amount_delivered", { precision: 10, scale: 2 }).default('NULL'),
	totalDelivered: decimal("total_delivered", { precision: 10, scale: 2 }).default('NULL'),
	invalidate: tinyint().default(0),
},
(table) => [
	index("index_subarticle_requests_on_request_id").on(table.requestId),
	index("index_subarticle_requests_on_subarticle_id").on(table.subarticleId),
]);

export const suppliers = mysqlTable("suppliers", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	nit: varchar({ length: 255 }).default('NULL'),
	telefono: varchar({ length: 255 }).default('NULL'),
	contacto: varchar({ length: 255 }).default('NULL'),
});

export const tTemporalPedidos = mysqlTable("t_temporal_pedidos", {
	idTransaccion: int("id_transaccion").autoincrement().notNull(),
	idUsuario: int("id_usuario").notNull(),
	codeItem: int("code_item").notNull(),
	descriptionItem: varchar("description_item", { length: 255 }).notNull(),
	unitItem: varchar("unit_item", { length: 255 }).notNull(),
	cantidadItem: int("cantidad_item").notNull(),
	stockItem: int("stock_item").notNull(),
	pedidoTempDate: datetime("pedido_temp_date", { mode: 'string'}).default('current_timestamp()').notNull(),
});

export const ubicaciones = mysqlTable("ubicaciones", {
	id: int().autoincrement().notNull(),
	abreviacion: varchar({ length: 255 }).default('NULL'),
	descripcion: varchar({ length: 255 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

export const ufvs = mysqlTable("ufvs", {
	id: int().autoincrement().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	fecha: date({ mode: 'string' }).default('NULL'),
	valor: decimal({ precision: 7, scale: 5 }).default('0.00000').notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).default('\'').notNull(),
	encryptedPassword: varchar("encrypted_password", { length: 255 }).default('\'').notNull(),
	resetPasswordToken: varchar("reset_password_token", { length: 255 }).default('NULL'),
	resetPasswordSentAt: datetime("reset_password_sent_at", { mode: 'string'}).default('NULL'),
	rememberCreatedAt: datetime("remember_created_at", { mode: 'string'}).default('NULL'),
	signInCount: int("sign_in_count").default(0).notNull(),
	currentSignInAt: datetime("current_sign_in_at", { mode: 'string'}).default('NULL'),
	lastSignInAt: datetime("last_sign_in_at", { mode: 'string'}).default('NULL'),
	currentSignInIp: varchar("current_sign_in_ip", { length: 255 }).default('NULL'),
	lastSignInIp: varchar("last_sign_in_ip", { length: 255 }).default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	username: varchar({ length: 230 }).default('\'').notNull(),
	code: int().default('NULL'),
	name: varchar({ length: 230 }).default('NULL'),
	title: varchar({ length: 230 }).default('NULL'),
	ci: varchar({ length: 255 }).default('NULL'),
	phone: varchar({ length: 230 }).default('NULL'),
	mobile: varchar({ length: 230 }).default('NULL'),
	status: varchar({ length: 2 }).default('NULL'),
	departmentId: int("department_id").default('NULL'),
	role: varchar({ length: 255 }).default('NULL'),
	passwordChange: tinyint("password_change").default(0).notNull(),
	assetsCount: int("assets_count").default(0),
},
(table) => [
	index("index_users_on_email").on(table.email),
	index("index_users_on_username").on(table.username),
	unique("index_users_on_reset_password_token").on(table.resetPasswordToken),
]);

export const versions = mysqlTable("versions", {
	id: int().autoincrement().notNull(),
	itemType: varchar("item_type", { length: 255 }).notNull(),
	itemId: int("item_id").default('NULL'),
	event: varchar({ length: 255 }).notNull(),
	whodunnit: varchar({ length: 255 }).default('NULL'),
	object: text().default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	active: tinyint().default(1),
	itemSpanish: varchar("item_spanish", { length: 255 }).default('NULL'),
},
(table) => [
	index("index_versions_on_item_type_and_item_id").on(table.itemType, table.itemId),
]);
export const entradasSalidas = mysqlView("entradas_salidas", {
	id: int().default(0).notNull(),
	subarticleId: int("subarticle_id").default('NULL'),
	fecha: datetime({ mode: 'string'}).default('NULL'),
	factura: varchar({ length: 255 }).default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	notaEntrega: date("nota_entrega", { mode: 'string' }).default('NULL'),
	nroPedido: varchar("nro_pedido", { length: 11 }).default('NULL'),
	detalle: varchar({ length: 463 }).default('NULL'),
	cantidad: decimal({ precision: 12, scale: 4 }).default('NULL'),
	costoUnitario: decimal("costo_unitario", { precision: 10, scale: 4 }).default('NULL'),
	modeloId: int("modelo_id").default('NULL'),
	tipo: varchar({ length: 7 }).default('\'').notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	citeEmsPlantillas: varchar("cite_ems_plantillas", { length: 255 }).default('NULL'),
}).algorithm("undefined").sqlSecurity("definer").as(sql`select \`es\`.\`id\` AS \`id\`,\`es\`.\`subarticle_id\` AS \`subarticle_id\`,\`r\`.\`delivery_date\` AS \`fecha\`,'' AS \`factura\`,cast(NULL as date) AS \`nota_entrega\`,\`r\`.\`nro_solicitud\` AS \`nro_pedido\`,concat(\`u\`.\`name\`,' - ',\`u\`.\`title\`) AS \`detalle\`,-\`es\`.\`total_delivered\` AS \`cantidad\`,0 AS \`costo_unitario\`,\`es\`.\`request_id\` AS \`modelo_id\`,'salida' AS \`tipo\`,\`r\`.\`created_at\` AS \`created_at\`,\`r\`.\`cite_ems\` AS \`cite_ems_plantillas\` from ((\`dwms_bd\`.\`requests\` \`r\` join \`dwms_bd\`.\`subarticle_requests\` \`es\` on(\`r\`.\`id\` = \`es\`.\`request_id\`)) join \`dwms_bd\`.\`users\` \`u\` on(\`r\`.\`user_id\` = \`u\`.\`id\`)) where \`r\`.\`invalidate\` = 0 and \`es\`.\`invalidate\` = 0 and \`r\`.\`status\` = 'delivered' union select \`es\`.\`id\` AS \`id\`,\`es\`.\`subarticle_id\` AS \`subarticle_id\`,ifnull(\`ne\`.\`note_entry_date\`,\`es\`.\`date\`) AS \`fecha\`,\`ne\`.\`invoice_number\` AS \`factura\`,\`ne\`.\`delivery_note_date\` AS \`nota_entrega\`,'' AS \`nro_pedido\`,if(\`ne\`.\`supplier_id\`,(select \`s\`.\`name\` from \`dwms_bd\`.\`suppliers\` \`s\` where \`s\`.\`id\` = \`ne\`.\`supplier_id\`),if(\`ne\`.\`reingreso\` = 1,'REINGRESO',if(\`ne\`.\`tipo_ingreso\` = 'donacion_transferencia','DONACION O TRANSFERENCIA','SALDO INICIAL'))) AS \`detalle\`,\`es\`.\`amount\` AS \`cantidad\`,\`es\`.\`unit_cost\` AS \`costo_unitario\`,\`es\`.\`note_entry_id\` AS \`modelo_id\`,'entrada' AS \`tipo\`,\`es\`.\`created_at\` AS \`created_at\`,\`ne\`.\`documento_cite\` AS \`cite_ems_plantillas\` from (\`dwms_bd\`.\`entry_subarticles\` \`es\` left join \`dwms_bd\`.\`note_entries\` \`ne\` on(\`es\`.\`note_entry_id\` = \`ne\`.\`id\`)) where \`es\`.\`invalidate\` = 0 order by \`subarticle_id\`,\`fecha\`,\`id\`,\`cantidad\` desc,\`created_at\``);

export const masterIngreso = mysqlView("master_ingreso", {
	code: int().default('NULL'),
	description: varchar({ length: 255 }).default('NULL'),
	unit: varchar({ length: 255 }).default('NULL'),
	status: varchar({ length: 255 }).default('NULL'),
	articleId: int("article_id").default('NULL'),
	createdAt: datetime("created_at", { mode: 'string'}).default('NULL'),
	updatedAt: datetime("updated_at", { mode: 'string'}).default('NULL'),
	amount: int().default('NULL'),
	minimum: int().default('NULL'),
	barcode: varchar({ length: 255 }).default('NULL'),
	materialId: int("material_id").default('NULL'),
	codeOld: varchar("code_old", { length: 255 }).default('NULL'),
	incremento: int().default('NULL'),
	codeMaterials: varchar("code_materials", { length: 50 }).default('NULL'),
	descritionMaterial: varchar("descrition_material", { length: 255 }).default('NULL'),
	statusMaterial: varchar("status_material", { length: 2 }).default('NULL'),
	amountSub: decimal("amount_sub", { precision: 10, scale: 4 }).default('NULL'),
	unitCost: decimal("unit_cost", { precision: 10, scale: 4 }).default('NULL'),
	totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default('NULL'),
	invoice: varchar({ length: 255 }).default('\''),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	date: date({ mode: 'string' }).default('NULL'),
	subarticleId: int("subarticle_id").default('NULL'),
	createEntry: datetime("create_entry", { mode: 'string'}).default('NULL'),
	stock: int().default(0).notNull(),
	noteEntryId: int("note_entry_id").default('NULL'),
	invalidate: tinyint().default(0),
}).algorithm("undefined").sqlSecurity("definer").as(sql`select \`dwms_bd\`.\`subarticles\`.\`code\` AS \`code\`,\`dwms_bd\`.\`subarticles\`.\`description\` AS \`description\`,\`dwms_bd\`.\`subarticles\`.\`unit\` AS \`unit\`,\`dwms_bd\`.\`subarticles\`.\`status\` AS \`status\`,\`dwms_bd\`.\`subarticles\`.\`article_id\` AS \`article_id\`,\`dwms_bd\`.\`subarticles\`.\`created_at\` AS \`created_at\`,\`dwms_bd\`.\`subarticles\`.\`updated_at\` AS \`updated_at\`,\`dwms_bd\`.\`subarticles\`.\`amount\` AS \`amount\`,\`dwms_bd\`.\`subarticles\`.\`minimum\` AS \`minimum\`,\`dwms_bd\`.\`subarticles\`.\`barcode\` AS \`barcode\`,\`dwms_bd\`.\`subarticles\`.\`material_id\` AS \`material_id\`,\`dwms_bd\`.\`subarticles\`.\`code_old\` AS \`code_old\`,\`dwms_bd\`.\`subarticles\`.\`incremento\` AS \`incremento\`,\`dwms_bd\`.\`materials\`.\`code\` AS \`code_materials\`,\`dwms_bd\`.\`materials\`.\`description\` AS \`descrition_material\`,\`dwms_bd\`.\`materials\`.\`status\` AS \`status_material\`,\`dwms_bd\`.\`entry_subarticles\`.\`amount\` AS \`amount_sub\`,\`dwms_bd\`.\`entry_subarticles\`.\`unit_cost\` AS \`unit_cost\`,\`dwms_bd\`.\`entry_subarticles\`.\`total_cost\` AS \`total_cost\`,\`dwms_bd\`.\`entry_subarticles\`.\`invoice\` AS \`invoice\`,\`dwms_bd\`.\`entry_subarticles\`.\`date\` AS \`date\`,\`dwms_bd\`.\`entry_subarticles\`.\`subarticle_id\` AS \`subarticle_id\`,\`dwms_bd\`.\`entry_subarticles\`.\`created_at\` AS \`create_entry\`,\`dwms_bd\`.\`entry_subarticles\`.\`stock\` AS \`stock\`,\`dwms_bd\`.\`entry_subarticles\`.\`note_entry_id\` AS \`note_entry_id\`,\`dwms_bd\`.\`entry_subarticles\`.\`invalidate\` AS \`invalidate\` from ((\`dwms_bd\`.\`subarticles\` join \`dwms_bd\`.\`materials\` on(\`dwms_bd\`.\`materials\`.\`id\` = \`dwms_bd\`.\`subarticles\`.\`material_id\`)) join \`dwms_bd\`.\`entry_subarticles\` on(\`dwms_bd\`.\`entry_subarticles\`.\`subarticle_id\` = \`dwms_bd\`.\`subarticles\`.\`id\`)) where \`dwms_bd\`.\`entry_subarticles\`.\`stock\` > 0 order by \`dwms_bd\`.\`subarticles\`.\`description\``);

export const pedidosTemporales = mysqlView("pedidos_temporales", {
	codeItem: int("code_item").notNull(),
	totalReservas: decimal({ precision: 32, scale: 0 }).default('NULL'),
}).algorithm("undefined").sqlSecurity("definer").as(sql`select \`dwms_bd\`.\`t_temporal_pedidos\`.\`code_item\` AS \`code_item\`,sum(\`dwms_bd\`.\`t_temporal_pedidos\`.\`cantidad_item\`) AS \`totalReservas\` from \`dwms_bd\`.\`t_temporal_pedidos\` group by \`dwms_bd\`.\`t_temporal_pedidos\`.\`code_item\``);

export const usersjson1 = mysqlView("usersjson1", {
	id: int().default(0).notNull(),
	nombre: varchar({ length: 230 }).default('NULL'),
	numeroDocumento: varchar("numero_documento", { length: 255 }).default('NULL'),
	cargo: varchar({ length: 230 }).default('NULL'),
	departmentId: int("department_id").default('NULL'),
	unidad: varchar({ length: 230 }).default('NULL'),
	idDepartament: int("id_departament").default(0).notNull(),
	email: varchar({ length: 255 }).default('\'').notNull(),
}).algorithm("undefined").sqlSecurity("definer").as(sql`select \`dwms_bd\`.\`users\`.\`id\` AS \`id\`,\`dwms_bd\`.\`users\`.\`name\` AS \`nombre\`,\`dwms_bd\`.\`users\`.\`ci\` AS \`numero_documento\`,\`dwms_bd\`.\`users\`.\`title\` AS \`cargo\`,\`dwms_bd\`.\`users\`.\`department_id\` AS \`department_id\`,\`dwms_bd\`.\`departments\`.\`name\` AS \`unidad\`,\`dwms_bd\`.\`departments\`.\`id\` AS \`id_departament\`,\`dwms_bd\`.\`users\`.\`email\` AS \`email\` from (\`dwms_bd\`.\`users\` join \`dwms_bd\`.\`departments\` on(\`dwms_bd\`.\`departments\`.\`code\` = \`dwms_bd\`.\`users\`.\`department_id\`))`);

export const userJson = mysqlView("user_json", {
	id: int().default(0).notNull(),
	nombre: varchar({ length: 230 }).default('NULL'),
	numeroDocumento: varchar("numero_documento", { length: 255 }).default('NULL'),
	cargo: varchar({ length: 230 }).default('NULL'),
	departmentId: int("department_id").default('NULL'),
	unidad: varchar({ length: 230 }).default('NULL'),
	idDepartament: int("id_departament").default(0).notNull(),
	email: varchar({ length: 255 }).default('\'').notNull(),
}).algorithm("undefined").sqlSecurity("definer").as(sql`select \`dwms_bd\`.\`users\`.\`id\` AS \`id\`,\`dwms_bd\`.\`users\`.\`name\` AS \`nombre\`,\`dwms_bd\`.\`users\`.\`ci\` AS \`numero_documento\`,\`dwms_bd\`.\`users\`.\`title\` AS \`cargo\`,\`dwms_bd\`.\`users\`.\`department_id\` AS \`department_id\`,\`dwms_bd\`.\`departments\`.\`name\` AS \`unidad\`,\`dwms_bd\`.\`departments\`.\`id\` AS \`id_departament\`,\`dwms_bd\`.\`users\`.\`email\` AS \`email\` from (\`dwms_bd\`.\`users\` join \`dwms_bd\`.\`departments\` on(\`dwms_bd\`.\`departments\`.\`id\` = \`dwms_bd\`.\`users\`.\`department_id\`))`);