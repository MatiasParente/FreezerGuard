import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
export default function GuestLayout({ children }) {
    return (
        <div className="fg-shell flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-4 py-8">
            <Link
                href={route('home')}
                className="mb-8 flex min-h-11 items-center gap-3 rounded-lg"
            >
                <ApplicationLogo aria-hidden="true" className="h-12 w-12" />
                <span className="text-xl font-semibold tracking-tight text-slate-900">
                    FreezerGuard
                </span>
            </Link>
            <main className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                {children}
            </main>
        </div>
    );
}
