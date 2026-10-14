import { useAuth } from "../lib/auth";
import { Card, PageHeader } from "../components/ui";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="My Profile" subtitle="Your verified account details from the server." />
      <Card>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Username</dt><dd className="font-medium text-slate-900">{user.username}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{user.email}</dd></div>
          <div><dt className="text-slate-500">Role</dt><dd className="font-medium capitalize text-slate-900">{user.role}</dd></div>
          <div><dt className="text-slate-500">User ID</dt><dd className="break-all font-mono text-xs text-slate-700">{user._id}</dd></div>
          <div><dt className="text-slate-500">Interests</dt><dd className="font-medium text-slate-900">{user.interests.length ? user.interests.join(", ") : "—"}</dd></div>
          <div><dt className="text-slate-500">Member since</dt><dd className="font-medium text-slate-900">{new Date(user.createdAt).toLocaleString()}</dd></div>
        </dl>
      </Card>
    </div>
  );
}
