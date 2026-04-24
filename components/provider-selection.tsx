"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronRight, 
  Cloud, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom SVG Icons for AWS and GCP to make it look premium
const AWSIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.48 16.92c-.36.21-.73.34-1.12.39-.39.05-.79.08-1.2.08-1.16 0-2.07-.3-2.74-.91-.67-.6-1-1.46-1-2.58 0-.58.11-1.11.33-1.58.22-.47.53-.87.94-1.2.41-.33.91-.58 1.49-.75.58-.17 1.25-.26 1.99-.26.29 0 .58.01.88.04.3.03.55.07.74.12v-.41c0-.62-.16-1.1-.48-1.43-.32-.33-.8-.5-1.45-.5-.46 0-.89.08-1.29.24-.4.16-.76.41-1.08.75l-.94-.8c.42-.48.96-.86 1.62-1.14.66-.28 1.41-.42 2.25-.42 1.34 0 2.37.33 3.09 1 .72.67 1.08 1.65 1.08 2.94v5.33c0 .35.03.68.08 1h-1.63c-.06-.23-.11-.53-.15-.88-.33.36-.75.64-1.25.84-.5.2-.1.2-.1.2zm-.31-4.71c-.48 0-.89.06-1.23.18-.34.12-.61.29-.82.51-.21.22-.32.49-.32.81 0 .39.14.7.42.94.28.24.69.36 1.23.36.43 0 .82-.07 1.17-.2.35-.13.63-.33.84-.6.21-.27.32-.61.32-1.02v-.33c-.15-.05-.36-.09-.64-.13-.28-.04-.6-.05-.97-.05z" fill="currentColor"/>
    <path d="M2.38 12.02c.41-2.31 1.77-4.22 3.84-5.4 1.23-.7 2.65-1.08 4.14-1.08 2.05 0 3.92.73 5.37 1.94l-1.39 1.39c-1.05-.88-2.4-1.41-3.87-1.41-3.18 0-5.83 2.32-6.32 5.35h3.18l-4.11 4.11-4.11-4.11h3.27z" fill="currentColor" fillOpacity=".4"/>
  </svg>
)

const GCPIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" fillOpacity=".2"/>
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
  </svg>
)

export function ProviderSelection() {
  const providers = [
    {
      id: "aws",
      name: "Amazon Web Services",
      shortName: "AWS",
      icon: AWSIcon,
      description: "Deploy to AWS using EKS, S3, and optimized VPC infrastructure.",
      color: "from-orange-500 to-yellow-600",
      bgLight: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-900",
      active: true,
      path: "/cloud-setup"
    },
    {
      id: "gcp",
      name: "Google Cloud Platform",
      shortName: "GCP",
      icon: GCPIcon,
      description: "High-performance GKE clusters and Cloud Storage integration.",
      color: "from-blue-500 to-emerald-500",
      bgLight: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-900",
      active: true,
      path: "/gcp/cloud-setup"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border text-sm font-medium text-slate-600 animate-in fade-in slide-in-from-top-4 duration-700">
            <Cloud className="w-4 h-4 text-blue-500" />
            <span>Infrastructure Provisioning</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl animate-in fade-in slide-in-from-top-6 duration-1000">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cloud Provider</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-8 duration-1000 delay-200">
            Select the platform where you want to deploy your high-performance data infrastructure.
          </p>
        </div>

        {/* Provider Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {providers.map((provider, index) => (
            <Link 
              key={provider.id} 
              href={provider.active ? provider.path : "#"}
              className={cn(!provider.active && "pointer-events-none")}
            >
              <Card 
                className={cn(
                  "relative h-full overflow-hidden border-2 transition-all duration-300 group cursor-pointer",
                  provider.active 
                    ? cn(provider.border, "hover:shadow-2xl hover:-translate-y-2") 
                    : "opacity-60 grayscale cursor-not-allowed",
                  "animate-in fade-in zoom-in-95 duration-700",
                  index === 1 && "delay-200"
                )}
              >
              {provider.active && (
                <div className={cn("absolute top-0 right-0 p-4", provider.text)}>
                  <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                    Available <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              )}
              {!provider.active && (
                <Badge variant="secondary" className="absolute top-4 right-4 bg-slate-200 text-slate-600 uppercase text-[10px] tracking-widest font-bold">
                  Coming Soon
                </Badge>
              )}
              
              <CardHeader className="pt-10 pb-4">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500",
                  provider.active ? cn("bg-gradient-to-br text-white shadow-lg shadow-black/10", provider.color) : "bg-slate-200 text-slate-400"
                )}>
                  <provider.icon />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{provider.name}</CardTitle>
                <CardDescription className="text-base mt-2">{provider.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <ShieldCheck className={cn("w-4 h-4", provider.active ? "text-emerald-500" : "text-slate-400")} />
                    Enterprise-grade security
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Zap className={cn("w-4 h-4", provider.active ? "text-amber-500" : "text-slate-400")} />
                    High-performance clusters
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Globe className={cn("w-4 h-4", provider.active ? "text-blue-500" : "text-slate-400")} />
                    Global region support
                  </div>
                  
                  <div className="pt-6">
                    <Button 
                      className={cn(
                        "w-full h-12 text-base font-bold transition-all duration-300 group-hover:gap-3",
                        provider.active ? cn("bg-slate-900 hover:bg-slate-800 text-white shadow-xl") : "bg-slate-200 text-slate-400"
                      )}
                      disabled={!provider.active}
                    >
                      {provider.active ? "Select " + provider.shortName : "Unavailable"}
                      {provider.active && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          ))}
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-400 text-sm animate-in fade-in duration-1000 delay-500">
          <p>Don&apos;t see your provider? <Button variant="link" className="text-slate-400 p-0 h-auto">Contact Sales</Button> to request custom integration.</p>
        </div>
      </div>
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
