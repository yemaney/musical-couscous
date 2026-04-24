"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Rocket,
  CheckCircle2,
  ShieldCheck,
  Zap,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  Database,
  Lock,
  Globe,
  HardDrive,
  Cpu,
  Activity,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ReviewWizard() {
  const router = useRouter()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)

  // In a real app, we'd pull this from a global state or localStorage
  // For this wizard demo, we'll use some sensible defaults if nothing is found
  const [config, setConfig] = useState({
    clusterName: "production-cluster",
    region: "us-east-1",
    dataRetention: 30,
    backupFrequency: "daily",
    minMachines: 1,
    maxMachines: 10,
    cpuPerMachine: 4,
    memoryPerMachine: 16,
  })

  useEffect(() => {
    const savedAWS = localStorage.getItem("awsConfig")
    if (savedAWS) {
      const parsed = JSON.parse(savedAWS)
      setConfig(prev => ({ ...prev, ...parsed }))
    }
  }, [])

  const handleLaunch = () => {
    setIsLaunching(true)
    // Simulate deployment initiation
    setTimeout(() => {
      alert("Deployment started! Redirecting to dashboard...")
      setIsLaunching(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 mb-2">
            <Rocket className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Ready to Launch
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Review your setup before we create your high-performance data system.
          </p>
        </div>

        <div className="space-y-8">
          {/* Outcomes Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              What you&apos;re getting
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, label: "Scalable compute platform", desc: "Kubernetes powered" },
                { icon: Lock, label: "Secure access", desc: "Auto-configured permissions" },
                { icon: Globe, label: "Private network", desc: "Isolated VPC environment" },
                { icon: ShieldCheck, label: "Data protection", desc: "Backups & daily recovery" },
                { icon: Activity, label: "Auto-scaling", desc: "Grows based on your workload" },
                { icon: Database, label: "Performance storage", desc: "Iceberg optimized tables" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border shadow-sm">
                  <div className="p-2 rounded-lg bg-muted text-emerald-600">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* System Size Summary */}
          <Card className="bg-gradient-to-br from-muted/50 to-background border-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Your System Size
                </CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Optimized
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Baseline</span>
                  <div className="text-xl font-bold">1–2 machines</div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Always running</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Maximum</span>
                  <div className="text-xl font-bold">Up to {config.maxMachines} machines</div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Auto-scales up</span>
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Capacity</span>
                  <div className="text-xl font-bold text-emerald-600">6 → 48 CPU</div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Dynamic range</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 pt-4 border-t border-dashed">
                <Info className="w-3.5 h-3.5" />
                Your system automatically scales based on workload to maintain performance.
              </p>
            </CardContent>
          </Card>

          {/* Data & Protection */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Data & Protection
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Backups</span>
                    <span className="font-semibold text-emerald-600">Enabled ({config.backupFrequency})</span>
                  </li>
                  <li className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Retention</span>
                    <span className="font-semibold">{config.dataRetention} days</span>
                  </li>
                  <li className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Encryption</span>
                    <span className="font-semibold">AES-256 (Always-on)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-50/10">
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Estimated Cost
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Base system cost</span>
                    <span className="font-semibold">~$80/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Usage-based scale</span>
                    <span className="font-semibold">$50 – $300/mo</span>
                  </div>
                  <div className="pt-2 border-t flex items-baseline justify-between">
                    <span className="text-sm font-bold">Total Est.</span>
                    <span className="text-lg font-bold text-emerald-700">$130 – $380/mo</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight italic">
                  * Costs scale with usage. You only pay for what you actually use.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pre-Launch Checks */}
          <section className="p-4 bg-muted/20 rounded-2xl border space-y-3">
             <h4 className="text-sm font-bold flex items-center gap-2">
               <Activity className="w-4 h-4" />
               Pre-Launch Checks
             </h4>
             <div className="flex flex-wrap gap-4">
               {[
                 { label: "Cloud setup verified", status: "ok" },
                 { label: "Permissions ready", status: "ok" },
                 { label: "Storage connected", status: "ok" },
                 { label: "Capacity validated", status: "ok" },
               ].map((check, i) => (
                 <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   {check.label}
                 </div>
               ))}
             </div>
          </section>

          {/* Technical Details Collapsed */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            >
              <span>View technical inventory</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showTechnicalDetails && "rotate-180")} />
            </Button>
            
            {showTechnicalDetails && (
              <div className="mt-4 p-6 rounded-2xl bg-muted/30 border-2 border-dashed space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid sm:grid-cols-2 gap-8 text-xs">
                   <div className="space-y-4">
                      <div>
                        <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">EKS Cluster</span>
                        <p>Version: 1.29</p>
                        <p>Name: {config.clusterName}</p>
                        <p>Control Plane: Managed AWS</p>
                      </div>
                      <div>
                        <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">Identity & Access</span>
                        <p>Orchestrator: arn:aws:iam::.../OrchestratorRole</p>
                        <p>Node Groups: arn:aws:iam::.../NodeGroupRole</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                        <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">Networking</span>
                        <p>VPC: 10.0.0.0/16</p>
                        <p>Subnets: 3x Private, 3x Public</p>
                        <p>Gateway: NAT Gateway (Managed)</p>
                      </div>
                      <div>
                        <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">Storage & Encryption</span>
                        <p>Buckets: production-data-assets</p>
                        <p>KMS: AWS Managed Key (Symmetric)</p>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Action Area */}
          <div className="pt-8 border-t flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <Button 
                variant="ghost" 
                size="lg" 
                className="flex-1 text-muted-foreground"
                onClick={() => router.back()}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Edit Settings
              </Button>
              <Button 
                size="lg" 
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 h-16 text-lg font-bold group"
                onClick={handleLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-spin" />
                    Launching System...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Launch My System
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Secure deployment initiated via AWS CloudFormation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
