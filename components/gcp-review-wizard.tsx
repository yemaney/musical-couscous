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
  Activity,
  BarChart3,
  Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function GCPReviewWizard() {
  const router = useRouter()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [computeState, setComputeState] = useState<any>({})
  const [clusterState, setClusterState] = useState<any>({})
  const [cloudState, setCloudState] = useState<any>({})

  const [config, setConfig] = useState({
    clusterName: "production-cluster",
    region: "northamerica-northeast2",
    dataRetention: 30,
    backupFrequency: "daily",
    minMachines: 1,
    maxMachines: 10,
    cpuPerMachine: 4,
    memoryPerMachine: 16,
  })

  useEffect(() => {
    const cloudStateData = JSON.parse(localStorage.getItem("gcpCloudSetupState") || "{}")
    const clusterStateData = JSON.parse(localStorage.getItem("gcpClusterSetupState") || "{}")
    const computeStateData = JSON.parse(localStorage.getItem("gcpComputeStrategyState") || "{}")

    setCloudState(cloudStateData)
    setClusterState(clusterStateData)
    setComputeState(computeStateData)

    setConfig({
      clusterName: clusterStateData.clusterName || "production-cluster",
      region: cloudStateData.region || "northamerica-northeast2",
      dataRetention: computeStateData.dataRetention || 30,
      backupFrequency: computeStateData.backupSchedule || "daily",
      minMachines: computeStateData.minNodes || 1,
      maxMachines: computeStateData.maxNodes || 10,
      cpuPerMachine: 4, // Default fallback
      memoryPerMachine: 16, // Default fallback
    })
  }, [])

  const handleLaunch = () => {
    setIsLaunching(true)
    setTimeout(() => {
      alert("GCP Deployment started! Redirecting to dashboard...")
      setIsLaunching(false)
    }, 2000)
  }

  const specs = (function() {
    const getRes = (type: string) => {
      if (!type) return { cpu: 2, mem: 8 }
      if (type.includes("-8")) return { cpu: 8, mem: 32 }
      if (type.includes("-4")) return { cpu: 4, mem: 16 }
      return { cpu: 2, mem: 8 }
    }
    
    const baseRes = getRes(computeState.baseMachineType)
    const workerRes = getRes(computeState.machineType)
    const baseMin = computeState.baseMinNodes || 0
    const baseMax = computeState.baseMaxNodes || 0
    const workerMin = computeState.minNodes || 0
    const workerMax = computeState.maxNodes || 0
    const isAddon = computeState.isAddonEnabled || false
    // Note: We removed addonCpu/Mem sliders, so we use machine type defaults or 0
    const addonRes = getRes(computeState.addonMachineType)

    return {
      base: { min: baseMin, max: baseMax, cpu: baseRes.cpu, memory: baseRes.mem },
      worker: { min: workerMin, max: workerMax, cpu: workerRes.cpu, memory: workerRes.mem },
      totalMin: (baseMin * baseRes.cpu) + (workerMin * workerRes.cpu),
      totalMax: (baseMax * baseRes.cpu) + (workerMax * workerRes.cpu)
    }
  })()

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-600 mb-2">
            <Rocket className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Ready to Launch
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Review your GCP setup before we create your high-performance data system.
          </p>
        </div>

        <div className="space-y-8">
          {/* Outcomes Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              What you&apos;re getting
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, label: "Scalable GKE platform", desc: "Kubernetes Engine powered" },
                { icon: Lock, label: "Workload Identity", desc: "Least-privilege security" },
                { icon: Globe, label: "Cloud VPC Network", desc: "Isolated project environment" },
                { icon: ShieldCheck, label: "Data protection", desc: "Bucket versioning & snapshots" },
                { icon: Activity, label: "Auto-scaling", desc: "Vertical & horizontal scaling" },
                { icon: Database, label: "Performance storage", desc: "Iceberg optimized tables" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border shadow-sm">
                  <div className="p-2 rounded-lg bg-muted text-blue-600">
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

          {/* Combined Summary Card */}
          <Card className="border-2 border-blue-500/20 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Combined Summary
                  </CardTitle>
                  <CardDescription>Your integrated system and data strategy</CardDescription>
                </div>
                <Badge className="bg-blue-600 text-white border-none px-3 py-1">
                  Ready to Deploy
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-6 space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">1. Base System Servers</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          {specs.base.min === specs.base.max 
                            ? `${specs.base.min} server` 
                            : `${specs.base.min} – ${specs.base.max} servers`}
                        </span>
                        <span className="text-xs text-muted-foreground">({specs.base.cpu} CPU/server)</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2. Processing Servers</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          {specs.worker.min === specs.worker.max 
                            ? `${specs.worker.min} server` 
                            : `${specs.worker.min} – ${specs.worker.max} servers`}
                        </span>
                        <span className="text-xs text-muted-foreground">({specs.worker.cpu} CPU/server)</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">3. System Addons</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isAddonEnabled ? "Enabled" : "Disabled"}</span>
                        {computeState.isAddonEnabled && (
                          <span className="text-xs text-muted-foreground">{computeState.addonMachineType} / {computeState.addonMaxNodes} Nodes</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">4. Automated Backups</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isBackupEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">5. Spot Optimization</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.useSpot ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">6. Data Platform</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isIcebergEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 flex flex-col justify-between border-l">
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                      <span className="text-[10px] uppercase font-bold tracking-widest mb-1 block opacity-80">Total Processing Capacity</span>
                      <div className="text-3xl font-black">
                        {specs.totalMin} → {specs.totalMax} CPU
                      </div>
                      <p className="text-xs opacity-70 mt-1">Simultaneous tasks your system can handle</p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deployment Region</h4>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-500/10">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-sm font-bold block leading-none">{config.region || "us-central1"}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">Google Cloud Platform</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground flex items-start gap-2 pt-6 border-t border-dashed leading-relaxed mt-6">
                    <Info className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                    Servers automatically scale based on how busy your system is.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">GKE Cluster</span>
                      <p>Version: 1.29</p>
                      <p>Name: {config.clusterName}</p>
                      <p>Control Plane: GCP Managed (Regional)</p>
                    </div>
                    <div>
                      <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">Identity & Access</span>
                      <p className="break-all text-[10px]">Orchestrator: {clusterState.orchestratorSaEmail || "N/A"}</p>
                      <p className="break-all text-[10px]">Node SA: {clusterState.nodeSaEmail || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">Networking</span>
                      <p>VPC: {clusterState.vpcName || "Default"}</p>
                      <p>Subnets: {clusterState.subnetName || "Default"}</p>
                      <p>Cloud Router: Managed NAT</p>
                    </div>
                    <div>
                      <span className="font-bold block mb-1 uppercase tracking-wider opacity-50">Storage & Encryption</span>
                      <p>Buckets: gcp-data-assets</p>
                      <p className="break-all text-[10px]" title={clusterState.kmsKeyName || "GCP Managed Key"}>
                        KMS: {clusterState.kmsKeyName || "GCP Managed Key"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 h-24">
            <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 text-muted-foreground"
                onClick={() => router.push("/gcp/compute-strategy")}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Edit Settings
              </Button>
              <Button
                size="lg"
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 h-16 text-lg font-bold group"
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
          </div>
        </div>
      </div>
    </div>
  )
}
