"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Search,
  ShoppingBag,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../../lib/auth";

import styles from "./Orders.module.css";

type Order = {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadOrders() {
      const token =
        getAccessToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/orders/admin/all`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.ok) {
        setOrders(
          await response.json()
        );
      }

      setLoading(false);
    }

    loadOrders();
  }, []);

  const filtered =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const matchesSearch =
            !text ||
            order.order_number
              .toLowerCase()
              .includes(text) ||
            order.full_name
              .toLowerCase()
              .includes(text) ||
            order.phone
              .toLowerCase()
              .includes(text);

          const matchesStatus =
            status === "all" ||
            order.order_status ===
              status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      orders,
      search,
      status,
    ]);

  return (
    <div className={styles.page}>
      <div
        className={
          styles.heading
        }
      >
        <div>
          <span>
            Order Management
          </span>

          <h1>Orders</h1>

          <p>
            Review customer
            purchases, delivery
            information, and order
            statuses.
          </p>
        </div>

        <div
          className={
            styles.summary
          }
        >
          <ShoppingBag
            size={20}
          />

          <div>
            <strong>
              {orders.length}
            </strong>

            <span>
              Total orders
            </span>
          </div>
        </div>
      </div>

      <div
        className={
          styles.toolbar
        }
      >
        <div
          className={
            styles.searchBox
          }
        >
          <Search size={17} />

          <input
            placeholder="Search by order, customer or phone..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="all">
            All statuses
          </option>

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
      </div>

      <div
        className={
          styles.tableCard
        }
      >
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>
                Payment
              </th>
              <th>
                Status
              </th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map(
              (order) => (
                <tr key={order.id}>
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
                    <span
                      className={
                        styles.date
                      }
                    >
                      <CalendarDays
                        size={13}
                      />

                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </span>
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
                    <span
                      className={
                        styles.badge
                      }
                    >
                      {
                        order.payment_status
                      }
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        styles.statusBadge
                      }
                    >
                      {
                        order.order_status
                      }
                    </span>
                  </td>

                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={
                        styles.viewButton
                      }
                    >
                      View
                      <ArrowRight
                        size={14}
                      />
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {!loading &&
          filtered.length === 0 && (
            <div
              className={
                styles.empty
              }
            >
              No orders match your
              filters.
            </div>
          )}
      </div>
    </div>
  );
}