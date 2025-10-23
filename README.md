# URJC pedalea — Especificación de Requisitos del Software (ERS)

Fecha: 2025-10-21

Descripción
-----------
`URJC pedalea` es una aplicación web responsive diseñada para fomentar el uso de la bicicleta en la comunidad de la Universidad Rey Juan Carlos (URJC). Permite crear, compartir y descubrir rutas ciclistas, gestionar sugerencias y puntos críticos, valorar rutas y participar en un sistema de gamificación.

Resumen y alcance
------------------
- Tecnología frontend: HTML5, CSS, JavaScript (framework a decidir).
- Tecnología backend: Node.js.
- Base de datos: SQLite (inicialmente).
- Mapas: OpenStreetMap + motor de enrutamiento open-source (OSRM/GraphHopper/Valhalla).
- SMTP configurado para envío de correos transaccionales.

Checklist de requisitos (extraídos del enunciado)
- PP-01, PP-02, NF-06, NF-07, US-08 (Página Principal y contenido estático)
- US-01, US-02, US-05, US-06, US-07 (Gestión de usuarios)
- US-03, US-04 (Perfil y notificaciones)
- RT-01, RT-02, RT-03, RT-04, RT-06, RT-08, RT-09, RT-10, RT-11, RT-12 (Módulo de rutas)
- SG-01, SG-02, SG-03 (Sugerencias comunidad)
- GM-01, GM-02, GM-03, GM-04 (Gamificación)
- AD-02, AD-03, AD-05, AD-06, AD-07, AD-08 (Panel administración)
- MD-01, MD-02 (Moderación)
- NF-01..NF-05, I18N-01, RT-11, US-05 (No funcionales e integraciones)

---

Aplicación Web: "URJC pedalea"

Fecha: 2025-10-21

### 1. Objeto del Proyecto

El presente pliego tiene como objeto definir las especificaciones técnicas, funcionales y de diseño para el desarrollo e implantación de una aplicación web denominada "URJC pedalea".

Objetivo propuesto (completar): fomentar el uso de la bicicleta en la comunidad universitaria, permitir crear y compartir rutas ciclistas, recibir sugerencias y reportes, e incentivar la participación mediante un sistema de gamificación.

### 2. Requisitos de Diseño e Identidad Visual

La aplicación web deberá cumplir rigurosamente con el Manual de Identidad Visual Corporativa de la URJC para garantizar una integración coherente con la imagen de la universidad.

#### Paleta de Colores (oficiales)

- Rojo URJC: #DA291C — acentos primarios, CTAs.
- Gris URJC: #807F83 — textos secundarios, fondos neutros.
- Negro: #000000 — textos principales.
- Blanco: #FFFFFF — fondos y textos invertidos.

#### Tipografía

La familia corporativa es Gill Sans. Fallbacks: Montserrat o Lato (Google Fonts) si no hay licencia.

### 3. Requisitos funcionales y técnicos (resumen)

- Autenticación por email y contraseña; recuperación por email (SMTP configurable).
- Subida y visualización de rutas GPX; planificador con snap-to-road usando enrutador open-source.
- Puntos críticos con validación comunitaria (5 votos para eliminar).
- Sugerencias públicas con voto único por usuario.
- Gamificación: puntos por acciones, clasificación mensual, logros.
- Panel de administración con validación de rutas, gestión de usuarios y parámetros (ej. tamaño máximo GPX).

### 4. Entregables y criterios de aceptación (MVP)

- Registro/login funcional.
- Subida GPX y visualización en mapa.
- Creación de puntos críticos y sugerencias.
- Panel admin para validar rutas.
- Páginas estáticas: About, Ayuda, Aviso Legal/Privacidad.

### 5. Observaciones y próximos pasos

