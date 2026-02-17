"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog"
import { useModalStore } from "stores/modal-store"
import { RegisterForm } from "components/auth/register-form"

export function RegisterModal() {
  const modals = useModalStore((s) => s.modals)
  const closeModal = useModalStore((s) => s.closeModal)

  return (
    <Dialog open={!!modals["register"]} onOpenChange={() => closeModal("register")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Crear Cuenta</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RegisterForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
