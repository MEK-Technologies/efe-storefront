import { Building2, Globe, HeartHandshake, ShieldCheck, Truck } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sobre Nosotros | EFE Distribution",
  description:
    "Líderes en distribución mayorista de vape y hookah en República Dominicana. Conoce nuestra visión y objetivos estratégicos.",
}

export default function AboutUsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 py-24 text-stone-100 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-[#1c1917] opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-medium tracking-tight sm:text-7xl text-[#F5F5F4]">
            Originalidad, <span className="italic text-orange-200">Calidad</span> y Servicio.
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-stone-300 sm:text-xl leading-relaxed">
            Para EFE Distribution SRL, nuestra visión y objetivos reflejan nuestro liderazgo y ambición de
            dominar el mercado nacional desde nuestra base estratégica en Santiago.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <span className="mb-8 inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-800">
            Nuestra Visión
          </span>
          <blockquote className="text-3xl font-medium leading-relaxed text-stone-800 sm:text-5xl">
            &ldquo;Consolidarnos como el distribuidor mayorista líder y más confiable de productos de vape y
            hookah en la República Dominicana.&rdquo;
          </blockquote>
          <p className="mt-8 text-lg text-stone-600 max-w-2xl mx-auto">
            Siendo reconocidos por la excelencia en nuestra cadena de suministro, la autenticidad de nuestras marcas y nuestra capacidad de marcar tendencia en la cultura del vapeo a nivel nacional.
          </p>
        </div>
      </section>

      {/* Strategic Objectives Section */}
      <section className="bg-stone-100 py-20 sm:py-28 rounded-t-[3rem]">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Objetivos Estratégicos</h2>
            <p className="mt-4 text-stone-600 text-lg">Cuatro pilares fundamentales para alcanzar nuestra visión.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {/* Expansion & Coverage */}
            <div className="group rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-700 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <Globe className="size-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-stone-800">1. Expansión y Cobertura</h3>
              <ul className="space-y-4 text-stone-600 leading-relaxed">
                <li className="flex gap-3">
                  <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Crecimiento Nacional:</strong> Incrementar la red de puntos de
                    venta autorizados en un 25% anual, priorizando zonas turísticas y ciudades clave.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Optimización Logística:</strong> Reducir los tiempos de entrega
                    nacional a un máximo de 24-48 horas.
                  </span>
                </li>
              </ul>
            </div>

            {/* Product & Quality */}
            <div className="group rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-700 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <ShieldCheck className="size-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-stone-800">2. Producto y Calidad</h3>
              <ul className="space-y-4 text-stone-600 leading-relaxed">
                <li className="flex gap-3">
                   <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Curaduría de Marcas:</strong> Asegurar la exclusividad o
                    distribución oficial de al menos tres marcas internacionales de renombre.
                  </span>
                </li>
                <li className="flex gap-3">
                   <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Garantía de Autenticidad:</strong> Mantener un estándar del
                    100% en productos originales y educar a los clientes.
                  </span>
                </li>
              </ul>
            </div>

            {/* Digital Presence & Sales */}
            <div className="group rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-700 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <Building2 className="size-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-stone-800">3. Presencia Digital y Ventas</h3>
              <ul className="space-y-4 text-stone-600 leading-relaxed">
                <li className="flex gap-3">
                   <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Conversión Social:</strong> Transformar perfiles
                    de redes sociales en canales de prospección activa mediante contenido de valor.
                  </span>
                </li>
                <li className="flex gap-3">
                   <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Plataforma B2B:</strong> Desarrollar un portal de pedidos en
                    línea exclusivo para mayoristas.
                  </span>
                </li>
              </ul>
            </div>

            {/* Customer Relationship */}
            <div className="group rounded-[2rem] border border-stone-200 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-700 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <HeartHandshake className="size-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-stone-800">4. Relación con el Cliente</h3>
              <ul className="space-y-4 text-stone-600 leading-relaxed">
                <li className="flex gap-3">
                   <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Asesoría Especializada:</strong> Capacitación técnica a
                    puntos de venta sobre uso y mantenimiento de equipos.
                  </span>
                </li>
                <li className="flex gap-3">
                   <span className="block h-1.5 w-1.5 mt-2.5 rounded-full bg-orange-400 shrink-0"></span>
                  <span>
                    <strong className="text-stone-900 font-semibold">Fidelización:</strong> Programa de beneficios
                    por volumen de compra para incentivar la exclusividad.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location Strategy Section */}
      <section className="bg-[#1c1917] py-20 text-stone-200 sm:py-28 relative overflow-hidden">
         {/* Subtle pattern or gradient */}
         <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.png')] opacity-5"></div>
         
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            <div className="lg:w-1/2 pr-0 lg:pr-12">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 text-orange-200">
                <Truck className="size-8" />
              </div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl text-white">Ubicación Estratégica</h2>
              <p className="mb-6 text-lg text-stone-400 leading-relaxed">
                Ubicados en <a href="https://maps.app.goo.gl/1DBRNM247FPtn1Dh8" target="_blank" rel="noopener noreferrer" className="text-orange-200 hover:text-orange-400 transition-colors border-b border-orange-200/30 hover:border-orange-400">Cerro Alto, Santiago</a>, nuestra posición es
                estratégica para servir como centro logístico hacia todo el Cibao y el norte del país.
              </p>
              <p className="text-lg text-stone-400 leading-relaxed">
                Esta ventaja geográfica nos permite optimizar nuestras rutas de distribución y garantizar tiempos de
                entrega récord, cumpliendo con nuestro objetivo de expansión y eficiencia logística.
              </p>
            </div>
            
            {/* Map */}
            <div className="relative h-80 w-full overflow-hidden rounded-[2.5rem] bg-stone-800 shadow-2xl lg:h-[32rem] lg:w-1/2 ring-1 ring-white/10">
                     <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3761.4391474633117!2d-70.70248272397829!3d19.47973343917245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb1c50b943fb411%3A0xf8ba24084c24d127!2zRUZFIERJU1RSSUJVVElPTiDqnLEuyoAuyp8!5e0!3m2!1sen!2sdo!4v1771806139477!5m2!1sen!2sdo" 
                        width="100%" 
                        height="100%" 
                    style={{ border: 0, opacity: 0.8, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación EFE Distribution"
                    className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                  ></iframe>
                 <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[2.5rem]"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
