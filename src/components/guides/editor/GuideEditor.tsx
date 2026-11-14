"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import type {
  GuideCoverOption,
  GuideEditorCard,
  GuideEditorData,
} from "@/lib/guides/editor";

import GuideCardPicker from "./GuideCardPicker";

const labelClass = `
  block
  text-[9px]
  font-black
  uppercase
  tracking-[0.16em]
  text-slate-400
`;

const inputClass = `
  mt-1
  h-9
  w-full
  rounded-lg
  border
  border-slate-700/70
  bg-[#070D1F]
  px-2.5
  text-xs
  text-slate-200
  placeholder:text-slate-500
  outline-none
  transition-colors
  focus:border-blue-400/70
  focus:ring-1
  focus:ring-blue-400/30
`;

const textareaClass = `
  mt-1
  w-full
  rounded-lg
  border
  border-slate-700/70
  bg-[#070D1F]
  px-2.5
  py-2
  text-xs
  leading-6
  text-slate-200
  placeholder:text-slate-500
  outline-none
  transition-colors
  focus:border-blue-400/70
  focus:ring-1
  focus:ring-blue-400/30
`;

interface DraftSection {
  key: string;

  heading: string;

  paragraphs: string;

  bullets: string;

  cards: GuideEditorCard[];
}

interface GuideApiResponse {
  guide?: {
    id: string;

    slug: string;
  };

  error?: string;

  issues?: {
    path: string;

    message: string;
  }[];
}

interface GuideEditorProps {
  mode: "create" | "edit";

  currentAuthor: string;

  initialGuide?: GuideEditorData;

  coverOptions: GuideCoverOption[];
}

function toDraftSections(
  guide?: GuideEditorData
): DraftSection[] {
  if (!guide || guide.sections.length === 0) {
    return [
      {
        key: "section-0",

        heading: "",

        paragraphs: "",

        bullets: "",

        cards: [],
      },
    ];
  }

  return guide.sections.map(
    (section, index) => ({
      key: `section-${index}`,

      heading: section.heading,

      paragraphs: section.paragraphs.join(
        "\n\n"
      ),

      bullets: section.bullets.join("\n"),

      cards: section.cards,
    })
  );
}

