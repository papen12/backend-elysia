# Roles y permisos del backend DWMS

Los permisos están definidos en `src/auth/ability.js` y replican los roles del sistema Rails (NSIAF, `app/models/ability.rb`).

- Cada endpoint protegido exige un token válido (`authGuard`). Sin token, o con un usuario inexistente o inactivo, responde **401**.
- Si el rol no tiene permiso sobre el recurso, responde **403** (`requireAbility`).
- El rol y el estado del usuario se leen de la base en cada petición: si un usuario es desactivado o cambia de rol, el cambio aplica de inmediato, aunque su token siga vigente.
- Niveles de permiso: **read** (consultar) y **manage** (consultar, crear, editar, cambiar estado, entregar, anular). `manage` incluye `read`.

## 1. Roles

| Rol | Nombre | Función | Quién lo asigna |
|---|---|---|---|
| `super_admin` | Super Administrador | Administra todo el sistema | Se crea con el seed de Rails; no se puede asignar desde la API |
| `admin` | Administrador de Activos | Responsable de activos fijos (módulo aún no migrado) | `super_admin` |
| `admin_store` | Administrador de Almacenes | Opera el almacén: catálogo, ingresos, solicitudes y entregas | `super_admin` |
| `observador_almacen` | Observador de almacén | Consulta el almacén sin modificar nada | `super_admin` |
| *(sin rol)* | Funcionario | Solicitante de material; solo inicia sesión y cambia su contraseña | Es el valor por defecto de los usuarios creados por `admin` o `admin_store` |

## 2. Permisos por módulo

| Módulo | Recurso | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| Usuarios | `User` | manage | manage | manage | read | — |
| Proveedores | `Supplier` | manage | manage | manage | read | — |
| Materiales (grupos contables) | `Material` | manage | — | manage | read | — |
| Subartículos, stock, kardex, movimientos y stock mínimo | `Subarticle` | manage | — | manage | read | — |
| Solicitudes de material | `Request` | manage | — | manage | read | — |
| Notas de ingreso | `NoteEntry` | manage | manage | manage | read | — |

## 3. Acciones por endpoint

✅ permitido · ❌ responde 403 · Todas las rutas llevan el prefijo `/api`.

### Autenticación y cuenta propia

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `POST /auth/login` | Iniciar sesión (usuario activo) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH /users/me/password` | Cambiar la contraseña propia | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /users/me/hide-announcement` | Ocultar el aviso de cambio de contraseña | ✅ | ✅ | ✅ | ✅ | ✅ |

### Usuarios

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `GET /users` | Listar usuarios | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /users/search` | Buscar funcionarios activos | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /users/:id` | Ver un usuario | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /users/:id/historico-almacen` | Ver las entregas de material de un funcionario | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /users` | Crear usuario | ✅ con rol y contraseña | ✅ sin rol | ✅ sin rol | ❌ | ❌ |
| `PATCH /users/:id` | Editar usuario | ✅ incluye rol y contraseña | ✅ salvo `super_admin` y `admin_store` | ✅ salvo `super_admin` y `admin` | ❌ | ❌ |
| `POST /users/:id/change-status` | Activar o desactivar usuario | ✅ | ✅ | ✅ | ❌ | ❌ |

### Proveedores

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `GET /suppliers` | Listar proveedores | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /suppliers/:id` | Ver un proveedor | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /suppliers` | Crear proveedor | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PATCH /suppliers/:id` | Editar proveedor | ✅ | ✅ | ✅ | ❌ | ❌ |

### Materiales

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `GET /materials` | Listar materiales | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /materials/:id` | Ver un material | ✅ | ❌ | ✅ | ✅ | ❌ |
| `POST /materials` | Crear material | ✅ | ❌ | ✅ | ❌ | ❌ |
| `PATCH /materials/:id` | Editar material | ✅ | ❌ | ✅ | ❌ | ❌ |
| `POST /materials/:id/change-status` | Activar o desactivar material | ✅ | ❌ | ✅ | ❌ | ❌ |

