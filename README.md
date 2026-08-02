# ReHubRD

Proyecto Next.js (+TypeScript) para una plataforma de acompañamiento post-accidente llamada ReHubRD.

Este repositorio contiene la aplicación frontend (Next 14) con rutas de dashboard, login, registro y componentes reutilizables. Incluye una implementación de autenticación demo con `next-auth` y una pequeña lógica para crear recordatorios en sesión.

---

## El recorrido de recuperación

La aplicación está organizada como **un proceso con inicio y final**, no como un catálogo de
herramientas. El inicio es el **alta médica** y el final es la **reintegración laboral y social**, tal
como los define la tesis:

```
ALTA MÉDICA ──▶ ① Ingreso ──▶ ② Tratamiento ──▶ ③ Avance ──▶ ④ Reintegración ──▶ ALTA REHUB
   (día 0)       organizar      cumplir          sostener      volver             (se gradúa)
```

De esa estructura derivan el menú, el dashboard y los paneles de aliado. Se avanza **cumpliendo
hitos**, no dejando pasar el tiempo, y el índice de recuperación sale de los datos de los módulos
(dosis marcadas, terapias asistidas, trámites resueltos) — nunca del porcentaje de un formulario.

**Los seis módulos** de la ficha técnica: Medicamentos · Citas y terapias · Trámites y seguros ·
Salud emocional · Monitoreo de progreso · Reintegración. Cada uno se activa en la etapa que le toca.

**Tres perfiles**, cada uno con su propia navegación y su propio panel de entrada:

| Rol | Entra viendo | Ruta |
|---|---|---|
| Paciente | Dónde estoy hoy | `/dashboard` |
| Profesional de salud | Sus alertas | `/dashboard/alerts` |
| Institución (ARS · Empresa · Centro) | Su indicador | `/dashboard/institution` |

Se alterna entre ellos con el selector «Estás viendo ReHub como» de la barra lateral.

> **Documentación de referencia.** Las reglas de negocio extraídas de la tesis están en
> [`docs/tesis/BR.md`](docs/tesis/BR.md), con la línea exacta del documento que sostiene cada una.
> Las decisiones de arquitectura, en [`docs/adr/`](docs/adr/).

### Datos de demostración

Una aplicación vacía no puede enseñar un flujo. En **Cuenta → Modo demostración** hay un botón que
carga un caso a mitad de recuperación (47 días desde el alta, adherencia ~78 %, siete terapias
completadas) que queda **a una sola terapia** de pasar a Reintegración: al marcarla, el recorrido
cambia de etapa en vivo. Los paneles de médico e institución traen su propia población, y el paciente
de la sesión aparece dentro de la cartera del médico.

---

## Características principales

- Panel del paciente (`/dashboard`) organizado por el recorrido de recuperación.
- Paneles de aliado: alertas y cartera del médico tratante, indicadores institucionales.
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
| Roles | 3 perfiles con navegación y panel propios (paciente · médico · institución), alternables con un selector | RBAC real: cada perfil entra con su propia cuenta, + enfermera y farmacia |
| Compartir tratamiento | QR con un resumen legible del tratamiento — **no verifica autoría ni sustituye la receta** | Receta emitida por el médico desde su cuenta, firmada en servidor, con identificador opaco y anulable |
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

Dos cuentas, porque **son dos permisos distintos**:

| Cuenta | Usuario / clave | Puede |
|---|---|---|
| Paciente | `nathaly` / `welcome` | Todo el recorrido; **ver** los tres paneles con el selector de rol |
| Profesional de salud | `demo@rehub.do` / `demo123` | Lo anterior **y emitir recetas** |

El selector «Estás viendo ReHub como» sirve para **ver** los tres productos con una sola sesión —es
lo que hace demostrable el modelo B2B2C—, pero **no otorga permisos**: vive en `localStorage` y el
navegador puede cambiarlo. Emitir una receta exige que la cuenta esté en `REHUB_DOCTOR_EMAILS`, lo
que se comprueba en el servidor. Con la cuenta de paciente, la API responde `403` y la pantalla
explica por qué.

En producción esto sería una columna `role` en `users`, alimentada por un alta con verificación del
exequátur profesional; la forma del control no cambiaría, solo su origen.

> **Sin base de datos** (por ejemplo en local, donde `DATABASE_URL` puede no responder) el login cae
> a la cuenta de demostración y las recetas emitidas no están disponibles: necesitan servidor.

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