"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import { useState } from "react";

import {
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

interface NewsActionsProps {
  articleId: string;

  slug: string;
}

interface DeleteNewsResponse {
  error?: string;

  issues?: {
    message: string;
  }[];
}

export default function NewsActions({
  articleId,
  slug,
}: NewsActionsProps) {
  const router = useRouter();

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  async function handleDelete() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this article? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    setError(null);

    try {
      const response = await fetch(
        `/api/news/${articleId}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | DeleteNewsResponse
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
              "Could not delete the article.",
            issueText,
          ]
            .filter(Boolean)
            .join(" ")
        );
      }

      router.push("/news");

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete the article."
      );

      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <Link
          href={`/news/${slug}/edit`}
          className="
            inline-flex
            h-7
            items-center
            gap-1
            rounded-md
            border
            border-slate-700/70
            bg-[#0B132B]
            px-2
            text-[8px]
            font-black
            uppercase
            tracking-[0.12em]
            text-slate-300
            transition-colors
            hover:border-blue-400/60
            hover:text-white
          "
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Link>

        <button
          type="button"
          onClick={() => {
            void handleDelete();
          }}
          disabled={deleting}
          className="
            inline-flex
            h-7
            items-center
            gap-1
            rounded-md
            border
            border-slate-700/70
            bg-[#0B132B]
            px-2
            text-[8px]
            font-black
            uppercase
            tracking-[0.12em]
            text-slate-400
            transition-colors
            hover:border-red-500/60
            hover:text-red-300
            disabled:cursor-wait
            disabled:opacity-60
          "
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}

          {deleting ? "Deleting" : "Delete"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="
            max-w-[240px]
            text-right
            text-[9px]
            leading-relaxed
            text-red-300
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}
