import { Metadata } from "next"
import Link from "next/link"
import { AlertTriangleIcon, InfoIcon, ShieldIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Restricción de Edad | Enterprise Commerce",
  description: "Debes ser mayor de 18 años para acceder a este sitio web.",
}

export default function AgeRestrictionPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        {/* Icono */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex size-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ShieldIcon className="size-12 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-red-500">
              <AlertTriangleIcon className="size-5 text-white" />
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Acceso Restringido
        </h2>

        {/* Mensaje explicativo */}
        <div className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
          <h3 className="mb-3 flex items-center justify-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
            <InfoIcon className="size-4" />
            ¿Por qué no puedo acceder?
          </h3>
          <p className="text-balance text-sm text-gray-600 dark:text-gray-400 mb-4">
            Este sitio web está restringido para personas mayores de 18 años. 
            Por favor, verifica que cumples con este requisito antes de continuar.
          </p>
          <p className="text-balance text-sm text-gray-600 dark:text-gray-400">
            Si eres mayor de 18 años, puedes{" "}
            <Link
              href="/"
              className="font-semibold text-black underline hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
            >
              intentar nuevamente
            </Link>
            .
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Si tienes alguna pregunta sobre esta restricción, por favor{" "}
            <a
              href="mailto:support@example.com"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              contacta con nuestro equipo de soporte
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
