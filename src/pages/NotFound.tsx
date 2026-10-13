import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: rota inacessível:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-foam px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf text-white shadow-lg shadow-leaf/30">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="font-display text-6xl font-semibold text-primary">404</h1>
      <p className="mt-3 max-w-md text-lg text-muted-foreground">
        Esse caminho não existe no mapa ainda.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-leaf px-6 py-3 font-medium text-white transition hover:bg-leaf-deep"
      >
        Voltar para o início
      </Link>
    </div>
  );
};

export default NotFound;
