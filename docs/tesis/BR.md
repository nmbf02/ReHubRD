# ReHub — Reglas de negocio (BR) extraídas de la tesis

**Fuente única.** `REHUB_PROYECTODEGRADO_BORRADORFINAL.docx` (borrador final, 2026-08-01), extraído a `tesis.txt`.
Cada regla cita la línea de `tesis.txt` que la sostiene. Si el documento y el código discrepan, **manda el documento**.

**Para qué existe este archivo.** El producto se estaba construyendo como una caja de herramientas
(nueve pantallas sueltas) cuando el documento describe un **proceso con inicio y final**. Estas reglas
son el contrato que vuelve a alinear la aplicación con lo que la tesis defiende.

---

## 1. El recorrido

### BR-01 — El flujo empieza en el alta médica
El punto de entrada al producto no es "registrarse": es **salir del hospital**.
Quien registra al paciente puede ser el propio paciente, un familiar o el personal de una institución
aliada, «al momento del alta, ingresando datos básicos, tipo de accidente e indicaciones médicas».
→ `tesis.txt:355`

La app ya guarda `fechaAltaMedica` en `SituacionAccidente`; es el **día 0** del recorrido.

### BR-02 — El flujo termina en la reintegración laboral y social
El producto acompaña «desde el alta médica hasta su reintegración laboral y social».
Existe un final: el paciente **se gradúa** de ReHub. → `tesis.txt:352`, `tesis.txt:12`

### BR-03 — La etapa decide qué módulos se ven
«El sistema activa **solo los módulos de la etapa correspondiente**» y ofrece acompañamiento guiado
durante las primeras semanas. → `tesis.txt:355`

Es la regla más importante para la interfaz: **el menú no es un catálogo, es la etapa en la que estás.**
El diseño modular existe justamente para que el paciente «active solo las funciones que le hacen falta
según el momento en que se encuentra … sin sentirla como una carga más en una etapa que de por sí ya es
pesada». → `tesis.txt:13`

### BR-04 — Las etapas del recorrido
El documento no numera las etapas, pero las describe en el orden de sus procesos operativos
(`tesis.txt:354-366`). Se fijan cuatro, más el estado final:

| # | Etapa | Qué se hace | Módulos activos |
|---|---|---|---|
| 1 | **Ingreso** (alta) | Organizar lo que traes del hospital | Medicamentos, Citas, Trámites |
| 2 | **Tratamiento** | Cumplir: dosis, terapias, ánimo | + Salud emocional, Progreso |
| 3 | **Avance** | Sostener y medir la mejoría | Todos |
| 4 | **Reintegración** | Volver al trabajo y a la vida | + Reintegración |
| — | **Alta ReHub** | Recuperación completada | Resumen del recorrido |

---

## 2. Los actores

### BR-05 — Cuatro perfiles de usuario
«Paciente en recuperación, familiar o cuidador, profesional de salud (médico, fisioterapeuta,
psicólogo) e institución (aseguradora, empleador, clínica)». → `tesis.txt:154`

El sistema «permite gestionar los usuarios internos, definir los **roles y permisos de acceso**
(paciente, familiar, profesional de salud, institución)». → `tesis.txt:374`

**Decisión de alcance MVP:** tres perfiles con panel propio — Paciente, Profesional de salud e
Institución. El familiar comparte el panel del paciente (≈90 % de las pantallas) y queda documentado
como extensión.

### BR-06 — El paciente nunca paga
«Acceso gratuito y completo para el paciente, financiado por médicos e instituciones mediante planes
Premium». La gratuidad total es el gancho de adopción masiva. → `tesis.txt:151`, `tesis.txt:263`

**Corolario de interfaz:** al paciente **no se le muestra jamás** un precio, un plan, un candado ni un
*upsell*. Cualquier mención de plan Premium vive en los paneles de aliado.

