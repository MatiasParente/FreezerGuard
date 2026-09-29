import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function RestoreDispositivoModal({ isOpen, onClose, dispositivo }) {
    const { post, processing } = useForm();

    if (!dispositivo) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('configuracion.dispositivo.restore', dispositivo.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Restaurar dispositivo
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    ¿Deseas restaurar el dispositivo <span className="font-semibold text-gray-900">{dispositivo.nombre}</span> a la lista de dispositivos activos?
                </p>
                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                    >
                        {processing ? 'Restaurando...' : 'Restaurar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
