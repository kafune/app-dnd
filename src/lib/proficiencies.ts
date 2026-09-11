/**
 * Proficiências da ficha agrupadas por tópico (armaduras, armas, ferramentas…).
 *
 * A ficha guarda `proficiencies` como texto livre vindo de classes ("Armaduras leves,
 * armaduras médias, escudos"), raças ("Espada longa") ou do Mestre. Aqui cada entrada
 * é quebrada nas vírgulas (fora de parênteses) e classificada por palavras-chave.
 */

export type ProficiencyTopic = "armaduras" | "armas" | "ferramentas" | "outras";

export const PROFICIENCY_TOPIC_LABELS: Record<ProficiencyTopic, string> = {
  armaduras: "Armaduras e escudos",
  armas: "Armas",
  ferramentas: "Ferramentas, kits e instrumentos",
  outras: "Outras",
};

export const PROFICIENCY_TOPIC_ORDER: ProficiencyTopic[] = ["armaduras", "armas", "ferramentas", "outras"];

function norm(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const ARMOR_RE = /armadura|escudo/;
const TOOL_RE =
  /ferrament|instrumento|\bkits?\b|suprimentos|utensilios|\bjogos?\b|veiculo|alaude|flauta|tambor|\blira\b|gaita|trompa|viola|xalmas|dulcimer|baralho|\bdados\b|xadrez|navegador|disfarce|falsificac|herbalismo|envenenador|cartografo|caligrafo|joalheiro|oleiro|tecelao|sapateiro|carpinteiro|entalhador|ferreiro|pedreiro|pintor|vidreiro|coureiro|cozinheiro|funileiro|alquimista|cervejeiro|ladrao/;
const WEAPON_RE =
  /\barmas?\b|espada|\barcos?\b|\bbestas?\b|machad|martelo|adaga|rapieira|\blancas?\b|clava|\bmacas?\b|mangual|cimitarra|tridente|chicote|azagaia|dardo|\bfundas?\b|glaive|alabarda|\bpiques?\b|picareta|porrete|bordao|bordoes|foice|zarabatana|\bredes?\b|mosquete|pistola|katana/;

/** Quebra entradas "a, b, c" (vírgula ou ponto e vírgula fora de parênteses), remove "Nenhuma" e duplicatas. */
export function splitProficiencies(list: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of raw) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if ((ch === "," || ch === ";") && depth === 0) {
        parts.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    parts.push(current);
    for (const part of parts) {
      const text = part.trim().replace(/\.$/, "").trim();
      if (!text || /^nenhum[a]?$/i.test(text)) continue;
      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
      const key = norm(capitalized);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(capitalized);
    }
  }
  return out;
}

export function proficiencyTopic(entry: string): ProficiencyTopic {
  const n = norm(entry);
  if (ARMOR_RE.test(n)) return "armaduras";
  if (TOOL_RE.test(n)) return "ferramentas";
  if (WEAPON_RE.test(n)) return "armas";
  return "outras";
}

export type ProficiencyGroup = { topic: ProficiencyTopic; label: string; items: string[] };

/** Proficiências separadas por tópico, na ordem de exibição (só tópicos com itens). */
export function groupProficiencies(list: readonly string[]): ProficiencyGroup[] {
  const byTopic = new Map<ProficiencyTopic, string[]>();
  for (const entry of splitProficiencies(list)) {
    const topic = proficiencyTopic(entry);
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic)!.push(entry);
  }
  return PROFICIENCY_TOPIC_ORDER.filter((topic) => byTopic.has(topic)).map((topic) => ({
    topic,
    label: PROFICIENCY_TOPIC_LABELS[topic],
    items: byTopic.get(topic)!,
  }));
}
