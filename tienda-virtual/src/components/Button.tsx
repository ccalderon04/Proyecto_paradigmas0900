import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "secondary" | "inverted" | "outlined";
    onClick?: () => void;
    type?: "button" | "submit";
    className?: string;
}

export default function Button({
    children,
    variant = "primary",
    onClick,
    type = "button",
    className = "",
}: ButtonProps) {
    const styles = {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-secondary text-white hover:bg-secondary/90",
        inverted: "bg-white text-secondary hover:bg-neutral-light/20",
        outlined: "bg-transparent border border-neutral-light text-white hover:bg-white/5",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-6 py-3 rounded-lg font-medium font-label text-sm transition-colors ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
}