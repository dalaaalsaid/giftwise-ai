"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  Check,
  MapPin,
  Package,
  Pencil,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../../../lib/auth";

import styles from "./OrderDetails.module.css";

type OrderItem = {
  name: string;
  quantity: number;
  line_total: number;
};

type Order = {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId =
    params.id as string;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [form, setForm] =
    useState({
      full_name: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      order_status:
        "pending",
      payment_status:
        "pending",
    });

  useEffect(() => {
    async function loadOrder() {
      const token =
        getAccessToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        return;
      }

      const data: Order =
        await response.json();

      setOrder(data);

      setForm({
        full_name:
          data.full_name,
        phone:
          data.phone,
        address:
          data.address,
        city:
          data.city,
        notes:
          data.notes ?? "",
        order_status:
          data.order_status,
        payment_status:
          data.payment_status,
      });
    }

    loadOrder();
  }, [orderId]);

  async function saveOrder() {
    const token =
      getAccessToken();

    if (!token) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/orders/admin/${orderId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              form
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save order."
        );
      }

      setOrder(data);
      setEditing(false);

      setMessage(
        "Order updated successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save order."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!order) {
    return (
      <div
        className={styles.loading}
      >
        Loading order...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div
        className={
          styles.topbar
        }
      >
        <Link
          href="/admin/orders"
        >
          <ArrowLeft
            size={16}
          />
          Back to orders
        </Link>

        <button
          type="button"
          onClick={() =>
            editing
              ? saveOrder()
              : setEditing(true)
          }
          disabled={saving}
        >
          {editing ? (
            <>
              <Save
                size={16}
              />
              {saving
                ? "Saving..."
                : "Save changes"}
            </>
          ) : (
            <>
              <Pencil
                size={16}
              />
              Edit order
            </>
          )}
        </button>
      </div>

      <div
        className={
          styles.heading
        }
      >
        <div>
          <span>
            Order Details
          </span>

          <h1>
            {
              order.order_number
            }
          </h1>

          <p>
            Created{" "}
            {new Date(
              order.created_at
            ).toLocaleString()}
          </p>
        </div>

        <div
          className={
            styles.statuses
          }
        >
          <span>
            {
              order.order_status
            }
          </span>

          <span>
            {
              order.payment_status
            }
          </span>
        </div>
      </div>

      {message && (
        <div
          className={
            styles.message
          }
        >
          <Check size={15} />
          {message}
        </div>
      )}

      <div
        className={
          styles.layout
        }
      >
        <div>
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardTitle
              }
            >
              <UserRound
                size={19}
              />

              <div>
                <span>
                  Customer
                </span>

                <h2>
                  Customer information
                </h2>
              </div>
            </div>

            <div
              className={
                styles.formGrid
              }
            >
              <label>
                Full name

                <input
                  disabled={
                    !editing
                  }
                  value={
                    form.full_name
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      full_name:
                        event.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Phone

                <input
                  disabled={
                    !editing
                  }
                  value={
                    form.phone
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      phone:
                        event.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                City

                <input
                  disabled={
                    !editing
                  }
                  value={
                    form.city
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      city:
                        event.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Address

                <input
                  disabled={
                    !editing
                  }
                  value={
                    form.address
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      address:
                        event.target
                          .value,
                    })
                  }
                />
              </label>
            </div>

            <label
              className={
                styles.notes
              }
            >
              Delivery notes

              <textarea
                disabled={
                  !editing
                }
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    notes:
                      event.target
                        .value,
                  })
                }
              />
            </label>
          </section>

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardTitle
              }
            >
              <Package
                size={19}
              />

              <div>
                <span>
                  Products
                </span>

                <h2>
                  Order items
                </h2>
              </div>
            </div>

            <div
              className={
                styles.items
              }
            >
              {order.items.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                  >
                    <div>
                      <strong>
                        {
                          item.name
                        }
                      </strong>

                      <span>
                        Quantity:{" "}
                        {
                          item.quantity
                        }
                      </span>
                    </div>

                    <strong>
                      $
                      {item.line_total.toFixed(
                        2
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        <aside
          className={
            styles.sideCard
          }
        >
          <h2>
            Order Summary
          </h2>

          <div
            className={
              styles.priceRows
            }
          >
            <div>
              <span>
                Subtotal
              </span>

              <strong>
                $
                {order.subtotal.toFixed(
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
                {order.delivery_fee.toFixed(
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
            <span>Total</span>

            <strong>
              $
              {order.total.toFixed(
                2
              )}
            </strong>
          </div>

          <label>
            Order status

            <select
              disabled={
                !editing
              }
              value={
                form.order_status
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,
                  order_status:
                    event.target
                      .value,
                })
              }
            >
              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="preparing">
                Preparing
              </option>

              <option value="ready">
                Ready
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </label>

          <label>
            Payment status

            <select
              disabled={
                !editing
              }
              value={
                form.payment_status
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,
                  payment_status:
                    event.target
                      .value,
                })
              }
            >
              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="refunded">
                Refunded
              </option>
            </select>
          </label>

          {order.payment_status ===
            "paid" && (
            <p
              className={
                styles.warning
              }
            >
              This order has already
              been paid. Product and
              price changes should not
              be made without an
              adjustment or refund.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}