import ApplicationLogo from '@/Components/ApplicationLogo';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import NotificationModal from '@/Components/NotificationModal';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    Bell,
    Activity,
    FlaskConical,
    Settings,
    User,
    LogOut,
    Users,
    Menu,
    X,
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [navigationOpen, setNavigationOpen] = useState(false);
    const links = [
        ['dashboard', 'Resumen', LayoutDashboard],
        ['alertas.alertas', 'Alertas', Bell],
        ['mediciones.mediciones', 'Mediciones', Activity],
        ['muestras.muestras', 'Muestras', FlaskConical],
        ...(user?.is_general_admin
            ? [
                  ['configuracion.configuracion', 'Configuración', Settings],
                  ['usuarios.index', 'Usuarios', Users],
              ]
            : []),
    ];
    return (
        <div className="fg-shell min-h-[100dvh] bg-slate-50 lg:flex">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-indigo-700"
            >
                Saltar al contenido
            </a>
            <nav
                aria-label="Navegación principal"
                className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-[100dvh] lg:w-60 lg:overflow-y-auto lg:border-b-0 lg:border-r"
            >
                <div className="flex min-h-20 items-center justify-between gap-2 border-b border-slate-100 px-4 lg:px-5">
                    <Link
                        href={route('dashboard')}
                        className="flex min-h-11 items-center gap-2.5 rounded-lg"
                    >
                        <ApplicationLogo
                            aria-hidden="true"
                            className="h-10 w-10 shrink-0"
                        />
                        <span className="text-lg font-semibold tracking-tight text-slate-900">
                            FreezerGuard
                        </span>
                    </Link>
                    <button
                        type="button"
                        aria-label={
                            navigationOpen ? 'Cerrar menú' : 'Abrir menú'
                        }
                        aria-expanded={navigationOpen}
                        aria-controls="main-navigation"
                        onClick={() => setNavigationOpen((open) => !open)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
                    >
                        {navigationOpen ? (
                            <X aria-hidden="true" className="h-5 w-5" />
                        ) : (
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <div
                    id="main-navigation"
                    className={
                        (navigationOpen ? 'flex' : 'hidden') +
                        ' flex-1 flex-col lg:flex'
                    }
                >
                    <div className="space-y-1 p-3">
                        {links.map(([name, label, Icon]) => (
                            <ResponsiveNavLink
                                key={name}
                                href={route(name)}
                                active={route().current(
                                    name === 'usuarios.index'
                                        ? 'usuarios.*'
                                        : name,
                                )}
                                onClick={() => setNavigationOpen(false)}
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="h-5 w-5 shrink-0"
                                />
                                {label}
                            </ResponsiveNavLink>
                        ))}
                    </div>
                    <div className="mt-auto space-y-1 border-t border-slate-200 p-3">
                        <p
                            className="truncate px-3 py-2 text-sm font-medium text-slate-600"
                            title={user?.name}
                        >
                            {user?.name}
                        </p>
                        <ResponsiveNavLink
                            href={route('profile.edit')}
                            active={route().current('profile.edit')}
                        >
                            <User aria-hidden="true" className="h-5 w-5" />
                            Perfil
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            method="post"
                            href={route('logout')}
                            as="button"
                        >
                            <LogOut aria-hidden="true" className="h-5 w-5" />
                            Cerrar sesión
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>
            <div className="flex min-w-0 flex-1 flex-col">
                <NotificationModal />
                {header && (
                    <header className="flex min-h-20 items-center border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
                        <div className="mx-auto w-full max-w-7xl">{header}</div>
                    </header>
                )}
                <main
                    id="main-content"
                    tabIndex={-1}
                    className="min-w-0 flex-1 p-4 outline-none sm:p-6 lg:p-8"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
