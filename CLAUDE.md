# CLAUDE.md — Sistema de Gestión Administrativa Wasker SPA

## Contexto del proyecto

Sistema web para Comercial Wasker SpA (tienda "Gato Barato", venta de comida para gatos).
Reemplaza registros manuales y Excel dispersos por una plataforma centralizada.

**Stack:**
- Frontend: Angular (TypeScript) + HTML5 + CSS3
- Backend: Python (Flask o FastAPI)
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
- Historial de cambios en `productos_historico`

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
productos_categoria (id_producto_categoria, categoria_producto)
productos (id_producto, sku_producto, nombre_producto, stock, precio_producto, fecha_creacion, id_producto_categoria)
productos_historico (id_producto_historico, id_producto, fecha_creacion, precio, motivo_cambio)

ventas (id_venta, fecha_venta, id_cliente, id_vendedor, id_tipo_pago)
detalle_venta (id_detalle, cantidad, precio_unitario, id_venta, id_producto)
tipos_pagos (id_tipo_pago, tipo_pago)
ventas_pagos (id_pago, id_venta, id_tipo_pago, monto)

sucursales (id_sucursal, sucursal, fecha_creacion, id_ciudad)
stock_sucursal (id_producto, id_sucursal, stock_actual, stock_minimo)
cajas (id_caja, id_sucursal, codigo, fecha)

vendedores (id_vendedor, fecha_ultima_venta, id_persona)
regiones (id_region, codigo_region, region)
ciudades (id_ciudad, ciudad, fecha_creacion, id_comuna)
comunas (id_comuna, comuna, fecha_creacion, id_region)
```

---

## Reglas de negocio críticas

1. **Venta sin stock → bloqueada.** El backend debe verificar `stock_actual > 0` antes de cualquier INSERT en `detalle_venta`. Retornar HTTP 400 con mensaje de error claro.
2. **Passwords en hash.** Nunca almacenar en texto plano. Usar bcrypt.
3. **Transacciones ACID.** Todo el flujo de venta (INSERT ventas + INSERT detalle_venta + UPDATE stock_sucursal) dentro de una sola transacción MySQL.
4. **Alerta de stock crítico.** Si `stock_actual <= stock_minimo` tras una venta, el endpoint debe retornar una flag `stock_critico: true` para que el frontend muestre notificación persistente.
5. **Permisos por rol.** Cada endpoint del backend debe validar el perfil del usuario autenticado antes de ejecutar cualquier operación.

---

## Convenciones de código

- **Python:** snake_case, sin frameworks pesados innecesarios. Flask o FastAPI, lo que ya esté configurado.
- **Angular:** componentes por módulo (products, sales, clients, reports, auth). Servicios para las llamadas HTTP.
- **SQL:** nombres de tablas y columnas en snake_case, igual que el modelo físico documentado.
- **No sobre-ingenierizar.** Código funcional y legible. Sin patrones abstractos innecesarios para una app de este tamaño.

---

## Estructura de carpetas esperada

```
wasker-backend/
  app/
    models/         # clases ORM o queries SQL
    routes/         # blueprints por módulo (ventas, productos, clientes, reportes, auth)
    services/       # lógica de negocio (validaciones, cálculos)
    utils/          # helpers (hash, jwt, etc.)
  config.py
  run.py

wasker-frontend/
  src/app/
    core/           # guards, interceptors, auth service
    features/
      products/
      sales/
      clients/
      reports/
    shared/         # componentes reutilizables, pipes
    layout/
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
