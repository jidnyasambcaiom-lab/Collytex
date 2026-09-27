"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { BlockRenderer } from "@/components/block-renderer";

type Block = { id: string; type: string; content: unknown };
type Section = { id: string; title: string; slug: string; isDefault: boolean; status: "DRAFT" | "PUBLISHED"; blocks: Block[] };
const examples: Record<string, string> = {
  TEXT: '{"text":"Write your information here."}',
  HEADING: '{"text":"Heading"}',
  IMAGE: '{"url":"https://example.edu/image.jpg","title":"Campus"}',
  TABLE: '{"rows":[["Year","Details"],["2026","Add details"]]}',
  DROPDOWN: '{"title":"More information","text":"Details go here."}',
  GRAPH: '{"title":"Data","values":[{"label":"2024","value":0}]}',
  LIST: '{"items":["First item","Second item"]}',
  LINK: '{"url":"https://example.edu","label":"Visit the official page"}',
  DOCUMENT: '{"url":"https://example.edu/document.pdf","title":"Download PDF"}',
};
function previewValue(raw: string, fallback: unknown) {
  try { return JSON.parse(raw) as Prisma.JsonValue; }
  catch { return fallback as Prisma.JsonValue; }
}

export function CourseEditor({ courseId, initialSections }: { courseId: string; initialSections: Section[] }) {
  const [sections, setSections] = useState(initialSections);
  const [title, setTitle] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const router = useRouter();
  async function send(key: string, url: string, method: string, body?: unknown) {
    setBusy(key); setMessages((old) => ({ ...old, [key]: "" }));
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      const result = await response.json();
      if (!response.ok) { setMessages((old) => ({ ...old, [key]: result.error ?? "Unable to save." })); return false; }
      router.refresh(); return true;
    } catch { setMessages((old) => ({ ...old, [key]: "Unable to connect. Please try again." })); return false; }
    finally { setBusy(""); }
  }
  async function addSection() {
    if (!title.trim()) return;
    const ok = await send("add-section", `/api/college/courses/${courseId}/sections`, "POST", { title });
    if (ok) { setTitle(""); router.refresh(); }
  }
  async function addBlock(section: Section) {
    const type = selectedTypes[section.id] ?? "TEXT";
    let content: unknown;
    try { content = JSON.parse(drafts[section.id] ?? examples[type]); }
    catch { setMessages((old) => ({ ...old, [section.id]: "Enter valid JSON content for this block." })); return; }
    await send(section.id, `/api/college/sections/${section.id}/blocks`, "POST", { type, content });
    router.refresh();
  }
  async function updateBlock(section: Section, block: Block) {
    const key = block.id;
    const type = selectedTypes[key] ?? block.type;
    let content: unknown;
    try { content = JSON.parse(drafts[key] ?? JSON.stringify(block.content)); }
    catch { setMessages((old) => ({ ...old, [key]: "Enter valid JSON content for this block." })); return; }
    const ok = await send(key, `/api/college/blocks/${block.id}`, "PATCH", { type, content });
    if (ok) setDrafts((old) => ({ ...old, [key]: JSON.stringify(content, null, 2) }));
    router.refresh();
  }
  async function reorder(section: Section, index: number, direction: -1 | 1) {
    const next = [...section.blocks];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await send(`order-${section.id}`, `/api/college/sections/${section.id}/blocks`, "PATCH", { blockIds: next.map((block) => block.id) }); router.refresh();
  }
  async function togglePublish(section: Section) {
    const ok = await send(`publish-${section.id}`, `/api/college/sections/${section.id}/publish`, "POST", { publish: section.status !== "PUBLISHED" });
    if (ok) setSections((old) => old.map((item) => item.id === section.id ? { ...item, status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } : item));
    router.refresh();
  }
  async function deleteCustom(section: Section) {
    if (section.isDefault) return;
    await send(`delete-${section.id}`, `/api/college/sections/${section.id}/publish`, "DELETE"); router.refresh();
  }
  async function deleteBlock(block: Block) {
    await send(`delete-${block.id}`, `/api/college/blocks/${block.id}`, "DELETE"); router.refresh();
  }

  return <div className="editor-sections"><div className="custom-section-form"><label>Custom section<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: Campus life" maxLength={120} /></label><button className="button button-dark button-small" onClick={addSection} disabled={busy === "add-section"}>Add section +</button></div>{messages["add-section"] && <p className="form-error">{messages["add-section"]}</p>}
    {sections.map((section) => <section className="editor-section" key={section.id}><div className="editor-section-heading"><div><span className={`section-status ${section.status.toLowerCase()}`}>{section.status}</span><h2>{section.title}</h2>{section.isDefault && <small>Default section · title is fixed</small>}</div><div className="editor-section-actions"><button className="button button-light button-small" disabled={!!busy} onClick={() => togglePublish(section)}>{section.status === "PUBLISHED" ? "Unpublish" : "Publish"}</button>{!section.isDefault && <button className="button button-light button-small danger-button" disabled={!!busy} onClick={() => deleteCustom(section)}>Delete</button>}</div></div>{section.blocks.map((block, index) => <article className="block-edit-card" key={block.id}><div className="block-edit-header"><b>{block.type.toLowerCase()}</b><div><button aria-label="Move block up" disabled={index === 0 || !!busy} onClick={() => reorder(section, index, -1)}>↑</button><button aria-label="Move block down" disabled={index === section.blocks.length - 1 || !!busy} onClick={() => reorder(section, index, 1)}>↓</button><button aria-label="Delete block" className="danger-button" disabled={!!busy} onClick={() => deleteBlock(block)}>×</button></div></div><select value={selectedTypes[block.id] ?? block.type} onChange={(event) => setSelectedTypes((old) => ({ ...old, [block.id]: event.target.value }))}>{Object.keys(examples).map((type) => <option key={type} value={type}>{type.toLowerCase()}</option>)}</select><textarea aria-label="Block content as JSON" rows={5} value={drafts[block.id] ?? JSON.stringify(block.content, null, 2)} onChange={(event) => setDrafts((old) => ({ ...old, [block.id]: event.target.value }))} /><button className="button button-light button-small" disabled={!!busy} onClick={() => updateBlock(section, block)}>Save block</button>{messages[block.id] && <p className="form-error">{messages[block.id]}</p>}<details className="block-preview"><summary>Preview content</summary><div className="block-preview-content"><BlockRenderer type={selectedTypes[block.id] ?? block.type} content={previewValue(drafts[block.id] ?? JSON.stringify(block.content), block.content)} /></div></details></article>)}<div className="add-block-row"><select aria-label={`Block type for ${section.title}`} value={selectedTypes[section.id] ?? "TEXT"} onChange={(event) => { const type = event.target.value; setSelectedTypes((old) => ({ ...old, [section.id]: type })); setDrafts((old) => ({ ...old, [section.id]: examples[type] })); }}>{Object.keys(examples).map((type) => <option key={type} value={type}>{type.toLowerCase()}</option>)}</select><textarea aria-label={`New ${section.title} content`} rows={3} value={drafts[section.id] ?? examples[selectedTypes[section.id] ?? "TEXT"]} onChange={(event) => setDrafts((old) => ({ ...old, [section.id]: event.target.value }))} /><button className="button button-dark button-small" disabled={!!busy} onClick={() => addBlock(section)}>Add block +</button></div>{messages[section.id] && <p className="form-error">{messages[section.id]}</p>}</section>)}
  </div>;
}
