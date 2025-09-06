import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const categories = [
        {
            slug: "humans-women",
            name: "Real-Life Women",
            sparql: "SELECT DISTINCT ?item ?item_label WHERE { ?item wdt:P31 wd:Q5; wdt:P21 wd:Q6581072; rdfs:label ?item_label; FILTER(LANG(?item_label) = 'en')} LIMIT 1000",
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 }
            ],
            isDynamic: true,
            updateSparql:  `SELECT ?item ?itemLabel WHERE {
  VALUES ?search { "SEARCH_TERM" }

  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org";
                     wikibase:api "EntitySearch";
                     mwapi:search ?search;
                     mwapi:language "en".
    ?item wikibase:apiOutputItem mwapi:item.
  }

  ?item wdt:P31 wd:Q5;          
        wdt:P21 wd:Q6581072.    

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`
        },
        {
            slug: "pokemon_gen1",
            name: "Pokemon (Generation 1)",
            sparql: "SELECT DISTINCT ?item ?item_label ?itemLabel WHERE { ?item rdfs:label ?item_label. FILTER(LANG(?item_label) = 'en') ?item wdt:P361 wd:Q857976. MINUS { ?item wdt:P31 wd:Q117038109. }}",
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 151 }
            ]
        },
        {
            slug: "humans_men",
            name: "Real-Life Men",
            sparql: "SELECT DISTINCT ?item ?item_label WHERE { ?item wdt:P31 wd:Q5; wdt:P21 wd:Q6581097; rdfs:label ?item_label; FILTER(LANG(?item_label) = 'en')} LIMIT 1000",
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 }
            ],
            isDynamic: true,
            updateSparql:  `SELECT ?item ?itemLabel WHERE {
  VALUES ?search { "SEARCH_TERM" }

  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org";
                     wikibase:api "EntitySearch";
                     mwapi:search ?search;
                     mwapi:language "en".
    ?item wikibase:apiOutputItem mwapi:item.
  }

  ?item wdt:P31 wd:Q5;          
        wdt:P21 wd:Q6581097.    

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`
        },
        {
            slug: "nba_players",
            name: "NBA Players",
            sparql: `SELECT DISTINCT ?item ?item_label WHERE {
  ?item wdt:P106 wd:Q3665646;
    wdt:P118 wd:Q155223;
    rdfs:label ?item_label.
  FILTER((LANG(?item_label)) = "en")
}`,
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 },
                { level: 4, limit: 200 },
                { level: 5, limit: 500 }
            ]
        },
        {
            slug: "disease",
            name: "Diseases",
            sparql: `SELECT DISTINCT ?item ?item_label WHERE {
  ?item wdt:P31 wd:Q12136;
    rdfs:label ?item_label.
  FILTER((LANG(?item_label)) = "en")
}`,
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 }
            ]
        },
        {
            slug: "tv_series",
            name: "Television Series",
            sparql: `SELECT DISTINCT ?item ?item_label WHERE {
  ?item wdt:P31 wd:Q5398426;
    rdfs:label ?item_label.
  FILTER((LANG(?item_label)) = "en")
}
LIMIT 1000`,
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 }
            ],
            isDynamic: true,
            updateSparql:  `SELECT ?item ?itemLabel WHERE {
  VALUES ?search { "SEARCH_TERM" }

  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org";
                     wikibase:api "EntitySearch";
                     mwapi:search ?search;
                     mwapi:language "en".
    ?item wikibase:apiOutputItem mwapi:item.
  }

  ?item wdt:P31 wd:Q5398426;           

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`
        },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                slug: cat.slug,
                name: cat.name,
                sparql: cat.sparql,
                difficulties: {
                    create: cat.difficulties.map(d => ({
                        level: d.level,
                        limit: d.limit
                    }))
                }
            }
        });
    }
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })