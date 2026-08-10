export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 316 316"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Gradiente principal del escudo */}
                <linearGradient id="shieldGradient" x1="158" y1="20" x2="158" y2="290" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>

                {/* Gradiente de brillo para detalles de líneas */}
                <linearGradient id="lineGlow" x1="40" y1="40" x2="276" y2="276" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
            </defs>

            {/* Borde exterior del escudo */}
            <path
                d="M158 20 L276 60 V150 C276 220 220 270 158 290 C96 270 40 220 40 150 V60 L158 20 Z"
                stroke="url(#lineGlow)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/*Capa de líneas geométrica interna */}
            <path
                d="M158 45 L250 78 V145 C250 200 205 242 158 262 C111 242 66 200 66 145 V78 L158 45 Z"
                stroke="url(#shieldGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                fill="none"
                opacity="0.8"
            />

            {/*Núcleo de protección central con líneas cruzadas */}
            <g stroke="url(#lineGlow)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                {/* Traza de conexión superior */}
                <line x1="158" y1="20" x2="158" y2="80" />
                
                {/*Vértices geométricos del centro*/}
                <polygon points="158,80 205,110 205,170 158,200 111,170 111,110" fill="none" opacity="0.9" />
                
                {/*Cruz/Rayo interno protector*/}
                <path d="M158 95 V185" strokeWidth="3" />
                <path d="M125 125 L191 155" strokeWidth="3" />
                <path d="M191 125 L125 155" strokeWidth="3" />
                
                {/*Nodos de los vértices*/}
                <circle cx="158" cy="80" r="4" fill="#60A5FA" />
                <circle cx="205" cy="110" r="4" fill="#60A5FA" />
                <circle cx="205" cy="170" r="4" fill="#60A5FA" />
                <circle cx="158" cy="200" r="4" fill="#60A5FA" />
                <circle cx="111" cy="170" r="4" fill="#60A5FA" />
                <circle cx="111" cy="110" r="4" fill="#60A5FA" />
            </g>

            {/*Detalle inferior decorativo*/}
            <path
                d="M110 220 L158 245 L206 220"
                stroke="#60A5FA"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}