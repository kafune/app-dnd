# Plano: Webapp de D&D para a sua mesa

## Contexto

Você quer um webapp pra sua mesa de D&D 5e (em português, BR). O repositório `app-dnd` está vazio, na branch `claude/dnd-webapp-planning-jYnop`.

**Personagens (todos nível 3):**
- **João Lindão** (Zorrilho Pabrantes) — Shadar-Kai, Ladino-Trapaceiro Arcano. Des 18, foco furtividade/teleporte (Graça da Rainha Corvo).
- **Camargo** (Xopscoch ReiVahn) — Kenku, Bardo-Eloquência. Car 17, Inspiração de Bardo, Lembrança Kenku.
- **Vinicíus** (Holg Smough) — Meio-Orc, Druida-Terra (Ártico). Forma Selvagem, Resistência Implacável, sem metal.
- **Rudá** (Edson) — Shade Thri-kreen, Paladino-Vingança. Cura pelas Mãos (pool 15), Carne Fantasmagórica, 4 braços.

**Decisões definidas:**
- **MVP**: Ficha + trackers (PV/slots/recursos com descanso curto/longo) + rolador de dados.
- **Multiplayer realtime desde o início** — todo mundo vê updates ao vivo.
- **Foco no jogador** (você vai jogar no ato 2). Mestre se vira sem ferramentas de DM por enquanto.
- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui.

## Stack final

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, lucide-react (ícones)
- **Estado/dados**: Supabase (Postgres + Auth + **Realtime** via canais) — free tier sobra
- **Estado client**: Zustand p/ UI local + Supabase client p/ dados remotos
- **Realtime**: Supabase Realtime escuta mudanças na tabela `characters` e atualiza todos os clientes conectados
- **Auth**: Supabase magic link (email) ou um pin simples por personagem (mais leve, sem cadastro)
- **Deploy**: Vercel (frontend) + Supabase (backend) — ambos free tier

## Modelo de dados (Supabase / Postgres)

