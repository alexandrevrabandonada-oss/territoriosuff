import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SurfaceCard, Chip } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import { listStations } from "../lib/api/monitoring";
import type { Station } from "../lib/api/core";

export function AlertasPage() {
    const [status, setStatus] = useState<"default" | "granted" | "denied">("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [stations, setStations] = useState<Station[]>([]);

    // Form states
    const [pm25Threshold, setPm25Threshold] = useState(35);
    const [pm10Threshold, setPm10Threshold] = useState<number | "">("");
    const [cooldownMinutes, setCooldownMinutes] = useState(120);
    const [stationCodeFilter, setStationCodeFilter] = useState<string>(""); // empty = "Todas"
    const [quietStart, setQuietStart] = useState("22:00");
    const [quietEnd, setQuietEnd] = useState("07:00");

    useEffect(() => {
        if ("Notification" in window) {
            setStatus(Notification.permission);
        }

        // Load persisted settings if any
        const savedSettings = localStorage.getItem("semear_alert_settings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setPm25Threshold(parsed.pm25Threshold ?? 35);
                setPm10Threshold(parsed.pm10Threshold ?? "");
                setCooldownMinutes(parsed.cooldownMinutes ?? 120);
                setStationCodeFilter(parsed.stationCodeFilter ?? "");
                setQuietStart(parsed.quietStart ?? "22:00");
                setQuietEnd(parsed.quietEnd ?? "07:00");
                setIsSubscribed(parsed.isSubscribed ?? false);
            } catch (e) {
                console.error("Erro ao carregar preferências locais:", e);
            }
        }

        checkSubscription();
        loadStations();
    }, []);

    async function loadStations() {
        try {
            const data = await listStations();
            setStations(data);
        } catch (err) {
            console.error("Falha ao carregar estações:", err);
        }
    }

    async function checkSubscription() {
        if (!("serviceWorker" in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            // If service worker subscription exists, prioritize that
            if (subscription) {
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Erro ao verificar inscrição push:", err);
        }
    }

    async function saveSettingsLocally(subscribedState: boolean) {
        const settings = {
            pm25Threshold,
            pm10Threshold,
            cooldownMinutes,
            stationCodeFilter,
            quietStart,
            quietEnd,
            isSubscribed: subscribedState,
        };
        localStorage.setItem("semear_alert_settings", JSON.stringify(settings));
    }

    async function subscribe() {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (!("Notification" in window)) {
                throw new Error("Este dispositivo não suporta notificações do sistema.");
            }

            const permission = await Notification.requestPermission();
            setStatus(permission);

            if (permission !== "granted") {
                throw new Error("Permissão de notificação negada pelo navegador.");
            }

            // In dev environment, VAPID might be missing, so we support local-only subscription as fallback
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (vapidKey && supabaseUrl && supabaseAnonKey && "serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKey
                });

                const response = await fetch(`${supabaseUrl}/functions/v1/register-push`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${supabaseAnonKey}`
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
            }

            setIsSubscribed(true);
            await saveSettingsLocally(true);
            setSuccessMessage("Configurações de alerta salvas e ativas com sucesso!");
        } catch (err) {
            // If remote push infrastructure is not configured, keep preferences local without emitting fake alerts.
            if (err instanceof Error && err.message.includes("VAPID")) {
                setIsSubscribed(true);
                await saveSettingsLocally(true);
                setSuccessMessage("Preferências salvas neste dispositivo. O envio remoto será ativado quando a infraestrutura de push estiver configurada.");
            } else {
                setError(err instanceof Error ? err.message : "Erro ao ativar notificações.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function unsubscribe() {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if ("serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
            }
            setIsSubscribed(false);
            await saveSettingsLocally(false);
            setSuccessMessage("Alertas desativados. Suas preferências locais foram salvas.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao remover inscrição.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <PortalPageShell className="alerts-stage pb-20">
            <a href="#alerts-form" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-primary/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-brand-primary shadow-sm shadow-brand-primary/5 focus:fixed focus:left-4 focus:top-4 focus:z-50">
                Pular cabeçalho e ir para o formulário
            </a>

            <PortalHero
                badge={<span className="badge-dados-abertos">Alerta cidadão</span>}
                title="Central de Alertas"
                subtitle="Configure notificações push no seu smartphone ou computador para receber avisos imediatos quando a qualidade do ar ultrapassar os limiares recomendados."
                tone="warm"
                metrics={
                    <>
                        <div className="portal-kpi-card">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Status</p>
                            <p className="mt-2 text-3xl font-black text-brand-primary">{status === "granted" ? "ATIVO" : "OFF"}</p>
                            <p className="mt-1 text-sm text-text-secondary">{status === "granted" ? "permissão concedida" : status === "denied" ? "notificações bloqueadas" : "não configurado"}</p>
                        </div>
                        <div className="portal-kpi-card">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Modo</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Chip tone="seed">Notificações Push</Chip>
                                <Chip tone="active">PWA Offline</Chip>
                            </div>
                            <p className="mt-2 text-sm text-text-secondary">sincronização local com opção de registro remoto</p>
                        </div>
                    </>
                }
                aside={
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-white/30 bg-white/75 p-4 shadow-sm backdrop-blur">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary/70">Como funciona</p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                Configure limiares e acompanhe sinais recentes do sistema sem sair da página. O portal não exibe alertas artificiais.
                            </p>
                        </div>
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-3">
                {/* CONFIGURATION FORM */}
                <div className="md:col-span-2">
                    <div id="alerts-form">
                        <SurfaceCard className="portal-alert-panel p-6 md:p-8">
                            <PortalSectionHeader
                                eyebrow="Passo 1"
                                title="Preferências de disparo"
                                subtitle="Defina quando e como o sistema deve alertar você."
                            />

                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-xs text-red-600 dark:text-red-400 flex items-start gap-3" role="alert">
                                <span className="text-sm">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-3" role="status">
                                <span className="text-sm">✅</span>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Station selector */}
                            <div className="space-y-2">
                                <label htmlFor="station-select" className="block text-xs font-bold text-text-primary/75">
                                    Monitorar qual área / estação?
                                </label>
                                <div className="relative">
                                    <select
                                        id="station-select"
                                        value={stationCodeFilter}
                                        onChange={(e) => setStationCodeFilter(e.target.value)}
                                        className="w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-primary"
                                        disabled={isSubscribed}
                                    >
                                        <option value="">Todas as estações (Alerta Geral)</option>
                                        {stations.map(s => (
                                            <option key={s.id} value={s.code as string}>{s.name} ({(s.bairro as string) || "Região"})</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-[10px] text-text-secondary">Você pode escolher focar em apenas uma estação próxima à sua residência ou trabalho.</p>
                            </div>

                            {/* Thresholds */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="pm25-threshold" className="block text-xs font-bold text-text-primary/75">
                                        Limiar PM2.5 (µg/m³)
                                    </label>
                                    <input
                                        id="pm25-threshold"
                                        type="number"
                                        value={pm25Threshold}
                                        onChange={(e) => setPm25Threshold(Number(e.target.value))}
                                        className="w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-primary"
                                        min="5"
                                        max="150"
                                        disabled={isSubscribed}
                                    />
                                    <p className="text-[10px] text-text-secondary">Padrão da OMS: acima de 15 µg/m³ em 24h.</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="pm10-threshold" className="block text-xs font-bold text-text-primary/75">
                                        Limiar PM10 (µg/m³)
                                    </label>
                                    <input
                                        id="pm10-threshold"
                                        type="number"
                                        value={pm10Threshold}
                                        onChange={(e) => setPm10Threshold(e.target.value === "" ? "" : Number(e.target.value))}
                                        placeholder="Monitorar apenas PM2.5"
                                        className="w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-primary"
                                        min="10"
                                        max="300"
                                        disabled={isSubscribed}
                                    />
                                    <p className="text-[10px] text-text-secondary">Opcional. Partículas inaláveis grossas.</p>
                                </div>
                            </div>

                            {/* Quiet Mode */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-text-primary/75">
                                    Período de Silêncio (Evitar alertas à noite)
                                </label>
                                <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 p-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mb-1">Início</span>
                                        <input
                                            type="time"
                                            value={quietStart}
                                            onChange={(e) => setQuietStart(e.target.value)}
                                            className="bg-transparent text-sm font-semibold text-text-primary focus:outline-none"
                                            disabled={isSubscribed}
                                        />
                                    </div>
                                    <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 pl-4">
                                        <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mb-1">Término</span>
                                        <input
                                            type="time"
                                            value={quietEnd}
                                            onChange={(e) => setQuietEnd(e.target.value)}
                                            className="bg-transparent text-sm font-semibold text-text-primary focus:outline-none"
                                            disabled={isSubscribed}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-text-secondary">Bloqueia notificações no período selecionado (ex: durante o horário de sono).</p>
                            </div>

                            {/* Cooldown */}
                            <div className="space-y-2">
                                <label htmlFor="cooldown-input" className="block text-xs font-bold text-text-primary/75">
                                    Intervalo mínimo entre notificações (minutos)
                                </label>
                                <input
                                    id="cooldown-input"
                                    type="number"
                                    value={cooldownMinutes}
                                    onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                                    className="w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-primary"
                                    min="15"
                                    disabled={isSubscribed}
                                />
                                <p className="text-[10px] text-text-secondary">Evita disparos repetidos caso a qualidade oscile em torno do limiar.</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                                {isSubscribed ? (
                                    <>
                                        <div className="flex-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 text-center flex items-center justify-center">
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                Alertas Ativos com Sucesso
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={unsubscribe}
                                            disabled={loading}
                                            className="px-6 py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors"
                                        >
                                            Desativar Alertas
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={subscribe}
                                        disabled={loading || status === "denied"}
                                        className="w-full py-3.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-dark font-black uppercase tracking-widest text-xs shadow-md hover:shadow-lg transition-all"
                                    >
                                        {loading ? "Processando..." : "Confirmar e Ativar Alertas"}
                                    </button>
                                )}
                            </div>

                            {status === "denied" && (
                                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 p-4 text-center" role="alert">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-normal">
                                        🚨 <strong>Notificações Bloqueadas:</strong> Por favor, clique no ícone de configurações de permissão (cadeado na barra de endereços) do navegador e altere o status de Notificações para "Permitir".
                                    </p>
                                </div>
                            )}
                        </div>
                    </SurfaceCard>
                </div>
            </div>

                <div className="space-y-6">
                    <SurfaceCard className="portal-list-panel p-6">
                        <PortalSectionHeader
                            eyebrow="Transparência operacional"
                            title="Alertas públicos reais"
                            subtitle="Esta área exibirá somente comunicados operacionais ou ocorrências auditáveis quando o serviço estiver ativo."
                        />
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-text-secondary">
                            Nenhum alerta público auditado está publicado neste momento. Enquanto não houver ocorrência validada, o portal mantém esta seção em estado vazio para evitar ruído informacional.
                        </div>

                        <Link 
                            to="/transparencia" 
                            className="text-[10px] font-bold text-brand-primary hover:underline block text-center mt-4 uppercase tracking-wider"
                        >
                            Ver relatórios e médias históricas →
                        </Link>
                    </SurfaceCard>
                </div>
            </div>

            <footer className="portal-list-panel rounded-[1.75rem] p-6 text-center text-[11px] leading-relaxed text-text-secondary">
                <p>Configurações avançadas persistidas no navegador via <strong>Push Manager</strong> e sincronizadas anonimamente com o portal.</p>
            </footer>
        </PortalPageShell>
    );
}
