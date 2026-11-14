export function slugifyNewsTitle(
  title: string
) {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "news";
}
