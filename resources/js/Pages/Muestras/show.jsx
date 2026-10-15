import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const datum = (value) => value ?? 'No registrado';

export default function Show({ muestra }) {
    const freezer = muestra.freezer;
    return <AuthenticatedLayout header={<h2 className="text-xl font-bold text-slate-800">Detalle de muestra</h2>}>
        <Head title={muestra.titulo} />
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
            <Link href={route('muestras.muestras')} className="text-sm font-semibold text-indigo-700 underline underline-offset-2 focus-visible:outline focus-visible:outline-2">Volver a muestras</Link>
            <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
                <h1 className="break-words text-2xl font-bold text-slate-900">{muestra.titulo}</h1>
                <p className="mt-2 text-sm text-slate-600">Estado: {muestra.estado}</p>
                {muestra.descripcion && <p className="mt-4 whitespace-pre-wrap break-words text-slate-800">{muestra.descripcion}</p>}
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                    <div><dt className="font-semibold text-slate-600">Freezer</dt><dd className="mt-1 text-slate-900">{datum(freezer?.ubicacion)}</dd></div>
                    <div><dt className="font-semibold text-slate-600">Dispositivo</dt><dd className="mt-1 text-slate-900">{datum(freezer?.dispositivo?.nombre)}</dd></div>
                    <div><dt className="font-semibold text-slate-600">Cantidad</dt><dd className="mt-1 text-slate-900">{datum(muestra.cantidad)}</dd></div>
                    <div><dt className="font-semibold text-slate-600">Vencimiento</dt><dd className="mt-1 text-slate-900">{muestra.vencimiento ? new Date(muestra.vencimiento).toLocaleDateString('es-UY') : 'No registrado'}</dd></div>
                    <div><dt className="font-semibold text-slate-600">Temperatura mínima</dt><dd className="mt-1 text-slate-900">{muestra.temperatura_minima == null ? 'No registrada' : `${muestra.temperatura_minima} °C`}</dd></div>
                    <div><dt className="font-semibold text-slate-600">Temperatura máxima</dt><dd className="mt-1 text-slate-900">{muestra.temperatura_maxima == null ? 'No registrada' : `${muestra.temperatura_maxima} °C`}</dd></div>
                </dl>
                {muestra.observaciones && <section className="mt-6"><h2 className="font-semibold text-slate-800">Observaciones</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{muestra.observaciones}</p></section>}
            </section>
            <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-5"><h2 className="font-semibold text-slate-900">Responsables</h2>
                    {muestra.users?.length ? <ul className="mt-3 space-y-1 text-sm text-slate-800">{muestra.users.map(person => <li key={person.id}>{person.name}</li>)}</ul> : <p className="mt-3 text-sm text-slate-600">Sin responsables asignados.</p>}
                </div>
                <div className="rounded-xl bg-white p-5"><h2 className="font-semibold text-slate-900">Participantes</h2>
                    {muestra.usuarios?.length ? <ul className="mt-3 space-y-1 text-sm text-slate-800">{muestra.usuarios.map(person => <li key={person.id}>{person.nombre}</li>)}</ul> : <p className="mt-3 text-sm text-slate-600">Sin participantes asignados.</p>}
                </div>
            </section>
        </main>
    </AuthenticatedLayout>;
}
