// Maps property names to Wikidata values (ex. gender_list -> wdt:P21)
export interface PropertyMap {
  [propertyName: string]: string;
}

// Maps value labels to Wikidata QIDs (ex. Male -> Q6581097)
export interface ValueMap {
  [label: string]: string;
}

// Maps list of possible values for a property
export interface ValueMaps {
  [propertyName: string]: ValueMap;
}

// Maps value labels to category name constituents (ex. Male -> "Male", Singer -> "Singer from")
export interface NameMap {
  [label: string]: string;
}

// Auto-generated category object
export interface GeneratedCategory {
  name: string;
  slug: string;
  sparql: string;
  updateSparql: string;
}

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

// Generate a slug from a category name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generates a category name from a combination of properties and values
export function generateCategoryName(
  combination: string[],
  values: string[],
  nameMap: NameMap
): string {
  if (combination.length !== values.length) {
    throw new Error("Combination and values arrays must have the same length");
  }

  const nameParts: string[] = [];
  for (const value of values) {
    const namePart = nameMap[value];
    if (!namePart) {
      console.warn(`Warning: No name mapping found for value: ${value}`);
      nameParts.push(value);
    } else {
      nameParts.push(namePart);
    }
  }
  return nameParts.join(" ").trim();
}

// Generates a SPARQL query from a combination of properties and values
export function generateSparql(
  combination: string[],
  values: string[],
  propertyMap: PropertyMap
): string {
  if (combination.length !== values.length) {
    throw new Error("Combination and values arrays must have the same length");
  }

  const pairs: string[] = [];
  for (let i = 0; i < combination.length; i++) {
    const property = propertyMap[combination[i]];
    if (!property) {
      throw new Error(`Property mapping not found for: ${combination[i]}`);
    }

    pairs.push(`${property} wd:${values[i]}`);
  }

  // Build the SPARQL query by replacing template placeholders
  let query = SPARQL_TEMPLATE;

  // Build the property-value constraints
  // Format: ?item wdt:P21 wd:Q6581097; wdt:P106 wd:Q177220; wdt:P27 wd:Q16.
  const constraints = pairs
    .map((pair, idx) => {
      if (pairs.length === 1) {
        // Only one pair - use period
        return `  ?item ${pair}.`;
      } else if (idx === 0) {
        // First pair of multiple - use semicolon
        return `  ?item ${pair};`;
      } else if (idx === pairs.length - 1) {
        // Last pair - use period
        return `        ${pair}.`;
      } else {
        // Middle pairs - use semicolon
        return `        ${pair};`;
      }
    })
    .join("\n");

  // Replace the template placeholder with actual constraints
  query = query.replace("REPLACE_CONSTRAINTS", constraints);

  return query;
}

export function generateAllCategories(
  propertyMap: PropertyMap,
  valueMaps: ValueMaps,
  nameMap: NameMap,
  combinations: string[][]
): GeneratedCategory[] {
  const categories: GeneratedCategory[] = [];

  for (const combination of combinations) {
    // Validate that all properties in combination exist
    for (const prop of combination) {
      if (!propertyMap[prop]) {
        throw new Error(`Property mapping not found for: ${prop}`);
      }
      if (!valueMaps[prop]) {
        throw new Error(`Value map not found for: ${prop}`);
      }
    }

    // Generate all combinations of values
    const valueArrays: string[][] = combination.map((prop) =>
      Object.keys(valueMaps[prop])
    );

    // Generate cartesian product of all value arrays
    const valueCombinations = cartesianProduct(valueArrays);

    for (const valueLabels of valueCombinations) {
      // Get the QIDs for these values
      const valueQids = valueLabels.map((label, idx) => {
        const prop = combination[idx];
        const qid = valueMaps[prop][label];
        if (!qid) {
          throw new Error(`QID not found for ${prop}: ${label}`);
        }
        return qid;
      });

      // Generate category name
      const name = generateCategoryName(combination, valueLabels, nameMap);
      const slug = generateSlug(name);

      // Generate SPARQL query
      const sparql = generateSparql(combination, valueQids, propertyMap);

      categories.push({
        name,
        slug,
        sparql,
        updateSparql: sparql, // Same query for both
      });
    }
  }

  return categories;
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map((item) => [item]);

  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);

  const result: T[][] = [];
  for (const item of first) {
    for (const restItems of restProduct) {
      result.push([item, ...restItems]);
    }
  }

  return result;
}
