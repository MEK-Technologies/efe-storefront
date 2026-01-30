import { ImageResponse } from "next/og"
import { removeOptionsFromUrl } from "utils/product-options-utils"
import { env } from "env.mjs"
import { getProductByHandle } from "lib/medusa/data/product-queries"
import { getFeaturedImage, getMinPrice } from "utils/medusa-product-helpers"

export const revalidate = 86400

export const dynamic = "force-static"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image({ params: { slug } }: { params: { slug: string } }) {
  const baseUrl = env.LIVE_URL || "https://commerce.blazity.com"
  const interRegular = fetch(new URL(`${baseUrl}/fonts/Inter-Regular.ttf`)).then((res) => res.arrayBuffer())
  const interBold = fetch(new URL(`${baseUrl}/fonts/Inter-Bold.ttf`)).then((res) => res.arrayBuffer())

  const product = await getProductByHandle(removeOptionsFromUrl(slug))
  
  // Get featured image and price using helpers
  const featuredImage = product ? getFeaturedImage(product) : null
  const minPriceData = product ? getMinPrice(product.variants) : null
  const images = product?.images ?? []

  return new ImageResponse(
    (
      <div
        style={{
          border: "10px solid black",
          display: "flex",
          height: "100%",
          width: "100%",
          fontWeight: 400,
          background: "white",
        }}
      >
        <div
          style={{
            left: 120,
            top: 40,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "380px",
            height: "430px",
            backgroundColor: "#eaeaea",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse expects plain <img> */}
          <img
            src={featuredImage?.url}
            width={280}
            height={280}
            style={{ objectFit: "contain" }}
            alt={product?.title ?? "Featured product image"}
          />
        </div>
        <div
          style={{
            left: 120,
            top: 490,
            position: "absolute",
            display: "flex",
            width: "380px",
            height: "80px",
          }}
        >
          {images
            .slice(0, 4)
            .map((image, idx) => (
              /* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse expects plain <img> */
              <img
                key={idx}
                style={{
                  marginLeft: idx !== 0 ? "10px" : "0px",
                  backgroundColor: "#eaeaea",
                  border: "1px solid black",
                  padding: "5px",
                }}
                src={image.url}
                width={85}
                height={80}
                alt={
                  product?.title
                    ? `${product.title} image ${idx + 1}`
                    : "Product thumbnail"
                }
              />
            ))}
        </div>

        <div
          style={{
            height: "145px",
            overflow: "hidden",
            maxWidth: "450px",
            fontWeight: 400,
            fontSize: "48px",
            lineHeight: 1,
            position: "absolute",
            left: 600,
            top: 40,
            letterSpacing: "-0.05em",
          }}
        >
          {product?.title}
        </div>

        <div
          style={{
            height: "180px",
            overflow: "hidden",
            maxWidth: "500px",
            fontWeight: 400,
            fontSize: "21px",
            position: "absolute",
            left: 600,
            color: "#565656",
            top: 230,
          }}
        >
          {product?.description}
        </div>
        <div
          style={{
            fontSize: "70px",
            fontWeight: 900,
            lineHeight: 1,
            position: "absolute",
            left: 600,
            bottom: 60,
            textAlign: "left",
            letterSpacing: "-0.05em",
          }}
        >
          {minPriceData ? `${minPriceData.amount.toFixed(2)} ${minPriceData.currencyCode}` : ""}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await interBold,
          style: "normal",
          weight: 900,
        },
      ],
    }
  )
}
