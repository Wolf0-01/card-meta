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
  Image as ImageIcon,
  Loader2,
  Newspaper,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import GuideCardPicker from "@/components/guides/editor/GuideCardPicker";

import type {
  NewsCoverOption,
  NewsEditorCard,
  NewsEditorData,
} from "@/lib/news/editor";

import {
  NEWS_CATEGORIES,
  type NewsCategoryKey,
} from "@/lib/newsCategories";

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

  cards: NewsEditorCard[];
}

interface NewsApiResponse {
  article?: {
    id: string;

    slug: string;
  };

  error?: string;

  issues?: {
    path: string;

    message: string;
  }[];
}

interface NewsEditorProps {
  mode: "create" | "edit";

  currentAuthor: string;

  initialArticle?: NewsEditorData;

  coverOptions: NewsCoverOption[];
}

function toDraftSections(
  article?: NewsEditorData
): DraftSection[] {
  if (!article || article.sections.length === 0) {
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

  return article.sections.map(
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

export default function NewsEditor({
  mode,
  currentAuthor,
  initialArticle,
  coverOptions,
}: NewsEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(
    initialArticle?.title ?? ""
  );

  const [summary, setSummary] = useState(
    initialArticle?.summary ?? ""
  );

  const [author, setAuthor] = useState(
    initialArticle?.author?.trim() ||
      currentAuthor
  );

  const [category, setCategory] =
    useState<NewsCategoryKey>(
      initialArticle?.category ?? "updates"
    );

  const [coverUrl, setCoverUrl] = useState(
    initialArticle?.coverUrl ??
      coverOptions[0]?.bannerUrl ??
      ""
  );

  const [tags, setTags] = useState(
    initialArticle?.tags.join(", ") ?? ""
  );

  const [sections, setSections] = useState<
    DraftSection[]
  >(() => toDraftSections(initialArticle));

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const isEdit = mode === "edit";

  const backHref =
    isEdit && initialArticle
      ? `/news/${initialArticle.slug}`
      : "/news";

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
      setError("The title is required.");

      return;
    }

    if (!cleanSummary) {
      setError("The summary is required.");

      return;
    }

    if (!cleanAuthor) {
      setError("The author is required.");

      return;
    }

    if (!cleanCoverUrl) {
      setError(
        "Choose a banner or paste a cover URL."
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
        `Section ${
          invalidSectionIndex + 1
        } needs a heading and at least one paragraph.`
      );

      return;
    }

    const payload = {
      title: cleanTitle,

      summary: cleanSummary,

      author: cleanAuthor,

      category,

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
        isEdit && initialArticle
          ? `/api/news/${initialArticle.id}`
          : "/api/news",
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
        | NewsApiResponse
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
              "Could not save the article.",
            issueText,
          ]
            .filter(Boolean)
            .join(" ")
        );
      }

      const slug = data?.article?.slug;

      router.push(
        slug ? `/news/${slug}` : "/news"
      );

      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the article."
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
              ? "Back to article"
              : "Back to News"}
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
            {isEdit ? "Edit Post" : "New Post"}
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
              ? "Edit article"
              : "New article"}
          </h1>

          <p
            className="
              max-w-2xl
              text-[11px]
              leading-relaxed
              text-slate-400
            "
          >
            Publish an editorial article with dynamic
            sections, a real cover and featured cards
            linked to the catalog.
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
              <Newspaper className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Main details
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Title
                </span>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Meta Weekly #312 Recap"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Short summary
                </span>

                <textarea
                  rows={3}
                  value={summary}
                  onChange={(event) =>
                    setSummary(event.target.value)
                  }
                  placeholder="Explain what the article is about in one or two sentences."
                  className={textareaClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Author
                </span>

                <input
                  type="text"
                  value={author}
                  onChange={(event) =>
                    setAuthor(event.target.value)
                  }
                  placeholder="Your author name"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Category
                </span>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as NewsCategoryKey
                    )
                  }
                  className={inputClass}
                >
                  {NEWS_CATEGORIES.map(
                    (option) => (
                      <option
                        key={option.key}
                        value={option.key}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Tags (comma separated)
                </span>

                <input
                  type="text"
                  value={tags}
                  onChange={(event) =>
                    setTags(event.target.value)
                  }
                  placeholder="Meta Weekly, Snake-Eye, Competitive"
                  className={inputClass}
                />
              </label>

              <div className="space-y-1 lg:col-span-2">
                <span className={labelClass}>
                  Cover
                </span>

                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />

                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(event) =>
                      setCoverUrl(event.target.value)
                    }
                    placeholder="https://... or /local-path.jpg"
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
                  aria-label="Choose a box banner"
                  className={inputClass}
                >
                  <option value="">
                    Choose a box banner...
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
                      alt="Cover preview"
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
              <Newspaper className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Sections
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
              Add section
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
                      placeholder="Section heading"
                      aria-label={`Section ${
                        index + 1
                      } heading`}
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
                      aria-label={`Remove section ${
                        index + 1
                      }`}
                      title={
                        sections.length <= 1
                          ? "The article needs at least one section"
                          : "Remove section"
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
                        Paragraphs
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
                          "Write each paragraph separated by a blank line.\n\nThe first paragraph introduces the idea.\n\nThe second one develops it."
                        }
                        className={textareaClass}
                      />
                    </label>

                    <label className="space-y-0.5">
                      <span className={labelClass}>
                        Key points (one per line)
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
                          "Three Poplar to maximize opening odds.\nTune the sideboard for the mirror.\nKeep pressure on the following turn."
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
              The slug is generated automatically from
              the title and kept unique.
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
                Cancel
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
                  ? "Saving..."
                  : isEdit
                    ? "Save changes"
                    : "Publish post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