### BR-07 — Cada aliado compra un indicador propio
«Cada aliado adquiere el servicio porque mejora un indicador propio: **adherencia, ocupación de agenda,
siniestralidad o ausentismo laboral**». → `tesis.txt:170`

Es lo que cada panel institucional debe enseñar de primero — no una lista de pacientes.

### BR-08 — Planes y precios de los aliados
→ `tesis.txt:267-273`

| Plan | Total mensual (RD$) | Funcionalidad que compra |
|---|---|---|
| Médico Premium | 590 | Historial del paciente, reportes automáticos, alertas por incumplimiento |
| Centro de rehabilitación | 3,540 – 9,440 | Panel institucional, grupos de pacientes, reportes agregados |
| Empresa | 17,700 | Reintegración laboral de accidentados, panel de RR. HH. |
| ARS / Aseguradora | 59,000 | Adherencia de asegurados, indicadores, gestión de siniestros |
| Laboratorio | 23,600 | Publicidad patrocinada segmentada |
| Comisión por cita | 177 / reserva | Gestión de la reserva (no mensual) |

---

## 3. Los seis módulos

### BR-09 — Módulos funcionales
«Seguimiento de medicamentos, gestión de citas y terapias, acompañamiento psicológico, orientación
administrativa, monitoreo del progreso y reintegración laboral y social». → `tesis.txt:156`

| # | Módulo | Regla operativa | Fuente |
|---|---|---|---|
| 1 | **Medicamentos** | El paciente carga nombre, dosis, frecuencia y duración; el sistema organiza horarios y recuerda. Cada dosis **tomada o no registrada** construye un historial de cumplimiento. | `357` |
| 2 | **Citas y terapias** | Registra fecha, hora y profesional; recordatorio previo para reducir ausentismo. Estado: pendiente / completada / reprogramada. Alimenta el módulo de progreso. | `359` |
| 3 | **Salud emocional** | Recursos de apoyo y conexión con profesional aliado, sin costo. **No reemplaza la atención presencial.** | `361` |
| 4 | **Trámites y seguros** | Pasos ante la aseguradora, documentos que suele requerir cada reclamación, orientación según aseguradora o empleador. Se conecta al panel institucional. | `363` |
| 5 | **Monitoreo de progreso** | **Agrega** cumplimiento de medicamentos + asistencia a terapias + avance en trámites en un panorama del estado de recuperación. Gratis para el paciente; visible al médico con plan Premium. | `365` |
| 6 | **Reintegración laboral y social** | Ayuda para volver al trabajo y a la vida normal. Es la etapa final del recorrido. | `156`, `12` |

### BR-10 — El progreso se calcula de datos reales, nunca de campos llenos
El monitoreo «reúne la información generada por los demás módulos … y la traduce en un panorama general
del estado de recuperación». → `tesis.txt:365`

**Prohibido** derivar el avance de la recuperación del porcentaje de formulario completado.

### BR-11 — Alerta automática al médico tratante
«Cuando detecta incumplimiento o estancamiento, el sistema **notifica automáticamente al médico
tratante** para que intervenga a tiempo, **sin depender del reporte verbal del paciente** en la próxima
consulta». → `tesis.txt:366`; también `357` (alertas ante incumplimientos reiterados).

Éste es el mecanismo que cierra el ciclo paciente ↔ médico y el que justifica el plan de RD$590.

---

## 4. Alcance del MVP

### BR-12 — El MVP son tres funcionalidades
«Un Producto Mínimo Viable centrado en tres funcionalidades: **recordatorios de medicamentos, gestión de
citas y terapias, y un panel de seguimiento para el equipo médico tratante**. Los módulos restantes
(apoyo psicológico, orientación administrativa y monitoreo del progreso) se incorporarán de forma
escalonada». → `tesis.txt:348`

Reforzado por la estrategia DA1: «Lanzar un MVP con las funcionalidades esenciales (seguimiento de
medicamentos, citas y terapias) para **evitar el abandono por complejidad**». → `tesis.txt:128`

