import { Instagram, Mail, MapPin, Phone } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto | EFE Distribution",
  description: "Contáctanos para distribución mayorista de vape y hookah. Teléfono, email y ubicación en Santiago.",
}

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 py-24 text-stone-100 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-[#1c1917] opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 font-serif text-5xl font-medium tracking-tight sm:text-7xl text-[#F5F5F4]">
            Hablemos
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-stone-300 sm:text-xl leading-relaxed">
            Estamos listos para potenciar tu negocio con los mejores productos del mercado.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 relative -mt-20 z-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
            
            {/* Contact Info Card */}
            <div className="rounded-[2.5rem] bg-white p-10 shadow-xl shadow-stone-200/50 border border-stone-100">
               <h2 className="text-3xl font-bold text-stone-800 font-serif mb-8">Información de Contacto</h2>
               
               <div className="space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <Mail className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-stone-900 text-lg">Correo Electrónico</h3>
                        <a href="mailto:efedistributions2022@gmail.com" className="text-stone-600 hover:text-orange-600 transition-colors text-lg block mt-1">
                            efedistributions2022@gmail.com
                        </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
                        <Phone className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-stone-900 text-lg">Teléfono</h3>
                        <a href="tel:+18093360874" className="text-stone-600 hover:text-orange-600 transition-colors text-lg block mt-1">
                            (809) 336-0874
                        </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                        <Instagram className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-stone-900 text-lg">Instagram</h3>
                        <a 
                            href="https://www.instagram.com/efedistribution/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-stone-600 hover:text-orange-600 transition-colors text-lg block mt-1"
                        >
                            @efedistribution
                        </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 pt-8 border-t border-stone-100">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-800 text-white">
                        <MapPin className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-stone-900 text-lg">Visítanos</h3>
                        <a 
                            href="https://maps.app.goo.gl/1DBRNM247FPtn1Dh8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-600 hover:text-orange-600 transition-colors text-lg mt-1 block leading-relaxed"
                        >
                            Cerro Alto, Santiago<br />
                            República Dominicana
                        </a>
                    </div>
                  </div>
               </div>
            </div>

            {/* Simple Contact Form Placeholder / Call to Action */}
            <div className="space-y-8">
                <div className="rounded-[2.5rem] bg-stone-800 p-10 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <h2 className="text-3xl font-bold font-serif mb-4 relative z-10">¿Listo para crecer?</h2>
                    <p className="text-stone-300 text-lg mb-8 relative z-10 leading-relaxed">
                        Estamos buscando socios estratégicos que quieran liderar el mercado con nosotros. Contáctanos hoy mismo para conocer nuestro catálogo y planes de distribución.
                    </p>
                    
                    <a 
                        href="https://wa.me/18093360874" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:translate-y-[-2px] w-full sm:w-auto"
                    >
                        Contactar por WhatsApp
                    </a>
                </div>

                 {/* Map */}
                 <div className="h-80 w-full overflow-hidden rounded-[2.5rem] bg-stone-200 relative border border-stone-300/50">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15053.46820465434!2d-70.6865267!3d19.4678229!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb1cf5f37555555%3A0x6b7724392476572!2sCerro%20Alto%2C%20Santiago%2C%20Dominican%20Republic!5e0!3m2!1sen!2sus!4v1652882000000!5m2!1sen!2sus" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación EFE Distribution"
                      className="absolute inset-0"
                    ></iframe>
                 </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
