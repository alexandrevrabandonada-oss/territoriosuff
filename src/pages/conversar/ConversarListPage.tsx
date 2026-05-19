import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { InstagramEmbed } from "../../components/InstagramEmbed";
import { Conversation, listConversations } from "../../lib/api";

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
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
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
        <section className="portal-stage space-y-8 md:space-y-10">
            <SurfaceCard className="portal-stage-hero portal-stage-hero-seed overflow-hidden p-0">
                <div className="portal-stage-hero-inner">
                    <div className="portal-stage-copy">
                        <IconShell tone="seed" className="portal-stage-icon">
                            <span aria-hidden="true">💬</span>
                        </IconShell>
                        <h1>Conversas e atividades</h1>
                        <p>
                            Registros de atividades, publicações do Instagram, rodas de conversa e feedback público para transformar leitura ambiental em escuta e ação coletiva.
                        </p>
                    </div>
                    <div className="portal-stage-stat">
                        <span>{activities.length + conversationTopics.length}</span>
                        <small>registro(s) ativo(s)</small>
                    </div>
                </div>
            </SurfaceCard>

            {conversations.length === 0 ? (
                <SurfaceCard className="portal-list-panel py-20 text-center">
                    <p className="text-text-secondary">Nenhuma conversa ou atividade publicada no momento.</p>
                </SurfaceCard>
            ) : (
                <div className="space-y-10">
                    {activities.length > 0 && (
                        <section className="space-y-5" aria-labelledby="atividades-title">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Atividades em campo</p>
                                <h2 id="atividades-title" className="mt-2 text-3xl font-black tracking-tight text-text-primary">Registros recentes</h2>
                            </div>
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
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {conversationTopics.length > 0 && (
                        <section className="space-y-5" aria-labelledby="conversas-title">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Escuta pública</p>
                                <h2 id="conversas-title" className="mt-2 text-3xl font-black tracking-tight text-text-primary">Rodas de conversa</h2>
                            </div>
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
        </section>
    );
}
