import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function ForceDeleteDispositivoModal({ isOpen, onClose, dispositivo }) {
    const { delete: forceDeleteCall, processing } = useForm();

    if (!dispositivo) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        forceDeleteCall(route('configuracion.dispositivo.forceDelete', dispositivo.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wider">
                    Eliminación definitiva
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    ¿Estás seguro de eliminar permanentemente el dispositivo <span className="font-semibold text-gray-900">{dispositivo.nombre}</span>? Se borrarán permanentemente sus mediciones y registros asociados.
                </p>
                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <DangerButton disabled={processing}>
                        {processing ? 'Eliminando...' : 'Eliminar Permanentemente'}
                    </DangerButton>
                </div>
            </form>
        </Modal>
    );
}
