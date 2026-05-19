import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
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

    return (
        <section className="portal-stage space-y-8 md:space-y-10">
            <SurfaceCard className="portal-stage-hero portal-stage-hero-seed overflow-hidden p-0">
                <div className="portal-stage-hero-inner">
                    <div className="portal-stage-copy">
                        <IconShell tone="seed" className="portal-stage-icon">
                            <span aria-hidden="true">💬</span>
                        </IconShell>
                        <h1>Conversar com o território</h1>
                        <p>
                            Rodas de conversa, fóruns e feedback público para transformar leitura ambiental em escuta, pactos locais e ação coletiva.
                        </p>
                    </div>
                    <div className="portal-stage-stat">
                        <span>{conversations.length}</span>
                        <small>conversa(s) ativa(s)</small>
                    </div>
                </div>
            </SurfaceCard>

            {conversations.length === 0 ? (
                <SurfaceCard className="portal-list-panel py-20 text-center">
                    <p className="text-text-secondary">Nenhuma roda de conversa ativa no momento.</p>
                </SurfaceCard>
            ) : (
                <div className="portal-thread-list">
                    {conversations.map((c) => (
                        <Link
                            key={c.id}
                            to={`/conversar/${c.slug}`}
                            className="portal-thread-row group"
                        >
                            <h2 className="mb-2 text-xl font-bold text-text-primary group-hover:text-brand-primary">{c.title}</h2>
                            {c.excerpt && <p className="mb-4 text-sm text-text-secondary">{c.excerpt}</p>}
                            <div className="flex items-center gap-4 text-xs font-semibold text-brand-primary">
                                <span>{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                                <span className="h-1 w-1 rounded-full bg-border-subtle" />
                                <span>Participar →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
