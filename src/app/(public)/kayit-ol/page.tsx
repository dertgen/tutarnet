import { RegisterForm } from "@/components/register-form"
import { PageLayout } from "@/components/shared/PageLayout"

export default function KayitOlPage() {
  return (
    <PageLayout>
      <div className="flex w-full min-h-[calc(100vh-80px)] items-center justify-center p-6 md:p-10 bg-transparent">
         <RegisterForm />
      </div>
    </PageLayout>
  )
}
