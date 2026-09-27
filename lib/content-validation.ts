import { z } from "zod";

const url = z.string().url().max(2000).refine((value) => value.startsWith("https://") || value.startsWith("http://"), "URL must use HTTP or HTTPS");
const schemaByType = {
  TEXT: z.object({ text: z.string().trim().max(20_000) }).strict(),
  HEADING: z.object({ text: z.string().trim().min(1).max(200) }).strict(),
  IMAGE: z.object({ url, title: z.string().trim().max(200).optional() }).strict(),
  TABLE: z.object({ rows: z.array(z.array(z.string().max(1000)).min(1).max(20)).min(1).max(100) }).strict(),
  DROPDOWN: z.object({ title: z.string().trim().min(1).max(200), text: z.string().trim().max(10_000) }).strict(),
  GRAPH: z.object({ title: z.string().trim().max(200).optional(), values: z.array(z.object({ label: z.string().trim().min(1).max(100), value: z.number().finite().min(0).max(1_000_000_000) }).strict()).min(1).max(50) }).strict(),
  LIST: z.object({ items: z.array(z.string().trim().min(1).max(1000)).min(1).max(100) }).strict(),
  LINK: z.object({ url, label: z.string().trim().min(1).max(200) }).strict(),
  DOCUMENT: z.object({ url, title: z.string().trim().min(1).max(200) }).strict(),
};

export type ContentBlockType = keyof typeof schemaByType;
export function validateBlockContent(type: ContentBlockType, value: unknown) {
  return schemaByType[type].safeParse(value);
}

export function isBlockType(value: string): value is ContentBlockType {
  return Object.hasOwn(schemaByType, value);
}
