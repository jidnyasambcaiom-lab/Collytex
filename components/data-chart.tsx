"use client";

import { useEffect, useRef } from "react";
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip, Legend);

type Series = { label: string; data: Array<number | null> };

export function DataChart({ labels, datasets, kind = "bar", ariaLabel }: { labels: string[]; datasets: Series[]; kind?: "bar" | "line"; ariaLabel: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const instance = useRef<Chart<"bar" | "line", Array<number | null>, string> | null>(null);
  useEffect(() => {
    if (!canvas.current) return;
    instance.current?.destroy();
    instance.current = new Chart(canvas.current, {
      type: kind,
      data: { labels, datasets: datasets.map((dataset, index) => ({ ...dataset, backgroundColor: index % 2 === 0 ? "#78936a" : "#d3a684", borderColor: index % 2 === 0 ? "#56744f" : "#bd8868", borderWidth: 1.5, borderRadius: kind === "bar" ? 2 : 0, tension: 0.25, pointRadius: 3 })) },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: datasets.length > 1, position: "bottom" }, tooltip: { enabled: true } }, scales: { y: { beginAtZero: true, grid: { color: "#ecece5" }, ticks: { color: "#76827a" } }, x: { grid: { display: false }, ticks: { color: "#76827a" } } } },
    });
    return () => { instance.current?.destroy(); instance.current = null; };
  }, [datasets, kind, labels]);
  return <div className="chart-frame" role="img" aria-label={ariaLabel}><canvas ref={canvas} /></div>;
}
