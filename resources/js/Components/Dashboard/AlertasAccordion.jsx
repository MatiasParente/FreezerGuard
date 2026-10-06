import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function AlertasAccordion({
    alertas = { data: [], links: [], current_page: 1, last_page: 1 },
    alertasSinResolverCount = 0,
}) {
    const [open, setOpen] = useState(true);
    return (
        <section className="fg-panel">
            <div className="fg-panel-heading">
                <h2>
                    <button
                        type="button"
                        className="fg-disclosure"
                        aria-expanded={open}
                        aria-controls="recent-alerts"
                        onClick={() => setOpen((value) => !value)}
                    >
                        {open ? (
                            <ChevronUp aria-hidden="true" className="h-5 w-5" />
                        ) : (
                            <ChevronDown
                                aria-hidden="true"
                                className="h-5 w-5"
                            />
                        )}
                        Alertas recientes
                    </button>
                </h2>
                <Link
                    href={route('alertas.alertas')}
                    className="fg-button text-indigo-700 hover:bg-indigo-50"
                >
                    Ver alertas{' '}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
            </div>
            <div id="recent-alerts" hidden={!open}>
                {alertas.data.length ? (
                    <ul className="divide-y divide-slate-100">
                        {alertas.data.map((alerta) => (
                            <li
                                key={alerta.id}
                                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"
                            >
                                <div className="flex min-w-0 gap-3">
                                    {Number(alerta.estado) === 2 ? (
                                        <CheckCircle2
                                            aria-hidden="true"
                                            className="mt-1 h-5 w-5 shrink-0 text-emerald-700"
                                        />
                                    ) : (
                                        <AlertCircle
                                            aria-hidden="true"
                                            className="mt-1 h-5 w-5 shrink-0 text-red-700"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">
                                            {alerta.alerta?.tipo || 'Alerta'}
                                        </p>
                                        <p className="mt-1 break-words text-sm text-slate-600">
                                            {alerta.dispositivo?.nombre ||
                                                'Dispositivo sin identificar'}{' '}
                                            ·{' '}
                                            {new Date(
                                                alerta.fecha_y_hora,
                                            ).toLocaleString('es-UY')}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`fg-status self-start shrink-0 ${Number(alerta.estado) === 2 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}
                                >
                                    {Number(alerta.estado) === 2
                                        ? 'Resuelta'
                                        : 'Pendiente'}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="fg-empty">
                        {alertasSinResolverCount > 0
                            ? 'Hay alertas pendientes. Consulta la lista de alertas para revisarlas.'
                            : 'No hay alertas recientes para la selección actual.'}
                    </p>
                )}
                {alertas.data.length > 0 && (
                    <div className="px-4 pb-4 sm:px-6">
                        <Pagination
                            links={alertas.links}
                            currentPage={alertas.current_page}
                            lastPage={alertas.last_page}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
