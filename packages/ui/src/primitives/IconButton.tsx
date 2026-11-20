type IconButtonProps = {
    label: string;
    icon: string;
    onClick?: () => void;
    gap?: number;
    iconSize?: number;
    fontSize?: number;
    fontWeight?: number | string;
    style?: React.CSSProperties;
    className?: string;
};

const IconButton: React.FC<IconButtonProps> = ({
    label,
    icon,
    onClick,
    gap = 5,
    iconSize = 13,
    fontSize = 13,
    fontWeight = 600,
    style,
    className,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                gap,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                ...style,
            }}
        >
            <img
                src={icon}
                alt={label}
                style={{
                    width: iconSize,
                    height: iconSize,
                    objectFit: "contain",
                }}
            />

            <span
                style={{
                    fontSize,
                    fontWeight,
                }}
            >
                {label}
            </span>
        </button>
    );
};

export default IconButton;