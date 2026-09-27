"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Flower2,
  Gift,
  Loader2,
  LockKeyhole,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
  getStoredUser,
} from "../../lib/auth";

import styles from "./Checkout.module.css";


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

  products?: CartProduct[];

  box_option?: CartBoxOption;

  flower_option?: CartFlowerOption;

  recipient_name?: string;

  card_message?: string;
};


type OrderResponse = {
  id: string;

  order_number: string;

  full_name: string;

  phone: string;

  address: string;

  city: string;

  notes: string | null;

  subtotal: number;

  delivery_fee: number;

  total: number;

  payment_status: string;

  order_status: string;

  created_at: string;
};


function readCart():
  CartItem[] {
  try {
    const stored =
      localStorage.getItem(
        "giftwise-cart"
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(
        stored
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];

  } catch {
    return [];
  }
}


function onlyDigits(
  value: string
) {
  return value.replace(
    /\D/g,
    ""
  );
}


function formatCardNumber(
  value: string
) {
  const digits =
    onlyDigits(
      value
    ).slice(
      0,
      16
    );

  return digits.replace(
    /(\d{4})(?=\d)/g,
    "$1 "
  );
}


export default function CheckoutPage() {
  const router =
    useRouter();


  const [
    cart,
    setCart,
  ] = useState<
    CartItem[]
  >([]);


  const [
    fullName,
    setFullName,
  ] = useState("");


  const [
    phone,
    setPhone,
  ] = useState("");


  const [
    city,
    setCity,
  ] = useState("");


  const [
    address,
    setAddress,
  ] = useState("");


  const [
    notes,
    setNotes,
  ] = useState("");


  const [
    cardholderName,
    setCardholderName,
  ] = useState("");


  const [
    cardNumber,
    setCardNumber,
  ] = useState("");


  const [
    expiry,
    setExpiry,
  ] = useState("");


  const [
    cvc,
    setCvc,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    const token =
      getAccessToken();

    if (!token) {
      router.replace(
        "/login"
      );

      return;
    }


    const user =
      getStoredUser();

    if (user) {
      setFullName(
        user.full_name
      );

      setCardholderName(
        user.full_name
      );
    }


    setCart(
      readCart()
    );


    setCheckingAuth(
      false
    );

  }, [
    router,
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
            item.unit_price
            * item.quantity,
          0
        ),

      [
        cart,
      ]
    );


  const estimatedDelivery =
    subtotal > 0
      ? 5
      : 0;


  const estimatedTotal =
    subtotal
    + estimatedDelivery;


  function getPaymentToken():
    | string
    | null {
    const cleanCard =
      onlyDigits(
        cardNumber
      );


    if (
      cleanCard ===
      "4242424242424242"
    ) {
      return (
        "giftwise_test_payment_success"
      );
    }


    if (
      cleanCard ===
      "4000000000000002"
    ) {
      return (
        "giftwise_test_payment_declined"
      );
    }


    return null;
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");


    if (
      cart.length ===
      0
    ) {
      setError(
        "Your cart is empty."
      );

      return;
    }


    if (
      fullName
        .trim()
        .length < 2
    ) {
      setError(
        "Please enter your full name."
      );

      return;
    }


    if (
      phone
        .trim()
        .length < 6
    ) {
      setError(
        "Please enter a valid phone number."
      );

      return;
    }


    if (
      city
        .trim()
        .length < 2
    ) {
      setError(
        "Please enter your city."
      );

      return;
    }


    if (
      address
        .trim()
        .length < 5
    ) {
      setError(
        "Please enter your delivery address."
      );

      return;
    }


    if (
      cardholderName
        .trim()
        .length < 2
    ) {
      setError(
        "Please enter the cardholder name."
      );

      return;
    }


    const paymentToken =
      getPaymentToken();


    if (!paymentToken) {
      setError(
        "Use one of the GiftWise sandbox test cards shown below."
      );

      return;
    }


    if (
      !/^\d{2}\/\d{2}$/.test(
        expiry
      )
    ) {
      setError(
        "Enter expiry in MM/YY format."
      );

      return;
    }


    if (
      !/^\d{3}$/.test(
        cvc
      )
    ) {
      setError(
        "Enter a 3-digit sandbox CVC."
      );

      return;
    }


    const token =
      getAccessToken();


    if (!token) {
      router.push(
        "/login"
      );

      return;
    }


    const orderItems =
      cart.map(
        (item) => {
          const productSelections =
            item.item_type ===
              "product"
            && item.product_id
              ? [
                  {
                    product_id:
                      item.product_id,

                    quantity:
                      1,
                  },
                ]

              : (
                  item.products?.map(
                    (
                      product
                    ) => ({
                      product_id:
                        product.id,

                      quantity:
                        product.quantity ??
                        1,
                    })
                  )
                  ?? []
                );


          return {
            item_type:
              item.item_type,

            name:
              item.name,

            quantity:
              item.quantity,

            product_selections:
              productSelections,

            ready_made_box_id:
              item.ready_made_box_id ??
              null,

            box_option_id:
              item.box_option?.id ??
              null,

            flower_option_id:
              item.flower_option?.id ??
              null,

            recipient_name:
              item.recipient_name ||
              null,

            card_message:
              item.card_message ||
              null,
          };
        }
      );


    const hasInvalidItem =
      orderItems.some(
        (item) =>
          item
            .product_selections
            .length ===
          0
      );


    if (
      hasInvalidItem
    ) {
      setError(
        "One of the cart items does not contain valid product information. Please remove it and add it again."
      );

      return;
    }


    const invalidCustomBox =
      orderItems.some(
        (item) =>
          item.item_type ===
            "custom-box"
          && (
            !item.box_option_id
            || !item.flower_option_id
          )
      );


    if (
      invalidCustomBox
    ) {
      setError(
        "Your custom box was saved using an older version. Please rebuild the custom box before checkout."
      );

      return;
    }


    try {
      setLoading(
        true
      );


      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                {
                  full_name:
                    fullName.trim(),

                  phone:
                    phone.trim(),

                  address:
                    address.trim(),

                  city:
                    city.trim(),

                  notes:
                    notes.trim()
                    || null,

                  items:
                    orderItems,

                  payment_method:
                    "sandbox_card",

                  payment_token:
                    paymentToken,
                }
              ),
          }
        );


      let data:
        | OrderResponse
        | {
            detail?: string;
          };


      try {
        data =
          await response.json();

      } catch {
        throw new Error(
          "Unable to process the payment."
        );
      }


      if (
        response.status ===
        401
      ) {
        throw new Error(
          "Your login session has expired. Please sign in again."
        );
      }


      if (
        response.status ===
        402
      ) {
        throw new Error(
          "The sandbox card was declined. Try the successful test card."
        );
      }


      if (
        !response.ok
      ) {
        throw new Error(
          "detail" in data
          && typeof data.detail ===
            "string"
            ? data.detail
            : "Unable to create your order."
        );
      }


      const order =
        data as
          OrderResponse;


      sessionStorage.setItem(
        "giftwise-last-order",
        JSON.stringify(
          order
        )
      );


      localStorage.removeItem(
        "giftwise-cart"
      );


      localStorage.removeItem(
        "giftwise-custom-box"
      );


      window.dispatchEvent(
        new Event(
          "giftwise-cart-updated"
        )
      );


      router.push(
        "/order-success"
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while processing your order."
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  if (
    checkingAuth
  ) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <Loader2
          size={30}
          className={
            styles.spinner
          }
        />

        <span>
          Preparing secure
          checkout...
        </span>
      </main>
    );
  }


  if (
    cart.length ===
    0
  ) {
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
          <section
            className={
              styles.empty
            }
          >
            <div
              className={
                styles.emptyIcon
              }
            >
              <ShoppingBag
                size={40}
              />
            </div>

            <h1>
              Your cart is empty.
            </h1>

            <p>
              Add a gift before
              continuing to checkout.
            </p>

            <Link
              href="/shop"
            >
              Browse Gifts
            </Link>
          </section>
        </div>
      </main>
    );
  }


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
          href="/cart"
          className={
            styles.backLink
          }
        >
          <ArrowLeft
            size={17}
          />

          Back to cart
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
              <LockKeyhole
                size={14}
              />

              Secure Checkout
            </span>

            <h1>
              Complete your order.
            </h1>

            <p>
              Review your gifts,
              enter delivery details,
              and pay directly from
              this page.
            </p>
          </div>


          <div
            className={
              styles.secureBadge
            }
          >
            <Check
              size={18}
            />

            <div>
              <strong>
                Sandbox payment
              </strong>

              <span>
                No real money charged
              </span>
            </div>
          </div>
        </section>


        <form
          className={
            styles.checkoutLayout
          }
          onSubmit={
            handleSubmit
          }
        >
          <div
            className={
              styles.formColumn
            }
          >
            <section
              className={
                styles.formCard
              }
            >
              <div
                className={
                  styles.cardHeading
                }
              >
                <MapPin
                  size={20}
                />

                <div>
                  <span>
                    Step 1
                  </span>

                  <h2>
                    Delivery details
                  </h2>
                </div>
              </div>


              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="full-name"
                >
                  Full name
                </label>

                <input
                  id="full-name"
                  type="text"
                  value={
                    fullName
                  }
                  onChange={(
                    event
                  ) =>
                    setFullName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Your full name"
                />
              </div>


              <div
                className={
                  styles.twoColumns
                }
              >
                <div
                  className={
                    styles.field
                  }
                >
                  <label
                    htmlFor="phone"
                  >
                    Phone number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={
                      phone
                    }
                    onChange={(
                      event
                    ) =>
                      setPhone(
                        event.target
                          .value
                      )
                    }
                    placeholder="+961..."
                  />
                </div>


                <div
                  className={
                    styles.field
                  }
                >
                  <label
                    htmlFor="city"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={
                      city
                    }
                    onChange={(
                      event
                    ) =>
                      setCity(
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. Tyre"
                  />
                </div>
              </div>


              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="address"
                >
                  Delivery address
                </label>

                <input
                  id="address"
                  type="text"
                  value={
                    address
                  }
                  onChange={(
                    event
                  ) =>
                    setAddress(
                      event.target
                        .value
                    )
                  }
                  placeholder="Street, building, area..."
                />
              </div>


              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="notes"
                >
                  Delivery notes

                  <span>
                    Optional
                  </span>
                </label>

                <textarea
                  id="notes"
                  maxLength={500}
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Anything we should know about the delivery?"
                />

                <small>
                  {notes.length}/500
                </small>
              </div>
            </section>


            <section
              className={
                styles.formCard
              }
            >
              <div
                className={
                  styles.cardHeading
                }
              >
                <CreditCard
                  size={20}
                />

                <div>
                  <span>
                    Step 2
                  </span>

                  <h2>
                    Payment
                  </h2>
                </div>
              </div>


              <div
                className={
                  styles.sandboxNotice
                }
              >
                <LockKeyhole
                  size={18}
                />

                <div>
                  <strong>
                    Demo payment only
                  </strong>

                  <p>
                    Use the GiftWise
                    test cards below.
                    No real card or
                    money is used.
                  </p>
                </div>
              </div>


              <div
                className={
                  styles.testCards
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    setCardNumber(
                      "4242 4242 4242 4242"
                    );

                    setExpiry(
                      "12/30"
                    );

                    setCvc(
                      "123"
                    );

                    setCardholderName(
                      fullName ||
                      "GiftWise Test"
                    );
                  }}
                >
                  <Check
                    size={15}
                  />

                  <div>
                    <strong>
                      Successful test
                    </strong>

                    <span>
                      4242 4242 4242 4242
                    </span>
                  </div>
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setCardNumber(
                      "4000 0000 0000 0002"
                    );

                    setExpiry(
                      "12/30"
                    );

                    setCvc(
                      "123"
                    );

                    setCardholderName(
                      fullName ||
                      "GiftWise Test"
                    );
                  }}
                >
                  <CreditCard
                    size={15}
                  />

                  <div>
                    <strong>
                      Declined test
                    </strong>

                    <span>
                      4000 0000 0000 0002
                    </span>
                  </div>
                </button>
              </div>


              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="cardholder"
                >
                  Cardholder name
                </label>

                <input
                  id="cardholder"
                  type="text"
                  value={
                    cardholderName
                  }
                  onChange={(
                    event
                  ) =>
                    setCardholderName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Name on card"
                />
              </div>


              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="card-number"
                >
                  Test card number
                </label>

                <input
                  id="card-number"
                  inputMode="numeric"
                  value={
                    cardNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setCardNumber(
                      formatCardNumber(
                        event.target
                          .value
                      )
                    )
                  }
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                />
              </div>


              <div
                className={
                  styles.twoColumns
                }
              >
                <div
                  className={
                    styles.field
                  }
                >
                  <label
                    htmlFor="expiry"
                  >
                    Expiry
                  </label>

                  <input
                    id="expiry"
                    type="text"
                    value={
                      expiry
                    }
                    onChange={(
                      event
                    ) => {
                      let value =
                        event.target
                          .value
                          .replace(
                            /[^\d]/g,
                            ""
                          )
                          .slice(
                            0,
                            4
                          );

                      if (
                        value.length >
                        2
                      ) {
                        value =
                          `${value.slice(
                            0,
                            2
                          )}/${value.slice(
                            2
                          )}`;
                      }

                      setExpiry(
                        value
                      );
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>


                <div
                  className={
                    styles.field
                  }
                >
                  <label
                    htmlFor="cvc"
                  >
                    CVC
                  </label>

                  <input
                    id="cvc"
                    type="password"
                    inputMode="numeric"
                    value={
                      cvc
                    }
                    onChange={(
                      event
                    ) =>
                      setCvc(
                        onlyDigits(
                          event.target
                            .value
                        ).slice(
                          0,
                          3
                        )
                      )
                    }
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>
            </section>


            <section
              className={
                styles.paymentCard
              }
            >
              <div
                className={
                  styles.paymentIcon
                }
              >
                <LockKeyhole
                  size={22}
                />
              </div>

              <div>
                <span>
                  Payment security
                </span>

                <h2>
                  Sandbox mode
                </h2>

                <p>
                  GiftWise never stores
                  the test card number
                  or CVC. Only the
                  sandbox payment
                  result is sent to the
                  backend.
                </p>
              </div>
            </section>
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
                  Your order
                </span>

                <h2>
                  Order Summary
                </h2>
              </div>
            </div>


            <div
              className={
                styles.itemList
              }
            >
              {cart.map(
                (item) => (
                  <div
                    className={
                      styles.orderItem
                    }
                    key={
                      item.cart_id
                    }
                  >
                    <div
                      className={
                        styles.orderItemTop
                      }
                    >
                      <div
                        className={
                          styles.itemIcon
                        }
                      >
                        <Gift
                          size={18}
                        />
                      </div>

                      <div
                        className={
                          styles.itemInfo
                        }
                      >
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          Qty{" "}
                          {
                            item.quantity
                          }
                        </span>
                      </div>

                      <strong
                        className={
                          styles.itemPrice
                        }
                      >
                        $
                        {(
                          item.unit_price
                          * item.quantity
                        ).toFixed(
                          2
                        )}
                      </strong>
                    </div>


                    {item.item_type ===
                      "custom-box" && (
                      <div
                        className={
                          styles.itemBreakdown
                        }
                      >
                        {item.box_option && (
                          <div>
                            <span>
                              <Gift
                                size={
                                  11
                                }
                              />
                              {
                                item
                                  .box_option
                                  .name
                              }
                            </span>

                            <strong>
                              $
                              {item
                                .box_option
                                .price
                                .toFixed(
                                  2
                                )}
                            </strong>
                          </div>
                        )}


                        {item.products?.map(
                          (
                            product
                          ) => {
                            const quantity =
                              product.quantity ??
                              1;

                            return (
                              <div
                                key={
                                  product.id
                                }
                              >
                                <span>
                                  <Check
                                    size={
                                      11
                                    }
                                  />

                                  {
                                    product.name
                                  }

                                  {quantity >
                                    1 &&
                                    ` × ${quantity}`}
                                </span>

                                <strong>
                                  $
                                  {(
                                    product.price
                                    * quantity
                                  ).toFixed(
                                    2
                                  )}
                                </strong>
                              </div>
                            );
                          }
                        )}


                        {item.flower_option &&
                          item
                            .flower_option
                            .id !==
                            "none" && (
                            <div>
                              <span>
                                <Flower2
                                  size={
                                    11
                                  }
                                />

                                {
                                  item
                                    .flower_option
                                    .name
                                }
                              </span>

                              <strong>
                                $
                                {item
                                  .flower_option
                                  .price
                                  .toFixed(
                                    2
                                  )}
                              </strong>
                            </div>
                          )}


                        {item.recipient_name && (
                          <div
                            className={
                              styles.infoRow
                            }
                          >
                            <span>
                              <Sparkles
                                size={
                                  11
                                }
                              />

                              For{" "}
                              {
                                item.recipient_name
                              }
                            </span>
                          </div>
                        )}


                        {item.card_message && (
                          <div
                            className={
                              styles.infoRow
                            }
                          >
                            <span>
                              Card: “
                              {
                                item.card_message
                              }
                              ”
                            </span>

                            <strong>
                              Free
                            </strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
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
                  {estimatedDelivery.toFixed(
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
                  Verified again by
                  the backend
                </small>
              </div>

              <strong>
                $
                {estimatedTotal.toFixed(
                  2
                )}
              </strong>
            </div>


            {error && (
              <div
                className={
                  styles.error
                }
              >
                {error}
              </div>
            )}


            <button
              type="submit"
              className={
                styles.placeOrderButton
              }
              disabled={
                loading
              }
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className={
                      styles.spinner
                    }
                  />

                  Processing
                  payment...
                </>
              ) : (
                <>
                  Pay & Place Order

                  <ArrowRight
                    size={17}
                  />
                </>
              )}
            </button>


            <div
              className={
                styles.securityNote
              }
            >
              <LockKeyhole
                size={12}
              />

              Sandbox only — no real
              money will be charged.
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}