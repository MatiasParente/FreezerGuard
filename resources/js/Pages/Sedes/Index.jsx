import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const field = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500';
const button = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';

function SitePicker({ sedes, selected, onChange }) {
    return <fieldset className="space-y-2"><legend className="text-sm font-medium text-slate-700">Sedes (una o más)</legend>
        {sedes.map(s => <label key={s.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={e => onChange(e.target.checked ? [...selected, s.id] : selected.filter(id => id !== s.id))} />{s.nombre}</label>)}
    </fieldset>;
}

function Form({ title, children, onSubmit, processing, error }) {
    return <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">{title}</h3>{children}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className={button} disabled={processing}>Guardar</button>
    </form>;
}

function SedeForm() {
    const form = useForm({ nombre: '' });
    return <Form title="Nueva sede" processing={form.processing} error={form.errors.nombre} onSubmit={e => { e.preventDefault(); form.post(route('sedes.store'), { onSuccess: () => form.reset() }); }}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="sede-nombre">Nombre de la sede</label>
        <input id="sede-nombre" className={field} value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} aria-invalid={!!form.errors.nombre} required />
    </Form>;
}

function LabForm({ sedes }) {
    const form = useForm({ sede_id: '', nombre: '' });
    return <Form title="Nuevo laboratorio" processing={form.processing || !sedes.length} error={form.errors.nombre || form.errors.sede_id} onSubmit={e => { e.preventDefault(); form.post(route('laboratorios.store'), { onSuccess: () => form.reset() }); }}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="laboratorio-sede">Sede del laboratorio</label>
        <select id="laboratorio-sede" className={field} value={form.data.sede_id} onChange={e => form.setData('sede_id', e.target.value)} aria-invalid={!!form.errors.sede_id} required disabled={!sedes.length}><option value="">Seleccionar sede</option>{sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
        <label className="block text-sm font-medium text-slate-700" htmlFor="laboratorio-nombre">Nombre del laboratorio</label>
        <input id="laboratorio-nombre" className={field} value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} aria-invalid={!!form.errors.nombre} required disabled={!sedes.length} />
        {!sedes.length && <p className="text-sm text-slate-600">Primero crea una sede para agregar laboratorios.</p>}
    </Form>;
}

function RenameForm({ item, routeName, label }) {
    const form = useForm({ nombre: item.nombre });
    return <form className="mt-2 flex max-w-md gap-2" onSubmit={e => { e.preventDefault(); form.put(route(routeName, item.id)); }}>
        <input aria-label={label} className={field} value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} required />
        <button className={button} disabled={form.processing}>Renombrar</button>
        {form.errors.nombre && <span className="text-sm text-red-600">{form.errors.nombre}</span>}
    </form>;
}

function DeleteAction({ item, routeName, blocked, explanation, noun }) {
    const form = useForm({});
    return <div className="mt-3 text-sm">
        {blocked ? <p className="text-slate-600">{explanation}</p> : <button type="button" disabled={form.processing}
            className="rounded-lg border border-red-300 px-3 py-2 font-medium text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-50"
            onClick={() => { if (window.confirm(`¿Eliminar ${noun} «${item.nombre}»? Esta acción no se puede deshacer.`)) form.delete(route(routeName, item.id)); }}>
            Eliminar {noun}
        </button>}
    </div>;
}

