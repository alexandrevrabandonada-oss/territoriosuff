import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../components/BrandMicro";
import { EditorialFamilyCard } from "../components/CardFamilies";
import { listBlogPosts, type BlogPost } from "../lib/api";
import { getOptimizedCover } from "../lib/imageOptimization";

export function BlogListPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const demoOrAdminMode = useMemo(() => {
        const envMode = String(import.meta.env.VITE_PROJECT_MODE ?? "").toLowerCase();
        const envFlag = String(import.meta.env.VITE_SHOW_SCHEDULED ?? "").toLowerCase() === "true";
        const localFlag = typeof window !== "undefined"
            ? ["admin", "demo", "true"].includes(String(window.localStorage.getItem("semear:show-scheduled") ?? "").toLowerCase())
            : false;
        return envFlag || envMode === "admin" || envMode === "demo" || localFlag;
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            try {
                setLoading(true);
                setError(null);
                const data = await listBlogPosts({ limit: 50, includeScheduled: demoOrAdminMode });
                if (!cancelled) setPosts(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar blog.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        void run();
        return () => { cancelled = true; };
    }, [demoOrAdminMode]);

    const isScheduled = (post: BlogPost) => Boolean(post.publish_at) && new Date(post.publish_at as string).getTime() > Date.now();

    return (
        <section className="portal-stage blog-stage space-y-8 md:space-y-10">
            <SurfaceCard className="portal-stage-hero portal-stage-hero-seed overflow-hidden p-0">
                <div className="portal-stage-hero-inner">
                    <div className="portal-stage-copy">
                        <IconShell tone="seed" className="portal-stage-icon">
                            <span aria-hidden="true">✍️</span>
                        </IconShell>
                        <h1>Blog editorial do SEMEAR</h1>
                        <p>
                            Atualizações institucionais, bastidores de campo e textos de comunicação pública sobre monitoramento do ar e participação territorial.
                        </p>
                    </div>
                    <div className="portal-stage-stat">
                        <span>{loading ? "..." : posts.length}</span>
                        <small>publicação(ões)</small>
                    </div>
                </div>
            </SurfaceCard>

            {loading ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <BrandTextureSkeleton key={i} className="h-72 rounded-[1.75rem]" lines={4} />
                    ))}
                </div>
            ) : error ? (
                <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
                    {error}
                </p>
            ) : posts.length === 0 ? (
                <BrandIllustratedEmptyState
                    title="Nenhum post publicado no momento"
                    description="As novas publicações editoriais do SEMEAR aparecerão aqui assim que forem aprovadas."
                    icon={<span className="text-2xl" aria-hidden="true">✍️</span>}
                />
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => {
                        const dateStr = (post.publish_at || post.published_at)
                            ? new Date((post.publish_at || post.published_at) as string).toLocaleDateString("pt-BR")
                            : undefined;
                        return (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="group motion-list-item block h-full"
                            >
                                <EditorialFamilyCard
                                    coverUrl={getOptimizedCover(post, "thumb")}
                                    coverAlt={post.title}
                                    date={dateStr}
                                    title={post.title}
                                    excerpt={post.excerpt}
                                    tags={post.tags}
                                    scheduled={demoOrAdminMode && isScheduled(post)}
                                    cta="Ler artigo"
                                />
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
