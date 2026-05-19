import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandRadialDivider, BrandTextureSkeleton, BrandWatermarkPanel } from "../components/BrandMicro";
import { getBlogPostBySlug, type BlogPost } from "../lib/api";
import { trackShare } from "../lib/observability";

function SimpleMarkdown({ text }: { text: string }) {
    const html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");
    // eslint-disable-next-line react/no-danger
    return <div className="space-y-4 text-[15px] leading-relaxed text-text-primary md:text-base" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                const data = await getBlogPostBySlug(slug as string);
                if (!cancelled) setPost(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar post.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();
        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return <BrandTextureSkeleton className="mx-auto max-w-4xl rounded-[1.75rem]" lines={5} />;
    }

    if (error) {
        return (
            <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
                {error}
            </p>
        );
    }

    if (!post) {
        return (
            <BrandIllustratedEmptyState
                title="Post não encontrado"
                description="O conteúdo solicitado pode ter sido movido, removido ou ainda não publicado."
                icon={<span className="text-2xl" aria-hidden="true">🔍</span>}
                action={<Link className="ui-btn-secondary" to="/blog">Voltar ao Blog</Link>}
            />
        );
    }

    return (
        <article className="portal-stage mx-auto max-w-5xl space-y-8 md:space-y-10">
            <Link
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                to="/blog"
            >
                ← Voltar ao Blog
            </Link>

            <SurfaceCard className="portal-detail-article overflow-hidden p-0">
                {post.cover_url && (
                    <img
                        alt={post.title}
                        className="h-64 w-full object-cover md:h-96"
                        src={post.cover_url}
                    />
                )}
                <div className="p-5 md:p-10">
                    <div className="mb-5 flex items-center gap-3">
                        <IconShell tone="seed" className="h-12 w-12 rounded-2xl"><span aria-hidden="true">✍️</span></IconShell>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Blog editorial</span>
                    </div>
                    <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary md:gap-3">
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR") : "Draft"}</span>
                        {post.tags.length > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-border-subtle" />
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span className="ui-tag-signature-editorial" key={tag}>{tag}</span>
                                    ))}
                                </div>
                            </>
                        )}
                        <button
                            className="ui-btn-secondary ml-auto max-sm:w-full max-sm:justify-center"
                            onClick={() => {
                                const url = `${window.location.origin}/s/blog/${post.slug}`;
                                trackShare("blog", post.slug, "post");
                                if (navigator.share) {
                                    void navigator.share({
                                        title: post.title,
                                        text: post.excerpt || undefined,
                                        url
                                    });
                                } else {
                                    trackShare("blog", post.slug, "post-copy");
                                    void navigator.clipboard.writeText(url);
                                    alert("Link de compartilhamento copiado!");
                                }
                            }}
                            type="button"
                        >
                            Compartilhar
                        </button>
                    </div>

                    <h1 className="mb-6 text-2xl font-black leading-tight text-text-primary md:text-5xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mb-8 border-l-4 border-brand-primary/30 pl-3 text-base font-semibold italic leading-relaxed text-text-secondary md:pl-4 md:text-lg">
                            {post.excerpt}
                        </p>
                    )}

                    <BrandWatermarkPanel>
                        <BrandRadialDivider className="radial-divider-subtle my-6" />
                    </BrandWatermarkPanel>

                    {post.content_md ? (
                        <SimpleMarkdown text={post.content_md} />
                    ) : (
                        <p className="text-center italic text-text-secondary/50">Este post ainda não possui conteúdo.</p>
                    )}
                </div>
            </SurfaceCard>
        </article>
    );
}
