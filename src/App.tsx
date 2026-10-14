import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { RequireAdmin, RequireAuth } from "./components/guards";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/Profile";
import NotesListPage from "./pages/notes/NotesList";
import NoteCreatePage from "./pages/notes/NoteCreate";
import NoteDetailPage from "./pages/notes/NoteDetail";
import NoteEditPage from "./pages/notes/NoteEdit";
import PostsPage from "./pages/posts/Posts";
import UserPostsPage from "./pages/posts/UserPosts";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/Users";
import AllNotesPage from "./pages/admin/AllNotes";
import InterestsPage from "./pages/admin/Interests";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/user/:id" element={<UserPostsPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notes" element={<NotesListPage />} />
            <Route path="/notes/new" element={<NoteCreatePage />} />
            <Route path="/notes/:id" element={<NoteDetailPage />} />
            <Route path="/notes/:id/edit" element={<NoteEditPage />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/notes" element={<AllNotesPage />} />
            <Route path="/admin/interests" element={<InterestsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