export default function GuideEditor({
  mode,
  currentAuthor,
  initialGuide,
  coverOptions,
}: GuideEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(
    initialGuide?.title ?? ""
  );

  const [summary, setSummary] = useState(
    initialGuide?.summary ?? ""
  );

  const [author, setAuthor] = useState(
    initialGuide?.author?.trim() ||
      currentAuthor
  );

  const [featured, setFeatured] = useState(
    initialGuide?.featured ?? false
  );

  const [coverUrl, setCoverUrl] = useState(
    initialGuide?.coverUrl ??
      coverOptions[0]?.bannerUrl ??
      ""
  );

  const [tags, setTags] = useState(
    initialGuide?.tags.join(", ") ?? ""
  );

  const [sections, setSections] = useState<
    DraftSection[]
  >(() => toDraftSections(initialGuide));

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const isEdit = mode === "edit";

  const backHref =
    isEdit && initialGuide
      ? `/guides/${initialGuide.slug}`
      : "/guides";

  const selectedBanner =
    coverOptions.find(
      (option) =>
        option.bannerUrl === coverUrl
    )?.bannerUrl ?? "";

  function updateSection(
    key: string,
    patch: Partial<DraftSection>
  ) {
    setSections((current) =>
      current.map((section) =>
        section.key === key
          ? {
              ...section,
              ...patch,
            }
          : section
      )
    );
  }

  function addSection() {
    setSections((current) => [
      ...current,

      {
        key: `section-${Date.now()}-${current.length}`,

        heading: "",

        paragraphs: "",

        bullets: "",

        cards: [],
      },
    ]);
  }

  function removeSection(key: string) {
    setSections((current) =>
      current.length <= 1
        ? current
        : current.filter(
            (section) => section.key !== key
          )
    );
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    const cleanTitle = title.trim();

    const cleanSummary = summary.trim();

    const cleanAuthor = author.trim();

    const cleanCoverUrl = coverUrl.trim();

    if (!cleanTitle) {
      setError("El título es obligatorio.");

      return;
    }

    if (!cleanSummary) {
      setError("El resumen es obligatorio.");

      return;
    }

    if (!cleanAuthor) {
      setError("El autor es obligatorio.");

      return;
    }

    if (!cleanCoverUrl) {
      setError(
        "Selecciona un banner o pega una URL de portada."
      );

      return;
    }

    const payloadSections = sections.map(
      (section) => ({
        heading: section.heading.trim(),

        paragraphs: section.paragraphs
          .split(/\n\s*\n/)
          .map((paragraph) =>
            paragraph.trim()
          )
          .filter(Boolean),

        bullets: section.bullets
          .split("\n")
          .map((bullet) =>
            bullet
              .trim()
              .replace(/^[-*]\s*/, "")
          )
          .filter(Boolean),

        featuredCardNames: section.cards.map(
          (card) => card.name
        ),
      })
    );

    const invalidSectionIndex =
      payloadSections.findIndex(
        (section) =>
          !section.heading ||
          section.paragraphs.length === 0
      );

    if (invalidSectionIndex >= 0) {
      setError(
        `La sección ${
          invalidSectionIndex + 1
        } necesita un título y al menos un párrafo.`
      );

      return;
    }

    const payload = {
      title: cleanTitle,

      summary: cleanSummary,

      author: cleanAuthor,

      featured,

      coverUrl: cleanCoverUrl,

      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      sections: payloadSections,

      featuredCardNames: [
        ...new Set(
          payloadSections.flatMap(
            (section) =>
              section.featuredCardNames
          )
        ),
      ],
    };

    setSaving(true);

    setError(null);

    try {
      const response = await fetch(
        isEdit && initialGuide
          ? `/api/guides/${initialGuide.id}`
          : "/api/guides",
        {
          method: isEdit ? "PATCH" : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | GuideApiResponse
        | null;

      if (!response.ok) {
        const issueText = Array.isArray(
          data?.issues
        )
          ? data.issues
              .map((issue) => issue.message)
              .join(" ")
          : "";

        throw new Error(
          [
            data?.error ??
              "No se pudo guardar la guía.",
            issueText,
          ]
            .filter(Boolean)
            .join(" ")
        );
      }

      const slug = data?.guide?.slug;

      router.push(
        slug ? `/guides/${slug}` : "/guides"
      );

      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la guía."
      );

      setSaving(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-5
        text-slate-100
        sm:px-6
        sm:py-7
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-5xl
          space-y-4
        "
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={backHref}
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.18em]
              text-slate-500
              transition-colors
              hover:text-blue-300
            "
          >
            <ArrowLeft className="h-3 w-3" />

            {isEdit
              ? "Back to guide"
              : "Back to Guides"}
          </Link>

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            Card Meta · Editorial
          </span>
        </div>

        <header className="space-y-1.5">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.3em]
              text-blue-300
            "
          >
            {isEdit ? "Edit Guide" : "New Guide"}
          </p>

          <h1
            className="
              text-2xl
              font-black
              uppercase
              tracking-[0.14em]
              text-white
              sm:text-4xl
            "
          >
            {isEdit
              ? "Editar guía"
              : "Nueva guía"}
          </h1>

          <p
            className="
              max-w-2xl
              text-[11px]
              leading-relaxed
              text-slate-400
            "
          >
            Publica una guía editorial con secciones
            dinámicas, portada real y cartas destacadas
            enlazadas al catálogo.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="
              rounded-lg
              border
              border-red-500/40
              bg-red-500/10
              px-3
              py-2.5
              text-[11px]
              leading-relaxed
              text-red-200
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();

            void handleSave();
          }}
          className="space-y-4"
        >
          <section
            className="
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-4
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Datos principales
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Título
                </span>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Blue-Eyes: guía del formato actual"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Resumen corto
                </span>

                <textarea
                  rows={3}
                  value={summary}
                  onChange={(event) =>
                    setSummary(event.target.value)
                  }
                  placeholder="Explica en una o dos frases de qué trata la guía."
                  className={textareaClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Autor
                </span>

                <input
                  type="text"
                  value={author}
                  onChange={(event) =>
                    setAuthor(event.target.value)
                  }
                  placeholder="Tu nombre de autor"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Tags (separados por comas)
                </span>

                <input
                  type="text"
                  value={tags}
                  onChange={(event) =>
                    setTags(event.target.value)
                  }
                  placeholder="Blue-Eyes, Speed Duel, Dragon"
                  className={inputClass}
                />
              </label>

              <div className="space-y-1">
                <span className={labelClass}>
                  Featured (Most Popular)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={featured}
                    onClick={() =>
                      setFeatured(
                        (current) => !current
                      )
                    }
                    className={`
                      relative
                      inline-flex
                      h-6
                      w-11
                      shrink-0
                      items-center
                      rounded-full
                      border
                      transition-colors
                      ${
                        featured
                          ? "border-amber-400/60 bg-amber-400/25"
                          : "border-slate-700 bg-slate-900"
                      }
                    `}
                  >
                    <span
                      aria-hidden
                      className={`
                        inline-block
                        h-4
                        w-4
                        transform
                        rounded-full
                        transition-transform
                        ${
                          featured
                            ? "translate-x-6 bg-amber-300"
                            : "translate-x-1 bg-slate-500"
                        }
                      `}
                    />
                  </button>

                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Sparkles
                      className={`h-3 w-3 ${
                        featured
                          ? "text-amber-300"
                          : "text-slate-600"
                      }`}
                    />

                    {featured
                      ? "Aparecerá en Most Popular"
                      : "Guía normal"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 lg:col-span-2">
                <span className={labelClass}>
                  Portada
                </span>

                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />

                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(event) =>
                      setCoverUrl(event.target.value)
                    }
                    placeholder="https://... o /ruta-local.jpg"
                    className={inputClass}
                  />
                </div>

                <select
                  value={selectedBanner}
                  onChange={(event) => {
                    if (event.target.value) {
                      setCoverUrl(
                        event.target.value
                      );
                    }
                  }}
                  aria-label="Elegir banner de expansión"
                  className={inputClass}
                >
                  <option value="">
                    Elegir banner de expansión...
                  </option>

                  {coverOptions.map((option) => (
                    <option
                      key={option.slug}
                      value={option.bannerUrl}
                    >
                      {option.name}
                    </option>
                  ))}
                </select>

                {coverUrl.trim() && (
                  <div
                    className="
                      relative
                      mt-2
                      aspect-[21/9]
                      overflow-hidden
                      rounded-lg
                      border
                      border-slate-700/60
                      bg-slate-900
                    "
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverUrl}
                      alt="Vista previa de la portada"
                      referrerPolicy="no-referrer"
                      className="
                        h-full
                        w-full
                        object-cover
                        object-center
                      "
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Secciones
              </h2>

              <span
                className="
                  rounded
                  border
                  border-slate-700/70
                  bg-[#0B132B]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  tabular-nums
                  text-slate-500
                "
              >
                {sections.length}
              </span>
            </div>

            <button
              type="button"
              onClick={addSection}
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
              "
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir sección
            </button>
          </div>

          <div className="space-y-3">
            {sections.map(
              (section, index) => (
                <section
                  key={section.key}
                  className="
                    rounded-xl
                    border
                    border-slate-700/60
                    bg-[#0B132B]
                    p-4
                    ring-1
                    ring-inset
                    ring-white/5
                  "
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        border
                        border-sky-500/30
                        bg-sky-500/10
                        text-[9px]
                        font-black
                        tabular-nums
                        text-sky-200
                      "
                    >
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <input
                      type="text"
                      value={section.heading}
                      onChange={(event) =>
                        updateSection(
                          section.key,
                          {
                            heading:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Título de la sección"
                      aria-label={`Título de la sección ${
                        index + 1
                      }`}
                      className="
                        h-9
                        min-w-0
                        flex-1
                        rounded-lg
                        border
                        border-slate-700/70
                        bg-[#070D1F]
                        px-2.5
                        text-xs
                        font-bold
                        text-slate-200
                        placeholder:text-slate-500
                        outline-none
                        transition-colors
                        focus:border-blue-400/70
                        focus:ring-1
                        focus:ring-blue-400/30
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSection(
                          section.key
                        )
                      }
                      disabled={
                        sections.length <= 1
                      }
                      aria-label={`Eliminar sección ${
                        index + 1
                      }`}
                      title={
                        sections.length <= 1
                          ? "La guía necesita al menos una sección"
                          : "Eliminar sección"
                      }
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-700/70
                        bg-[#070D1F]
                        text-slate-500
                        transition-colors
                        hover:border-red-500/50
                        hover:text-red-300
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <label className="space-y-0.5">
                      <span className={labelClass}>
                        Párrafos
                      </span>

                      <textarea
                        rows={6}
                        value={section.paragraphs}
                        onChange={(event) =>
                          updateSection(
                            section.key,
                            {
                              paragraphs:
                                event.target.value,
                            }
                          )
                        }
                        placeholder={
                          "Escribe cada párrafo separado por una línea en blanco.\n\nEl primer párrafo introduce la idea.\n\nEl segundo la desarrolla."
                        }
                        className={textareaClass}
                      />
                    </label>

                    <label className="space-y-0.5">
                      <span className={labelClass}>
                        Puntos clave (uno por línea)
                      </span>

                      <textarea
                        rows={6}
                        value={section.bullets}
                        onChange={(event) =>
                          updateSection(
                            section.key,
                            {
                              bullets:
                                event.target.value,
                            }
                          )
                        }
                        placeholder={
                          "Prioriza starters que funcionen solos.\nReserva espacio para interacción.\nAjusta el sideboard al top cut."
                        }
                        className={textareaClass}
                      />
                    </label>
                  </div>

                  <div className="mt-3 border-t border-slate-800 pt-3">
                    <GuideCardPicker
                      selected={section.cards}
                      onChange={(cards) =>
                        updateSection(
                          section.key,
                          { cards }
                        )
                      }
                    />
                  </div>
                </section>
              )
            )}
          </div>

          <div
            className="
              sticky
              bottom-3
              z-10
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
              rounded-xl
              border
              border-slate-700/70
              bg-[#0B132B]/95
              p-2.5
              shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]
              backdrop-blur
            "
          >
            <p className="text-[10px] leading-relaxed text-slate-500">
              El slug se genera automáticamente desde el
              título y se mantiene único.
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={backHref}
                className="
                  inline-flex
                  h-8
                  items-center
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
                  hover:border-slate-500
                  hover:text-white
                "
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-emerald-500/40
                  bg-emerald-500/15
                  px-3
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-emerald-200
                  transition-colors
                  hover:border-emerald-400
                  hover:bg-emerald-500/25
                  hover:text-white
                  disabled:cursor-wait
                  disabled:opacity-60
                "
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}

                {saving
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Publicar guía"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
