import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
export default function Welcome({ auth }) {
    return (
        <>
            <Head title="FreezerGuard" />
            <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-6 py-12">
                <div className="w-full max-w-lg">
                    <ApplicationLogo
                        aria-hidden="true"
                        className="mb-6 h-16 w-16"
                    />
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                        FreezerGuard
                    </h1>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
                        Gestión y monitoreo del freezer biomédico.
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                        Consulta las temperaturas, revisa las alertas y
                        administra las muestras almacenadas.
                    </p>
                    <Link
                        href={route(auth?.user ? 'dashboard' : 'login')}
                        className="fg-button-primary mt-8"
                    >
                        {auth?.user ? 'Ir al resumen' : 'Iniciar sesión'}
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>
            </main>
        </>
    );
}
