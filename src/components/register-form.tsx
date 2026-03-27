"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Ad soyad en az 2 karakter olmalıdır" }),
  email: z.string().min(1, { message: "E-posta gerekli" }).email({ message: "Geçersiz e-posta adresi" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
});

function setAuthCookie(token: string, expiresIn: number) {
  document.cookie = `sb-access-token=${token}; path=/; max-age=${expiresIn}; SameSite=Lax`;
}

export function RegisterForm(props: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name } },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Bu e-posta adresiyle zaten bir hesap mevcut.");
        } else if (signUpError.message.includes("Password")) {
          setError("Şifre en az 6 karakter olmalı ve güçlü olmalıdır.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      const user = data.user;
      const session = data.session;

      if (!user) {
        setError("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
        return;
      }

      if (session?.access_token) {
        setAuthCookie(session.access_token, session.expires_in ?? 3600);

        await fetch("/api/auth/kayit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: user.id, email: user.email, name: values.name }),
        });

        router.push("/");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[400px] mx-auto py-8 text-center" {...props}>
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-foreground mb-2">E-postanızı doğrulayın</h2>
        <p className="text-[14px] text-muted-foreground">
          <strong>{form.getValues().email}</strong> adresine bir doğrulama bağlantısı gönderdik.
          Bağlantıya tıklayarak hesabınızı aktif hale getirebilirsiniz.
        </p>
        <Link href="/giris-yap" className="inline-block mt-6 text-[14px] font-medium text-foreground underline underline-offset-2">
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto py-8" {...props}>
      <div className="text-center mb-8">
        <h1 className="text-[24px] font-[700] tracking-tight text-foreground mb-2">Aramıza Katılın</h1>
        <p className="text-[14px] text-muted-foreground">Saniyeler içinde hesabınızı oluşturun</p>
      </div>

      <div className="flex flex-col gap-6">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ad Soyad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta Adresi</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ornek@eposta.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground mt-1">En az 6 karakter uzunluğunda olmalıdır.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full mt-2"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Kayıt yapılıyor…
                </>
              ) : (
                "Kayıt Ol"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t" />
          <span className="flex-shrink-0 mx-4 text-[12px] text-muted-foreground">Veya şununla hızlı kayıt ol</span>
          <div className="flex-grow border-t" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })}
            className="gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
          <Button type="button" variant="outline" disabled className="gap-2">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
            Apple
          </Button>
        </div>

        <p className="text-center text-[13px] text-muted-foreground mt-2">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris-yap" className="font-medium text-foreground hover:underline decoration-1 underline-offset-2">Giriş yapın</Link>
        </p>
      </div>
    </div>
  );
}