```sql
-- Cada personagem é uma linha; o JSON sheet guarda detalhes que mudam pouco.
-- Campos voláteis (HP, slots, resources) ficam em colunas próprias para
-- updates baratos e Realtime granular.

create table characters (
  id uuid primary key default gen_random_uuid(),
    player_name text not null,           -- "João", "Camargo"...
      character_name text not null,        -- "Zorrilho Pabrantes"
        pin text,                            -- pin curto opcional p/ "logar"
          sheet jsonb not null,                -- ficha estática (atributos, perícias, magias, etc.)
            hp_current int not null,
              hp_max int not null,
                hp_temp int not null default 0,
                  spell_slots jsonb not null,          -- { "1": { current, max }, "2": ... }
                    resources jsonb not null,            -- [{ name, current, max, recharge }]
                      notes text default '',
                        updated_at timestamptz default now()
                        );

                        create table dice_rolls (
                          id uuid primary key default gen_random_uuid(),
                            character_id uuid references characters(id) on delete cascade,
                              label text,                          -- "Furtividade", "Ataque Rapieira"
                                expression text,                     -- "1d20+6"
                                  result int,
                                    detail jsonb,                        -- dados rolados, vantagem, crítico
                                      created_at timestamptz default now()
                                      );
                                      ```

                                      Realtime habilitado na tabela `characters` (UPDATE) e `dice_rolls` (INSERT) — todo cliente conectado recebe.

                                      ## Tipos TypeScript (resumo)

                                      ```ts
                                      type AbilityKey = 'str'|'dex'|'con'|'int'|'wis'|'cha'

                                      type Sheet = {
                                        species: string
                                          classes: { name: string; subclass?: string; level: number }[]
                                            background: string
                                              abilityScores: Record<AbilityKey, number>
                                                ac: number
                                                  speed: number                  // metros (as fichas usam metros)
                                                    proficiencyBonus: number
                                                      skills: { name: string; ability: AbilityKey; proficient: boolean; expert?: boolean }[]
                                                        saves: AbilityKey[]
                                                          proficiencies: string[]
                                                            languages: string[]
                                                              features: { name: string; source: string; description: string }[]
                                                                spells: { saveDC: number; attackMod: number; cantrips: Spell[]; known: Spell[] }
                                                                  inventory: { coins: { gp: number; sp: number; cp: number }; items: Item[] }
                                                                    appearance: { size: string; height: string; image?: string }
                                                                      personality: { trait: string; ideal: string; flaw: string; why: string; backstory: string }
                                                                      }

                                                                      type Resource = {
                                                                        name: string
                                                                          current: number
                                                                            max: number
                                                                              recharge: 'short' | 'long' | 'none' | 'dawn'
                                                                              }
                                                                              ```

                                                                              ## Estrutura de arquivos

                                                                              ```
                                                                              app-dnd/
                                                                              ├── package.json, tsconfig.json, next.config.ts, tailwind.config.ts
                                                                              ├── .env.local              # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
                                                                              ├── supabase/
                                                                              │   ├── schema.sql          # SQL acima
                                                                              │   └── seed.ts             # popula as 4 fichas a partir dos PDFs
                                                                              ├── src/
                                                                              │   ├── app/
                                                                              │   │   ├── layout.tsx
                                                                              │   │   ├── page.tsx                      # lista os 4 personagens
                                                                              │   │   ├── character/[id]/page.tsx       # ficha completa
                                                                              │   │   └── api/                          # se precisar de server actions
                                                                              │   ├── components/
                                                                              │   │   ├── character/
                                                                              │   │   │   ├── Header.tsx
                                                                              │   │   │   ├── AbilityScores.tsx
                                                                              │   │   │   ├── HpTracker.tsx             # +/-, temp HP, persiste no Supabase
                                                                              │   │   │   ├── SpellSlots.tsx            # clique p/ marcar usado
                                                                              │   │   │   ├── ResourceTracker.tsx       # genérico, lê de characters.resources
                                                                              │   │   │   ├── RestButtons.tsx           # Descanso Curto / Longo
                                                                              │   │   │   ├── Skills.tsx                # clique pra rolar
                                                                              │   │   │   ├── Saves.tsx
                                                                              │   │   │   ├── Attacks.tsx               # ataques de armas com botão de roll
                                                                              │   │   │   ├── Spells.tsx                # cantrips + por nível
                                                                              │   │   │   ├── Features.tsx              # habilidades de classe/raça
                                                                              │   │   │   ├── Inventory.tsx
                                                                              │   │   │   └── Personality.tsx           # backstory etc.
                                                                              │   │   ├── dice/
                                                                              │   │   │   ├── DiceRoller.tsx            # input livre + botões rápidos
                                                                              │   │   │   ├── RollHistory.tsx           # últimas 20 rolagens (via Realtime)
                                                                              │   │   │   └── rollEngine.ts             # parser "2d6+3", vantagem/desvantagem
                                                                              │   │   └── ui/                           # shadcn (button, card, dialog, etc.)
                                                                              │   ├── lib/
                                                                              │   │   ├── supabase.ts                   # client browser
                                                                              │   │   ├── types.ts
                                                                              │   │   ├── store.ts                      # Zustand p/ UI (modais, toasts)
                                                                              │   │   └── characterHooks.ts             # useCharacter(id), useRealtime()
                                                                              │   └── data/
                                                                              │       └── seed/                         # JSON das 4 fichas extraídas
                                                                              │           ├── joao.json
                                                                              │           ├── camargo.json
                                                                              │           ├── vinicius.json
                                                                              │           └── ruda.json
                                                                              ```

                                                                              ## Roteiro de implementação

                                                                              ### Fase 1 — Bootstrap (dia 1)
                                                                              1. `npx create-next-app@latest` com TS, Tailwind, App Router
                                                                              2. Instalar shadcn/ui, lucide-react, zustand, `@supabase/supabase-js`
                                                                              3. Criar projeto Supabase, rodar `schema.sql`, popular `.env.local`
                                                                              4. Componentes base do shadcn (Button, Card, Input, Dialog, Toast)

                                                                              ### Fase 2 — Dados das fichas (dia 1-2)
                                                                              5. Transcrever as 4 fichas para JSON em `src/data/seed/` (já tenho o texto extraído dos PDFs)
                                                                              6. Script `seed.ts` que faz upsert no Supabase

                                                                              ### Fase 3 — Visualização (dia 2-4)
                                                                              7. `app/page.tsx`: lista 4 cards de personagem (avatar + nome + classe/nível) → click abre ficha
                                                                              8. `app/character/[id]/page.tsx`: layout em colunas/abas com todos os componentes da ficha

                                                                              ### Fase 4 — Trackers (dia 4-6)
                                                                              9. `HpTracker`: input de dano/cura, exibe atual/max/temp, escreve no Supabase
                                                                              10. `SpellSlots`: clica em cada bolinha p/ alternar usado/disponível
                                                                              11. `ResourceTracker`: lê `resources` JSON, +/- por recurso
                                                                              12. `RestButtons`: dois botões; longo restaura tudo, curto restaura só `recharge: 'short'` + recursos relevantes

                                                                              ### Fase 5 — Rolador (dia 6-7)
                                                                              13. `rollEngine.ts`: parser de notação `XdY+Z`, suporte a vantagem/desvantagem, crítico
                                                                              14. `DiceRoller`: clicar em qualquer perícia/save/ataque dispara um roll, persiste em `dice_rolls`
                                                                              15. `RollHistory`: subscribe na tabela via Realtime, mostra últimas 20 com nome do personagem

                                                                              ### Fase 6 — Realtime e polish (dia 7-9)
                                                                              16. Hook `useRealtime()` que escuta UPDATE em `characters` e INSERT em `dice_rolls`
                                                                              17. Login simples por pin (input no topo da ficha; depois de digitar, libera edição)
                                                                              18. Toasts ao receber updates remotos ("Camargo rolou Persuasão: 18")
                                                                              19. Mobile-first: ficha precisa funcionar no celular durante a sessão

                                                                              ### Fase 7 — Deploy
                                                                              20. Deploy na Vercel, conectar variáveis do Supabase, testar com a turma

                                                                              ## Verificação ponta a ponta

                                                                              1. `npm run dev` em `localhost:3000` sem erros
                                                                              2. Página inicial mostra os 4 personagens com classe/nível
                                                                              3. Clicar em "João Lindão" → ficha completa com Atributos, CA 17, PV 18/18, Furtividade +6, Graça da Rainha Corvo, Mãos Mágicas
                                                                              4. Reduzir 5 PV → mostra 13/18; abrir em outra aba → também mostra 13/18 (Realtime ✅)
                                                                              5. Marcar slot de 1° nível usado → persiste e propaga
                                                                              6. "Descanso Longo" → slots e Graça da Rainha Corvo voltam ao máximo; Forma Selvagem (curto) também
                                                                              7. Clicar em "Furtividade" no João → mostra "1d20+6 = X" no histórico em todos os clientes
                                                                              8. Clicar em "Ataque Rapieira" do João → "1d20+6" pra acertar, depois "1d8+4" de dano
                                                                              9. Mobile: testar no celular, scroll funciona, botões clicáveis
                                                                              10. Recursos homebrew (Cura pelas Mãos pool 15, Carne Fantasmagórica 1/longo, Lembrança Kenku 2/longo) aparecem corretos por personagem

