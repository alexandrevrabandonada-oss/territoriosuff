import { useEffect, useMemo, useRef } from "react";

import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

type MeasurementsChartPoint = {
  ts: string;
  pm25: number | null;
  pm10: number | null;
  temp?: number | null;
  humidity?: number | null;
};

type MeasurementsChartProps = {
  data: MeasurementsChartPoint[];
  showPM25: boolean;
  showPM10: boolean;
  showTemp: boolean;
  showHumidity: boolean;
};

const PM25_COLOR = "#10b981";
const PM10_COLOR = "#f59e0b";
const TEMP_COLOR = "#ef4444";
const HUMIDITY_COLOR = "#3b82f6";
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
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatAxisValue(value: number) {
  return value.toFixed(0);
}

export function MeasurementsChart({ data, showPM25, showPM10, showTemp, showHumidity }: MeasurementsChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);

  const alignedData = useMemo<uPlot.AlignedData>(() => {
    const rows = data
      .map((row) => {
        const ts = parseTimestampSeconds(row.ts);
        if (ts === null) return null;
        return [ts, row.pm25, row.pm10, row.temp ?? null, row.humidity ?? null] as const;
      })
      .filter((row): row is readonly [number, number | null, number | null, number | null, number | null] => row !== null)
      .sort((a, b) => a[0] - b[0]);

    return [
      rows.map((row) => row[0]),
      rows.map((row) => row[1]),
      rows.map((row) => row[2]),
      rows.map((row) => row[3]),
      rows.map((row) => row[4])
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
      const maxLeft = Math.max(0, container.clientWidth - 240);
      const maxTop = Math.max(0, container.clientHeight - 120);
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
        height: 300,
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
            size: 54,
            space: 70
          },
          {
            stroke: AXIS_COLOR,
            grid: { stroke: GRID_COLOR, width: 1 },
            values: (_, ticks) => ticks.map(formatAxisValue),
            size: 48,
            space: 50
          }
        ],
        series: [
          {},
          {
            label: "PM2.5",
            stroke: PM25_COLOR,
            width: 2.2,
            show: showPM25,
            points: { show: false },
            spanGaps: true
          },
          {
            label: "PM10",
            stroke: PM10_COLOR,
            width: 2.2,
            show: showPM10,
            points: { show: false },
            spanGaps: true
          },
          {
            label: "Temp",
            stroke: TEMP_COLOR,
            width: 2.2,
            show: showTemp,
            points: { show: false },
            spanGaps: true
          },
          {
            label: "Umid",
            stroke: HUMIDITY_COLOR,
            width: 2.2,
            show: showHumidity,
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
              if (typeof x !== "number") {
                hideTooltip();
                return;
              }

              const lines = [formatTooltipDate(x)];
              if (showPM25) {
                const value = u.data[1][idx];
                if (typeof value === "number") {
                  lines.push(`PM2.5: ${value.toFixed(1)} µg/m³`);
                }
              }
              if (showPM10) {
                const value = u.data[2][idx];
                if (typeof value === "number") {
                  lines.push(`PM10: ${value.toFixed(1)} µg/m³`);
                }
              }
              if (showTemp) {
                const value = u.data[3][idx];
                if (typeof value === "number") {
                  lines.push(`Temp: ${value.toFixed(1)} °C`);
                }
              }
              if (showHumidity) {
                const value = u.data[4][idx];
                if (typeof value === "number") {
                  lines.push(`Umid: ${value.toFixed(1)} %`);
                }
              }

              showTooltip(
                lines.join("\n"),
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
      instance.setSize({ width: node.clientWidth, height: 300 });
    });

    resizeObserver.observe(container);
    container.addEventListener("mouseleave", hideTooltip);

    return () => {
      container.removeEventListener("mouseleave", hideTooltip);
      resizeObserver.disconnect();
      chart.destroy();
      plotRef.current = null;
    };
  }, [alignedData, showPM10, showPM25, showTemp, showHumidity]);

  if (alignedData[0].length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-secondary">
        Sem dados de série suficientes para desenhar o gráfico.
      </div>
    );
  }

  if (!showPM25 && !showPM10 && !showTemp && !showHumidity) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-secondary">
        Selecione ao menos uma série para visualizar o gráfico.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[300px] w-full overflow-hidden rounded-lg">
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 hidden max-w-[240px] rounded-xl border border-slate-200/50 bg-white/95 dark:bg-slate-950/95 dark:border-slate-800 px-3.5 py-2.5 text-[11px] leading-relaxed text-text-primary shadow-xl backdrop-blur-md whitespace-pre-line"
      />
    </div>
  );
}
