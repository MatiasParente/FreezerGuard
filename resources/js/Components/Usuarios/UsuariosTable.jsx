import Pagination from '@/Components/Pagination';
import TextInput from '@/Components/TextInput';
import { usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { KeyRound, Trash2, UserPlus, ShieldCheck, User as UserIcon, RotateCcw, Search, History } from 'lucide-react';
import DeleteUserModal from '@/Components/Usuarios/DeleteUserModal';
import RestoreUserModal from '@/Components/Usuarios/RestoreUserModal';
import ForceDeleteUserModal from '@/Components/Usuarios/ForceDeleteUserModal';

export default function UsuariosTable({
    usuarios,
    filters = { estado: 'activo', search: '' },
    onOpenAddModal,
    onOpenResetModal,
}) {
    const authUser = usePage().props.auth.user;
    const isInactiveMode = filters?.estado === 'inactivo';

    // estado para el campo de búsqueda por email/nombre
    const [searchValue, setSearchValue] = useState(filters?.search || '');

    useEffect(() => {
        setSearchValue(filters?.search || '');
    }, [filters?.search]);

    // estados para modales
    const [deletingUser, setDeletingUser] = useState(null);
    const [restoringUser, setRestoringUser] = useState(null);
    const [forceDeletingUser, setForceDeletingUser] = useState(null);

    const handleToggleAdmin = (targetUser) => {
        if (authUser?.id === targetUser.id) return;
        router.post(route('usuarios.toggle-admin', targetUser.id), {}, { preserveScroll: true });
    };

    // búsqueda por correo o nombre
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            route(route().current()),
            {
                ...filters,
                search: searchValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const toggleEstadoMode = () => {
        const nuevoEstado = isInactiveMode ? 'activo' : 'inactivo';
        router.get(
            route(route().current()),
            {
                ...filters,
                estado: nuevoEstado,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-2 rounded-xl">
                <div>
                    <h4 className="text-base font-bold text-slate-800 uppercase tracking-wider">
                        {isInactiveMode ? 'Usuarios inactivos' : 'Lista de Usuarios'}
                    </h4>
                    <p className="text-xs text-slate-500">
                        {isInactiveMode
                            ? 'Usuarios desactivados previamente. Puedes restaurarlos o eliminarlos definitivamente.'
                            : 'Usuarios registrados con acceso a la aplicación web'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* búsqueda por email/nombre */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64 flex items-center">
                        <TextInput
                            type="text"
                            name="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Buscar por correo..."
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Botones de arriba */}
                    <div className="flex items-center gap-2">
                        {!isInactiveMode ? (
                            <>
                                <button
                                    onClick={onOpenAddModal}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Crear usuario
                                </button>
                                <button
                                    onClick={toggleEstadoMode}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <History className="w-4 h-4" />
                                    Historial Inactivos
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={toggleEstadoMode}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <History className="w-4 h-4" />
                                Ver Activos
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3">Correo Electrónico</th>
                            <th className="px-4 py-3">Rol / Nivel</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {usuarios?.data && usuarios.data.length > 0 ? (
                            usuarios.data.map((user) => {
                                const isSelf = authUser?.id === user.id;

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${isInactiveMode ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                    {user.name}
                                                </span>
                                                {isSelf && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-md">
                                                        Tú
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                        <td className="px-4 py-3">
                                            {user.is_general_admin ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                                    Admin General
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                                    Usuario
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isInactiveMode ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                    Inactivo
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    Activo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                            {!isInactiveMode ? (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleAdmin(user)}
                                                        disabled={isSelf}
                                                        title={
                                                            isSelf
                                                                ? 'No puedes cambiar tu propio rol de Administrador'
                                                                : user.is_general_admin
                                                                ? 'Retirar rango de Admin General'
                                                                : 'Asignar como Admin General'
                                                        }
                                                        className={`inline-flex items-center justify-center p-2 rounded-lg border transition-all shadow-sm ${
                                                            isSelf
                                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                : user.is_general_admin
                                                                ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300 hover:scale-105'
                                                                : 'bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border-slate-200 hover:scale-105'
                                                        }`}
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => onOpenResetModal(user)}
                                                        title="Resetear Contraseña"
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-all shadow-sm hover:scale-105"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeletingUser(user)}
                                                        disabled={isSelf}
                                                        title={isSelf ? 'No puedes eliminarte a ti mismo' : 'Desactivar usuario'}
                                                        className={`inline-flex items-center justify-center p-2 rounded-lg border transition-all shadow-sm ${
                                                            isSelf
                                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 hover:scale-105'
                                                        }`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setRestoringUser(user)}
                                                        title="Restaurar usuario"
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all shadow-sm hover:scale-105"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setForceDeletingUser(user)}
                                                        title="Eliminar permanentemente"
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                    {isInactiveMode
                                        ? 'No hay usuarios inactivos en el registro.'
                                        : 'No hay usuarios registrados.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {usuarios && (
                <Pagination
                    links={usuarios.links}
                    currentPage={usuarios.current_page}
                    lastPage={usuarios.last_page}
                />
            )}

            {/* Modales Desacoplados */}
            <DeleteUserModal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                user={deletingUser}
            />

            <RestoreUserModal
                isOpen={!!restoringUser}
                onClose={() => setRestoringUser(null)}
                user={restoringUser}
            />

            <ForceDeleteUserModal
                isOpen={!!forceDeletingUser}
                onClose={() => setForceDeletingUser(null)}
                user={forceDeletingUser}
            />
        </div>
    );
}
