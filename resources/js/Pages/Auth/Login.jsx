import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h1>
            <p className="mb-6 mt-2 text-sm text-slate-600">Ingresa con tu cuenta para consultar el monitoreo.</p>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        required
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />

                    <InputError id="email-error" message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        required
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} />

                    <InputError id="password-error" message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex min-h-11 items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Recordarme
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {processing ? 'Ingresando…' : 'Iniciar sesión'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
