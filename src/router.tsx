import { Navigate } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import Home from "./pages/home";
import NotFound from "./pages/NotFound";
import Ilha from "./pages/ilha";
import Denunciar from "./pages/denunciar";
import Denuncias from "./pages/denuncias";
import Voluntariado from "./pages/voluntariado";
import Noticias from "./pages/noticias";
import ArtigoNoticia from "./pages/noticias/Artigo";
import Admin from "./pages/admin";

/*
 * Menu enxuto: Início · Denúncias · Voluntariado · Notícias (+ Denunciar).
 * As rotas antigas continuam respondendo, redirecionando para a página que
 * passou a integrar aquele conteúdo — nenhum link antigo quebra.
 */
export const routers = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", name: "home", element: <Home /> },
      { path: "/denuncias", name: "denuncias", element: <Denuncias /> },
      { path: "/denunciar", name: "denunciar", element: <Denunciar /> },
      { path: "/ilha", name: "ilha", element: <Ilha /> },
      { path: "/voluntariado", name: "voluntariado", element: <Voluntariado /> },
      { path: "/noticias", name: "noticias", element: <Noticias /> },
      { path: "/noticias/:id", name: "noticia", element: <ArtigoNoticia /> },
      // Rotas antigas, agora integradas:
      { path: "/mapa", element: <Navigate to="/denuncias" replace /> },
      { path: "/alertas", element: <Navigate to="/denuncias" replace /> },
      { path: "/impacto", element: <Navigate to="/noticias" replace /> },
      { path: "/galeria", element: <Navigate to="/noticias" replace /> },
      { path: "/admin", name: "admin", element: <Admin /> },
      { path: "*", name: "404", element: <NotFound /> },
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
