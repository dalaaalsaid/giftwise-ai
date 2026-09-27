"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  Gift,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import styles from "./OrderSuccess.module.css";


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


export default function OrderSuccessPage() {
  const [order, setOrder] =
    useState<OrderResponse | null>(
      null
    );

  const [loaded, setLoaded] =
    useState(false);


  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          "giftwise-last-order"
        );

      if (stored) {
        setOrder(
          JSON.parse(stored)
        );
      }
    } finally {
      setLoaded(true);
    }
  }, []);


  if (!loaded) {
    return null;
  }


  if (!order) {
    return (
      <main className={styles.page}>
        <div
          className={styles.container}
        >
          <section
            className={
              styles.missing
            }
          >
            <ShoppingBag
              size={42}
            />

            <h1>
              No recent order found.
            </h1>

            <Link href="/shop">
              Return to shop
            </Link>
          </section>
        </div>
      </main>
    );
  }


  return (
    <main className={styles.page}>
      <div
        className={styles.container}
      >
        <section
          className={styles.successHero}
        >
          <div
            className={
              styles.successIcon
            }
          >
            <Check size={38} />
          </div>

          <span
            className={styles.eyebrow}
          >
            <Sparkles size={14} />
            Order placed successfully
          </span>

          <h1>
            Your gift is officially
            on its way.
          </h1>

          <p>
            Thank you,{" "}
            {order.full_name}. Your
            GiftWise order has been
            created successfully.
          </p>

          <div
            className={
              styles.orderNumber
            }
          >
            <span>
              Order Number
            </span>

            <strong>
              {order.order_number}
            </strong>
          </div>
        </section>


        <section
          className={
            styles.detailsGrid
          }
        >
          <article
            className={
              styles.detailCard
            }
          >
            <div
              className={
                styles.cardIcon
              }
            >
              <ReceiptText
                size={21}
              />
            </div>

            <span>
              Order total
            </span>

            <strong
              className={
                styles.bigValue
              }
            >
              ${order.total.toFixed(2)}
            </strong>

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
          </article>


          <article
            className={
              styles.detailCard
            }
          >
            <div
              className={
                styles.cardIcon
              }
            >
              <PackageCheck
                size={21}
              />
            </div>

            <span>
              Order status
            </span>

            <strong
              className={
                styles.status
              }
            >
              {order.order_status}
            </strong>

            <p>
              Your order has been
              saved and is waiting
              for processing.
            </p>
          </article>


          <article
            className={
              styles.detailCard
            }
          >
            <div
              className={
                styles.cardIcon
              }
            >
              <Gift size={21} />
            </div>

            <span>
              Payment
            </span>

            <strong
              className={
                styles.status
              }
            >
              {order.payment_status}
            </strong>

            <p>
              The project currently
              uses the test payment
              flow.
            </p>
          </article>
        </section>


        <section
          className={
            styles.deliveryCard
          }
        >
          <div>
            <span>
              Delivery details
            </span>

            <h2>
              {order.full_name}
            </h2>

            <p>
              {order.address},{" "}
              {order.city}
            </p>

            <p>
              {order.phone}
            </p>
          </div>

          <PackageCheck
            size={48}
          />
        </section>


        <section
          className={
            styles.actions
          }
        >
          <Link
            href="/shop"
            className={
              styles.primaryButton
            }
          >
            Continue shopping
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/"
            className={
              styles.secondaryButton
            }
          >
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}