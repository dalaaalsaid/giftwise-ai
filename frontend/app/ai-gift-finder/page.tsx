"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Gift,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import styles from "./AIGiftFinder.module.css";


const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";


type Recommendation = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_qty: number;
  image_url: string | null;
  match_score: number;
  reason: string;
};


type RecommendationResponse = {
  recommendation_id: string;

  recipient: string;

  description: string;

  budget: number;

  match_found: boolean;

  message: string;

  recommendations:
    Recommendation[];

  alternatives:
    Recommendation[];
};


const RECIPIENT_OPTIONS = [
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Wife",
  "Husband",
  "Girlfriend",
  "Boyfriend",
  "Daughter",
  "Son",
  "Best Friend",
  "Friend",
  "Colleague",
  "Teacher",
  "Other",
];


type ProductCardProps = {
  product: Recommendation;

  index: number;

  alternative?: boolean;
};


function ProductCard({
  product,
  index,
  alternative = false,
}: ProductCardProps) {
  return (
    <article
      className={
        styles.productCard
      }
    >
      <Link
        href={`/shop/${product.id}`}
        className={
          styles.imageArea
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
          <div
            className={
              styles.imagePlaceholder
            }
          >
            <Gift
              size={42}
              strokeWidth={1.3}
            />
          </div>
        )}

        <span
          className={
            styles.matchBadge
          }
        >
          <Sparkles
            size={12}
          />

          {product.match_score}%
          {alternative
            ? " suitability"
            : " match"}
        </span>

        {index === 0 && (
          <span
            className={
              styles.topBadge
            }
          >
            {alternative
              ? "Alternative option"
              : "Top recommendation"}
          </span>
        )}
      </Link>

      <div
        className={
          styles.productContent
        }
      >
        <Link
          href={`/shop/${product.id}`}
        >
          <h3>
            {product.name}
          </h3>
        </Link>

        <p
          className={
            styles.description
          }
        >
          {product.description}
        </p>

        <div
          className={
            styles.reason
          }
        >
          <Sparkles
            size={14}
          />

          <div>
            <strong>
              {alternative
                ? "Why this may still work"
                : "Why GiftWise chose this"}
            </strong>

            <span>
              {product.reason}
            </span>
          </div>
        </div>

        <div
          className={
            styles.productFooter
          }
        >
          <strong>
            $
            {product.price.toFixed(
              2
            )}
          </strong>

          <Link
            href={`/shop/${product.id}`}
          >
            View gift

            <ArrowRight
              size={14}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}


