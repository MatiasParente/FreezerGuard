export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={`fg-button-primary ${className}`}
        >
            {children}
        </button>
    );
}
