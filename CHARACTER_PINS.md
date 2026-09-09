# PINs de acesso das fichas

Use estes PINs para abrir a ficha completa de cada personagem em Mundo Pankleos.

| Jogador | Personagem | PIN |
| --- | --- | --- |
| João | Zorrilho Pabrantes | `7429` |
| Camargo | Xopscoch ReiVahn | `3816` |
| Vinicíus | Holg Smough | `9052` |
| Rudá | Edson Manoel Fagundes Peixoto | `6148` |

Chave mestra do Mestre (abre qualquer ficha): `670076`.

Esses são os **defaults embutidos no servidor**. Para trocar sem recompilar, defina no ambiente:

```bash
APP_DND_MASTER_PIN=123456
APP_DND_CHARACTER_PINS=joao-lindao:1111,camargo-fofo:2222,vinicius-fofo:3333,ruda-felpudo:4444
```

Observação: este arquivo fica no servidor/repositório. Não publique em lugar acessível aos jogadores se quiser manter os PINs privados.
