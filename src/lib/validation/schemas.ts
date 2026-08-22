import { z } from "zod";
import { LOCALES } from "@/i18n/locales";

export const newsCategorySchema = z.enum([
  "all",
  "wc26",
  "pl",
  "world-cup",
  "premier-league",
]);

export const videoCategorySchema = z.enum([
  "all",
  "pl",
  "premier-league",
  "wc",
  "world-cup",
]);

export const newsCategoryQuerySchema = z.object({
  category: newsCategorySchema.optional().default("all"),
  /** When true, strip WC26 partner RSS before response (homepage hard gate). */
  excludeWc26: z
    .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
    .optional()
    .transform((value) => value === "1" || value === "true"),
});

export const videoCategoryQuerySchema = z.object({
  category: videoCategorySchema.optional().default("all"),
  limit: z.coerce.number().int().min(1).max(24).optional(),
});

export const apiFixtureIdQuerySchema = z.object({
  apiFixtureId: z.coerce.number().int().positive().optional(),
});

export const emptyQuerySchema = z.object({}).strict();

export const debugEndpointQuerySchema = z.object({
  endpoint: z.enum(["topscorers", "events", "fixtures"]),
});

export const wc26ScoresQuerySchema = z.object({
  live: z.string().optional(),
  results: z.string().optional(),
});

export const wc26FixturesQuerySchema = z.object({
  status: z.string().optional(),
});

export const wc26KnockoutFixturesQuerySchema = z.object({
  round: z.string().optional(),
});

export const unlStandingsQuerySchema = z.object({
  group: z.string().optional(),
});

export const fixtureIdParamSchema = z
  .string()
  .min(1)
  .transform((raw) => Number.parseInt(decodeURIComponent(raw), 10))
  .refine((id) => Number.isFinite(id) && id > 0, "Invalid fixture id.");

export const wc26FixtureIdSchema = z
  .string()
  .min(1)
  .regex(/^fixture-\d{3}$/i, "Expected fixture-NNN format.");

const favouriteTeamKeySchema = z.string().trim().min(1).max(120);

export const fcmTokenBodySchema = z.object({
  token: z.string().trim().min(1, "FCM token is required."),
  locale: z.enum(LOCALES).optional(),
  // Application layer requires a verified idToken (BE-007); optional here so
  // missing tokens return 401 via requireFcmIdToken rather than 400 Zod.
  idToken: z.string().trim().min(1).optional(),
  teamKeys: z.array(favouriteTeamKeySchema).max(64).optional().default([]),
  previousTeamKeys: z.array(favouriteTeamKeySchema).max(64).optional().default([]),
});

export type FcmTokenBody = z.infer<typeof fcmTokenBodySchema>;
