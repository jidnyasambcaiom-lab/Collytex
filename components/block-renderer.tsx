"use client";

import type { Prisma } from "@prisma/client";
import { DataChart } from "@/components/data-chart";

function record(value: Prisma.JsonValue): Record<string, Prisma.JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, Prisma.JsonValue> : {};
}
function string(value: Prisma.JsonValue | undefined, fallback = "") { return typeof value === "string" ? value : fallback; }
function list(value: Prisma.JsonValue | undefined) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function safeLink(value: string) { try { const url = new URL(value, "https://collytex.local"); return url.protocol === "https:" || url.protocol === "http:" ? url.href : "#"; } catch { return "#"; } }

export function BlockRenderer({ type, content }: { type: string; content: Prisma.JsonValue }) {
  const data = record(content);
  if (type === "HEADING") return <h3 className="content-heading">{string(data.text)}</h3>;
  if (type === "TEXT") return <p className="content-text">{string(data.text)}</p>;
  if (type === "LIST") return <ul className="content-list">{list(data.items).map((item, index) => <li key={`${index}-${item.slice(0, 20)}`}>{item}</li>)}</ul>;
  if (type === "LINK") { const href = safeLink(string(data.url)); return <a className="content-link" href={href} target="_blank" rel="noreferrer">{string(data.label, "Open link")} ↗</a>; }
  if (type === "IMAGE" || type === "DOCUMENT") { const href = safeLink(string(data.url)); return <a className="content-link" href={href} target="_blank" rel="noreferrer">{string(data.title, type === "IMAGE" ? "View image" : "Open document / PDF")} ↗</a>; }
  if (type === "TABLE") {
    const rows = Array.isArray(data.rows) ? data.rows.filter((row): row is Prisma.JsonArray => Array.isArray(row)) : [];
    return <div className="content-table-wrap"><table className="content-table"><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{typeof cell === "string" || typeof cell === "number" ? cell : ""}</td>)}</tr>)}</tbody></table></div>;
  }
  if (type === "DROPDOWN") return <details className="content-dropdown"><summary>{string(data.title, "More information")}</summary><p>{string(data.text)}</p></details>;
  if (type === "GRAPH") {
    const values = Array.isArray(data.values) ? data.values.flatMap((value) => { const row = record(value); return typeof row.label === "string" && typeof row.value === "number" && Number.isFinite(row.value) ? [{ label: row.label, value: row.value }] : []; }) : [];
    return <div className="content-graph">{string(data.title) && <h4>{string(data.title)}</h4>}<DataChart labels={values.map((item) => item.label)} datasets={[{ label: string(data.title, "Value"), data: values.map((item) => item.value) }]} ariaLabel={string(data.title, "Data graph")} /></div>;
  }
  return null;
}
