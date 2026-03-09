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
    <div className="inline-flex flex-wrap gap-1.5 rounded-full border border-black/5 bg-white/85 p-1.5 shadow-sm">
      {items.map((item) => {
        const isActive = item.value === value;
        const suffix = typeof item.count === "number" ? ` ${item.count}` : "";

        return (
          <button
            key={item.value}
            type="button"
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
              isActive ? "bg-accent text-white shadow-sm" : "text-ink/65 hover:bg-canvas"
            }`}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            <span className={`ml-1 text-xs ${isActive ? "text-white/85" : "text-ink/45"}`}>{suffix}</span>
          </button>
        );
      })}
    </div>
  );
}