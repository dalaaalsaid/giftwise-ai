"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Clock3,
  DollarSign,
  Gift,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
  getStoredUser,
} from "../../lib/auth";

import styles from "./Admin.module.css";


type DashboardStats = {
  total_orders: number;
  total_sales: number;
  pending_orders: number;
  delivered_orders: number;
  total_products: number;
  top_selling_product: string | null;
};


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


const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];


const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
];


export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<DashboardStats | null>(
      null
    );

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);


  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      const token =
        getAccessToken();

      const user =
        getStoredUser();

      if (!token) {
        router.replace("/login");
        return;
      }

      if (
        !user ||
        user.role !== "admin"
      ) {
        router.replace("/");
        return;
      }

      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        }

        const [
          statsResponse,
          ordersResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/orders/admin/stats`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `${API_URL}/api/orders/admin/all`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),
        ]);


        if (
          statsResponse.status === 401 ||
          ordersResponse.status === 401
        ) {
          router.replace("/login");
          return;
        }


        if (
          statsResponse.status === 403 ||
          ordersResponse.status === 403
        ) {
          router.replace("/");
          return;
        }


        const statsData =
          await statsResponse.json();

        const ordersData =
          await ordersResponse.json();


        if (!statsResponse.ok) {
          throw new Error(
            statsData.detail ||
              "Unable to load dashboard statistics."
          );
        }


        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.detail ||
              "Unable to load orders."
          );
        }


        setStats(statsData);

        setOrders(
          Array.isArray(ordersData)
            ? ordersData
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );


  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  async function updateOrderStatus(
    orderId: string,
    orderStatus: string
  ) {
    const token =
      getAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/orders/admin/${orderId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              order_status:
                orderStatus,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update order status."
        );
      }


      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? data
            : order
        )
      );


      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }


  async function updatePaymentStatus(
    orderId: string,
    paymentStatus: string
  ) {
    const token =
      getAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/orders/admin/${orderId}/payment`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              payment_status:
                paymentStatus,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update payment status."
        );
      }


      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? data
            : order
        )
      );


      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update payment status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }


  if (loading) {
    return (
      <main
        className={styles.loadingPage}
      >
        <Loader2
          size={30}
          className={styles.spinner}
        />

        <span>
          Loading GiftWise dashboard...
        </span>
      </main>
    );
  }


  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <Link
            href="/"
            className={styles.backLink}
          >
            <ArrowLeft size={17} />
            Back to shop
          </Link>

          <button
            type="button"
            className={
              styles.refreshButton
            }
            disabled={refreshing}
            onClick={() =>
              loadDashboard(true)
            }
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? styles.spinner
                  : ""
              }
            />

            Refresh
          </button>
        </div>


        <section
          className={styles.hero}
        >
          <div>
            <span
              className={styles.eyebrow}
            >
              <Sparkles size={14} />
              GiftWise Administration
            </span>

            <h1>
              Store Dashboard
            </h1>

            <p>
              Monitor sales, orders,
              products, and fulfillment
              from one place.
            </p>
          </div>

          <div
            className={
              styles.heroIcon
            }
          >
            <TrendingUp size={36} />
          </div>
        </section>


        {error && (
          <div
            className={styles.error}
          >
            {error}
          </div>
        )}


        {stats && (
          <section
            className={
              styles.statsGrid
            }
          >
            <article
              className={styles.statCard}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                <DollarSign
                  size={21}
                />
              </div>

              <span>
                Total Sales
              </span>

              <strong>
                $
                {stats.total_sales.toFixed(
                  2
                )}
              </strong>

              <p>
                Non-cancelled orders
              </p>
            </article>


            <article
              className={styles.statCard}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                <ShoppingBag
                  size={21}
                />
              </div>

              <span>
                Total Orders
              </span>

              <strong>
                {stats.total_orders}
              </strong>

              <p>
                All customer orders
              </p>
            </article>


            <article
              className={styles.statCard}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                <Clock3 size={21} />
              </div>

              <span>
                Pending Orders
              </span>

              <strong>
                {stats.pending_orders}
              </strong>

              <p>
                Waiting for action
              </p>
            </article>


            <article
              className={styles.statCard}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                <PackageCheck
                  size={21}
                />
              </div>

              <span>
                Delivered
              </span>

              <strong>
                {stats.delivered_orders}
              </strong>

              <p>
                Completed orders
              </p>
            </article>


            <article
              className={styles.statCard}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                <Box size={21} />
              </div>

              <span>
                Active Products
              </span>

              <strong>
                {stats.total_products}
              </strong>

              <p>
                Available catalog items
              </p>
            </article>


            <article
              className={`${styles.statCard} ${styles.bestSellerCard}`}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                <Gift size={21} />
              </div>

              <span>
                Best Seller
              </span>

              <strong
                className={
                  styles.productName
                }
              >
                {stats.top_selling_product ??
                  "No sales yet"}
              </strong>

              <p>
                Most ordered product
              </p>
            </article>
          </section>
        )}


        <section
          className={
            styles.ordersSection
          }
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <div>
              <span>
                Order Management
              </span>

              <h2>
                Recent Orders
              </h2>

              <p>
                Update order and payment
                statuses directly from
                the dashboard.
              </p>
            </div>

            <div
              className={
                styles.orderCount
              }
            >
              {orders.length}
              <span>orders</span>
            </div>
          </div>


          {orders.length === 0 ? (
            <div
              className={
                styles.emptyOrders
              }
            >
              <ShoppingBag
                size={35}
              />

              <h3>
                No orders yet
              </h3>

              <p>
                Customer orders will
                appear here.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.tableWrapper
              }
            >
              <table
                className={
                  styles.ordersTable
                }
              >
                <thead>
                  <tr>
                    <th>
                      Order
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Items
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Order Status
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map(
                    (order) => (
                      <tr
                        key={order.id}
                      >
                        <td>
                          <strong
                            className={
                              styles.orderNumber
                            }
                          >
                            {
                              order.order_number
                            }
                          </strong>
                        </td>


                        <td>
                          <div
                            className={
                              styles.customer
                            }
                          >
                            <strong>
                              {
                                order.full_name
                              }
                            </strong>

                            <span>
                              {order.city}
                            </span>
                          </div>
                        </td>


                        <td>
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
                                <span
                                  key={`${order.id}-${index}`}
                                >
                                  {
                                    item.quantity
                                  }
                                  ×{" "}
                                  {
                                    item.name
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </td>


                        <td>
                          <strong>
                            $
                            {order.total.toFixed(
                              2
                            )}
                          </strong>
                        </td>


                        <td>
                          <select
                            value={
                              order.order_status
                            }
                            disabled={
                              updatingOrderId ===
                              order.id
                            }
                            className={
                              styles.statusSelect
                            }
                            onChange={(
                              event
                            ) =>
                              updateOrderStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            {orderStatuses.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>


                        <td>
                          <select
                            value={
                              order.payment_status
                            }
                            disabled={
                              updatingOrderId ===
                              order.id
                            }
                            className={
                              styles.paymentSelect
                            }
                            onChange={(
                              event
                            ) =>
                              updatePaymentStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            {paymentStatuses.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>


                        <td>
                          <span
                            className={
                              styles.date
                            }
                          >
                            {new Date(
                              order.created_at
                            ).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>


        <section
          className={
            styles.quickLinks
          }
        >
          <Link href="/shop">
            <Gift size={19} />

            <div>
              <span>
                Storefront
              </span>

              <strong>
                View products
              </strong>
            </div>
          </Link>

          <Link
            href="/ai-gift-finder"
          >
            <Sparkles size={19} />

            <div>
              <span>
                GiftWise AI
              </span>

              <strong>
                Test recommendations
              </strong>
            </div>
          </Link>

          <Link href="/build-box">
            <Box size={19} />

            <div>
              <span>
                Custom boxes
              </span>

              <strong>
                Test box builder
              </strong>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}