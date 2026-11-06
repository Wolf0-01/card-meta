import { z } from "zod";

const USERNAME_PATTERN =
  /^[a-zA-Z0-9_-]+$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(
    3,
    "El usuario necesita al menos 3 caracteres"
  )
  .max(
    24,
    "El usuario no puede superar 24 caracteres"
  )
  .regex(
    USERNAME_PATTERN,
    "Solo se permiten letras, números, guiones y guiones bajos"
  );

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(
    120,
    "El email es demasiado largo"
  )
  .refine(
    (value) =>
      EMAIL_PATTERN.test(value),
    "Introduce un email válido"
  );

export const passwordSchema = z
  .string()
  .min(
    8,
    "La contraseña necesita al menos 8 caracteres"
  )
  .max(
    72,
    "La contraseña no puede superar 72 caracteres"
  );

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(
        60,
        "El nombre no puede superar 60 caracteres"
      )
      .optional()
      .or(z.literal("")),

    username: usernameSchema,

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z
      .string()
      .min(
        1,
        "Repite la contraseña"
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],

      message:
        "Las contraseñas no coinciden",
    }
  );

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(
      1,
      "Introduce tu email o usuario"
    )
    .max(120),

  password: z
    .string()
    .min(
      1,
      "Introduce tu contraseña"
    )
    .max(72),
});

export type RegisterInput = z.infer<
  typeof registerSchema
>;

export type LoginInput = z.infer<
  typeof loginSchema
>;

export function toFieldErrors(
  error: z.ZodError
) {
  const fieldErrors: Record<
    string,
    string
  > = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (
      typeof key === "string" &&
      !fieldErrors[key]
    ) {
      fieldErrors[key] =
        issue.message;
    }
  }

  return fieldErrors;
}
