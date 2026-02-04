"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AgeVerificationModal } from "./age-verification-modal"
import { AGE_VERIFICATION_KEY } from "constants/index"

export function AgeVerificationWrapper({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Permitir acceso a la página de restricción sin verificación
    if (pathname === "/age-restriction") {
      setIsVerified(true)
      setShowModal(false)
      return
    }

    // Verificar localStorage solo en el cliente
    if (typeof window !== "undefined") {
      const verified = localStorage.getItem(AGE_VERIFICATION_KEY) === "true"
      setIsVerified(verified)
      
      if (!verified) {
        // Mostrar el modal si no está verificado
        setShowModal(true)
      }
    }
  }, [pathname])

  const handleVerified = () => {
    setIsVerified(true)
    setShowModal(false)
  }

  // Mostrar loading mientras se verifica
  if (isVerified === null) {
    return null
  }

  // Si no está verificado y no está en la página de restricción, mostrar el modal y bloquear contenido
  if (!isVerified && pathname !== "/age-restriction") {
    return (
      <>
        <AgeVerificationModal open={showModal} onVerified={handleVerified} />
        {/* Bloquear el contenido mientras no esté verificado */}
        <div className="pointer-events-none opacity-50 select-none">
          {children}
        </div>
      </>
    )
  }

  // Si está verificado o está en la página de restricción, mostrar el contenido normalmente
  return <>{children}</>
}
