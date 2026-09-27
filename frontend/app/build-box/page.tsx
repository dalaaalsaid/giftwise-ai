"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flower2,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import styles from "./BuildBox.module.css";

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

type BoxOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

type FlowerOption = {
  id: string;
  name: string;
  price: number;
  image: string | null;
};

type SelectedProduct = Product & {
  quantity: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

const boxOptions: BoxOption[] = [
  {
    id: "classic",
    name: "Classic Gift Box",
    description:
      "Simple, elegant, and perfect for every occasion.",
    price: 5,
    image: "/build-box/classic-box.jpeg",
  },
  {
    id: "premium",
    name: "Premium Magnetic Box",
    description:
      "A luxurious magnetic box with premium finishing.",
    price: 9,
    image: "/build-box/premium-box.jpeg",
  },
  {
    id: "mini",
    name: "Mini Gift Box",
    description:
      "Compact and charming for smaller thoughtful gifts.",
    price: 3,
    image: "/build-box/mini-box.jpeg",
  },
];

const flowerOptions: FlowerOption[] = [
  {
    id: "none",
    name: "No flowers",
    price: 0,
    image: null,
  },
  {
    id: "mini-flowers",
    name: "Mini Flower Touch",
    price: 6,
    image: "/build-box/mini-flowers.jpeg",
  },
  {
    id: "rose-bundle",
    name: "Rose Bundle",
    price: 12,
    image: "/build-box/rose-bundle.jpeg",
  },
];

export default function BuildBoxPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedBox, setSelectedBox] =
    useState<BoxOption>(boxOptions[0]);

  const [selectedProducts, setSelectedProducts] =
    useState<SelectedProduct[]>([]);

  const [flowerOption, setFlowerOption] =
    useState<FlowerOption>(flowerOptions[0]);

  const [cardMessage, setCardMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data: Product[] = await response.json();

        setProducts(
          data.filter(
            (product) =>
              product.is_active &&
              product.stock_qty > 0
          )
        );
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  function addProduct(product: Product) {
    setSelectedProducts((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock_qty
                ),
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setSaved(false);
  }

  function decreaseProduct(productId: string) {
    setSelectedProducts((current) =>
      current
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setSaved(false);
  }

  function removeProduct(productId: string) {
    setSelectedProducts((current) =>
      current.filter(
        (item) => item.id !== productId
      )
    );

    setSaved(false);
  }

  const productsTotal = useMemo(
    () =>
      selectedProducts.reduce(
        (total, product) =>
          total +
          product.price * product.quantity,
        0
      ),
    [selectedProducts]
  );

  const total =
    productsTotal +
    selectedBox.price +
    flowerOption.price;

  function saveGiftBox() {
    const customBox = {
      box: selectedBox,
      products: selectedProducts,
      flowerOption,
      recipientName: recipientName.trim(),
      cardMessage: cardMessage.trim(),
      total,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "giftwise-custom-box",
      JSON.stringify(customBox)
    );

    setSaved(true);
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              <Sparkles size={15} />
              Make it personal
            </span>

            <h1>
              Build a gift box
              <span> made by you.</span>
            </h1>

            <p>
              Choose your box, add thoughtful gifts,
              include flowers, and finish it with a
              personal card message.
            </p>
          </div>

          <div className={styles.heroIcon}>
            <Gift size={46} />
          </div>
        </section>

        <div className={styles.builderLayout}>
          <div className={styles.builderContent}>
            <section className={styles.stepCard}>
              <div className={styles.stepHeading}>
                <span>01</span>

                <div>
                  <h2>Choose your box</h2>

                  <p>
                    Start with the presentation style
                    you prefer.
                  </p>
                </div>
              </div>

              <div className={styles.boxGrid}>
                {boxOptions.map((box) => {
                  const active =
                    selectedBox.id === box.id;

                  return (
                    <button
                      key={box.id}
                      type="button"
                      className={
                        active
                          ? `${styles.boxOption} ${styles.selectedOption}`
                          : styles.boxOption
                      }
                      onClick={() => {
                        setSelectedBox(box);
                        setSaved(false);
                      }}
                    >
                      {active && (
                        <div className={styles.checkIcon}>
                          <Check size={14} />
                        </div>
                      )}

                      <div className={styles.boxVisual}>
                        <img
                          src={box.image}
                          alt={box.name}
                          className={styles.optionImage}
                        />
                      </div>

                      <strong>{box.name}</strong>

                      <p>{box.description}</p>

                      <span>
                        +${box.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.stepCard}>
              <div className={styles.stepHeading}>
                <span>02</span>

                <div>
                  <h2>Add gifts</h2>

                  <p>
                    Pick products from the GiftWise
                    catalog.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className={styles.loading}>
                  Loading gifts...
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {products.map((product, index) => {
                    const selected =
                      selectedProducts.find(
                        (item) =>
                          item.id === product.id
                      );

                    return (
                      <article
                        className={styles.productCard}
                        key={product.id}
                      >
                        <div
                          className={`${styles.productVisual} ${
                            styles[
                              `visual${(index % 4) + 1}`
                            ]
                          }`}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className={
                                styles.productImage
                              }
                            />
                          ) : (
                            <Gift
                              size={37}
                              strokeWidth={1.3}
                            />
                          )}
                        </div>

                        <div
                          className={
                            styles.productContent
                          }
                        >
                          <h3>{product.name}</h3>

                          <p>{product.description}</p>

                          <div
                            className={
                              styles.productBottom
                            }
                          >
                            <strong>
                              $
                              {product.price.toFixed(2)}
                            </strong>

                            {!selected ? (
                              <button
                                type="button"
                                onClick={() =>
                                  addProduct(product)
                                }
                              >
                                <Plus size={15} />
                                Add
                              </button>
                            ) : (
                              <div
                                className={styles.quantity}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseProduct(
                                      product.id
                                    )
                                  }
                                >
                                  <Minus size={13} />
                                </button>

                                <span>
                                  {selected.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    addProduct(product)
                                  }
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={styles.stepCard}>
              <div className={styles.stepHeading}>
                <span>03</span>

                <div>
                  <h2>Add flowers</h2>

                  <p>
                    Optional finishing touches for
                    your gift.
                  </p>
                </div>
              </div>

              <div className={styles.flowerGrid}>
                {flowerOptions.map((option) => {
                  const active =
                    flowerOption.id === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        active
                          ? `${styles.flowerOption} ${styles.selectedOption}`
                          : styles.flowerOption
                      }
                      onClick={() => {
                        setFlowerOption(option);
                        setSaved(false);
                      }}
                    >
                      {active && (
                        <div className={styles.checkIcon}>
                          <Check size={14} />
                        </div>
                      )}

                      {option.image ? (
                        <div
                          className={styles.flowerVisual}
                        >
                          <img
                            src={option.image}
                            alt={option.name}
                            className={
                              styles.flowerImage
                            }
                          />
                        </div>
                      ) : (
                        <div
                          className={
                            styles.noFlowerVisual
                          }
                        >
                          <Flower2 size={28} />
                        </div>
                      )}

                      <div
                        className={
                          styles.flowerContent
                        }
                      >
                        <strong>{option.name}</strong>

                        <span>
                          {option.price === 0
                            ? "Included"
                            : `+$${option.price.toFixed(
                                2
                              )}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.stepCard}>
              <div className={styles.stepHeading}>
                <span>04</span>

                <div>
                  <h2>Add a personal card</h2>

                  <p>
                    Make the gift feel truly
                    personal.
                  </p>
                </div>
              </div>

              <div className={styles.cardFields}>
                <div>
                  <label htmlFor="recipient-name">
                    Recipient name
                  </label>

                  <input
                    id="recipient-name"
                    type="text"
                    placeholder="e.g. Sara"
                    value={recipientName}
                    onChange={(event) => {
                      setRecipientName(
                        event.target.value
                      );

                      setSaved(false);
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="card-message">
                    Card message
                  </label>

                  <textarea
                    id="card-message"
                    maxLength={250}
                    placeholder="Write something thoughtful..."
                    value={cardMessage}
                    onChange={(event) => {
                      setCardMessage(
                        event.target.value
                      );

                      setSaved(false);
                    }}
                  />

                  <span>
                    {cardMessage.length}/250
                  </span>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryHeader}>
              <ShoppingBag size={20} />

              <div>
                <span>Your custom box</span>

                <h2>Gift Box Summary</h2>
              </div>
            </div>

            <div className={styles.summaryBox}>
              <img
                src={selectedBox.image}
                alt={selectedBox.name}
                className={styles.summaryBoxImage}
              />

              <div>
                <strong>{selectedBox.name}</strong>

                <span>
                  ${selectedBox.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className={styles.summarySection}>
              <div className={styles.summaryTitle}>
                <span>Selected gifts</span>

                <strong>
                  {selectedProducts.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </strong>
              </div>

              {selectedProducts.length === 0 ? (
                <p className={styles.emptyText}>
                  Add at least one gift to your box.
                </p>
              ) : (
                <div className={styles.selectedList}>
                  {selectedProducts.map(
                    (product) => (
                      <div key={product.id}>
                        <div
                          className={
                            styles.selectedProductInfo
                          }
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className={
                                styles.selectedProductImage
                              }
                            />
                          ) : (
                            <div
                              className={
                                styles.selectedProductFallback
                              }
                            >
                              <Gift size={17} />
                            </div>
                          )}

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              Qty {product.quantity}
                            </span>
                          </div>
                        </div>

                        <div
                          className={
                            styles.selectedPrice
                          }
                        >
                          <span>
                            $
                            {(
                              product.price *
                              product.quantity
                            ).toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeProduct(product.id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {flowerOption.id !== "none" && (
              <div
                className={
                  styles.summaryFlower
                }
              >
                {flowerOption.image && (
                  <img
                    src={flowerOption.image}
                    alt={flowerOption.name}
                  />
                )}

                <div>
                  <span>Flowers</span>

                  <strong>
                    {flowerOption.name}
                  </strong>
                </div>
              </div>
            )}

            <div className={styles.summarySection}>
              <div className={styles.summaryRow}>
                <span>Products</span>

                <strong>
                  ${productsTotal.toFixed(2)}
                </strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Box</span>

                <strong>
                  ${selectedBox.price.toFixed(2)}
                </strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Flowers</span>

                <strong>
                  ${flowerOption.price.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>

              <strong>
                ${total.toFixed(2)}
              </strong>
            </div>

            <button
              className={styles.saveButton}
              type="button"
              disabled={
                selectedProducts.length === 0
              }
              onClick={saveGiftBox}
            >
              {saved ? (
                <>
                  <Check size={17} />
                  Gift box saved
                </>
              ) : (
                <>
                  Save gift box
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {saved && (
              <div className={styles.savedMessage}>
                <Sparkles size={15} />
                Your custom box is ready for checkout.
              </div>
            )}

            <p className={styles.summaryNote}>
              Your selections will be available when
              we continue to Cart & Checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}