import { prismaAdmin } from "../lib/prisma-admin";
import { generateSlug } from "./category-generator";
import * as fs from "fs";
import * as path from "path";

const SPARQL_TEMPLATE = `SELECT ?item ?itemLabel ?alias WHERE {
  VALUES ?search { "SEARCH_TERM" }

  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org";
                     wikibase:api "EntitySearch";
                     mwapi:search ?search;
                     mwapi:language "en".
    ?item wikibase:apiOutputItem mwapi:item.
  }

  REPLACE_CONSTRAINTS
  OPTIONAL {
    ?item skos:altLabel ?alias.
    FILTER(LANG(?alias) = "en")
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;

interface CategoryConfig {
  name: string;
  wdtValues: string[];
  wdValues: string[];
  tags: string[];
}

function generateSparqlQuery(wdtValues: string[], wdValues: string[]): string {
  if (wdtValues.length !== wdValues.length) {
    throw new Error(
      `wdtValues and wdValues must have the same length. Got ${wdtValues.length} and ${wdValues.length}`
    );
  }

  if (wdtValues.length === 0) {
    throw new Error("At least one wdt/wd pair is required");
  }

  const pairs: string[] = [];
  for (let i = 0; i < wdtValues.length; i++) {
    const wdt = wdtValues[i].startsWith("P") ? wdtValues[i] : `P${wdtValues[i]}`;
    const wd = wdValues[i].startsWith("Q") ? wdValues[i] : `Q${wdValues[i]}`;
    pairs.push(`wdt:${wdt} wd:${wd}`);
  }

  let constraints = "";
  if (pairs.length === 1) {
    constraints = `  ?item ${pairs[0]}.`;
  } else {
    constraints = pairs
      .map((pair, idx) => {
        if (idx === 0) {
          return `  ?item ${pair};`;
        } else if (idx === pairs.length - 1) {
          return `        ${pair}.`;
        } else {
          return `        ${pair};`;
        }
      })
      .join("\n");
  }

  return SPARQL_TEMPLATE.replace("REPLACE_CONSTRAINTS", constraints);
}

function validateConfig(config: any): CategoryConfig {
  if (!config.name || typeof config.name !== "string") {
    throw new Error("Config must have a 'name' field (string)");
  }

  if (!Array.isArray(config.wdtValues) || config.wdtValues.length === 0) {
    throw new Error("Config must have a 'wdtValues' field (non-empty array)");
  }

  if (!Array.isArray(config.wdValues) || config.wdValues.length === 0) {
    throw new Error("Config must have a 'wdValues' field (non-empty array)");
  }

  if (config.wdtValues.length !== config.wdValues.length) {
    throw new Error(
      `wdtValues and wdValues must have the same length. Got ${config.wdtValues.length} and ${config.wdValues.length}`
    );
  }

  for (const wdt of config.wdtValues) {
    if (typeof wdt !== "string") {
      throw new Error(`All wdtValues must be strings. Found: ${wdt}`);
    }
    const wdtClean = wdt.startsWith("P") ? wdt.slice(1) : wdt;
    if (!/^\d+$/.test(wdtClean)) {
      throw new Error(`Invalid wdt format: ${wdt}. Must be P followed by numbers or just numbers.`);
    }
  }

  for (const wd of config.wdValues) {
    if (typeof wd !== "string") {
      throw new Error(`All wdValues must be strings. Found: ${wd}`);
    }
    const wdClean = wd.startsWith("Q") ? wd.slice(1) : wd;
    if (!/^\d+$/.test(wdClean)) {
      throw new Error(`Invalid wd format: ${wd}. Must be Q followed by numbers or just numbers.`);
    }
  }

  if (!Array.isArray(config.tags)) {
    throw new Error("Config must have a 'tags' field (array)");
  }

  for (const tag of config.tags) {
    if (typeof tag !== "string") {
      throw new Error(`All tags must be strings. Found: ${tag}`);
    }
  }

  return config as CategoryConfig;
}

async function createCategory(config: CategoryConfig) {
  const slug = generateSlug(config.name);

  const existing = await prismaAdmin.category.findUnique({
    where: { slug },
  });

  if (existing) {
    console.warn(`Category with slug "${slug}" already exists. Updating...`);
  }

  const sparql = generateSparqlQuery(config.wdtValues, config.wdValues);
  const updateSparql = sparql; 

  const category = await prismaAdmin.category.upsert({
    where: { slug },
    update: {
      name: config.name,
      sparql,
      updateSparql,
      isDynamic: true,
      isDaily: false,
      tags: config.tags,
      updatedAt: new Date(),
    },
    create: {
      slug,
      name: config.name,
      sparql,
      updateSparql,
      isDynamic: true,
      isDaily: false,
      tags: config.tags,
      difficulties: {
        create: [
          { level: 1, limit: 10 },
          { level: 2, limit: 50 },
          { level: 3, limit: 100 },
        ],
      },
    },
  });

  if (existing) {
    const existingDifficulties = await prismaAdmin.difficulty.findMany({
      where: { categoryId: category.id },
    });

    if (existingDifficulties.length === 0) {
      console.log("Creating default difficulties for existing category...");
      await prismaAdmin.difficulty.createMany({
        data: [
          { categoryId: category.id, level: 1, limit: 10 },
          { categoryId: category.id, level: 2, limit: 50 },
          { categoryId: category.id, level: 3, limit: 100 },
        ],
      });
    }
  }

  return category;
}

async function main() {
  try {
    const jsonPath = path.join(process.cwd(), "scripts", "category-config.json");

    if (!fs.existsSync(jsonPath)) {
      console.error(`Error: JSON file not found at ${jsonPath}`);
      console.error(
        `Please create scripts/category-config.json with your category configuration.`
      );
      console.error(
        `Example structure:\n` +
        `{\n` +
        `  "name": "Anime: Shonen",\n` +
        `  "wdtValues": ["P31", "P136"],\n` +
        `  "wdValues": ["Q1107", "Q744038"],\n` +
        `  "tags": ["anime"]\n` +
        `}`
      );
      process.exit(1);
    }

    const jsonContent = fs.readFileSync(jsonPath, "utf-8");
    let config: any;
    try {
      config = JSON.parse(jsonContent);
    } catch (error) {
      console.error(`Error: Invalid JSON in ${jsonPath}`);
      console.error(error);
      process.exit(1);
    }

    const validatedConfig = validateConfig(config);

    console.log(`Creating category: ${validatedConfig.name}`);
    console.log(`Slug: ${generateSlug(validatedConfig.name)}`);
    console.log(`Tags: ${validatedConfig.tags.join(", ")}`);

    const category = await createCategory(validatedConfig);

    console.log(`\n✅ Category created successfully!`);
    console.log(`   ID: ${category.id}`);
    console.log(`   Slug: ${category.slug}`);
    console.log(`   Name: ${category.name}`);
    console.log(`   Tags: ${category.tags.join(", ")}`);
    console.log(`   Difficulties: 3 levels (10, 50, 100)`);
  } catch (error) {
    console.error("\n❌ Error creating category:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prismaAdmin.$disconnect();
  }
}

main()
  .then(() => {
    console.log("\nScript completed.");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Script failed:", e);
    await prismaAdmin.$disconnect();
    process.exit(1);
  });

