import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";

// PÃƒÂ¡ginas pÃƒÂºblicas
import HomePage from "../pages/HomePage";
import ProdutoDetalhes from "../pages/ProdutoDetalhes";
import LojaDetalhes from "../pages/LojaDetalhes";
import ResultadosBuscaPage from "../pages/ResultadosBuscaPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RegisterLojista from "../pages/RegisterLojista";
import VerificarEmailPage from "../pages/VerificarEmailPage";

// Cliente
import PerfilPage from "../pages/cliente/PerfilPage";
import HistoricoPage from "../pages/cliente/HistoricoPage";
import CarrinhoPage from "../pages/CarrinhoPage";
import Agendamento from "../pages/Agendamento";
import MeusAgendamentosPage from "../pages/cliente/MeusAgendamentosPage";
import FavoritosPage from "../pages/cliente/FavoritosPage";
import PagamentoRetornoPage from "../pages/PagamentoRetornoPage";

// Lojista
import PerfilLojistaPage from "../pages/lojista/PerfilLojistaPage";
import ProdutosLojistaPage from "../pages/lojista/ProdutosLojistaPage";
import AgendaLojistaPage from "../pages/lojista/AgendaLojistaPage";
import ConfiguracoesAgendaPage from "../pages/lojista/ConfiguracoesAgendaPage";
import DadosLojaPage from "../pages/lojista/DadosLojaPage";
import AjudaSuportePage from "../pages/lojista/AjudaSuportePage";
import AnunciosPage from "../pages/lojista/AnunciosPage";
import RelatoriosPage from "../pages/lojista/RelatoriosPage";

// ProteÃƒÂ§ÃƒÂ£o
import PrivateRoute from "../components/navigation/PrivateRoute";
import ServicosLojistaPage from "../pages/lojista/ServicosLojistaPage";

export const router = createBrowserRouter([
  // ===============================
  // PÃƒÅ¡BLICAS
  // ===============================
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/register-lojista", element: <RegisterLojista /> },
  { path: "/verificar-email", element: <VerificarEmailPage /> },

  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/busca", element: <ResultadosBuscaPage /> },
      { path: "/produtos/:id", element: <ProdutoDetalhes /> },
      { path: "/lojas/:id", element: <LojaDetalhes /> },
      { path: "/pagamento/:estado", element: <PagamentoRetornoPage /> },

      // ===============================
      // CLIENTE
      // ===============================
      {
        path: "/perfil",
        element: (
          <PrivateRoute role="cliente">
            <PerfilPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/historico",
        element: (
          <PrivateRoute role="cliente">
            <HistoricoPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/carrinho",
        element: (
          <PrivateRoute role="cliente">
            <CarrinhoPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/agendar/:lojaId/:servicoId",
        element: (
          <PrivateRoute role="cliente">
            <Agendamento />
          </PrivateRoute>
        ),
      },
      {
        path: "/meus-agendamentos",
        element: (
          <PrivateRoute role="cliente">
            <MeusAgendamentosPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/favoritos",
        element: (
          <PrivateRoute role="cliente">
            <FavoritosPage />
          </PrivateRoute>
        ),
      },

      // ===============================
      // LOJISTA
      // ===============================
      {
        path: "/perfil-lojista",
        element: (
          <PrivateRoute role="lojista">
            <PerfilLojistaPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/produtos",
        element: (
          <PrivateRoute role="lojista">
            <ProdutosLojistaPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/perfil",
        element: (
          <PrivateRoute role="lojista">
            <DadosLojaPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/servicos",
        element: (
          <PrivateRoute role="lojista">
            <ServicosLojistaPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/agenda",
        element: (
          <PrivateRoute role="lojista">
            <AgendaLojistaPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/agenda/configuracoes",
        element: (
          <PrivateRoute role="lojista">
            <ConfiguracoesAgendaPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/ajuda-suporte",
        element: (
          <PrivateRoute role="lojista">
            <AjudaSuportePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/anuncios",
        element: (
          <PrivateRoute role="lojista">
            <AnunciosPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/lojista/relatorios",
        element: (
          <PrivateRoute role="lojista">
            <RelatoriosPage />
          </PrivateRoute>
        ),
      }
    ],
  },
]);
