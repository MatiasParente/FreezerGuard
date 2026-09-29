import Modal from '@/Components/Modal';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function NotificationModal() {
    const { flash, errors } = usePage().props;
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setNotification({
                type: 'success',
                title: 'Operación Exitosa',
                message: flash.success,
            });
        } else if (flash?.error) {
            setNotification({
                type: 'error',
                title: 'Ocurrió un Error',
                message: flash.error,
            });
        } else if (flash?.warning) {
            setNotification({
                type: 'warning',
                title: 'Advertencia del Sistema',
                message: flash.warning,
            });
        } else if (errors && Object.keys(errors).length > 0 && errors.error) {
            setNotification({
                type: 'error',
                title: 'Acción no permitida',
                message: errors.error,
            });
        }
    }, [flash, errors]);

    if (!notification) return null;

    const getColors = () => {
        switch (notification.type) {
            case 'success':
                return {
                    bgIcon: 'bg-emerald-100 text-emerald-600',
                    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                    title: 'text-emerald-900',
                    border: 'border-emerald-200',
                    icon: <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                };
            case 'error':
                return {
                    bgIcon: 'bg-red-100 text-red-600',
                    button: 'bg-red-600 hover:bg-red-700 text-white',
                    title: 'text-red-900',
                    border: 'border-red-200',
                    icon: <AlertCircle className="w-7 h-7 text-red-600" />
                };
            case 'warning':
            default:
                return {
                    bgIcon: 'bg-amber-100 text-amber-600',
                    button: 'bg-amber-600 hover:bg-amber-700 text-white',
                    title: 'text-amber-900',
                    border: 'border-amber-200',
                    icon: <AlertTriangle className="w-7 h-7 text-amber-600" />
                };
        }
    };

    const style = getColors();

    return (
        <Modal show={notification !== null} onClose={() => setNotification(null)} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${style.bgIcon}`}>
                            {style.icon}
                        </div>
                        <div>
                            <h3 className={`text-base font-bold uppercase tracking-wider ${style.title}`}>
                                {notification.title}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">FreezerGuard</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setNotification(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-4 p-4 rounded-xl">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {notification.message}
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setNotification(null)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all ${style.button}`}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </Modal>
    );
}
