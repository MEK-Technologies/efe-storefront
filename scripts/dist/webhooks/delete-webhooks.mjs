import {
  env
} from "../chunk-BVYEX35F.mjs";

// scripts/webhooks/delete-webhooks.ts
import { createAdminApiClient } from "@shopify/admin-api-client";
var LIST_WEBHOOKS_QUERY = `#graphql
  query listAllWebhooks($first: Int!, $after: String) {
    webhookSubscriptions(first: $first, after: $after) {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
var DELETE_WEBHOOK_MUTATION = `#graphql
  mutation webhookSubscriptionDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      userErrors {
        field
        message
      }
      deletedWebhookSubscriptionId
    }
  }
`;
async function deleteWebhooks(options = {}) {
  var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const { filter: filter2, dryRun: dryRun2 = false, force: force2 = false } = options;
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
  console.log("\u{1F5D1}\uFE0F  Deleting webhooks for Shopify store:", env.SHOPIFY_STORE_DOMAIN);
  if (dryRun2) {
    console.log("\u26A0\uFE0F  DRY RUN MODE - No webhooks will be deleted");
  }
  try {
    console.log("\n\u{1F4CB} Fetching all webhooks...");
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
      const webhooks = ((_b = (_a2 = response.data) == null ? void 0 : _a2.webhookSubscriptions) == null ? void 0 : _b.edges) || [];
      allWebhooks.push(...webhooks);
      hasNextPage = ((_e = (_d = (_c = response.data) == null ? void 0 : _c.webhookSubscriptions) == null ? void 0 : _d.pageInfo) == null ? void 0 : _e.hasNextPage) || false;
      cursor = ((_h = (_g = (_f = response.data) == null ? void 0 : _f.webhookSubscriptions) == null ? void 0 : _g.pageInfo) == null ? void 0 : _h.endCursor) || null;
    }
    if (allWebhooks.length === 0) {
      console.log("\u2705 No webhooks found to delete");
      return;
    }
    console.log(`\u{1F4CA} Found ${allWebhooks.length} webhook(s)`);
    let webhooksToDelete = allWebhooks;
    if (filter2) {
      webhooksToDelete = allWebhooks.filter((webhook) => {
        var _a3;
        const topic = webhook.node.topic;
        const url = ((_a3 = webhook.node.endpoint) == null ? void 0 : _a3.callbackUrl) || "";
        return topic.toLowerCase().includes(filter2.toLowerCase()) || url.toLowerCase().includes(filter2.toLowerCase());
      });
      console.log(`\u{1F50D} Filtered to ${webhooksToDelete.length} webhook(s) matching "${filter2}"`);
    }
    if (webhooksToDelete.length === 0) {
      console.log("\u2705 No webhooks matched the filter criteria");
      return;
    }
    console.log("\n\u{1F4DD} Webhooks to delete:");
    webhooksToDelete.forEach((webhook, index) => {
      var _a3;
      console.log(`
${index + 1}. Topic: ${webhook.node.topic}`);
      console.log(`   ID: ${webhook.node.id}`);
      console.log(`   URL: ${((_a3 = webhook.node.endpoint) == null ? void 0 : _a3.callbackUrl) || "N/A"}`);
    });
    if (!force2 && !dryRun2) {
      console.log(`
\u26A0\uFE0F  This will delete ${webhooksToDelete.length} webhook(s).`);
      console.log("   Use --force to skip this confirmation.");
      console.log("   Press Ctrl+C to cancel.\n");
      await new Promise((resolve) => {
        console.log("Waiting 5 seconds before proceeding...");
        setTimeout(resolve, 5e3);
      });
    }
    if (!dryRun2) {
      console.log("\n\u{1F680} Deleting webhooks...");
      let deletedCount = 0;
      let errorCount = 0;
      for (const webhook of webhooksToDelete) {
        try {
          const response = await client.request(DELETE_WEBHOOK_MUTATION, {
            variables: {
              id: webhook.node.id
            }
          });
          if (((_k = (_j = (_i = response.data) == null ? void 0 : _i.webhookSubscriptionDelete) == null ? void 0 : _j.userErrors) == null ? void 0 : _k.length) > 0) {
            console.error(`\u274C Failed to delete webhook ${webhook.node.id}:`);
            response.data.webhookSubscriptionDelete.userErrors.forEach((error) => {
              console.error(`   - ${error.field}: ${error.message}`);
            });
            errorCount++;
          } else {
            console.log(`\u2705 Deleted webhook: ${webhook.node.topic}`);
            deletedCount++;
          }
        } catch (error) {
          console.error(`\u274C Error deleting webhook ${webhook.node.id}:`, error);
          errorCount++;
        }
      }
      console.log(`
\u{1F4CA} Summary: ${deletedCount} deleted, ${errorCount} errors`);
    } else {
      console.log("\n\u2705 DRY RUN complete - no webhooks were deleted");
    }
  } catch (error) {
    console.error("\u274C Failed to delete webhooks:", error);
    process.exit(1);
  }
}
var args = process.argv.slice(2);
var _a;
var filter = (_a = args.find((arg) => arg.startsWith("--filter="))) == null ? void 0 : _a.split("=")[1];
var dryRun = args.includes("--dry-run");
var force = args.includes("--force");
if (args.includes("--help")) {
  console.log(`
Shopify Webhook Deletion Script

Usage: yarn webhooks:delete [options]

Options:
  --filter=<text>   Only delete webhooks matching this text in topic or URL
  --dry-run         Show what would be deleted without actually deleting
  --force           Skip confirmation prompt
  --help            Show this help message

Examples:
  # Delete all webhooks (with confirmation)
  yarn webhooks:delete

  # Delete only product-related webhooks
  yarn webhooks:delete --filter=product

  # Delete webhooks for a specific URL
  yarn webhooks:delete --filter=ngrok.io

  # See what would be deleted without actually deleting
  yarn webhooks:delete --dry-run

  # Delete all webhooks without confirmation
  yarn webhooks:delete --force
`);
  process.exit(0);
}
deleteWebhooks({ filter, dryRun, force });
