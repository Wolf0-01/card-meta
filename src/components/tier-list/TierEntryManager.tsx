"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  Check,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  TIER_ENTRY_TIER_OPTIONS,
  type TierEntryEditorData,
  type TierEntryTier,
} from "@/lib/tier-entries/editor";

import type { DuelFormat } from "@/lib/tier-list";

interface TierEntryManagerProps {
  format: DuelFormat;

  entries: TierEntryEditorData[];
}

interface FormState {
  archetype: string;

  cardName: string;

  ygoproId: string;

  tier: TierEntryTier;

  powerScore: string;

  notes: string;
}

const EMPTY_FORM: FormState = {
  archetype: "",

  cardName: "",

  ygoproId: "",

  tier: "TIER_1",

  powerScore: "80",

  notes: "",
};

const FIELD_CLASSES = `
  w-full
  rounded-md
  border
  border-slate-700/70
  bg-[#070D1F]
  px-2
  py-1.5
  text-[11px]
  font-semibold
  text-white
  outline-none
  transition-colors
  placeholder:text-slate-600
  focus:border-blue-400/70
`;

const LABEL_CLASSES = `
  mb-1
  block
  text-[8px]
  font-black
  uppercase
  tracking-[0.16em]
  text-slate-500
`;

function tierLabel(value: TierEntryTier) {
  return (
    TIER_ENTRY_TIER_OPTIONS.find(
      (option) => option.value === value
    )?.label ?? value
  );
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: string;

      issues?: { message: string }[];
    };

    if (typeof payload.error === "string") {
      const details = Array.isArray(
        payload.issues
      )
        ? payload.issues
            .map((issue) => issue.message)
            .filter(Boolean)
            .join(" · ")
        : "";

      return details
        ? `${payload.error}: ${details}`
        : payload.error;
    }
  } catch {
    // La respuesta no era JSON.
  }

  return "The request could not be completed";
}

/**
 * Editor de la Tier List para ADMIN y EDITOR. Permite
 * añadir arquetipos reales, moverlos de Tier y eliminarlos.
 */
