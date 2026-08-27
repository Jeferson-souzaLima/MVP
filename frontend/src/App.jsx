import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { AuthProvider } from './hooks/useAuth';
import { CarrinhoProvider } from './context/CarrinhoContext';
import { BuscaProvider } from "./context/BuscaContext";

function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <BuscaProvider>
          <RouterProvider router={router} />
        </BuscaProvider>
      </CarrinhoProvider>
    </AuthProvider>
  );
}

export default App;