import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Minimum length should be 2")
    .max(30, "Maximum length should be 30"),

  age: z
    .number()
    .min(10, "Minium age should be 10")
    .max(100, "Maximum age should be 100")
    .optional(),

  email: z.preprocess(
    (value) =>
      typeof value == "string" ? value.trim().toLocaleLowerCase() : "",
    z.email("Email must be valid"),
  ),

  password: z
    .string()
    .min(8)
    .max(30)
    .regex(/[A-Z]/, "Your password should have atleast one capital letter")
    .regex(/[a-z]/, "Your password should have atleast one capital letter")
    .regex(/[0-9]/, "Your password should have atleast one 1 digit")
    .regex(
      /[~?@.,<>,{}:'!^#()&-+]/,
      "Your password should have atleast one special character",
    ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value == "string" ? value.trim().toLowerCase() : ""),
    z.email("Email must be valid"),
  ),

  password: z
    .string()
    .min(8)
    .max(30)
    .regex(/[A-Z]/, "Your password should have atleast one capital letter")
    .regex(/[a-z]/, "Your password should have atleast one capital letter")
    .regex(/[0-9]/, "Your password should have atleast one 1 digit")
    .regex(
      /[~?@.,<>,{}:'!^#()&-+]/,
      "Your password should have atleast one special character",
    ),
});
