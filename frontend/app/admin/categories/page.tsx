"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Edit3,
  FolderPlus,
  FolderTree,
  Plus,
  X,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../../lib/auth";

import styles from "./Categories.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type CategoryForm = {
  name: string;
  slug: string;
  is_active: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  is_active: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [form, setForm] =
    useState<CategoryForm>(
      emptyForm
    );

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadCategories() {
    try {
      const response =
        await fetch(
          `${API_URL}/api/categories`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load categories."
        );
      }

      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function slugify(
    value: string
  ) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function openEdit(
    category: Category
  ) {
    setEditingId(category.id);

    setForm({
      name:
        category.name,

      slug:
        category.slug,

      is_active:
        category.is_active,
    });

    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const token =
      getAccessToken();

    if (!token) {
      return;
    }

    if (
      form.name.trim().length <
      2
    ) {
      setError(
        "Category name is required."
      );
      return;
    }

    const slug =
      form.slug.trim() ||
      slugify(form.name);

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          editingId
            ? `${API_URL}/api/categories/${editingId}`
            : `${API_URL}/api/categories`,
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
              JSON.stringify({
                name:
                  form.name.trim(),

                slug,

                is_active:
                  form.is_active,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save category."
        );
      }

      await loadCategories();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      setMessage(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateCategory(
    category: Category
  ) {
    const token =
      getAccessToken();

    if (!token) {
      return;
    }

    if (
      !window.confirm(
        `Deactivate ${category.name}?`
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/categories/${category.id}`,
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
            "Unable to deactivate category."
        );
      }

      await loadCategories();

      setMessage(
        "Category deactivated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate category."
      );
    }
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
            Catalog Structure
          </span>

          <h1>
            Categories
          </h1>

          <p>
            Organize products by
            occasion, recipient, and
            gift type.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreate
          }
          className={
            styles.primaryButton
          }
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {message && (
        <div
          className={
            styles.success
          }
        >
          {message}
        </div>
      )}

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
          styles.grid
        }
      >
        {categories.map(
          (category) => (
            <article
              key={
                category.id
              }
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.icon
                }
              >
                <FolderTree
                  size={22}
                />
              </div>

              <div
                className={
                  styles.cardTop
                }
              >
                <div>
                  <span>
                    Category
                  </span>

                  <h2>
                    {
                      category.name
                    }
                  </h2>
                </div>

                <span
                  className={
                    category.is_active
                      ? styles.active
                      : styles.inactive
                  }
                >
                  {category.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div
                className={
                  styles.slug
                }
              >
                <span>
                  Slug
                </span>

                <code>
                  {
                    category.slug
                  }
                </code>
              </div>

              <div
                className={
                  styles.actions
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    openEdit(
                      category
                    )
                  }
                >
                  <Edit3
                    size={14}
                  />
                  Edit
                </button>

                {category.is_active && (
                  <button
                    type="button"
                    className={
                      styles.danger
                    }
                    onClick={() =>
                      deactivateCategory(
                        category
                      )
                    }
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </article>
          )
        )}
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
              <div
                className={
                  styles.modalTitle
                }
              >
                <FolderPlus
                  size={20}
                />

                <div>
                  <span>
                    {editingId
                      ? "Edit Category"
                      : "New Category"}
                  </span>

                  <h2>
                    {editingId
                      ? "Update category"
                      : "Create category"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(
                    false
                  )
                }
              >
                <X size={18} />
              </button>
            </div>

            <label>
              Category name

              <input
                value={
                  form.name
                }
                onChange={(
                  event
                ) => {
                  const name =
                    event.target
                      .value;

                  setForm(
                    (current) => ({
                      ...current,

                      name,

                      slug:
                        editingId
                          ? current.slug
                          : slugify(
                              name
                            ),
                    })
                  );
                }}
              />
            </label>

            <label>
              Slug

              <input
                value={
                  form.slug
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,
                    slug:
                      event.target
                        .value,
                  })
                }
              />
            </label>

            <label
              className={
                styles.toggle
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

              Category is active
            </label>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                onClick={() =>
                  setShowForm(
                    false
                  )
                }
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
                    : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}