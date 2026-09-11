import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { HydrationGate } from "@/components/HydrationGate";
import { ToastViewport } from "@/components/ui/ToastViewport";
import Home from "@/pages/Home";

// Cada página vira um chunk próprio: a home (a mais acessada) fica minúscula.
const Pasta = lazy(() => import("@/pages/Pasta"));
const CriarFicha = lazy(() => import("@/pages/CriarFicha"));
const Personagem = lazy(() => import("@/pages/Personagem"));
const Mestre = lazy(() => import("@/pages/Mestre"));

function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-zinc-500">Carregando…</main>
  );
}

function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-zinc-500">Página não encontrada.</p>
    </main>
  );
}

export function App() {
  return (
    <HydrationGate>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pasta/:folderId" element={<Pasta />} />
          <Route path="/pasta/:folderId/criar-ficha" element={<CriarFicha />} />
          {/* Ficha agora nasce dentro de uma pasta: o link antigo leva à escolha da pasta. */}
          <Route path="/criar-ficha" element={<Navigate to="/" replace />} />
          <Route path="/personagem/:id" element={<Personagem />} />
          <Route path="/mestre" element={<Mestre />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastViewport />
    </HydrationGate>
  );
}
