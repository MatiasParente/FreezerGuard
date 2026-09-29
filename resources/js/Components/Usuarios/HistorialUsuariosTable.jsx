import Pagination from '@/Components/Pagination';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { RotateCcw, Trash2, ShieldAlert } from 'lucide-react';

export default function HistorialUsuariosTable({ usuariosInactivos, onToggleInactivos }) {
    const [restoringUser, setRestoringUser] = useState(null);
    const [forceDeletingUser, setForceDeletingUser] = useState(null);

    const { post: restorePost, processing: restoring } = useForm();
    const { delete: forceDeleteCall, processing: forceDeleting } = useForm();

    const handleRestoreSubmit = (e) => {
        e.preventDefault();
        if (!restoringUser) return;

        restorePost(route('usuarios.restore', restoringUser.id), {
            onSuccess: () => setRestoringUser(null),
        });
    };

    const handleForceDeleteSubmit = (e) => {
        e.preventDefault();
        if (!forceDeletingUser) return;

        forceDeleteCall(route('usuarios.force-delete', forceDeletingUser.id), {
            onSuccess: () => setForceDeletingUser(null),
        });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <div>
                        <h4 className="text-base font-bold uppercase tracking-wide">Usuarios inactivos</h4>
                        <p className="text-xs">Usuarios previamente eliminados. Puedes restaurarlos o eliminarlos definitivamente.</p>
                    </div>
                </div>
                <button
                    onClick={onToggleInactivos}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-sm uppercase tracking-wider"
                >
                    Ver activos
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Administrador</th>
                            <th className="px-4 py-3">Correo Electrónico</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {usuariosInactivos?.data && usuariosInactivos.data.length > 0 ? (
                            usuariosInactivos.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors opacity-80 hover:opacity-100">
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-bold text-slate-700 line-through">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                            Inactivo
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => setRestoringUser(user)}
                                            title="Restaurar administrador"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-semibold transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            onClick={() => setForceDeletingUser(user)}
                                            title="Eliminar permanentemente"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                                    No hay administradores inactivos en el historial.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {usuariosInactivos && (
                <Pagination
                    links={usuariosInactivos.links}
                    currentPage={usuariosInactivos.current_page}
                    lastPage={usuariosInactivos.last_page}
                />
            )}

            {/* Restaurar */}
            <Modal show={!!restoringUser} onClose={() => setRestoringUser(null)} maxWidth="md">
                <form onSubmit={handleRestoreSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Restaurar Administrador
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        ¿Deseas reactivar la cuenta del usuario <span className="font-semibold text-gray-900">{restoringUser?.name}</span>? Podrá volver a iniciar sesión normalmente.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setRestoringUser(null)}>
                            Cancelar
                        </SecondaryButton>
                        <button
                            type="submit"
                            disabled={restoring}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                        >
                            {restoring ? 'Restaurando...' : 'Restaurar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/*eliminar definitivamente */}
            <Modal show={!!forceDeletingUser} onClose={() => setForceDeletingUser(null)} maxWidth="md">
                <form onSubmit={handleForceDeleteSubmit} className="p-6">
                    <h2 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wider">
                        Eliminación definitiva
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        ¿Estás seguro de eliminar permanentemente a <span className="font-semibold text-gray-900">{forceDeletingUser?.name}</span>? Esta acción no se puede deshacer y se borrará completamente de la base de datos.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setForceDeletingUser(null)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton disabled={forceDeleting}>
                            {forceDeleting ? 'Eliminando...' : 'Eliminar'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
