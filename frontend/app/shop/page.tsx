"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowRight,
  Gift,
  Heart,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import styles from "./Shop.module.css";

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

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "name";

type PriceRange =
  | "under-25"
  | "25-50"
  | "50-100"
  | "100-plus";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

const categoryIcons: Record<
  string,
  string
> = {
  birthday: "🎂",
  graduation: "🎓",
  "for-her": "🌷",
  "for-him": "🎁",
  flowers: "💐",
  "self-care": "🕯️",
  chocolate: "🍫",
};

export default function ShopPage() {
  const searchParams =
    useSearchParams();

  const categoryFromUrl =
    searchParams.get("category") ?? "";

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    categoryFromUrl
  );

  const [sortBy, setSortBy] =
    useState<SortOption>(
      "featured"
    );

  const [
    selectedPriceRanges,
    setSelectedPriceRanges,
  ] = useState<
    PriceRange[]
  >([]);

  const [
    inStockOnly,
    setInStockOnly,
  ] = useState(false);

  const [
    lowStockOnly,
    setLowStockOnly,
  ] = useState(false);

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(true);

  useEffect(() => {
    setSelectedCategory(
      categoryFromUrl
    );
  }, [categoryFromUrl]);

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        setError("");

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

        if (
          !productsResponse.ok
        ) {
          throw new Error(
            "Unable to load products."
          );
        }

        if (
          !categoriesResponse.ok
        ) {
          throw new Error(
            "Unable to load categories."
          );
        }

        const productsData:
          Product[] =
          await productsResponse.json();

        const categoriesData:
          Category[] =
          await categoriesResponse.json();

        setProducts(
          productsData.filter(
            (product) =>
              product.is_active
          )
        );

        setCategories(
          categoriesData.filter(
            (category) =>
              category.is_active
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the shop."
        );
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, []);

  function togglePriceRange(
    range: PriceRange
  ) {
    setSelectedPriceRanges(
      (current) =>
        current.includes(range)
          ? current.filter(
              (item) =>
                item !== range
            )
          : [
              ...current,
              range,
            ]
    );
  }

  function matchesPrice(
    product: Product
  ) {
    if (
      selectedPriceRanges.length ===
      0
    ) {
      return true;
    }

    return selectedPriceRanges.some(
      (range) => {
        if (
          range === "under-25"
        ) {
          return (
            product.price < 25
          );
        }

        if (range === "25-50") {
          return (
            product.price >= 25 &&
            product.price <= 50
          );
        }

        if (range === "50-100") {
          return (
            product.price > 50 &&
            product.price <= 100
          );
        }

        if (
          range === "100-plus"
        ) {
          return (
            product.price > 100
          );
        }

        return true;
      }
    );
  }

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const filtered =
        products.filter(
          (product) => {
            const matchesSearch =
              !normalizedSearch ||
              product.name
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              product.description
                .toLowerCase()
                .includes(
                  normalizedSearch
                );

            const matchesCategory =
              !selectedCategory ||
              product.category_ids.includes(
                selectedCategory
              );

            const priceMatches =
              matchesPrice(product);

            const stockMatches =
              !inStockOnly ||
              product.stock_qty > 0;

            const lowStockMatches =
              !lowStockOnly ||
              (
                product.stock_qty >
                  0 &&
                product.stock_qty <=
                  5
              );

            return (
              matchesSearch &&
              matchesCategory &&
              priceMatches &&
              stockMatches &&
              lowStockMatches
            );
          }
        );

      if (
        sortBy === "price-low"
      ) {
        return [
          ...filtered,
        ].sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (
        sortBy === "price-high"
      ) {
        return [
          ...filtered,
        ].sort(
          (a, b) =>
            b.price - a.price
        );
      }

      if (sortBy === "name") {
        return [
          ...filtered,
        ].sort((a, b) =>
          a.name.localeCompare(
            b.name
          )
        );
      }

      return filtered;
    }, [
      products,
      search,
      selectedCategory,
      selectedPriceRanges,
      inStockOnly,
      lowStockOnly,
      sortBy,
    ]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("");
    setSelectedPriceRanges([]);
    setInStockOnly(false);
    setLowStockOnly(false);
    setSortBy("featured");
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.hero}
      >
        <div
          className={
            styles.heroInner
          }
        >
          <span
            className={
              styles.eyebrow
            }
          >
            GiftWise Collection
          </span>

          <h1>
            Gifts worth
            <span>
              {" "}
              giving.
            </span>
          </h1>

          <p>
            Browse thoughtful gifts,
            curated boxes, and
            meaningful surprises for
            every occasion.
          </p>
        </div>
      </section>

      <section
        className={
          styles.shopSection
        }
      >
        <div
          className={
            styles.container
          }
        >
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
              <Search size={18} />

              <input
                type="text"
                placeholder="Search gifts by name or description..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <button
              type="button"
              className={
                filtersOpen
                  ? `${styles.filterButton} ${styles.filterButtonActive}`
                  : styles.filterButton
              }
              onClick={() =>
                setFiltersOpen(
                  (current) =>
                    !current
                )
              }
            >
              <SlidersHorizontal
                size={17}
              />
              Filters
            </button>

            <select
              className={
                styles.sortSelect
              }
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as SortOption
                )
              }
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name">
                Name: A to Z
              </option>
            </select>
          </div>

          <div
            className={
              styles.categoryBar
            }
          >
            <button
              type="button"
              className={
                !selectedCategory
                  ? `${styles.categoryButton} ${styles.categoryActive}`
                  : styles.categoryButton
              }
              onClick={() =>
                setSelectedCategory(
                  ""
                )
              }
            >
              All Gifts
            </button>

            {categories.map(
              (category) => (
                <button
                  type="button"
                  key={category.id}
                  className={
                    selectedCategory ===
                    category.id
                      ? `${styles.categoryButton} ${styles.categoryActive}`
                      : styles.categoryButton
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category.id
                    )
                  }
                >
                  <span>
                    {categoryIcons[
                      category.slug
                    ] ?? "🎁"}
                  </span>

                  {category.name}
                </button>
              )
            )}
          </div>

          <div
            className={
              filtersOpen
                ? styles.shopLayout
                : styles.shopLayoutNoFilters
            }
          >
            {filtersOpen && (
              <aside
                className={
                  styles.sidebar
                }
              >
                <div
                  className={
                    styles.filterHeader
                  }
                >
                  <strong>
                    Filters
                  </strong>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear all
                  </button>
                </div>

                <div
                  className={
                    styles.filterGroup
                  }
                >
                  <h3>
                    Price
                  </h3>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(
                        "under-25"
                      )}
                      onChange={() =>
                        togglePriceRange(
                          "under-25"
                        )
                      }
                    />

                    <span>
                      Under $25
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(
                        "25-50"
                      )}
                      onChange={() =>
                        togglePriceRange(
                          "25-50"
                        )
                      }
                    />

                    <span>
                      $25 – $50
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(
                        "50-100"
                      )}
                      onChange={() =>
                        togglePriceRange(
                          "50-100"
                        )
                      }
                    />

                    <span>
                      $50 – $100
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(
                        "100-plus"
                      )}
                      onChange={() =>
                        togglePriceRange(
                          "100-plus"
                        )
                      }
                    />

                    <span>
                      Over $100
                    </span>
                  </label>
                </div>

                <div
                  className={
                    styles.filterGroup
                  }
                >
                  <h3>
                    Availability
                  </h3>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        inStockOnly
                      }
                      onChange={(
                        event
                      ) =>
                        setInStockOnly(
                          event.target
                            .checked
                        )
                      }
                    />

                    <span>
                      In stock only
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        lowStockOnly
                      }
                      onChange={(
                        event
                      ) =>
                        setLowStockOnly(
                          event.target
                            .checked
                        )
                      }
                    />

                    <span>
                      Low stock
                    </span>
                  </label>

                  <p
                    className={
                      styles.filterHelp
                    }
                  >
                    Low stock means 5
                    items or fewer are
                    currently available.
                  </p>
                </div>
              </aside>
            )}

            <div
              className={
                styles.productsArea
              }
            >
              <div
                className={
                  styles.productsHeader
                }
              >
                <div>
                  <h2>
                    {selectedCategory
                      ? categories.find(
                          (
                            category
                          ) =>
                            category.id ===
                            selectedCategory
                        )?.name ??
                        "Gifts"
                      : "All Gifts"}
                  </h2>

                  <span>
                    {
                      filteredProducts.length
                    }{" "}
                    {filteredProducts.length ===
                    1
                      ? "product"
                      : "products"}
                  </span>
                </div>

                {(search ||
                  selectedCategory ||
                  selectedPriceRanges.length >
                    0 ||
                  inStockOnly ||
                  lowStockOnly) && (
                  <button
                    type="button"
                    className={
                      styles.resetButton
                    }
                    onClick={
                      clearFilters
                    }
                  >
                    Reset results
                  </button>
                )}
              </div>

              {loading ? (
                <div
                  className={
                    styles.state
                  }
                >
                  <Gift
                    size={32}
                  />

                  <strong>
                    Loading gifts...
                  </strong>
                </div>
              ) : error ? (
                <div
                  className={
                    styles.state
                  }
                >
                  <Gift
                    size={32}
                  />

                  <strong>
                    {error}
                  </strong>

                  <p>
                    Make sure the
                    FastAPI backend is
                    running on port
                    8000.
                  </p>
                </div>
              ) : filteredProducts.length ===
                0 ? (
                <div
                  className={
                    styles.state
                  }
                >
                  <Search
                    size={32}
                  />

                  <strong>
                    No gifts found.
                  </strong>

                  <p>
                    Try another search,
                    category, or price
                    range.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    styles.productGrid
                  }
                >
                  {filteredProducts.map(
                    (
                      product,
                      index
                    ) => (
                      <article
                        className={
                          styles.productCard
                        }
                        key={
                          product.id
                        }
                      >
                        <Link
                          href={`/shop/${product.id}`}
                          className={`${styles.productImage} ${
                            styles[
                              `image${(index % 4) + 1}`
                            ]
                          }`}
                        >
                          {product.image_url ? (
                            <img
                              src={
                                product.image_url
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <div
                              className={
                                styles.placeholder
                              }
                            >
                              <Gift
                                size={
                                  52
                                }
                                strokeWidth={
                                  1.15
                                }
                              />
                            </div>
                          )}

                          <span
                            className={
                              styles.stockBadge
                            }
                          >
                            {product.stock_qty >
                            0
                              ? product.stock_qty <=
                                5
                                ? "Low stock"
                                : "In stock"
                              : "Out of stock"}
                          </span>

                          <span
                            className={
                              styles.heartButton
                            }
                          >
                            <Heart
                              size={18}
                            />
                          </span>
                        </Link>

                        <div
                          className={
                            styles.productContent
                          }
                        >
                          <span
                            className={
                              styles.productLabel
                            }
                          >
                            GiftWise
                            Collection
                          </span>

                          <Link
                            href={`/shop/${product.id}`}
                            className={
                              styles.productTitle
                            }
                          >
                            {
                              product.name
                            }
                          </Link>

                          <p>
                            {
                              product.description
                            }
                          </p>

                          <div
                            className={
                              styles.productFooter
                            }
                          >
                            <div>
                              <strong>
                                $
                                {product.price.toFixed(
                                  2
                                )}
                              </strong>

                              <span>
                                {
                                  product.stock_qty
                                }{" "}
                                available
                              </span>
                            </div>

                            <Link
                              href={`/shop/${product.id}`}
                              className={
                                styles.viewButton
                              }
                            >
                              View gift
                              <ArrowRight
                                size={
                                  14
                                }
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}