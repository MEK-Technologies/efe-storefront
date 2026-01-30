import {
  env
} from "../chunk-BVYEX35F.mjs";

// scripts/webhooks/setup-webhooks.ts
import { createAdminApiClient } from "@shopify/admin-api-client";
var WEBHOOK_TOPICS = [
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "PRODUCTS_DELETE",
  "COLLECTIONS_CREATE",
  "COLLECTIONS_UPDATE",
  "COLLECTIONS_DELETE"
];
var CREATE_WEBHOOK_MUTATION = `#graphql
  mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }
`;
var LIST_WEBHOOKS_QUERY = `#graphql
  query listWebhooks($first: Int!, $topics: [WebhookSubscriptionTopic!]) {
    webhookSubscriptions(first: $first, topics: $topics) {
      edges {
        node {
          id
          topic
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
    }
  }
`;
async function setupWebhooks(options = {}) {
  var _a2, _b, _c, _d, _e, _f, _g, _h, _i;
  const { apiDomain: apiDomain2 = process.env.WEBHOOK_API_DOMAIN || "http://localhost:3000", dryRun: dryRun2 = false } = options;
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_ADMIN_ACCESS_TOKEN || !env.SHOPIFY_APP_API_SECRET_KEY) {
    console.error("\u274C Missing required environment variables:");
    console.error("   - SHOPIFY_STORE_DOMAIN");
    console.error("   - SHOPIFY_ADMIN_ACCESS_TOKEN");
    console.error("   - SHOPIFY_APP_API_SECRET_KEY");
    process.exit(1);
  }
  const client = createAdminApiClient({
    storeDomain: env.SHOPIFY_STORE_DOMAIN,
    accessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: "2024-10"
  });
  console.log("\u{1F527} Setting up webhooks for Shopify store:", env.SHOPIFY_STORE_DOMAIN);
  console.log("\u{1F4CD} API Domain:", apiDomain2);
  console.log("\u{1F510} Using secret from SHOPIFY_APP_API_SECRET_KEY");
  if (dryRun2) {
    console.log("\u26A0\uFE0F  DRY RUN MODE - No webhooks will be created");
  }
  console.log("\n\u{1F4CB} Checking existing webhooks...");
  try {
    const existingWebhooks = await client.request(LIST_WEBHOOKS_QUERY, {
      variables: {
        first: 50,
        topics: WEBHOOK_TOPICS
      }
    });
    const existingTopics = new Set(
      ((_c = (_b = (_a2 = existingWebhooks.data) == null ? void 0 : _a2.webhookSubscriptions) == null ? void 0 : _b.edges) == null ? void 0 : _c.map((edge) => edge.node.topic)) || []
    );
    if (existingTopics.size > 0) {
      console.log("\u2139\uFE0F  Found existing webhooks for topics:");
      existingTopics.forEach((topic) => console.log(`   - ${topic}`));
    }
    console.log("\n\u{1F680} Registering webhooks...");
    const callbackUrl = `${apiDomain2}/api/feed/sync`;
    for (const topic of WEBHOOK_TOPICS) {
      if (existingTopics.has(topic)) {
        console.log(`\u23ED\uFE0F  Skipping ${topic} - already registered`);
        continue;
      }
      if (dryRun2) {
        console.log(`\u{1F504} [DRY RUN] Would create webhook for ${topic}`);
        continue;
      }
      try {
        const response = await client.request(CREATE_WEBHOOK_MUTATION, {
          variables: {
            topic,
            webhookSubscription: {
              callbackUrl,
              format: "JSON"
            }
          }
        });
        if (((_f = (_e = (_d = response.data) == null ? void 0 : _d.webhookSubscriptionCreate) == null ? void 0 : _e.userErrors) == null ? void 0 : _f.length) > 0) {
          console.error(`\u274C Failed to create webhook for ${topic}:`);
          response.data.webhookSubscriptionCreate.userErrors.forEach((error) => {
            console.error(`   - ${error.field}: ${error.message}`);
          });
        } else {
          console.log(`\u2705 Created webhook for ${topic}`);
          console.log(`   ID: ${(_i = (_h = (_g = response.data) == null ? void 0 : _g.webhookSubscriptionCreate) == null ? void 0 : _h.webhookSubscription) == null ? void 0 : _i.id}`);
          console.log(`   URL: ${callbackUrl}`);
        }
      } catch (error) {
        console.error(`\u274C Error creating webhook for ${topic}:`, error);
      }
    }
    console.log("\n\u2728 Webhook setup complete!");
    console.log("\n\u{1F4DD} Notes:");
    console.log("- Webhooks will be validated using HMAC with your SHOPIFY_APP_API_SECRET_KEY");
    console.log("- Make sure your endpoint is accessible from the internet in production");
    console.log("- Use ngrok or similar for local development testing");
  } catch (error) {
    console.error("\u274C Failed to setup webhooks:", error);
    process.exit(1);
  }
}
var args = process.argv.slice(2);
var _a;
var apiDomain = (_a = args.find((arg) => arg.startsWith("--domain="))) == null ? void 0 : _a.split("=")[1];
var dryRun = args.includes("--dry-run");
if (args.includes("--help")) {
  console.log(`
Shopify Webhook Setup Script

Usage: yarn webhooks:setup [options]

Options:
  --domain=<url>    API domain where webhooks will be sent (default: http://localhost:3000)
  --dry-run         Show what would be created without actually creating webhooks
  --help            Show this help message

Examples:
  yarn webhooks:setup
  yarn webhooks:setup --domain=https://myapp.com
  yarn webhooks:setup --dry-run
`);
  process.exit(0);
}
setupWebhooks({ apiDomain, dryRun });
