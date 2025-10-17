Gestor de Expedientes e Indicios — Frontend (React + Vite + TS)

Aplicación SPA para administrar expedientes e indicios. Incluye inicio de sesión con JWT, control de acceso por roles (técnico | coordinador), pantallas CRUD y una pantalla de bienvenida tras el login.

Stack tecnológico

React 18 + TypeScript

Vite

React Router v6

Tailwind CSS (tema oscuro por defecto)

Axios para llamadas HTTP

Iconos con lucide-react

Requisitos previos

Node.js ≥ 18

npm

Backend disponible en http://localhost:3000/api (configurable vía variables de entorno)

Autenticación y permisos

Login: POST /auth/login → guarda access_token (y opcionalmente refresh_token) en localStorage.

Protecciones de ruta:

ProtectedRoute comprueba sesión y redirige a /login si no hay token.

RoleRoute restringe la sección Usuarios al rol coordinador.

Barra superior: muestra usuario, rol, estado de sesión y botón Salir.

Pantalla de bienvenida: después de autenticarse se navega a /splash y luego al panel principal con efecto de desvanecido.

Vistas principales

Dashboard (/)

Accesos a Expedientes, Indicios y Usuarios (esta última sólo para coordinadores).

Expedientes

Listado con filtros (estado/código), detalle, aprobación/rechazo con justificación, activar/desactivar, crear/editar mediante modal.

Indicios

Por expediente (/expedientes/:id/indicios): alta/edición (modal), activar/desactivar y validación del expediente relacionado.

Usuarios (sólo coordinador)

Tabla paginada con búsqueda, alta de usuarios y manejo de errores enviados por la API.

Acerca de (/about)

Datos del sistema y del autor (enlaces a correo/teléfono).

Puesta en marcha

Clonar e ingresar al proyecto

git clone <URL-de-tu-repo>
cd <carpeta-del-proyecto>


Instalar dependencias

npm install


Configurar variables de entorno (archivo .env)

VITE_API_URL=http://localhost:3000/api   # URL del backend


Scripts útiles

# desarrollo con recarga en caliente
npm run dev

# build de producción
npm run build

# previsualizar la build
npm run preview
