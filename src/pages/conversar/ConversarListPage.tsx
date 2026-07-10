import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { PortalEmptyState, PortalHero, PortalPageShell, PortalSectionHeader } from "../../components/portal";
import { InstagramEmbed } from "../../components/InstagramEmbed";
import { Conversation, listConversations, createEnvironmentalReport } from "../../lib/api";

export function ConversarListPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await listConversations();
                setConversations(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar rodas de conversa");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center" role="status" aria-live="polite">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-700">Carregando conversas e atividades…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-error">{error}</p>
                <button
                    className="mt-4 text-brand-primary underline"
                    onClick={() => window.location.reload()}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    const activities = conversations.filter((item) => item.meta?.kind === "activity");
    const conversationTopics = conversations.filter((item) => item.meta?.kind !== "activity");

    return (
        <PortalPageShell>
            <PortalHero
                tone="seed"
                badge={<span className="badge-dados-abertos">Mobilização e escuta pública</span>}
                title="Conversas e atividades"
                subtitle="Registros de atividades, publicações do Instagram, rodas de conversa e feedback público para transformar leitura ambiental em escuta e ação coletiva."
                metrics={
                    <>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Registros ativos</div>
                            <div className="mt-2 text-3xl font-black">{activities.length + conversationTopics.length}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Atividades em campo</div>
                            <div className="mt-2 text-3xl font-black">{activities.length}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Registros individuais de escuta</div>
                            <div className="mt-2 text-3xl font-black">{conversationTopics.length}</div>
                        </div>
                    </>
                }
                aside={
                    <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <IconShell tone="seed" className="portal-stage-icon">
                                <span aria-hidden="true">💬</span>
                            </IconShell>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Espaço de mobilização</div>
                                <div className="mt-1 text-base font-black">Território, memória de campo e participação pública no mesmo fluxo.</div>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Seção de Relato Ambiental */}
            <EnvironmentalReportSection />

            {conversations.length === 0 ? (
                <PortalEmptyState
                    title="Nenhuma conversa ou atividade publicada no momento"
                    description="Enquanto novos registros não entram, você pode enviar um relato ambiental, consultar a agenda pública ou explorar os relatórios e dados do portal."
                    actions={
                        <>
                            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:bg-emerald-100">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Relatar</div>
                                <div className="mt-2 text-sm font-black text-emerald-950">Abrir formulário ambiental</div>
                            </button>
                            <Link to="/agenda" className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Participar</div>
                                <div className="mt-2 text-sm font-black text-slate-900">Ver agenda pública</div>
                            </Link>
                            <Link to="/relatorios" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Evidências</div>
                                <div className="mt-2 text-sm font-black text-amber-950">Ler relatórios e boletins</div>
                            </Link>
                            <Link to="/dados" className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-left transition-colors hover:bg-cyan-100">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700">Dados</div>
                                <div className="mt-2 text-sm font-black text-cyan-950">Abrir painel público</div>
                            </Link>
                        </>
                    }
                />
            ) : (
                <div className="space-y-10">
                    {activities.length > 0 && (
                        <section className="space-y-5" aria-labelledby="atividades-title">
                            <PortalSectionHeader
                                eyebrow={<span className="badge-dados-abertos">Atividades em campo</span>}
                                title={<span id="atividades-title">Registros recentes</span>}
                                subtitle="Publicações e memórias de presença territorial que transformam dados em ação e escuta comunitária."
                            />
                            <div className="activity-grid">
                                {activities.map((activity) => (
                                    <article key={activity.id} className="activity-card">
                                        {activity.meta?.instagram_url ? (
                                            <InstagramEmbed title={activity.title} url={activity.meta.instagram_url} />
                                        ) : null}
                                        <div className="activity-card-copy">
                                            <span className="activity-card-kicker">Atividade</span>
                                            <h3 className="text-2xl font-black tracking-tight text-text-primary">{activity.title}</h3>
                                            {activity.excerpt ? <p className="text-sm leading-relaxed text-text-secondary">{activity.excerpt}</p> : null}
                                            {activity.body_md ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{activity.body_md}</p> : null}
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                                                <span>{activity.meta?.activity_date ? new Date(activity.meta.activity_date).toLocaleDateString("pt-BR") : new Date(activity.created_at).toLocaleDateString("pt-BR")}</span>
                                                {activity.meta?.location ? <span>{activity.meta.location}</span> : null}
                                            </div>
                                            <Link
                                                className="inline-flex min-h-11 w-fit items-center rounded-full bg-brand-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-brand-primary-dark"
                                                to={`/conversar/${activity.slug}`}
                                            >
                                                Ler matéria
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {conversationTopics.length > 0 && (
                        <section className="space-y-5" aria-labelledby="conversas-title">
                            <PortalSectionHeader
                                eyebrow={<span className="badge-metodologia">Escuta pública</span>}
                                title={<span id="conversas-title">Rodas de conversa</span>}
                                subtitle="Temas, registros e chamados para participação social no território."
                            />
                            <div className="portal-thread-list">
                                {conversationTopics.map((c) => (
                                    <Link
                                        key={c.id}
                                        to={`/conversar/${c.slug}`}
                                        className="portal-thread-row group"
                                    >
                                        <h3 className="mb-2 text-xl font-bold text-text-primary group-hover:text-brand-primary">{c.title}</h3>
                                        {c.excerpt && <p className="mb-4 text-sm text-text-secondary">{c.excerpt}</p>}
                                        <div className="flex items-center gap-4 text-xs font-semibold text-brand-primary">
                                            <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                                            <span className="h-1 w-1 rounded-full bg-border-subtle" />
                                            <span>Participar →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </PortalPageShell>
    );
}

function EnvironmentalReportSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [reporterName, setReporterName] = useState("");
    const [reporterEmail, setReporterEmail] = useState("");
    const [reporterPhone, setReporterPhone] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [website, setWebsite] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const categories = [
        { id: "ar_fumaca", label: "Ar / Fumaça", icon: "💨", desc: "Queimadas, fumaça industrial, fuligem, poeira intensa" },
        { id: "residuos_lixo", label: "Lixo / Resíduos", icon: "🗑️", desc: "Descarte irregular de lixo, entulho, focos de contaminação" },
        { id: "agua_esgoto", label: "Água / Esgoto", icon: "🚰" , desc: "Vazamento de esgoto, poluição de corpos d'água, água contaminada"},
        { id: "desmatamento_poda", label: "Desmatamento / Poda", icon: "🌳", desc: "Corte irregular de árvores, desmatamento de encostas ou áreas protegidas" },
        { id: "outros", label: "Outros", icon: "🛡️", desc: "Outros problemas e ocorrências ambientais não categorizados" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = reporterName.trim();
        const email = reporterEmail.trim();
        const phone = reporterPhone.trim();
        const reportLocation = location.trim();
        const reportDescription = description.trim();

        if (website.trim()) {
            setSuccess(true);
            setError(null);
            return;
        }

        if (!name || !category || !reportLocation || !reportDescription) {
            setError("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        if (name.length > 120 || reportLocation.length > 240 || reportDescription.length > 1500) {
            setError("Revise o tamanho dos campos: nome até 120 caracteres, localização até 240 e descrição até 1500.");
            return;
        }

        if (reportDescription.length < 20) {
            setError("Descreva a ocorrência com pelo menos 20 caracteres para permitir triagem responsável.");
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Por favor, informe um endereço de e-mail válido.");
            return;
        }

        if (phone) {
            const digits = phone.replace(/\D/g, "");
            if (digits.length < 10 || digits.length > 11) {
                setError("Por favor, informe um telefone de contato válido com DDD (ex: 21 99999-9999).");
                return;
            }
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        if (!navigator.onLine) {
            setError("Por privacidade, relatos com dados pessoais e fotos não são salvos offline neste dispositivo. Conecte-se à internet e envie novamente.");
            setSubmitting(false);
            return;
        }

        try {
            await createEnvironmentalReport({
                reporter_name: name,
                reporter_email: email || null,
                reporter_phone: phone || null,
                category,
                location: reportLocation,
                description: reportDescription,
                image_url: null
            });

            setSuccess(true);
            setReporterName("");
            setReporterEmail("");
            setReporterPhone("");
            setCategory("");
            setLocation("");
            setDescription("");
            setWebsite("");
        } catch (err) {
            const isNetworkErr = err instanceof Error && (
                err.message.includes("Failed to fetch") ||
                err.message.includes("NetworkError") ||
                err.message.includes("network")
            );

            if (isNetworkErr) {
                setError("Não foi possível enviar por instabilidade de conexão. Por privacidade, o relato não foi salvo neste dispositivo; revise e tente novamente quando a conexão estabilizar.");
            } else {
                setError(err instanceof Error ? err.message : "Falha ao enviar relato.");
            }
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <SurfaceCard className="portal-list-panel overflow-hidden border border-brand-primary/10 bg-white/70 shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-accent-seed/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-seed">
                            Escuta Cidadã
                        </span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-text-primary flex items-center gap-2">
                        <span>📢</span> Relato Ambiental
                    </h2>
                    <p className="text-sm text-text-secondary max-w-2xl">
                        Viu alguma irregularidade, descarte de lixo, poluição ou queimada? Envie seu relato para a equipe do SEMEAR acompanhar e planejar ações coletivas.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setError(null);
                        setSuccess(false);
                    }}
                    className={`ui-btn-ghost self-start md:self-auto min-w-[140px] ${isOpen ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700' : ''}`}
                >
                    {isOpen ? "Fechar Formulário" : "Relatar Ocorrência"}
                </button>
            </div>

            {!isOnline && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                    Você está offline. Por privacidade, este formulário não salva relatos, contatos ou fotos no dispositivo. Conecte-se à internet antes de enviar.
                </div>
            )}

            {isOpen && (
                <div className="mt-8 pt-6 border-t border-border-subtle/80 space-y-6 motion-pop">
                    {success ? (
                        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center space-y-3">
                            <span className="text-4xl">🎉</span>
                            <h3 className="text-lg font-bold text-emerald-800">
                                Relato enviado com sucesso!
                            </h3>
                            <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                Agradecemos a sua colaboração. Seu relato foi registrado na nossa caixa de entrada e será avaliado pela equipe do projeto SEMEAR.
                            </p>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                }}
                                className="ui-btn-secondary mt-2"
                            >
                                Enviar Outro Relato
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                                        ⚠️ {error}
                                    </p>
                                </div>
                            )}

                            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs font-semibold leading-relaxed text-sky-900">
                                <strong className="block text-[10px] uppercase tracking-[0.16em] text-sky-700">Privacidade do relato</strong>
                                Seus dados de contato são usados apenas para acompanhamento pela equipe do projeto. Evite incluir dados pessoais de terceiros no relato. Por segurança, o portal não salva relatos ambientais offline no navegador.
                            </div>

                            <input
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={website}
                                onChange={(event) => setWebsite(event.target.value)}
                                className="hidden"
                                aria-hidden="true"
                            />

                            {/* Informações Pessoais */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary">
                                    1. Seus Dados de Contato
                                </h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor="reporter-name" className="text-xs font-bold text-text-primary">
                                            Nome Completo <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="reporter-name"
                                            type="text"
                                            className="w-full rounded-xl border-2 border-border-subtle bg-white px-4 py-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-text-secondary/60"
                                            placeholder="Seu nome"
                                            value={reporterName}
                                            onChange={(e) => setReporterName(e.target.value)}
                                            maxLength={120}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="reporter-email" className="text-xs font-bold text-text-primary">
                                            E-mail
                                        </label>
                                        <input
                                            id="reporter-email"
                                            type="email"
                                            className="w-full rounded-xl border-2 border-border-subtle bg-white px-4 py-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-text-secondary/60"
                                            placeholder="seuemail@exemplo.com"
                                            value={reporterEmail}
                                            onChange={(e) => setReporterEmail(e.target.value)}
                                            maxLength={160}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="reporter-phone" className="text-xs font-bold text-text-primary">
                                            Telefone / WhatsApp
                                        </label>
                                        <input
                                            id="reporter-phone"
                                            type="tel"
                                            className="w-full rounded-xl border-2 border-border-subtle bg-white px-4 py-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-text-secondary/60"
                                            placeholder="(21) 99999-9999"
                                            value={reporterPhone}
                                            onChange={(e) => setReporterPhone(e.target.value)}
                                            maxLength={20}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categoria do Relato */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary">
                                    2. Categoria da Ocorrência <span className="text-red-500">*</span>
                                </h3>
                                <div 
                                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                                    role="radiogroup"
                                    aria-label="Categoria da Ocorrência"
                                >
                                    {categories.map((cat) => {
                                        const isSelected = category === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={isSelected}
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex items-start gap-3 p-3.5 text-left rounded-2xl border-2 transition-all duration-200 ${
                                                    isSelected
                                                        ? "border-brand-primary bg-brand-primary-soft text-brand-primary-dark shadow-sm scale-[1.01]"
                                                        : "border-border-subtle bg-white hover:border-brand-primary/30 hover:bg-slate-50"
                                                }`}
                                            >
                                                <span className="text-2xl mt-0.5" role="img" aria-label={cat.label}>
                                                    {cat.icon}
                                                </span>
                                                <div className="space-y-0.5">
                                                    <p className={`text-sm font-bold ${isSelected ? "text-brand-primary-dark" : "text-text-primary"}`}>
                                                        {cat.label}
                                                    </p>
                                                    <p className="text-xs text-text-secondary leading-tight">
                                                        {cat.desc}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Localização e Descrição */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="report-location" className="text-xs font-bold text-text-primary">
                                        Localização da Ocorrência <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="report-location"
                                        type="text"
                                        className="w-full rounded-xl border-2 border-border-subtle bg-white px-4 py-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-text-secondary/60"
                                        placeholder="Ex: Bairro São Domingos, próximo ao mercado X, rua tal..."
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        maxLength={240}
                                        required
                                    />
                                    <p className="text-xs text-text-secondary">
                                        Seja o mais específico possível para ajudar a localizar a ocorrência.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="report-description" className="text-xs font-bold text-text-primary">
                                        O que aconteceu? <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="report-description"
                                        rows={3}
                                        className="w-full rounded-xl border-2 border-border-subtle bg-white px-4 py-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none placeholder:text-text-secondary/60"
                                        placeholder="Descreva detalhadamente o problema ambiental..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        minLength={20}
                                        maxLength={1500}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Anexos ficam fora do formulário público até existir armazenamento privado auditável. */}
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                                <strong className="block text-[10px] uppercase tracking-[0.16em] text-amber-700">Anexos desabilitados nesta versão pública</strong>
                                Fotos podem conter rostos, placas, localização e outros dados pessoais. O envio de imagens será reativado somente com armazenamento privado, controle de acesso e política de retenção definida.
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="ui-btn-primary w-full md:w-auto md:px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Enviando Relato...
                                    </>
                                ) : (
                                    "Enviar Relato"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </SurfaceCard>
    );
}
