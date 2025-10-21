# Pliego de Prescripciones Técnicas (borrador)

Aplicación Web: "URJC pedalea"

Fecha: 2025-10-21

## 1. Objeto del Proyecto

El presente pliego tiene como objeto definir las especificaciones técnicas, funcionales y de diseño para el desarrollo e implantación de una aplicación web denominada "URJC pedalea".

Objetivo propuesto (completar): fomentar el uso de la bicicleta en la comunidad universitaria, permitir crear y compartir rutas ciclistas, recibir sugerencias y reportes, e incentivar la participación mediante un sistema de gamificación.

## 2. Requisitos de Diseño e Identidad Visual

La aplicación web deberá cumplir rigurosamente con el Manual de Identidad Visual Corporativa de la URJC para garantizar una integración coherente con la imagen de la universidad.

### 2.1 Paleta de Colores (oficiales)

Los colores principales identificados en los manuales de identidad son:

| Denominación | Uso | HEX |
|---|---:|---:|
| Rojo URJC | Acentos primarios, CTAs, iconos destacados | #DA291C |
| Gris URJC | Textos secundarios, bordes, fondos neutros | #807F83 |
| Negro | Textos principales | #000000 |
| Blanco | Fondos, textos invertidos | #FFFFFF |

Uso: El Rojo URJC (#DA291C) se utilizará como color de acento principal para acciones primarias (botones de "call to action", enlaces activos, iconos destacados). El Gris URJC (#807F83) se empleará para textos secundarios, bordes o fondos neutros. El Blanco y Negro se usarán para garantizar la legibilidad en fondos y textos.

### 2.2 Logotipo

Se deberá utilizar el logotipo oficial de la Universidad Rey Juan Carlos en la cabecera de la aplicación, enlazando a la página principal de la universidad (urjc.es) o a la portada de la propia aplicación, según se defina en la arquitectura de navegación.

El logotipo de "URJC pedalea" (si se crea uno) deberá estar subordinado visualmente al logotipo principal de la URJC y utilizar la paleta de colores y tipografías corporativas.

### 2.3 Tipografía

La familia tipográfica corporativa de la URJC es Gill Sans. La aplicación web deberá emplear esta familia tipográfica en sus distintas variantes (Regular, Light, Semibold) para todos los textos, títulos y elementos de la interfaz.

Títulos (H1, H2, H3): Gill Sans (ej. Semibold)

Cuerpo de texto: Gill Sans (ej. Regular)

Alternativa Web (Fallback): En caso de que la licencia de Gill Sans no esté disponible para uso web, se deberá utilizar una fuente sans-serif de alta legibilidad (ej. Montserrat o Lato desde Google Fonts) previa aprobación.

## 3. Requisitos funcionales y técnicos (resumen)

- Autenticación por email y contraseña; recuperación por email (SMTP configurable).
- Subida y visualización de rutas GPX; planificador con snap-to-road usando enrutador open-source.
- Puntos críticos con validación comunitaria (5 votos para eliminar).
- Sugerencias públicas con voto único por usuario.
- Gamificación: puntos por acciones, clasificación mensual, logros.
- Panel de administración con validación de rutas, gestión de usuarios y parámetros (ej. tamaño máximo GPX).

## 4. Entregables y criterios de aceptación (MVP)

- Registro/login funcional.
- Subida GPX y visualización en mapa.
- Creación de puntos críticos y sugerencias.
- Panel admin para validar rutas.
- Páginas estáticas: About, Ayuda, Aviso Legal/Privacidad.

## 5. Observaciones y próximos pasos

1. Obtener y adjuntar la guía de identidad corporativa oficial (PDF) para confirmar valores exactos (Pantone, CMYK, tipografías con licencias y normas de uso del logotipo).
2. Confirmar la tipografía web a usar y adquirir/solicitar la licencia de Gill Sans si se requiere usarla en producción.
3. Completar requisitos funcionales con flujos detallados y endpoints API.
4. Planificar sprints para el desarrollo del MVP.

---

Documento generado a partir del borrador suministrado por el equipo del proyecto.
