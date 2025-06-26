
import { z } from "zod";

// User profile validation
export const userProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50, "First name too long"),
  last_name: z.string().max(50, "Last name too long").optional(),
  phone_number: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number").optional(),
  telegram_id: z.string().regex(/^\d+$/, "Invalid Telegram ID").optional(),
  status: z.enum(["active", "inactive", "suspended"]),
  subscription_plan: z.enum(["free", "premium", "enterprise"]),
  is_premium: z.boolean(),
});

// Chat message validation
export const chatMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
  role: z.enum(["user", "assistant", "system"]),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().max(100, "Search query too long"),
});

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(content: string): string {
  return content
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validate and sanitize user input
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const validated = schema.parse(data);
  
  // Recursively sanitize string fields
  if (typeof validated === 'object' && validated !== null) {
    const sanitized = { ...validated };
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        (sanitized as any)[key] = sanitizeHtml(value);
      }
    }
    return sanitized;
  }
  
  return validated;
}
