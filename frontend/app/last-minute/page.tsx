"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Check,
  Clock3,
  Gift,
  Loader2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  readyBoxTemplates,
} from "../../lib/readyMadeBoxes";

import styles from "./LastMinute.module.css";

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

type ReadyBox = {
  id: string;
  name: string;
  subtitle: string;
  occasion: string;
  description: string;
  productNames: string[];
  boxFee: number;
  products: Product[];
  total: number;
};

type CartItem = {
  cart_id: string;

  item_type:
    | "ready-made-box"
    | "custom-box"
    | "product";

  ready_made_box_id?: string;

  name: string;
  description: string;

  quantity: number;
  unit_price: number;

  products?: {
    id: string;
    name: string;
    price: number;
  }[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

function readCart(): CartItem[] {
  try {
    const stored =
      localStorage.getItem(
        "giftwise-cart"
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export default function LastMinutePage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [addedId, setAddedId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/products`
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load GiftWise products."
          );
        }

        const data: Product[] =
          await response.json();

        setProducts(
          data.filter(
            (product) =>
              product.is_active &&
              product.stock_qty > 0
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load last-minute gifts."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const readyBoxes =
    useMemo<ReadyBox[]>(() => {
      return readyBoxTemplates
        .map((template) => {
          const matchedProducts =
            template.productNames
              .map((name) =>
                products.find(
                  (product) =>
                    product.name ===
                    name
                )
              )
              .filter(
                (
                  product
                ): product is Product =>
                  Boolean(product)
              );

          const productTotal =
            matchedProducts.reduce(
              (
                total,
                product
              ) =>
                total +
                product.price,
              0
            );

          return {
            ...template,
            products:
              matchedProducts,
            total:
              productTotal +
              template.boxFee,
          };
        })
        .filter(
          (box) =>
            box.products.length > 0
        );
    }, [products]);

  function addBoxToCart(
    box: ReadyBox
  ) {
    const cart =
      readCart();

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.item_type ===
            "ready-made-box" &&
          item.ready_made_box_id ===
            box.id
      );

    if (existingIndex >= 0) {
      cart[existingIndex] = {
        ...cart[
          existingIndex
        ],

        quantity:
          cart[
            existingIndex
          ].quantity + 1,
      };
    } else {
      cart.push({
        cart_id:
          crypto.randomUUID(),

        item_type:
          "ready-made-box",

        ready_made_box_id:
          box.id,

        name:
          box.name,

        description:
          box.description,

        quantity: 1,

        unit_price:
          box.total,

        products:
          box.products.map(
            (product) => ({
              id:
                product.id,

              name:
                product.name,

              price:
                product.price,
            })
          ),
      });
    }

    localStorage.setItem(
      "giftwise-cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event(
        "giftwise-cart-updated"
      )
    );

    setAddedId(box.id);

    window.setTimeout(() => {
      setAddedId(
        (current) =>
          current === box.id
            ? null
            : current
      );
    }, 1800);
  }

  return (
    <main className={styles.page}>
      <div
        className={
          styles.container
        }
      >
        <Link
          href="/"
          className={
            styles.backLink
          }
        >
          <ArrowLeft
            size={17}
          />
          Back to home
        </Link>

        <section
          className={styles.hero}
        >
          <div
            className={
              styles.heroContent
            }
          >
            <span
              className={
                styles.eyebrow
              }
            >
              <Clock3
                size={15}
              />
              Need a gift quickly?
            </span>

            <h1>
              Last-minute gifts,
              <span>
                {" "}
                without looking
                last-minute.
              </span>
            </h1>

            <p>
              Choose a ready-made
              GiftWise box, check
              exactly what&apos;s
              inside, or add it
              straight to your cart
              when you&apos;re in a
              hurry.
            </p>

            <div
              className={
                styles.heroPoints
              }
            >
              <span>
                <Check
                  size={15}
                />
                Pre-selected
                combinations
              </span>

              <span>
                <Check
                  size={15}
                />
                View everything
                inside
              </span>

              <span>
                <Check
                  size={15}
                />
                Fast ordering
              </span>
            </div>
          </div>

          <div
            className={
              styles.heroVisual
            }
          >
            <div
              className={
                styles.clockCircle
              }
            >
              <Clock3
                size={35}
              />
            </div>

            <div
              className={
                styles.giftCircle
              }
            >
              <Gift
                size={52}
              />
            </div>

            <div
              className={
                styles.sparkleOne
              }
            >
              <Sparkles
                size={24}
              />
            </div>
          </div>
        </section>

        <section
          className={
            styles.content
          }
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <div>
              <span
                className={
                  styles.sectionKicker
                }
              >
                Ready when you are
              </span>

              <h2>
                Pick a box and
                you&apos;re almost
                done.
              </h2>

              <p>
                Open any gift box to
                see the products
                included before you
                decide to order.
              </p>
            </div>

            <Link
              href="/build-box"
              className={
                styles.customLink
              }
            >
              Prefer to customize?

              <span>
                Build your own box
              </span>
            </Link>
          </div>

          {loading ? (
            <div
              className={
                styles.stateCard
              }
            >
              <Loader2
                size={25}
                className={
                  styles.spinner
                }
              />

              <strong>
                Preparing your gift
                options...
              </strong>
            </div>
          ) : error ? (
            <div
              className={
                styles.stateCard
              }
            >
              <Gift
                size={28}
              />

              <strong>
                {error}
              </strong>

              <p>
                Make sure the FastAPI
                backend is running on
                port 8000.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.boxGrid
              }
            >
              {readyBoxes.map(
                (
                  box,
                  index
                ) => {
                  const isAdded =
                    addedId ===
                    box.id;

                  const mainImage =
                    box.products.find(
                      (product) =>
                        product.image_url
                    )?.image_url ??
                    null;

                  return (
                    <article
                      className={
                        styles.boxCard
                      }
                      key={box.id}
                    >
                      <Link
                        href={`/last-minute/${box.id}`}
                        className={
                          styles.boxImageLink
                        }
                        aria-label={`View details for ${box.name}`}
                      >
                        <div
                          className={`${styles.boxVisual} ${
                            styles[
                              `visual${(index % 4) + 1}`
                            ]
                          }`}
                        >
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={box.name}
                              className={
                                styles.boxImage
                              }
                            />
                          ) : (
                            <div
                              className={
                                styles.boxFallback
                              }
                            >
                              <Gift
                                size={68}
                                strokeWidth={
                                  1.15
                                }
                              />
                            </div>
                          )}

                          <div
                            className={
                              styles.imageOverlay
                            }
                          />

                          <div
                            className={
                              styles.occasionBadge
                            }
                          >
                            <Clock3
                              size={13}
                            />

                            {
                              box.occasion
                            }
                          </div>
                        </div>
                      </Link>

                      <div
                        className={
                          styles.boxContent
                        }
                      >
                        <span
                          className={
                            styles.subtitle
                          }
                        >
                          {
                            box.subtitle
                          }
                        </span>

                        <Link
                          href={`/last-minute/${box.id}`}
                          className={
                            styles.titleLink
                          }
                        >
                          <h3>
                            {
                              box.name
                            }
                          </h3>
                        </Link>

                        <p
                          className={
                            styles.description
                          }
                        >
                          {
                            box.description
                          }
                        </p>

                        <div
                          className={
                            styles.previewProducts
                          }
                        >
                          {box.products.map(
                            (
                              product
                            ) => (
                              <div
                                key={
                                  product.id
                                }
                                className={
                                  styles.previewItem
                                }
                              >
                                {product.image_url ? (
                                  <img
                                    src={
                                      product.image_url
                                    }
                                    alt={
                                      product.name
                                    }
                                  />
                                ) : (
                                  <div
                                    className={
                                      styles.previewFallback
                                    }
                                  >
                                    <Gift
                                      size={
                                        15
                                      }
                                    />
                                  </div>
                                )}

                                <span>
                                  {
                                    product.name
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        <div
                          className={
                            styles.includes
                          }
                        >
                          <strong>
                            What&apos;s
                            inside
                          </strong>

                          {box.products.map(
                            (
                              product
                            ) => (
                              <div
                                key={
                                  product.id
                                }
                              >
                                <Check
                                  size={
                                    13
                                  }
                                />

                                <span>
                                  {
                                    product.name
                                  }
                                </span>
                              </div>
                            )
                          )}

                          <div>
                            <Check
                              size={13}
                            />

                            <span>
                              Gift-ready
                              packaging
                            </span>
                          </div>
                        </div>

                        <div
                          className={
                            styles.detailsRow
                          }
                        >
                          <Link
                            href={`/last-minute/${box.id}`}
                            className={
                              styles.detailsLink
                            }
                          >
                            View box
                            details

                            <ArrowLeft
                              size={14}
                              className={
                                styles.detailsArrow
                              }
                            />
                          </Link>
                        </div>

                        <div
                          className={
                            styles.footer
                          }
                        >
                          <div>
                            <span>
                              Ready-made
                              box
                            </span>

                            <strong>
                              $
                              {box.total.toFixed(
                                2
                              )}
                            </strong>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              addBoxToCart(
                                box
                              )
                            }
                            className={
                              isAdded
                                ? styles.addedButton
                                : styles.orderButton
                            }
                          >
                            {isAdded ? (
                              <>
                                <Check
                                  size={
                                    16
                                  }
                                />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag
                                  size={
                                    16
                                  }
                                />
                                Quick add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section
          className={
            styles.helpBanner
          }
        >
          <div>
            <Sparkles
              size={26}
            />

            <div>
              <span>
                Still not sure?
              </span>

              <h2>
                Let GiftWise AI
                choose for you.
              </h2>

              <p>
                Describe the person
                and get personalized
                gift recommendations.
              </p>
            </div>
          </div>

          <Link
            href="/ai-gift-finder"
          >
            Open AI Gift Finder
          </Link>
        </section>
      </div>
    </main>
  );
}