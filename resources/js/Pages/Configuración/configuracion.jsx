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
                <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider">
                    Configuración General
                </h2>
            }
        >
            <Head title="Configuración" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* DISPOSITIVOS Y SENSORES */}
                    <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-200">
                        <div 
                            className="px-6 py-4 flex justify-between items-center cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-b border-slate-100"
                            onClick={() => setMostrarDispositivos(!mostrarDispositivos)}
                        >
                            <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isInactiveMode ? 'Historial de Dispositivos Inactivos' : 'Dispositivos y Sensores Activos'}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {isInactiveMode ? `${dispositivos?.total || 0} inactivos` : `${dispositivos?.total || 0} activos`}
                                </span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                {mostrarDispositivos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>

                        {mostrarDispositivos && (
                            <div className="p-4 sm:p-6 border-t border-slate-100">
                                <DispositivosTable 
                                    dispositivos={dispositivos}
                                    filters={filters}
                                    freezers={freezers}
                                    onOpenAddModal={() => setIsAddModalOpen(true)}
                                    onOpenEditModal={openEditModal}
                                />
                            </div>
                        )}
                    </div>

                    {/* configuracion de el mail y la plantilla */}
                    <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-200">
                        <div 
                            className="px-6 py-4 flex justify-between items-center cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-b border-slate-100"
                            onClick={() => setMostrarCorreos(!mostrarCorreos)}
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900">Configuración de Correos</h3>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                {mostrarCorreos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>

                        {mostrarCorreos && (
                            <div className="p-4 sm:p-6 border-t border-slate-100">
                                <SistemaConfigForm 
                                    configuracionSistema={configuracionSistema}
                                />
                            </div>
                        )}
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
