export type SegmentedTabItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type SegmentedTabsProps<T extends string> = {
  items: Array<SegmentedTabItem<T>>;
  value: T;
  onChange: (nextValue: T) => void;
};

export function SegmentedTabs<T extends string>({ items, value, onChange }: SegmentedTabsProps<T>) {
  return (
    <div className="inline-flex flex-wrap gap-1.5 rounded-full border border-border-theme bg-surface-alt/90 p-1.5 shadow-sm">
      {items.map((item) => {
        const isActive = item.value === value;
        const suffix = typeof item.count === "number" ? ` ${item.count}` : "";

        return (
          <button
            key={item.value}
            type="button"
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
              isActive ? "bg-nav-active text-nav-active-text shadow-sm" : "text-ink-sub hover:bg-surface hover:text-ink"
            }`}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            <span className={`ml-1 text-xs ${isActive ? "text-nav-active-text/80" : "text-ink-sub/80"}`}>{suffix}</span>
          </button>
        );
      })}
    </div>
  );
}
