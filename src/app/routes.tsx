import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import ExpedientesList from '@/pages/ExpedientesList';
import ExpedienteDetalle from '@/pages/ExpedienteDetalle';
import IndiciosPage from '@/pages/IndiciosPage';
import UsuariosPage from '@/pages/UsuariosPage';
import IndiciosHub from '@/pages/IndiciosHub';
import AboutPage from '@/pages/AboutPage';
import Splash from '@/pages/Splash';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <App /> },
      { path: '/expedientes', element: <ExpedientesList /> },
      { path: '/expedientes/:id', element: <ExpedienteDetalle /> },
      { path: "/expedientes/:id/indicios", element: <IndiciosPage /> },
      { path: "/indicios", element: <IndiciosHub /> },
      { path: '/usuarios', element: <UsuariosPage /> },
      { path: '/About', element: <AboutPage /> },
      { path: '/Splash', element: <Splash /> },
      { element: <RoleRoute allow={['coordinador']} />, children: [
        // { path: '/aprobaciones', element: <AprobacionesPage /> },
      ]},
    ],
  },
]);
