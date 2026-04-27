"use client"

import { usePathname } from "next/navigation"
import { CheckCircle2, Cloud, Server, Zap, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGES = [
  { path: "/cloud-setup",       label: "Account & Location",    icon: Cloud,        step: 1 },
  { path: "/cluster-setup",     label: "System Configuration",  icon: Server,       step: 2 },
  { path: "/compute-strategy",  label: "System Power",          icon: Zap,          step: 3 },
  { path: "/review",            label: "Launch",                icon: Rocket,       step: 4 },
]

export function SetupStageProgress() {
  const pathname = usePathname()
  const currentIndex = STAGES.findIndex((s) => pathname?.startsWith(s.path))
  if (currentIndex === -1) return null

  return (
    <div className="w-full bg-background/80 backdrop-blur-lg border-b sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon
            const isDone = index < currentIndex
            const isActive = index === currentIndex
            const isFuture = index > currentIndex

            return (
              <div key={stage.path} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-white border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/20"
                        : "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-center leading-tight hidden sm:block",
                      isActive ? "text-emerald-600" : isDone ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < STAGES.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 mt-[-12px] sm:mt-[-14px]">
                    <div
                      className={cn(
                        "h-full rounded transition-all duration-500",
                        isDone ? "bg-emerald-400" : "bg-border"
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
