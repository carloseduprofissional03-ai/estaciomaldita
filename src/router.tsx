import { PublicLayout } from "./components/layout/PublicLayout";
import Home from "./pages/home";
import NotFound from "./pages/NotFound";
import Mapa from "./pages/mapa";
import Denunciar from "./pages/denunciar";
import Denuncias from "./pages/denuncias";
import Voluntariado from "./pages/voluntariado";
import Noticias from "./pages/noticias";
import ArtigoNoticia from "./pages/noticias/Artigo";
import Galeria from "./pages/galeria";
import Impacto from "./pages/impacto";
import Admin from "./pages/admin";

export const routers = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", name: "home", element: <Home /> },
      { path: "/mapa", name: "mapa", element: <Mapa /> },
      { path: "/denunciar", name: "denunciar", element: <Denunciar /> },
      { path: "/denuncias", name: "denuncias", element: <Denuncias /> },
      { path: "/voluntariado", name: "voluntariado", element: <Voluntariado /> },
      { path: "/noticias", name: "noticias", element: <Noticias /> },
      { path: "/noticias/:id", name: "noticia", element: <ArtigoNoticia /> },
      { path: "/galeria", name: "galeria", element: <Galeria /> },
      { path: "/impacto", name: "impacto", element: <Impacto /> },
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
