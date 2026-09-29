import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function DeleteDispositivoModal({ isOpen, onClose, dispositivo }) {
    const { delete: destroy, processing } = useForm();

    if (!dispositivo) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        destroy(route('configuracion.dispositivo.destroy', dispositivo.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Desactivar Dispositivo
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    ¿Estás seguro de mover el dispositivo <span className="font-semibold text-gray-900">{dispositivo.nombre}</span> al historial de inactivos? Podrás restaurarlo en cualquier momento.
                </p>
                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <DangerButton disabled={processing}>
                        {processing ? 'Desactivando...' : 'Desactivar Dispositivo'}
                    </DangerButton>
                </div>
            </form>
        </Modal>
    );
}
