export const DISCORD_STATE_COOKIE =
  "cardmeta_discord_state";

export const DISCORD_NEXT_COOKIE =
  "cardmeta_discord_next";

export const DISCORD_STATE_MAX_AGE_SECONDS =
  60 * 10;

export const DISCORD_AUTHORIZE_URL =
  "https://discord.com/oauth2/authorize";

export const DISCORD_TOKEN_URL =
  "https://discord.com/api/oauth2/token";

export const DISCORD_USER_URL =
  "https://discord.com/api/users/@me";

const USERNAME_MAX_LENGTH = 24;

const DISPLAY_NAME_MAX_LENGTH = 60;

export interface DiscordConfig {
  clientId: string;

  clientSecret: string;

  redirectUri: string;
}

export interface DiscordProfile {
  id: string;

  username: string;

  global_name?: string | null;

  email?: string | null;

  avatar?: string | null;
}

/**
 * Discord OAuth2 solo se habilita cuando están configuradas
 * las tres variables necesarias.
 */
export function getDiscordConfig(): DiscordConfig | null {
  const clientId =
    process.env.DISCORD_CLIENT_ID?.trim();

  const clientSecret =
    process.env.DISCORD_CLIENT_SECRET?.trim();

  const redirectUri =
    process.env.DISCORD_REDIRECT_URI?.trim();

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri
  ) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export function isDiscordConfigured() {
  return getDiscordConfig() !== null;
}

/**
 * Solo se permiten rutas internas tras completar el OAuth2.
 */
export function safeDiscordNextPath(
  value: string | null | undefined
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/login") ||
    value.startsWith("/register")
  ) {
    return "/";
  }

  return value;
}

/**
 * Convierte el nombre de Discord en un username compatible
 * con las reglas de registro de Card Meta.
 */
export function sanitizeDiscordUsername(
  value: string
) {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+/, "")
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(/[-_]+$/, "");

  return sanitized.length >= 3
    ? sanitized
    : "duelist";
}

/**
 * Devuelve candidatos en orden de preferencia hasta encontrar
 * un username libre.
 */
export function buildUsernameCandidates(
  preferred: string,
  discordId: string
) {
  const base =
    sanitizeDiscordUsername(preferred);

  const suffixValue =
    discordId
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-4) || "user";

  const candidates = [base];

  candidates.push(
    `${base
      .slice(
        0,
        USERNAME_MAX_LENGTH -
          suffixValue.length -
          1
      )
      .replace(/[-_]+$/, "")}-${suffixValue}`
  );

  for (
    let index = 2;
    index <= 20;
    index += 1
  ) {
    const suffix = `-${index}`;

    candidates.push(
      `${base
        .slice(
          0,
          USERNAME_MAX_LENGTH -
            suffix.length
        )
        .replace(/[-_]+$/, "")}${suffix}`
    );
  }

  return candidates;
}

export function normalizeDiscordDisplayName(
  value: string | null | undefined
) {
  const trimmed = value?.trim();

  return trimmed
    ? trimmed.slice(
        0,
        DISPLAY_NAME_MAX_LENGTH
      )
    : null;
}

/**
 * Avatar de Discord con el tamaño usado en el resto del sitio.
 * Si el usuario no tiene avatar se usa uno de los avatares por
 * defecto de Discord.
 */
export function buildDiscordAvatarUrl(
  userId: string,
  avatarHash: string | null | undefined
) {
  if (avatarHash) {
    const extension =
      avatarHash.startsWith("a_")
        ? "gif"
        : "png";

    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=256`;
  }

  let avatarIndex = 0;

  try {
    avatarIndex = Number(
      (BigInt(userId) >> BigInt(22)) %
        BigInt(6)
    );
  } catch {
    avatarIndex = 0;
  }

  return `https://cdn.discordapp.com/embed/avatars/${avatarIndex}.png`;
}