### Subartículos

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `GET /subarticles` | Listar subartículos con su stock | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /subarticles/search` | Buscar artículos activos para formularios | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /subarticles/minimum-stock` | Ver alertas de stock mínimo | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /subarticles/:id` | Ver un subartículo | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /subarticles/:id/kardex` | Ver el kardex valorado (PEPS) | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /subarticles/:id/movements` | Ver los movimientos con saldo | ✅ | ❌ | ✅ | ✅ | ❌ |
| `POST /subarticles` | Crear subartículo | ✅ | ❌ | ✅ | ❌ | ❌ |
| `PATCH /subarticles/:id` | Editar subartículo | ✅ | ❌ | ✅ | ❌ | ❌ |
| `POST /subarticles/:id/change-status` | Activar o desactivar subartículo | ✅ | ❌ | ✅ | ❌ | ❌ |

### Solicitudes de material

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `GET /requests` | Listar solicitudes | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /requests/next-number` | Consultar el próximo número | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /requests/:id` | Ver una solicitud | ✅ | ❌ | ✅ | ✅ | ❌ |
| `POST /requests` | Registrar una solicitud | ✅ | ❌ | ✅ | ❌ | ❌ |
| `POST /requests/:id/deliver` | Entregar (descuenta stock con PEPS) | ✅ | ❌ | ✅ | ❌ | ❌ |
| `POST /requests/:id/cancel` | Anular una solicitud pendiente | ✅ | ❌ | ✅ | ❌ | ❌ |

### Notas de ingreso

| Endpoint | Acción | super_admin | admin | admin_store | observador_almacen | sin rol |
|---|---|---|---|---|---|---|
| `GET /note-entries` | Listar notas (vigentes o anuladas) | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /note-entries/next-number` | Consultar el próximo número | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /note-entries/:id` | Ver una nota con sus lotes | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /note-entries` | Registrar compra o ingreso sin costo | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PATCH /note-entries/:id` | Editar la cabecera | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /note-entries/:id/cancel` | Anular (solo si ningún lote tuvo salidas) | ✅ | ✅ | ✅ | ❌ | ❌ |

## 4. Reglas adicionales

- **Asignación de roles:** solo `super_admin` puede asignar o cambiar el rol de un usuario, y solo con los valores `admin`, `admin_store` u `observador_almacen`. No se puede crear otro `super_admin` desde la API.
- **Usuarios creados por `admin` o `admin_store`:** quedan sin rol. Si no se indica contraseña, la contraseña inicial es el CI.
- **Edición entre administradores:** `admin` no puede editar usuarios `super_admin` ni `admin_store`; `admin_store` no puede editar usuarios `super_admin` ni `admin`.
- **Visibilidad del super administrador:** el listado de usuarios no muestra al `super_admin`, y la búsqueda de funcionarios excluye al usuario `admin`.
- **Usuarios inactivos:** no pueden iniciar sesión, y sus tokens dejan de funcionar al ser desactivados.

## 5. Observaciones

- **`admin` y las notas de ingreso:** `admin` puede gestionar notas de ingreso pero no consultar subartículos, así que en la práctica no puede elegir qué artículos ingresar. Rails tenía la misma configuración.
- **Cambio de estado de usuarios:** `POST /users/:id/change-status` no aplica las restricciones de edición entre administradores. Un `admin` o `admin_store` puede desactivar a un `super_admin`, lo que podría dejar al sistema sin administrador. Rails tenía el mismo comportamiento.
- **Usuarios sin rol:** no pueden ver ni editar su propio perfil. En Rails sí podían (`can [:show, :update], User, id: user.id`).
- **Reportes de almacén:** están pendientes de implementar. Se propone que usen el permiso de lectura de `Subarticle` (`super_admin`, `admin_store` y `observador_almacen`), igual que el menú de reportes de Rails.
- **`EntrySubarticle`:** figura en `ability.js`, pero ningún endpoint lo usa.
