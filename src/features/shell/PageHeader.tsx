import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        {breadcrumb && (
          <div className="text-small text-muted">{breadcrumb}</div>
        )}
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-small text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2.5">{actions}</div>}
    </header>
  );
}
