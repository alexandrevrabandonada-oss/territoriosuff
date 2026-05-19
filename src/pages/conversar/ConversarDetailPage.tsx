import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getConversationBySlug,
    listConversationComments,
    createConversationComment,
    reportConversationComment,
    Conversation,
    ConversationComment
} from "../../lib/api";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";

function SimpleMarkdown({ text }: { text: string }) {
    const html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");
    // eslint-disable-next-line react/no-danger
    return <div className="space-y-4 text-base leading-relaxed text-text-primary" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ConversarDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [comments, setComments] = useState<ConversationComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [body, setBody] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<{ msg: string; type: 'success' | 'warn' } | null>(null);
    const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!slug) return;
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const conv = await getConversationBySlug(slug as string);
                if (!conv) {
                    setError("Conversa não encontrada");
                    return;
                }
                setConversation(conv);
                const comms = await listConversationComments(conv.id);
                setComments(comms);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar conversa");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!conversation || !name.trim() || !body.trim()) return;

        try {
            setSubmitting(true);
            setSubmitSuccess(null);

            const result = await createConversationComment({
                conversation_id: conversation.id,
                name: name.trim(),
                body: body.trim(),
                honeypot: honeypot
            });

            if (result.status === 'published') {
                setComments([...comments, result.data]);
                setSubmitSuccess({ msg: "Comentário publicado com sucesso!", type: 'success' });
            } else {
                setSubmitSuccess({ msg: "Seu comentário foi enviado e está aguardando moderação.", type: 'warn' });
            }

            setName("");
            setBody("");
            setHoneypot("");
        } catch (err) {
            console.error(err);
            alert("Falha ao publicar comentário. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReport = async (commentId: string) => {
        if (reportedIds.has(commentId)) return;

        try {
            const { hidden } = await reportConversationComment(commentId);
            setReportedIds(new Set([...reportedIds, commentId]));

            if (hidden) {
                setComments(comments.filter(c => c.id !== commentId));
                alert("Obrigado. O comentário foi removido por excesso de denúncias.");
            } else {
                alert("Obrigado pela denúncia. Nossa equipe irá revisar.");
            }
        } catch (err) {
            alert("Falha ao processar denúncia.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                <p className="text-error">{error || "Conversa não encontrada"}</p>
                <Link to="/conversar" className="mt-4 inline-block text-brand-primary underline">Voltar para a lista</Link>
            </div>
        );
    }

    return (
        <main className="portal-stage mx-auto max-w-5xl space-y-8 md:space-y-10">
            <Link to="/conversar" className="mb-6 inline-flex items-center text-sm font-semibold text-brand-primary hover:underline">
                ← Voltar para Conversar
            </Link>

            <SurfaceCard className="portal-detail-article p-5 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                    <IconShell tone="seed" className="h-12 w-12 rounded-2xl"><span aria-hidden="true">💬</span></IconShell>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Conversa pública</span>
                </div>
                <h1 className="mb-6 text-3xl font-black tracking-[-0.045em] text-text-primary md:text-5xl">{conversation.title}</h1>
                {conversation.excerpt && (
                    <p className="mb-8 border-l-4 border-brand-primary/30 pl-4 text-xl italic text-text-secondary">
                        {conversation.excerpt}
                    </p>
                )}
                <div className="prose prose-lg max-w-none">
                    {conversation.body_md ? (
                        <SimpleMarkdown text={conversation.body_md} />
                    ) : (
                        <p className="italic text-text-secondary">Esta conversa não possui descrição detalhada ainda.</p>
                    )}
                </div>
            </SurfaceCard>

            <SurfaceCard className="portal-list-panel p-5 md:p-8">
                <h2 className="mb-8 text-2xl font-black uppercase tracking-wider text-brand-primary">Comentários e Contribuições</h2>

                <div className="mb-12 space-y-6">
                    {comments.length === 0 ? (
                        <p className="italic text-text-secondary">Nenhum comentário ainda. Seja o primeiro a participar!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl border border-brand-primary/10 bg-white p-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-bold text-text-primary text-base">{comment.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-text-secondary">
                                            {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                        <button
                                            onClick={() => handleReport(comment.id)}
                                            disabled={reportedIds.has(comment.id)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-error/50 hover:text-error disabled:opacity-30"
                                        >
                                            {reportedIds.has(comment.id) ? "Denunciado" : "Denunciar"}
                                        </button>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-text-primary">{comment.body}</p>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6 md:p-8">
                    <h3 className="mb-6 text-xl font-bold text-text-primary">Deixe sua contribuição</h3>

                    {submitSuccess && (
                        <div className={`mb-6 rounded-lg border p-4 text-sm font-bold ${submitSuccess.type === 'success' ? 'border-accent-green/30 bg-accent-green/10 text-accent-green' : 'border-warning/30 bg-warning/10 text-warning'}`}>
                            {submitSuccess.msg}
                        </div>
                    )}

                    <div className="grid gap-4">
                        {/* Honeypot field - hidden from users */}
                        <div className="hidden" aria-hidden="true">
                            <input
                                type="text"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                autoComplete="off"
                                tabIndex={-1}
                            />
                        </div>
                        <div>
                            <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                Seu nome ou organização
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-brand-primary/30 bg-white px-4 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                placeholder="Ex: Maria Santos"
                            />
                        </div>
                        <div>
                            <label htmlFor="body" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                Mensagem
                            </label>
                            <textarea
                                id="body"
                                required
                                rows={4}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full rounded-lg border border-brand-primary/30 bg-white px-4 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                placeholder="Compartilhe seu relato, dúvida ou sugestão..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-primary px-6 py-3 font-black uppercase tracking-widest text-white transition-all hover:brightness-110 disabled:opacity-50"
                        >
                            {submitting ? "Enviando..." : "Publicar Comentário"}
                        </button>
                    </div>
                </form>
            </SurfaceCard>
        </main>
    );
}
