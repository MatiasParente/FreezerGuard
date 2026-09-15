import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Cpu, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import DispositivosTable from '@/Components/Configuracion/DispositivosTable';
import HistorialDispositivosTable from '@/Components/Configuracion/HistorialDispositivosTable';
import AddDispositivoModal from '@/Components/Configuracion/AddDispositivoModal';
import EditDispositivoModal from '@/Components/Configuracion/EditDispositivoModal';
import SistemaConfigForm from '@/Components/Configuracion/SistemaConfigForm';

export default function configuracion({ 
    dispositivos, 
    dispositivosInactivos, 
    filters, 
    freezers, 
    available_freezers, 
    configuracionSistema 
}) {
    // Estado desplegable de los acordeones
    const [mostrarDispositivos, setMostrarDispositivos] = useState(true);
    const [mostrarCorreos, setMostrarCorreos] = useState(true);

    // Estado para alternar entre tabla de activos y tabla de historial inactivos
    const [verInactivos, setVerInactivos] = useState(false);

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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Configuración General
                </h2>
            }
        >
            <Head title="Configuración" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* DISPOSITIVOS Y SENSORES */}
                    <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-100">
                        <div 
                            className="px-6 py-4 flex justify-between items-center cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-b border-slate-100"
                            onClick={() => setMostrarDispositivos(!mostrarDispositivos)}
                        >
                            <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    {verInactivos ? 'Historial de Dispositivos Inactivos' : 'Dispositivos y Sensores Activos'}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {verInactivos ? `${dispositivosInactivos?.total || 0} inactivos` : `${dispositivos?.total || 0} activos`}
                                </span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                {mostrarDispositivos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>

                        {mostrarDispositivos && (
                            <div className="p-4 sm:p-6 border-t border-slate-100">
                                {!verInactivos ? (
                                    <DispositivosTable 
                                        dispositivos={dispositivos}
                                        filters={filters}
                                        freezers={freezers}
                                        onOpenAddModal={() => setIsAddModalOpen(true)}
                                        onOpenEditModal={openEditModal}
                                        verInactivos={verInactivos}
                                        onToggleInactivos={() => setVerInactivos(!verInactivos)}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-indigo-50/60 p-3 rounded-lg border border-indigo-100">
                                            <span className="text-xs font-bold text-indigo-900">Viendo Historial de Dispositivos Inactivos</span>
                                            <button
                                                onClick={() => setVerInactivos(false)}
                                                className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-md text-xs font-bold hover:bg-indigo-50 transition-colors"
                                            >
                                                Volver a Dispositivos Activos
                                            </button>
                                        </div>
                                        <HistorialDispositivosTable 
                                            dispositivosInactivos={dispositivosInactivos}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CONFIGURACIÓN DE CORREOS Y PLANTILLA DE EMAIL (DEBAJO DE DISPOSITIVOS) */}
                    <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-100">
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

            {/* Modal Agregar Dispositivo */}
            <AddDispositivoModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                availableFreezers={available_freezers}
            />

            {/* Modal Editar Dispositivo */}
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
