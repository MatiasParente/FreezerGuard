export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={`fg-button-danger ${className}`}
        >
            {children}
        </button>
    );
}
