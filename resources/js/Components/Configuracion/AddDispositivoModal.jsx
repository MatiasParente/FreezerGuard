import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function AddDispositivoModal({ isOpen, onClose, availableFreezers = [] }) {
    const addForm = useForm({
        nombre: '',
        descripcion: '',
        freezer_id: '',
        is_new_freezer: false,
        nueva_ubicacion: '',
    });

    const submitAddForm = (e) => {
        e.preventDefault();
        addForm.post(route('configuracion.dispositivo.store'), {
            onSuccess: () => {
                addForm.reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <form onSubmit={submitAddForm} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Agregar Dispositivo
                </h2>

                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="nombre" value="Nombre del Dispositivo" />
                        <TextInput id="nombre" type="text" className="mt-1 block w-full" value={addForm.data.nombre} onChange={e => addForm.setData('nombre', e.target.value)} required />
                        <InputError message={addForm.errors.nombre} className="mt-2" />
                    </div>
                    
                    <div>
                        <InputLabel htmlFor="descripcion" value="Descripción" />
                        <textarea id="descripcion" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows="3" value={addForm.data.descripcion} onChange={e => addForm.setData('descripcion', e.target.value)} />
                        <InputError message={addForm.errors.descripcion} className="mt-2" />
                    </div>

                    <div className="flex items-center mt-4 mb-2">
                        <input
                            id="is_new_freezer"
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            checked={addForm.data.is_new_freezer}
                            onChange={(e) => addForm.setData('is_new_freezer', e.target.checked)}
                        />
                        <label htmlFor="is_new_freezer" className="ml-2 block text-sm text-gray-900">
                            Crear nuevo laboratorio (Freezer)
                        </label>
                    </div>

                    {!addForm.data.is_new_freezer ? (
                        <div>
                            <InputLabel htmlFor="freezer_id" value="Ubicación Existente (Freezer)" />
                            <select id="freezer_id" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={addForm.data.freezer_id} onChange={e => addForm.setData('freezer_id', e.target.value)} required={!addForm.data.is_new_freezer}>
                                <option value="">Seleccione...</option>
                                {availableFreezers?.map(f => (
                                    <option key={f.id} value={f.id}>{f.ubicacion}</option>
                                ))}
                            </select>
                            <InputError message={addForm.errors.freezer_id} className="mt-2" />
                        </div>
                    ) : (
                        <div>
                            <InputLabel htmlFor="nueva_ubicacion" value="Nueva Ubicación del Laboratorio" />
                            <TextInput 
                                id="nueva_ubicacion" 
                                type="text" 
                                className="mt-1 block w-full" 
                                value={addForm.data.nueva_ubicacion} 
                                onChange={e => addForm.setData('nueva_ubicacion', e.target.value)} 
                                required={addForm.data.is_new_freezer} 
                                placeholder="Ej: Lab Central 1" 
                            />
                            <InputError message={addForm.errors.nueva_ubicacion} className="mt-2" />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={addForm.processing}>
                        Agregar
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