export default function AIGiftFinderPage() {
  const [
    recipient,
    setRecipient,
  ] = useState("");

  const [
    otherRecipient,
    setOtherRecipient,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    budget,
    setBudget,
  ] = useState(50);

  const [
    recommendations,
    setRecommendations,
  ] = useState<
    Recommendation[]
  >([]);

  const [
    alternatives,
    setAlternatives,
  ] = useState<
    Recommendation[]
  >([]);

  const [
    matchFound,
    setMatchFound,
  ] = useState<
    boolean | null
  >(null);

  const [
    resultMessage,
    setResultMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);


  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    setResultMessage("");

    const finalRecipient =
      recipient === "Other"
        ? otherRecipient.trim()
        : recipient;

    if (!finalRecipient) {
      setError(
        "Please choose who the gift is for."
      );

      return;
    }

    if (
      description
        .trim()
        .length < 10
    ) {
      setError(
        "Please tell GiftWise a little more about the recipient."
      );

      return;
    }

    try {
      setLoading(
        true
      );

      setHasSearched(
        true
      );

      setRecommendations(
        []
      );

      setAlternatives(
        []
      );

      setMatchFound(
        null
      );

      const response =
        await fetch(
          `${API_URL}/api/recommendations`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  recipient:
                    finalRecipient,

                  description:
                    description
                      .trim(),

                  budget,
                }
              ),
          }
        );

      const data:
        | RecommendationResponse
        | {
            detail?: string;
          } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "detail" in data &&
          data.detail
            ? data.detail
            : "Unable to generate recommendations."
        );
      }

      const recommendationData =
        data as
          RecommendationResponse;

      setRecommendations(
        recommendationData
          .recommendations
      );

      setAlternatives(
        recommendationData
          .alternatives
      );

      setMatchFound(
        recommendationData
          .match_found
      );

      setResultMessage(
        recommendationData
          .message
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  const displayedCount =
    matchFound === false
      ? alternatives.length
      : recommendations.length;


  return (
    <main
      className={
        styles.page
      }
    >
      <section
        className={
          styles.heroSection
        }
      >
        <div
          className={
            styles.heroIcon
          }
        >
          <Sparkles
            size={22}
          />
        </div>

        <span
          className={
            styles.eyebrow
          }
        >
          Personalized gifting
        </span>

        <h1>
          Find the perfect gift
        </h1>

        <p>
          Tell GiftWise a little
          about the person you are
          shopping for and we will
          recommend gifts already
          available in the shop.
        </p>
      </section>


      <div
        className={
          styles.mainGrid
        }
      >
        <section
          className={
            styles.formCard
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <div
              className={
                styles.smallIcon
              }
            >
              <WandSparkles
                size={18}
              />
            </div>

            <div>
              <span>
                Gift Finder
              </span>

              <h2>
                Tell us about them
              </h2>
            </div>
          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className={
              styles.form
            }
          >
            <label>
              Who is the gift for?

              <select
                value={
                  recipient
                }
                onChange={(
                  event
                ) => {
                  setRecipient(
                    event.target
                      .value
                  );

                  if (
                    event.target
                      .value !==
                    "Other"
                  ) {
                    setOtherRecipient(
                      ""
                    );
                  }
                }}
              >
                <option
                  value=""
                >
                  Select recipient
                </option>

                {RECIPIENT_OPTIONS.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option
                      }
                      value={
                        option
                      }
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </label>


            {recipient ===
              "Other" && (
              <label>
                Recipient

                <input
                  type="text"
                  placeholder="For example: Cousin"
                  value={
                    otherRecipient
                  }
                  onChange={(
                    event
                  ) =>
                    setOtherRecipient(
                      event.target
                        .value
                    )
                  }
                />
              </label>
            )}


            <label>
              Tell GiftWise about them

              <textarea
                placeholder="For example: He loves cars, technology, and sports. It is for his birthday."
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
              />
            </label>


            <div
              className={
                styles.budgetField
              }
            >
              <div
                className={
                  styles.budgetTop
                }
              >
                <label>
                  Your budget
                </label>

                <strong>
                  ${budget}
                </strong>
              </div>

              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={
                  budget
                }
                onChange={(
                  event
                ) =>
                  setBudget(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              />

              <div
                className={
                  styles.rangeLabels
                }
              >
                <span>
                  $20
                </span>

                <span>
                  $150
                </span>
              </div>
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


            <button
              type="submit"
              className={
                styles.submitButton
              }
              disabled={
                loading
              }
            >
              <Sparkles
                size={17}
              />

              {loading
                ? "Finding the best gifts..."
                : "Find Gifts"}

              {!loading && (
                <ArrowRight
                  size={16}
                />
              )}
            </button>
          </form>
        </section>


        <section
          className={
            styles.resultsSection
          }
        >
          <div
            className={
              styles.resultsHeading
            }
          >
            <div>
              <span>
                GiftWise Recommendations
              </span>

              <h2>
                {!hasSearched
                  ? "Thoughtful recommendations"
                  : matchFound ===
                      false
                    ? "No exact match found"
                    : recommendations
                          .length > 0
                      ? "Your best matches"
                      : "Thoughtful recommendations"}
              </h2>
            </div>


            {displayedCount >
              0 && (
              <span
                className={
                  styles.resultCount
                }
              >
                {displayedCount}{" "}
                {matchFound ===
                false
                  ? "alternatives"
                  : "matches"}
              </span>
            )}
          </div>


          {loading && (
            <div
              className={
                styles.loadingState
              }
            >
              <Sparkles
                size={27}
              />

              <h3>
                GiftWise is matching
                your request...
              </h3>

              <p>
                We are checking
                available gifts
                against the
                recipient, interests,
                and your budget.
              </p>
            </div>
          )}


          {!loading &&
            !hasSearched && (
              <div
                className={
                  styles.emptyState
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  <Gift
                    size={34}
                  />
                </div>

                <h3>
                  Your
                  recommendations
                  will appear here
                </h3>

                <p>
                  Complete the form
                  and GiftWise will
                  suggest products
                  from the current
                  shop catalog.
                </p>
              </div>
            )}


          {!loading &&
            hasSearched &&
            matchFound ===
              false && (
              <>
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <div
                    className={
                      styles.emptyIcon
                    }
                  >
                    <Gift
                      size={34}
                    />
                  </div>

                  <h3>
                    No exact match
                    found
                  </h3>

                  <p>
                    {resultMessage ||
                      "We could not find a product that directly matches those interests in the current catalog."}
                  </p>
                </div>


                {alternatives.length >
                  0 && (
                  <>
                    <div
                      className={
                        styles.resultsHeading
                      }
                    >
                      <div>
                        <span>
                          Other ideas
                        </span>

                        <h2>
                          You may still
                          like these
                        </h2>
                      </div>
                    </div>

                    <div
                      className={
                        styles.productGrid
                      }
                    >
                      {alternatives.map(
                        (
                          product,
                          index
                        ) => (
                          <ProductCard
                            key={
                              product.id
                            }
                            product={
                              product
                            }
                            index={
                              index
                            }
                            alternative
                          />
                        )
                      )}
                    </div>
                  </>
                )}
              </>
            )}


          {!loading &&
            hasSearched &&
            matchFound ===
              true &&
            recommendations
              .length >
              0 && (
              <>
                {resultMessage && (
                  <p>
                    {resultMessage}
                  </p>
                )}

                <div
                  className={
                    styles.productGrid
                  }
                >
                  {recommendations.map(
                    (
                      product,
                      index
                    ) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}


          {!loading &&
            hasSearched &&
            matchFound ===
              true &&
            recommendations
              .length ===
              0 &&
            !error && (
              <div
                className={
                  styles.emptyState
                }
              >
                <Gift
                  size={34}
                />

                <h3>
                  No matching gifts
                  found
                </h3>

                <p>
                  Try increasing the
                  budget or changing
                  the description.
                </p>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}