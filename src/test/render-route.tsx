import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router";

/** Renders `ui` at `path`; other app routes render their path as text so tests can see where navigation landed. */
export function renderRoute(ui: ReactElement, path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={<p data-testid="location">navigated</p>} />
        <Route path="/books" element={<p>Book list page</p>} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}
