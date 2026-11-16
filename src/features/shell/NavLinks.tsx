import { NavLink } from "react-router";

const links = [
  { to: "/books", label: "Master book" },
  { to: "/subscription", label: "Subscription" },
] as const;

export function NavLinks() {
  return (
    <ul className="flex gap-1 md:flex-col">
      {links.map(({ to, label }) => (
        <li key={to}>
          {/* NavLink sets aria-current="page" and isActive for /books and /books/* */}
          <NavLink
            to={to}
            className={({ isActive }) =>
              `group flex h-9.5 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-nav-accent ${isActive ? "bg-nav-active text-white" : "text-nav-dim hover:bg-nav-active/60"}`
            }
          >
            <span
              aria-hidden
              className="h-4.5 w-0.75 rounded-xs group-aria-[current=page]:bg-brand-mark"
            />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
