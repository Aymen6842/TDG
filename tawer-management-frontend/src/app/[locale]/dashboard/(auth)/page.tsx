"use client"

import useCompany from "@/hooks/use-company";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Briefcase } from "lucide-react";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { useTranslations } from "next-intl";
import Loading from "@/components/page-loader";

export default function WelcomePage() {
  const t = useTranslations("shared.welcome")
  const { user, isLoading } = useCurrentUser()
  const { company } = useCompany()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setIsReady(true)
    }
  }, [isLoading])

  if (isLoading)
    return <Loading />


  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground">{t("pleaseLogIn")}</h1>
        <p className="text-muted-foreground">{t("needSignIn")}</p>
      </div>
    )
  }

  const fullName = user?.name
  const companyName = company?.name || t("companyDefault")
  const firstName = fullName.split(" ")[0]

  return (
    <main className="flex items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-2xl flex-col items-center gap-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Sun className="h-16 w-16 text-primary/60" />
        </motion.div>

        {/* Animated greeting section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {/* Subtle accent line above greeting */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isReady ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mb-8 h-1 w-12 origin-left bg-gradient-to-r from-primary to-primary/50 rounded-full"
          />

          {/* Main greeting with refined typography */}
          <h1 className="text-balance text-6xl font-bold leading-tight text-foreground mb-2">
            {t.rich("welcome", {
              name: () => (
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {firstName}
                </span>
              ),
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isReady ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-xl leading-relaxed text-muted-foreground flex items-center justify-center gap-2"
          >
            {t("hopeEnjoyDay")}{" "}
            <span className="font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary/60" /> {companyName}
            </span>
          </motion.p>
        </motion.div>

        {/* Animated decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isReady ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="h-1 w-20 rounded-full bg-muted"
        />
      </div>
    </main>
  )
}
