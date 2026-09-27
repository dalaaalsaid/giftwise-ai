"use client";

import Link from "next/link";

import {
  BarChart3,
  Boxes,
  FolderTree,
  Gift,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  clearAuth,
} from "../../lib/auth";

import styles from "./AdminSidebar.module.css";


const overviewNavigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
];


const managementNavigation = [
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },

  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
  },

  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
];


const analyticsNavigation = [
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },

  {
    label: "AI Insights",
    href: "/admin/ai-insights",
    icon: Sparkles,
  },
];


export default function AdminSidebar() {
  const pathname =
    usePathname();

  const router =
    useRouter();


  function isActive(
    href: string
  ) {
    if (href === "/admin") {
      return (
        pathname === "/admin"
      );
    }

    return pathname.startsWith(
      href
    );
  }


  function handleLogout() {
    clearAuth();

    router.push(
      "/login"
    );
  }


  function renderNavigation(
    items:
      typeof overviewNavigation
  ) {
    return items.map(
      (item) => {
        const Icon =
          item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive(
                item.href
              )
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            <Icon
              size={18}
            />

            <span>
              {item.label}
            </span>
          </Link>
        );
      }
    );
  }


  return (
    <aside
      className={
        styles.sidebar
      }
    >
      <div
        className={
          styles.brand
        }
      >
        <div
          className={
            styles.brandIcon
          }
        >
          <Gift size={21} />
        </div>

        <div>
          <strong>
            GiftWise
          </strong>

          <span>
            Admin Console
          </span>
        </div>
      </div>


      <div
        className={
          styles.section
        }
      >
        <span
          className={
            styles.sectionLabel
          }
        >
          Overview
        </span>

        <nav
          className={
            styles.navigation
          }
        >
          {renderNavigation(
            overviewNavigation
          )}
        </nav>
      </div>


      <div
        className={
          styles.section
        }
      >
        <span
          className={
            styles.sectionLabel
          }
        >
          Management
        </span>

        <nav
          className={
            styles.navigation
          }
        >
          {renderNavigation(
            managementNavigation
          )}
        </nav>
      </div>


      <div
        className={
          styles.section
        }
      >
        <span
          className={
            styles.sectionLabel
          }
        >
          Analytics
        </span>

        <nav
          className={
            styles.navigation
          }
        >
          {renderNavigation(
            analyticsNavigation
          )}
        </nav>
      </div>


      <div
        className={
          styles.bottom
        }
      >
        <Link
          href="/"
          className={
            styles.storeLink
          }
        >
          <Store size={18} />

          <span>
            Back to Store
          </span>
        </Link>

        <button
          type="button"
          className={
            styles.logoutButton
          }
          onClick={
            handleLogout
          }
        >
          <LogOut size={18} />

          <span>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}