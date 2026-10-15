import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Building2, FlaskConical, Users, Snowflake, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, AlertTriangle, Plus, Pencil, Trash2, Search } from 'lucide-react';

function SitePicker({ sedes, selected, onChange }) {
    return <fieldset className="space-y-2"><legend className="text-sm font-medium text-slate-700">Sedes (una o más)</legend>
        {sedes.map(s => <label key={s.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={selected.includes(s.id)} onChange={e => onChange(e.target.checked ? [...selected, s.id] : selected.filter(id => id !== s.id))} />{s.nombre}
        </label>)}
    </fieldset>;
}

function SedeForm() {
    const form = useForm({ nombre: '' });
    return <form onSubmit={e => { e.preventDefault(); form.post(route('sedes.store'), { onSuccess: () => form.reset() }); }} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700" htmlFor="sede-nombre">Nombre de la sede</label>
        <input id="sede-nombre" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} aria-invalid={!!form.errors.nombre} required />
        {form.errors.nombre && <p className="text-sm text-red-600">{form.errors.nombre}</p>}
        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150" disabled={form.processing}>
            <Plus className="w-4 h-4" /> Crear Sede
        </button>
    </form>;
}

function LabForm({ sedes }) {
    const form = useForm({ sede_id: '', nombre: '' });
    return <form onSubmit={e => { e.preventDefault(); form.post(route('laboratorios.store'), { onSuccess: () => form.reset() }); }} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700" htmlFor="laboratorio-sede">Sede del laboratorio</label>
        <select id="laboratorio-sede" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.data.sede_id} onChange={e => form.setData('sede_id', e.target.value)} required disabled={!sedes.length}>
            <option value="">Seleccionar sede</option>{sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <label className="block text-sm font-medium text-slate-700" htmlFor="laboratorio-nombre">Nombre del laboratorio</label>
        <input id="laboratorio-nombre" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} required disabled={!sedes.length} />
        {(form.errors.nombre || form.errors.sede_id) && <p className="text-sm text-red-600">{form.errors.nombre || form.errors.sede_id}</p>}
        {!sedes.length && <p className="text-sm text-slate-600">Primero crea una sede para agregar laboratorios.</p>}
        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150 disabled:opacity-50" disabled={form.processing || !sedes.length}>
            <Plus className="w-4 h-4" /> Crear Laboratorio
        </button>
    </form>;
}

function RenameForm({ item, routeName, label }) {
    const form = useForm({ nombre: item.nombre });
    return <form className="flex items-center gap-2" onSubmit={e => { e.preventDefault(); form.put(route(routeName, item.id)); }}>
        <input aria-label={label} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 flex-1 max-w-xs" value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} required />
        <button className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-all shadow-sm hover:scale-105" disabled={form.processing} title="Renombrar">
            <Pencil className="w-3.5 h-3.5" />
        </button>
        {form.errors.nombre && <span className="text-sm text-red-600">{form.errors.nombre}</span>}
    </form>;
}

function DeleteAction({ item, routeName, blocked, explanation, noun }) {
    const form = useForm({});
    return <div className="text-sm">
        {blocked ? <p className="text-slate-500 text-xs">{explanation}</p> : <button type="button" disabled={form.processing}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-sm hover:scale-105"
            title={`Eliminar ${noun}`}
            onClick={() => { if (window.confirm(`¿Eliminar ${noun} «${item.nombre}»? Esta acción no se puede deshacer.`)) form.delete(route(routeName, item.id)); }}>
            <Trash2 className="w-4 h-4" />
        </button>}
    </div>;
}

function FreezerAssignment({ freezer, sedes }) {
    const form = useForm({ laboratorio_id: freezer.laboratorio_id || '' });
    const options = sedes.flatMap(s => s.laboratorios.map(l => ({ id: l.id, label: `${s.nombre} / ${l.nombre}` })));
    const current = options.find(option => String(option.id) === String(freezer.laboratorio_id));
    const destination = options.find(option => String(option.id) === String(form.data.laboratorio_id));
    return <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); form.put(route('freezers.laboratorio.update', freezer.id)); }}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <span>{freezer.ubicacion}</span>
            </div>
            <select className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 max-w-xs flex-1" value={form.data.laboratorio_id} onChange={e => form.setData('laboratorio_id', e.target.value)} required disabled={!sedes.some(s => s.laboratorios.length)}>
                <option value="">Asignar laboratorio</option>{options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-3 py-2 rounded-lg shadow-sm transition ease-in-out duration-150 disabled:opacity-50" disabled={form.processing || !form.data.laboratorio_id || String(form.data.laboratorio_id) === String(freezer.laboratorio_id)}>
                {freezer.laboratorio_id ? 'Mover' : 'Asignar'}
            </button>
            {form.errors.laboratorio_id && <span role="alert" className="text-sm text-red-700">{form.errors.laboratorio_id}</span>}
        </form>
        <p className="text-xs text-slate-500 mt-1 ml-6">Actual: {current?.label || 'Sin laboratorio'} · Destino: {destination?.label || 'Selecciona uno'}</p>
    </div>;
}