1. Obtener el manual corporativo oficial (PDF) para confirmar valores exactos (Pantone, CMYK, tipografías con licencias y normas de uso del logotipo).
2. Confirmar la tipografía web a usar y adquirir la licencia de Gill Sans si se requiere.
3. Completar requisitos funcionales con flujos detallados y endpoints API.
4. Planificar sprints para el desarrollo del MVP.

## 1. Visión general

URJC pedalea es una plataforma web responsive para crear, compartir y descubrir rutas ciclistas entre la comunidad URJC. Facilita la participación con sugerencias, valoraciones, puntos críticos y un sistema de gamificación para incentivar contribuciones y mejorar la infraestructura.

Objetivos principales:
- Fomentar el uso de la bicicleta en la URJC.
- Permitir intercambio y validación comunitaria de rutas y avisos.
- Proveer herramientas de planificación y visualización basadas en OpenStreetMap y soluciones open-source de enrutamiento.
- Cumplir RGPD y ofrecer experiencia multi-idioma (ES/EN).

## 2. Actores / Roles
- Usuario Anónimo: ve contenido público; no puede interactuar. (ROLE_ANON)
- Usuario Registrado: crea rutas, puntos críticos, sugerencias, valora, comenta, accede a perfil y notificaciones. (ROLE_USER)
- Administrador: gestiona contenido, valida rutas, modera reportes, gestiona usuarios y parámetros. (ROLE_ADMIN)

## 3. Requisitos funcionales (epics, IDs y aceptación)

Reglas de formato: cada ítem incluye ID, descripción y criterios de aceptación (CA) básicos.

Epic 1 — Página Principal y Contenido Estático
- PP-01: Noticias y Eventos (Alta)
  - CA: Admin puede crear/editar/eliminar noticias en ES/EN; listado visible en home.
- PP-02: Menú visual en home
  - CA: Accesos: Buscar rutas, Subir ruta, Planificador, Sugerencias, Clasificación, Perfil, Panel admin (si aplica).
- NF-06: Página "Acerca de" (`/about`)
- NF-07: Página "Ayuda" (guías exportar GPX)
- US-08: Banner cookies y enlaces legales (RGPD)

Epic 2 — Gestión de Usuarios y Cuentas
- US-01: Registro (email + contraseña)
- US-02: Login / Logout
- US-05: Recuperar contraseña (email con token)
- US-06: Editar nombre público y contraseña (email no editable)
- US-07: Eliminar cuenta (contenido reasignado a Usuario Anónimo)

Epic 3 — Perfil y Notificaciones
- US-03: Perfil (rutas favoritas, logros)
- US-04: Centro de notificaciones (validación de rutas, interacciones; marcar todas como leídas)

Epic 4 — Módulo de Rutas Ciclistas
- RT-01: Subida de rutas en formato GPX (validación y extracción de metadatos)
- RT-10: Planificador de rutas con snap-to-road (OSRM/GraphHopper/Valhalla)
- RT-02: Visualización de rutas en mapa interactivo (Leaflet/MapLibre + OSM)
- RT-09: Ficha de estadísticas (elevación, distancia, desnivel, tipo recomendado)
- RT-03: Añadir Puntos Críticos en rutas (tipo, fotos, descripción)
- RT-08: Validación comunitaria de puntos (5 votos "ya no existe" → eliminación automática)
- RT-04: Buscador por origen y destino
- RT-06: Valoraciones por criterios (Seguridad, Dificultad, Paisaje) y comentarios
- RT-11: Infraestructura de mapas open-source
- RT-12: Parámetros configurables por admin (ej. tamaño máximo GPX)

Epic 5 — Sugerencias de la Comunidad
- SG-01: Crear sugerencia (título, descripción, categoría, ubicación)
- SG-02: Sugerencias públicas y filtrables
- SG-03: Voto "me gusta" único por usuario por sugerencia

