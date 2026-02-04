"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "components/ui/dialog"
import { Button } from "components/ui/button"
import { AGE_VERIFICATION_KEY } from "constants/index"

interface AgeVerificationModalProps {
  open: boolean
  onVerified: () => void
}

export function AgeVerificationModal({ open, onVerified }: AgeVerificationModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  const handleConfirm = () => {
    if (isConfirmed) {
      // Guardar en localStorage que el usuario es mayor de 18 años
      localStorage.setItem(AGE_VERIFICATION_KEY, "true")
      onVerified()
    }
  }

  const handleDecline = () => {
    // Redirigir a la página de restricción de edad
    router.push("/age-restriction")
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Verificación de Edad</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Debes ser mayor de 18 años para acceder a este sitio
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex items-start space-x-3 mb-6">
            <input
              type="checkbox"
              id="age-confirmation"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 size-5 cursor-pointer rounded border-gray-300 text-black focus:ring-2 focus:ring-black"
            />
            <label htmlFor="age-confirmation" className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 cursor-pointer">
              Confirmo que soy mayor de 18 años de edad
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="w-full sm:w-auto"
            >
              Salir
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isConfirmed}
              className="w-full sm:w-auto"
            >
              Entrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