function ParticipantForm({ sedes, usuario }) {
    const form = useForm({ nombre: usuario?.nombre || '', email: usuario?.email || '', telefono: usuario?.telefono || '', sede_ids: usuario?.sedes?.map(s => s.id) || [] });
    useEffect(() => { if (usuario) form.setData({ nombre: usuario.nombre, email: usuario.email, telefono: usuario.telefono || '', sede_ids: usuario.sedes.map(s => s.id) }); }, [usuario?.id, usuario?.sedes]);
    const prefix = usuario ? `participante-${usuario.id}` : 'participante-nuevo';
    return <form onSubmit={e => {
        e.preventDefault();
        if (usuario) form.put(route('participantes.update', usuario.id));
        else form.post(route('participantes.store'), { onSuccess: () => form.reset() });
    }} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor={`${prefix}-nombre`}>Nombre</label>
                <input id={`${prefix}-nombre`} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor={`${prefix}-email`}>Correo electrónico</label>
                <input id={`${prefix}-email`} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor={`${prefix}-telefono`}>Teléfono (opcional)</label>
                <input id={`${prefix}-telefono`} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" type="tel" value={form.data.telefono} onChange={e => form.setData('telefono', e.target.value)} />
            </div>
        </div>
        <SitePicker sedes={sedes} selected={form.data.sede_ids} onChange={ids => form.setData('sede_ids', ids)} />
        {(form.errors.nombre || form.errors.email || form.errors.telefono || form.errors.sede_ids) && <p className="text-sm text-red-600">{form.errors.nombre || form.errors.email || form.errors.telefono || form.errors.sede_ids}</p>}
        <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150 disabled:opacity-50" disabled={form.processing || !sedes.length}>
            {usuario ? 'Actualizar participante' : 'Crear participante'}
        </button>
    </form>;
}

