import { Navigate, Route, Routes } from "react-router";
import { AdminLayout } from "./AdminLayout";
import { BooksPage } from "./BooksPage";
import { EditBookPage } from "./EditBookPage";
import { LoginPage } from "./LoginPage";
import { NewBookPage } from "./NewBookPage";
import { NotFoundPage } from "./NotFoundPage";
import { SubscriptionPage } from "./SubscriptionPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/books" replace />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/new" element={<NewBookPage />} />
        <Route path="books/:id/edit" element={<EditBookPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
