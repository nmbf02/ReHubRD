"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Vacío post-alta",
    desc: "La atención se concentra en emergencia y hospitalización. Al salir del centro de salud, la persona queda sin acompañamiento estructurado.",
    icon: "🏥",
  },
  {
    title: "Desinformación",
    desc: "Falta de orientación sobre trámites, rehabilitación, seguros y reintegración laboral genera estrés y confusión.",
    icon: "❓",
  },
  {
    title: "Abandono de tratamientos",
    desc: "Sin seguimiento continuo, muchas personas abandonan tratamientos o pierden el rumbo en su recuperación.",
    icon: "📉",
  },
  {
    title: "Aislamiento emocional",
    desc: "La adaptación a una nueva realidad personal requiere apoyo psicológico y social que no siempre está disponible.",
    icon: "💭",
  },
];

export function ProblemSection() {
  return (
    <section id="problema" className="py-20 lg:py-28 bg-rehub-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            El vacío que ReHub viene a llenar
          </h2>
          <p className="text-lg text-rehub-light/80">
            En República Dominicana, una vez que la persona sale del hospital,
            enfrenta su recuperación física, emocional y social sin un sistema de
            acompañamiento continuo.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="text-3xl mb-4 block">{problem.icon}</span>
              <h3 className="font-semibold text-lg mb-2">{problem.title}</h3>
              <p className="text-rehub-light/80 text-sm">{problem.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
