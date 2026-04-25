# CLAUDE.md — Sistema de Gestión Administrativa Wasker SPA

## Contexto del proyecto

Sistema web para Comercial Wasker SpA (tienda "Gato Barato", venta de comida para gatos).
Reemplaza registros manuales y Excel dispersos por una plataforma centralizada.

**Stack:**
- Frontend: Angular (TypeScript) + HTML5 + CSS3
- Backend: Python (FastAPI)
- Base de datos: MySQL
- Protocolo: HTTPS, transacciones ACID

---

## Arquitectura

```
Frontend (Angular) → HTTPS/JSON → Backend (Python) → MySQL
```

El backend expone una REST API. El frontend consume los endpoints. No hay lógica de negocio en el frontend, solo presentación y validación visual.

---

## Módulos del sistema

### 1. Inventario
- CRUD de productos (SKU, nombre, precio, stock, categoría)
- Alertas visuales cuando stock <= umbral configurado (solo admin puede modificar umbral)
- Historial de cambios en `productos_historicos`

### 2. Ventas
- Registro de transacciones con validación de stock previa al commit
- Si stock = 0, bloquear operación y mostrar error al operador
- Actualización atómica del stock (transacción MySQL ACID)
- Generación de comprobante/boleta

### 3. Clientes
- CRUD de clientes vinculados a `personas` (RUT, nombre completo)
- Registro de fecha de última compra

### 4. Reportes
- Solo accesible por administrador
- Estadísticas de ventas, productos más vendidos, stock crítico

---

## Roles y permisos (RBAC)

| Función | Admin | Vendedor/Cajero |
|---|---|---|
| Registrar venta | ✓ | ✓ |
| Consultar productos | ✓ | ✓ |
| Gestionar productos | ✓ | ✗ |
| Gestionar clientes | ✓ | ✗ |
| Ver reportes | ✓ | ✗ |
| Configurar alertas stock | ✓ | ✗ |
| Ver costos | ✓ | ✗ |

---

## Modelo de base de datos (tablas principales)

```sql
personas (id_persona, rut, nombre_completo, nombres, apellido_paterno, apellido_materno)
usuarios (id_usuario, nombre_usuario, password_usuario [hash], id_persona, ultima_conexion)
perfiles (id_perfil, perfil, perfil_prioridad)
usuarios_perfiles (id_usuario_perfil, id_usuario, id_perfil)
menus (id_menu, menu, descripcion, orden_menu, vigencia_menu)
perfiles_menus (id_perfil_menu, id_perfil, id_menu)

clientes (id_cliente, fecha_creacion, fecha_ultima_compra, id_persona)
productos_categoria (id_producto_categoria, categoria_producto, es_categoria_adulto, es_categoria_gatito)
productos (id_producto, sku_producto, nombre_producto, stock, precio_producto, imagen_url_producto, fecha_creacion, id_producto_categoria)
productos_historicos (id_producto_historico, id_producto, fecha_creacion, precio, motivo_cambio)

ventas (id_venta, fecha_venta, id_cliente, id_vendedor, id_tipo_pago)
detalle_venta (id_detalle, cantidad, precio_unitario, id_venta, id_producto)
tipos_pagos (id_tipo_pago, tipo_pago)
ventas_pagos (id_pago, id_venta, id_tipo_pago, monto, fecha)

sucursales (id_sucursal, sucursal, fecha_creacion, id_ciudad)
stock_sucursal (id_producto, id_sucursal, stock_actual, stock_minimo)
cajas (id_caja, id_sucursal, codigo)

vendedores (id_vendedor, fecha_ultima_venta, id_persona)
regiones (id_region, codigo_region, region)
comunas (id_comuna, comuna, fecha_creacion, id_region)
ciudades (id_ciudad, ciudad, fecha_creacion, id_comuna)
```

---

## Reglas de negocio críticas

1. **Venta sin stock → bloqueada.** El backend debe verificar `stock_actual > 0` antes de cualquier INSERT en `detalle_venta`. Retornar HTTP 400 con mensaje de error claro.
2. **Passwords en hash.** Nunca almacenar en texto plano. Usar bcrypt.
3. **Transacciones ACID.** Todo el flujo de venta (INSERT ventas + INSERT detalle_venta + UPDATE stock_sucursal) dentro de una sola transacción MySQL.
4. **Alerta de stock crítico.** Si `stock_actual <= stock_minimo` tras una venta, el endpoint debe retornar una flag `stock_critico: true` para que el frontend muestre notificación persistente.
5. **Permisos por rol.** Cada endpoint del backend debe validar el perfil del usuario autenticado antes de ejecutar cualquier operación.

---

## Sistema de menús dinámicos (RBAC)

