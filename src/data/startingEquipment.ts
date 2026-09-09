/**
 * Equipamento inicial das 12 classes do Livro do Jogador (5e, PT-BR),
 * estruturado a partir da seção "Equipamento" de cada classe (PHB cap. 3)
 * e da tabela "Riqueza Inicial por Classe" (PHB p145).
 *
 * Cada grupo "(a) ... ou (b) ..." vira um array de opções; `item` é sempre
 * igual ao `name` do item em `@/data/itemsCatalog`. Coringas ("qualquer arma
 * simples") usam `{ any }`. Itens sem alternativa ficam em `fixed`.
 */

import type { StartingEquipmentDef } from "@/lib/types";

export const STARTING_EQUIPMENT: Record<string, StartingEquipmentDef> = {
  Bárbaro: {
    choices: [
      [
        { label: "um machado grande", items: [{ item: "Machado Grande" }] },
        { label: "qualquer arma marcial corpo-a-corpo", items: [{ any: "arma marcial corpo-a-corpo" }] },
      ],
      [
        { label: "duas machadinhas", items: [{ item: "Machadinha", qty: 2 }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
    ],
    fixed: [{ item: "Pacote de Aventureiro" }, { item: "Azagaia", qty: 4 }],
    gold: "2d4 × 10 po",
  },

  Bardo: {
    choices: [
      [
        { label: "uma rapieira", items: [{ item: "Rapieira" }] },
        { label: "uma espada longa", items: [{ item: "Espada Longa" }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
      [
        { label: "um pacote de diplomata", items: [{ item: "Pacote de Diplomata" }] },
        { label: "um pacote de artista", items: [{ item: "Pacote de Artista" }] },
      ],
      [
        { label: "um alaúde", items: [{ item: "Alaúde" }] },
        { label: "qualquer outro instrumento musical", items: [{ any: "instrumento musical" }] },
      ],
    ],
    fixed: [{ item: "Couro" }, { item: "Adaga" }],
    gold: "5d4 × 10 po",
  },

  Bruxo: {
    choices: [
      [
        { label: "uma besta leve e 20 virotes", items: [{ item: "Besta Leve" }, { item: "Virotes (20)" }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
      [
        { label: "uma bolsa de componentes", items: [{ item: "Bolsa de Componentes" }] },
        { label: "um foco arcano", items: [{ item: "Foco Arcano" }] },
      ],
      [
        { label: "um pacote de estudioso", items: [{ item: "Pacote de Estudioso" }] },
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
      ],
    ],
    fixed: [{ item: "Couro" }, { any: "arma simples" }, { item: "Adaga", qty: 2 }],
    gold: "4d4 × 10 po",
  },

  Clérigo: {
    choices: [
      [
        { label: "uma maça", items: [{ item: "Maça" }] },
        { label: "um martelo de guerra (se for proficiente)", items: [{ item: "Martelo de Guerra" }] },
      ],
      [
        { label: "brunea", items: [{ item: "Brunea" }] },
        { label: "armadura de couro", items: [{ item: "Couro" }] },
        { label: "cota de malha (se for proficiente)", items: [{ item: "Cota de Malha" }] },
      ],
      [
        { label: "uma besta leve e 20 virotes", items: [{ item: "Besta Leve" }, { item: "Virotes (20)" }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
      [
        { label: "um pacote de sacerdote", items: [{ item: "Pacote de Sacerdote" }] },
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
      ],
    ],
    fixed: [{ item: "Escudo" }, { item: "Símbolo Sagrado" }],
    gold: "5d4 × 10 po",
  },

  Druida: {
    choices: [
      [
        { label: "um escudo de madeira", items: [{ item: "Escudo" }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
      [
        { label: "uma cimitarra", items: [{ item: "Cimitarra" }] },
        { label: "qualquer arma simples corpo-a-corpo", items: [{ any: "arma simples corpo-a-corpo" }] },
      ],
      [
        { label: "um pacote de estudioso", items: [{ item: "Pacote de Estudioso" }] },
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
      ],
    ],
    fixed: [{ item: "Couro" }, { item: "Pacote de Aventureiro" }, { item: "Foco Druídico" }],
    gold: "2d4 × 10 po",
  },

  Feiticeiro: {
    choices: [
      [
        { label: "uma besta leve e 20 virotes", items: [{ item: "Besta Leve" }, { item: "Virotes (20)" }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
      [
        { label: "uma bolsa de componentes", items: [{ item: "Bolsa de Componentes" }] },
        { label: "um foco arcano", items: [{ item: "Foco Arcano" }] },
      ],
      [
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
      ],
    ],
    fixed: [{ item: "Adaga", qty: 2 }],
    gold: "3d4 × 10 po",
  },

  Guerreiro: {
    choices: [
      [
        { label: "cota de malha", items: [{ item: "Cota de Malha" }] },
        {
          label: "gibão de peles, arco longo e 20 flechas",
          items: [{ item: "Gibão de Peles" }, { item: "Arco Longo" }, { item: "Flechas (20)" }],
        },
      ],
      [
        { label: "uma arma marcial e um escudo", items: [{ any: "arma marcial" }, { item: "Escudo" }] },
        { label: "duas armas marciais", items: [{ any: "arma marcial", qty: 2 }] },
      ],
      [
        { label: "uma besta leve e 20 virotes", items: [{ item: "Besta Leve" }, { item: "Virotes (20)" }] },
        { label: "duas machadinhas", items: [{ item: "Machadinha", qty: 2 }] },
      ],
      [
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
      ],
    ],
    fixed: [],
    gold: "5d4 × 10 po",
  },

  Ladino: {
    choices: [
      [
        { label: "uma rapieira", items: [{ item: "Rapieira" }] },
        { label: "uma espada longa", items: [{ item: "Espada Longa" }] },
      ],
      [
        {
          label: "um arco curto e uma aljava com 20 flechas",
          items: [{ item: "Arco Curto" }, { item: "Aljava" }, { item: "Flechas (20)" }],
        },
        { label: "uma espada curta", items: [{ item: "Espada Curta" }] },
      ],
      [
        { label: "um pacote de assaltante", items: [{ item: "Pacote de Assaltante" }] },
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
      ],
    ],
    fixed: [{ item: "Couro" }, { item: "Adaga", qty: 2 }, { item: "Ferramentas de Ladrão" }],
    gold: "4d4 × 10 po",
  },

  Mago: {
    choices: [
      [
        { label: "um bordão", items: [{ item: "Bordão" }] },
        { label: "uma adaga", items: [{ item: "Adaga" }] },
      ],
      [
        { label: "uma bolsa de componentes", items: [{ item: "Bolsa de Componentes" }] },
        { label: "um foco arcano", items: [{ item: "Foco Arcano" }] },
      ],
      [
        { label: "um pacote de estudioso", items: [{ item: "Pacote de Estudioso" }] },
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
      ],
    ],
    fixed: [{ item: "Grimório" }],
    gold: "4d4 × 10 po",
  },

  Monge: {
    choices: [
      [
        { label: "uma espada curta", items: [{ item: "Espada Curta" }] },
        { label: "qualquer arma simples", items: [{ any: "arma simples" }] },
      ],
      [
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
      ],
    ],
    fixed: [{ item: "Dardo", qty: 10 }],
    gold: "5d4 po",
  },

  Paladino: {
    choices: [
      [
        { label: "uma arma marcial e um escudo", items: [{ any: "arma marcial" }, { item: "Escudo" }] },
        { label: "duas armas marciais", items: [{ any: "arma marcial", qty: 2 }] },
      ],
      [
        { label: "cinco azagaias", items: [{ item: "Azagaia", qty: 5 }] },
        { label: "qualquer arma simples corpo-a-corpo", items: [{ any: "arma simples corpo-a-corpo" }] },
      ],
      [
        { label: "um pacote de sacerdote", items: [{ item: "Pacote de Sacerdote" }] },
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
      ],
    ],
    fixed: [{ item: "Cota de Malha" }, { item: "Símbolo Sagrado" }],
    gold: "5d4 × 10 po",
  },

  Patrulheiro: {
    choices: [
      [
        { label: "brunea", items: [{ item: "Brunea" }] },
        { label: "armadura de couro", items: [{ item: "Couro" }] },
      ],
      [
        { label: "duas espadas curtas", items: [{ item: "Espada Curta", qty: 2 }] },
        { label: "duas armas simples corpo-a-corpo", items: [{ any: "arma simples corpo-a-corpo", qty: 2 }] },
      ],
      [
        { label: "um pacote de explorador", items: [{ item: "Pacote de Explorador" }] },
        { label: "um pacote de aventureiro", items: [{ item: "Pacote de Aventureiro" }] },
      ],
    ],
    fixed: [{ item: "Arco Longo" }, { item: "Aljava" }, { item: "Flechas (20)" }],
    gold: "5d4 × 10 po",
  },
};
