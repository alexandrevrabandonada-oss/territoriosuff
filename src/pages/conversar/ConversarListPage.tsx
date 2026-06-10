import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { PortalEmptyState, PortalHero, PortalPageShell, PortalSectionHeader } from "../../components/portal";
import { InstagramEmbed } from "../../components/InstagramEmbed";
import { Conversation, listConversations, createEnvironmentalReport } from "../../lib/api";

let supabaseClientPromise: Promise<typeof import("../../lib/supabase/client")> | null = null;

async function loadSupabaseClient() {
    if (!supabaseClientPromise) {
        supabaseClientPromise = import("../../lib/supabase/client");
    }
    return supabaseClientPromise;
}

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
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Escuta pública</div>
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

const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas toBlob failed"));
                        }
                    },
                    "image/jpeg",
                    0.8
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

interface QueuedReport {
    id: string;
    reporter_name: string;
    reporter_email: string | null;
    reporter_phone: string | null;
    category: string;
    location: string;
    description: string;
    imageBase64: string | null;
    imageName: string | null;
    imageType: string | null;
    created_at: string;
}

const blobToBase64 = (blob: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("FileReader did not return a string"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const base64ToBlob = (base64: string, type: string): Blob => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
};

function EnvironmentalReportSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [reporterName, setReporterName] = useState("");
    const [reporterEmail, setReporterEmail] = useState("");
    const [reporterPhone, setReporterPhone] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [queuedCount, setQueuedCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [offlineFeedback, setOfflineFeedback] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const syncOfflineReports = useCallback(async () => {
        if (!navigator.onLine || syncing) return;

        const stored = localStorage.getItem("semear_pending_reports");
        if (!stored) return;

        let queue: QueuedReport[];
        try {
            queue = JSON.parse(stored);
        } catch (err) {
            console.error("Fila corrompida:", err);
            localStorage.removeItem("semear_pending_reports");
            setQueuedCount(0);
            return;
        }

        if (queue.length === 0) return;

        setSyncing(true);
        setError(null);
        setOfflineFeedback("Sincronizando relatos salvos offline...");

        const remainingQueue: QueuedReport[] = [];
        let successCount = 0;

        for (const report of queue) {
            try {
                let imageUrl = null;
                if (report.imageBase64 && report.imageType) {
                    const { supabase } = await loadSupabaseClient();
                    if (!supabase) {
                        throw new Error("Conexão com o banco de dados não configurada.");
                    }
                    const imageBlob = base64ToBlob(report.imageBase64, report.imageType);
                    const fileExt = report.imageName?.split(".").pop() || "jpg";
                    const uniqueName = `relato_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from("environmental_reports")
                        .upload(uniqueName, imageBlob, {
                            cacheControl: "3600",
                            contentType: report.imageType,
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from("environmental_reports")
                        .getPublicUrl(uniqueName);

                    imageUrl = publicUrl;
                }

                await createEnvironmentalReport({
                    reporter_name: report.reporter_name,
                    reporter_email: report.reporter_email,
                    reporter_phone: report.reporter_phone,
                    category: report.category,
                    location: report.location,
                    description: report.description,
                    image_url: imageUrl,
                    created_at: report.created_at
                });

                successCount++;
            } catch (err) {
                console.error(`Erro ao sincronizar relato ${report.id}:`, err);
                const isNetworkError = !navigator.onLine ||
                    (err instanceof Error && (
                        err.message.includes("Failed to fetch") ||
                        err.message.includes("NetworkError") ||
                        err.message.includes("network")
                    ));

                if (isNetworkError) {
                    remainingQueue.push(report);
                    const currentIndex = queue.indexOf(report);
                    remainingQueue.push(...queue.slice(currentIndex + 1));
                    break;
                } else {
                    console.warn(`Descartando relato ${report.id} devido a falha permanente no servidor:`, err);
                }
            }
        }

        try {
            if (remainingQueue.length > 0) {
                localStorage.setItem("semear_pending_reports", JSON.stringify(remainingQueue));
            } else {
                localStorage.removeItem("semear_pending_reports");
            }
            setQueuedCount(remainingQueue.length);
        } catch (err) {
            console.error("Erro ao atualizar fila offline:", err);
        }

        setSyncing(false);
        if (successCount > 0) {
            setOfflineFeedback(`Sincronização concluída! ${successCount} relato(s) enviado(s) com sucesso.`);
            setTimeout(() => setOfflineFeedback(null), 5000);
        } else {
            setOfflineFeedback(null);
        }
    }, [syncing]);

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

    useEffect(() => {
        const checkQueue = () => {
            try {
                const stored = localStorage.getItem("semear_pending_reports");
                if (stored) {
                    const queue: QueuedReport[] = JSON.parse(stored);
                    setQueuedCount(queue.length);
                }
            } catch (err) {
                console.error("Erro ao ler fila offline:", err);
            }
        };
        checkQueue();

        if (isOnline) {
            syncOfflineReports();
        }
    }, [isOnline, syncOfflineReports]);

    const categories = [
        { id: "ar_fumaca", label: "Ar / Fumaça", icon: "💨", desc: "Queimadas, fumaça industrial, fuligem, poeira intensa" },
        { id: "residuos_lixo", label: "Lixo / Resíduos", icon: "🗑️", desc: "Descarte irregular de lixo, entulho, focos de contaminação" },
        { id: "agua_esgoto", label: "Água / Esgoto", icon: "🚰" , desc: "Vazamento de esgoto, poluição de corpos d'água, água contaminada"},
        { id: "desmatamento_poda", label: "Desmatamento / Poda", icon: "🌳", desc: "Corte irregular de árvores, desmatamento de encostas ou áreas protegidas" },
        { id: "outros", label: "Outros", icon: "🛡️", desc: "Outros problemas e ocorrências ambientais não categorizados" }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                setError("O arquivo selecionado deve ser uma imagem.");
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("O arquivo da foto não deve exceder 5MB.");
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reporterName.trim() || !category || !location.trim() || !description.trim()) {
            setError("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }

        if (reporterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
            setError("Por favor, informe um endereço de e-mail válido.");
            return;
        }

        if (reporterPhone.trim()) {
            const digits = reporterPhone.replace(/\D/g, "");
            if (digits.length < 10 || digits.length > 11) {
                setError("Por favor, informe um telefone de contato válido com DDD (ex: 21 99999-9999).");
                return;
            }
        }

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        // Check if offline first
        if (!navigator.onLine) {
            try {
                let imageBase64: string | null = null;
                let imageName: string | null = null;
                let imageType: string | null = null;

                if (imageFile) {
                    imageName = imageFile.name;
                    imageType = "image/jpeg";
                    try {
                        const compressedBlob = await compressImage(imageFile);
                        imageBase64 = await blobToBase64(compressedBlob);
                    } catch (compressErr) {
                        console.warn("Failed to compress image for offline storage, using original:", compressErr);
                        imageBase64 = await blobToBase64(imageFile);
                        imageType = imageFile.type;
                    }
                }

                const newReport: QueuedReport = {
                    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    reporter_name: reporterName,
                    reporter_email: reporterEmail || null,
                    reporter_phone: reporterPhone || null,
                    category,
                    location,
                    description,
                    imageBase64,
                    imageName,
                    imageType,
                    created_at: new Date().toISOString()
                };

                const stored = localStorage.getItem("semear_pending_reports");
                const queue: QueuedReport[] = stored ? JSON.parse(stored) : [];
                queue.push(newReport);
                localStorage.setItem("semear_pending_reports", JSON.stringify(queue));
                setQueuedCount(queue.length);

                setSuccess(true);
                setOfflineFeedback("Você está offline. Seu relato foi salvo e será enviado automaticamente assim que a conexão retornar!");
                setReporterName("");
                setReporterEmail("");
                setReporterPhone("");
                setCategory("");
                setLocation("");
                setDescription("");
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (err) {
                console.error("Failed to save report offline:", err);
                setError("Falha ao salvar relato offline: " + (err instanceof Error ? err.message : "Erro desconhecido"));
            } finally {
                setSubmitting(false);
            }
            return;
        }

        try {
            let imageUrl = null;
            if (imageFile) {
                const { supabase } = await loadSupabaseClient();
                if (!supabase) {
                    throw new Error("Conexão com o banco de dados não configurada.");
                }

                // Compress the image before uploading to save storage & bandwidth
                let uploadData: Blob | File = imageFile;
                let finalName = imageFile.name;

                try {
                    const compressedBlob = await compressImage(imageFile);
                    uploadData = compressedBlob;
                    // Change extension to .jpg since canvas.toBlob uses image/jpeg
                    const dotIndex = imageFile.name.lastIndexOf('.');
                    const baseName = dotIndex !== -1 ? imageFile.name.substring(0, dotIndex) : imageFile.name;
                    finalName = `${baseName}.jpg`;
                } catch (compressErr) {
                    console.warn("Failed to compress image, uploading original instead:", compressErr);
                }

                const fileExt = finalName.split(".").pop();
                const uniqueName = `relato_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("environmental_reports")
                    .upload(uniqueName, uploadData, {
                        cacheControl: "3600",
                        contentType: uploadData instanceof Blob ? "image/jpeg" : imageFile.type,
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("environmental_reports")
                    .getPublicUrl(uniqueName);

                imageUrl = publicUrl;
            }

            await createEnvironmentalReport({
                reporter_name: reporterName,
                reporter_email: reporterEmail || null,
                reporter_phone: reporterPhone || null,
                category,
                location,
                description,
                image_url: imageUrl
            });

            setSuccess(true);
            setReporterName("");
            setReporterEmail("");
            setReporterPhone("");
            setCategory("");
            setLocation("");
            setDescription("");
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            const isNetworkErr = err instanceof Error && (
                err.message.includes("Failed to fetch") ||
                err.message.includes("NetworkError") ||
                err.message.includes("network")
            );

            if (isNetworkErr) {
                console.warn("Erro de conexão detectado ao enviar relato online, salvando na fila offline:", err);
                try {
                    let imageBase64: string | null = null;
                    let imageName: string | null = null;
                    let imageType: string | null = null;

                    if (imageFile) {
                        imageName = imageFile.name;
                        imageType = "image/jpeg";
                        try {
                            const compressedBlob = await compressImage(imageFile);
                            imageBase64 = await blobToBase64(compressedBlob);
                        } catch (compressErr) {
                            console.warn("Failed to compress image before offline storage, using original:", compressErr);
                            imageBase64 = await blobToBase64(imageFile);
                            imageType = imageFile.type;
                        }
                    }

                    const newReport: QueuedReport = {
                        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        reporter_name: reporterName,
                        reporter_email: reporterEmail || null,
                        reporter_phone: reporterPhone || null,
                        category,
                        location,
                        description,
                        imageBase64,
                        imageName,
                        imageType,
                        created_at: new Date().toISOString()
                    };

                    const stored = localStorage.getItem("semear_pending_reports");
                    const queue: QueuedReport[] = stored ? JSON.parse(stored) : [];
                    queue.push(newReport);
                    localStorage.setItem("semear_pending_reports", JSON.stringify(queue));
                    setQueuedCount(queue.length);

                    setSuccess(true);
                    setOfflineFeedback("Erro temporário de conexão. Seu relato foi salvo offline e será enviado automaticamente assim que a conexão estabilizar!");
                    setReporterName("");
                    setReporterEmail("");
                    setReporterPhone("");
                    setCategory("");
                    setLocation("");
                    setDescription("");
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                } catch (saveErr) {
                    console.error("Failed to save report offline after network error:", saveErr);
                    setError("Erro ao enviar relato e falha ao salvar na fila offline.");
                }
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
                    <h3 className="text-xl font-black tracking-tight text-text-primary flex items-center gap-2">
                        <span>📢</span> Relato Ambiental
                    </h3>
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

            {/* Banner de Sincronização / Modo Offline */}
            {(queuedCount > 0 || offlineFeedback) && (
                <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm font-semibold transition-all ${
                    syncing 
                        ? "bg-blue-50 border-blue-200 text-blue-800" 
                        : !isOnline 
                            ? "bg-amber-50 border-amber-200 text-amber-800" 
                            : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}>
                    <div className="flex items-center gap-2">
                        {syncing ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        ) : !isOnline ? (
                            <span>📡</span>
                        ) : (
                            <span>✅</span>
                        )}
                        <span>
                            {offlineFeedback || (
                                !isOnline 
                                    ? `Você está offline. Há ${queuedCount} relato(s) salvos na fila aguardando conexão.`
                                    : `Há ${queuedCount} relato(s) pendente(s) de envio.`
                            )}
                        </span>
                    </div>
                    {isOnline && queuedCount > 0 && !syncing && (
                        <button
                            onClick={syncOfflineReports}
                            className="text-xs px-3 py-1 bg-white border border-border-subtle rounded-lg shadow-sm hover:bg-slate-50 transition-colors self-start sm:self-auto text-text-primary"
                        >
                            Enviar Agora ↗
                        </button>
                    )}
                </div>
            )}

            {isOpen && (
                <div className="mt-8 pt-6 border-t border-border-subtle/80 space-y-6 motion-pop">
                    {success ? (
                        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center space-y-3">
                            <span className="text-4xl">🎉</span>
                            <h4 className="text-lg font-bold text-emerald-800">
                                {offlineFeedback ? "Relato Salvo Offline!" : "Relato Enviado com Sucesso!"}
                            </h4>
                            <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                {offlineFeedback || "Agradecemos a sua colaboração. Seu relato foi registrado na nossa caixa de entrada e será avaliado pela equipe do projeto SEMEAR."}
                            </p>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setOfflineFeedback(null);
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

                            {/* Informações Pessoais */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-brand-primary">
                                    1. Seus Dados de Contato
                                </h4>
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
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categoria do Relato */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-brand-primary">
                                    2. Categoria da Ocorrência <span className="text-red-500">*</span>
                                </h4>
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
                                        required
                                    />
                                </div>
                            </div>

                            {/* Foto / Anexo */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-primary block">
                                    Anexar Foto (Opcional)
                                </label>
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-border-subtle hover:border-brand-primary/45 rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer text-sm font-semibold text-text-secondary"
                                    >
                                        📷 Selecionar Imagem
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <p className="text-xs text-text-secondary">
                                        Formatos aceitos: JPEG, PNG. Limite de tamanho: 5MB.
                                    </p>
                                </div>

                                {imagePreview && (
                                    <div className="relative mt-2 inline-block rounded-xl overflow-hidden border border-border-subtle group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview do relato"
                                            className="h-28 w-28 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
                                            title="Remover imagem"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
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
