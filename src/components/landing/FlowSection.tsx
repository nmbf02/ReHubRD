"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: 1,
    title: "Registro y perfil",
    desc: "Te registras tras el alta médica. El sistema recopila información sobre tu situación: tipo de accidente, estado físico, situación laboral, red de apoyo y estado emocional.",
  },
  {
    step: 2,
    title: "Diagnóstico social inicial",
    desc: "Con tu información, construimos un perfil de recuperación e identificamos tus necesidades prioritarias.",
  },
  {
    step: 3,
    title: "Plan personalizado",
    desc: "Se activa un plan adaptado: recordatorios, recomendaciones prácticas, orientación sobre trámites, apoyo emocional y recursos comunitarios.",
  },
  {
    step: 4,
    title: "Seguimiento periódico",
    desc: "Check-ins semanales o quincenales donde actualizas tu estado y reportas dificultades.",
  },
  {
    step: 5,
    title: "Ajustes dinámicos",
    desc: "Según tus respuestas, el sistema prioriza: si reportas ansiedad → recursos emocionales; si hay limitaciones de movilidad → orientación logística.",
  },
  {
    step: 6,
    title: "Reintegración y cierre",
    desc: "Cuando alcanzas un nivel estable de reintegración, el sistema reduce la frecuencia o finaliza el acompañamiento.",
  },
];

export function FlowSection() {
  return (
    <section id="funcionamiento" className="py-20 lg:py-28 bg-gradient-to-b from-rehub-light/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-rehub-dark mb-4">
            Cómo funciona ReHub
          </h2>
          <p className="text-lg text-rehub-dark/70">
            Un flujo progresivo y adaptativo, diseñado para acompañarte en cada
            etapa de tu recuperación.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-rehub-primary/30 -translate-x-1/2" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col lg:flex-row gap-8 items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 lg:max-w-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-rehub-primary text-white flex items-center justify-center font-bold">
                      {item.step}
                    </span>
                    <h3 className="font-semibold text-xl text-rehub-dark">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-rehub-dark/70 pl-14">{item.desc}</p>
                </div>
                <div className="hidden lg:flex flex-shrink-0 w-16" />
                <div className="hidden lg:flex flex-shrink-0 w-16" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
