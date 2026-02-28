"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rehub-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-rehub-accent">ReHub</span>
            <span className="text-rehub-light/70 text-sm">
              Centro de Recuperación
            </span>
          </div>
          <div className="flex gap-8 text-sm text-rehub-light/80">
            <a href="#problema" className="hover:text-white transition-colors">
              El Problema
            </a>
            <a href="#solucion" className="hover:text-white transition-colors">
              La Solución
            </a>
            <a href="#funcionamiento" className="hover:text-white transition-colors">
              Cómo Funciona
            </a>
            <a href="#contacto" className="hover:text-white transition-colors">
              Contacto
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-rehub-light/60">
          <p>© {currentYear} ReHub. Proyecto piloto en República Dominicana.</p>
          <p className="mt-1">
            Re · Recovery, Rehabilitación, Reintegración · Hub · Centro, Núcleo
          </p>
        </div>
      </div>
    </footer>
  );
}
