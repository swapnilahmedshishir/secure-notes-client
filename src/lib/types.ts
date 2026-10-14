// Shared types matching the backend response contracts exactly.
export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteAuthor {
  _id: string;
  username: string;
  email: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  author: string | NoteAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: { _id: string; username: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface InterestGroup {
  interest: string;
  count: number;
  users: { _id: string; username: string; email: string }[];
}

export interface UserPostsResponse {
  user: { _id: string; username: string };
  data: Post[];
  pagination: Pagination;
}