### Modelo de datos
Los menús visibles por usuario se determinan exclusivamente por las tablas:
- `menus` — catálogo de ítems de navegación (`vigencia_menu = 'S'` para activos)
- `perfiles_menus` — relación perfil → menús permitidos
- `usuarios_perfiles` — relación usuario → perfiles asignados

### Menús registrados

| id_menu | menu                | descripcion            | orden | perfiles con acceso |
|---------|---------------------|------------------------|-------|---------------------|
| 1       | Inicio              | /dashboard             | 1     | Admin, Vendedor     |
| 2       | Carrito de Compras  | /cart                  | 2     | Admin, Vendedor     |
| 3       | Historial de Ventas | /sales                 | 3     | Admin, Vendedor     |
| 4       | Clientes            | /clients/list          | 4     | Admin               |
| 5       | Reportes            | /reports               | 5     | Admin               |
| 6       | Usuarios            | /usuarios/list         | 6     | Admin               |
| 7       | Productos           | NULL (collapsible)     | 7     | Admin, Vendedor     |
| 8       | Lista de Productos  | /products/list         | 8     | Admin, Vendedor     |
| 9       | Agregar Producto    | /products/form         | 9     | Admin               |
| 10      | Categorías          | /products/categorias   | 10    | Admin               |

### Backend — endpoint requerido

```
GET /api/menus/mis-menus
```

- Requiere JWT válido en `Authorization: Bearer <token>`
- Extrae `id_usuario` del token
- Query:

```sql
SELECT m.id_menu, m.menu, m.descripcion, m.orden_menu
FROM menus m
JOIN perfiles_menus pm ON m.id_menu = pm.id_menu
JOIN usuarios_perfiles up ON pm.id_perfil = up.id_perfil
WHERE up.id_usuario = :id_usuario
  AND m.vigencia_menu = 'S'
ORDER BY m.orden_menu ASC
```

- 401 si token inválido
- `[]` si el usuario no tiene perfiles asignados

Archivos:
```
app/routes/menus.py
app/services/menu_service.py
```
Registrar en `main.py` con `prefix="/api/menus"`.

### Frontend — implementación requerida

1. **Interfaz** `Menu`:
```typescript
{ id_menu: number, menu: string, descripcion: string | null, orden_menu: number }
```

2. **Servicio** `src/app/core/services/menu.service.ts`
   - `getMisMenus(): Observable<Menu[]>`
   - El JWT lo adjunta el interceptor, no gestionar aquí

3. **Componente sidebar**
   - Inyectar `MenuService`
   - `ngOnInit` llama `getMisMenus()`, almacena en `menus: Menu[]`
   - Reemplazar ítems hardcodeados por `*ngFor` sobre `menus`
   - Usar `descripcion` como `routerLink`
   - Mapeo de íconos local en el componente, indexado por `id_menu`

4. **AuthInterceptor** en `core/interceptors/`
   - Si no existe, crearlo
   - Adjunta `Authorization: Bearer <token>` a toda petición HTTP saliente

### Restricciones
- Ningún menú hardcodeado en ningún componente tras este cambio
- Sin dependencias npm ni pip nuevas
- `try/except` en cada función Python, `catchError` en cada Observable Angular
- No modificar lógica de autenticación ni guards existentes

---

## Convenciones de código

- **Python:** snake_case, sin frameworks pesados innecesarios. FastAPI.
- **Angular:** componentes por módulo (products, sales, clients, reports, auth). Servicios para las llamadas HTTP.
- **SQL:** nombres de tablas y columnas en snake_case, igual que el modelo físico documentado.
- **No sobre-ingenierizar.** Código funcional y legible. Sin patrones abstractos innecesarios para una app de este tamaño.

---

## Estructura de carpetas esperada

```
wasker-backend/
  app/
    models/         # clases ORM o queries SQL
    routes/         # routers por módulo (ventas, productos, clientes, reportes, auth, menus)
    services/       # lógica de negocio (validaciones, cálculos)
    utils/          # helpers (hash, jwt, etc.)
  config.py
  main.py

wasker-frontend/
  src/app/
    core/           # guards, interceptors, auth service, menu service
    features/
      products/
      sales/
      clients/
      reports/
    shared/         # componentes reutilizables, pipes
    layout/         # sidebar, navbar
  environments/
```

---

## Seguridad

- HTTPS obligatorio en producción
- JWT para autenticación stateless
- Guard en Angular por rol antes de cargar cada módulo
- Backup semanal automatizado de MySQL a almacenamiento externo

---

## Notas de implementación

- El sistema es para uso local/intranet del negocio. No es e-commerce público.
- La interfaz debe funcionar en PC de escritorio con Windows y navegador actualizado.
- Priorizar velocidad de operación en punto de venta: registrar una venta debe requerir el mínimo de clics posible.
- Los cajeros no deben ver costos, solo precios de venta.
