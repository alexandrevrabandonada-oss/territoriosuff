import { RADAR_PUBLIC_INTEREST_PROTOCOL, RADAR_PUBLIC_INTEREST_SUMMARY } from "../../data/air/radar-copy";

type PublicInterestProtocolProps = {
  compact?: boolean;
  className?: string;
};

export function PublicInterestProtocol({ compact = false, className = "" }: PublicInterestProtocolProps) {
  return (
    <section
      className={`rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(135deg,#fffbeb,#ffffff)] p-4 text-amber-950 shadow-[0_18px_38px_-34px_rgba(146,64,14,0.45)] ${className}`}
      aria-labelledby="public-interest-protocol-title"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Protocolo de cautela pública</div>
          <h2 id="public-interest-protocol-title" className="text-base font-black tracking-tight text-amber-950">
            Evidência pública, não laudo causal
          </h2>
          <p className="max-w-4xl text-xs font-semibold leading-relaxed text-amber-900/85">
            {RADAR_PUBLIC_INTEREST_SUMMARY}
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
          leitura responsável
        </div>
      </div>

      {!compact && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {RADAR_PUBLIC_INTEREST_PROTOCOL.map((item) => (
            <div key={item} className="rounded-2xl border border-amber-100 bg-white/80 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-950/85">
              {item}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
