import { z } from "zod";

export const projectConfigSchema = z.object({
  schema: z.string().default("test-driven"),
  context: z.string().optional(),
  rules: z
    .record(z.string(), z.array(z.string()))
    .optional(),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const artifactSchema = z.object({
  id: z.string(),
  generates: z.string(),
  description: z.string(),
  template: z.string().optional(),
  instruction: z.string().optional(),
  requires: z.array(z.string()).default([]),
});

export type Artifact = z.infer<typeof artifactSchema>;

export const applyConfigSchema = z.object({
  requires: z.array(z.string()),
  tracks: z.string(),
  instruction: z.string().optional(),
});

export const schemaDefinitionSchema = z.object({
  name: z.string(),
  version: z.number().default(1),
  description: z.string().optional(),
  artifacts: z.array(artifactSchema),
  apply: applyConfigSchema.optional(),
});

export type SchemaDefinition = z.infer<typeof schemaDefinitionSchema>;

export const changeMetaSchema = z.object({
  schema: z.string(),
  created: z.string(),
  name: z.string(),
});

export type ChangeMeta = z.infer<typeof changeMetaSchema>;
