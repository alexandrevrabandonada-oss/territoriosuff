import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  listEnvironmentalReports,
  updateEnvironmentalReport,
  deleteEnvironmentalReport,
  type EnvironmentalReport
} from "../../lib/api";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function parseCoordinates(locationStr: string): [number, number] | null {
  if (!locationStr) return null;
  
  // Try pattern: -22.5203, -44.1044
  const basicRegex = /(-?\d+\.\d+)\s*[\s,]\s*(-?\d+\.\d+)/;
  const basicMatch = locationStr.match(basicRegex);
  if (basicMatch) {
    const lat = parseFloat(basicMatch[1]);
    const lng = parseFloat(basicMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lat, lng];
    }
  }

  // Try pattern with lat/lng labels (e.g. "lat: -22.5203, lng: -44.1044")
  const latRegex = /(?:lat|latitude)\s*:\s*(-?\d+\.\d+)/i;
  const lngRegex = /(?:lng|lon|longitude)\s*:\s*(-?\d+\.\d+)/i;
  const latMatch = locationStr.match(latRegex);
  const lngMatch = locationStr.match(lngRegex);
  if (latMatch && lngMatch) {
    const lat = parseFloat(latMatch[1]);
    const lng = parseFloat(lngMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lat, lng];
    }
  }

  return null;
}


const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  reviewed: "Em Revisão",
  resolved: "Resolvido",
  archived: "Arquivado"
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  reviewed: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200"
};

const CATEGORY_LABELS: Record<string, string> = {
  ar_fumaca: "Ar / Fumaça",
  residuos_lixo: "Lixo / Resíduos",
  agua_esgoto: "Água / Esgoto",
  desmatamento_poda: "Desmatamento / Poda",
  outros: "Outros"
};

const CATEGORY_EMOJIS: Record<string, string> = {
  ar_fumaca: "💨",
  residuos_lixo: "🗑️",
  agua_esgoto: "🚰",
  desmatamento_poda: "🌳",
  outros: "🛡️"
};

