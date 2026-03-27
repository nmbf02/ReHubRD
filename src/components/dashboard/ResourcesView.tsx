"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconClipboard, IconRefresh } from "@/components/ui/Icons";
import {
  GUIAS_APOYO,
  SECCIONES_RECURSOS,
} from "@/lib/resources-guide";
import { ESCENARIOS } from "@/lib/scenary-workflow";
import { ROUTES, hrefResourcesGuide } from "@/lib/routes";
import { SitiosCercanosView } from "./ClosePlacesView";

interface Props {
  userId?: string | null;
}

export function RecursosView({ userId }: Props) {
  const searchParams = useSearchParams();
  const guiaId = searchParams.get("guia");
  const guiaSeleccionada =
    guiaId && guiaId in GUIAS_APOYO ? guiaId : null;
  const guia = guiaSeleccionada ? GUIAS_APOYO[guiaSeleccionada] : null;

  return (
    <div className="space-y-8">
      {/* Flujo de recuperación */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider">
            Tu flujo de recuperación
          </h2>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              href={ROUTES.profile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              1. Mi perfil
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href={ROUTES.plan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              2. Mi plan
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href={ROUTES.followup}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              3. Seguimiento
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-primary/15 text-rehub-primary border border-rehub-primary/30 text-sm font-medium">
              4. Recursos
            </span>
          </div>
        </div>
      </section>

      {/* Mensaje de apoyo */}
      <div className="bg-gradient-to-r from-rehub-primary/10 to-rehub-accent/10 rounded-2xl border border-rehub-primary/20 p-6 lg:p-8">
        <p className="text-lg font-medium text-rehub-dark">
          ReHub está aquí para <strong>guiarte</strong>. 24 situaciones con
          pasos concretos: transporte, medicamentos, estás sola o solo, trámites,
          fisioterapia, derechos laborales, dormir, dolor, emergencias y más.
        </p>
      </div>

      {/* Guía: Flujos por situación */}
      <section id="flujos-guia" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden scroll-mt-6">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark flex items-center gap-2">
            <span>🗺️</span> Guía: ¿Qué hacer según tu situación?
          </h2>
          <p className="mt-2 text-sm text-rehub-dark/70">
            Si te sientes mal, no puedes caminar, no tienes medicamentos o estás sola/o:
            ReHub te da un <strong>plan con pasos concretos</strong> y sugiere cuándo hacer seguimiento.
            Haz un check-in en Seguimiento para ver tu flujo personalizado.
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ESCENARIOS.filter((e) => e.id !== "general").map((esc) => (
              <Link
                key={esc.id}
                href={ROUTES.followup}
                className={`flex flex-col p-5 rounded-xl border text-left transition-all hover:shadow-md ${
                  esc.prioridad === "urgente"
                    ? "bg-red-50/60 border-red-200 hover:border-red-300"
                    : "bg-slate-50/50 border-slate-200/80 hover:border-rehub-primary/30 hover:bg-rehub-primary/5"
                }`}
              >
                <span className="text-2xl mb-2">{esc.emoji}</span>
                <h3 className="font-semibold text-rehub-dark">{esc.nombre}</h3>
                <p className="text-xs text-rehub-dark/70 mt-1 line-clamp-2">
                  {esc.descripcion}
                </p>
                <p className="text-xs text-rehub-dark/50 mt-2">
                  Seguimiento: {esc.frecuenciaSeguimiento}
                </p>
                <span className="mt-3 text-sm font-medium text-rehub-primary">
                  Ir a Seguimiento para mi plan →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-slate-100/80 border border-slate-200/80">
            <p className="text-sm text-rehub-dark/80">
              <strong>¿Cómo funciona?</strong> En <Link href={ROUTES.followup} className="text-rehub-primary hover:underline">Seguimiento</Link> indicas cómo te sientes (1-5), tu movilidad y si tienes acceso a medicamentos.
              ReHub detecta tu situación y te muestra un plan con pasos concretos (llamar 811, ver guías, etc.) y la frecuencia de check-in sugerida.
            </p>
          </div>
        </div>
      </section>

      {/* ¿Qué necesitas? */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            ¿Qué necesitas ahora?
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            24 situaciones · Selecciona la tuya para ver pasos concretos y recursos
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECCIONES_RECURSOS.map((sec) => {
              const isActive = guiaSeleccionada === sec.id;
              const href = isActive
                ? ROUTES.resources
                : hrefResourcesGuide(sec.id);
              return (
                <Link
                  key={sec.id}
                  href={href}
                  className={`flex flex-col items-start p-5 rounded-xl border text-left transition-all ${
                    isActive
                      ? "bg-rehub-primary/10 border-rehub-primary/40 ring-2 ring-rehub-primary/20"
                      : "bg-slate-50/50 border-slate-200/80 hover:border-rehub-primary/30 hover:bg-rehub-primary/5"
                  }`}
                >
                  <span className="text-2xl mb-3">{sec.emoji}</span>
                  <h3 className="font-semibold text-rehub-dark">{sec.titulo}</h3>
                  <p className="text-sm text-rehub-dark/60 mt-1">{sec.resumen}</p>
                  <span className="mt-3 text-sm font-medium text-rehub-primary">
                    {isActive ? "▲ Ver guía arriba" : "Ver guía ↓"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guía expandida */}
      {guia && (
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
            <Link
              href={ROUTES.resources}
              className="text-sm text-rehub-primary hover:underline"
            >
              ← Ver todas las opciones
            </Link>
            <h2 className="text-lg font-semibold text-rehub-dark mt-4">
              {guia.titulo}
            </h2>
            <p className="mt-1 text-sm text-rehub-dark/70">{guia.descripcion}</p>
          </div>
          <div className="p-6 lg:p-8 space-y-6">
            {guia.pasos && guia.pasos.length > 0 && (
              <div>
                <h3 className="font-semibold text-rehub-dark mb-3">
                  Pasos y opciones
                </h3>
                <ol className="space-y-3">
                  {guia.pasos.map((paso, i) => (
                    <li
                      key={i}
                      className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-rehub-primary/20 text-rehub-primary font-semibold text-sm">
                        {i + 1}
                      </span>
                      <span className="text-sm text-rehub-dark/90">{paso}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {guia.contactos && guia.contactos.length > 0 && (
              <div>
                <h3 className="font-semibold text-rehub-dark mb-3">
                  Contactos útiles
                </h3>
                <div className="flex flex-wrap gap-3">
                  {guia.contactos.map((c) => (
                    <a
                      key={c.nombre}
                      href={
                        c.tipo === "tel"
                          ? `tel:${c.valor.replace(/\D/g, "")}`
                          : c.tipo === "web"
                            ? (c.valor.startsWith("http") ? c.valor : `https://${c.valor}`)
                            : "#"
                      }
                      target={c.tipo === "web" ? "_blank" : undefined}
                      rel={c.tipo === "web" ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rehub-primary/10 text-rehub-primary rounded-lg font-medium hover:bg-rehub-primary/20 transition-colors"
                    >
                      {c.nombre}: {c.valor}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {guia.nota && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Nota:</strong> {guia.nota}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ayuda gratuita */}
      <section id="ayuda-gratuita" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden scroll-mt-6">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark flex items-center gap-2">
            <span>🎁</span> Ayuda gratuita
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Servicios y programas sin costo en República Dominicana
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <h3 className="font-semibold text-rehub-dark">Salud mental</h3>
              <p className="text-sm text-rehub-dark/70 mt-1">
                Líneas 811 y 809-200-1400: atención psicológica gratuita, confidencial. Psicólogos disponibles.
              </p>
              <a href="tel:811" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline">
                Llamar al 811
              </a>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <h3 className="font-semibold text-rehub-dark">Medicamentos</h3>
              <p className="text-sm text-rehub-dark/70 mt-1">
                Promese/CAL y programa Pausam: medicamentos gratuitos en hospitales públicos para personas sin protección social.
              </p>
              <p className="mt-2 text-xs text-rehub-dark/60">
                Pregunta en tu centro de salud más cercano.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <h3 className="font-semibold text-rehub-dark">Atención médica pública</h3>
              <p className="text-sm text-rehub-dark/70 mt-1">
                Hospitales y centros de salud del MSP ofrecen consultas. Si cotizas al SDSS, tu ARS cubre según tu plan.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <h3 className="font-semibold text-rehub-dark">Rehabilitación (ADR)</h3>
              <p className="text-sm text-rehub-dark/70 mt-1">
                Asociación Dominicana de Rehabilitación: 35 centros. Terapia física, ocupacional, apoyo psicológico. Aceptan ARS.
              </p>
              <a href="https://rehabilitacion.org.do" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline">
                rehabilitacion.org.do
              </a>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <h3 className="font-semibold text-rehub-dark">Programas sociales</h3>
              <p className="text-sm text-rehub-dark/70 mt-1">
                Comedores económicos, subsidios. Infórmate en la alcaldía, iglesias y organizaciones comunitarias de tu zona.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
              <h3 className="font-semibold text-rehub-dark">Orientación y defensa</h3>
              <p className="text-sm text-rehub-dark/70 mt-1">
                Defensoría del Pueblo y Procuraduría pueden orientar sobre derechos. IDOPPRIL para accidentes laborales.
              </p>
              <a href="https://idoppril.gob.do" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline">
                idoppril.gob.do
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sitios cercanos por provincia */}
      <SitiosCercanosView userId={userId} />

      {/* Planes de acogida */}
      <section id="planes-acogida" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden scroll-mt-6">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark flex items-center gap-2">
            <span>🏠</span> Planes de acogida
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Programas de acompañamiento y reinserción post-accidente
          </p>
        </div>
        <div className="p-6 lg:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-rehub-primary/20 bg-rehub-primary/5">
              <h3 className="font-semibold text-rehub-dark">Asociación Dominicana de Rehabilitación</h3>
              <p className="text-sm text-rehub-dark/70 mt-2">
                Red de 35 centros a nivel nacional. Terapia física y ocupacional, laboratorio ortopédico, apoyo psicológico, programa de inserción laboral. Atienden secuelas de accidentes (fracturas, amputaciones, lesiones medulares).
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="tel:8096897151" className="inline-flex items-center gap-2 px-4 py-2 bg-rehub-primary text-white rounded-lg text-sm font-medium hover:bg-rehub-secondary transition-colors">
                  Tel: 809-689-7151
                </a>
                <a href="https://wa.me/18099690565" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-rehub-primary/30 text-rehub-primary rounded-lg text-sm font-medium hover:bg-rehub-primary/5 transition-colors">
                  WhatsApp: 809-969-0565
                </a>
              </div>
              <a href="https://rehabilitacion.org.do" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-rehub-primary hover:underline">
                rehabilitacion.org.do →
              </a>
            </div>
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-semibold text-rehub-dark">Seguimiento post-alta</h3>
              <p className="text-sm text-rehub-dark/70 mt-2">
                ReHub te acompaña con un plan personalizado (Mi plan), check-ins de seguimiento y guías por situación. Tu centro de salud puede indicar citas de control y rehabilitación.
              </p>
              <Link href={ROUTES.plan} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-rehub-primary hover:underline">
                Ver mi plan en ReHub →
              </Link>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-medium text-rehub-dark">Otros recursos de acogida</h4>
            <ul className="mt-2 text-sm text-rehub-dark/80 space-y-1">
              <li>• Grupos de apoyo: buscar en redes o pedir referencias en centros de salud</li>
              <li>• Iglesias y organizaciones comunitarias: acompañamiento y canasta básica</li>
              <li>• Red de familia o vecinos: mantener contacto cercano facilita la recuperación</li>
              <li>• ARS: si cotizas, verifica cobertura de rehabilitación y terapia domiciliaria</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Emergencias y líneas de ayuda */}
      <section className="space-y-4">
        <div className="bg-red-100/50 rounded-2xl border border-red-200 p-4 text-center">
          <p className="text-sm text-red-900 font-medium">
            Emergencias médicas o de seguridad: <a href="tel:911" className="font-bold text-red-700 hover:underline">911</a>
          </p>
        </div>
        <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6 lg:p-8">
        <h3 className="font-semibold text-rehub-dark mb-4">
          Si necesitas hablar con alguien ahora
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="tel:8092001400"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-red-200 hover:border-rehub-primary/40 transition-colors"
          >
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-semibold text-rehub-dark">
                Cuida tu Salud Mental
              </p>
              <p className="text-xl font-bold text-rehub-primary">809-200-1400</p>
              <p className="text-xs text-rehub-dark/60">
                Gratuito, confidencial. Ansiedad, crisis, duelo.
              </p>
            </div>
          </a>
          <a
            href="tel:811"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-red-200 hover:border-rehub-primary/40 transition-colors"
          >
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-semibold text-rehub-dark">Línea nacional</p>
              <p className="text-xl font-bold text-rehub-primary">811</p>
              <p className="text-xs text-rehub-dark/60">
                Salud mental. Psicólogos disponibles.
              </p>
            </div>
          </a>
        </div>
        </div>
      </section>

      {/* Enlaces a otras secciones */}
      <section className="flex flex-wrap gap-4">
        <Link
          href={ROUTES.plan}
          className="inline-flex items-center gap-2 px-5 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors"
        >
          <IconClipboard className="w-5 h-5" />
          Ver mi plan
        </Link>
        <Link
          href={ROUTES.followup}
          className="inline-flex items-center gap-2 px-5 py-3 border border-rehub-primary/30 text-rehub-primary rounded-xl font-medium hover:bg-rehub-primary/5 transition-colors"
        >
          <IconRefresh className="w-5 h-5" />
          Actualizar seguimiento
        </Link>
      </section>
    </div>
  );
}
