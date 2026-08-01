import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";

export default function Home() {
  return (
    <>
      <Navbar />
      <section className="bg-neutral text-white px-8 py-16 flex items-center justify-between">
        <div className="max-w-lg">
          <span className="inline-block bg-primary/20 text-primary text-xs font-label px-3 py-1 rounded-full mb-4">
            OFERTA ESPECIAL
          </span>
          <h1 className="font-headline text-4xl font-bold mb-4">
            Potencia tu Rendimiento
          </h1>
          <p className="text-neutral-light mb-6">
            Alcanza tus metas con nuestra nueva línea de suplementos premiun.
          </p>
          <div className="flex gap-4">
            <Button variant="primary">Aprovechar 30% Dto.</Button>
            <Button variant="outlined">Ver Productos</Button>
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-16">
        <h2 className="font-headline text-2xl font-bold text-secondary mb-8">
          Explora Categorías
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-secondary rounded-xl h-64 flex items-end p-6">
            <p className="text-white font-headline text-xl">Proteínas</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-secondary rounded-xl h-28 flex items-end p-4">
              <p className="text-white font-label text-sm">Pre-Entrenos</p>
            </div>
            <div className="bg-secondary rounded-xl h-28 flex items-end p-4">
              <p className="text-white font-label text-sm">Creatinas & Vitaminas</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral px-8 py-16">
        <h2 className="font-headline text-2xl font-bold text-white mb-8">
          Nuevos Arribos
        </h2>
      </section>

      <Footer />
    </>
  );
}
