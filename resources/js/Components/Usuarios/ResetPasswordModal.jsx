import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

export default function ResetPasswordModal({ isOpen, onClose, user }) {
    const { post, processing } = useForm();

    if (!user) return null;

    const handleReset = (e) => {
        e.preventDefault();
        post(route('usuarios.reset-password', user.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={handleReset} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Resetear Contraseña
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    ¿Estás seguro de que deseas generar una nueva contraseña aleatoria de 8 caracteres para el usuario <span className="font-semibold text-gray-900">{user.name}</span> ({user.email})?
                </p>
                <div className="bg-gray-50 border border-gray-200 text-xs rounded-xl p-3 mb-6">
                    <strong>Se enviará un correo electrónico inmediatamente a <span className="font-bold">{user.email}</span> con las nuevas credenciales.</strong>
                </div>

                <div className="flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                        {processing ? 'Reseteando...' : 'Resetear y Enviar Mail'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
