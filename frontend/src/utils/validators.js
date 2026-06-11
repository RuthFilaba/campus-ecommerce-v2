import { z } from "zod"

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
})

// Registration validation schema
export const registerSchema = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s]{10,}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  role: z.enum(["buyer", "seller"], {
    required_error: "Please select a role",
  }),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

// Profile update schema
export const profileSchema = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s]{10,}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
})

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string()
    .min(1, "Current password is required"),
  new_password: z.string()
    .min(1, "New password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_new_password: z.string()
    .min(1, "Please confirm your new password"),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords don't match",
  path: ["confirm_new_password"],
})
