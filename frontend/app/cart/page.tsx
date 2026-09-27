"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Trash2,
} from "lucide-react";

import styles from "./Cart.module.css";


type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_qty: number;
  category_ids: string[];
  image_url: string | null;
  is_active: boolean;
};


type CartProduct = {
  id: string;
  name: string;
  price: number;

  quantity?: number;

  image_url?: string | null;
};


type CartBoxOption = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};


type CartFlowerOption = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};


type CartItem = {
  cart_id: string;

  item_type:
    | "ready-made-box"
    | "custom-box"
    | "product";

  product_id?: string;
  ready_made_box_id?: string;

  name: string;
  description: string;

  quantity: number;
  unit_price: number;

  image_url?: string | null;

  products?: CartProduct[];

  box_option?: CartBoxOption;

  flower_option?: CartFlowerOption;

  recipient_name?: string;

  card_message?: string;
};


type SavedCustomBoxProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
};


type SavedCustomBox = {
  box: {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
  };

  products: SavedCustomBoxProduct[];

  flowerOption: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
  };

  recipientName: string;

  cardMessage: string;

  total: number;

  createdAt: string;
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


function readCustomBox():
  | SavedCustomBox
  | null {
  try {
    const stored =
      localStorage.getItem(
        "giftwise-custom-box"
      );

    if (!stored) {
      return null;
    }

    return JSON.parse(
      stored
    );
  } catch {
    return null;
  }
}


