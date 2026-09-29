import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function AddUserModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('usuarios.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={isOpen} onClose={handleClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">
                    Crear Nuevo Usuario
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Ingrese el usuario y correo. Se generará automáticamente una contraseña aleatoria de 8 caracteres y se enviará por correo al usuario.
                </p>

                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nombre de usuario" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            placeholder="Ej: Juan Pérez"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Correo electrónico" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            placeholder="ejemplo@correo.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={handleClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Generando y enviando...' : 'Crear Usuario'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
