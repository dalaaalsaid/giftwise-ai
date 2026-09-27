"use client";

import {
    FormEvent,
    useState,
} from "react";
import Link from "next/link";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    ArrowRight,
    Eye,
    EyeOff,
    Gift,
    Loader2,
    LogIn,
    Sparkles,
} from "lucide-react";

import {
    API_URL,
    saveAuth,
} from "../../lib/auth";

import styles from "./Auth.module.css";

export default function LoginPage() {
    const router = useRouter();
    const searchParams =
        useSearchParams();

    const registered =
        searchParams.get("registered") ===
        "true";

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
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

        if (!email.trim()) {
            setError(
                "Please enter your email."
            );
            return;
        }

        if (!password) {
            setError(
                "Please enter your password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
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

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Invalid email or password."
                );
            }

            saveAuth(data);

            if (data.user?.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to sign in."
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
                        Welcome back
                    </span>

                    <h1>
                        Thoughtful gifts are only
                        a few clicks away.
                    </h1>

                    <p>
                        Sign in to continue your
                        GiftWise journey and place
                        your personalized orders.
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
                            <LogIn size={22} />
                        </div>

                        <span>
                            GiftWise account
                        </span>

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to continue.
                        </p>
                    </div>

                    {registered && (
                        <div
                            className={
                                styles.success
                            }
                        >
                            Account created
                            successfully. You can
                            sign in now.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className={styles.form}
                    >
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
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
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
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
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
                        New to GiftWise?{" "}
                        <Link href="/register">
                            Create an account
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