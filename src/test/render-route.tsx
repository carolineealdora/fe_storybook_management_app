import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";

/**
 * Renders `ui` at `path` (matched by `pattern`, e.g. "/books/:id/edit") in a data router (so useBlocker works). Other app routes
 * render a marker text so tests can see where navigation landed.
 */
export function renderRoute(ui: ReactElement, path = "/", pattern = path) {
  const router = createMemoryRouter(
    [
      { path: pattern, element: ui },
      { path: "/books", element: <p>Book list page</p> },
      { path: "/login", element: <p>Login page</p> },
      { path: "*", element: <p>Other page</p> },
    ],
    { initialEntries: [path] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}
