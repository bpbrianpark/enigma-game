export async function queryWDQS(sparql: string) {
  const res = await fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query; charset=UTF-8",
      "User-Agent": "WikiQuiz/0.1 (contact@example.com)",
      "Accept": "application/sparql-results+json"
    },
    body: sparql
  });
  if (!res.ok) throw new Error(`WDQS error ${res.status}`);
  return res.json();
}
