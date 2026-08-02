# ADR 0002 — Un rol, un recorrido: navegación y panel por perfil

- **Estado:** aceptado
- **Fecha:** 2026-08-01
- **Reglas que implementa:** [BR-05, BR-06, BR-07, BR-08, BR-11](../tesis/BR.md)

## Contexto

Se planteó la pregunta de si una empresa, un médico, una ARS o una clínica «serían usuarios diferentes,
con opciones diferentes». **La tesis responde que sí, sin ambigüedad**, y el código respondía que no: no
existía el concepto de rol en ninguna parte.

Es una omisión con consecuencias económicas, no solo de interfaz. **Todo el ingreso del modelo B2B2C
proviene de perfiles que la aplicación no representaba** (BR-08): Médico Premium RD$590/mes, Centro
RD$3,540–9,440, Empresa RD$17,700, ARS RD$59,000. Además, una de las tres piezas del MVP declarado por
la tesis es literalmente «un **panel de seguimiento para el equipo médico tratante**» (BR-12), que no
existía.

## Decisión

Se introduce un rol de sesión (`src/lib/roles.ts`) con tres perfiles, cada uno con **su propia
navegación y su propio panel de entrada**:

| Rol | Entra viendo | Recorrido |
|---|---|---|
| **Paciente** | Dónde estoy hoy | Las 4 etapas del ADR 0001 |
| **Profesional de salud** | Sus alertas | Cartera → alertas → paciente → intervención |
| **Institución** (ARS · Empresa · Centro) | Su indicador | Indicador → población → caso |

El rol **no reordena** un menú común: lo sustituye. Un médico no tiene «Mi tratamiento» y un paciente no
tiene «Cartera».

**Cada panel de aliado abre por el indicador que ese aliado compra** (BR-07), no por una lista de
pacientes: adherencia para la ARS, ausentismo y retorno laboral para la empresa, ocupación y abandono
para el centro. El listado viene después, como forma de bajar del indicador al caso.

**El paciente no ve dinero.** Ni precios, ni planes, ni candados, ni funciones bloqueadas (BR-06). Los
planes solo se nombran dentro de los paneles de aliado.

**El vínculo entre roles es la alerta** (BR-11): lo que el paciente registra o deja de registrar produce
la alerta que el médico ve. Es el mecanismo que cierra el ciclo y lo que hace demostrable el valor del
plan Premium.

## Alternativas descartadas

**Un solo panel con secciones condicionadas por permisos.** Menos código, pero reproduce el problema
original: un cajón de herramientas donde cada quien busca la suya. Y difumina justo lo que hay que
enseñar — que cada aliado compra un producto distinto.

**Los cuatro perfiles de la ficha técnica** (añadiendo Familiar/cuidador). Descartado por rendimiento
decreciente: el familiar comparte ≈90 % de las pantallas del paciente y solo cambia en permisos de
edición. Queda documentado como extensión natural; el modelo de roles ya deja el hueco.

**Autenticación real por rol con usuarios distintos en base de datos.** Fuera del alcance de un MVP que
debe correr sin costo (ver `MEMORY.md`); la sesión actual es NextAuth con credenciales de demo. El rol
se selecciona explícitamente, lo que además hace la defensa más fácil de conducir.

## Consecuencias

**A favor.** El modelo de negocio se vuelve visible y demostrable: se puede enseñar de dónde sale cada
peso. Se cubre la pieza de MVP que faltaba (panel del médico tratante). Y la pregunta «¿son usuarios
diferentes?» se contesta mostrando, no explicando.

**En contra.** Triplica la superficie de navegación a mantener, y obliga a que los datos del paciente
sean legibles desde los otros dos roles — lo que exige que la demo tenga población suficiente para que
un panel agregado no se vea vacío (ver tarea de datos de demo). El cambio de rol es explícito y sin
autenticación diferenciada: es una **simulación honesta**, y así debe presentarse.