Epic 6 — Gamificación
- GM-01: Puntos por acción (reglas)
  - Subir sugerencia: +5 (GM-01-S01)
  - Añadir punto crítico: +10 (GM-01-S02)
  - Revisar punto crítico: +1 (GM-01-S03)
  - Subir ruta aprobada: +1 punto/km (GM-01-S04)
  - Valorar ruta: +2 (GM-01-S05)
- GM-02: Clasificación mensual (reseteo mensual)
- GM-04: Histórico de ganadores mensuales
- GM-03: Logros con niveles (plata/oro/diamante)

Epic 7 — Panel de Administración
- AD-06: Cuenta admin por defecto (admin/admin) y forzar cambio de contraseña al primer login
- AD-07: Dashboard con notificaciones y tareas pendientes
- AD-02: Gestión de News/Events en ES/EN
- AD-03: Validar/rechazar rutas (notificar motivo)
- AD-08: Gestión de usuarios (buscar, actividad, banear, reset pwd)
- AD-05: Moderación de Puntos Críticos y Sugerencias
- RT-12: Configuración de parámetros de la app

Epic 8 — Moderación
- MD-01: Botón "Reportar" en contenido de usuarios
- MD-02: Revisión de reportes por admin (estados y acciones)

## 4. Requisitos no funcionales
- NF-01: Responsive (escritorio / tablet / móvil)
- NF-02: UX/UI con colores corporativos URJC y animaciones suaves
- I18N-01: Español e Inglés. Traducción automática configurable para contenido comunitario.
- NF-03: Frontend: HTML5, CSS, JS
- NF-04: Backend: Node.js
- NF-05: DB: SQLite (inicial)
- RT-11: Usar OSM y motor de enrutamiento open-source
- US-05: SMTP obligatorio para envíos transaccionales

## 5. Modelo de datos (resumen)
- User { id, email, passwordHash, username, role, points, createdAt, deletedAt, mustChangePassword }
- Route { id, ownerId|null, title, descriptionES, descriptionEN, gpxFile, polyline, distance, elevationGain, stats, status, createdAt }
- CriticalPoint { id, routeId, creatorId, lat, lng, category, description, photos[], votesExists, createdAt }
- Suggestion { id, creatorId, title, description, location, likesCount }
- Notification { id, userId, type, payload, read, createdAt }
- Report { id, reporterId|null, targetType, targetId, reason, status }

## 6. API (alto nivel)
- POST /api/auth/register — registro (US-01)
- POST /api/auth/login — login (US-02)
- POST /api/auth/forgot-password — enviar email (US-05)
- POST /api/auth/reset-password — restablecer
- POST /api/routes — subir GPX (RT-01)
- GET /api/routes — listar y filtrar (RT-04)
- GET /api/routes/:id — detalle (RT-02, RT-09)
- POST /api/routes/:id/critical-points — añadir punto (RT-03)
- POST /api/suggestions — crear sugerencia (SG-01)
- POST /api/suggestions/:id/like — votar sugerencia (SG-03)
- GET /api/leaderboard?month=YYYY-MM — clasificación (GM-02)
- CRUD /api/admin/news — gestión noticias (AD-02)
- GET /api/admin/reports — revisar reportes (MD-02)
- PATCH /api/admin/config — parámetros (RT-12)

## 7. Seguridad y privacidad
- Contraseñas con hashing fuerte (bcrypt/argon2).
- Tokens con expiración; sesiones seguras.
- CSRF, XSS sanitización, validación de inputs.
- Consentimiento para cookies y opción de eliminación/anonimización de cuenta (RGPD).

## 8. Entregables mínimos (MVP)
- Registro/login
- Subir GPX y visualizar ruta en mapa
- Crear puntos críticos
- Crear sugerencia y votarla
- Sistema de valoraciones básicas
- Panel admin para validar rutas
- Banner cookies y páginas About/Ayuda

## 9. Siguientes pasos recomendados
1. Definir stack frontend (React/Vue/Svelte) y backend (Express/NestJS).
2. Crear backlog inicial y sprints priorizando MVP.
3. Generar script de creación del admin inicial que fuerce cambio de contraseña.
4. Preparar variables de entorno para SMTP y motor de enrutamiento.

