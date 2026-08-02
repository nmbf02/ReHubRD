/**
 * Qué cuentas pueden emitir recetas. **Solo servidor.**
 *
 * El selector «Estás viendo ReHub como» es un artefacto de presentación: vive
 * en `localStorage` y sirve para enseñar los tres productos con una sola
 * sesión. No es un permiso, y tratarlo como tal dejaría la puerta abierta —
 * estando en el rol «paciente» se podía emitir una receta de morfina firmada
 * con cualquier nombre, porque la API solo comprobaba que hubiera sesión.
 *
 * El permiso de verdad se decide aquí, contra la identidad de la sesión, que el
 * navegador no puede alterar.
 *
 * Para el MVP la lista va en `REHUB_DOCTOR_EMAILS` (separada por comas). En
 * producción esto sería una columna `role` en `users` alimentada por un alta
 * con verificación del exequátur profesional; la forma de la comprobación no
 * cambiaría, solo su origen.
 */

export function isDoctorAccount(email?: string | null): boolean {
  if (!email) return false;
  const permitidas = (process.env.REHUB_DOCTOR_EMAILS ?? "")
    .split(",")
    .map((entrada) => entrada.trim().toLowerCase())
    .filter(Boolean);
  return permitidas.includes(email.trim().toLowerCase());
}