export default function CartPage() {
  const [
    cart,
    setCart,
  ] = useState<CartItem[]>(
    []
  );

  const [
    customBox,
    setCustomBox,
  ] =
    useState<
      SavedCustomBox | null
    >(null);

  const [
    customBoxAdded,
    setCustomBoxAdded,
  ] = useState(false);

  const [
    catalogProducts,
    setCatalogProducts,
  ] =
    useState<
      CatalogProduct[]
    >([]);


  useEffect(() => {
    const storedCart =
      readCart();

    const storedCustomBox =
      readCustomBox();

    setCart(
      storedCart
    );

    setCustomBox(
      storedCustomBox
    );

    if (
      storedCustomBox
    ) {
      setCustomBoxAdded(
        storedCart.some(
          (item) =>
            item.item_type ===
            "custom-box"
        )
      );
    }


    async function loadProducts() {
      try {
        const response =
          await fetch(
            `${API_URL}/api/products`
          );

        if (
          !response.ok
        ) {
          return;
        }

        const data:
          CatalogProduct[] =
          await response.json();

        setCatalogProducts(
          data
        );

      } catch {
        setCatalogProducts(
          []
        );
      }
    }


    loadProducts();
  }, []);


  function saveCart(
    updatedCart:
      CartItem[]
  ) {
    setCart(
      updatedCart
    );

    localStorage.setItem(
      "giftwise-cart",
      JSON.stringify(
        updatedCart
      )
    );

    window.dispatchEvent(
      new Event(
        "giftwise-cart-updated"
      )
    );
  }


  function increaseQuantity(
    cartId: string
  ) {
    const updatedCart =
      cart.map(
        (item) =>
          item.cart_id ===
          cartId
            ? {
                ...item,

                quantity:
                  item.quantity +
                  1,
              }
            : item
      );

    saveCart(
      updatedCart
    );
  }


  function decreaseQuantity(
    cartId: string
  ) {
    const updatedCart =
      cart
        .map(
          (item) =>
            item.cart_id ===
            cartId
              ? {
                  ...item,

                  quantity:
                    item.quantity -
                    1,
                }
              : item
        )
        .filter(
          (item) =>
            item.quantity >
            0
        );

    saveCart(
      updatedCart
    );
  }


  function removeItem(
    cartId: string
  ) {
    const itemToRemove =
      cart.find(
        (item) =>
          item.cart_id ===
          cartId
      );

    const updatedCart =
      cart.filter(
        (item) =>
          item.cart_id !==
          cartId
      );

    saveCart(
      updatedCart
    );

    if (
      itemToRemove
        ?.item_type ===
      "custom-box"
    ) {
      setCustomBoxAdded(
        false
      );
    }
  }


  function addCustomBoxToCart() {
    if (
      !customBox ||
      customBoxAdded
    ) {
      return;
    }


    const customBoxCartItem:
      CartItem = {
      cart_id:
        crypto.randomUUID(),

      item_type:
        "custom-box",

      name:
        customBox.box.name,

      description:
        "Personalized GiftWise custom gift box",

      quantity:
        1,

      unit_price:
        customBox.total,

      image_url:
        customBox.box.image ??
        customBox.products.find(
          (product) =>
            product.image_url
        )?.image_url ??
        null,

      box_option: {
        id:
          customBox.box.id,

        name:
          customBox.box.name,

        price:
          customBox.box.price,

        image:
          customBox.box.image ??
          null,
      },

      flower_option: {
        id:
          customBox
            .flowerOption
            .id,

        name:
          customBox
            .flowerOption
            .name,

        price:
          customBox
            .flowerOption
            .price,

        image:
          customBox
            .flowerOption
            .image ??
          null,
      },

      recipient_name:
        customBox
          .recipientName ||
        "",

      card_message:
        customBox
          .cardMessage ||
        "",

      products:
        customBox.products.map(
          (product) => ({
            id:
              product.id,

            name:
              product.name,

            price:
              product.price,

            quantity:
              product.quantity,

            image_url:
              product.image_url ??
              null,
          })
        ),
    };


    saveCart([
      ...cart,
      customBoxCartItem,
    ]);

    setCustomBoxAdded(
      true
    );
  }


  function getProductImage(
    productId: string
  ) {
    return (
      catalogProducts.find(
        (product) =>
          product.id ===
          productId
      )?.image_url ??
      null
    );
  }


  function getItemImage(
    item: CartItem
  ): string | null {
    if (
      item.image_url
    ) {
      return (
        item.image_url
      );
    }

    if (
      item.item_type ===
        "product" &&
      item.product_id
    ) {
      return getProductImage(
        item.product_id
      );
    }

    if (
      item.products &&
      item.products.length >
        0
    ) {
      const productWithImage =
        item.products.find(
          (product) =>
            product.image_url
        );

      if (
        productWithImage
          ?.image_url
      ) {
        return (
          productWithImage
            .image_url
        );
      }

      for (
        const product
        of item.products
      ) {
        const image =
          getProductImage(
            product.id
          );

        if (image) {
          return image;
        }
      }
    }

    return null;
  }


  const customBoxImage =
    useMemo(() => {
      if (
        !customBox
      ) {
        return null;
      }

      if (
        customBox.box.image
      ) {
        return (
          customBox
            .box.image
        );
      }

      const savedProduct =
        customBox.products.find(
          (product) =>
            product.image_url
        );

      if (
        savedProduct
          ?.image_url
      ) {
        return (
          savedProduct
            .image_url
        );
      }

      for (
        const product
        of customBox.products
      ) {
        const image =
          catalogProducts.find(
            (
              catalogProduct
            ) =>
              catalogProduct.id ===
              product.id
          )?.image_url;

        if (image) {
          return image;
        }
      }

      return null;

    }, [
      customBox,
      catalogProducts,
    ]);


  const subtotal =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item
          ) =>
            total +
            item.unit_price *
              item.quantity,
          0
        ),
      [cart]
    );


  const deliveryFee =
    subtotal > 0
      ? 5
      : 0;


  const total =
    subtotal +
    deliveryFee;


  const totalItems =
    cart.reduce(
      (
        currentTotal,
        item
      ) =>
        currentTotal +
        item.quantity,
      0
    );


  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
      >
        <Link
          href="/shop"
          className={
            styles.backLink
          }
        >
          <ArrowLeft
            size={17}
          />

          Continue shopping
        </Link>


        <section
          className={
            styles.heading
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              <ShoppingBag
                size={15}
              />

              Your selections
            </span>

            <h1>
              Your GiftWise Cart
            </h1>

            <p>
              Review every part of
              your gift before moving
              to checkout.
            </p>
          </div>


          <div
            className={
              styles.itemCount
            }
          >
            <strong>
              {totalItems}
            </strong>

            <span>
              {totalItems === 1
                ? "item"
                : "items"}
            </span>
          </div>
        </section>


        {customBox &&
          !customBoxAdded && (
            <section
              className={
                styles.savedBox
              }
            >
              <div
                className={
                  styles.savedBoxIcon
                }
              >
                {customBoxImage ? (
                  <img
                    src={
                      customBoxImage
                    }
                    alt={
                      customBox
                        .box.name
                    }
                  />
                ) : (
                  <Gift
                    size={28}
                  />
                )}
              </div>


              <div
                className={
                  styles.savedBoxInfo
                }
              >
                <span>
                  Saved custom
                  gift box
                </span>

                <h2>
                  {
                    customBox
                      .box.name
                  }
                </h2>

                <p>
                  {
                    customBox
                      .products
                      .reduce(
                        (
                          amount,
                          product
                        ) =>
                          amount +
                          product.quantity,
                        0
                      )
                  }{" "}
                  selected gifts

                  {customBox.recipientName
                    ? ` • For ${customBox.recipientName}`
                    : ""}
                </p>
              </div>


              <div
                className={
                  styles.savedBoxPrice
                }
              >
                <strong>
                  $
                  {customBox.total.toFixed(
                    2
                  )}
                </strong>

                <button
                  type="button"
                  onClick={
                    addCustomBoxToCart
                  }
                >
                  <Plus
                    size={15}
                  />

                  Add to cart
                </button>
              </div>
            </section>
          )}


        {cart.length ===
        0 ? (
          <section
            className={
              styles.emptyCart
            }
          >
            <div
              className={
                styles.emptyIcon
              }
            >
              <ShoppingBag
                size={42}
              />
            </div>

            <span>
              Your cart is empty
            </span>

            <h2>
              Let&apos;s find
              something thoughtful.
            </h2>

            <p>
              Browse the shop,
              build a custom box,
              or choose a
              last-minute gift.
            </p>

            <div
              className={
                styles.emptyActions
              }
            >
              <Link
                href="/shop"
              >
                Browse gifts
              </Link>

              <Link
                href="/build-box"
              >
                Build a box
              </Link>
            </div>
          </section>
        ) : (
          <section
            className={
              styles.cartLayout
            }
          >
            <div
              className={
                styles.itemsColumn
              }
            >
              {cart.map(
                (item) => {
                  const image =
                    getItemImage(
                      item
                    );

                  return (
                    <article
                      className={
                        styles.cartItem
                      }
                      key={
                        item.cart_id
                      }
                    >
                      <div
                        className={
                          styles.itemVisual
                        }
                      >
                        {image ? (
                          <img
                            src={
                              image
                            }
                            alt={
                              item.name
                            }
                          />
                        ) : (
                          <Gift
                            size={42}
                            strokeWidth={
                              1.25
                            }
                          />
                        )}
                      </div>


                      <div
                        className={
                          styles.itemDetails
                        }
                      >
                        <span
                          className={
                            styles.itemType
                          }
                        >
                          {item.item_type ===
                          "ready-made-box"
                            ? "Ready-made gift box"
                            : item.item_type ===
                                "custom-box"
                              ? "Custom gift box"
                              : "Gift"}
                        </span>


                        <h2>
                          {item.name}
                        </h2>


                        <p>
                          {
                            item.description
                          }
                        </p>


                        {item.item_type ===
                          "custom-box" && (
                          <div
                            className={
                              styles.customBreakdown
                            }
                          >
                            {item.box_option && (
                              <div
                                className={
                                  styles.breakdownRow
                                }
                              >
                                <div>
                                  <Gift
                                    size={13}
                                  />

                                  <span>
                                    Box
                                  </span>

                                  <strong>
                                    {
                                      item
                                        .box_option
                                        .name
                                    }
                                  </strong>
                                </div>

                                <span>
                                  $
                                  {item
                                    .box_option
                                    .price
                                    .toFixed(
                                      2
                                    )}
                                </span>
                              </div>
                            )}


                            {item.products?.map(
                              (
                                product
                              ) => {
                                const productQuantity =
                                  product.quantity ??
                                  1;

                                const linePrice =
                                  product.price *
                                  productQuantity;

                                return (
                                  <div
                                    key={
                                      product.id
                                    }
                                    className={
                                      styles.breakdownRow
                                    }
                                  >
                                    <div>
                                      <Check
                                        size={13}
                                      />

                                      <span>
                                        Gift
                                      </span>

                                      <strong>
                                        {
                                          product.name
                                        }

                                        {productQuantity >
                                          1 &&
                                          ` × ${productQuantity}`}
                                      </strong>
                                    </div>

                                    <span>
                                      $
                                      {linePrice.toFixed(
                                        2
                                      )}
                                    </span>
                                  </div>
                                );
                              }
                            )}


                            {item.flower_option &&
                              item
                                .flower_option
                                .id !==
                                "none" && (
                                <div
                                  className={
                                    styles.breakdownRow
                                  }
                                >
                                  <div>
                                    <Flower2
                                      size={
                                        13
                                      }
                                    />

                                    <span>
                                      Flowers
                                    </span>

                                    <strong>
                                      {
                                        item
                                          .flower_option
                                          .name
                                      }
                                    </strong>
                                  </div>

                                  <span>
                                    $
                                    {item
                                      .flower_option
                                      .price
                                      .toFixed(
                                        2
                                      )}
                                  </span>
                                </div>
                              )}


                            {item.recipient_name && (
                              <div
                                className={
                                  styles.breakdownInfo
                                }
                              >
                                <Sparkles
                                  size={13}
                                />

                                <span>
                                  Recipient:
                                </span>

                                <strong>
                                  {
                                    item.recipient_name
                                  }
                                </strong>
                              </div>
                            )}


                            {item.card_message && (
                              <div
                                className={
                                  styles.breakdownInfo
                                }
                              >
                                <Sparkles
                                  size={13}
                                />

                                <span>
                                  Card:
                                </span>

                                <strong>
                                  “
                                  {
                                    item.card_message
                                  }
                                  ”
                                </strong>

                                <em>
                                  Free
                                </em>
                              </div>
                            )}
                          </div>
                        )}


                        {item.item_type !==
                          "custom-box" &&
                          item.recipient_name && (
                          <div
                            className={
                              styles.personalization
                            }
                          >
                            <Sparkles
                              size={
                                13
                              }
                            />

                            For{" "}
                            {
                              item.recipient_name
                            }
                          </div>
                        )}


                        {item.item_type !==
                          "custom-box" &&
                          item.products &&
                          item.products.length >
                            0 && (
                            <div
                              className={
                                styles.includes
                              }
                            >
                              {item.products.map(
                                (
                                  product
                                ) => (
                                  <span
                                    key={
                                      product.id
                                    }
                                  >
                                    <Check
                                      size={
                                        11
                                      }
                                    />

                                    {
                                      product.name
                                    }
                                  </span>
                                )
                              )}
                            </div>
                          )}


                        {item.item_type !==
                          "custom-box" &&
                          item.card_message && (
                          <div
                            className={
                              styles.cardMessage
                            }
                          >
                            “
                            {
                              item.card_message
                            }
                            ”
                          </div>
                        )}
                      </div>


                      <div
                        className={
                          styles.itemActions
                        }
                      >
                        <div
                          className={
                            styles.itemPriceBlock
                          }
                        >
                          <span>
                            {item.item_type ===
                            "custom-box"
                              ? "Box subtotal"
                              : "Item total"}
                          </span>

                          <strong>
                            $
                            {(
                              item.unit_price *
                              item.quantity
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>


                        <div
                          className={
                            styles.quantity
                          }
                        >
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              decreaseQuantity(
                                item.cart_id
                              )
                            }
                          >
                            <Minus
                              size={
                                13
                              }
                            />
                          </button>

                          <span>
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              increaseQuantity(
                                item.cart_id
                              )
                            }
                          >
                            <Plus
                              size={
                                13
                              }
                            />
                          </button>
                        </div>


                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          onClick={() =>
                            removeItem(
                              item.cart_id
                            )
                          }
                        >
                          <Trash2
                            size={
                              14
                            }
                          />

                          Remove
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>


            <aside
              className={
                styles.summary
              }
            >
              <div
                className={
                  styles.summaryHeading
                }
              >
                <ShoppingBag
                  size={20}
                />

                <div>
                  <span>
                    Almost there
                  </span>

                  <h2>
                    Order Summary
                  </h2>
                </div>
              </div>


              <div
                className={
                  styles.summaryRows
                }
              >
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    $
                    {subtotal.toFixed(
                      2
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Delivery
                  </span>

                  <strong>
                    $
                    {deliveryFee.toFixed(
                      2
                    )}
                  </strong>
                </div>
              </div>


              <div
                className={
                  styles.total
                }
              >
                <div>
                  <span>
                    Final total
                  </span>

                  <small>
                    Including delivery
                  </small>
                </div>

                <strong>
                  $
                  {total.toFixed(
                    2
                  )}
                </strong>
              </div>


              <Link
                href="/checkout"
                className={
                  styles.checkoutButton
                }
              >
                Continue to checkout

                <ArrowRight
                  size={17}
                />
              </Link>


              <div
                className={
                  styles.secureMessage
                }
              >
                <Check
                  size={13}
                />

                Your cart is saved
                on this device.
              </div>


              <Link
                href="/last-minute"
                className={
                  styles.keepShopping
                }
              >
                Add a last-minute
                gift
              </Link>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}