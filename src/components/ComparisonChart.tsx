import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

type ComparisonChartProps = {
  data: uPlot.AlignedData; // [timestamps, val1, val2, ...]
  stationSeries: {
    label: string;
    stroke: string;
    show: boolean;
  }[];
  metricUnit: string;
};

const AXIS_COLOR = "#64748b";
const GRID_COLOR = "rgba(148, 163, 184, 0.1)";

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

export function ComparisonChart({ data, stationSeries, metricUnit }: ComparisonChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;

    if (!container || !tooltip) return;

    plotRef.current?.destroy();
    plotRef.current = null;

    if (!data || data[0].length === 0) {
      tooltip.style.display = "none";
      return;
    }

    const showTooltip = (text: string, left: number, top: number) => {
      const maxLeft = Math.max(0, container.clientWidth - 240);
      const maxTop = Math.max(0, container.clientHeight - 150);
      tooltip.textContent = text;
      tooltip.style.display = "block";
      tooltip.style.left = `${Math.min(left, maxLeft)}px`;
      tooltip.style.top = `${Math.min(top, maxTop)}px`;
    };

    const hideTooltip = () => {
      tooltip.style.display = "none";
    };

    // Build series configuration
    const uPlotSeries: uPlot.Series[] = [
      {} // Time scale series (always index 0)
    ];

    stationSeries.forEach((s) => {
      uPlotSeries.push({
        label: s.label,
        stroke: s.stroke,
        width: 2.5,
        show: s.show,
        points: { show: false },
        spanGaps: true
      });
    });

    const chart = new uPlot(
      {
        width: container.clientWidth,
        height: 320,
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
            space: 50,
            label: metricUnit
          }
        ],
        series: uPlotSeries,
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
              
              // Add values for each active series
              for (let i = 1; i < u.series.length; i++) {
                const s = u.series[i];
                if (s.show) {
                  const val = u.data[i][idx];
                  if (typeof val === "number") {
                    lines.push(`■ ${s.label}: ${val.toFixed(1)} ${metricUnit}`);
                  } else {
                    lines.push(`■ ${s.label}: --`);
                  }
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
      data,
      container
    );

    plotRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      const instance = plotRef.current;
      const node = containerRef.current;
      if (!instance || !node) return;
      instance.setSize({ width: node.clientWidth, height: 320 });
    });

    resizeObserver.observe(container);
    container.addEventListener("mouseleave", hideTooltip);

    return () => {
      container.removeEventListener("mouseleave", hideTooltip);
      resizeObserver.disconnect();
      chart.destroy();
      plotRef.current = null;
    };
  }, [data, stationSeries, metricUnit]);

  return (
    <div ref={containerRef} className="relative h-[320px] w-full overflow-hidden rounded-xl bg-white/40 dark:bg-slate-900/40 p-1">
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 hidden max-w-[240px] rounded-xl border border-slate-200/50 bg-white/95 dark:bg-slate-950/95 dark:border-slate-800 px-3.5 py-2.5 text-[11px] leading-relaxed text-text-primary shadow-xl backdrop-blur-md whitespace-pre-line"
      />
    </div>
  );
}
