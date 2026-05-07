"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Check if user is admin
        const session = await getSession();
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          setError("Access denied. Admin privileges required.");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#16A34A] rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] disabled:opacity-50 disabled:cursor-not-disabled transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-[#16A34A] hover:text-[#15803D] transition-colors"
            >
              ← Back to Website
            </Link>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Demo Credentials:
          </h3>
          <p className="text-xs text-blue-600">
            Email: admin@healthstore.com
            <br />
            Password: admin123
          </p>
          <p className="text-xs text-blue-500 mt-2">
            Note: You'll need to create this user first using the registration
            API
          </p>
        </div>
      </div>
    </div>
  );
}
