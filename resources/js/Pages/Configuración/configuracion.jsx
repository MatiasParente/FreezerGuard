import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Cpu, Settings } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function configuracion({ dispositivos, filters, freezers }) {
    const handleFilterChange = (e) => {
        router.get(route(route().current()), { ...filters, [e.target.name]: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Configuración de Dispositivos
                </h2>
            }
        >
            <Head title="Configuración" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Laboratorio</label>
                                    <select name="freezer_id" defaultValue={filters?.freezer_id || ''} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">Todos</option>
                                        {freezers?.map(f => (
                                            <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Dispositivo / Lab</th>
                                            <th className="px-6 py-4">Descripción</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dispositivos.data.map((dispositivo) => (
                                            <tr key={dispositivo.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                                                            <Cpu className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">{dispositivo.nombre}</span>
                                                            <span className="text-xs text-slate-400">{dispositivo.freezer?.ubicacion || 'No asignado'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                                                    {dispositivo.descripcion || 'Sin descripción'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                                                        <Settings className="w-4 h-4" /> Configurar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {dispositivos.data.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                    No hay dispositivos registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                    <Pagination
                        links={dispositivos.links}
                        currentPage={dispositivos.current_page}
                        lastPage={dispositivos.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
