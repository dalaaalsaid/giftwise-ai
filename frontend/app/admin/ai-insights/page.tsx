"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bot,
  BrainCircuit,
  Gift,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "../../../lib/auth";

import styles from "./AIInsights.module.css";


type TopProduct = {
  product_id: string;
  product_name: string;
  recommendation_count: number;
};


type RecentRequest = {
  id: string;
  recipient: string;
  description: string;
  budget: number;
  recommendation_count: number;
  top_match_score: number;
  created_at: string;
};


type Insights = {
  total_requests: number;
  average_budget: number;
  average_match_score: number;

  most_common_recipient:
    | string
    | null;

  most_recommended_product:
    | string
    | null;

  top_products:
    TopProduct[];

  recent_requests:
    RecentRequest[];
};


export default function AIInsightsPage() {
  const [insights, setInsights] =
    useState<Insights | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadInsights() {
      const token =
        getAccessToken();

      if (!token) {
        setError(
          "Admin authentication is required."
        );

        setLoading(false);

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/recommendations/admin/insights`,
            {
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
              "Unable to load AI insights."
          );
        }

        setInsights(
          data
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load AI insights."
        );
      } finally {
        setLoading(
          false
        );
      }
    }

    loadInsights();
  }, []);


  if (loading) {
    return (
      <div
        className={
          styles.loading
        }
      >
        <BrainCircuit
          size={25}
        />

        <span>
          Analyzing GiftWise AI
          activity...
        </span>
      </div>
    );
  }


  if (
    error ||
    !insights
  ) {
    return (
      <div
        className={
          styles.page
        }
      >
        <div
          className={
            styles.error
          }
        >
          {error ||
            "AI insights are unavailable."}
        </div>
      </div>
    );
  }


  const maxProductCount =
    Math.max(
      1,
      ...insights
        .top_products
        .map(
          (product) =>
            product
              .recommendation_count
        )
    );


  return (
    <div
      className={
        styles.page
      }
    >
      <section
        className={
          styles.heading
        }
      >
        <div>
          <span>
            Gift Intelligence
          </span>

          <h1>
            AI Insights
          </h1>

          <p>
            Understand how customers
            are using GiftWise
            recommendations and which
            products the matching
            engine suggests most
            often.
          </p>
        </div>

        <div
          className={
            styles.liveBadge
          }
        >
          <BrainCircuit
            size={18}
          />

          Recommendation Analytics
        </div>
      </section>


      <section
        className={
          styles.metrics
        }
      >
        <article>
          <div
            className={
              styles.metricIcon
            }
          >
            <Sparkles
              size={20}
            />
          </div>

          <span>
            AI Requests
          </span>

          <strong>
            {
              insights.total_requests
            }
          </strong>

          <p>
            Recommendation sessions
          </p>
        </article>


        <article>
          <div
            className={
              styles.metricIcon
            }
          >
            <Target
              size={20}
            />
          </div>

          <span>
            Average Match
          </span>

          <strong>
            {
              insights
                .average_match_score
            }
            %
          </strong>

          <p>
            Across recommended gifts
          </p>
        </article>


        <article>
          <div
            className={
              styles.metricIcon
            }
          >
            <WalletCards
              size={20}
            />
          </div>

          <span>
            Average Budget
          </span>

          <strong>
            $
            {insights
              .average_budget
              .toFixed(2)}
          </strong>

          <p>
            Customer gift budget
          </p>
        </article>


        <article>
          <div
            className={
              styles.metricIcon
            }
          >
            <UserRound
              size={20}
            />
          </div>

          <span>
            Common Recipient
          </span>

          <strong
            className={
              styles.textValue
            }
          >
            {insights
              .most_common_recipient ??
              "No data"}
          </strong>

          <p>
            Most selected relationship
          </p>
        </article>
      </section>


      <section
        className={
          styles.insightGrid
        }
      >
        <article
          className={
            styles.productAnalytics
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <div>
              <span>
                Recommendation Trends
              </span>

              <h2>
                Most Recommended
                Products
              </h2>

              <p>
                Products appearing
                most frequently in AI
                recommendation
                results.
              </p>
            </div>

            <Gift
              size={23}
            />
          </div>


          {insights
            .top_products
            .length === 0 ? (
            <div
              className={
                styles.empty
              }
            >
              No recommendation
              activity yet.
            </div>
          ) : (
            <div
              className={
                styles.productBars
              }
            >
              {insights
                .top_products
                .map(
                  (
                    product,
                    index
                  ) => (
                    <div
                      key={
                        product.product_id
                      }
                      className={
                        styles.productRow
                      }
                    >
                      <div
                        className={
                          styles.productInfo
                        }
                      >
                        <div
                          className={
                            styles.rank
                          }
                        >
                          {index + 1}
                        </div>

                        <div>
                          <strong>
                            {
                              product.product_name
                            }
                          </strong>

                          <span>
                            {
                              product.recommendation_count
                            }{" "}
                            recommendations
                          </span>
                        </div>
                      </div>

                      <div
                        className={
                          styles.barTrack
                        }
                      >
                        <div
                          className={
                            styles.barFill
                          }
                          style={{
                            width: `${(product.recommendation_count / maxProductCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </article>


        <article
          className={
            styles.highlight
          }
        >
          <Bot size={30} />

          <span>
            AI Favorite
          </span>

          <h2>
            {insights
              .most_recommended_product ??
              "No recommendation data yet"}
          </h2>

          <p>
            This product has appeared
            most frequently across
            customer recommendation
            sessions.
          </p>

          <div
            className={
              styles.highlightFooter
            }
          >
            <Sparkles
              size={16}
            />

            <span>
              Based on stored GiftWise
              recommendation history
            </span>
          </div>
        </article>
      </section>


      <section
        className={
          styles.recentSection
        }
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <span>
              Recent Activity
            </span>

            <h2>
              Latest AI Requests
            </h2>

            <p>
              Review recent customer
              recommendation
              interactions.
            </p>
          </div>
        </div>


        <div
          className={
            styles.tableWrapper
          }
        >
          <table>
            <thead>
              <tr>
                <th>
                  Recipient
                </th>

                <th>
                  Description
                </th>

                <th>
                  Budget
                </th>

                <th>
                  Results
                </th>

                <th>
                  Top Match
                </th>

                <th>
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {insights
                .recent_requests
                .map(
                  (request) => (
                    <tr
                      key={
                        request.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            request.recipient
                          }
                        </strong>
                      </td>

                      <td>
                        <p
                          className={
                            styles.description
                          }
                        >
                          {
                            request.description
                          }
                        </p>
                      </td>

                      <td>
                        $
                        {request
                          .budget
                          .toFixed(
                            2
                          )}
                      </td>

                      <td>
                        {
                          request
                            .recommendation_count
                        }
                      </td>

                      <td>
                        <span
                          className={
                            styles.matchBadge
                          }
                        >
                          {
                            request.top_match_score
                          }
                          %
                        </span>
                      </td>

                      <td>
                        {new Date(
                          request.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>

          {insights
            .recent_requests
            .length === 0 && (
            <div
              className={
                styles.empty
              }
            >
              AI requests will appear
              here after customers use
              the Gift Finder.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}