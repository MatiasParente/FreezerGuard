import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Cpu, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import DispositivosTable from '@/Components/Configuracion/DispositivosTable';
import AddDispositivoModal from '@/Components/Configuracion/AddDispositivoModal';
import EditDispositivoModal from '@/Components/Configuracion/EditDispositivoModal';
import SistemaConfigForm from '@/Components/Configuracion/SistemaConfigForm';

export default function configuracion({
    dispositivos,
    filters,
    freezers,
    available_freezers,
    configuracionSistema
}) {
    // Estado desplegable de los acordeones
    const [mostrarDispositivos, setMostrarDispositivos] = useState(true);
    const [mostrarCorreos, setMostrarCorreos] = useState(true);

    const isInactiveMode = filters?.estado === 'inactivo';

    // Estados de modales
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDispositivo, setEditingDispositivo] = useState(null);

    const openEditModal = (dispositivo) => {
        setEditingDispositivo(dispositivo);
        setIsEditModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-2xl font-semibold leading-tight text-slate-900 tracking-tight">
                    Configuración General
                </h1>
            }
        >
            <Head title="Configuración" />

            <div className="w-full">
                <div className="fg-page">

                    {/* DISPOSITIVOS Y SENSORES */}
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                        <div
                            className="px-6 py-4 flex justify-between items-center bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-b border-slate-100"
                        >
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                <Cpu className="w-5 h-5 shrink-0 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isInactiveMode ? 'Historial de Dispositivos Inactivos' : 'Dispositivos y Sensores Activos'}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {isInactiveMode ? `${dispositivos?.total || 0} inactivos` : `${dispositivos?.total || 0} activos`}
                                </span>
                            </div>
                            <button type="button" aria-label={mostrarDispositivos ? 'Ocultar dispositivos' : 'Mostrar dispositivos'} aria-expanded={mostrarDispositivos} aria-controls="device-settings" onClick={() => setMostrarDispositivos(!mostrarDispositivos)} className="text-slate-600 hover:text-indigo-700">
                                {mostrarDispositivos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>

                        <div id="device-settings" hidden={!mostrarDispositivos} className="border-t border-slate-100">
                                <DispositivosTable
                                    dispositivos={dispositivos}
                                    filters={filters}
                                    freezers={freezers}
                                    onOpenAddModal={() => setIsAddModalOpen(true)}
                                    onOpenEditModal={openEditModal}
                                />
                            </div>
                    </div>

                    {/* configuracion de el mail y la plantilla */}
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                        <div
                            className="px-6 py-4 flex justify-between items-center bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-b border-slate-100"
                        >
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                <Mail className="w-5 h-5 shrink-0 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900">Notificaciones por correo y SMS</h3>
                            </div>
                            <button type="button" aria-label={mostrarCorreos ? 'Ocultar configuración de notificaciones' : 'Mostrar configuración de notificaciones'} aria-expanded={mostrarCorreos} aria-controls="notification-settings" onClick={() => setMostrarCorreos(!mostrarCorreos)} className="text-slate-600 hover:text-indigo-700">
                                {mostrarCorreos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>

                        <div id="notification-settings" hidden={!mostrarCorreos} className="p-4 sm:p-6 border-t border-slate-100">
                                <SistemaConfigForm
                                    configuracionSistema={configuracionSistema}
                                />
                            </div>
                    </div>

                </div>
            </div>

            {/* Agregar Dispositivo */}
            <AddDispositivoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                availableFreezers={available_freezers}
            />

            {/* editar Dispositivo */}
            <EditDispositivoModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingDispositivo(null);
                }}
                dispositivo={editingDispositivo}
            />

        </AuthenticatedLayout>
    );
}
