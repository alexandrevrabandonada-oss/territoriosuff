import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentProfile, logout, UserProfile } from "../lib/supabase/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

// Icons as SVG Components
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Files: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Blog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Conversation: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m6 5-4-4H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v4a4 4 0 01-4 4h-1l3 4z" />
    </svg>
  ),
  Inbox: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5M9 17h6" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const p = await getCurrentProfile();
      setProfile(p);
    }
    loadProfile();
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: Icons.Dashboard },
    { name: "Acervo", path: "/admin/acervo", icon: Icons.Database },
    { name: "Uploads", path: "/admin/uploads", icon: Icons.Upload },
    { name: "Relatórios", path: "/admin/relatorios", icon: Icons.Files },
    { name: "Blog", path: "/admin/blog", icon: Icons.Blog },
    { name: "Atividades", path: "/admin/atividades", icon: Icons.Conversation },
    { name: "Relatos", path: "/admin/relatos", icon: Icons.Inbox },
    { name: "Agenda", path: "/admin/agenda", icon: Icons.Calendar },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="admin-shell flex h-screen overflow-hidden font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        id="admin-sidebar"
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 w-72 transform text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-0"
        } ${!isSidebarOpen && "hidden lg:flex lg:flex-col"}`}
      >
        <div className="admin-brand flex items-center gap-3 p-6">
          <div className="admin-brand-mark">S</div>
          <h1 className="text-xl font-black tracking-tight">SEMEAR <span className="block text-xs font-bold uppercase tracking-[0.3em] text-emerald-200/90">Admin</span></h1>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          {menuItems.map((item) => {
            const isActive = item.path === "/admin"
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`admin-nav-item ${isActive ? "admin-nav-item-active" : ""}`}
              >
                <item.icon />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button 
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition-all hover:bg-rose-500/12 hover:text-rose-100"
            aria-label="Sair do painel administrativo"
          >
            <Icons.Logout />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="admin-topbar flex h-20 shrink-0 items-center justify-between px-6">
          <button 
            type="button"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu administrativo"
            aria-controls="admin-sidebar"
            aria-expanded={isSidebarOpen}
          >
            <Icons.Menu />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">{profile?.email?.split('@')[0]}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Administrador</span>
            </div>
            <div className="admin-avatar flex h-11 w-11 items-center justify-center rounded-full text-slate-600">
              <Icons.User />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content flex-1 overflow-y-auto p-6 md:p-8">
          <div className="admin-content-inner mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

