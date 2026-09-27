"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Gift,
  LogOut,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  AuthUser,
  clearAuth,
  getStoredUser,
} from "../../lib/auth";

import styles from "./HomeHeader.module.css";

type StoredCartItem = {
  quantity?: number;
};

function getCartCount(): number {
  try {
    const stored =
      localStorage.getItem(
        "giftwise-cart"
      );

    if (!stored) {
      return 0;
    }

    const cart: StoredCartItem[] =
      JSON.parse(stored);

    if (!Array.isArray(cart)) {
      return 0;
    }

    return cart.reduce(
      (total, item) =>
        total +
        Math.max(
          Number(item.quantity) || 1,
          1
        ),
      0
    );
  } catch {
    return 0;
  }
}

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "AI Gift Finder",
    href: "/ai-gift-finder",
  },
  {
    label: "Build a Box",
    href: "/build-box",
  },
  {
    label: "Last Minute",
    href: "/last-minute",
  },
];

export default function HomeHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const searchInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [
    cartCount,
    setCartCount,
  ] = useState(0);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  useEffect(() => {
    function refreshState() {
      setUser(getStoredUser());
      setCartCount(
        getCartCount()
      );
    }

    refreshState();

    window.addEventListener(
      "giftwise-cart-updated",
      refreshState
    );

    window.addEventListener(
      "storage",
      refreshState
    );

    return () => {
      window.removeEventListener(
        "giftwise-cart-updated",
        refreshState
      );

      window.removeEventListener(
        "storage",
        refreshState
      );
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [searchOpen]);

  function handleLogout() {
    clearAuth();

    setUser(null);

    router.push("/");
    router.refresh();
  }

  function handleCartClick() {
    router.push("/cart");
  }

  function toggleSearch() {
    setSearchOpen(
      (current) => !current
    );
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query =
      searchQuery.trim();

    if (!query) {
      router.push("/shop");
      setSearchOpen(false);
      return;
    }

    router.push(
      `/shop?search=${encodeURIComponent(
        query
      )}`
    );

    setSearchOpen(false);
  }

  return (
    <header
      className={styles.header}
    >
      <div
        className={styles.navbar}
      >
        <Link
          href="/"
          className={styles.brand}
        >
          <div
            className={
              styles.brandIcon
            }
          >
            <Gift size={20} />

            <span
              className={
                styles.brandSparkle
              }
            >
              <Sparkles
                size={11}
              />
            </span>
          </div>

          <div
            className={
              styles.brandText
            }
          >
            <strong>
              GiftWise
            </strong>

            <span>AI</span>
          </div>
        </Link>

        <nav
          className={
            styles.navigation
          }
        >
          {navigation.map(
            (item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      item.href
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? `${styles.navLink} ${styles.activeLink}`
                      : styles.navLink
                  }
                >
                  {item.label}
                </Link>
              );
            }
          )}
        </nav>

        <div
          className={styles.actions}
        >
          <button
            type="button"
            className={
              searchOpen
                ? `${styles.iconButton} ${styles.activeIconButton}`
                : styles.iconButton
            }
            aria-label={
              searchOpen
                ? "Close search"
                : "Search gifts"
            }
            onClick={
              toggleSearch
            }
          >
            {searchOpen ? (
              <X size={18} />
            ) : (
              <Search
                size={18}
              />
            )}
          </button>

          <button
            type="button"
            className={
              styles.cartButton
            }
            aria-label="Open cart"
            onClick={
              handleCartClick
            }
          >
            <ShoppingBag
              size={18}
            />

            {cartCount > 0 && (
              <span
                className={
                  styles.cartBadge
                }
              >
                {cartCount > 9
                  ? "9+"
                  : cartCount}
              </span>
            )}
          </button>

          {!user ? (
            <Link
              href="/login"
              className={
                styles.signInButton
              }
            >
              Sign in
            </Link>
          ) : (
            <>
              {user.role ===
              "admin" ? (
                <Link
                  href="/admin"
                  className={
                    styles.accountButton
                  }
                >
                  <UserRound
                    size={15}
                  />
                  Admin
                </Link>
              ) : (
                <Link
                  href="/my-orders"
                  className={
                    styles.accountButton
                  }
                >
                  <UserRound
                    size={15}
                  />
                  My Orders
                </Link>
              )}

              <button
                type="button"
                className={
                  styles.logoutButton
                }
                onClick={
                  handleLogout
                }
                aria-label="Logout"
                title="Logout"
              >
                <LogOut
                  size={17}
                />
              </button>
            </>
          )}
        </div>

        {searchOpen && (
          <form
            className={
              styles.searchPanel
            }
            onSubmit={
              handleSearch
            }
          >
            <Search
              size={17}
            />

            <input
              ref={
                searchInputRef
              }
              type="text"
              value={
                searchQuery
              }
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search gifts..."
              aria-label="Search gifts"
            />

            <button
              type="submit"
            >
              Search
            </button>
          </form>
        )}
      </div>
    </header>
  );
}