import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '@/services/auth';

export default function RoleRoute({ allow }: { allow: Array<'tecnico'|'coordinador'> }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.rol)) return <Navigate to="/" replace />;
  return <Outlet />;
}
