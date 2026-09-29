import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function RestoreUserModal({ isOpen, onClose, user }) {
    const { post, processing } = useForm();

    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('usuarios.restore', user.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Restaurar Usuario
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    ¿Deseas reactivar la cuenta del usuario <span className="font-semibold text-gray-900">{user.name}</span>? Podrá volver a iniciar sesión normalmente.
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
