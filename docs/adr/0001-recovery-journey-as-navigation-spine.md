# ADR 0001 — El recorrido de recuperación es la columna vertebral de la navegación

- **Estado:** aceptado
- **Fecha:** 2026-08-01
- **Reglas que implementa:** [BR-01, BR-02, BR-03, BR-04](../tesis/BR.md)

## Contexto

La revisión de producto arrojó que **no se percibe cuál es el flujo de la aplicación**. La analogía usada
fue un restaurante: se sienta, ordena, come, aprueba, pide la cuenta, paga y se va — un proceso con
inicio y final que cualquier software de restaurantes refleja sin esfuerzo. ReHub no transmitía nada
parecido.

El diagnóstico del código lo confirma:

- El menú era una **lista plana de nueve herramientas** (Inicio · Cuéntame · Mi perfil · Mi lesión ·
  Mi plan · Seguimiento · Recursos · Medicamentos · Cuenta) sin orden ni pertenencia a un momento.
- Ninguno de esos nueve nombres coincide con los **seis módulos** que la tesis define (BR-09).
- El "flujo de recuperación" del dashboard eran cuatro pasos (Perfil → Plan → Seguimiento → Recursos)
  calculados con `calcularProgreso(perfil)`, es decir el **porcentaje de campos llenos del formulario**.
- No existía noción de **etapa**, pese a que la tesis dice explícitamente que «el sistema activa solo los
  módulos de la etapa correspondiente» (BR-03).

La tesis sí tiene inicio y final perfectamente definidos: **el alta médica** y **la reintegración
laboral y social**. Simplemente no estaban en el producto.

## Decisión

El **recorrido de recuperación** —no el catálogo de funciones— es la estructura primaria de la
aplicación. Se modela una sola vez en `src/lib/journey.ts` y de ahí derivan el menú, el dashboard, el
estado de cada módulo y los paneles de aliado.

Cinco estados, con día 0 en `fechaAltaMedica`:

```
ALTA MÉDICA ──▶ ① Ingreso ──▶ ② Tratamiento ──▶ ③ Avance ──▶ ④ Reintegración ──▶ ALTA REHUB
   (día 0)       organizar      cumplir          sostener      volver             (se gradúa)
```

Consecuencias directas de la decisión:

1. **El menú se agrupa por etapa**, no por herramienta. Cada módulo aparece bajo el momento al que
   pertenece y muestra si está activo, pendiente o ya superado.
2. **El dashboard responde "¿dónde estoy?"**: etapa actual, qué toca hoy, y qué falta exactamente para
   pasar a la siguiente etapa.
3. **Se avanza por hitos, no por tiempo.** Cada etapa declara sus hitos y la transición ocurre cuando se
   cumplen. El tiempo transcurrido desde el alta solo *sugiere*; nunca empuja solo.
4. **Existe un final.** `alta_rehub` es un estado alcanzable que cierra el ciclo y presenta el resumen
   del recorrido. Sin final no hay flujo, solo uso indefinido.

## Alternativas descartadas

**Reordenar el menú actual y ponerle números.** Barato, pero cosmético: los nombres seguirían sin
corresponder a los módulos de la tesis y el progreso seguiría saliendo del formulario. No resuelve la
observación, la disimula.

**Un asistente lineal (wizard) que obligue a pasar por pasos.** Contradice BR-03 y BR-13: la recuperación
no es lineal (se recae, se reprograma una terapia) y forzar un orden añade fricción justo en «una etapa
que de por sí ya es pesada» (`tesis.txt:13`). El recorrido **orienta**, no bloquea: cualquier módulo
activo sigue siendo alcanzable.

**Etapas por tiempo desde el alta.** Simple de calcular, pero mentiría: dos pacientes con el mismo tiempo
transcurrido y adherencias opuestas verían la misma etapa. Contradice BR-10.

## Consecuencias

**A favor.** El producto se explica solo en la primera pantalla; la trazabilidad con los diez procesos
operativos de la tesis queda uno a uno (BR, §7); el estado del paciente se vuelve un dato de dominio real
y no un artefacto de interfaz — que es justo lo que los paneles de aliado necesitan vender.

**En contra.** Cada módulo nuevo debe declarar a qué etapa pertenece y qué hito aporta; hay que decidir
qué pasa con pantallas ya construidas que la tesis no nombra (Cuéntame, Mi lesión, Recursos): se
conservan, pero **subordinadas** a la etapa donde aportan, sin ocupar un lugar propio en el primer nivel
del menú.
