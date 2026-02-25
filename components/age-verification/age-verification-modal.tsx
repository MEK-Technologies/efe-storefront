"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "components/ui/dialog"
import { Button } from "components/ui/button"
import { AGE_VERIFICATION_KEY } from "constants/index"

interface AgeVerificationModalProps {
  open: boolean
  onVerified: () => void
}

export function AgeVerificationModal({ open, onVerified }: AgeVerificationModalProps) {
  const router = useRouter()

  const handleConfirm = () => {
    // Guardar en localStorage que el usuario es mayor de 18 años
    localStorage.setItem(AGE_VERIFICATION_KEY, "true")
    onVerified()
  }

  const handleDecline = () => {
    // Redirigir a la página de restricción de edad
    router.push("/age-restriction")
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[450px] p-6 sm:p-8">
        <DialogHeader className="flex flex-col items-center gap-2 mb-2">
          <DialogTitle className="text-3xl font-bold text-center">
            Verificación de Edad
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          <DialogDescription className="flex flex-col gap-4 text-center text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium">
            <span>Debes ser mayor de 18 años para acceder a este sitio.</span>
            <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal">
              En la República Dominicana, las autoridades del Ministerio de Salud Pública (MSP) advierten que el consumo de cigarrillos electrónicos no es apto para menores de edad. Su uso presenta graves riesgos para la salud, incluyendo daños pulmonares severos, exposición a químicos tóxicos y un nivel extremadamente alto de adicción a la nicotina.
            </span>
          </DialogDescription>
          
          <div className="flex flex-col gap-4 w-full">
            <Button
              size="lg"
              onClick={handleConfirm}
              className="w-full h-14 text-base sm:text-lg font-semibold"
            >
              Soy mayor de 18 años - Entrar
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDecline}
              className="w-full h-14 text-base sm:text-lg font-semibold"
            >
              Soy menor de 18 años - Salir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
