import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function ForceDeleteUserModal({ isOpen, onClose, user }) {
    const { delete: forceDeleteCall, processing } = useForm();

    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        forceDeleteCall(route('usuarios.force-delete', user.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wider">
                    Eliminación definitiva
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    ¿Estás seguro de eliminar permanentemente a <span className="font-semibold text-gray-900">{user.name}</span>? Esta acción no se puede deshacer y se borrará completamente de la base de datos.
                </p>
                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <DangerButton disabled={processing}>
                        {processing ? 'Eliminando...' : 'Eliminar'}
                    </DangerButton>
                </div>
            </form>
        </Modal>
    );
}
