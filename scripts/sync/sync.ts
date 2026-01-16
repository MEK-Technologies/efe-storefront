import { syncMedusaToAlgolia } from "../../lib/algolia/sync-service"

async function run() {
  try {
    await syncMedusaToAlgolia()
    process.exit(0)
  } catch (error) {
    console.error("Sync failed:", error)
    process.exit(1)
  }
}

run()
