"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  Boxes,
  Edit3,
  PackagePlus,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../../lib/auth";

import styles from "./Products.module.css";

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

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock_qty: string;
  category_ids: string[];
  image_url: string;
  is_active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock_qty: "",
  category_ids: [],
  image_url: "",
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function loadData() {
    const token = getAccessToken();

    if (!token) {
      setError(
        "Your session has expired. Please sign in again."
      );
      return;
    }

    try {
      const [
        productsResponse,
        categoriesResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/products`
        ),
        fetch(
          `${API_URL}/api/categories`
        ),
      ]);

      const productsData =
        await productsResponse.json();

      const categoriesData =
        await categoriesResponse.json();

      if (!productsResponse.ok) {
        throw new Error(
          productsData.detail ||
            "Unable to load products."
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesData.detail ||
            "Unable to load categories."
        );
      }

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      if (!text) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(text) ||
          product.description
            .toLowerCase()
            .includes(text)
      );
    }, [products, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEdit(
    product: Product
  ) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      description:
        product.description,
      price: String(
        product.price
      ),
      stock_qty: String(
        product.stock_qty
      ),
      category_ids:
        product.category_ids,
      image_url:
        product.image_url ?? "",
      is_active:
        product.is_active,
    });

    setShowForm(true);
    setError("");
    setMessage("");
  }

  function toggleCategory(
    categoryId: string
  ) {
    setForm((current) => ({
      ...current,

      category_ids:
        current.category_ids.includes(
          categoryId
        )
          ? current.category_ids.filter(
              (id) =>
                id !== categoryId
            )
          : [
              ...current.category_ids,
              categoryId,
            ],
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const token =
      getAccessToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please sign in again."
      );
      return;
    }

    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (
      !form.description.trim()
    ) {
      setError(
        "Product description is required."
      );
      return;
    }

    const price =
      Number(form.price);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError(
        "Price must be greater than zero."
      );
      return;
    }

    const stock =
      Number(form.stock_qty);

    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      setError(
        "Stock quantity must be zero or greater."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name:
          form.name.trim(),

        description:
          form.description.trim(),

        price,

        stock_qty:
          stock,

        category_ids:
          form.category_ids,

        image_url:
          form.image_url.trim() ||
          null,

        is_active:
          form.is_active,
      };

      const response =
        await fetch(
          editingId
            ? `${API_URL}/api/products/${editingId}`
            : `${API_URL}/api/products`,
          {
            method:
              editingId
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      let data:
        | Record<string, unknown>
        | null = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const detail =
          typeof data?.detail ===
          "string"
            ? data.detail
            : "Unable to save product.";

        throw new Error(detail);
      }

      const wasEditing =
        Boolean(editingId);

      await loadData();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setError("");

      setMessage(
        wasEditing
          ? "Product updated successfully."
          : "Product created successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateProduct(
    product: Product
  ) {
    const token =
      getAccessToken();

    if (!token) {
      setError(
        "Your admin session has expired. Please sign in again."
      );
      return;
    }

    if (
      !window.confirm(
        `Deactivate ${product.name}?`
      )
    ) {
      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/products/${product.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to deactivate product."
        );
      }

      await loadData();

      setMessage(
        "Product deactivated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate product."
      );
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span>
            Catalog Management
          </span>

          <h1>
            Products
          </h1>

          <p>
            Add, edit, organize,
            and deactivate products
            available in GiftWise.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.primaryButton
          }
          onClick={openCreate}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <section
        className={
          styles.summaryGrid
        }
      >
        <article>
          <Boxes size={20} />

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {products.length}
            </strong>
          </div>
        </article>

        <article>
          <PackagePlus
            size={20}
          />

          <div>
            <span>Active</span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.is_active
                ).length
              }
            </strong>
          </div>
        </article>

        <article>
          <Archive size={20} />

          <div>
            <span>
              Low Stock
            </span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.stock_qty >
                      0 &&
                    product.stock_qty <=
                      5
                ).length
              }
            </strong>
          </div>
        </article>
      </section>

      {message && (
        <div
          className={
            styles.success
          }
        >
          {message}
        </div>
      )}

      {!showForm &&
        error && (
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>
        )}

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
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <div
        className={
          styles.tableCard
        }
      >
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>
                Categories
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(
              (product) => (
                <tr
                  key={
                    product.id
                  }
                >
                  <td>
                    <div
                      className={
                        styles.productInfo
                      }
                    >
                      <div
                        className={
                          styles.productIcon
                        }
                      >
                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                            className={
                              styles.productImage
                            }
                          />
                        ) : (
                          <Boxes
                            size={18}
                          />
                        )}
                      </div>

                      <div>
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.description
                          }
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong>
                      $
                      {product.price.toFixed(
                        2
                      )}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={
                        product.stock_qty <=
                        5
                          ? styles.lowStock
                          : styles.stock
                      }
                    >
                      {
                        product.stock_qty
                      }
                    </span>
                  </td>

                  <td>
                    <div
                      className={
                        styles.categoryList
                      }
                    >
                      {product.category_ids.map(
                        (
                          categoryId
                        ) => {
                          const category =
                            categories.find(
                              (
                                item
                              ) =>
                                item.id ===
                                categoryId
                            );

                          return (
                            <span
                              key={
                                categoryId
                              }
                            >
                              {category?.name ??
                                "Category"}
                            </span>
                          );
                        }
                      )}
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        product.is_active
                          ? styles.activeBadge
                          : styles.inactiveBadge
                      }
                    >
                      {product.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div
                      className={
                        styles.actions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            product
                          )
                        }
                      >
                        <Edit3
                          size={15}
                        />
                        Edit
                      </button>

                      {product.is_active && (
                        <button
                          type="button"
                          className={
                            styles.dangerButton
                          }
                          onClick={() =>
                            deactivateProduct(
                              product
                            )
                          }
                        >
                          <Archive
                            size={15}
                          />
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className={
            styles.modalOverlay
          }
        >
          <form
            className={
              styles.modal
            }
            onSubmit={
              handleSubmit
            }
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <span>
                  {editingId
                    ? "Edit Product"
                    : "New Product"}
                </span>

                <h2>
                  {editingId
                    ? "Update product"
                    : "Add a product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(
                    false
                  );
                  setError("");
                }}
              >
                <X size={18} />
              </button>
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

            <div
              className={
                styles.formGrid
              }
            >
              <label>
                Product name

                <input
                  required
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      name:
                        event.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Price

                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.price
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      price:
                        event.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Stock quantity

                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={
                    form.stock_qty
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      stock_qty:
                        event.target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Image URL

                <input
                  value={
                    form.image_url
                  }
                  placeholder="/products/example.jpeg"
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      image_url:
                        event.target
                          .value,
                    })
                  }
                />
              </label>
            </div>

            <label
              className={
                styles.fullField
              }
            >
              Description

              <textarea
                required
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    description:
                      event.target
                        .value,
                  })
                }
              />
            </label>

            <div
              className={
                styles.categoriesField
              }
            >
              <strong>
                Categories
              </strong>

              <div>
                {categories.map(
                  (category) => (
                    <label
                      key={
                        category.id
                      }
                    >
                      <input
                        type="checkbox"
                        checked={form.category_ids.includes(
                          category.id
                        )}
                        onChange={() =>
                          toggleCategory(
                            category.id
                          )
                        }
                      />

                      {
                        category.name
                      }
                    </label>
                  )
                )}
              </div>
            </div>

            <label
              className={
                styles.activeToggle
              }
            >
              <input
                type="checkbox"
                checked={
                  form.is_active
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    is_active:
                      event.target
                        .checked,
                  })
                }
              />

              Product is active
            </label>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                onClick={() => {
                  setShowForm(
                    false
                  );
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}