function FreezerAssignment({ freezer, sedes }) {
    const form = useForm({ laboratorio_id: freezer.laboratorio_id || '' });
    const options = sedes.flatMap(s => s.laboratorios.map(l => ({ id: l.id, label: `${s.nombre} / ${l.nombre}` })));
    const current = options.find(option => String(option.id) === String(freezer.laboratorio_id));
    const destination = options.find(option => String(option.id) === String(form.data.laboratorio_id));
    return <form className="flex flex-wrap items-center gap-2" onSubmit={e => { e.preventDefault(); form.put(route('freezers.laboratorio.update', freezer.id)); }}>
        <label htmlFor={`freezer-${freezer.id}`} className="text-sm font-medium">{freezer.ubicacion}: laboratorio de destino</label><select id={`freezer-${freezer.id}`} className={field + ' max-w-xs'} value={form.data.laboratorio_id} onChange={e => form.setData('laboratorio_id', e.target.value)} aria-invalid={!!form.errors.laboratorio_id} required disabled={!sedes.some(s => s.laboratorios.length)}>
            <option value="">Asignar laboratorio</option>{options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select><button className={button} disabled={form.processing || !form.data.laboratorio_id || String(form.data.laboratorio_id) === String(freezer.laboratorio_id)}>{freezer.laboratorio_id ? 'Mover' : 'Asignar'}</button>{form.errors.laboratorio_id && <span role="alert" className="text-sm text-red-700">{form.errors.laboratorio_id}</span>}
        <p className="w-full text-xs text-slate-600">Actual: {current?.label || 'Sin laboratorio'} · Destino: {destination?.label || 'Selecciona uno'}</p>
    </form>;
}

function ParticipantForm({ sedes, usuario }) {
    const form = useForm({ nombre: usuario?.nombre || '', email: usuario?.email || '', telefono: usuario?.telefono || '', sede_ids: usuario?.sedes?.map(s => s.id) || [] });
    useEffect(() => { if (usuario) form.setData({ nombre: usuario.nombre, email: usuario.email, telefono: usuario.telefono || '', sede_ids: usuario.sedes.map(s => s.id) }); }, [usuario?.id, usuario?.sedes]);
    const prefix = usuario ? `participante-${usuario.id}` : 'participante-nuevo';
    return <Form title={usuario ? `Editar ${usuario.nombre}` : 'Nuevo participante de muestras'} processing={form.processing || !sedes.length} error={form.errors.nombre || form.errors.email || form.errors.telefono || form.errors.sede_ids} onSubmit={e => {
        e.preventDefault();
        if (usuario) form.put(route('participantes.update', usuario.id));
        else form.post(route('participantes.store'), { onSuccess: () => form.reset() });
    }}>
        <label className="block text-sm font-medium text-slate-700" htmlFor={`${prefix}-nombre`}>Nombre</label>
        <input id={`${prefix}-nombre`} className={field} value={form.data.nombre} onChange={e => form.setData('nombre', e.target.value)} aria-invalid={!!form.errors.nombre} required />
        <label className="block text-sm font-medium text-slate-700" htmlFor={`${prefix}-email`}>Correo electrónico</label>
        <input id={`${prefix}-email`} className={field} type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} aria-invalid={!!form.errors.email} required />
        <label className="block text-sm font-medium text-slate-700" htmlFor={`${prefix}-telefono`}>Teléfono (opcional)</label>
        <input id={`${prefix}-telefono`} className={field} type="tel" value={form.data.telefono} onChange={e => form.setData('telefono', e.target.value)} aria-invalid={!!form.errors.telefono} />
        <SitePicker sedes={sedes} selected={form.data.sede_ids} onChange={ids => form.setData('sede_ids', ids)} />
    </Form>;
}

