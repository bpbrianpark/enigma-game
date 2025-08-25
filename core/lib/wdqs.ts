export async function queryWDQS(sparql: string) {
  const res = await fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "WikiQuiz/0.1 (contact@example.com)",
      "Accept": "application/sparql-results+json"
    },
    body: new URLSearchParams({ query: sparql }).toString()
  });

  if (!res.ok) {
    const text = await res.text(); 
    throw new Error(`WDQS error ${res.status}: ${text}`);
  }

  return res.json();
}

