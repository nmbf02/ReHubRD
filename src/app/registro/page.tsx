import Link from "next/link";

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-rehub-light/30 to-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-rehub-dark mb-4">
          Registro próximamente
        </h1>
        <p className="text-rehub-dark/70 mb-8">
          Estamos preparando el sistema de registro. Mientras tanto, puedes usar
          las credenciales de demostración para explorar la plataforma.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-rehub-primary text-white rounded-xl font-semibold hover:bg-rehub-secondary transition-colors"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