export default function Index({ sedes, freezersSinLaboratorio, usuarios, filtrosParticipantes = {}, seccionActiva = 'estructura', alertasSinDestinatarios = 0, correoDesactivado = false }) {
    const { flash, errors } = usePage().props;
    const [section, setSection] = useState(seccionActiva);
    useEffect(() => setSection(seccionActiva), [seccionActiva]);

    return <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800">Sedes y laboratorios</h2>}><Head title="Sedes y laboratorios" />
        <div className="mx-auto max-w-6xl space-y-6 py-6">
            {flash?.success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{flash.success}</p>}
            {flash?.warning && <p role="status" className="rounded-lg bg-amber-50 p-3 text-amber-900">{flash.warning}</p>}
            {(errors?.sede || errors?.laboratorio) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{errors.sede || errors.laboratorio}</p>}
            {correoDesactivado && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                El envío de correos está desactivado. Las alertas quedan pendientes hasta que lo actives en{' '}
                <a className="font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2" href={route('configuracion.configuracion')}>Configuración</a>.
            </div>}
            {alertasSinDestinatarios > 0 && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <strong>{alertasSinDestinatarios} {alertasSinDestinatarios === 1 ? 'alerta pendiente no tiene destinatario' : 'alertas pendientes no tienen destinatario'}.</strong>{' '}
                Asigna los freezers a sus laboratorios y responsables, o configura el correo global de respaldo. Hasta entonces no se enviarán esos avisos.
                <a className="ml-1 font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2" href={route('configuracion.configuracion')}>Configurar correo de respaldo</a>
            </div>}

            <nav aria-label="Secciones de sedes y laboratorios" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {[
                    ['estructura', `Estructura (${sedes.length})`],
                    ['participantes', `Participantes (${usuarios.total})`],
                ].map(([key, label]) => <button key={key} type="button" aria-pressed={section === key} onClick={() => setSection(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 ${section === key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                    {label}
                </button>)}
            </nav>

            {section === 'estructura' && <div className="space-y-6">
                <nav aria-label="Pasos de configuración" className="rounded-xl bg-slate-100 p-4 text-sm text-slate-800">
                    <p className="font-semibold">Para preparar la estructura:</p>
                    <ol className="mt-2 flex flex-wrap gap-x-6 gap-y-2 list-decimal pl-5">
                        <li><a className="underline underline-offset-2" href="#crear-sede">Crear sede</a></li>
                        <li><a className="underline underline-offset-2" href="#crear-laboratorio">Crear laboratorio</a></li>
                        <li><Link className="underline underline-offset-2" href={route('usuarios.index')}>Asignar sedes a responsables</Link></li>
                        <li><a className="underline underline-offset-2" href="#freezers-pendientes">Ubicar freezers ({freezersSinLaboratorio.length} pendientes)</a></li>
                    </ol>
                </nav>
                <div className="grid gap-4 md:grid-cols-2"><div id="crear-sede"><SedeForm /></div><div id="crear-laboratorio"><LabForm sedes={sedes} /></div></div>
                <section className="rounded-xl border bg-white p-5">
                    <h3 className="mb-3 font-semibold">Estructura</h3>
                    {sedes.length === 0 && <p>Primero crea una sede.</p>}
                    <div className="space-y-2">
                        {sedes.map(s => <details key={s.id} className="rounded-lg border border-slate-200 p-3">
                            <summary className="cursor-pointer font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">
                                {s.nombre} <span className="ml-2 text-sm font-normal text-slate-600">{s.laboratorios.length} laboratorios · {s.users_count + s.usuarios_count} personas</span>
                            </summary>
                            <div className="mt-4 space-y-4 pl-3">
                                <RenameForm item={s} routeName="sedes.update" label="Nombre de sede" />
                                {s.laboratorios.map(l => <details key={l.id} className="rounded-lg bg-slate-50 p-3">
                                    <summary className="cursor-pointer font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">{l.nombre} · {l.freezers.length} freezers</summary>
                                    <div className="mt-3 space-y-3 pl-3">
                                        <RenameForm item={l} routeName="laboratorios.update" label="Nombre de laboratorio" />
                                        {l.freezers.map(f => <FreezerAssignment key={f.id} freezer={f} sedes={sedes} />)}
                                        <DeleteAction item={l} routeName="laboratorios.destroy" noun="laboratorio" blocked={l.freezers.length > 0}
                                            explanation="Para eliminar este laboratorio, mové primero sus freezers a otro." />
                                    </div>
                                </details>)}
                                <DeleteAction item={s} routeName="sedes.destroy" noun="sede" blocked={s.laboratorios.length + s.users_count + s.usuarios_count > 0}
                                    explanation="Para eliminar esta sede, quitá o reasigná primero sus laboratorios y todas las personas." />
                            </div>
                        </details>)}
                    </div>
                </section>
                <details id="freezers-pendientes" className="rounded-xl border bg-white p-5">
                    <summary className="cursor-pointer font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">Freezers existentes sin laboratorio ({freezersSinLaboratorio.length})</summary>
                    <div className="mt-4 space-y-3">{freezersSinLaboratorio.length === 0 ? <p className="text-sm text-slate-600">No hay freezers pendientes.</p> : freezersSinLaboratorio.map(f => <FreezerAssignment key={f.id} freezer={f} sedes={sedes} />)}</div>
                </details>
            </div>}

            {section === 'participantes' && <section className="space-y-4">
                <h3 className="font-semibold text-slate-900">Participantes de muestras</h3>
                <details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer font-medium text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">Crear participante</summary><div className="mt-4"><ParticipantForm sedes={sedes} /></div></details>
                <form action={route('sedes.index')} method="get" className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-4">
                    <input type="hidden" name="seccion" value="participantes" />
                    <label htmlFor="buscar-participante" className="w-full text-sm font-medium text-slate-700">Buscar por nombre o correo</label>
                    <input id="buscar-participante" name="participante" type="search" defaultValue={filtrosParticipantes.participante || ''} className={field + ' max-w-md'} />
                    <button type="submit" className={button}>Buscar</button>
                </form>
                {usuarios.data.length === 0 && <p className="text-sm text-slate-700">No se encontraron participantes.</p>}
                {usuarios.data.map(u => <details key={u.id} className="rounded-xl border bg-white p-4"><summary className="cursor-pointer text-sm font-medium">{u.nombre} — {u.sedes.map(s => s.nombre).join(', ') || 'Sin sede'}</summary><div className="mt-4"><ParticipantForm sedes={sedes} usuario={u} /></div></details>)}
                {usuarios.last_page > 1 && <nav aria-label="Páginas de participantes" className="flex flex-wrap gap-2 text-sm">
                    {usuarios.links.map((link, index) => link.url
                        ? <Link key={index} href={link.url} aria-current={link.active ? 'page' : undefined} className={`rounded-lg px-3 py-2 ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 underline'}`}>{link.label.replaceAll('&laquo;', '«').replaceAll('&raquo;', '»')}</Link>
                        : <span key={index} className="rounded-lg px-3 py-2 text-slate-500">{link.label.replaceAll('&laquo;', '«').replaceAll('&raquo;', '»')}</span>)}
                </nav>}
            </section>}
        </div>
    </AuthenticatedLayout>;
}
