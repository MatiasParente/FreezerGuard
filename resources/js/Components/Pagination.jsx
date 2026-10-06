import { Link } from '@inertiajs/react';
export default function Pagination({ links, currentPage, lastPage }) {
    if (!links?.length || lastPage <= 1) return null;
    return (
        <nav
            aria-label="Paginación"
            className="mt-6 flex w-full flex-wrap items-center justify-between gap-3"
        >
            {links[0].url ? (
                <Link
                    href={links[0].url}
                    preserveScroll
                    className="fg-button-secondary"
                >
                    Anterior
                </Link>
            ) : (
                <button type="button" className="fg-button-secondary" disabled>
                    Anterior
                </button>
            )}
            <p className="order-first w-full text-center text-sm text-slate-600 sm:order-none sm:w-auto">
                Página{' '}
                <span className="font-semibold text-slate-900">
                    {currentPage}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-slate-900">{lastPage}</span>
            </p>
            {links.at(-1).url ? (
                <Link
                    href={links.at(-1).url}
                    preserveScroll
                    className="fg-button-secondary"
                >
                    Siguiente
                </Link>
            ) : (
                <button type="button" className="fg-button-secondary" disabled>
                    Siguiente
                </button>
            )}
        </nav>
    );
}
