# ADR 0003 — El progreso se deriva de los módulos, nunca del formulario

- **Estado:** aceptado
- **Fecha:** 2026-08-01
- **Reglas que implementa:** [BR-10, BR-11, BR-14](../tesis/BR.md)

## Contexto

El dashboard mostraba una barra rotulada «Progreso del perfil» y, debajo, un carril de cuatro pasos
titulado «Tu flujo de recuperación». Ambos salían del mismo número: `calcularProgreso(perfil)`, que
cuenta **campos llenos del formulario de perfil**.

El efecto es que un paciente que llenó todos sus datos y no se ha tomado una sola pastilla aparece al
100 %, y uno que lleva seis semanas de adherencia perfecta pero dejó vacío el campo «municipio» aparece
a medias. La cifra más visible de la aplicación no medía la recuperación: medía la diligencia
rellenando un formulario.

Esto no es solo un detalle de interfaz. La tesis compromete un KPI concreto —**reducir ≥ 30 % la tasa de
abandono de tratamiento** (BR-14)— y describe el monitoreo como el módulo que «**reúne la información
generada por los demás módulos** (cumplimiento de medicamentos, asistencia a terapias, avance en
trámites) y la traduce en un panorama general del estado de recuperación» (`tesis.txt:365`). Un
porcentaje de formulario no puede sostener ninguna de las dos cosas, y es exactamente lo que los aliados
pagan por ver.

## Decisión

**Ninguna cifra que hable de recuperación puede calcularse a partir de completitud de formularios.**

El índice de recuperación se compone de señales observadas en los módulos:

| Señal | Origen | Qué mide |
|---|---|---|
| **Adherencia** | dosis marcadas vs. dosis programadas | cumplimiento farmacológico |
| **Asistencia** | citas completadas vs. citas vencidas | cumplimiento de terapias |
| **Ánimo** | registro emocional reciente | componente emocional |
| **Trámites** | pasos resueltos vs. aplicables | avance administrativo |
| **Reintegración** | hitos de retorno alcanzados | cierre del recorrido |

Reglas de cálculo:

1. **Una señal sin datos no cuenta como cero, se excluye del promedio.** Un cero y un «todavía no
   aplica» son cosas distintas; confundirlos castiga al paciente recién dado de alta justo el día que
   entra, y produce un falso «estancamiento» en la primera pasada.
2. **La ausencia de registro es información.** Una dosis no marcada es una dosis no tomada a efectos de
   adherencia — la tesis lo dice explícitamente: «cada dosis tomada **o no registrada** construye un
   historial de cumplimiento» (`tesis.txt:357`). Pero solo cuenta cuando su hora ya pasó.
3. **El completado del perfil sigue existiendo**, con su nombre real ("datos de tu perfil") y su lugar:
   la etapa de ingreso. Deja de disfrazarse de recuperación.

**La alerta al médico se deriva de estas mismas señales** (BR-11), de modo que lo que el paciente ve
como su progreso y lo que el médico ve como riesgo son **el mismo dato leído desde los dos lados**. Es
lo que hace que la notificación llegue «sin depender del reporte verbal del paciente en la próxima
consulta» (`tesis.txt:366`).

## Alternativas descartadas

**Mantener el porcentaje de perfil y añadir aparte el de recuperación.** Dos barras compitiendo por el
mismo sitio; la que primero se llena (la del formulario) se lleva la atención y el malentendido
permanece.

**Un índice ponderado con pesos clínicos.** Aparenta rigor que este proyecto no puede respaldar: la
tesis reconoce que falta validación clínica de los procesos (debilidad D5, `tesis.txt:124`). Un promedio
de las señales disponibles es más honesto y más fácil de defender.

## Consecuencias

**A favor.** El número que domina la pantalla vuelve a significar lo que dice. El panel del médico y el
institucional pueden construirse sobre la misma base sin cálculos paralelos. El KPI de abandono se
vuelve medible en producto.

**En contra.** Un paciente recién dado de alta ve poco progreso — correcto, pero exige que la etapa de
Ingreso comunique bien que aún no hay nada que medir, en lugar de mostrar un 0 % desalentador. Y obliga
a que los datos de demo tengan historial suficiente, porque sin dosis marcadas ni citas pasadas el
índice no tiene de dónde salir.
