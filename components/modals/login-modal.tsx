"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog"
import { useModalStore } from "stores/modal-store"
import { LoginForm } from "components/auth/login-form"

export function LoginModal() {
  const modals = useModalStore((s) => s.modals)
  const closeModal = useModalStore((s) => s.closeModal)

  return (
    <Dialog open={!!modals["login"]} onOpenChange={() => closeModal("login")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <LoginForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
