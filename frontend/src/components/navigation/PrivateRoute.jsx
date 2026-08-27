import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function PrivateRoute({ children, role }) {
  const { usuario } = useAuth();
  
  // 🔒 Não está logado
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Está logado mas não tem permissão
  if (role && usuario.tipo !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ Pode acessar
  return children;
}
