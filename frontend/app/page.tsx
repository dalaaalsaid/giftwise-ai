import Link from "next/link";

import {
  ArrowRight,
  Bot,
  Gift,
  Heart,
  PackageOpen,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import heroStyles from "./HomeHero.module.css";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/products`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

const categoryIcons: Record<string, string> = {
  birthday: "🎂",
  graduation: "🎓",
  "for-her": "🌷",
  "for-him": "🎁",
  flowers: "💐",
  "self-care": "🕯️",
  chocolate: "🍫",
};

export default async function Home() {
  const [products, categories] =
    await Promise.all([
      getProducts(),
      getCategories(),
    ]);

  const featuredProducts =
    products
      .filter(
        (product) =>
          product.is_active
      )
      .slice(0, 4);

  return (
    <main>
      <section
        className={
          heroStyles.hero
        }
      >
        <div
          className={
            heroStyles.glowOne
          }
        />

        <div
          className={
            heroStyles.glowTwo
          }
        />

        <div
          className={
            heroStyles.heroGrid
          }
        >
          <div
            className={
              heroStyles.content
            }
          >
            

            <h1
              className={
                heroStyles.title
              }
            >
              Gifts chosen with heart.

              <span>
                Powered by intelligence.
              </span>
            </h1>

            <p
              className={
                heroStyles.description
              }
            >
              Tell GiftWise who
              you&apos;re shopping for,
              the occasion, their
              interests, and your
              budget. Our smart
              recommendation experience
              helps turn uncertainty
              into a gift that actually
              feels personal.
            </p>

            <div
              className={
                heroStyles.buttons
              }
            >
              <Link
                href="/ai-gift-finder"
                className={
                  heroStyles.primaryButton
                }
              >
                <Sparkles
                  size={17}
                />

                Find their gift

                <ArrowRight
                  size={16}
                />
              </Link>

              <Link
                href="/shop"
                className={
                  heroStyles.secondaryButton
                }
              >
                Explore the shop
              </Link>
            </div>

            <div
              className={
                heroStyles.metrics
              }
            >
              <div
                className={
                  heroStyles.metric
                }
              >
                <strong>
                  Personal
                </strong>

                <span>
                  AI recommendations
                </span>
              </div>

              <div
                className={
                  heroStyles.metric
                }
              >
                <strong>
                  Buildable
                </strong>

                <span>
                  custom gift boxes
                </span>
              </div>

              <div
                className={
                  heroStyles.metric
                }
              >
                <strong>
                  Ready
                </strong>

                <span>
                  last-minute gifts
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              heroStyles.visual
            }
          >
            <div
              className={
                heroStyles.orbit
              }
            />

            <span
              className={
                heroStyles.sparkleOne
              }
            >
              <Sparkles
                size={24}
              />
            </span>

            <span
              className={
                heroStyles.sparkleTwo
              }
            >
              ✦
            </span>

            <span
              className={
                heroStyles.heartOne
              }
            >
              ♥
            </span>

            <span
              className={
                heroStyles.heartTwo
              }
            >
              ♥
            </span>

            <div
              className={`${heroStyles.floatingChip} ${heroStyles.chipOne}`}
            >
              Graduation
            </div>

            <div
              className={`${heroStyles.floatingChip} ${heroStyles.chipTwo}`}
            >
              Chocolate
            </div>

            <div
              className={`${heroStyles.floatingChip} ${heroStyles.chipThree}`}
            >
              For Her
            </div>

            <div
              className={
                heroStyles.giftCard
              }
            >
              <div
                className={
                  heroStyles.cardTop
                }
              >
                <span
                  className={
                    heroStyles.aiPick
                  }
                >
                  <Sparkles
                    size={12}
                  />

                  GiftWise Pick
                </span>

                <span
                  className={
                    heroStyles.match
                  }
                >
                  96% match
                </span>
              </div>

              <div
                className={
                  heroStyles.giftScene
                }
              >
                <div
                  className={
                    heroStyles.giftBox
                  }
                >
                  <div
                    className={
                      heroStyles.lid
                    }
                  />

                  <div
                    className={
                      heroStyles.verticalRibbon
                    }
                  />

                  <div
                    className={
                      heroStyles.horizontalRibbon
                    }
                  />

                  <div
                    className={
                      heroStyles.bowLeft
                    }
                  />

                  <div
                    className={
                      heroStyles.bowRight
                    }
                  />
                </div>
              </div>

              <div
                className={
                  heroStyles.cardCopy
                }
              >
                <span>
                  Perfect for her
                </span>

                <strong>
                  Blush Bloom Gift Box
                </strong>
              </div>
            </div>

            <div
              className={
                heroStyles.aiCard
              }
            >
              <div
                className={
                  heroStyles.aiIcon
                }
              >
                <Bot size={19} />
              </div>

              <div>
                <span>
                  AI Recommendation
                </span>

                <strong>
                  Thoughtful match found
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section category-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Shop your way
              </span>

              <h2>
                Find something for every moment
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-link"
            >
              View all gifts

              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map(
              (category) => (
                <Link
                  href={`/shop?category=${category.id}`}
                  className="category-card"
                  key={category.id}
                >
                  <div className="category-icon">
                    {categoryIcons[
                      category.slug
                    ] ?? "🎁"}
                  </div>

                  <span>
                    {
                      category.name
                    }
                  </span>

                  <div className="category-arrow">
                    <ArrowRight
                      size={15}
                    />
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Curated favorites
              </span>

              <h2>
                Gifts people are loving
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-link"
            >
              Shop all

              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          {featuredProducts.length >
          0 ? (
            <div className="product-grid">
              {featuredProducts.map(
                (
                  product,
                  index
                ) => (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <Link
                      href={`/shop/${product.id}`}
                      className={`product-image product-image-${index + 1}`}
                      style={{
                        position:
                          "relative",
                        overflow:
                          "hidden",
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            display:
                              "block",
                            objectFit:
                              "cover",
                            objectPosition:
                              "center",
                          }}
                        />
                      ) : (
                        <div className="product-placeholder">
                          <Gift
                            size={46}
                            strokeWidth={
                              1.3
                            }
                          />
                        </div>
                      )}

                      {index ===
                        0 && (
                        <span className="product-badge">
                          Best seller
                        </span>
                      )}

                      <span className="favorite-button">
                        <Heart
                          size={18}
                        />
                      </span>
                    </Link>

                    <div className="product-content">
                      <span className="product-category">
                        Thoughtful gift
                      </span>

                      <Link
                        href={`/shop/${product.id}`}
                      >
                        <h3>
                          {
                            product.name
                          }
                        </h3>
                      </Link>

                      <p>
                        {
                          product.description
                        }
                      </p>

                      <div className="product-footer">
                        <strong>
                          $
                          {product.price.toFixed(
                            2
                          )}
                        </strong>

                        <Link
                          href={`/shop/${product.id}`}
                          className="small-cart-button"
                        >
                          <ShoppingBag
                            size={16}
                          />

                          View
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="empty-products">
              <Gift size={36} />

              <h3>
                Your featured gifts
                will appear here.
              </h3>

              <p>
                Make sure the GiftWise
                backend is running on
                port 8000.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section ai-section">
        <div className="container ai-banner">
          <div className="ai-banner-content">
            <div className="ai-large-icon">
              <Sparkles
                size={28}
              />
            </div>

            <span className="section-kicker">
              GiftWise AI
            </span>

            <h2>
              Not sure what to buy?
              <br />
              Let AI narrow it down.
            </h2>

            <p>
              Answer a few simple
              questions about the
              recipient, occasion,
              interests, and budget.
              GiftWise recommends
              suitable products already
              available in our shop.
            </p>

            <Link
              href="/ai-gift-finder"
              className="light-button"
            >
              Try AI Gift Finder

              <ArrowRight
                size={17}
              />
            </Link>
          </div>

          <div className="ai-demo-card">
            <div className="demo-row">
              <span>
                Recipient
              </span>

              <strong>
                Best friend
              </strong>
            </div>

            <div className="demo-row">
              <span>
                Occasion
              </span>

              <strong>
                Graduation
              </strong>
            </div>

            <div className="demo-row">
              <span>
                Interests
              </span>

              <strong>
                Chocolate · Self-care
              </strong>
            </div>

            <div className="demo-row">
              <span>
                Budget
              </span>

              <strong>
                $30 – $50
              </strong>
            </div>

            <div className="demo-result">
              <Sparkles
                size={17}
              />

              <div>
                <span>
                  Top recommendation
                </span>

                <strong>
                  Graduation Celebration
                  Box
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section experiences-section">
        <div className="container">
          <div className="experience-grid">
            <Link
              href="/build-box"
              className="experience-card custom-box"
            >
              <div className="experience-icon">
                <PackageOpen
                  size={28}
                />
              </div>

              <div>
                <span>
                  Make it yours
                </span>

                <h3>
                  Build Your Own Gift
                  Box
                </h3>

                <p>
                  Choose the box,
                  gifts, add-ons,
                  flowers, and your
                  personal card
                  message.
                </p>

                <strong>
                  Start building

                  <ArrowRight
                    size={16}
                  />
                </strong>
              </div>
            </Link>

            <Link
              href="/last-minute"
              className="experience-card last-minute"
            >
              <div className="experience-icon">
                <Gift
                  size={28}
                />
              </div>

              <div>
                <span>
                  Short on time?
                </span>

                <h3>
                  Last-Minute Gifts
                </h3>

                <p>
                  Pick a beautiful
                  ready-made box, add
                  your message, and
                  head straight to
                  checkout.
                </p>

                <strong>
                  Shop quick gifts

                  <ArrowRight
                    size={16}
                  />
                </strong>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section promise-section">
        <div className="container promise-grid">
          <div>
            <div className="promise-icon">
              <Sparkles
                size={21}
              />
            </div>

            <h3>
              Personalized
            </h3>

            <p>
              Recommendations built
              around the person you
              care about.
            </p>
          </div>

          <div>
            <div className="promise-icon">
              <PackageOpen
                size={21}
              />
            </div>

            <h3>
              Customizable
            </h3>

            <p>
              Create a gift experience
              instead of buying just
              one item.
            </p>
          </div>

          <div>
            <div className="promise-icon">
              <Heart
                size={21}
              />
            </div>

            <h3>
              Thoughtful
            </h3>

            <p>
              Add personal details
              that make every gift
              feel intentional.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link
              href="/"
              className="brand footer-brand"
            >
              <div className="brand-icon">
                <Gift
                  size={20}
                />
              </div>

              <span>
                GiftWise{" "}
                <strong>
                  AI
                </strong>
              </span>
            </Link>

            <p>
              Thoughtful gifting made
              simpler with smart
              recommendations and
              personalized experiences.
            </p>
          </div>

          <div className="footer-column">
            <strong>
              Explore
            </strong>

            <Link href="/shop">
              Shop
            </Link>

            <Link href="/ai-gift-finder">
              AI Gift Finder
            </Link>

            <Link href="/build-box">
              Build a Box
            </Link>

            <Link href="/last-minute">
              Last Minute
            </Link>
          </div>

          <div className="footer-column">
            <strong>
              Account
            </strong>

            <Link href="/login">
              Sign in
            </Link>

            <Link href="/register">
              Create account
            </Link>

            <Link href="/my-orders">
              My orders
            </Link>

            <Link href="/cart">
              Cart
            </Link>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>
            © 2026 GiftWise AI.
            Capstone Project.
          </span>

          <span>
            Made for thoughtful
            gifting.
          </span>
        </div>
      </footer>
    </main>
  );
}