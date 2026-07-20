# 0001 — Recordatorios de medicamentos desde foto de receta (MVP slice 1)

**Estado:** bloqueado (locked) · construido en esta rama · pendiente de verificación E2E manual
**Gear:** SINGLE-CONCERN (una área, on-device, sin superficie de riesgo) — el PROGRAMA es FULL-ORCHESTRATOR, pero este slice no.
**Fecha:** 2026-07-20

---

## Contexto del programa (el fence)

ReHub MVP es un programa de ~7 capacidades (muñeco→lesiones · médicos de tu centro ·
consulta del doctor · receta foto→IA→recordatorios · receta-QR verificable ·
farmacias+transporte con datos reales + orientación seguro/gobierno · checklists +
agenda). Es multi-área, con PHI y roles → **no se bloquea como un solo problema
testeable**. Se fija el límite del programa y se define/construye **un slice a la vez**.

**Decisiones del /define (confirmadas por Felix):**
1. Alcance → programa + primer slice.
2. Base → **evolucionar ReHubRD** (no greenfield).
3. Datos clínicos → Felix eligió "asumir PHI ya"; **pero** ante la restricción dura de
   **costo cero (proyecto de tesis, no puede costar dinero ni en el piloto)** se
   acordó el camino recomendado: **slice 1 clínico-mínimo (on-device)** y **asumir
   PHI en el slice 2** (receta-QR / consulta del doctor), donde el PHI de verdad hace falta.
4. Primer slice → **recordatorios de medicamentos desde foto de receta**.

---

## Problema (una frase)

Tras el alta, la persona olvida tomas o pierde el hilo de su receta; el slice 1 debe
convertir la receta (foto o entrada manual) en un **horario de medicamentos con
recordatorios**, **100% en el dispositivo y sin costo** — orientación, no atención clínica.

## Criterios de aceptación (testeables)

1. Existe una ruta protegida `/dashboard/medications` (en `ROUTES`, en la nav, bajo el guard de `dashboard/layout`).
2. El usuario puede **subir/tomar una foto** de la receta y verla en preview.
3. Un botón **"Auto-rellenar desde la foto"** corre OCR **en el navegador** (Tesseract.js, gratis) y produce **candidatos** de medicamento (nombre/dosis/frecuencia) que el usuario **confirma** antes de guardar (nunca auto-guarda).
4. El usuario puede **agregar/editar/quitar** un medicamento manualmente (nombre, dosis, frecuencia→horas, con comida, notas); las horas se calculan de la frecuencia (`timesForDosesPerDay`).
5. Los medicamentos **persisten entre recargas** en `localStorage` por usuario (`rehub-medicamentos-<userId>`), sin llamadas a servidor.
6. Con "Activar recordatorios", la app **notifica a la hora de cada toma** vía Notification API mientras la app está abierta (pide permiso; si se niega, cae a alert).
7. La pantalla muestra el **disclaimer** (no reemplaza al médico) y la **nota de privacidad** (solo en este dispositivo).
8. `npm run build` pasa (typecheck + lint).

## No-metas (fence anti-scope-creep)

- **Sin servidor, sin base de datos, sin PHI en la red.** (Persistencia de salud en servidor = slice 2, con ADR.)
- **Sin API de pago** (visión/OCR en la nube, etc.). OCR es client-side y gratis.
- Sin compartir la receta, sin **QR verificable**, sin consulta del doctor (slice 2+).
- Sin recetas **controladas** (vía legal física).
- Sin sincronización entre dispositivos (consecuencia de on-device).
- Sin recordatorios en background garantizados (limitación web sin push server; honesto en el copy).

## Contratos tocados / ADR

- Consume las convenciones del repo (`docs/rehub-architecture-and-nextjs-decisions.md`):
  rutas en `ROUTES`, copy en `messages/`, código en inglés, guard por layout, stores `*-store.ts` en localStorage. **No cambia ninguna decisión bloqueada.**
- **No gatilla ADR** en este slice (sigue el patrón on-device existente).
- **Gatillará ADR en slices futuros** (registrar loudly): ADR-001 persistencia de PHI, ADR-002 auth real + roles/RBAC, ADR-003 QR público/privacidad. No hay `docs/adr/` aún — crear cuando llegue el slice 2.

## Notas de implementación (lo construido)

- `src/lib/medications-store.ts` — store on-device (get/save/upsert/remove + evento).
- `src/lib/medication-schedule.ts` — `timesForDosesPerDay`, `nextTimeOccurrence`, `parsePrescriptionText` (parser heurístico, asistido, el usuario confirma).
- `src/components/dashboard/MedicationsView.tsx` — foto + OCR lazy (`import("tesseract.js")`) + candidatos + form + horario + recordatorios.
- `src/app/dashboard/medications/page.tsx` — página server con guard.
- `routes.ts`, `DashboardNav.tsx`, `messages/es.json` — registro (ruta/nav/i18n).
- Dep nueva: `tesseract.js` (gratis, cargada de forma lazy → fuera del bundle inicial).

## Abiertas / parqueadas (de los espejos, para slices futuros)

- Muñeco→médicos: catálogo de médicos por centro (pregunta B del intake).
- Receta-QR: foto vs estructurada, qué ve quien escanea (privacidad), verificación de identidad del doctor.
- Seguros: guía estática vs avisos con fecha.
