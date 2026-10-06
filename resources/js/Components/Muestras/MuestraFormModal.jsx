import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Edit } from 'lucide-react';

export default function MuestraFormModal({ isOpen, onClose, editingMuestra = null, freezers = [], users = [], usuarios = [] }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        titulo: '',
        descripcion: '',
        cantidad: '',
        vencimiento: '',
        temperatura_minima: '-25.0',
        temperatura_maxima: '-10.0',
        observaciones: '',
        freezer_id: '',
        usuarios_ids: [],
        users_ids: [],
        estado: 'activo',
    });

    useEffect(() => {
        if (editingMuestra) {
            setData({
                titulo: editingMuestra.titulo || '',
                descripcion: editingMuestra.descripcion || '',
                cantidad: editingMuestra.cantidad ?? '',
                vencimiento: editingMuestra.vencimiento ? editingMuestra.vencimiento.split('T')[0] : '',
                temperatura_minima: editingMuestra.temperatura_minima ?? '-25.0',
                temperatura_maxima: editingMuestra.temperatura_maxima ?? '-10.0',
                observaciones: editingMuestra.observaciones || '',
                freezer_id: editingMuestra.freezer_id || '',
                usuarios_ids: editingMuestra.usuarios ? editingMuestra.usuarios.map(u => u.id) : [],
                users_ids: editingMuestra.users ? editingMuestra.users.map(u => u.id) : [],
                estado: editingMuestra.estado,
            });
        } else {
            reset();
        }
    }, [editingMuestra]);

    const submitForm = (e) => {
        e.preventDefault();
if (editingMuestra) {
            put(route('muestras.update', editingMuestra.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('muestras.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Modal title="Formulario de muestra" show={isOpen} onClose={onClose}>
            <form onSubmit={submitForm} className="p-6">
                <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-lg font-medium text-indigo-800">
                        {editingMuestra ? 'Modificar muestra' : 'Agregar muestra'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="titulo" value="Nombre" className='text-indigo-800' />
                        <TextInput id="titulo" type="text" className="mt-1 block w-full" value={data.titulo} onChange={e => setData('titulo', e.target.value)} required aria-invalid={!!errors.titulo} aria-describedby={errors.titulo ? 'titulo-error' : undefined} />
                        <InputError id="titulo-error" message={errors.titulo} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="cantidad" value="Cantidad" className='text-indigo-800' />
                        <TextInput id="cantidad" type="number" className="mt-1 block w-full" value={data.cantidad} onChange={e => setData('cantidad', e.target.value)} aria-invalid={!!errors.cantidad} aria-describedby={errors.cantidad ? 'cantidad-error' : undefined} />
                        <InputError id="cantidad-error" message={errors.cantidad} className="mt-2" />
                    </div>
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="descripcion" value="Descripción" className='text-indigo-800' />
                        <TextInput id="descripcion" type="text" className="mt-1 block w-full" value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} aria-invalid={!!errors.descripcion} aria-describedby={errors.descripcion ? 'descripcion-error' : undefined} />
                        <InputError id="descripcion-error" message={errors.descripcion} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="temperatura_minima" value="Temperatura mínima (°C)" className='text-indigo-800' />
                        <TextInput id="temperatura_minima" type="number" step="0.1" className="mt-1 block w-full" value={data.temperatura_minima} onChange={e => setData('temperatura_minima', e.target.value)} aria-invalid={!!errors.temperatura_minima} aria-describedby={errors.temperatura_minima ? 'temperatura_minima-error' : undefined} />
                        <InputError id="temperatura_minima-error" message={errors.temperatura_minima} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="temperatura_maxima" value="Temperatura máxima (°C)" className='text-indigo-800' />
                        <TextInput id="temperatura_maxima" type="number" step="0.1" className="mt-1 block w-full" value={data.temperatura_maxima} onChange={e => setData('temperatura_maxima', e.target.value)} aria-invalid={!!errors.temperatura_maxima} aria-describedby={errors.temperatura_maxima ? 'temperatura_maxima-error' : undefined} />
                        <InputError id="temperatura_maxima-error" message={errors.temperatura_maxima} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="freezer_id" value="Ubicación (Freezer)" className='text-indigo-800' />
                        <select id="freezer_id" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={data.freezer_id} onChange={e => setData('freezer_id', e.target.value)} required>
                            <option value="">Seleccione...</option>
                            {freezers?.map(f => (
                                <option key={f.id} value={f.id}>{f.ubicacion}</option>
                            ))}
                        </select>
                        <InputError message={errors.freezer_id} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="vencimiento" value="Fecha de vencimiento" className='text-indigo-800' />
                        <TextInput id="vencimiento" type="date" className="mt-1 block w-full" value={data.vencimiento} onChange={e => setData('vencimiento', e.target.value)} aria-invalid={!!errors.vencimiento} aria-describedby={errors.vencimiento ? 'vencimiento-error' : undefined} />
                        <InputError id="vencimiento-error" message={errors.vencimiento} className="mt-2" />
                    </div>

                    {/* Selección de docentes*/}
                    <div>
                        <InputLabel value="Docentes responsables (Emails)" className='text-indigo-800' />
                        <div className="mt-1 max-h-36 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1.5 bg-white">
                            {users?.map(u => {
                                const isChecked = data.users_ids.includes(u.id) || data.users_ids.includes(String(u.id));
                                return (
                                    <label key={u.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('users_ids', [...data.users_ids, u.id]);
                                                } else {
                                                    setData('users_ids', data.users_ids.filter(id => id !== u.id && id !== String(u.id)));
                                                }
                                            }}
                                        />
                                        <span>{u.name} <span className="text-slate-600">({u.email})</span></span>
                                    </label>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Si no se selecciona ningún usuario, se te asigna a ti por defecto.</p>
                        <InputError message={errors.users_ids} className="mt-2" />
                    </div>

                    {/* Selección de Alumnos*/}
                    <div>
                        <InputLabel value="Alumnos asignados" className='text-indigo-800' />
                        <div className="mt-1 max-h-36 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1.5 bg-white">
                            {usuarios?.map(u => {
                                const isChecked = data.usuarios_ids.includes(u.id) || data.usuarios_ids.includes(String(u.id));
                                return (
                                    <label key={u.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('usuarios_ids', [...data.usuarios_ids, u.id]);
                                                } else {
                                                    setData('usuarios_ids', data.usuarios_ids.filter(id => id !== u.id && id !== String(u.id)));
                                                }
                                            }}
                                        />
                                        <span>{u.nombre}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <InputError message={errors.usuarios_ids} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel htmlFor="observaciones" value="Observaciones" className='text-indigo-800' />
                        <textarea id="observaciones" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows="3" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} />
                        <InputError message={errors.observaciones} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {editingMuestra ? 'Guardar Cambios' : 'Agregar'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