export default function TierEntryManager({
  format,
  entries,
}: TierEntryManagerProps) {
  const router = useRouter();

  const [open, setOpen] = useState(
    entries.length === 0
  );

  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const [pending, setPending] = useState<
    string | null
  >(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const [notice, setNotice] = useState<
    string | null
  >(null);

  const formatValue = format.toUpperCase();

  function updateForm<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    setNotice(null);

    setPending("create");

    try {
      const response = await fetch(
        "/api/tier-entries",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            format: formatValue,

            tier: form.tier,

            archetype: form.archetype,

            cardName: form.cardName || null,

            ygoproId: form.ygoproId || null,

            powerScore: form.powerScore || 0,

            notes: form.notes || null,
          }),
        }
      );

      if (!response.ok) {
        setError(await readError(response));

        return;
      }

      setForm({
        ...EMPTY_FORM,
        tier: form.tier,
      });

      setNotice(
        "Archetype added to the tier list."
      );

      router.refresh();
    } catch {
      setError(
        "The request could not be completed"
      );
    } finally {
      setPending(null);
    }
  }

  async function handleMove(
    entry: TierEntryEditorData,
    tier: TierEntryTier
  ) {
    if (tier === entry.tier) {
      return;
    }

    setError(null);

    setNotice(null);

    setPending(entry.id);

    try {
      const response = await fetch(
        `/api/tier-entries/${entry.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            tier,
          }),
        }
      );

      if (!response.ok) {
        setError(await readError(response));

        return;
      }

      setNotice(
        `${entry.archetype} moved to ${tierLabel(
          tier
        )}.`
      );

      router.refresh();
    } catch {
      setError(
        "The request could not be completed"
      );
    } finally {
      setPending(null);
    }
  }

  async function handleDelete(
    entry: TierEntryEditorData
  ) {
    const confirmed = window.confirm(
      `Remove ${entry.archetype} from the tier list?`
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    setNotice(null);

    setPending(entry.id);

    try {
      const response = await fetch(
        `/api/tier-entries/${entry.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setError(await readError(response));

        return;
      }

      setNotice(
        `${entry.archetype} removed from the tier list.`
      );

      router.refresh();
    } catch {
      setError(
        "The request could not be completed"
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <section
      aria-label="Manage tier list"
      className="
        rounded-xl
        border
        border-blue-500/25
        bg-[#0B132B]
        p-3
        ring-1
        ring-inset
        ring-white/5
      "
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className="
              inline-flex
              items-center
              gap-1.5
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-blue-200
            "
          >
            <Check className="h-3.5 w-3.5" />
            Staff tools
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Add real archetypes, move them between
            tiers or remove them as the meta evolves.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="
            inline-flex
            h-8
            items-center
            gap-1.5
            rounded-lg
            border
            border-slate-700/70
            bg-[#070D1F]
            px-3
            text-[9px]
            font-black
            uppercase
            tracking-[0.14em]
            text-slate-300
            transition-colors
            hover:border-blue-400/60
            hover:text-white
          "
        >
          {open ? (
            <X className="h-3 w-3" />
          ) : (
            <Plus className="h-3 w-3" />
          )}

          {open ? "Close editor" : "Add archetype"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="
            mt-2
            rounded-md
            border
            border-red-500/40
            bg-red-500/10
            px-2
            py-1.5
            text-[10px]
            font-semibold
            text-red-200
          "
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="
            mt-2
            rounded-md
            border
            border-emerald-500/40
            bg-emerald-500/10
            px-2
            py-1.5
            text-[10px]
            font-semibold
            text-emerald-200
          "
        >
          {notice}
        </p>
      )}

      {open && (
        <form
          onSubmit={handleCreate}
          className="
            mt-3
            grid
            grid-cols-1
            gap-2.5
            border-t
            border-slate-700/50
            pt-3
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          <label>
            <span className={LABEL_CLASSES}>
              Archetype
            </span>

            <input
              required
              value={form.archetype}
              onChange={(event) =>
                updateForm(
                  "archetype",
                  event.target.value
                )
              }
              placeholder="e.g. Blue-Eyes"
              className={FIELD_CLASSES}
            />
          </label>

          <label>
            <span className={LABEL_CLASSES}>
              Signature card
            </span>

            <input
              value={form.cardName}
              onChange={(event) =>
                updateForm(
                  "cardName",
                  event.target.value
                )
              }
              placeholder="e.g. Blue-Eyes White Dragon"
              className={FIELD_CLASSES}
            />
          </label>

          <label>
            <span className={LABEL_CLASSES}>
              Card ID (optional)
            </span>

            <input
              inputMode="numeric"
              value={form.ygoproId}
              onChange={(event) =>
                updateForm(
                  "ygoproId",
                  event.target.value
                )
              }
              placeholder="e.g. 89631139"
              className={FIELD_CLASSES}
            />
          </label>

          <label>
            <span className={LABEL_CLASSES}>
              Tier
            </span>

            <select
              value={form.tier}
              onChange={(event) =>
                updateForm(
                  "tier",
                  event.target
                    .value as TierEntryTier
                )
              }
              className={FIELD_CLASSES}
            >
              {TIER_ENTRY_TIER_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span className={LABEL_CLASSES}>
              Power score
            </span>

            <input
              type="number"
              min={0}
              max={100}
              value={form.powerScore}
              onChange={(event) =>
                updateForm(
                  "powerScore",
                  event.target.value
                )
              }
              className={FIELD_CLASSES}
            />
          </label>

          <label>
            <span className={LABEL_CLASSES}>
              Notes
            </span>

            <input
              value={form.notes}
              onChange={(event) =>
                updateForm(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Optional editorial note"
              className={FIELD_CLASSES}
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={pending === "create"}
              className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-lg
                border
                border-blue-500/40
                bg-blue-500/10
                px-3
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-blue-200
                transition-colors
                hover:border-blue-400
                hover:bg-blue-500/20
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {pending === "create" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}

              Add to tier list
            </button>
          </div>
        </form>
      )}

      {entries.length > 0 && (
        <ul
          className="
            mt-3
            space-y-1.5
            border-t
            border-slate-700/50
            pt-3
          "
        >
          {entries.map((entry) => {
            const isPending =
              pending === entry.id;

            return (
              <li
                key={entry.id}
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-700/60
                  bg-[#070D1F]
                  px-2
                  py-1.5
                "
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate
                      text-[11px]
                      font-black
                      text-white
                    "
                  >
                    {entry.archetype}
                  </p>

                  <p
                    className="
                      truncate
                      text-[9px]
                      text-slate-500
                    "
                  >
                    {entry.cardName ??
                      "No signature card"}

                    {entry.ygoproId
                      ? ` · #${entry.ygoproId}`
                      : ""}

                    {entry.notes
                      ? ` · ${entry.notes}`
                      : ""}
                  </p>
                </div>

                <label className="flex items-center gap-1">
                  <span
                    className="
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-slate-500
                    "
                  >
                    Tier
                  </span>

                  <select
                    value={entry.tier}
                    disabled={isPending}
                    onChange={(event) =>
                      handleMove(
                        entry,
                        event.target
                          .value as TierEntryTier
                      )
                    }
                    className="
                      rounded-md
                      border
                      border-slate-700/70
                      bg-[#0B132B]
                      px-1.5
                      py-1
                      text-[10px]
                      font-bold
                      text-slate-200
                      outline-none
                      focus:border-blue-400/70
                    "
                  >
                    {TIER_ENTRY_TIER_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <span
                  className="
                    rounded
                    border
                    border-slate-700/70
                    bg-[#0B132B]
                    px-1.5
                    py-0.5
                    text-[9px]
                    font-black
                    tabular-nums
                    text-slate-300
                  "
                >
                  {entry.powerScore}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
                  disabled={isPending}
                  aria-label={`Remove ${entry.archetype}`}
                  className="
                    inline-flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-red-500/30
                    bg-red-500/10
                    text-red-300
                    transition-colors
                    hover:border-red-400/70
                    hover:text-red-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
