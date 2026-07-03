import clsx from "clsx";

const brandIconSrc = new URL(
  "../../../../../resources/icon.png",
  import.meta.url
).href;

interface AppBrandProps {
  className?: string;
  iconClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  titleClassName?: string;
  titleTag?: "div" | "h1" | "h2" | "span";
}

function BrandIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex shrink-0 items-center overflow-hidden border border-aw-border bg-white shadow-[0_10px_24px_rgba(38,37,30,0.10)]",
        className
      )}
    >
      <img
        src={brandIconSrc}
        alt=""
        className="h-full w-auto max-w-none"
        style={{ transformOrigin: "left center" }}
      />
    </span>
  );
}

export function AppBrand({
  className,
  iconClassName,
  subtitle,
  subtitleClassName,
  titleClassName,
  titleTag = "span"
}: AppBrandProps): React.JSX.Element {
  const TitleTag = titleTag;

  return (
    <div className={clsx("flex min-w-0 items-center gap-3", className)}>
      <BrandIcon className={clsx("h-18 w-18", iconClassName)} />
      <div className="min-w-0">
        <TitleTag
          className={clsx(
            "block truncate text-base font-semibold tracking-[-0.02em] text-aw-text",
            titleClassName
          )}
        >
          Space Mint
        </TitleTag>
        {subtitle ? (
          <p
            className={clsx(
              "mt-1 text-sm leading-6 text-aw-text-soft",
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