---

## Kanban (actualizado)

Tablero con tres columnas: To Do | In Progress | Done
Tablero con tres columnas: To Do | In Progress | Done | On review
To Do
------
- PP-01: Noticias y Eventos — Crear CRUD de noticias en ES/EN
- PP-02: Menú visual en home — Diseñar y enlazar accesos principales
- NF-06: Página About (/about) — Contenido estático
- NF-07: Página Ayuda — Guías exportar GPX
- US-08: Banner cookies y enlaces legales
- US-03: Perfil de usuario (favoritos y logros)
- US-04: Centro de notificaciones
- RT-01: Subida GPX y parser
- RT-10: Planificador de rutas (snap-to-road)
- RT-02: Visualización de rutas en mapa
- RT-09: Ficha de estadísticas de ruta
- RT-03: Añadir Puntos Críticos
- RT-08: Validación comunitaria de puntos críticos
- RT-04: Buscador por origen/destino
- RT-06: Sistema de valoraciones por criterios
- RT-11: Configurar infra de mapas (OSM + enrutador)
- RT-12: Parámetros admin (tamaño GPX)
- SG-01: Crear sugerencia
- SG-02: Mostrar sugerencias públicamente
- SG-03: Votar sugerencias
- GM-01: Implementar sistema de puntos (reglas básicas)
- GM-02: Página de clasificación mensual
- GM-03: Sistema de logros y niveles
- GM-04: Histórico de ganadores
- AD-02: CRUD Noticias/Eventos (ES/EN)
- AD-03: Validación/rechazo de rutas (notificar motivo)
- AD-05: Moderación de Puntos Críticos y Sugerencias
- MD-01: Botón "Reportar" en contenido
- MD-02: Revisión de reportes en admin
- NF-01: Hacer la UI responsive
- NF-02: Aplicar colores URJC y animaciones
- I18N-01: Internacionalización ES/EN y API de traducción
- NF-03: Decidir frameworks/librerías frontend

In Progress
-----------
- US-06: Editar perfil (nombre público y contraseña) - Backend listo, frontend solo muestra datos.
- US-07: Eliminar cuenta y anonimizar contenido - Backend y frontend implementado; flujo de eliminación enviado por email y confirmación con contraseña en cliente. (On review: tests added)
- AD-07: Dashboard admin con tareas - Listado de usuarios implementado, CRUD pendiente.
- AD-08: Gestión de usuarios (banear, reset pwd) - Backend listo, frontend pendiente.

Done
----
- US-01: Registro por email y contraseña
- US-02: Login/Logout
- US-05: Recuperar contraseña (SMTP)
- AD-06: Crear cuenta admin por defecto (admin/admin) y forzar cambio
- NF-04: Decidir framework backend (Node.js/Express)
- NF-05: Preparar SQLite y esquema inicial
- US-05(SVC): Configurar SMTP en entorno (placeholders en .env)

Implemented features (summary)
--------------------------------
- User registration (email+password) with email verification token sent on register.
- Login and JWT issuance.
- Password recovery: forgot-password sends email with reset token; reset-password endpoint implemented.
- Account deletion flow: from profile user can request deletion, server emails a confirmation link to a client route `/confirm-delete/:token`, client requests password and POSTs to `/api/auth/confirm-delete/:token` to finalize deletion. Backend validates password and deletes account. Tests cover the full flow.
- Frontend components: `Profile` (with Delete account button), `ConfirmDelete` (password form), `Register`, `Login`, `ResetPassword`.
- Automated tests: Jest tests covering auth, users, frontend unit tests and a new E2E-style test for account deletion. All tests pass locally.

On review
---------
- US-07: Account deletion flow — automated tests added and passing; ready for manual QA on staging. (This column indicates features under active testing/QA.)

