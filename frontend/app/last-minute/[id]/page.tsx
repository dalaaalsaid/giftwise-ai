import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Gift,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  readyBoxTemplates,
} from "../../../lib/readyMadeBoxes";

import styles from "./ReadyBoxDetails.module.css";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_qty: number;
  category_ids: string[];
  image_url: string | null;
  is_active: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/products`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export default async function ReadyBoxDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const template =
    readyBoxTemplates.find(
      (box) => box.id === id
    );

  if (!template) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.notFound}>
            <Gift size={40} />

            <h1>
              Gift box not found.
            </h1>

            <Link href="/last-minute">
              Back to Last-Minute Gifts
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const products =
    await getProducts();

  const includedProducts =
    template.productNames
      .map((name) =>
        products.find(
          (product) =>
            product.name === name
        )
      )
      .filter(
        (
          product
        ): product is Product =>
          Boolean(product)
      );

  const productsTotal =
    includedProducts.reduce(
      (total, product) =>
        total + product.price,
      0
    );

  const total =
    productsTotal +
    template.boxFee;

  const mainImage =
    includedProducts.find(
      (product) =>
        product.image_url
    )?.image_url ?? null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link
          href="/last-minute"
          className={styles.backLink}
        >
          <ArrowLeft size={17} />
          Back to Last-Minute Gifts
        </Link>

        <section className={styles.hero}>
          <div className={styles.heroVisual}>
            {mainImage ? (
              <img
                src={mainImage}
                alt={template.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            ) : (
              <Gift
                size={105}
                strokeWidth={1.05}
              />
            )}

            {mainImage && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(40, 25, 30, 0.03), rgba(40, 25, 30, 0.18))",
                  pointerEvents: "none",
                }}
              />
            )}

            <div
              className={styles.occasionBadge}
              style={{
                position: "absolute",
                zIndex: 3,
              }}
            >
              <Clock3 size={13} />
              {template.occasion}
            </div>

            <span
              className={styles.sparkleOne}
              style={{
                zIndex: 3,
              }}
            >
              <Sparkles size={22} />
            </span>

            <span
              className={styles.sparkleTwo}
              style={{
                zIndex: 3,
              }}
            >
              ✦
            </span>
          </div>

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              Ready-Made Gift Box
            </span>

            <h1>
              {template.name}
            </h1>

            <h2>
              {template.subtitle}
            </h2>

            <p>
              {template.description}
            </p>

            <div className={styles.quickInfo}>
              <div>
                <strong>
                  {includedProducts.length}
                </strong>

                <span>
                  products inside
                </span>
              </div>

              <div>
                <strong>
                  ${total.toFixed(2)}
                </strong>

                <span>
                  complete box
                </span>
              </div>

              <div>
                <strong>
                  Ready
                </strong>

                <span>
                  for quick gifting
                </span>
              </div>
            </div>

            <Link
              href="/cart"
              className={styles.cartButton}
            >
              <ShoppingBag size={17} />
              Continue to cart
            </Link>
          </div>
        </section>

        <section
          className={
            styles.contentsSection
          }
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <div>
              <span>
                Inside the box
              </span>

              <h2>
                See exactly what
                they&apos;ll receive.
              </h2>

              <p>
                Review every product
                included before
                ordering.
              </p>
            </div>
          </div>

          <div
            className={
              styles.productsGrid
            }
          >
            {includedProducts.map(
              (
                product,
                index
              ) => (
                <article
                  className={
                    styles.productCard
                  }
                  key={product.id}
                >
                  <div
                    className={`${styles.productImage} ${
                      styles[
                        `image${(index % 4) + 1}`
                      ]
                    }`}
                  >
                    {product.image_url ? (
                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.name
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                          objectPosition:
                            "center",
                        }}
                      />
                    ) : (
                      <Gift
                        size={58}
                        strokeWidth={
                          1.1
                        }
                      />
                    )}

                    <div
                      className={
                        styles.includedBadge
                      }
                    >
                      <Check
                        size={12}
                      />
                      Included
                    </div>
                  </div>

                  <div
                    className={
                      styles.productContent
                    }
                  >
                    <span>
                      GiftWise product
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {
                        product.description
                      }
                    </p>

                    <div
                      className={
                        styles.productFooter
                      }
                    >
                      <strong>
                        $
                        {product.price.toFixed(
                          2
                        )}
                      </strong>

                      <Link
                        href={`/shop/${product.id}`}
                      >
                        View product
                      </Link>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section
          className={
            styles.summary
          }
        >
          <div>
            <span>
              Ready-made package
            </span>

            <h2>
              Everything together,
              ready to gift.
            </h2>

            <p>
              Includes all listed
              products plus GiftWise
              gift-ready packaging.
            </p>
          </div>

          <div
            className={styles.price}
          >
            <span>
              Total box price
            </span>

            <strong>
              ${total.toFixed(2)}
            </strong>
          </div>
        </section>
      </div>
    </main>
  );
}