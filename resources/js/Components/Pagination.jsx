import { Link } from '@inertiajs/react';

export default function Pagination({ links, currentPage, lastPage }) {
    if (!links || links.length === 0 || lastPage === 1) return null;

    const firstLink = links[0];
    const lastLink = links[links.length - 1];

    return (
        <div className="flex items-center justify-between mt-6 px-2 w-full">
            <div>
                {/* Botón de Anterior */}
                {!firstLink.url ? (
                    <span
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-600 cursor-not-allowed border border-gray-300 select-none"
                        dangerouslySetInnerHTML={{ __html: 'Anterior' }}
                    />
                ) : (
                    <Link
                        href={firstLink.url}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-700 hover:text-white border border-gray-300 transition-colors shadow-sm"
                        dangerouslySetInnerHTML={{ __html: 'Anterior' }}
                    />
                )}
            </div>

            {/* Números de página */}
            <div className="text-sm font-medium text-slate-400 select-none">
                Página <span className="font-bold text-gray-800 dark:text-slate-700 mx-0.5">{currentPage}</span> de <span className="font-bold text-gray-800 dark:text-slate-700 mx-0.5">{lastPage}</span>
            </div>

            <div>
                {/* Botón de Siguiente */}
                {!lastLink.url ? (
                    <span
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-600 cursor-not-allowed border border-gray-300 select-none"
                        dangerouslySetInnerHTML={{ __html: 'Siguiente' }}
                    />
                ) : (
                    <Link
                        href={lastLink.url}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-700 hover:text-white border border-gray-300 transition-colors shadow-sm"
                        dangerouslySetInnerHTML={{ __html: 'Siguiente' }}
                    />
                )}
            </div>
        </div>
    );
}
