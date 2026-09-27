"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Sparkles,
  UserPlus,
} from "lucide-react";

import {
  API_URL,
  saveAuth,
} from "../../lib/auth";

import styles from "./Auth.module.css";

type RegisterResponse = {
  id: string;
  full_name: string;
  email: string;
  role: "customer" | "admin";
};

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (fullName.trim().length < 2) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const registerResponse =
        await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              full_name:
                fullName.trim(),
              email:
                email
                  .trim()
                  .toLowerCase(),
              password,
            }),
          }
        );

      const registerData:
        | RegisterResponse
        | { detail?: string } =
        await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(
          "detail" in registerData &&
            registerData.detail
            ? registerData.detail
            : "Unable to create account."
        );
      }

      const loginResponse =
        await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email:
                email
                  .trim()
                  .toLowerCase(),
              password,
            }),
          }
        );

      const loginData =
        await loginResponse.json();

      if (!loginResponse.ok) {
        router.push(
          "/login?registered=true"
        );
        return;
      }

      saveAuth(loginData);

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.visualPanel}
      >
        <Link
          href="/"
          className={styles.logo}
        >
          <Gift size={26} />
          GiftWise
        </Link>

        <div
          className={
            styles.visualContent
          }
        >
          <span
            className={styles.eyebrow}
          >
            <Sparkles size={15} />
            Thoughtful gifting
          </span>

          <h1>
            Create an account for
            gifts that feel personal.
          </h1>

          <p>
            Save your experience,
            continue to checkout, and
            keep your GiftWise orders
            in one place.
          </p>
        </div>

        <div
          className={
            styles.decorativeGift
          }
        >
          <Gift
            size={95}
            strokeWidth={1}
          />
        </div>
      </section>

      <section
        className={styles.formPanel}
      >
        <div
          className={
            styles.formContainer
          }
        >
          <div
            className={
              styles.formHeading
            }
          >
            <div
              className={
                styles.headingIcon
              }
            >
              <UserPlus size={22} />
            </div>

            <span>
              Join GiftWise
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              It only takes a minute.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >
            <div
              className={styles.field}
            >
              <label htmlFor="fullName">
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="e.g. Sara Ahmad"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                autoComplete="name"
              />
            </div>

            <div
              className={styles.field}
            >
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
              />
            </div>

            <div
              className={styles.field}
            >
              <label htmlFor="password">
                Password
              </label>

              <div
                className={
                  styles.passwordField
                }
              >
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div
              className={styles.field}
            >
              <label
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className={
                      styles.spinner
                    }
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    size={17}
                  />
                </>
              )}
            </button>
          </form>

          <p
            className={
              styles.switchText
            }
          >
            Already have an account?{" "}
            <Link href="/login">
              Sign in
            </Link>
          </p>

          <Link
            href="/"
            className={styles.homeLink}
          >
            Continue browsing as a guest
          </Link>
        </div>
      </section>
    </main>
  );
}