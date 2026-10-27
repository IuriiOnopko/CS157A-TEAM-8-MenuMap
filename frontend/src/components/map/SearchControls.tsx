import React from "react";
import type { DietaryClassification } from "../../api/restaurants";

export type Filters = { dietId: number | null; maxCalories: number | null; openOnly: boolean };

export const NO_FILTERS: Filters = { dietId: null, maxCalories: null, openOnly: false };

const CALORIE_LIMITS = [500, 650, 800];

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  diets: DietaryClassification[];
  nearMe: { on: boolean; locating: boolean; error: string | null; toggle: () => void };
};

const chip = "shrink-0 rounded-full border text-[13px] font-semibold whitespace-nowrap transition-colors";
const chipOff = "bg-card border-border-strong text-muted hover:border-sage hover:text-sage";
const chipOn = "bg-sage border-sage text-[#FBF6EC]";

/** Search box plus one scrollable row of filters, at the top of the map's side panel. */
export default function SearchControls({ query, onQueryChange, filters, onFiltersChange, diets, nearMe }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="relative block">
        <span className="sr-only">Search restaurants, dishes, cuisines</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2 pointer-events-none"
        >
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search restaurants, dishes, cuisines"
          autoComplete="off"
          className="w-full rounded-xl border border-border-strong bg-card pl-10 pr-9 py-2.5 text-[15px] text-ink placeholder:text-muted-2 outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-muted-2 hover:bg-[#EFEADF] hover:text-ink"
          >
            ×
          </button>
        )}
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar" role="group" aria-label="Filters">
        <button
          type="button"
          aria-pressed={filters.openOnly}
          onClick={() => onFiltersChange({ ...filters, openOnly: !filters.openOnly })}
          className={`${chip} px-3 py-1.5 ${filters.openOnly ? chipOn : chipOff}`}
        >
          Open now
        </button>

        <button
          type="button"
          aria-pressed={nearMe.on}
          onClick={nearMe.toggle}
          className={`${chip} px-3 py-1.5 flex items-center gap-1.5 ${nearMe.on ? chipOn : chipOff}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 3 3 10.5l7.2 2.3L12.5 20 21 3Z" />
          </svg>
          {nearMe.locating ? "Locating…" : "Near me"}
        </button>

        <ChipSelect
          label="Diet"
          value={filters.dietId}
          onChange={(dietId) => onFiltersChange({ ...filters, dietId })}
          emptyLabel="Any diet"
          options={diets.map((d) => ({ value: d.id, label: d.name }))}
        />

        <ChipSelect
          label="Calories"
          value={filters.maxCalories}
          onChange={(maxCalories) => onFiltersChange({ ...filters, maxCalories })}
          emptyLabel="Any calories"
          options={CALORIE_LIMITS.map((kcal) => ({ value: kcal, label: `Under ${kcal} kcal` }))}
        />
      </div>

      {nearMe.error && <p className="m-0 text-[12.5px] text-[#B42318]">{nearMe.error}</p>}
    </div>
  );
}

/** A <select> styled as a filter chip; highlighted while a value is chosen. */
function ChipSelect({
  label,
  value,
  onChange,
  emptyLabel,
  options,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  emptyLabel: string;
  options: { value: number; label: string }[];
}) {
  const on = value !== null;
  return (
    <label className={`${chip} relative flex items-center ${on ? chipOn : chipOff}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="appearance-none bg-transparent pl-3 pr-7 py-1.5 outline-none cursor-pointer text-inherit font-semibold"
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="absolute right-2.5 pointer-events-none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
