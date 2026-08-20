import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export const registerSchema = z.object({
    displayName: z.string().trim().min(1, { message: "Display name is required" }),
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }).max(100, { message: "Password must be at most 100 characters long" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;