> **Nota de alcance de esta entrega.** Se construyen los seis módulos con lógica real —decisión tomada
> por encima del mínimo del documento— para que la defensa muestre el recorrido completo de punta a
> punta. Los tres del MVP son los que llevan la profundidad clínica; los otros tres quedan funcionales
> pero simples.

### BR-13 — Onboarding guiado, sin fricción, desde el primer día
Estrategia DO1: «onboarding guiado, tutoriales cortos y una interfaz intuitiva que permita al paciente
comenzar a usar la plataforma **desde el primer día post-alta sin fricción**». → `tesis.txt:126`

Meta declarada: adaptación en **≤ 2 horas** por usuario y ≥ 80 % de satisfacción. → `tesis.txt:136`

---

## 5. Indicadores que el producto debe poder enseñar

### BR-14 — KPIs comprometidos
→ `tesis.txt:136-139`

| Objetivo | Indicador | Meta |
|---|---|---|
| Facilitar el uso desde el alta | Satisfacción / tiempo de adaptación | ≥ 80 % · ≤ 2 h |
| Plataforma estable | Uptime / incidencias críticas | ≥ 99 % · < 2 al mes |
| **Reducir el abandono de tratamientos** | Tasa de abandono / cumplimiento de terapias | **≥ 30 % de reducción en 3–6 meses** |
| Expandir por alianzas | Usuarios activos / convenios | 1,000 usuarios · ≥ 5 convenios (año 1) |

Evidencia de la encuesta que el producto debe atacar de frente (n = 383):
- **80 %** no recibió ningún seguimiento tras el alta. → `tesis.txt:210`
- **70 %** percibe el abandono terapéutico como habitual. → `tesis.txt:45`
- **35 %** eligió recordatorios de medicamentos como el módulo más útil. → `tesis.txt:40`
- **85 %** valora algún nivel de integración con el equipo médico. → `tesis.txt:50`

---

## 6. Reglas transversales

### BR-15 — Datos clínicos protegidos (Ley 172-13)
Controles de acceso, cifrado y respaldo. «**Ningún módulo** de la plataforma puede operar sin que este
proceso de fondo garantice que la información del paciente se maneje de forma segura». → `tesis.txt:375`

### BR-16 — Publicidad siempre identificada y nunca clínica
Los espacios patrocinados van «claramente identificados como contenido patrocinado» y **no intervienen
en ningún momento en las decisiones médicas ni en la prescripción**. → `tesis.txt:370`

### BR-17 — Comisión por reserva, nunca al paciente
Al agendar con un centro aliado, el sistema registra la reserva, gestiona la confirmación y calcula la
comisión pactada, «**sin ningún costo adicional para el paciente**». → `tesis.txt:372`

### BR-18 — Contexto dominicano
Orientación sobre aseguradoras, trámites y proveedores **del país**; en español; pensada para el sistema
de salud dominicano. → `tesis.txt:167`, `tesis.txt:283`

---

## 7. Trazabilidad: proceso de la tesis → superficie de la app

| Proceso operativo (tesis §4.3) | Dónde vive en la app |
|---|---|
| Alta e incorporación del paciente `355` | Etapa 1 · Ingreso |
| Seguimiento de medicamentos `357` | Módulo 1 |
| Gestión de citas y terapias `359` | Módulo 2 |
| Apoyo en salud emocional `361` | Módulo 3 |
| Orientación en trámites y seguros `363` | Módulo 4 |
| Monitoreo de progreso y notificación al médico `365-366` | Módulo 5 + panel del médico |
| Gestión de alianzas institucionales `368` | Panel institucional |
| Publicidad patrocinada `370` | BR-16 (fuera del MVP) |
| Reservas con comisión `372` | Módulo 2 + panel institucional |
| Administración del sistema y protección de datos `373-375` | Roles y permisos · BR-15 |
