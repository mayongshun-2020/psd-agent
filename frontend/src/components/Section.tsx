"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

interface SectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: ReactNode;
}

export function Section({
  title,
  description,
  icon,
  defaultOpen = false,
  badge,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`section ${open ? "section-open" : ""}`}>
      <button
        className="section-head"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="section-head-left">
          {icon ? <span className="section-icon">{icon}</span> : null}
          <span>
            <span className="section-title-text">{title}</span>
            {description ? (
              <span className="section-desc">{description}</span>
            ) : null}
          </span>
        </span>
        <span className="section-head-right">
          {badge ? <span className="section-badge">{badge}</span> : null}
          <ChevronDown className="section-chevron" size={18} />
        </span>
      </button>
      {open ? <div className="section-body">{children}</div> : null}
    </div>
  );
}
