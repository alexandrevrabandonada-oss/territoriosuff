import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { InstagramEmbed } from "../../components/InstagramEmbed";
import { Conversation, listConversations, createEnvironmentalReport } from "../../lib/api";
import { supabase } from "../../lib/supabase/client";

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

            {/* Seção de Relato Ambiental */}
            <EnvironmentalReportSection />

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

        try {
            let imageUrl = null;
            if (imageFile) {
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
            setError(err instanceof Error ? err.message : "Falha ao enviar relato.");
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

            {isOpen && (
                <div className="mt-8 pt-6 border-t border-border-subtle/80 space-y-6 motion-pop">
                    {success ? (
                        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center space-y-3">
                            <span className="text-4xl">🎉</span>
                            <h4 className="text-lg font-bold text-emerald-800">Relato Enviado com Sucesso!</h4>
                            <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                Agradecemos a sua colaboração. Seu relato foi registrado na nossa caixa de entrada e será avaliado pela equipe do projeto SEMEAR.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
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
