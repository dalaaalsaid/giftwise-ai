"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  BarChart3,
  CheckCircle2,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../../lib/auth";

import styles from "./Reports.module.css";

type Order = {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
};

type Stats = {
  total_orders: number;
  total_sales: number;
  pending_orders: number;
  delivered_orders: number;
  total_products: number;
  top_selling_product:
    | string
    | null;
};

export default function ReportsPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [stats, setStats] =
    useState<Stats | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadReports() {
      const token =
        getAccessToken();

      if (!token) {
        return;
      }

      try {
        const [
          ordersResponse,
          statsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/orders/admin/all`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `${API_URL}/api/orders/admin/stats`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),
        ]);

        if (
          ordersResponse.ok
        ) {
          setOrders(
            await ordersResponse.json()
          );
        }

        if (
          statsResponse.ok
        ) {
          setStats(
            await statsResponse.json()
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const paidRevenue =
    useMemo(
      () =>
        orders
          .filter(
            (order) =>
              order.payment_status ===
                "paid" &&
              order.order_status !==
                "cancelled"
          )
          .reduce(
            (total, order) =>
              total +
              order.total,
            0
          ),
      [orders]
    );

  const averageOrderValue =
    orders.length > 0
      ? orders.reduce(
          (total, order) =>
            total +
            order.total,
          0
        ) / orders.length
      : 0;

  const statusCounts =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {
        pending: 0,
        confirmed: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach(
        (order) => {
          counts[
            order.order_status
          ] =
            (counts[
              order.order_status
            ] ?? 0) + 1;
        }
      );

      return counts;
    }, [orders]);

  const maxStatus =
    Math.max(
      1,
      ...Object.values(
        statusCounts
      )
    );

  if (loading) {
    return (
      <div
        className={
          styles.loading
        }
      >
        Preparing reports...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div
        className={
          styles.heading
        }
      >
        <div>
          <span>
            Business Analytics
          </span>

          <h1>
            Reports
          </h1>

          <p>
            Review sales,
            fulfillment, and store
            performance.
          </p>
        </div>

        <div
          className={
            styles.reportBadge
          }
        >
          <BarChart3 size={18} />
          Live Store Data
        </div>
      </div>

      <section
        className={
          styles.metrics
        }
      >
        <article>
          <div>
            <Banknote size={20} />
          </div>

          <span>
            Paid Revenue
          </span>

          <strong>
            $
            {paidRevenue.toFixed(
              2
            )}
          </strong>

          <p>
            Orders marked paid
          </p>
        </article>

        <article>
          <div>
            <ShoppingBag
              size={20}
            />
          </div>

          <span>
            Total Orders
          </span>

          <strong>
            {orders.length}
          </strong>

          <p>
            All recorded orders
          </p>
        </article>

        <article>
          <div>
            <ReceiptText
              size={20}
            />
          </div>

          <span>
            Average Order
          </span>

          <strong>
            $
            {averageOrderValue.toFixed(
              2
            )}
          </strong>

          <p>
            Average order value
          </p>
        </article>

        <article>
          <div>
            <CheckCircle2
              size={20}
            />
          </div>

          <span>
            Delivered
          </span>

          <strong>
            {stats?.delivered_orders ??
              0}
          </strong>

          <p>
            Completed deliveries
          </p>
        </article>
      </section>

      <section
        className={
          styles.reportGrid
        }
      >
        <article
          className={
            styles.chartCard
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <div>
              <span>
                Fulfillment
              </span>

              <h2>
                Orders by Status
              </h2>
            </div>

            <PackageCheck
              size={22}
            />
          </div>

          <div
            className={
              styles.bars
            }
          >
            {Object.entries(
              statusCounts
            ).map(
              ([
                status,
                count,
              ]) => (
                <div
                  key={
                    status
                  }
                  className={
                    styles.barRow
                  }
                >
                  <div
                    className={
                      styles.barLabel
                    }
                  >
                    <span>
                      {status}
                    </span>

                    <strong>
                      {count}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.barTrack
                    }
                  >
                    <div
                      className={
                        styles.barFill
                      }
                      style={{
                        width: `${(count / maxStatus) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </article>

        <article
          className={
            styles.highlightCard
          }
        >
          <TrendingUp
            size={27}
          />

          <span>
            Best Seller
          </span>

          <h2>
            {stats?.top_selling_product ??
              "No sales yet"}
          </h2>

          <p>
            Most frequently ordered
            GiftWise product based
            on current order data.
          </p>

          <div
            className={
              styles.highlightStats
            }
          >
            <div>
              <span>
                Active Products
              </span>

              <strong>
                {stats?.total_products ??
                  0}
              </strong>
            </div>

            <div>
              <span>
                Pending Orders
              </span>

              <strong>
                {stats?.pending_orders ??
                  0}
              </strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}