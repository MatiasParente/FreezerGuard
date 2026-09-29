import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function DeleteUserModal({ isOpen, onClose, user }) {
    const { delete: destroy, processing } = useForm();

    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        destroy(route('usuarios.destroy', user.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Desactivar Usuario
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    ¿Estás seguro de que deseas desactivar a <span className="font-semibold text-gray-900">{user.name}</span>? Podrás restaurar su cuenta en cualquier momento desde los usuarios inactivos.
                </p>
                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <DangerButton disabled={processing}>
                        {processing ? 'Desactivando...' : 'Desactivar Usuario'}
                    </DangerButton>
                </div>
            </form>
        </Modal>
    );
}
