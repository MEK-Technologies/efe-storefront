import {
  env
} from "../chunk-BVYEX35F.mjs";

// lib/algolia/sync-service.ts
import { isDeepEqual, omit } from "remeda";

// constants/index.ts
var HIERARCHICAL_SEPARATOR = " > ";

// lib/medusa/config.ts
import Medusa from "@medusajs/js-sdk";
var sdk = new Medusa({
  baseUrl: env.MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
});
console.log("Medusa SDK initialized with publishable key:", env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY);

// lib/algolia/client.ts
import {
  algoliasearch
} from "algoliasearch";

// lib/algolia/config.ts
function isAlgoliaConfigured() {
  return !!(env.ALGOLIA_APP_ID && env.ALGOLIA_WRITE_API_KEY && env.ALGOLIA_PRODUCTS_INDEX && env.ALGOLIA_CATEGORIES_INDEX);
}
function requireAlgolia(operation) {
  if (!isAlgoliaConfigured()) {
    throw new Error(
      `Algolia is not configured properly. Operation '${operation}' requires ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY, ALGOLIA_PRODUCTS_INDEX, and ALGOLIA_CATEGORIES_INDEX environment variables. Please check your .env.local file.`
    );
  }
}
function getAlgoliaConfig() {
  return {
    appId: env.ALGOLIA_APP_ID,
    apiKey: env.ALGOLIA_WRITE_API_KEY,
    productsIndex: env.ALGOLIA_PRODUCTS_INDEX,
    categoriesIndex: env.ALGOLIA_CATEGORIES_INDEX,
    reviewsIndex: env.ALGOLIA_REVIEWS_INDEX
  };
}
function logAlgoliaOperation(operation, details) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Algolia] ${operation}`, details || "");
  }
}
function validateAlgoliaIndices() {
  const config = getAlgoliaConfig();
  if (!config.productsIndex) {
    throw new Error("ALGOLIA_PRODUCTS_INDEX is required for Algolia operations");
  }
  if (!config.categoriesIndex) {
    throw new Error("ALGOLIA_CATEGORIES_INDEX is required for Algolia operations");
  }
}

// lib/algolia/filter-builder.ts
var FilterBuilder = class {
  constructor() {
    this.expression = [];
  }
  hasFilters() {
    return this.expression.length > 0;
  }
  where(attribute, value) {
    if (!value) return this;
    this.expression.push(`${attribute}:${this.formatValue(value)}`);
    return this;
  }
  multi(attribute, values, operator = "OR" /* Or */) {
    if (!values || values.length === 0) return this;
    const conditions = values.map((value) => `${attribute}:${this.formatValue(value)}`);
    this.expression.push(`(${conditions.join(` ${operator} `)})`);
    return this;
  }
  and() {
    this.expression.push("AND" /* And */);
    return this;
  }
  or() {
    this.expression.push("OR" /* Or */);
    return this;
  }
  not() {
    this.expression.push("NOT" /* Not */);
    return this;
  }
  raw(expression) {
    this.expression.push(expression);
    return this;
  }
  to(attribute, min, max) {
    if (!min || !max) return this;
    this.expression.push(`${attribute}:${min} TO ${max}`);
    return this;
  }
  numeric(attribute, value, operator = "=" /* Equal */) {
    if (!value) return this;
    this.expression.push(`${attribute} ${operator} ${value}`);
    return this;
  }
  build(operator) {
    if (this.expression.length === 0) return "";
    return this.expression.join(operator ? ` ${operator} ` : " ").trim();
  }
  formatValue(value) {
    if (typeof value === "string") {
      return `"${value}"`;
    }
    return value.toString();
  }
};

// lib/algolia/client.ts
var algoliaClient = (args) => {
  return algoliasearch(args.applicationId, args.apiKey);
};
var algolia = (args) => {
  const client = algoliaClient(args);
  const recommendationClient = client.initRecommend();
  return {
    search: async (args2) => search(args2, client),
    getAllResults: async (args2) => getAllResults(client, args2),
    update: async (args2) => {
      const transformedArgs = {
        ...args2,
        objects: args2.objects.map((obj) => {
          var _a;
          return {
            ...obj,
            objectID: obj.objectID || ((_a = obj.id) == null ? void 0 : _a.toString()) || obj.id
          };
        })
      };
      return updateObjects(transformedArgs, client);
    },
    batchUpdate: async (args2) => batchUpdate(args2, client),
    delete: async (args2) => deleteObjects(args2, client),
    create: async (args2) => createObjects(args2, client),
    multiSearch: async (args2) => multiSearch(args2, client),
    getRecommendations: async (args2) => getRecommendations(recommendationClient, args2),
    getFacetValues: async (args2) => getFacetValues(client, args2),
    filterBuilder: () => new FilterBuilder(),
    mapIndexToSort
  };
};
var search = async (args, client) => {
  return client.searchSingleIndex(args);
};
var getAllResults = async (client, args) => {
  const allHits = [];
  let totalPages;
  let cursor;
  do {
    const {
      hits,
      nbPages,
      cursor: nextCursor
    } = await client.browse({
      ...args,
      browseParams: {
        ...args.browseParams,
        hitsPerPage: 1e3,
        cursor
      }
    });
    allHits.push(...hits);
    totalPages = nbPages || 0;
    cursor = nextCursor;
  } while (cursor);
  return { hits: allHits, totalPages };
};
var batchUpdate = async (args, client) => {
  return client.batch(args);
};
var updateObjects = async (args, client) => {
  return client.partialUpdateObjects(args);
};
var deleteObjects = async (args, client) => {
  return client.deleteObjects(args);
};
var createObjects = async (args, client) => {
  return client.partialUpdateObjects({
    ...args,
    createIfNotExists: true
  });
};
var multiSearch = async (args, client) => {
  return client.search(args);
};
var getRecommendations = async (client, args) => {
  return client.getRecommendations(args);
};
var getFacetValues = async (client, args) => {
  return client.searchForFacetValues(args);
};
var mapIndexToSort = (index, sortOption) => {
  switch (sortOption) {
    case "minPrice:desc":
      return `${index}_price_desc`;
    case "minPrice:asc":
      return `${index}_price_asc`;
    case "avgRating:desc":
      return `${index}_rating_desc`;
    case "updatedAtTimestamp:asc":
      return `${index}_updated_asc`;
    case "updatedAtTimestamp:desc":
      return `${index}_updated_desc`;
    default:
      return index;
  }
};
var searchClient = (() => {
  try {
    requireAlgolia("searchClient initialization");
    logAlgoliaOperation("Initializing Algolia client", {
      appId: env.ALGOLIA_APP_ID,
      hasApiKey: !!env.ALGOLIA_WRITE_API_KEY
    });
    return algolia({
      applicationId: env.ALGOLIA_APP_ID || "",
      apiKey: env.ALGOLIA_WRITE_API_KEY || ""
    });
  } catch (error) {
    console.error("[Algolia] Configuration error:", error);
    return {
      search: async () => {
        throw new Error("Algolia not configured");
      },
      getAllResults: async () => {
        throw new Error("Algolia not configured");
      },
      update: async () => {
        throw new Error("Algolia not configured");
      },
      batchUpdate: async () => {
        throw new Error("Algolia not configured");
      },
      delete: async () => {
        throw new Error("Algolia not configured");
      },
      create: async () => {
        throw new Error("Algolia not configured");
      },
      multiSearch: async () => {
        throw new Error("Algolia not configured");
      },
      getRecommendations: async () => {
        throw new Error("Algolia not configured");
      },
      getFacetValues: async () => {
        throw new Error("Algolia not configured");
      },
      filterBuilder: () => new FilterBuilder(),
      mapIndexToSort: (index, _sortOption) => index
    };
  }
})();

// lib/replicate/index.ts
import Replicate from "replicate";
var replicateClient = () => {
  if (!env.REPLICATE_API_KEY) return null;
  return new Replicate({
    auth: env.REPLICATE_API_KEY || ""
  });
};
var replicate = replicateClient();
var generateImageCaption = async (imageUrl) => {
  if (!replicate) return;
  return await replicate.run("salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746", {
    input: {
      task: "image_captioning",
      image: imageUrl
    }
  });
};

// utils/opt-in.ts
var features = {
  reviews: {
    message: "No keys provided for reviews feature, to opt-in set environment variables: JUDGE_API_TOKEN, JUDGE_BASE_URL, SHOPIFY_STORE_DOMAIN, ALGOLIA_REVIEWS_INDEX",
    predicate: !!env.JUDGE_BASE_URL && !!env.JUDGE_API_TOKEN && !!env.SHOPIFY_STORE_DOMAIN && env.ALGOLIA_REVIEWS_INDEX
  },
  "ai-reviews": {
    message: "No keys provided for ai reviews summary feautre, to opt-in set envrioment variables: OpenAI API, JUDGE_API_TOKEN ",
    predicate: !!env.OPENAI_API_KEY
  },
  altTags: {
    message: "No keys provided for alt tags feature, to opt-in set environment variables: REPLICATE_API_KEY",
    predicate: !!env.REPLICATE_API_KEY
  }
};
var isOptIn = (feature) => {
  return features[feature].predicate;
};

// utils/enrich-product.ts
var ProductEnrichmentBuilder = class {
  constructor(baseProduct) {
    this.product = baseProduct;
  }
  withHierarchicalCategories(collections, separator) {
    var _a;
    const categoryMap = buildCategoryMap(collections);
    if (!categoryMap.size) {
      return this;
    }
    const tags = ((_a = this.product.tags) == null ? void 0 : _a.map((t) => t.value)) ?? [];
    this.product = {
      ...this.product,
      hierarchicalCategories: generateHierarchicalCategories(tags, categoryMap, separator)
    };
    return this;
  }
  async withAltTags() {
    if (!isOptIn("altTags")) {
      return this;
    }
    try {
      const images = await generateProductAltTags(this.product);
      this.product = {
        ...this.product,
        images: images.filter(Boolean)
      };
    } catch (e) {
    }
    return this;
  }
  build() {
    return this.product;
  }
};
async function generateProductAltTags(product) {
  try {
    const images = product.images ?? [];
    const altTagAwareImages = await Promise.all(images.slice(0, 1).map(mapper).filter(Boolean));
    return [...altTagAwareImages, ...images.slice(1).filter(Boolean)];
  } catch (e) {
    return product.images ?? [];
  }
}
async function mapper(image) {
  const output = await generateImageCaption(image.url);
  return { ...image, altText: (output == null ? void 0 : output.replace("Caption:", "")) || "" };
}
function buildCategoryMap(items) {
  const categoryMap = /* @__PURE__ */ new Map();
  const traverse = (items2, path) => {
    var _a, _b;
    for (const item of items2) {
      const newPath = [...path, ((_a = item.resource) == null ? void 0 : _a.handle) || ""];
      categoryMap.set(((_b = item.resource) == null ? void 0 : _b.handle) || "", newPath);
      if (item.items && item.items.length > 0) {
        traverse(item.items, newPath);
      }
    }
  };
  traverse(items, []);
  return categoryMap;
}
function generateHierarchicalCategories(tags, categoryMap, separator = " > ") {
  const hierarchicalCategories = { lvl0: [], lvl1: [], lvl2: [] };
  tags.forEach((tag) => {
    const path = categoryMap.get(tag);
    if (path) {
      if (path.length > 0 && !hierarchicalCategories.lvl0.includes(path[0])) {
        hierarchicalCategories.lvl0.push(path[0]);
      }
      if (path.length > 1) {
        const lvl1Path = path.slice(0, 2).join(separator);
        if (!hierarchicalCategories.lvl1.includes(lvl1Path)) {
          hierarchicalCategories.lvl1.push(lvl1Path);
        }
      }
      if (path.length > 2) {
        const lvl2Path = path.slice(0, 3).join(separator);
        if (!hierarchicalCategories.lvl2.includes(lvl2Path)) {
          hierarchicalCategories.lvl2.push(lvl2Path);
        }
      }
    }
  });
  return hierarchicalCategories;
}

// lib/algolia/sync-service.ts
async function getAllProductsFromMedusa() {
  let allProducts = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { products, count } = await sdk.client.fetch(
      "/store/products",
      {
        query: {
          limit,
          offset,
          fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.options,*variants.images,+metadata,+tags"
        }
      }
    );
    if (!products.length) break;
    allProducts = [...allProducts, ...products];
    offset += limit;
    if (products.length < limit) break;
    if (allProducts.length >= count) break;
  }
  return allProducts;
}
async function getAllCategoriesFromMedusa() {
  let allCategories = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { product_categories, count } = await sdk.client.fetch(
      "/store/product-categories",
      {
        query: {
          limit,
          offset,
          fields: "+category_children"
        }
      }
    );
    if (!product_categories.length) break;
    allCategories = [...allCategories, ...product_categories];
    offset += limit;
    if (product_categories.length < limit) break;
    if (allCategories.length >= count) break;
  }
  return allCategories;
}
async function syncMedusaToAlgolia() {
  console.log("\u{1F680} Starting sync process (Medusa -> Algolia)...");
  if (!isAlgoliaConfigured()) {
    console.error("\u274C Algolia is not properly configured");
    console.log("Run 'npm run algolia:setup' to configure Algolia");
    throw new Error("Algolia configuration incomplete");
  }
  try {
    requireAlgolia("sync operation");
    validateAlgoliaIndices();
  } catch (error) {
    console.error("\u274C Configuration error:", error);
    throw error;
  }
  logAlgoliaOperation("Starting sync", {
    productsIndex: env.ALGOLIA_PRODUCTS_INDEX,
    categoriesIndex: env.ALGOLIA_CATEGORIES_INDEX
  });
  const allProducts = await getAllProductsFromMedusa();
  console.log(`\u{1F4E6} Fetched ${allProducts.length} products from Medusa`);
  const allCategories = await getAllCategoriesFromMedusa();
  console.log(`\u{1F4D1} Fetched ${allCategories.length} categories from Medusa`);
  if (!allProducts.length && !allCategories.length) {
    console.warn("\u26A0\uFE0F No products or categories found, nothing to sync");
    return;
  }
  const hierarchicalNavItems = [];
  const enrichedProducts = await Promise.all(allProducts.map(async (product) => {
    const builder = new ProductEnrichmentBuilder(product).withHierarchicalCategories(hierarchicalNavItems, HIERARCHICAL_SEPARATOR);
    await builder.withAltTags();
    return builder.build();
  }));
  const { hits: algoliaProducts } = await searchClient.getAllResults({
    indexName: env.ALGOLIA_PRODUCTS_INDEX,
    browseParams: {}
  });
  const { hits: algoliaCategories } = await searchClient.getAllResults({
    indexName: env.ALGOLIA_CATEGORIES_INDEX
  });
  const deltaProducts = calculateDelta(enrichedProducts, algoliaProducts, (item) => item.id);
  const deltaCategories = calculateDelta(allCategories, algoliaCategories, (item) => item.id);
  console.log(`\u{1F50D} Delta - products: ${deltaProducts.length}, categories: ${deltaCategories.length}`);
  await updateAlgolia(env.ALGOLIA_PRODUCTS_INDEX, deltaProducts);
  await updateAlgolia(env.ALGOLIA_CATEGORIES_INDEX, deltaCategories);
  await deleteObsolete(
    env.ALGOLIA_PRODUCTS_INDEX,
    allProducts.map((p) => p.id)
  );
  await deleteObsolete(
    env.ALGOLIA_CATEGORIES_INDEX,
    allCategories.map((c) => c.id)
  );
  console.log("\u{1F389} Sync completed successfully!");
}
async function updateAlgolia(indexName, docs) {
  if (!docs.length) return;
  console.log(`\u{1F4E4} Updating ${docs.length} records in ${indexName}`);
  await searchClient.batchUpdate({
    indexName,
    batchWriteParams: {
      requests: docs.map((doc) => ({
        action: "partialUpdateObject",
        body: { ...doc, objectID: doc.id }
      }))
    }
  });
}
async function deleteObsolete(indexName, currentIds) {
  console.log(`\u{1F50D} Checking obsolete entries in ${indexName}`);
  const { hits } = await searchClient.getAllResults({
    indexName,
    browseParams: { attributesToRetrieve: ["objectID"] }
  });
  const existingIds = hits.map((h) => h.objectID);
  const toRemove = existingIds.filter((id) => !currentIds.includes(id));
  if (!toRemove.length) {
    console.log(`\u2728 No obsolete entries in ${indexName}`);
    return;
  }
  console.log(`\u{1F5D1}\uFE0F Deleting ${toRemove.length} obsolete entries from ${indexName}`);
  await searchClient.batchUpdate({
    indexName,
    batchWriteParams: {
      requests: toRemove.map((id) => ({
        action: "deleteObject",
        body: { objectID: id }
      }))
    }
  });
}
function calculateDelta(source, target, idFn) {
  const map = new Map(target.map((item) => [idFn(item), item]));
  return source.filter((item) => {
    const id = idFn(item);
    const existing = map.get(id);
    const normSource = omit({ ...item, objectID: id }, ["objectID"]);
    const normExisting = existing ? omit(existing, ["objectID"]) : null;
    return !existing || !isDeepEqual(normSource, normExisting);
  });
}

// scripts/sync/sync.ts
async function run() {
  try {
    await syncMedusaToAlgolia();
    process.exit(0);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}
run();
