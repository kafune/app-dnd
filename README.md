# Mesa do Pierre — D&D companion

Webapp de fichas para uma mesa de D&D 5e (BR).

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4
- Zustand (estado) com `persist` no localStorage
- Supabase opcional para multiplayer/realtime

## Rodar localmente

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Sem Supabase configurado o app funciona offline (dados no localStorage).

## Multiplayer com Supabase

1. Criar projeto em [supabase.com](https://supabase.com).
2. No SQL Editor do Supabase, rodar `supabase/schema.sql`.
3. Copiar `.env.local.example` para `.env.local` e preencher:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Reiniciar o dev. Na primeira visita o app faz upsert das 4 fichas no banco. A partir daí, todos os clientes que carregarem o mesmo deploy vão ver atualizações em tempo real.

## Atalhos da ficha

- Clique no atributo → rola `1d20+mod` como teste.
- Clique em "save +X" no atributo → rola salvaguarda.
- Clique em uma perícia → rola. **Shift = vantagem**, **Alt = desvantagem**.
- Clique em "Acerto" / "Dano" no card de Combate para rolar a arma.
- Pode editar HP/slots/recursos só após "destravar" com o PIN (se definido).

## Personagens

- **João Lindão** — Shadar-Kai, Ladino-Trapaceiro Arcano
- **Camargo** — Kenku, Bardo-Eloquência
- **Vinicíus** — Meio-Orc, Druida-Terra (Ártico)
- **Rudá** — Shade Thri-kreen, Paladino-Vingança

## Roadmap

- [ ] Combat tracker (iniciativa + conditions)
- [ ] Compendium de magias com tooltips
- [ ] Notas de sessão compartilhadas
- [ ] Avatares (upload Supabase Storage)
- [ ] Mapa de batalha com tokens
