import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Freezer Guard" />
            
            <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
                
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/5 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

                <div className="relative w-full max-w-md text-center space-y-8">
                    <div className="mb-8">
                        <ApplicationLogo className="w-24 h-24 mx-auto" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-5xl font-extrabold tracking-tight text-blue-900">
                            Freezer Guard
                        </h1>
                        <p className="text-gray-600 text-sm max-w-sm mx-auto">
                            Gestión y monitoreo del freezer biomedico 
                        </p>
                    </div>

                    <div className="bg-white text-gray-900 border border-gray-200 p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full inline-flex justify-center items-center px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                            >
                                Ir al Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Ingresar
                                </Link>
                                
                                <Link
                                    href={route('register')}
                                    className="w-full inline-flex justify-center items-center px-4 py-3 bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-700 font-semibold rounded-xl transition-all"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}