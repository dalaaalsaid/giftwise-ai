import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Gift,
  Heart,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import ProductActions from "./ProductActions";
import styles from "./ProductDetails.module.css";

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

async function getProduct(
  id: string
): Promise<Product | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const product =
    await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div
        className={styles.container}
      >
        <Link
          href="/shop"
          className={styles.backLink}
        >
          <ArrowLeft size={17} />
          Back to shop
        </Link>

        <section
          className={
            styles.productSection
          }
        >
          <div
            className={
              styles.visualColumn
            }
          >
            <div
              className={
                styles.productVisual
              }
            >
              <span
                className={styles.badge}
              >
                <Sparkles size={14} />
                GiftWise Pick
              </span>

              <button
                type="button"
                className={
                  styles.favoriteButton
                }
                aria-label={`Add ${product.name} to favorites`}
              >
                <Heart size={20} />
              </button>

              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={
                    styles.mainProductImage
                  }
                />
              ) : (
                <div
                  className={
                    styles.giftIcon
                  }
                >
                  <Gift
                    size={88}
                    strokeWidth={1.1}
                  />
                </div>
              )}

              <div
                className={
                  styles.decorativeCircleOne
                }
              />

              <div
                className={
                  styles.decorativeCircleTwo
                }
              />
            </div>

            <div
              className={
                styles.thumbnailRow
              }
            >
              <button
                type="button"
                className={`${styles.thumbnail} ${styles.activeThumbnail}`}
                aria-label="Product image"
              >
                {product.image_url ? (
                  <img
                    src={
                      product.image_url
                    }
                    alt={
                      product.name
                    }
                    className={
                      styles.thumbnailImage
                    }
                  />
                ) : (
                  <Gift size={24} />
                )}
              </button>

              <button
                type="button"
                className={
                  styles.thumbnail
                }
                aria-label="Gift ready"
              >
                <PackageCheck
                  size={24}
                />
              </button>

              <button
                type="button"
                className={
                  styles.thumbnail
                }
                aria-label="GiftWise recommendation"
              >
                <Sparkles size={24} />
              </button>
            </div>
          </div>

          <div
            className={
              styles.productInfo
            }
          >
            <span
              className={
                styles.kicker
              }
            >
              Thoughtfully selected gift
            </span>

            <h1>
              {product.name}
            </h1>

            <div
              className={
                styles.stockRow
              }
            >
              <span
                className={
                  product.stock_qty >
                  0
                    ? styles.inStock
                    : styles.outOfStock
                }
              >
                {product.stock_qty >
                0
                  ? "In stock"
                  : "Out of stock"}
              </span>

              <span>
                {product.stock_qty}{" "}
                available
              </span>
            </div>

            <p
              className={
                styles.description
              }
            >
              {product.description}
            </p>

            <div
              className={styles.price}
            >
              $
              {product.price.toFixed(
                2
              )}
            </div>

            <div
              className={styles.divider}
            />

            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                description:
                  product.description,
                price: product.price,
                stock_qty:
                  product.stock_qty,
                image_url:
                  product.image_url,
              }}
            />

            <div
              className={
                styles.customBoxPrompt
              }
            >
              <div
                className={
                  styles.promptIcon
                }
              >
                <Gift size={21} />
              </div>

              <div>
                <strong>
                  Want to make it
                  more personal?
                </strong>

                <p>
                  Add this item to a
                  custom gift box with
                  flowers, add-ons,
                  and a personal card.
                </p>
              </div>

              <Link href="/build-box">
                Customize
              </Link>
            </div>

            <div
              className={
                styles.benefits
              }
            >
              <div>
                <Truck size={19} />

                <div>
                  <strong>
                    Reliable delivery
                  </strong>

                  <span>
                    Prepared carefully
                    for gifting.
                  </span>
                </div>
              </div>

              <div>
                <ShieldCheck
                  size={19}
                />

                <div>
                  <strong>
                    Secure checkout
                  </strong>

                  <span>
                    Your order
                    information stays
                    protected.
                  </span>
                </div>
              </div>

              <div>
                <PackageCheck
                  size={19}
                />

                <div>
                  <strong>
                    Gift-ready
                  </strong>

                  <span>
                    Beautifully
                    prepared before
                    delivery.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.detailsSection
          }
        >
          <div>
            <span
              className={
                styles.kicker
              }
            >
              Why it works
            </span>

            <h2>
              A meaningful gift
              without the guesswork.
            </h2>

            <p>
              GiftWise products are
              selected to work
              naturally inside
              personalized gift
              experiences. You can
              purchase this item
              individually or combine
              it with other products
              through the Build Your
              Box experience.
            </p>
          </div>

          <div
            className={
              styles.detailsCards
            }
          >
            <div>
              <span>01</span>

              <strong>
                Ready to gift
              </strong>

              <p>
                Designed for
                occasions where
                presentation matters.
              </p>
            </div>

            <div>
              <span>02</span>

              <strong>
                Easy to personalize
              </strong>

              <p>
                Combine it with
                add-ons, flowers,
                and a message card.
              </p>
            </div>

            <div>
              <span>03</span>

              <strong>
                AI compatible
              </strong>

              <p>
                Products like this
                can appear in
                personalized AI
                recommendations.
              </p>
            </div>
          </div>
        </section>

        <section
          className={
            styles.aiPrompt
          }
        >
          <div>
            <Sparkles size={28} />

            <div>
              <span>
                Still deciding?
              </span>

              <h2>
                Let GiftWise AI
                help you choose.
              </h2>

              <p>
                Tell us who the gift
                is for, the occasion,
                interests, and your
                budget.
              </p>
            </div>
          </div>

          <Link href="/ai-gift-finder">
            Try AI Gift Finder
          </Link>
        </section>
      </div>
    </main>
  );
}