import { Navigate, type RouteObject } from "react-router";
import { AdminLayout } from "./AdminLayout";
import { BooksPage } from "./BooksPage";
import { EditBookPage } from "./EditBookPage";
import { LoginPage } from "./LoginPage";
import { NewBookPage } from "./NewBookPage";
import { NotFoundPage } from "./NotFoundPage";
import { SubscriptionPage } from "./SubscriptionPage";

// Data-router route table (createBrowserRouter): needed for useBlocker on unsaved forms.
export const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/books" replace /> },
      { path: "books", element: <BooksPage /> },
      { path: "books/new", element: <NewBookPage /> },
      { path: "books/:id/edit", element: <EditBookPage /> },
      { path: "subscription", element: <SubscriptionPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
