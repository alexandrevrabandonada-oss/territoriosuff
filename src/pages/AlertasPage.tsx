import { useState, useEffect } from "react";
import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { listStations, type Station } from "../lib/api";

export function AlertasPage() {
    const [status, setStatus] = useState<"default" | "granted" | "denied">("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stations, setStations] = useState<Station[]>([]);

    // Form states
    const [pm25Threshold, setPm25Threshold] = useState(35);
    const [pm10Threshold, setPm10Threshold] = useState<number | "">("");
    const [cooldownMinutes, setCooldownMinutes] = useState(120);
    const [stationCodeFilter, setStationCodeFilter] = useState<string>(""); // empty = "Todas"
    const [quietStart, setQuietStart] = useState("22:00");
    const [quietEnd, setQuietEnd] = useState("07:00");

    const [testLoading, setTestLoading] = useState(false);
    const [testMessage, setTestMessage] = useState<string | null>(null);

    useEffect(() => {
        if ("Notification" in window) {
            setStatus(Notification.permission);
        }

        checkSubscription();
        loadStations();
    }, []);

    async function loadStations() {
        try {
            const data = await listStations();
            setStations(data);
        } catch (err) {
            console.error("Falha ao carregar estacoes:", err);
        }
    }

    async function checkSubscription() {
        if (!("serviceWorker" in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (err) {
            console.error("Erro ao verificar inscrição:", err);
        }
    }

    async function subscribe() {
        setLoading(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();
            setStatus(permission);

            if (permission !== "granted") {
                throw new Error("Permissão negada para notificações.");
            }

            const registration = await navigator.serviceWorker.ready;

            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                throw new Error("Configuração VAPID ausente.");
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey
            });

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-push`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    subscription,
                    user_agent: navigator.userAgent,
                    pm25_threshold: pm25Threshold,
                    pm10_threshold: pm10Threshold === "" ? null : pm10Threshold,
                    cooldown_minutes: cooldownMinutes,
                    station_code_filter: stationCodeFilter || null,
                    quiet_start: quietStart,
                    quiet_end: quietEnd
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Falha ao registrar inscrição no servidor.");
            }

            setIsSubscribed(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao ativar notificações.");
        } finally {
            setLoading(false);
        }
    }

    async function sendTest() {
        setTestLoading(true);
        setTestMessage(null);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_INGEST_API_KEY || "";
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-push`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro no teste.");

            setTestMessage(`Sucesso! Notificações enviadas para ${data.sent} assinantes.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao enviar teste.");
        } finally {
            setTestLoading(false);
        }
    }

    return (
        <section className="portal-stage alerts-stage space-y-8 pb-20 md:space-y-10">
            <SurfaceCard className="portal-stage-hero portal-stage-hero-warm overflow-hidden p-0">
                <div className="portal-stage-hero-inner">
                    <div className="portal-stage-copy">
                        <IconShell tone="warm" className="portal-stage-icon"><span aria-hidden="true">🔔</span></IconShell>
                        <h1>Configurações de alerta</h1>
                        <p>Ajuste critérios para receber notificações de qualidade do ar com foco por estação, limiar e horário silencioso.</p>
                    </div>
                    <div className="portal-stage-stat">
                        <span>{status === "granted" ? "ON" : "OFF"}</span>
                        <small>{status === "granted" ? "monitoramento ativo" : status === "denied" ? "bloqueadas" : "configuração pendente"}</small>
                    </div>
                </div>
            </SurfaceCard>

            <SurfaceCard
                className="portal-alert-panel p-5 md:p-8"
                aria-live="polite"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ciano/10 text-2xl animate-pulse">
                        🔔
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-texto tracking-tight">Estado das Notificações</h2>
                        <p className={`text-xs uppercase tracking-[0.2em] font-black ${status === 'granted' ? 'text-base' : 'text-texto/40'}`}>
                            {status === "granted" ? "Monitoramento Ativo" : status === "denied" ? "Bloqueadas" : "Configuração Pendente"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-acento/50 bg-acento/10 p-4 text-sm text-texto flex items-center gap-3">
                        <span className="text-lg">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {testMessage && (
                    <div className="mb-6 rounded-xl border border-base/50 bg-base/10 p-4 text-sm text-base font-bold flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <span>{testMessage}</span>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Filtro por Estação */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-cta tracking-[0.2em]">Foco de Alerta</h3>
                        <div className="space-y-2">
                            <label htmlFor="station" className="block text-xs font-bold text-texto/60">
                                Monitorar qual estação?
                            </label>
                            <select
                                id="station"
                                value={stationCodeFilter}
                                onChange={(e) => setStationCodeFilter(e.target.value)}
                                className="w-full rounded-xl bg-texto/5 border border-texto/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50 appearance-none"
                                disabled={isSubscribed}
                            >
                                <option value="">Todas as estações</option>
                                {stations.map(s => (
                                    <option key={s.id} value={s.code as string}>{s.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-texto/40">Selecione uma estação específica ou receba alertas de toda a rede.</p>
                        </div>
                    </div>

                    {/* Limiares */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-cta tracking-[0.2em]">Criterios de Poluicão</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="pm25" className="block text-xs font-bold text-texto/60">
                                    Limiar PM2.5 (µg/m³)
                                </label>
                                <input
                                    id="pm25"
                                    type="number"
                                    value={pm25Threshold}
                                    onChange={(e) => setPm25Threshold(Number(e.target.value))}
                                    className="w-full rounded-xl bg-texto/5 border border-texto/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
                                    min="1"
                                    disabled={isSubscribed}
                                />
                                <p className="text-[10px] text-texto/40 italic">Recomendado: 35</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="pm10" className="block text-xs font-bold text-texto/60">
                                    Limiar PM10 (opcional)
                                </label>
                                <input
                                    id="pm10"
                                    type="number"
                                    value={pm10Threshold}
                                    onChange={(e) => setPm10Threshold(e.target.value === "" ? "" : Number(e.target.value))}
                                    placeholder="Desativado"
                                    className="w-full rounded-xl bg-texto/5 border border-texto/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
                                    min="1"
                                    disabled={isSubscribed}
                                />
                                <p className="text-[10px] text-texto/40 text-right">Aviso para particulas maiores.</p>
                            </div>
                        </div>
                    </div>

                    {/* Horário de Silêncio */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-cta tracking-[0.2em]">Modo Silencioso</h3>
                        <div className="grid grid-cols-2 gap-4 rounded-xl bg-texto/5 p-4 border border-texto/5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-texto/40 uppercase">Início</label>
                                <input
                                    type="time"
                                    value={quietStart}
                                    onChange={(e) => setQuietStart(e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold focus:outline-none"
                                    disabled={isSubscribed}
                                />
                            </div>
                            <div className="space-y-1 border-l border-texto/10 pl-4">
                                <label className="text-[10px] font-bold text-texto/40 uppercase">Fim</label>
                                <input
                                    type="time"
                                    value={quietEnd}
                                    onChange={(e) => setQuietEnd(e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold focus:outline-none"
                                    disabled={isSubscribed}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-texto/40">Nenhum alerta será enviado nestas horas (ex: durante o sono).</p>
                    </div>

                    {/* Cooldown */}
                    <div className="space-y-2 pt-4 border-t border-texto/5">
                        <label htmlFor="cooldown" className="block text-xs font-bold text-texto/60">
                            Frequência Máxima (Minutos entre alertas)
                        </label>
                        <input
                            id="cooldown"
                            type="number"
                            value={cooldownMinutes}
                            onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                            className="w-full rounded-xl bg-texto/5 border border-texto/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
                            min="10"
                            disabled={isSubscribed}
                        />
                    </div>

                    {isSubscribed ? (
                        <div className="space-y-4 pt-6">
                            <div className="rounded-xl border border-base/20 bg-base/5 p-6 text-center">
                                <p className="text-sm font-bold text-base flex items-center justify-center gap-2">
                                    <span>🚀</span> Assinatura Configurada e Ativa!
                                </p>
                                <p className="mt-2 text-[10px] text-texto/40 uppercase tracking-widest font-black italic">
                                    {stationCodeFilter ? `Filtro: ${stationCodeFilter}` : "Monitorando: Todas as Estações"}
                                </p>
                            </div>

                            <button
                                className="w-full rounded-xl border border-cta bg-cta/10 py-3 text-xs font-black uppercase tracking-[0.2em] text-cta transition-all hover:bg-cta hover:text-base active:scale-95 disabled:opacity-50"
                                disabled={testLoading}
                                onClick={sendTest}
                            >
                                {testLoading ? "Enviando..." : "Enviar Notificação de Teste"}
                            </button>

                            <p className="text-[10px] text-center text-texto/30 italic">
                                Para alterar as preferências, remova a permissão nas configurações do navegador e reinscreva-se.
                            </p>
                        </div>
                    ) : (
                        <button
                            className="w-full rounded-xl bg-cta py-4 text-sm font-black uppercase tracking-[0.2em] text-base shadow-lg transition-all hover:scale-[1.02] hover:shadow-cta/20 active:scale-[0.98] disabled:opacity-50 mt-6"
                            disabled={loading || status === "denied"}
                            onClick={subscribe}
                        >
                            {loading ? "Salvando Configurações..." : "Confirmar e Ativar Alertas"}
                        </button>
                    )}

                    {status === "denied" && (
                        <div className="rounded-lg bg-acento/5 p-4 text-center">
                            <p className="text-xs text-acento font-medium italic">
                                As notificações foram bloqueadas. Por favor, libere o acesso nas configurações do site (cadeado na barra de endereços).
                            </p>
                        </div>
                    )}
                </div>
            </SurfaceCard>

            <footer className="portal-list-panel rounded-[1.75rem] p-6 text-center text-[11px] leading-relaxed text-text-secondary">
                <p>Configurações avançadas persistidas no navegador via <strong>Push Manager</strong> e sincronizadas anonimamente com o portal.</p>
            </footer>
        </section>
    );
}
