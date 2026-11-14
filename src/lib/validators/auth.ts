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
    "The username needs at least 3 characters"
  )
  .max(
    24,
    "The username cannot exceed 24 characters"
  )
  .regex(
    USERNAME_PATTERN,
    "Only letters, numbers, hyphens and underscores are allowed"
  );

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(
    120,
    "The email is too long"
  )
  .refine(
    (value) =>
      EMAIL_PATTERN.test(value),
    "Enter a valid email"
  );

export const passwordSchema = z
  .string()
  .min(
    8,
    "The password needs at least 8 characters"
  )
  .max(
    72,
    "The password cannot exceed 72 characters"
  );

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(
        60,
        "The name cannot exceed 60 characters"
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
        "Repeat the password"
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],

      message:
        "Passwords do not match",
    }
  );

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(
      1,
      "Enter your email or username"
    )
    .max(120),

  password: z
    .string()
    .min(
      1,
      "Enter your password"
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
