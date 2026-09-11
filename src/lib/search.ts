/** Chave de busca: sem acento, minúsculas e sem espaços nas pontas ("  Édson " → "edson"). */
export function searchKey(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Algum dos campos contém a busca (ignorando acento e caixa)? Busca vazia casa tudo. */
export function matchesSearch(query: string, ...fields: (string | undefined)[]): boolean {
  const q = searchKey(query);
  return !q || fields.some((field) => !!field && searchKey(field).includes(q));
}
