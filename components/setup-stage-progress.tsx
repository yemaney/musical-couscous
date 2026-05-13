"use client"

import { usePathname } from "next/navigation"
import { CheckCircle2, Cloud, Server, Zap, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const AWS_STAGES = [
  { path: "/aws/cloud-setup",       label: "System Setup",          icon: Cloud,        step: 1 },
  { path: "/aws/cluster-setup",     label: "System Review",         icon: Server,       step: 2 },
  { path: "/aws/compute-strategy",  label: "Compute Settings",      icon: Zap,          step: 3 },
  { path: "/aws/review",            label: "Launch",                icon: Rocket,       step: 4 },
]

const GCP_STAGES = [
  { path: "/gcp/cloud-setup",       label: "System Setup",          icon: Cloud,        step: 1 },
  { path: "/gcp/cluster-setup",     label: "System Review",         icon: Server,       step: 2 },
  { path: "/gcp/compute-strategy",  label: "Compute Settings",      icon: Zap,          step: 3 },
  { path: "/gcp/review",            label: "Launch",                icon: Rocket,       step: 4 },
]

export function SetupStageProgress() {
  const pathname = usePathname()
  const isGcp = pathname?.includes("/gcp/")
  const STAGES = isGcp ? GCP_STAGES : AWS_STAGES
  const colorClass = isGcp ? "blue" : "emerald"
  
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
                        ? isGcp ? "bg-blue-600 border-blue-600 text-white" : "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? isGcp ? "bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-600/20" : "bg-white border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/20"
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
                      isActive 
                        ? isGcp ? "text-blue-600" : "text-emerald-600" 
                        : isDone 
                        ? isGcp ? "text-blue-500" : "text-emerald-500" 
                        : "text-muted-foreground"
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
                        isDone 
                          ? isGcp ? "bg-blue-400" : "bg-emerald-400" 
                          : "bg-border"
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
