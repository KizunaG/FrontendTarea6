import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10 flex flex-col">
      <div className="mx-auto max-w-3xl bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex-grow">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
          {/* Icono info */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 15h-1v-6h2v6h-1zm0-8a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
          </svg>
          Acerca del Sistema
        </h2>

        <p className="text-slate-300 mb-2">
          <b>Nombre:</b> Gestor de Expedientes e Indicios
        </p>
        <p className="text-slate-300 mb-2">
          <b>Versión:</b> v1.0
        </p>
        <p className="text-slate-300 mb-2">
          <b>Autor:</b> Brayan Josué Corado Robles
        </p>
        <p className="text-slate-300 mb-2">
          <b>Universidad:</b> Mariano Gálvez de Guatemala
        </p>
        <p className="text-slate-300 mb-2">
          <b>Curso:</b> Desarrollo Web – 2025 
        </p>
        <p className="text-slate-300 mb-2">
          <b>Catedrático :</b> Ing. Carmelo Mayén
        </p>
        <p className="text-slate-300 mb-2">
          <b>Tecnologías:</b> React, TypeScript, Express, SQL Server, JWT
        </p>

        {/* Contacto */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-200 mb-3 flex items-center gap-2">
            {/* Icono contacto */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 8V7l-3 2-2-2-3 2-2-2-3 2-2-2-3 2v1l3-2 2 2 3-2 2 2 3-2 2 2 3-2z" />
              <path d="M21 10v10H3V10l9 6 9-6z" />
            </svg>
            Contacto con el desarrollador
          </h3>

          <p className="text-slate-300 mb-1 flex items-center gap-2">
            {/* Icono email */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-sky-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2 4h20v16H2V4zm18 2l-8 6-8-6v12h16V6z" />
            </svg>
            <a
              href="mailto:brayancorado454@gmail.com"
              className="hover:text-sky-300"
            >
              brayancorado454@gmail.com
            </a>
          </p>

          <p className="text-slate-300 flex items-center gap-2">
            {/* Icono teléfono */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.62 10.79a15.91 15.91 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
            </svg>
            <a href="tel:+502 5156-2736" className="hover:text-yellow-300">
              +502 5156-2736
            </a>
          </p>
        </div>

        <div className="mt-6 text-right">
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500"
          >
            Volver al Panel de Administración
          </Link>
        </div>
      </div>

      {/* Footer derechos reservados */}
      <footer className="mt-8 text-center text-slate-400 text-sm">
        <p>
          © 2025 BJ CORADO. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}
