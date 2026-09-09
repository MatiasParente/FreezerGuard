import ApplicationLogo from '@/Components/ApplicationLogo';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LayoutDashboard, Bell, Activity, FlaskConical, Settings, User, LogOut } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 sm:flex">
            <nav className="w-full bg-white border-b border-gray-200 sm:w-64 sm:h-screen sm:sticky sm:top-0 sm:overflow-y-auto sm:border-b-0 sm:border-r flex flex-col justify-between shrink-0">
                <div>
                    <div className="flex items-center justify-between h-[73px] px-3 sm:px-7 border-b border-gray-100">
                        <Link href={route('home')} className="flex items-center">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            <span className="ml-2 text-lg font-semibold">FreezerGuard</span>
                        </Link>

                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/*enlaces menu*/}
                    <div className={`sm:block ${showingNavigationDropdown ? 'block' : 'hidden'}`}>
                        <div className="px-2 py-4 space-y-1">
                            <ResponsiveNavLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span className='ml-2'>Resumen</span>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('alertas.alertas')}
                                active={route().current('alertas.alertas')}
                            >
                                <Bell className="w-5 h-5" />
                                <span className='ml-2'>Alertas</span>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('mediciones.mediciones')}
                                active={route().current('mediciones.mediciones')}
                            >
                                <Activity className="w-5 h-5" />
                                <span className='ml-2'>Mediciones</span>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('muestras.muestras')}
                                active={route().current('muestras.muestras')}
                            >
                                <FlaskConical className="w-5 h-5" />
                                <span className='ml-2'>Muestras</span>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('configuración.configuracion')}
                                active={route().current('configuración.configuracion')}
                            >
                                <Settings className="w-5 h-5" />
                                <span className='ml-2'>Configuración</span>
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                <div className={`border-t border-gray-200 p-4 ${showingNavigationDropdown ? 'block' : 'hidden sm:block'}`}>
                    <div className="space-y-1">
                        <ResponsiveNavLink href={route('profile.edit')}>
                            <User className="w-5 h-5" />
                            <span className='ml-2'>Perfil</span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            method="post"
                            href={route('logout')}
                            as="button"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className='ml-2'>Cerrar Sesión</span>
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col min-w-0">
                {header && (
                    <header className="bg-white shadow h-[73px] flex items-center">
                        <div className="w-full px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}