import { useEffect, useMemo, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

type AqiChartPoint = {
  ts: string;
  value: number | null;
};

type AqiChartProps = {
  data: AqiChartPoint[];
};

const CHART_COLOR = "#005daa"; // Brand primary blue
const AXIS_COLOR = "#64748b";
const GRID_COLOR = "rgba(148, 163, 184, 0.1)";

function parseTimestampSeconds(value: string): number | null {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return ts / 1000;
}

function formatTooltipDate(value: number) {
  return new Date(value * 1000).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatAxisDate(value: number) {
  return new Date(value * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
}

export function AqiChart({ data }: AqiChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);

  const alignedData = useMemo<uPlot.AlignedData>(() => {
    const rows = data
      .map((row) => {
        const ts = parseTimestampSeconds(row.ts);
        if (ts === null) return null;
        return [ts, row.value] as const;
      })
      .filter((row): row is readonly [number, number | null] => row !== null)
      .sort((a, b) => a[0] - b[0]);

    return [
      rows.map((row) => row[0]),
      rows.map((row) => row[1])
    ];
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;

    if (!container || !tooltip) return;

    plotRef.current?.destroy();
    plotRef.current = null;

    if (alignedData[0].length === 0) {
      tooltip.style.display = "none";
      return;
    }

    const showTooltip = (text: string, left: number, top: number) => {
      const maxLeft = Math.max(0, container.clientWidth - 200);
      const maxTop = Math.max(0, container.clientHeight - 80);
      tooltip.textContent = text;
      tooltip.style.display = "block";
      tooltip.style.left = `${Math.min(left, maxLeft)}px`;
      tooltip.style.top = `${Math.min(top, maxTop)}px`;
    };

    const hideTooltip = () => {
      tooltip.style.display = "none";
    };

    const chart = new uPlot(
      {
        width: container.clientWidth,
        height: 260,
        legend: { show: false },
        cursor: {
          drag: { x: false, y: false },
          points: { show: false }
        },
        scales: {
          x: { time: true },
          y: { auto: true }
        },
        axes: [
          {
            stroke: AXIS_COLOR,
            grid: { stroke: GRID_COLOR, width: 1 },
            values: (_, ticks) => ticks.map(formatAxisDate),
            size: 40,
            space: 60
          },
          {
            stroke: AXIS_COLOR,
            grid: { stroke: GRID_COLOR, width: 1 },
            values: (_, ticks) => ticks.map((val) => val.toFixed(0)),
            size: 44,
            space: 40
          }
        ],
        series: [
          {},
          {
            label: "Índice IQAr",
            stroke: CHART_COLOR,
            width: 2.5,
            points: { show: false },
            spanGaps: true
          }
        ],
        hooks: {
          setCursor: [
            (u) => {
              const idx = u.cursor.idx;
              if (idx == null || idx < 0) {
                hideTooltip();
                return;
              }

              const x = u.data[0][idx];
              const value = u.data[1][idx];
              if (typeof x !== "number" || value == null) {
                hideTooltip();
                return;
              }

              showTooltip(
                `${formatTooltipDate(x)}\nIQAr: ${value.toFixed(0)}`,
                (u.cursor.left ?? 0) + u.bbox.left + 12,
                (u.cursor.top ?? 0) + u.bbox.top + 12
              );
            }
          ]
        }
      },
      alignedData,
      container
    );

    plotRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      const instance = plotRef.current;
      const node = containerRef.current;
      if (!instance || !node) return;
      instance.setSize({ width: node.clientWidth, height: 260 });
    });

    resizeObserver.observe(container);
    container.addEventListener("mouseleave", hideTooltip);

    return () => {
      container.removeEventListener("mouseleave", hideTooltip);
      resizeObserver.disconnect();
      chart.destroy();
      plotRef.current = null;
    };
  }, [alignedData]);

  if (alignedData[0].length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle bg-slate-50/50 p-8 text-center text-sm text-slate-400 italic">
        Sem dados de série suficientes para exibir o gráfico.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[260px] w-full overflow-hidden rounded-lg">
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 hidden max-w-[200px] rounded-xl border border-slate-200/50 bg-white/95 px-3 py-2 text-xs leading-relaxed text-slate-800 shadow-xl backdrop-blur-md whitespace-pre-line"
      />
    </div>
  );
}
