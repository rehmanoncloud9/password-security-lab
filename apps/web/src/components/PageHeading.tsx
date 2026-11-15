import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly actions?: ReactNode;
}) {
  return <div className="page-heading">
    <div className="page-heading-copy">
      <div className="breadcrumb"><span>Laboratory</span><span aria-hidden="true">/</span><span>{title}</span></div>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {actions && <div className="page-heading-actions">{actions}</div>}
  </div>;
}
