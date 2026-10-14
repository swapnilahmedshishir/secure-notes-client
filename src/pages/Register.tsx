import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../lib/auth";
import { formatApiError } from "../lib/api";
import { useToast } from "../lib/toast";
import { buttonPrimary, Card, FieldError, inputClass, PageHeader } from "../components/ui";

// Registration never sends a role: the backend always creates role "user".
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError("");
    if (username.trim().length < 3 || username.trim().length > 30) {
      setError("Username must be 3–30 characters.");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must be at least 8 characters and contain a letter and a number.");
      return;
    }
    setPending(true);
    try {
      const list = interests.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      await register({ username: username.trim(), email: email.trim(), password, interests: list });
      notify("Account created — welcome!");
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Register" subtitle="Usernames 3–30 chars; password needs 8+ chars with a letter and a number." />
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input id="username" required minLength={3} maxLength={30} autoComplete="username"
              className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input id="email" type="email" required autoComplete="email"
              className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password"
              className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label htmlFor="interests" className="mb-1 block text-sm font-medium text-slate-700">
              Interests <span className="font-normal text-slate-400">(optional, comma separated)</span>
            </label>
            <input id="interests" placeholder="chess, reading" className={inputClass}
              value={interests} onChange={(e) => setInterests(e.target.value)} />
          </div>
          <FieldError message={error} />
          <button type="submit" className={buttonPrimary} disabled={pending}>
            <UserPlus size={16} /> {pending ? "Creating account…" : "Register"}
          </button>
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-slate-900 underline">
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