## Próximos passos depois do MVP

Não vamos implementar agora, mas pensados pra evoluir:
- **Combat tracker** com iniciativa e conditions (quando você virar jogador no ato 2 é menos crítico)
- **Compendium** de magias clicáveis com tooltip
- **Diário/notas** por personagem e da sessão
- **Avatares** customizados (upload pro Supabase Storage)
- **Histórico de XP/level up** quando subirem de nível

## Status atual do app

O app real já está implementado em **Next.js 16.2.4 + React 19 + Tailwind 4**, usando **SQLite local (`better-sqlite3`) + SSE** no lugar do Supabase planejado originalmente. A estrutura atual usa rotas em português (`/personagem/[id]`) e APIs locais em `/api/characters`, `/api/rolls` e `/api/events`.

Concluído no app atual:
- Home com cards dos 4 personagens.
- Página completa de ficha por personagem.
- Trackers de PV, slots, recursos e descanso curto/longo.
- PIN simples por personagem para liberar edição.
- Rolador livre, rolagens por atributos, saves, perícias, iniciativa, ataques e dano.
- Histórico de rolagens local/mesa.
- Persistência em SQLite e realtime por SSE.
- Toasts para rolagens e atualizações remotas recebidas via SSE.
- Notas da sessão por personagem com edição via PIN.
- Acesso à ficha completa protegido por PIN individual por personagem.

Verificação mais recente:
- `bun run lint`
- `bun run test`
- `bun run build`
- `bun run test:smoke`

Suíte reutilizável:
- `bun run test` valida regras puras de dados, rolagem e descanso.
- `bun run test:smoke` sobe o app em produção com SQLite temporário e valida páginas, APIs, persistência e SSE.
- `bun run test:all` roda lint, testes unitários, build e smoke HTTP.
