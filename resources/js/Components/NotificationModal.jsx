import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function NotificationModal() {
    const { flash, errors } = usePage().props;
    const [notification, setNotification] = useState(null);
    const success = flash?.success;
    const error = flash?.error || errors?.error;
    const warning = flash?.warning;
    useEffect(() => {
        if (error) setNotification({ type: 'error', message: error });
        else if (warning)
            setNotification({ type: 'warning', message: warning });
        else if (success)
            setNotification({ type: 'success', message: success });
    }, [success, error, warning]);
    const Icon =
        notification?.type === 'error'
            ? AlertCircle
            : notification?.type === 'warning'
              ? AlertTriangle
              : CheckCircle2;
    const color =
        notification?.type === 'error'
            ? 'bg-red-50 text-red-900'
            : notification?.type === 'warning'
              ? 'bg-amber-50 text-amber-900'
              : 'bg-emerald-50 text-emerald-900';
    return (
        <div aria-live="polite" aria-atomic="true">
            {notification && (
                <div
                    className={`mx-4 mt-4 flex items-start gap-3 rounded-xl p-4 sm:mx-6 lg:mx-8 ${color}`}
                >
                    <Icon
                        aria-hidden="true"
                        className="mt-2 h-5 w-5 shrink-0"
                    />
                    <p
                        className="min-w-0 flex-1 break-words py-2 text-sm leading-relaxed"
                        role={
                            notification.type === 'error' ? 'alert' : undefined
                        }
                    >
                        {notification.message}
                    </p>
                    <button
                        type="button"
                        aria-label="Cerrar notificación"
                        onClick={() => setNotification(null)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/60"
                    >
                        <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
