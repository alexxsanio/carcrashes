"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/api";

const API_URL =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:5001";

export default function LoginPage() {
const router = useRouter();

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleSubmit(
event: FormEvent
) {
event.preventDefault();


setError("");
setLoading(true);

try {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Login failed."
    );
  }

  setToken(data.access_token);

  router.push("/");
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Login failed."
  );
} finally {
  setLoading(false);
}


}

return ( 
  <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4"> <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"> <h1 className="text-2xl font-bold text-slate-900">
    Colorado Crash Map </h1>
    <p className="mt-1 text-sm text-slate-500">
      Sign in to submit and view crash observations.
    </p>

    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Username
        </label>

        <input
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          required
          autoComplete="username"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-slate-500">
      Don't have an account?{" "}
      <a
        href="/register"
        className="font-semibold text-slate-900 hover:underline"
      >
        Create one
      </a>
    </p>
  </div>
</main>

);
}