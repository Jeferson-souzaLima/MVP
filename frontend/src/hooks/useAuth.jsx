// hooks/useAuth.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Tenta carregar dados do localStorage ao iniciar
    const storedUser = localStorage.getItem("usuario");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUsuario(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData, jwtToken) => {
    setUsuario(userData);
    setToken(jwtToken);
    localStorage.setItem("usuario", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const atualizarUsuario = useCallback((dadosAtualizados) => {
    setUsuario((usuarioAtual) => {
      const usuarioAtualizado = {
        ...usuarioAtual,
        ...dadosAtualizados
      };

      localStorage.setItem(
        "usuario",
        JSON.stringify(usuarioAtualizado)
      );

      return usuarioAtualizado;
    });
  }, []);

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        atualizarUsuario
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}