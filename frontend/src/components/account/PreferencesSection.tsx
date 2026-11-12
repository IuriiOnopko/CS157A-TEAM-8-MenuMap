import React, { useEffect, useState } from "react";
import { Allergen, getAllergens, getMyAllergens, saveMyAllergens } from "../../api/account";
import { errorMessage } from "../../api/http";
import { DietaryClassification, getDietaryClassifications } from "../../api/restaurants";
import { loadPreferences, Preferences, savePreferences } from "../../lib/preferences";
import Section, { SaveStatus } from "./Section";

type Chip = { name: string; description: string | null; on: boolean; onToggle: () => void };

/**
 * Allergens (saved to the account, customer_allergen) and diets (saved in this browser, lib/preferences.ts).
 * Each click saves right away.
 */
export default function PreferencesSection({ userId }: { userId: number }) {
  const [allergens, setAllergens] = useState<Allergen[] | null>(null);
  const [diets, setDiets] = useState<DietaryClassification[]>([]);
  const [myAllergenIds, setMyAllergenIds] = useState<number[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAllergens(), getDietaryClassifications(), getMyAllergens()])
      .then(([all, d, mine]) => {
        setAllergens(all);
        setDiets(d);
        setMyAllergenIds(mine.map((a) => a.id));
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  // shows the change right away, and puts it back if the server couldn't save it
  function toggleAllergen(id: number) {
    const before = myAllergenIds;
    const next = before.includes(id) ? before.filter((x) => x !== id) : [...before, id];
    setMyAllergenIds(next);
    setError("");
    saveMyAllergens(next).catch((e) => {
      setMyAllergenIds(before);
      setError(errorMessage(e));
    });
  }

  function toggleDiet(name: string) {
    const list = preferences.diets;
    const next = { diets: list.includes(name) ? list.filter((n) => n !== name) : [...list, name] };
    setPreferences(next);
    savePreferences(userId, next);
  }

  return (
    <Section
      title="Allergens and dietary preferences"
      description="Allergens are saved to your account, and menus point out dishes that contain them. Dietary preferences are saved in this browser."
    >
      {allergens === null ? (
        error ? (
          <SaveStatus error={error} />
        ) : (
          <p className="m-0 text-sm text-muted-2">Loading…</p>
        )
      ) : (
        <div className="flex flex-col gap-5">
          <ChipGroup
            label="Allergens"
            chips={allergens.map((a) => ({
              name: a.name,
              description: a.description,
              on: myAllergenIds.includes(a.id),
              onToggle: () => toggleAllergen(a.id),
            }))}
          />
          <ChipGroup
            label="Dietary preferences"
            chips={diets.map((d) => ({
              name: d.name,
              description: d.description,
              on: preferences.diets.includes(d.name),
              onToggle: () => toggleDiet(d.name),
            }))}
          />
          <SaveStatus error={error} />
        </div>
      )}
    </Section>
  );
}

function ChipGroup({ label, chips }: { label: string; chips: Chip[] }) {
  return (
    <fieldset className="m-0 p-0 border-0">
      <legend className="text-[13.5px] font-semibold text-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.name}
            type="button"
            aria-pressed={chip.on}
            title={chip.description ?? undefined}
            onClick={chip.onToggle}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors ${
              chip.on ? "bg-sage border-sage text-[#FBF6EC]" : "border-border-strong text-muted hover:border-sage hover:text-sage"
            }`}
          >
            {chip.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
