
import { getPayloadClient } from "../lib/payload-client"

async function main() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: "ordenes",
      sort: "-createdAt",
      limit: 1,
    })

    if (result.docs.length > 0) {
      console.log("Latest Order ID:", result.docs[0].id)
      console.log("Order Number:", result.docs[0].numero_orden)
    } else {
      console.log("No orders found.")
    }
  } catch (error) {
    console.error("Error fetching order:", error)
  }
  process.exit(0)
}

main()
