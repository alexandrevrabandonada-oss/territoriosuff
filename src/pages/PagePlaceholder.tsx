type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-ciano/50 bg-fundo/80 p-8 md:p-10">
      <h1 className="text-2xl font-black uppercase tracking-wide text-cta md:text-4xl">{title}</h1>
      <p className="mt-4 text-sm text-texto/90 md:text-base">{description}</p>
      <div className="mt-6 rounded-lg border border-dashed border-acento/70 bg-legacy-base/60 p-4 text-sm text-texto/80">
        [Placeholder] Conteudo em construcao. Nenhum dado oficial foi publicado nesta secao.
      </div>
    </section>
  );
}
