-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `accounts` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` int(11) DEFAULT 'NULL',
	`name` varchar(230) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`vida_util` int(11) NOT NULL DEFAULT 0,
	`depreciar` tinyint(1) NOT NULL DEFAULT 0,
	`actualizar` tinyint(1) NOT NULL DEFAULT 0,
	`status` varchar(255) DEFAULT '''1'''
);
--> statement-breakpoint
CREATE TABLE `api_tokens` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`token` text NOT NULL,
	`fecha_expiracion` date DEFAULT 'NULL',
	`status` varchar(2) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` int(11) DEFAULT 'NULL',
	`description` text DEFAULT 'NULL',
	`auxiliary_id` int(11) DEFAULT 'NULL',
	`user_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`account_id` int(11) DEFAULT 'NULL',
	`barcode` varchar(255) DEFAULT 'NULL',
	`state` int(11) DEFAULT 'NULL',
	`observation` text DEFAULT 'NULL',
	`proceso` varchar(255) DEFAULT 'NULL',
	`observaciones` varchar(255) DEFAULT 'NULL',
	`precio` decimal(10,2) NOT NULL DEFAULT '0.00',
	`detalle` varchar(255) DEFAULT 'NULL',
	`medidas` varchar(255) DEFAULT 'NULL',
	`material` varchar(255) DEFAULT 'NULL',
	`color` varchar(255) DEFAULT 'NULL',
	`marca` varchar(255) DEFAULT 'NULL',
	`modelo` varchar(255) DEFAULT 'NULL',
	`serie` varchar(255) DEFAULT 'NULL',
	`code_old` varchar(255) DEFAULT 'NULL',
	`ingreso_id` int(11) DEFAULT 'NULL',
	`ubicacion_id` int(11) DEFAULT 'NULL',
	`baja_id` int(11) DEFAULT 'NULL',
	`asset_id` int(11) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `assets_seguros` (
	`asset_id` int(11) NOT NULL,
	`seguro_id` int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `asset_proceedings` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`proceeding_id` int(11) DEFAULT 'NULL',
	`asset_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `auxiliaries` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` int(11) DEFAULT 'NULL',
	`name` varchar(230) DEFAULT 'NULL',
	`account_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`status` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `bajas` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`numero` int(11) DEFAULT 'NULL',
	`documento` varchar(255) DEFAULT 'NULL',
	`fecha` date DEFAULT 'NULL',
	`observacion` text DEFAULT 'NULL',
	`user_id` int(11) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`motivo` varchar(255) DEFAULT 'NULL',
	`fecha_documento` date DEFAULT 'NULL',
	`documento_id` int(11) DEFAULT 'NULL',
	`documento_cite` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `buildings` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) DEFAULT 'NULL',
	`name` varchar(230) DEFAULT 'NULL',
	`entity_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`status` varchar(255) DEFAULT 'NULL',
	CONSTRAINT `index_buildings_on_code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `cierre_gestiones` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`actualizacion_gestion` decimal(19,6) DEFAULT 'NULL',
	`depreciacion_gestion` decimal(19,6) DEFAULT 'NULL',
	`indice_ufv` decimal(6,5) DEFAULT 'NULL',
	`asset_id` int(11) DEFAULT 'NULL',
	`gestion_id` int(11) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`fecha` date DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` int(11) DEFAULT 'NULL',
	`name` varchar(230) DEFAULT 'NULL',
	`status` varchar(2) DEFAULT 'NULL',
	`building_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) DEFAULT 'NULL',
	`name` varchar(230) DEFAULT 'NULL',
	`acronym` varchar(50) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`header` varchar(255) DEFAULT 'NULL',
	`footer` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `entry_subarticles` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`amount` decimal(10,4) DEFAULT 'NULL',
	`unit_cost` decimal(10,4) DEFAULT 'NULL',
	`total_cost` decimal(10,2) DEFAULT 'NULL',
	`invoice` varchar(255) DEFAULT '''''',
	`date` date DEFAULT 'NULL',
	`subarticle_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`stock` int(11) NOT NULL DEFAULT 0,
	`note_entry_id` int(11) DEFAULT 'NULL',
	`invalidate` tinyint(1) DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `gestiones` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`anio` varchar(255) NOT NULL DEFAULT '''''',
	`cerrado` tinyint(1) NOT NULL DEFAULT 0,
	`fecha_cierre` datetime DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`user_id` int(11) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `ingresos` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`numero` int(11) DEFAULT 'NULL',
	`nota_entrega_fecha` date DEFAULT 'NULL',
	`factura_numero` varchar(255) DEFAULT 'NULL',
	`factura_autorizacion` varchar(255) DEFAULT 'NULL',
	`factura_fecha` date DEFAULT 'NULL',
	`supplier_id` int(11) DEFAULT 'NULL',
	`c31_numero` varchar(255) DEFAULT 'NULL',
	`baja_logica` tinyint(1) DEFAULT 0,
	`total` decimal(10,2) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`nota_entrega_numero` varchar(255) DEFAULT 'NULL',
	`c31_fecha` date DEFAULT 'NULL',
	`user_id` int(11) DEFAULT 'NULL',
	`incremento_alfabetico` varchar(255) DEFAULT 'NULL',
	`observacion` varchar(255) DEFAULT 'NULL',
	`documento_id` int(11) DEFAULT 'NULL',
	`documento_cite` varchar(255) DEFAULT 'NULL',
	`tipo_ingreso` varchar(255) DEFAULT 'NULL',
	`entidad_donante` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) DEFAULT 'NULL',
	`description` varchar(255) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`status` varchar(2) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `note_entries` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`delivery_note_number` varchar(255) DEFAULT 'NULL',
	`delivery_note_date` date DEFAULT 'NULL',
	`invoice_number` varchar(255) DEFAULT '''''',
	`invoice_date` date DEFAULT 'NULL',
	`supplier_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`total` decimal(10,2) DEFAULT 'NULL',
	`user_id` int(11) DEFAULT 'NULL',
	`note_entry_date` date DEFAULT 'NULL',
	`invalidate` tinyint(1) DEFAULT 0,
	`message` varchar(255) DEFAULT 'NULL',
	`invoice_autorizacion` varchar(255) DEFAULT 'NULL',
	`c31` varchar(255) DEFAULT 'NULL',
	`nro_nota_ingreso` int(11) DEFAULT 0,
	`subtotal` decimal(10,2) DEFAULT '0.00',
	`descuento` decimal(10,2) DEFAULT '0.00',
	`incremento_alfabetico` varchar(255) DEFAULT 'NULL',
	`observacion` varchar(255) DEFAULT 'NULL',
	`c31_fecha` date DEFAULT 'NULL',
	`reingreso` tinyint(1) NOT NULL DEFAULT 0,
	`documento_id` int(11) DEFAULT 'NULL',
	`json_usuarios` text DEFAULT 'NULL',
	`documento_cite` varchar(255) DEFAULT 'NULL',
	`tipo_ingreso` varchar(255) DEFAULT 'NULL',
	`entidad_donante` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `proceedings` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`user_id` int(11) DEFAULT 'NULL',
	`admin_id` int(11) DEFAULT 'NULL',
	`proceeding_type` varchar(2) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`fecha` date DEFAULT 'NULL',
	`baja_logica` tinyint(1) NOT NULL DEFAULT 0,
	`observaciones` varchar(255) DEFAULT '''Ninguno''',
	`usuario_info` text DEFAULT 'NULL',
	`plantillas_info` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`admin_id` int(11) DEFAULT 'NULL',
	`user_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`status` varchar(255) DEFAULT '''0''',
	`delivery_date` datetime DEFAULT 'NULL',
	`invalidate` tinyint(1) DEFAULT 0,
	`message` varchar(255) DEFAULT 'NULL',
	`nro_solicitud` int(11) DEFAULT 0,
	`incremento_alfabetico` varchar(255) DEFAULT 'NULL',
	`observacion` varchar(255) DEFAULT 'NULL',
	`documento_id` int(11) DEFAULT 'NULL',
	`json_usuarios` text DEFAULT 'NULL',
	`cite_sms` varchar(255) DEFAULT 'NULL',
	`cite_ems` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `schema_migrations` (
	`version` varchar(255) NOT NULL,
	CONSTRAINT `unique_schema_migrations` UNIQUE(`version`)
);
--> statement-breakpoint
CREATE TABLE `seguros` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`supplier_id` int(11) DEFAULT 'NULL',
	`user_id` int(11) DEFAULT 'NULL',
	`numero_poliza` varchar(255) DEFAULT 'NULL',
	`numero_contrato` varchar(255) DEFAULT 'NULL',
	`factura_numero` varchar(255) DEFAULT 'NULL',
	`factura_autorizacion` varchar(255) DEFAULT 'NULL',
	`factura_fecha` date DEFAULT 'NULL',
	`factura_monto` double DEFAULT 'NULL',
	`fecha_inicio_vigencia` datetime DEFAULT 'NULL',
	`fecha_fin_vigencia` datetime DEFAULT 'NULL',
	`baja_logica` tinyint(1) DEFAULT 0,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	`seguro_id` int(11) DEFAULT 'NULL',
	`state` varchar(255) DEFAULT 'NULL',
	`tipo` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `subarticles` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` int(11) DEFAULT 'NULL',
	`description` varchar(255) DEFAULT 'NULL',
	`unit` varchar(255) DEFAULT 'NULL',
	`status` varchar(255) DEFAULT 'NULL',
	`article_id` int(11) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`amount` int(11) DEFAULT 'NULL',
	`minimum` int(11) DEFAULT 'NULL',
	`barcode` varchar(255) DEFAULT 'NULL',
	`code_old` varchar(255) DEFAULT 'NULL',
	`incremento` int(11) DEFAULT 'NULL',
	`material_id` int(11) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `subarticle_requests` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`subarticle_id` int(11) DEFAULT 'NULL',
	`request_id` int(11) DEFAULT 'NULL',
	`amount` decimal(10,2) DEFAULT 'NULL',
	`amount_delivered` decimal(10,2) DEFAULT 'NULL',
	`total_delivered` decimal(10,2) DEFAULT 'NULL',
	`invalidate` tinyint(1) DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(255) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`nit` varchar(255) DEFAULT 'NULL',
	`telefono` varchar(255) DEFAULT 'NULL',
	`contacto` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `t_temporal_pedidos` (
	`id_transaccion` int(11) AUTO_INCREMENT NOT NULL,
	`id_usuario` int(11) NOT NULL,
	`code_item` int(11) NOT NULL,
	`description_item` varchar(255) NOT NULL,
	`unit_item` varchar(255) NOT NULL,
	`cantidad_item` int(11) NOT NULL,
	`stock_item` int(11) NOT NULL,
	`pedido_temp_date` datetime NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `ubicaciones` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`abreviacion` varchar(255) DEFAULT 'NULL',
	`descripcion` varchar(255) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ufvs` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`fecha` date DEFAULT 'NULL',
	`valor` decimal(7,5) NOT NULL DEFAULT '0.00000',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL DEFAULT '''''',
	`encrypted_password` varchar(255) NOT NULL DEFAULT '''''',
	`reset_password_token` varchar(255) DEFAULT 'NULL',
	`reset_password_sent_at` datetime DEFAULT 'NULL',
	`remember_created_at` datetime DEFAULT 'NULL',
	`sign_in_count` int(11) NOT NULL DEFAULT 0,
	`current_sign_in_at` datetime DEFAULT 'NULL',
	`last_sign_in_at` datetime DEFAULT 'NULL',
	`current_sign_in_ip` varchar(255) DEFAULT 'NULL',
	`last_sign_in_ip` varchar(255) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`username` varchar(230) NOT NULL DEFAULT '''''',
	`code` int(11) DEFAULT 'NULL',
	`name` varchar(230) DEFAULT 'NULL',
	`title` varchar(230) DEFAULT 'NULL',
	`ci` varchar(255) DEFAULT 'NULL',
	`phone` varchar(230) DEFAULT 'NULL',
	`mobile` varchar(230) DEFAULT 'NULL',
	`status` varchar(2) DEFAULT 'NULL',
	`department_id` int(11) DEFAULT 'NULL',
	`role` varchar(255) DEFAULT 'NULL',
	`password_change` tinyint(1) NOT NULL DEFAULT 0,
	`assets_count` int(11) DEFAULT 0,
	CONSTRAINT `index_users_on_reset_password_token` UNIQUE(`reset_password_token`)
);
--> statement-breakpoint
CREATE TABLE `versions` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`item_type` varchar(255) NOT NULL,
	`item_id` int(11) DEFAULT 'NULL',
	`event` varchar(255) NOT NULL,
	`whodunnit` varchar(255) DEFAULT 'NULL',
	`object` text DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'NULL',
	`active` tinyint(1) DEFAULT 1,
	`item_spanish` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `fk_rails_17984c4e2f` FOREIGN KEY (`baja_id`) REFERENCES `bajas`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `fk_rails_590236dc2e` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `fk_rails_61e74d4630` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `fk_rails_823c31e179` FOREIGN KEY (`ingreso_id`) REFERENCES `ingresos`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `fk_rails_fad3a5ab3c` FOREIGN KEY (`auxiliary_id`) REFERENCES `auxiliaries`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `assets_seguros` ADD CONSTRAINT `fk_rails_0357afe86a` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `assets_seguros` ADD CONSTRAINT `fk_rails_13cf7e4e44` FOREIGN KEY (`seguro_id`) REFERENCES `seguros`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `asset_proceedings` ADD CONSTRAINT `fk_rails_574cdc3eb5` FOREIGN KEY (`proceeding_id`) REFERENCES `proceedings`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `asset_proceedings` ADD CONSTRAINT `fk_rails_dc06661115` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `auxiliaries` ADD CONSTRAINT `fk_rails_96e19d2f9b` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `bajas` ADD CONSTRAINT `fk_rails_1e8045912f` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `buildings` ADD CONSTRAINT `fk_rails_b2c90e921c` FOREIGN KEY (`entity_id`) REFERENCES `entities`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `cierre_gestiones` ADD CONSTRAINT `fk_rails_8d61ed6000` FOREIGN KEY (`gestion_id`) REFERENCES `gestiones`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `cierre_gestiones` ADD CONSTRAINT `fk_rails_c238942fca` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `fk_rails_0381a2097b` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `entry_subarticles` ADD CONSTRAINT `fk_rails_589b865ebe` FOREIGN KEY (`subarticle_id`) REFERENCES `subarticles`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `entry_subarticles` ADD CONSTRAINT `fk_rails_ee711e9361` FOREIGN KEY (`note_entry_id`) REFERENCES `note_entries`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `gestiones` ADD CONSTRAINT `fk_rails_f5016c1841` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `ingresos` ADD CONSTRAINT `fk_rails_19226c190b` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `ingresos` ADD CONSTRAINT `fk_rails_ade1ffe7d1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `note_entries` ADD CONSTRAINT `fk_rails_ad8862a094` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `note_entries` ADD CONSTRAINT `fk_rails_c41185cb6f` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `proceedings` ADD CONSTRAINT `fk_rails_3e0f21ce0b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `proceedings` ADD CONSTRAINT `fk_rails_47fac28a6c` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `requests` ADD CONSTRAINT `fk_rails_8ead8b1e6b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `requests` ADD CONSTRAINT `fk_rails_c38a214881` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `seguros` ADD CONSTRAINT `fk_rails_7cf708c516` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `seguros` ADD CONSTRAINT `fk_rails_8466f2fe6f` FOREIGN KEY (`seguro_id`) REFERENCES `seguros`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `seguros` ADD CONSTRAINT `fk_rails_fbfcdaa8db` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `subarticles` ADD CONSTRAINT `fk_rails_6fe93e487e` FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `subarticle_requests` ADD CONSTRAINT `fk_rails_67ff6e617c` FOREIGN KEY (`subarticle_id`) REFERENCES `subarticles`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `subarticle_requests` ADD CONSTRAINT `fk_rails_d89d70fde4` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX `index_assets_on_auxiliary_id` ON `assets` (`auxiliary_id`);--> statement-breakpoint
CREATE INDEX `index_assets_on_user_id` ON `assets` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_assets_on_account_id` ON `assets` (`account_id`);--> statement-breakpoint
CREATE INDEX `index_assets_on_ingreso_id` ON `assets` (`ingreso_id`);--> statement-breakpoint
CREATE INDEX `index_assets_on_ubicacion_id` ON `assets` (`ubicacion_id`);--> statement-breakpoint
CREATE INDEX `index_assets_on_baja_id` ON `assets` (`baja_id`);--> statement-breakpoint
CREATE INDEX `index_assets_on_asset_id` ON `assets` (`asset_id`);--> statement-breakpoint
CREATE INDEX `index_assets_seguros_on_asset_id_and_seguro_id` ON `assets_seguros` (`asset_id`,`seguro_id`);--> statement-breakpoint
CREATE INDEX `index_assets_seguros_on_seguro_id_and_asset_id` ON `assets_seguros` (`seguro_id`,`asset_id`);--> statement-breakpoint
CREATE INDEX `index_asset_proceedings_on_proceeding_id` ON `asset_proceedings` (`proceeding_id`);--> statement-breakpoint
CREATE INDEX `index_asset_proceedings_on_asset_id` ON `asset_proceedings` (`asset_id`);--> statement-breakpoint
CREATE INDEX `index_auxiliaries_on_account_id` ON `auxiliaries` (`account_id`);--> statement-breakpoint
CREATE INDEX `index_bajas_on_user_id` ON `bajas` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_buildings_on_entity_id` ON `buildings` (`entity_id`);--> statement-breakpoint
CREATE INDEX `index_cierre_gestiones_on_asset_id` ON `cierre_gestiones` (`asset_id`);--> statement-breakpoint
CREATE INDEX `index_cierre_gestiones_on_gestion_id` ON `cierre_gestiones` (`gestion_id`);--> statement-breakpoint
CREATE INDEX `index_departments_on_building_id` ON `departments` (`building_id`);--> statement-breakpoint
CREATE INDEX `index_entry_subarticles_on_subarticle_id` ON `entry_subarticles` (`subarticle_id`);--> statement-breakpoint
CREATE INDEX `index_gestiones_on_user_id` ON `gestiones` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_ingresos_on_supplier_id` ON `ingresos` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `index_ingresos_on_user_id` ON `ingresos` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_note_entries_on_supplier_id` ON `note_entries` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `index_proceedings_on_user_id` ON `proceedings` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_proceedings_on_admin_id` ON `proceedings` (`admin_id`);--> statement-breakpoint
CREATE INDEX `index_seguros_on_seguro_id` ON `seguros` (`seguro_id`);--> statement-breakpoint
CREATE INDEX `index_subarticles_on_article_id` ON `subarticles` (`article_id`);--> statement-breakpoint
CREATE INDEX `index_subarticles_on_material_id` ON `subarticles` (`material_id`);--> statement-breakpoint
CREATE INDEX `index_subarticle_requests_on_request_id` ON `subarticle_requests` (`request_id`);--> statement-breakpoint
CREATE INDEX `index_subarticle_requests_on_subarticle_id` ON `subarticle_requests` (`subarticle_id`);--> statement-breakpoint
CREATE INDEX `index_users_on_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `index_users_on_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `index_versions_on_item_type_and_item_id` ON `versions` (`item_type`,`item_id`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `entradas_salidas` AS (select `es`.`id` AS `id`,`es`.`subarticle_id` AS `subarticle_id`,`r`.`delivery_date` AS `fecha`,'' AS `factura`,cast(NULL as date) AS `nota_entrega`,`r`.`nro_solicitud` AS `nro_pedido`,concat(`u`.`name`,' - ',`u`.`title`) AS `detalle`,-`es`.`total_delivered` AS `cantidad`,0 AS `costo_unitario`,`es`.`request_id` AS `modelo_id`,'salida' AS `tipo`,`r`.`created_at` AS `created_at`,`r`.`cite_ems` AS `cite_ems_plantillas` from ((`dwms_bd`.`requests` `r` join `dwms_bd`.`subarticle_requests` `es` on(`r`.`id` = `es`.`request_id`)) join `dwms_bd`.`users` `u` on(`r`.`user_id` = `u`.`id`)) where `r`.`invalidate` = 0 and `es`.`invalidate` = 0 and `r`.`status` = 'delivered' union select `es`.`id` AS `id`,`es`.`subarticle_id` AS `subarticle_id`,ifnull(`ne`.`note_entry_date`,`es`.`date`) AS `fecha`,`ne`.`invoice_number` AS `factura`,`ne`.`delivery_note_date` AS `nota_entrega`,'' AS `nro_pedido`,if(`ne`.`supplier_id`,(select `s`.`name` from `dwms_bd`.`suppliers` `s` where `s`.`id` = `ne`.`supplier_id`),if(`ne`.`reingreso` = 1,'REINGRESO',if(`ne`.`tipo_ingreso` = 'donacion_transferencia','DONACION O TRANSFERENCIA','SALDO INICIAL'))) AS `detalle`,`es`.`amount` AS `cantidad`,`es`.`unit_cost` AS `costo_unitario`,`es`.`note_entry_id` AS `modelo_id`,'entrada' AS `tipo`,`es`.`created_at` AS `created_at`,`ne`.`documento_cite` AS `cite_ems_plantillas` from (`dwms_bd`.`entry_subarticles` `es` left join `dwms_bd`.`note_entries` `ne` on(`es`.`note_entry_id` = `ne`.`id`)) where `es`.`invalidate` = 0 order by `subarticle_id`,`fecha`,`id`,`cantidad` desc,`created_at`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `master_ingreso` AS (select `dwms_bd`.`subarticles`.`code` AS `code`,`dwms_bd`.`subarticles`.`description` AS `description`,`dwms_bd`.`subarticles`.`unit` AS `unit`,`dwms_bd`.`subarticles`.`status` AS `status`,`dwms_bd`.`subarticles`.`article_id` AS `article_id`,`dwms_bd`.`subarticles`.`created_at` AS `created_at`,`dwms_bd`.`subarticles`.`updated_at` AS `updated_at`,`dwms_bd`.`subarticles`.`amount` AS `amount`,`dwms_bd`.`subarticles`.`minimum` AS `minimum`,`dwms_bd`.`subarticles`.`barcode` AS `barcode`,`dwms_bd`.`subarticles`.`material_id` AS `material_id`,`dwms_bd`.`subarticles`.`code_old` AS `code_old`,`dwms_bd`.`subarticles`.`incremento` AS `incremento`,`dwms_bd`.`materials`.`code` AS `code_materials`,`dwms_bd`.`materials`.`description` AS `descrition_material`,`dwms_bd`.`materials`.`status` AS `status_material`,`dwms_bd`.`entry_subarticles`.`amount` AS `amount_sub`,`dwms_bd`.`entry_subarticles`.`unit_cost` AS `unit_cost`,`dwms_bd`.`entry_subarticles`.`total_cost` AS `total_cost`,`dwms_bd`.`entry_subarticles`.`invoice` AS `invoice`,`dwms_bd`.`entry_subarticles`.`date` AS `date`,`dwms_bd`.`entry_subarticles`.`subarticle_id` AS `subarticle_id`,`dwms_bd`.`entry_subarticles`.`created_at` AS `create_entry`,`dwms_bd`.`entry_subarticles`.`stock` AS `stock`,`dwms_bd`.`entry_subarticles`.`note_entry_id` AS `note_entry_id`,`dwms_bd`.`entry_subarticles`.`invalidate` AS `invalidate` from ((`dwms_bd`.`subarticles` join `dwms_bd`.`materials` on(`dwms_bd`.`materials`.`id` = `dwms_bd`.`subarticles`.`material_id`)) join `dwms_bd`.`entry_subarticles` on(`dwms_bd`.`entry_subarticles`.`subarticle_id` = `dwms_bd`.`subarticles`.`id`)) where `dwms_bd`.`entry_subarticles`.`stock` > 0 order by `dwms_bd`.`subarticles`.`description`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `pedidos_temporales` AS (select `dwms_bd`.`t_temporal_pedidos`.`code_item` AS `code_item`,sum(`dwms_bd`.`t_temporal_pedidos`.`cantidad_item`) AS `totalReservas` from `dwms_bd`.`t_temporal_pedidos` group by `dwms_bd`.`t_temporal_pedidos`.`code_item`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `usersjson1` AS (select `dwms_bd`.`users`.`id` AS `id`,`dwms_bd`.`users`.`name` AS `nombre`,`dwms_bd`.`users`.`ci` AS `numero_documento`,`dwms_bd`.`users`.`title` AS `cargo`,`dwms_bd`.`users`.`department_id` AS `department_id`,`dwms_bd`.`departments`.`name` AS `unidad`,`dwms_bd`.`departments`.`id` AS `id_departament`,`dwms_bd`.`users`.`email` AS `email` from (`dwms_bd`.`users` join `dwms_bd`.`departments` on(`dwms_bd`.`departments`.`code` = `dwms_bd`.`users`.`department_id`)));--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_json` AS (select `dwms_bd`.`users`.`id` AS `id`,`dwms_bd`.`users`.`name` AS `nombre`,`dwms_bd`.`users`.`ci` AS `numero_documento`,`dwms_bd`.`users`.`title` AS `cargo`,`dwms_bd`.`users`.`department_id` AS `department_id`,`dwms_bd`.`departments`.`name` AS `unidad`,`dwms_bd`.`departments`.`id` AS `id_departament`,`dwms_bd`.`users`.`email` AS `email` from (`dwms_bd`.`users` join `dwms_bd`.`departments` on(`dwms_bd`.`departments`.`id` = `dwms_bd`.`users`.`department_id`)));
*/