export function AdminReportsInboxPage() {
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EnvironmentalReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  // Detalhes editáveis do admin
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEnvironmentalReports();
      setReports(data);
      // Se tiver selecionado um relato, atualiza sua referência no state local
      if (selectedReport) {
        const updated = data.find((r) => r.id === selectedReport.id);
        if (updated) {
          setSelectedReport(updated);
          setAdminNotes(updated.admin_notes || "");
        } else {
          setSelectedReport(null);
        }
      }
    } catch (err) {
      console.error("[AdminReports] Falha ao carregar relatos:", err);
      showToast("Falha ao carregar relatos: " + (err instanceof Error ? err.message : "Erro desconhecido"), "error");
    } finally {
      setLoading(false);
    }
  }, [selectedReport, showToast]);

  useEffect(() => {
    loadReports();
  }, []);

  const handleSelectReport = (report: EnvironmentalReport) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || "");
  };

  const handleStatusChange = async (newStatus: "new" | "reviewed" | "resolved" | "archived") => {
    if (!selectedReport) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateEnvironmentalReport(selectedReport.id, {
        status: newStatus
      });
      setSelectedReport(updated);
      // Atualizar lista
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast("Status do relato atualizado!");
    } catch (err) {
      showToast("Falha ao atualizar status: " + (err instanceof Error ? err.message : "Erro desconhecido"), "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedReport) return;
    setUpdatingNotes(true);
    try {
      const updated = await updateEnvironmentalReport(selectedReport.id, {
        admin_notes: adminNotes.trim() || null
      });
      setSelectedReport(updated);
      // Atualizar lista
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast("Notas do administrador salvas com sucesso!");
    } catch (err) {
      showToast("Falha ao salvar notas: " + (err instanceof Error ? err.message : "Erro desconhecido"), "error");
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este relato?")) return;
    try {
      await deleteEnvironmentalReport(id);
      setSelectedReport(null);
      setReports((prev) => prev.filter((r) => r.id !== id));
      showToast("Relato excluído com sucesso.");
    } catch (err) {
      showToast("Falha ao excluir relato: " + (err instanceof Error ? err.message : "Erro desconhecido"), "error");
    }
  };

  const coordinates = selectedReport ? parseCoordinates(selectedReport.location) : null;

  // Estatísticas de triagem
  const totalCount = reports.length;
  const newCount = reports.filter((r) => r.status === "new").length;
  const reviewedCount = reports.filter((r) => r.status === "reviewed").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const archivedCount = reports.filter((r) => r.status === "archived").length;

  // Filtrar relatos
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || report.category === filterCategory;
    const matchesStatus = !filterStatus || report.status === filterStatus;

    let matchesDate = true;
    if (filterStartDate) {
      const startLimit = new Date(filterStartDate + "T00:00:00");
      matchesDate = matchesDate && new Date(report.created_at) >= startLimit;
    }
    if (filterEndDate) {
      const endLimit = new Date(filterEndDate + "T23:59:59.999");
      matchesDate = matchesDate && new Date(report.created_at) <= endLimit;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    try {
      const headers = [
        "ID",
        "Data de Envio",
        "Nome do Denunciante",
        "E-mail",
        "Telefone",
        "Categoria",
        "Localização",
        "Descrição",
        "Status",
        "Notas do Administrador"
      ];

      const escapeCSVField = (val: any) => {
        if (val === null || val === undefined) return "";
        const strVal = String(val);
        if (strVal.includes('"') || strVal.includes(',') || strVal.includes('\n') || strVal.includes('\r')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      };

      const rows = filteredReports.map((report) => [
        report.id,
        new Date(report.created_at).toLocaleString("pt-BR"),
        report.reporter_name,
        report.reporter_email || "",
        report.reporter_phone || "",
        CATEGORY_LABELS[report.category] || report.category,
        report.location,
        report.description,
        STATUS_LABELS[report.status] || report.status,
        report.admin_notes || ""
      ]);

      const csvContent = [
        headers.map(escapeCSVField).join(","),
        ...rows.map((row) => row.map(escapeCSVField).join(","))
      ].join("\r\n");

      // Adiciona o BOM UTF-8 (\ufeff) no início do arquivo para o Excel identificar acentos corretamente
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `relatos_ambientais_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV exportado com sucesso!");
    } catch (err) {
      console.error("[AdminReports] Falha ao exportar CSV:", err);
      showToast("Falha ao exportar CSV: " + (err instanceof Error ? err.message : "Erro desconhecido"), "error");
    }
  };

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Mapeamento e escuta cidadã</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Relatos Ambientais</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">
            Caixa de entrada para revisão, triagem e encaminhamento dos relatos de problemas ambientais recebidos.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="admin-kpi-card admin-kpi-indigo">
          <div className="admin-kpi-icon">
            <span>📥</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Total Recebido</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "..." : totalCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Geral</p>
          </div>
        </div>

        <div className="admin-kpi-card admin-kpi-blue">
          <div className="admin-kpi-icon">
            <span>🆕</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Novos</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "..." : newCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Aguardando triagem</p>
          </div>
        </div>

        <div className="admin-kpi-card admin-kpi-amber">
          <div className="admin-kpi-icon">
            <span>⏳</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Em Revisão</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "..." : reviewedCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Sendo avaliados</p>
          </div>
        </div>

        <div className="admin-kpi-card admin-kpi-emerald">
          <div className="admin-kpi-icon">
            <span>✅</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Resolvidos</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "..." : resolvedCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Casos solucionados</p>
          </div>
        </div>

        <div className="admin-kpi-card admin-kpi-slate">
          <div className="admin-kpi-icon">
            <span>📁</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Arquivados</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "..." : archivedCount}</p>
            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">Finalizados</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar flex flex-wrap items-end gap-4 p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Busca livre</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por denunciante, local ou descrição..."
            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-4 focus:ring-emerald-500/10 font-medium placeholder:text-slate-500"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl font-semibold"
          >
            <option value="">Todas</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {CATEGORY_EMOJIS[val]} {label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl font-semibold"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-44">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data Início</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl font-semibold focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="w-44">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data Fim</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full px-5 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl font-semibold focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredReports.length === 0}
          className="p-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/20 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-800"
          title="Exportar relatos filtrados para CSV"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-semibold hidden sm:inline">Exportar CSV</span>
        </button>

        <button
          onClick={loadReports}
          className="p-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/20 rounded-xl transition-colors"
          title="Recarregar relatos"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Main split-view dashboard */}
      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Left Side: List (Col-span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Lista de Ocorrências
              </h2>
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-full">
                {filteredReports.length} relato(s)
              </span>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-800/50">
              {loading ? (
                <div className="p-5 space-y-4 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-800 rounded w-1/3" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">Nenhum relato recebido com estes filtros.</div>
              ) : (
                filteredReports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  const catLabel = CATEGORY_LABELS[report.category] || report.category;
                  const emoji = CATEGORY_EMOJIS[report.category] || "📢";

                  return (
                    <button
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className={`w-full p-5 text-left transition-all flex items-start gap-4 hover:bg-slate-800/30 ${
                        isSelected ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 pl-4" : ""
                      }`}
                    >
                      <span className="text-2xl mt-0.5" role="img" aria-label={catLabel}>
                        {emoji}
                      </span>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-200 text-sm truncate">
                            {report.reporter_name}
                          </p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[report.status]}`}>
                            {STATUS_LABELS[report.status]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          📍 {report.location}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {report.description}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(report.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detail Panel (Col-span 3) */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6 space-y-6 motion-pop">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={selectedReport.category}>
                      {CATEGORY_EMOJIS[selectedReport.category] || "📢"}
                    </span>
                    <span className="text-sm font-bold text-slate-300">
                      {CATEGORY_LABELS[selectedReport.category] || selectedReport.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Relato de {selectedReport.reporter_name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enviado em {new Date(selectedReport.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-900/50 hover:bg-red-900 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Excluir Relato
                </button>
              </div>

              {/* Contato do Denunciante */}
              <div className="grid gap-4 sm:grid-cols-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">E-mail de Contato</p>
                  <p className="text-sm text-slate-200 mt-0.5">
                    {selectedReport.reporter_email || <span className="italic text-slate-500">Não informado</span>}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Telefone de Contato</p>
                  <p className="text-sm text-slate-200 mt-0.5">
                    {selectedReport.reporter_phone || <span className="italic text-slate-500">Não informado</span>}
                  </p>
                </div>
              </div>

              {/* Localização e Ocorrência */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">📍 Localização informada</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedReport.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors hover:underline"
                    >
                      Ver no Google Maps ↗
                    </a>
                  </div>
                  <p className="text-sm text-slate-200 font-medium bg-slate-950 p-3 rounded-lg border border-slate-800/80 mt-1">
                    {selectedReport.location}
                  </p>
                  {coordinates && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 h-[200px] relative z-10">
                      <MapContainer
                        center={coordinates}
                        zoom={15}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={coordinates} />
                      </MapContainer>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">📝 Descrição da Ocorrência</p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-slate-800/80 mt-1">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Imagem Anexada */}
              {selectedReport.image_url && (
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-2">📸 Foto Anexada</p>
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 group">
                    <img
                      src={selectedReport.image_url}
                      alt="Ocorrência ambiental"
                      className="max-h-[300px] w-full object-contain bg-slate-950"
                    />
                    <a
                      href={selectedReport.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      Ver em tamanho original
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Ações Administrativas */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Controle Administrativo
                </h3>

                {/* Status do Relato */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400">Alterar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(STATUS_LABELS) as Array<"new" | "reviewed" | "resolved" | "archived">).map((statusVal) => {
                      const isCurrent = selectedReport.status === statusVal;
                      return (
                        <button
                          key={statusVal}
                          onClick={() => handleStatusChange(statusVal)}
                          disabled={updatingStatus}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                            isCurrent
                              ? STATUS_COLORS[statusVal] + " ring-2 ring-emerald-500/20"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {STATUS_LABELS[statusVal]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notas do Admin */}
                <div className="space-y-2">
                  <label htmlFor="admin-notes" className="text-xs font-bold text-slate-400 block">
                    Notas Administrativas (Acompanhamento interno)
                  </label>
                  <textarea
                    id="admin-notes"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Escreva aqui observações internas, encaminhamentos feitos ou notas sobre a resolução..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 font-medium placeholder:text-slate-600 text-sm resize-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={updatingNotes}
                    className="ui-btn-primary min-h-[38px] text-xs font-semibold px-4 py-2 flex items-center justify-center gap-1.5"
                  >
                    {updatingNotes ? "Salvando..." : "Salvar Notas"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-800/80 p-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <span className="text-5xl">📥</span>
              <p className="font-bold text-slate-400">Nenhum relato selecionado</p>
              <p className="text-sm text-slate-500 max-w-sm">
                Selecione uma ocorrência na lista à esquerda para revisar os detalhes de contato, imagens, descrição e registrar notas de acompanhamento.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Elegant admin notification toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === "success" 
            ? "bg-slate-900 border-emerald-500/30 text-emerald-400" 
            : "bg-slate-900 border-red-500/30 text-red-400"
        }`}>
          <span className="text-lg">{toast.type === "success" ? "✅" : "⚠️"}</span>
          <p className="text-sm font-bold text-slate-100">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
