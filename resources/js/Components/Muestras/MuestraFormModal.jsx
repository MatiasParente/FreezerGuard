import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';

export default function MuestraFormModal({ isOpen, onClose, editingMuestra = null, freezers = [], users = [], usuarios = [] }) {
    const editingFreezer = freezers.find(f => String(f.id) === String(editingMuestra?.freezer_id));
    const [siteId, setSiteId] = useState(editingFreezer?.laboratorio?.sede_id?.toString() ?? '');
    const [labId, setLabId] = useState(editingFreezer?.laboratorio_id?.toString() ?? '');
    const { data, setData, post, put, processing, errors, reset } = useForm({
        titulo: '',
        descripcion: '',
        cantidad: '',
        vencimiento: '',
        temperatura_minima: '-25.0',
        temperatura_maxima: '-10.0',
        observaciones: '',
        freezer_id: editingMuestra?.freezer_id || '',
        usuarios_ids: [],
        users_ids: [],
        estado: 'activo',
    });

    useEffect(() => {
        const freezer = freezers.find(f => String(f.id) === String(editingMuestra?.freezer_id));
        setSiteId(freezer?.laboratorio?.sede_id?.toString() ?? '');
        setLabId(freezer?.laboratorio_id?.toString() ?? '');
        if (editingMuestra) {
            setData({
                titulo: editingMuestra.titulo || '',
                descripcion: editingMuestra.descripcion || '',
                cantidad: editingMuestra.cantidad || '',
                vencimiento: editingMuestra.vencimiento ? editingMuestra.vencimiento.split('T')[0] : '',
                temperatura_minima: editingMuestra.temperatura_minima || '-25.0',
                temperatura_maxima: editingMuestra.temperatura_maxima || '-10.0',
                observaciones: editingMuestra.observaciones || '',
                freezer_id: editingMuestra.freezer_id || '',
                usuarios_ids: editingMuestra.usuarios ? editingMuestra.usuarios.map(u => u.id) : [],
                users_ids: editingMuestra.users ? editingMuestra.users.map(u => u.id) : [],
                estado: editingMuestra.estado,
            });
        } else {
            reset();
            setData('freezer_id', '');
        }
    }, [editingMuestra]);

    const submitForm = (e) => {
        e.preventDefault();
        if (!editingMuestra && data.users_ids.length === 0) {
            alert("Sin docentes seleccionados, se asignará al usuario creador si pertenece a la sede; en otro caso la muestra quedará sin docente asignado.");
        }

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

    const sites = Array.from(new Map(freezers.filter(f => f.laboratorio?.sede).map(f => [String(f.laboratorio.sede_id), f.laboratorio.sede])).values());
    const labs = Array.from(new Map(freezers.filter(f => String(f.laboratorio?.sede_id) === siteId).map(f => [String(f.laboratorio_id), f.laboratorio])).values());
    const availableFreezers = freezers.filter(f => String(f.laboratorio_id) === labId && String(f.laboratorio?.sede_id) === siteId);
    const sedeId = freezers.find(f => String(f.id) === String(data.freezer_id))?.laboratorio?.sede_id;
    const availableUsers = users.filter(u => u.sedes?.some(s => s.id === sedeId));
    const availableParticipants = usuarios.filter(u => u.sedes?.some(s => s.id === sedeId));

    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={submitForm} className="p-6">
                <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-indigo-600" />
                    <span className="p-2"><h2 className="text-lg font-medium text-indigo-800 uppercase tracking-wider">
                        {editingMuestra ? 'Modificar muestra' : 'Agregar muestra'}
                    </h2></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="titulo" value="Nombre" className='text-indigo-800' />
                        <TextInput id="titulo" type="text" className="mt-1 block w-full" value={data.titulo} onChange={e => setData('titulo', e.target.value)} required />
                        <InputError message={errors.titulo} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="cantidad" value="Cantidad" className='text-indigo-800' />
                        <TextInput id="cantidad" type="number" className="mt-1 block w-full" value={data.cantidad} onChange={e => setData('cantidad', e.target.value)} />
                        <InputError message={errors.cantidad} className="mt-2" />
                    </div>
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="descripcion" value="Descripción" className='text-indigo-800' />
                        <TextInput id="descripcion" type="text" className="mt-1 block w-full" value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} />
                        <InputError message={errors.descripcion} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="temperatura_minima" value="Temperatura mínima (°C)" className='text-indigo-800' />
                        <TextInput id="temperatura_minima" type="number" step="0.1" className="mt-1 block w-full" value={data.temperatura_minima} onChange={e => setData('temperatura_minima', e.target.value)} />
                        <InputError message={errors.temperatura_minima} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="temperatura_maxima" value="Temperatura máxima (°C)" className='text-indigo-800' />
                        <TextInput id="temperatura_maxima" type="number" step="0.1" className="mt-1 block w-full" value={data.temperatura_maxima} onChange={e => setData('temperatura_maxima', e.target.value)} />
                        <InputError message={errors.temperatura_maxima} className="mt-2" />
                    </div>
                    <div className="md:col-span-2 min-w-0 space-y-3">
                        <p className="text-sm font-medium text-indigo-800">Ubicación de la muestra</p>
                        <p className="text-xs text-gray-600">Seleccione sede, laboratorio y freezer. La muestra se guardará en el freezer, no en el dispositivo.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                            <div className="min-w-0">
                                <InputLabel htmlFor="muestra_sede" value="Sede" className="text-indigo-800" />
                                <select id="muestra_sede" required className="mt-1 block w-full min-w-0 max-w-full rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={siteId} onChange={e => {
                                    setSiteId(e.target.value);
                                    setLabId('');
                                    setData({ ...data, freezer_id: '', users_ids: [], usuarios_ids: [] });
                                }}>
                                    <option value="">Seleccione una sede</option>
                                    {sites.map(site => <option key={site.id} value={site.id}>{site.nombre}</option>)}
                                </select>
                                {siteId && <p className="mt-1 text-xs text-gray-600 break-words [overflow-wrap:anywhere]">{sites.find(s => String(s.id) === siteId)?.nombre}</p>}
                            </div>
                            <div className="min-w-0">
                                <InputLabel htmlFor="muestra_laboratorio" value="Laboratorio" className="text-indigo-800" />
                                <select id="muestra_laboratorio" required className="mt-1 block w-full min-w-0 max-w-full rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={labId} disabled={!siteId} onChange={e => {
                                    setLabId(e.target.value);
                                    setData({ ...data, freezer_id: '', users_ids: [], usuarios_ids: [] });
                                }}>
                                    <option value="">Seleccione un laboratorio</option>
                                    {labs.map(lab => <option key={lab.id} value={lab.id}>{lab.nombre}</option>)}
                                </select>
                                {labId && <p className="mt-1 text-xs text-gray-600 break-words [overflow-wrap:anywhere]">{labs.find(l => String(l.id) === labId)?.nombre}</p>}
                            </div>
                        </div>
                        <fieldset className="min-w-0">
                            <legend className="text-sm font-medium text-indigo-800">Freezer</legend>
                            <div className="mt-1 max-h-48 overflow-y-auto overscroll-contain rounded-md border border-gray-300 bg-white p-2 space-y-2">
                                {availableFreezers.length ? availableFreezers.map(f => (
                                    <label key={f.id} className="flex min-w-0 items-start gap-3 rounded-md p-2 cursor-pointer border border-transparent has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 focus-within:ring-2 focus-within:ring-indigo-500">
                                        <input type="radio" name="freezer_id" value={f.id} checked={String(data.freezer_id) === String(f.id)} onChange={() => setData({ ...data, freezer_id: f.id, users_ids: [], usuarios_ids: [] })} required className="mt-1 shrink-0 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-sm text-gray-900">
                                            <span className="block font-medium">{f.ubicacion}</span>
                                            <span className="mt-1 block text-xs text-gray-600">{f.dispositivo ? `Dispositivo: ${f.dispositivo.nombre}` : 'Sin dispositivo asociado'}</span>
                                        </span>
                                    </label>
                                )) : <p className="p-2 text-sm text-gray-600">{labId ? 'No hay freezers en este laboratorio.' : 'Seleccione una sede y un laboratorio para ver los freezers.'}</p>}
                            </div>
                        </fieldset>
                        <InputError message={errors.freezer_id} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="vencimiento" value="Fecha de vencimiento" className='text-indigo-800' />
                        <TextInput id="vencimiento" type="date" className="mt-1 block w-full" value={data.vencimiento} onChange={e => setData('vencimiento', e.target.value)} />
                        <InputError message={errors.vencimiento} className="mt-2" />
                    </div>
                    
                    {/* Selección de docentes*/}
                    <div>
                        <InputLabel value="Docentes responsables (Emails)" className='text-indigo-800' />
                        <div className="mt-1 max-h-36 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1.5 bg-white">
                            {availableUsers.map(u => {
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
                                        <span>{u.name} <span className="text-slate-400">({u.email})</span></span>
                                    </label>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Si no se selecciona ningún usuario, se asigna al creador si pertenece a la sede.</p>
                        <InputError message={errors.users_ids} className="mt-2" />
                    </div>

                    {/* Selección de Alumnos*/}
                    <div>
                        <InputLabel value="Alumnos asignados" className='text-indigo-800' />
                        <div className="mt-1 max-h-36 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1.5 bg-white">
                            {availableParticipants.map(u => {
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
