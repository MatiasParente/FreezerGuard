import { Link } from '@inertiajs/react';
export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${active ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} ${className}`}
        >
            {children}
        </Link>
    );
}
