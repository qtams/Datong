import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-2 flex items-center">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  size={11}
                  strokeWidth={1.6}
                  className="text-gray-300"
                />
              )}

              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 transition-colors hover:text-gray-900"
                >
                  {index === 0 && <Home size={11} strokeWidth={1.6} />}

                  {item.label}
                </a>
              ) : (
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-medium ${
                    isLast ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {index === 0 && <Home size={11} strokeWidth={1.6} />}

                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PageHeader({ title, description, breadcrumbs = [], actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-gray-950 sm:text-[24px]">
          {title}
        </h1>

        {description && (
          <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
