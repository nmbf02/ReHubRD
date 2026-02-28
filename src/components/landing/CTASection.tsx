"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section id="contacto" className="py-20 lg:py-28 bg-rehub-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Listo para comenzar tu proceso de recuperación?
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            ReHub está en fase piloto. Regístrate para recibir información sobre
            el lanzamiento y ser parte de los primeros usuarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contacto@rehub.do"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-rehub-primary rounded-xl font-semibold hover:bg-rehub-light transition-colors"
            >
              Contactar
            </a>
            <Link
              href="/registro"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Próximamente: Registrarse
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/80">
            ReHub no sustituye profesionales de la salud. Funciona como sistema
            de orientación, acompañamiento y canalización.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
