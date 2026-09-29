import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import UsuariosTable from '@/Components/Usuarios/UsuariosTable';
import AddUserModal from '@/Components/Usuarios/AddUserModal';
import ResetPasswordModal from '@/Components/Usuarios/ResetPasswordModal';

export default function Index({ usuarios, filters, totalActivos, totalInactivos }) {
    const { flash, errors } = usePage().props;

    // Estados de modales
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [resettingUser, setResettingUser] = useState(null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        Gestión de Usuarios
                    </h2>
                </div>
            }
        >
            <Head title="Usuarios" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* mensajes Flash */}
                    {flash?.success && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span className="text-sm font-medium">{flash.success}</span>
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span className="text-sm font-medium">{flash.warning}</span>
                        </div>
                    )}
                    {errors?.error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                            <span className="text-sm font-medium">{errors.error}</span>
                        </div>
                    )}

                    {/* estadísticas superiores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Usuarios Activos</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                                    {totalActivos ?? 0}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Usuarios Inactivos</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                                    {totalInactivos ?? 0}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                <ShieldAlert className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    {/* tabla unificada */}
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                        <UsuariosTable
                            usuarios={usuarios}
                            filters={filters}
                            onOpenAddModal={() => setIsAddModalOpen(true)}
                            onOpenResetModal={(user) => setResettingUser(user)}
                        />
                    </div>

                </div>
            </div>

            {/* modales */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <ResetPasswordModal
                isOpen={!!resettingUser}
                onClose={() => setResettingUser(null)}
                user={resettingUser}
            />
        </AuthenticatedLayout>
    );
}
