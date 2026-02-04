import {
  env
} from "../chunk-BVYEX35F.mjs";

// scripts/webhooks/list-webhooks.ts
import { createAdminApiClient } from "@shopify/admin-api-client";
var LIST_WEBHOOKS_QUERY = `#graphql
  query listAllWebhooks($first: Int!, $after: String) {
    webhookSubscriptions(first: $first, after: $after) {
      edges {
        node {
          id
          topic
          createdAt
          updatedAt
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
async function listWebhooks() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    console.error("\u274C Missing required environment variables:");
    console.error("   - SHOPIFY_STORE_DOMAIN");
    console.error("   - SHOPIFY_ADMIN_ACCESS_TOKEN");
    process.exit(1);
  }
  const client = createAdminApiClient({
    storeDomain: env.SHOPIFY_STORE_DOMAIN,
    accessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: "2024-10"
  });
  console.log("\u{1F4CB} Listing webhooks for:", env.SHOPIFY_STORE_DOMAIN);
  console.log("=".repeat(60));
  try {
    const allWebhooks = [];
    let hasNextPage = true;
    let cursor = null;
    while (hasNextPage) {
      const response = await client.request(LIST_WEBHOOKS_QUERY, {
        variables: {
          first: 50,
          after: cursor
        }
      });
      const webhooks = ((_b = (_a = response.data) == null ? void 0 : _a.webhookSubscriptions) == null ? void 0 : _b.edges) || [];
      allWebhooks.push(...webhooks);
      hasNextPage = ((_e = (_d = (_c = response.data) == null ? void 0 : _c.webhookSubscriptions) == null ? void 0 : _d.pageInfo) == null ? void 0 : _e.hasNextPage) || false;
      cursor = ((_h = (_g = (_f = response.data) == null ? void 0 : _f.webhookSubscriptions) == null ? void 0 : _g.pageInfo) == null ? void 0 : _h.endCursor) || null;
    }
    if (allWebhooks.length === 0) {
      console.log("\n\u2705 No webhooks found");
      console.log("\nTo create webhooks, run: yarn webhooks:setup");
      return;
    }
    console.log(`
\u{1F4CA} Found ${allWebhooks.length} webhook(s):
`);
    const groupedByUrl = allWebhooks.reduce(
      (acc, webhook) => {
        var _a2;
        const url = ((_a2 = webhook.node.endpoint) == null ? void 0 : _a2.callbackUrl) || "No URL";
        if (!acc[url]) acc[url] = [];
        acc[url].push(webhook.node);
        return acc;
      },
      {}
    );
    Object.entries(groupedByUrl).forEach(([url, webhooks]) => {
      console.log(`\u{1F517} Endpoint: ${url}`);
      console.log(`   Webhooks (${webhooks.length}):`);
      webhooks.forEach((webhook) => {
        console.log(`   - ${webhook.topic}`);
        console.log(`     ID: ${webhook.id}`);
        console.log(`     Created: ${new Date(webhook.createdAt).toLocaleString()}`);
        if (webhook.updatedAt !== webhook.createdAt) {
          console.log(`     Updated: ${new Date(webhook.updatedAt).toLocaleString()}`);
        }
      });
      console.log("");
    });
    const topics = allWebhooks.map((w) => w.node.topic);
    const uniqueTopics = Array.from(new Set(topics));
    console.log("\u{1F4C8} Summary:");
    console.log(`   Total webhooks: ${allWebhooks.length}`);
    console.log(`   Unique topics: ${uniqueTopics.length}`);
    console.log(`   Endpoints: ${Object.keys(groupedByUrl).length}`);
  } catch (error) {
    console.error("\u274C Failed to list webhooks:", error);
    process.exit(1);
  }
}
var args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(`
Shopify Webhook List Script

Usage: yarn webhooks:list

This script lists all webhooks registered for your Shopify store via the Admin API.

Note: Webhooks created through the Shopify Admin Panel (Settings > Notifications)
are separate and will not be shown here.
`);
  process.exit(0);
}
listWebhooks();
