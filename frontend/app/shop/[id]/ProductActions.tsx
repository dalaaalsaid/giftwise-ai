"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import styles from "./ProductDetails.module.css";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_qty: number;
  image_url: string | null;
};

type CartItem = {
  cart_id: string;
  item_type:
    | "product"
    | "ready-made-box"
    | "custom-box";
  product_id?: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  image_url?: string | null;
};

type ProductActionsProps = {
  product: Product;
};

function readCart(): CartItem[] {
  try {
    const stored =
      localStorage.getItem("giftwise-cart");

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export default function ProductActions({
  product,
}: ProductActionsProps) {
  const router = useRouter();

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        product.stock_qty,
        current + 1
      )
    );
  }

  function addProductToCart() {
    if (product.stock_qty <= 0) {
      return;
    }

    const cart = readCart();

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.item_type ===
            "product" &&
          item.product_id ===
            product.id
      );

    if (existingIndex >= 0) {
      const existingItem =
        cart[existingIndex];

      const newQuantity =
        Math.min(
          product.stock_qty,
          existingItem.quantity +
            quantity
        );

      cart[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
        unit_price:
          product.price,
        image_url:
          product.image_url,
      };
    } else {
      cart.push({
        cart_id:
          crypto.randomUUID(),
        item_type: "product",
        product_id:
          product.id,
        name: product.name,
        description:
          product.description,
        quantity,
        unit_price:
          product.price,
        image_url:
          product.image_url,
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

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  function buyNow() {
    addProductToCart();

    router.push("/cart");
  }

  const outOfStock =
    product.stock_qty <= 0;

  return (
    <>
      <div
        className={
          styles.quantitySection
        }
      >
        <div>
          <span
            className={styles.label}
          >
            Quantity
          </span>

          <div
            className={
              styles.quantityControl
            }
          >
            <button
              type="button"
              onClick={
                decreaseQuantity
              }
              disabled={
                quantity <= 1 ||
                outOfStock
              }
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>

            <span>
              {outOfStock
                ? 0
                : quantity}
            </span>

            <button
              type="button"
              onClick={
                increaseQuantity
              }
              disabled={
                outOfStock ||
                quantity >=
                  product.stock_qty
              }
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={styles.actions}
      >
        <button
          type="button"
          className={
            added
              ? styles.addedCartButton
              : styles.cartButton
          }
          onClick={
            addProductToCart
          }
          disabled={outOfStock}
        >
          {added ? (
            <>
              <Check size={18} />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingBag
                size={18}
              />
              Add to cart
            </>
          )}
        </button>

        <button
          type="button"
          className={
            styles.buyButton
          }
          onClick={buyNow}
          disabled={outOfStock}
        >
          Buy now
        </button>
      </div>

      {quantity >=
        product.stock_qty &&
        product.stock_qty >
          0 && (
          <p
            className={
              styles.stockLimit
            }
          >
            Maximum available
            quantity selected.
          </p>
        )}
    </>
  );
}