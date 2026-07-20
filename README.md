# ReHubRD

Proyecto Next.js (+TypeScript) para una plataforma de acompañamiento post-accidente llamada ReHubRD.

Este repositorio contiene la aplicación frontend (Next 14) con rutas de dashboard, login, registro y componentes reutilizables. Incluye una implementación de autenticación demo con `next-auth` y una pequeña lógica para crear recordatorios en sesión.

---

## Características principales

- Panel de usuario (`/dashboard`) con flujo: Perfil → Plan → Seguimiento → Recursos.
- Componentes reutilizables para UI y navegación (`src/components/*`).
- Autenticación demo con `next-auth` (Credentials provider) para desarrollo.
- Módulo de `SugerenciasRecordatorios` que permite programar recordatorios en sesión (usa `sessionStorage` y la Notification API cuando el navegador lo permite).
- **Recordatorios de medicamentos** (`/dashboard/medications`): foto de la receta → OCR en el navegador (Tesseract.js, gratis) → horario con recordatorios, guardado solo en el dispositivo.
- Guías y recursos agrupados para apoyo post-accidente.

---

## Modo demo (gratis) vs. modo real (producción)

**Estado actual — demo de tesis, costo $0.** Esta versión está pensada para funcionar **gratis** durante la presentación del proyecto, con la computadora encendida, usando solo herramientas sin costo: Next.js, OCR en el navegador (Tesseract.js), `localStorage`, Notification API y `npm run dev` (o Vercel Hobby). **No requiere** servidor de datos, APIs de pago ni infraestructura externa. Las limitaciones de este modo (recordatorios solo mientras la app está abierta, datos solo en el dispositivo) son aceptables para el piloto/demo.

**Puede convertirse a modo real/pago.** El diseño es incremental: cada decisión "gratis" tiene su equivalente de producción. Se activa cada fila cuando el producto pase de piloto a producción.

| Área | Demo (gratis, actual) | Modo real / pago (producción) |
|---|---|---|
| Hosting | PC encendida · `npm run dev` · Vercel Hobby | Vercel Pro o servidor dedicado (siempre disponible) |
| Persistencia | `localStorage` (solo en el dispositivo) | Postgres (Neon) en servidor, cifrado + respaldo |
| Datos clínicos (PHI) | No se guardan en servidor (on-device) | Servidor con consentimiento, auditoría y retención (requiere ADR + revisión legal) |
| Autenticación | `next-auth` demo (Credentials + JWT) | OAuth + cookies httpOnly + refresh + verificación de identidad del médico |
| Roles | 1 rol (paciente) | RBAC: paciente · doctor · enfermera · farmacia |
| OCR de receta | Tesseract.js en el navegador (gratis; mejor con recetas impresas) | API de visión en la nube (Google Vision / GPT-4o), más precisa — de pago |
| Recordatorios | Notification API mientras la app está abierta | Web Push + Service Worker + cron en servidor → notifican con la app cerrada |
| Datos externos | `datos.gob.do` (abierto) + curaduría manual | + Google Places (con cuota), convenios de datos |
| Funciones futuras | — | Receta-QR verificable · consulta del médico · muñeco → médicos por centro (slices posteriores) |

---

## Requisitos

- Node.js 18+ (recomendado)
- npm o pnpm

---

## Instalación (local)

1. Clona el repositorio:

```bash
git clone <repo-url> rehud-rd
cd ReHubRD
```

2. Instala dependencias (elige `npm` o `pnpm`):

```bash
npm install
# o
pnpm install
```

3. Crear archivo de entorno local `.env.local` con las variables mínimas para desarrollo:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-please-change
AUTH_DEMO_EMAIL=demo@rehub.do
AUTH_DEMO_PASSWORD=demo123
```

4. Ejecutar en modo desarrollo:

```bash
npm run dev
# o
pnpm dev
```

Abre `http://localhost:3000` en el navegador.

---

## Credenciales de demo

- Email: `demo@rehub.do`
- Password: `demo123`

Usa estas credenciales en la pantalla de login (ruta `/login`) para probar la sesión demo del proyecto.

---

## Arquitectura y archivos relevantes

- `src/app/` — Rutas de Next.js (app router). Rutas principales:
	- `app/page.tsx` — Landing
	- `app/login/page.tsx` — Inicio de sesión
	- `app/registro/page.tsx` — Registro
	- `app/dashboard/` — Dashboard y subrutas (perfil, plan, recursos, seguimiento, cuenta)
- `src/components/` — Componentes UI y específicos del dashboard (`InicioDashboard`, `SugerenciasRecordatorios`, `FlujoPersonalizadoView`, etc.)
- `src/lib/` — Lógica de negocio, stores y utilidades (perfil-store, cuenta-store, opciones-necesidades, recursos-guias, auth config)
- `src/components/ui/Icons.tsx` — Iconos compartidos
- `src/app/api/auth/[...nextauth]/route.ts` — Endpoint de `next-auth`

---

## Detalles de implementación

- Autenticación: Se usa `next-auth` con `CredentialsProvider`. En desarrollo las credenciales están validadas contra variables de entorno (`AUTH_DEMO_EMAIL`, `AUTH_DEMO_PASSWORD`).
- Sesión: estrategia `jwt` (ver `src/lib/auth.ts`). Asegúrate de definir `NEXTAUTH_SECRET` en producción.
- Recordatorios: `SugerenciasRecordatorios` permite crear recordatorios en `sessionStorage` y usa `setTimeout` para disparar notificaciones. Esto es una solución en sesión — para recordatorios persistentes/servidor se debe integrar una cola backend o servicio (e.g., cron, push notifications, Firebase, o un worker).

---

## Problemas conocidos y notas

- El componente de recordatorios utiliza la Notification API y `sessionStorage`. En entornos donde las notificaciones estén deshabilitadas aparecerá un `alert` como fallback.
- La autenticación demo no es segura para producción. Reemplaza la validación por una base de datos y hashing de contraseñas antes de desplegar.
- Revisar variables de entorno antes de desplegar: `NEXTAUTH_URL` y `NEXTAUTH_SECRET` son necesarias para `next-auth`.

---

## Cómo contribuir

1. Crea una rama feature/bugfix a partir de `main`.
2. Haz cambios y agrega tests si corresponde.
3. Abre un pull request describiendo los cambios.