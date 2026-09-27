"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Gift,
  Loader2,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../lib/auth";

import styles from "./MyOrders.module.css";

type OrderItem = {
  item_type: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_ids: string[];
  recipient_name: string | null;
  card_message: string | null;
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

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadOrders() {
      const token =
        getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/orders/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401
        ) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to load your orders."
          );
        }

        setOrders(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  if (loading) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <Loader2
          size={30}
          className={styles.spinner}
        />

        <span>
          Loading your orders...
        </span>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link
          href="/"
          className={styles.backLink}
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <section
          className={styles.heading}
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              <ReceiptText
                size={14}
              />
              Your GiftWise history
            </span>

            <h1>My Orders</h1>

            <p>
              Track your GiftWise
              purchases and order
              statuses.
            </p>
          </div>

          <div
            className={
              styles.orderCount
            }
          >
            <strong>
              {orders.length}
            </strong>

            <span>
              {orders.length === 1
                ? "order"
                : "orders"}
            </span>
          </div>
        </section>

        {error && (
          <div
            className={styles.error}
          >
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <section
            className={
              styles.empty
            }
          >
            <ShoppingBag
              size={42}
            />

            <h2>
              No orders yet.
            </h2>

            <p>
              Once you place an order,
              it will appear here.
            </p>

            <Link href="/shop">
              Start shopping
            </Link>
          </section>
        ) : (
          <section
            className={
              styles.ordersList
            }
          >
            {orders.map((order) => (
              <article
                className={
                  styles.orderCard
                }
                key={order.id}
              >
                <div
                  className={
                    styles.orderTop
                  }
                >
                  <div>
                    <span>
                      Order
                    </span>

                    <h2>
                      {
                        order.order_number
                      }
                    </h2>

                    <p>
                      {new Date(
                        order.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={
                      styles.statusGroup
                    }
                  >
                    <span
                      className={
                        styles.orderStatus
                      }
                    >
                      {
                        order.order_status
                      }
                    </span>

                    <span
                      className={
                        styles.paymentStatus
                      }
                    >
                      {
                        order.payment_status
                      }
                    </span>
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
                        key={`${order.id}-${index}`}
                        className={
                          styles.item
                        }
                      >
                        <div
                          className={
                            styles.itemIcon
                          }
                        >
                          <Gift
                            size={19}
                          />
                        </div>

                        <div
                          className={
                            styles.itemInfo
                          }
                        >
                          <strong>
                            {
                              item.name
                            }
                          </strong>

                          <span>
                            Qty{" "}
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

                <div
                  className={
                    styles.orderBottom
                  }
                >
                  <div
                    className={
                      styles.delivery
                    }
                  >
                    <PackageCheck
                      size={18}
                    />

                    <div>
                      <span>
                        Delivery
                      </span>

                      <strong>
                        {
                          order.address
                        }
                        ,{" "}
                        {
                          order.city
                        }
                      </strong>
                    </div>
                  </div>

                  <div
                    className={
                      styles.total
                    }
                  >
                    <span>
                      Total
                    </span>

                    <strong>
                      $
                      {order.total.toFixed(
                        2
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}