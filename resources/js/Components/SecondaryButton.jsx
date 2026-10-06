export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={`fg-button-secondary ${className}`}
        >
            {children}
        </button>
    );
}
