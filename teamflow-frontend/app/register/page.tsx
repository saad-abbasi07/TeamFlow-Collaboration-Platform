"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f081c] text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-gray-400 mt-1">Register first, then login.</p>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full p-3 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] placeholder:text-gray-500"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] placeholder:text-gray-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] placeholder:text-gray-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[#a78bfa] hover:text-[#c4b5fd]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
