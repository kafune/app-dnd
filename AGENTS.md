# Fichas DnD

Ficha de D&D 5e em PT-BR para uma mesa. **Não é Next.js** — foi migrado. O front é
Vite + React 19 + React Router + Tailwind 4 + Zustand; o servidor é Rust (Axum +
SQLite) e serve o próprio front embutido (`server/build.rs` embute o `dist/`).

- Código, comentários e interface em português.
- As regras do jogo vêm dos catálogos em `src/data/` (autorados a partir dos PDFs na
  raiz do repositório); nível, conjuração e progressão moram em `src/lib/progression.ts`.
- Quem pode mexer em quê: `src/lib/permissions.ts` ajusta a tela, mas a trava real é
  `player_patch_violation` em `server/src/main.rs`. Mudou uma, confira a outra.
- Mapa da mesa (um por pasta): geometria e escala em `src/lib/map.ts` (1 quadrado =
  1,5 m), áreas das magias/habilidades em `src/data/spellAreas.ts`, tela em
  `src/components/map/`. No servidor, `apply_map_op` decide o que o jogador pode
  (mover e girar o próprio token e editar/limpar as próprias áreas; quem o Mestre tirou do
  mapa fica em `excluded` e não se recoloca) e `map_for_player` esconde os monstros que o
  Mestre ainda não liberou. Mapas prontos do Mestre ficam na tabela `map_presets`.
- Magias: depois de regenerar o catálogo com `scripts/parse_spells.py`, rode
  `scripts/fix_spells.py` (separa as magias que o OCR do Xanathar grudou).
- Antes de entregar: `bun run lint`, `bun run typecheck`, `bun test` e
  `cargo test --manifest-path server/Cargo.toml`.
- Para ver a mudança rodando de verdade: `bun run build`. O binário só enxerga o
  `dist/` novo depois do `build:server` — rodar só o `build:web` serve a versão antiga.
