import { z } from 'zod';
import type { Database } from '@/types/database';

// Base Schemas
const BaseProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']),
  visibility: z.enum(['public', 'private', 'team_only']),
  tech_stack: z.array(z.string()),
  required_skills: z.array(z.string()),
  engineering_domain: z.enum(['biotechnology', 'computer', 'mechanical', 'electrical'])
});

const BaseProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1),
  avatar_url: z.string().url().nullable(),
  skills: z.array(z.string()).optional()
});

// Extended Schemas
export const ProjectSchema = BaseProjectSchema.extend({
  domains: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      icon: z.string()
    })
  ).optional(),
  team_count: z.number().int().nonnegative().optional()
});

export const AIAlertSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  message: z.string().min(1),
  type: z.enum(['deadline', 'resource', 'collaboration', 'skill_gap']),
  priority: z.number().int().min(1).max(10),
  created_at: z.string().datetime()
});

// Validation Functions
export const validateProjects = (data: unknown) => {
  return ProjectSchema.array().parse(data);
};

export const validateAIAlerts = (data: unknown) => {
  return AIAlertSchema.array().parse(data);
};

export const validateProfile = (data: unknown) => {
  return BaseProfileSchema.parse(data);
};

// Response Validators
export const validateSupabaseResponse = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    data: schema.nullable(),
    error: z.object({
      message: z.string()
    }).nullable()
  });
};

// Usage example:
// const projectResponseValidator = validateSupabaseResponse(ProjectSchema);