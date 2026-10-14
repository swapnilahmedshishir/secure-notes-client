import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../lib/auth";
import { formatApiError } from "../lib/api";
import { useToast } from "../lib/toast";
import { buttonPrimary, Card, FieldError, inputClass, PageHeader } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      await login(email.trim(), password);
      notify("Logged in successfully");
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Login" subtitle="Sign in with your email and password." />
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <FieldError message={error} />
          <button type="submit" className={buttonPrimary} disabled={pending}>
            <LogIn size={16} /> {pending ? "Signing in…" : "Login"}
          </button>
          <p className="text-sm text-slate-500">
            No account?{" "}
            <Link to="/register" className="font-medium text-slate-900 underline">
              Register
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
