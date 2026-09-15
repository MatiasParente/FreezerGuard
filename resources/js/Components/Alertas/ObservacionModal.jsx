import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ObservacionModal({ isOpen, onClose, alerta = null }) {
    const { data, setData, put, processing, reset } = useForm({
        observacion: '',
    });

    useEffect(() => {
        if (alerta) {
            setData('observacion', alerta.observacion || '');
        } else {
            reset();
        }
    }, [alerta]);

    const submitEdit = (e) => {
        e.preventDefault();
        if (!alerta) return;

        put(route('alertas.update', alerta.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={submitEdit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Modificar Observación
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="observacion" value="Observación" />
                    <TextInput
                        id="observacion"
                        type="text"
                        name="observacion"
                        value={data.observacion}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('observacion', e.target.value)}
                        isFocused={true}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