export default function Index({ sedes, freezersSinLaboratorio, usuarios, filtrosParticipantes = {}, seccionActiva = 'estructura', alertasSinDestinatarios = 0, correoDesactivado = false }) {
    const { flash, errors } = usePage().props;
    const [section, setSection] = useState(seccionActiva);
    useEffect(() => setSection(seccionActiva), [seccionActiva]);

    const [mostrarFormSede, setMostrarFormSede] = useState(false);
    const [mostrarFormLab, setMostrarFormLab] = useState(false);
    const [mostrarFormParticipante, setMostrarFormParticipante] = useState(false);

    const totalLabs = sedes.reduce((acc, s) => acc + s.laboratorios.length, 0);
    const totalPersonas = sedes.reduce((acc, s) => acc + s.users_count + s.usuarios_count, 0);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 uppercase tracking-wider">
                    Sedes y Laboratorios
                </h2>
            }
        >
            <Head title="Sedes y laboratorios" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Mensajes Flash */}
                    {flash?.success && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span className="text-sm font-medium">{flash.success}</span>
                        </div>
                    )}
                    {flash?.warning && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span className="text-sm font-medium">{flash.warning}</span>
                        </div>
                    )}
                    {(errors?.sede || errors?.laboratorio) && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                            <span className="text-sm font-medium">{errors.sede || errors.laboratorio}</span>
                        </div>
                    )}

                    {/* Avisos del sistema */}
                    {correoDesactivado && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 shadow-sm text-sm">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>El envío de correos está desactivado. Las alertas quedan pendientes hasta que lo actives en{' '}
                                <a className="font-semibold underline underline-offset-2" href={route('configuracion.configuracion')}>Configuración</a>.
                            </span>
                        </div>
                    )}
                    {alertasSinDestinatarios > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 shadow-sm text-sm">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>
                                <strong>{alertasSinDestinatarios} {alertasSinDestinatarios === 1 ? 'alerta pendiente no tiene destinatario' : 'alertas pendientes no tienen destinatario'}.</strong>{' '}
                                Asigna los freezers a sus laboratorios y responsables, o configura el correo global de respaldo.{' '}
                                <a className="font-semibold underline underline-offset-2" href={route('configuracion.configuracion')}>Configurar correo de respaldo</a>
                            </span>
                        </div>
                    )}

                    {/* Estadísticas superiores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Sedes</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{sedes.length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Laboratorios</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalLabs}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                <FlaskConical className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Personas Asignadas</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalPersonas}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs de navegación */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {[
                            ['estructura', `Estructura (${sedes.length})`, Building2],
                            ['participantes', `Participantes (${usuarios.total})`, Users],
                        ].map(([key, label, Icon]) => (
                            <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs uppercase tracking-widest shadow-sm transition ease-in-out duration-150 ${section === key
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                }`}>
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ====================== ESTRUCTURA ====================== */}
                    {section === 'estructura' && (
                        <div className="space-y-6">
                            {/* Acciones rápidas */}
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => setMostrarFormSede(!mostrarFormSede)}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150">
                                    <Plus className="w-4 h-4" /> Nueva Sede
                                </button>
                                <button onClick={() => setMostrarFormLab(!mostrarFormLab)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-50 transition ease-in-out duration-150">
                                    <Plus className="w-4 h-4" /> Nuevo Laboratorio
                                </button>
                            </div>

                            {/* Formularios desplegables */}
                            {mostrarFormSede && (
                                <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-indigo-600" /> Crear Sede
                                    </h3>
                                    <SedeForm />
                                </div>
                            )}
                            {mostrarFormLab && (
                                <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FlaskConical className="w-4 h-4 text-purple-600" /> Crear Laboratorio
                                    </h3>
                                    <LabForm sedes={sedes} />
                                </div>
                            )}

                            {/* Pasos de configuración */}
                            <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pasos para preparar la estructura</h3>
                                        <p className="text-xs text-slate-500">Sigue estos pasos en orden para configurar correctamente la organización</p>
                                    </div>
                                </div>
                                <ol className="flex flex-wrap gap-x-6 gap-y-2 list-decimal pl-5 text-sm text-slate-700">
                                    <li><span className="underline underline-offset-2 cursor-pointer" onClick={() => setMostrarFormSede(true)}>Crear sede</span></li>
                                    <li><span className="underline underline-offset-2 cursor-pointer" onClick={() => setMostrarFormLab(true)}>Crear laboratorio</span></li>
                                    <li><Link className="underline underline-offset-2" href={route('usuarios.index')}>Asignar sedes a responsables</Link></li>
                                    <li><a className="underline underline-offset-2" href="#freezers-pendientes">Ubicar freezers ({freezersSinLaboratorio.length} pendientes)</a></li>
                                </ol>
                            </div>

                            {/* Estructura de sedes */}
                            <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-200">
                                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Estructura Organizacional</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {sedes.length} {sedes.length === 1 ? 'sede' : 'sedes'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {sedes.length === 0 && <p className="text-sm text-slate-500">No hay sedes creadas. Usa el botón «Nueva Sede» para comenzar.</p>}
                                    <div className="space-y-4">
                                        {sedes.map(s => (
                                            <details key={s.id} className="rounded-xl border border-slate-200 overflow-hidden group">
                                                <summary className="cursor-pointer px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Building2 className="w-4 h-4 text-indigo-600" />
                                                        <span className="font-semibold text-slate-900">{s.nombre}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                                                            {s.laboratorios.length} labs
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                                                            {s.users_count + s.usuarios_count} personas
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="px-4 py-4 space-y-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <RenameForm item={s} routeName="sedes.update" label="Nombre de sede" />
                                                        <DeleteAction item={s} routeName="sedes.destroy" noun="sede" blocked={s.laboratorios.length + s.users_count + s.usuarios_count > 0}
                                                            explanation="Para eliminar esta sede, quitá o reasigná primero sus laboratorios y personas." />
                                                    </div>

                                                    {s.laboratorios.length > 0 && (
                                                        <div className="space-y-3 ml-4">
                                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laboratorios</h4>
                                                            {s.laboratorios.map(l => (
                                                                <details key={l.id} className="rounded-lg border border-slate-100 overflow-hidden">
                                                                    <summary className="cursor-pointer px-3 py-2 bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                                                                            <span className="font-medium text-sm text-slate-800">{l.nombre}</span>
                                                                            <span className="text-[11px] text-slate-500">{l.freezers.length} freezers</span>
                                                                        </div>
                                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                                    </summary>
                                                                    <div className="px-3 py-3 space-y-3 border-t border-slate-100">
                                                                        <div className="flex items-center gap-3">
                                                                            <RenameForm item={l} routeName="laboratorios.update" label="Nombre de laboratorio" />
                                                                            <DeleteAction item={l} routeName="laboratorios.destroy" noun="laboratorio" blocked={l.freezers.length > 0}
                                                                                explanation="Para eliminar este laboratorio, mové primero sus freezers a otro." />
                                                                        </div>
                                                                        {l.freezers.length > 0 && (
                                                                            <div className="space-y-2">
                                                                                {l.freezers.map(f => <FreezerAssignment key={f.id} freezer={f} sedes={sedes} />)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </details>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Freezers pendientes */}
                            <div id="freezers-pendientes" className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-200">
                                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Snowflake className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Freezers sin Laboratorio</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${freezersSinLaboratorio.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                            {freezersSinLaboratorio.length} pendientes
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {freezersSinLaboratorio.length === 0
                                        ? <p className="text-sm text-slate-500">Todos los freezers están asignados a un laboratorio.</p>
                                        : <div className="space-y-3">{freezersSinLaboratorio.map(f => <FreezerAssignment key={f.id} freezer={f} sedes={sedes} />)}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================== PARTICIPANTES ====================== */}
                    {section === 'participantes' && (
                        <div className="space-y-6">

                            {/* Botón crear participante */}
                            <button onClick={() => setMostrarFormParticipante(!mostrarFormParticipante)}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150">
                                <Plus className="w-4 h-4" /> Crear Participante
                            </button>

                            {mostrarFormParticipante && (
                                <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-teal-600" /> Nuevo Participante de Muestras
                                    </h3>
                                    <ParticipantForm sedes={sedes} />
                                </div>
                            )}

                            {/* Búsqueda */}
                            <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                                <form action={route('sedes.index')} method="get" className="flex flex-wrap items-end gap-3">
                                    <input type="hidden" name="seccion" value="participantes" />
                                    <div className="w-full sm:w-auto flex-1 max-w-md">
                                        <label htmlFor="buscar-participante" className="block text-sm font-medium text-slate-700 mb-1">Buscar por nombre o correo</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input id="buscar-participante" name="participante" type="search" defaultValue={filtrosParticipantes.participante || ''}
                                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Nombre o email..." />
                                        </div>
                                    </div>
                                    <button type="submit" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-sm transition ease-in-out duration-150">
                                        <Search className="w-4 h-4" /> Buscar
                                    </button>
                                </form>
                            </div>

                            {/* Tabla de participantes */}
                            <div className="bg-white shadow-sm sm:rounded-2xl overflow-hidden border border-slate-200">
                                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-lg font-bold text-slate-900">Participantes de Muestras</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                                            {usuarios.total} registros
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {usuarios.data.length === 0
                                        ? <p className="text-sm text-slate-500">No se encontraron participantes.</p>
                                        : (
                                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                                <table className="w-full text-left text-sm text-slate-600">
                                                    <thead className="bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-semibold border-b border-slate-200">
                                                        <tr>
                                                            <th className="px-4 py-3">Nombre</th>
                                                            <th className="px-4 py-3">Correo Electrónico</th>
                                                            <th className="px-4 py-3">Teléfono</th>
                                                            <th className="px-4 py-3">Sedes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {usuarios.data.map(u => (
                                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                                <td className="px-4 py-3 font-medium text-slate-900">{u.nombre}</td>
                                                                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                                                                <td className="px-4 py-3 text-slate-600">{u.telefono || '—'}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {u.sedes.length > 0 ? u.sedes.map(s => (
                                                                            <span key={s.id} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">{s.nombre}</span>
                                                                        )) : <span className="text-xs text-slate-400">Sin sede</span>}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    }

                                    {/* Detalle editable por participante */}
                                    {usuarios.data.length > 0 && (
                                        <div className="mt-6 space-y-3">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Editar participantes</h4>
                                            {usuarios.data.map(u => (
                                                <details key={u.id} className="rounded-xl border border-slate-200 overflow-hidden">
                                                    <summary className="cursor-pointer px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-sm">
                                                        <span className="font-medium text-slate-800">{u.nombre} — {u.sedes.map(s => s.nombre).join(', ') || 'Sin sede'}</span>
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </summary>
                                                    <div className="p-4 border-t border-slate-100">
                                                        <ParticipantForm sedes={sedes} usuario={u} />
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Paginación */}
                                {usuarios.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-slate-100">
                                        <nav aria-label="Páginas de participantes" className="flex flex-wrap gap-2 text-sm">
                                            {usuarios.links.map((link, index) => link.url
                                                ? <Link key={index} href={link.url} aria-current={link.active ? 'page' : undefined}
                                                    className={`rounded-lg px-3 py-2 transition-colors ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 border border-slate-200 hover:bg-slate-50'}`}>
                                                    {link.label.replaceAll('&laquo;', '«').replaceAll('&raquo;', '»')}
                                                </Link>
                                                : <span key={index} className="rounded-lg px-3 py-2 text-slate-400">{link.label.replaceAll('&laquo;', '«').replaceAll('&raquo;', '»')}</span>
                                            )}
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
