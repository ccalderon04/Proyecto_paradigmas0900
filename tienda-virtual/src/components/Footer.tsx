export default function Footer() {
    return (
        <footer className="bg-neutral text-white px-8 py-6 flex items-center justify-between text-sm">
            <div>
                <p className="font-headline text-primary font-bold">TIENDA DEPORTIVA</p>
                <p className="text-neutral-light text-xs">Grupo 1 - Paradigmas de la programación</p>
            </div>
            <div className="flex gap-6 text-neutral-light">
                <span>Brayan Natanael</span>
                <span>•</span>
                <span>Christian Velasquez</span>
                <span>•</span>
                <span>Kevin Romero</span>
            </div>
        </footer>
    );
}