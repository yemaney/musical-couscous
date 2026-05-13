"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
  Shield,
  Settings,
  Network,
  Server,
  PlusSquare,
  Fingerprint,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function GCPReviewWizard() {
  const router = useRouter()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [computeState, setComputeState] = useState<any>({})
  const [clusterState, setClusterState] = useState<any>({})
  const [cloudState, setCloudState] = useState<any>({})

  // In a real app, we'd pull this from a global state or localStorage
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

    // Update basic config for the UI
    setConfig({
      clusterName: clusterStateData.clusterName || "production-cluster",
      region: cloudStateData.region || "northamerica-northeast2",
      dataRetention: computeStateData.dataRetention || 30,
      backupFrequency: computeStateData.backupSchedule || "daily",
      minMachines: computeStateData.baseMinNodes || 1,
      maxMachines: computeStateData.baseMaxNodes || 10,
      cpuPerMachine: 4,
      memoryPerMachine: 16,
    })
  }, [])

  const handleLaunch = () => {
    setIsLaunching(true)
    // Simulate deployment initiation
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
    const addonRes = getRes(computeState.addonMachineType)

    return {
      base: { min: baseMin, max: baseMax, cpu: baseRes.cpu, memory: baseRes.mem },
      data: { min: workerMin, max: workerMax, cpu: workerRes.cpu, memory: workerRes.mem },
      totalMin: (baseMin * baseRes.cpu) + (workerMin * workerRes.cpu) + (isAddon ? addonRes.cpu : 0),
      totalMax: (baseMax * baseRes.cpu) + (workerMax * workerRes.cpu) + (isAddon ? addonRes.cpu : 0)
    }
  })()

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Rocket className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Ready to Launch</h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">Finalize your setup before launching your GCP system.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Resources Note */}
          <section className="bg-white rounded-2xl border border-blue-500/10 shadow-sm overflow-hidden">
             <button 
               onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
               className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group text-left"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-slate-900">Active Infrastructure Foundation</h3>
                   <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Already Provisioned</p>
                 </div>
               </div>
               <ChevronDown className={cn("w-6 h-6 text-slate-400 transition-transform duration-300", showTechnicalDetails && "rotate-180")} />
             </button>

             {showTechnicalDetails && (
               <div className="p-8 pt-0 space-y-12 animate-in slide-in-from-top-4 duration-300">
               {/* Network Section */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900">Network</h4>
                    </div>
                 </div>
                 <p className="text-sm text-muted-foreground">
                   Your system will run inside the private network that was already set up for you. These values were imported from your cloud environment setup.
                 </p>
                 
                 <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                       <div className="flex items-center gap-2 mb-1">
                         <Globe className="w-3.5 h-3.5 text-blue-600" />
                         <Label className="text-[10px] uppercase font-bold tracking-widest text-blue-900/60">Deployment Region</Label>
                       </div>
                       <code className="block p-2 bg-white/80 rounded-lg text-[11px] font-bold text-blue-900 font-mono border border-blue-200/50">
                         {cloudState.region || "northamerica-northeast2"}
                       </code>
                    </div>
                    <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                       <div className="flex items-center gap-2 mb-1">
                         <Settings className="w-3.5 h-3.5 text-emerald-600" />
                         <Label className="text-[10px] uppercase font-bold tracking-widest text-emerald-900/60">Availability Zones</Label>
                       </div>
                       <code className="block p-2 bg-white/80 rounded-lg text-[11px] font-bold text-emerald-900 font-mono border border-emerald-200/50">
                         {clusterState.zones?.join(", ") || "northamerica-northeast2-a, northamerica-northeast2-b"}
                       </code>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">VPC Network</Label>
                        <p className="text-[10px] text-muted-foreground -mt-0.5">The main isolated container for all your cloud resources.</p>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                          {clusterState.vpcName || "Pending..."}
                        </code>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subnet</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">A secure section of your network where your system's servers run.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border break-all">
                        {clusterState.subnetName || "Pending..."}
                      </code>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subnet CIDR Block</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">The range of internal addresses for your primary network section.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {clusterState.subnetCidr || "Pending..."}
                      </code>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pod IP Range</Label>
                          <p className="text-[10px] text-muted-foreground -mt-0.5">Internal addresses reserved for application containers.</p>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                            {clusterState.podRange || "Pending..."}
                          </code>
                          <code className="block mt-1 p-1 px-2 bg-white/50 rounded text-[9px] font-mono border border-dashed text-muted-foreground">
                            {clusterState.podCidr || "0.0.0.0/0"}
                          </code>
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service IP Range</Label>
                          <p className="text-[10px] text-muted-foreground -mt-0.5">Addresses used for internal load balancing between apps.</p>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                            {clusterState.serviceRange || "Pending..."}
                          </code>
                          <code className="block mt-1 p-1 px-2 bg-white/50 rounded text-[9px] font-mono border border-dashed text-muted-foreground">
                            {clusterState.serviceCidr || "0.0.0.0/0"}
                          </code>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cloud Router</Label>
                          <p className="text-[10px] text-muted-foreground -mt-0.5">The traffic director that manages communication for your network.</p>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                            {clusterState.routerName || "Pending..."}
                          </code>
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cloud NAT</Label>
                          <p className="text-[10px] text-muted-foreground -mt-0.5">Allows secure servers to download updates while staying private.</p>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                            {clusterState.natName || "Pending..."}
                          </code>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Security Permissions Section */}
               <div className="space-y-6 pt-12 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900">Security Permissions</h4>
                    </div>
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   These permissions were automatically set up to keep your system secure. No action needed.
                 </p>

                 <div className="space-y-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">System Orchestrator Identity</Label>
                      <p className="text-[10px] text-muted-foreground -mt-1.5">The primary identity used to automate the creation and management of your cloud resources.</p>
                      <div className="ml-6 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                          {clusterState.orchestratorSaEmail || "Pending outputs..."}
                        </code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Compute Node Identity</Label>
                      <p className="text-[10px] text-muted-foreground -mt-1.5">Permissions that allow your compute servers to run applications and securely access cloud services.</p>
                      <div className="ml-6 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                          {clusterState.nodeSaEmail || "Pending outputs..."}
                        </code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Storage Backup Identity</Label>
                      <p className="text-[10px] text-muted-foreground -mt-1.5">Permissions used to safely create backups of your data and restore them during recovery.</p>
                      <div className="ml-6 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                          {clusterState.backupSaEmail || "Pending outputs..."}
                        </code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Cross-Cloud Trust Pool</Label>
                      <p className="text-[10px] text-muted-foreground -mt-1.5">Allows our platform to securely access your System Orchestrator Identity without needing static keys.</p>
                      <div className="ml-6 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">WIF Provider</Label>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                            {clusterState.wifProvider || "Pending outputs..."}
                          </code>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">WIF Pool</Label>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                            {clusterState.wifPool || "Pending outputs..."}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-dashed border-slate-200">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Lock className="w-4 h-4" />
                        <Label className="text-sm font-bold">Master Encryption Key</Label>
                      </div>
                      <p className="text-[10px] text-muted-foreground ml-6 -mt-1">A master key used to encrypt and protect your system secrets and sensitive data at rest.</p>
                      <div className="ml-6 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Encryption Key Group (KeyRing)</Label>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                            {clusterState.kmsKeyRingName || "Pending outputs..."}
                          </code>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">KMS Crypto Key</Label>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                            {clusterState.kmsKeyName || "Pending outputs..."}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-dashed border-slate-200">
                      <div className="flex items-center gap-2 text-amber-600">
                        <DollarSign className="w-4 h-4" />
                        <Label className="text-sm font-bold">Billing Discovery Key</Label>
                      </div>
                      <p className="text-[10px] text-muted-foreground ml-6 -mt-1">Restricted key used exclusively for cloud cost monitoring.</p>
                      <div className="ml-6 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">OpenCost API Key</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {clusterState.opencostApiKey || "Sensitive · Managed"}
                        </code>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-dashed border-slate-200">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Database className="w-4 h-4" />
                        <Label className="text-sm font-bold">Storage Access Keys</Label>
                      </div>
                      <p className="text-[10px] text-muted-foreground ml-6 -mt-1.5 font-medium leading-relaxed">S3-compatible credentials used for managing your datalake and system logs.</p>
                      <div className="ml-6 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Access Key ID (HMAC)</Label>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                            {clusterState.hmacAccessKey || "Imported from setup"}
                          </code>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Secret Access Key (HMAC)</Label>
                          <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                            {clusterState.hmacSecretKey ? "••••••••••••••••" : "Imported from setup"}
                          </code>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Cloud Storage Section */}
               <div className="space-y-6 pt-12 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900">Cloud Storage</h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border-blue-100">Auto-detected</Badge>
                 </div>

                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      This bucket is used as the primary storage for system backups and your internal datalake.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Primary Data Bucket</Label>
                      <div className="ml-6 space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">GCS Bucket Name</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                          {clusterState.gcsBucketName || "Using default system bucket"}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             )}
          </section>

          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Estimated Cost Factors</h3>
                <p className="text-xs text-muted-foreground">Key components that contribute to your monthly GCP bill.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Server className="w-4 h-4 text-slate-600" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Compute (GCE)</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                    Hourly charges for GKE worker nodes. Optimized by your selected strategy (Standard or Spot).
                 </p>
               </div>
               
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Network className="w-4 h-4 text-slate-600" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Networking & Transfer</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                    Charges for Cloud NAT usage, inter-zone data transfer, and standard GCP Network Egress.
                 </p>
               </div>

               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-slate-600" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Load Balancing</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                    Hourly fees for the Google Cloud Load Balancer used to securely expose your system services.
                 </p>
               </div>

               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Database className="w-4 h-4 text-slate-600" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Storage (GCS & PD)</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                    Data stored in GCS buckets and Persistent Disks for system logs, state, and backups.
                 </p>
               </div>

               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Lock className="w-4 h-4 text-slate-600" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Security (KMS)</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                    Managed fee for the Cloud KMS key used to encrypt your system secrets at rest.
                 </p>
               </div>

               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-slate-600" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-900">GKE Management</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                    GCP management fee (~$0.10/hour per cluster) for maintaining your system control plane.
                 </p>
               </div>
            </div>
          </section>

          {/* Final Resource Launch Strategy Card */}
          <Card className="border-2 border-blue-500/20 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-blue-50/50 border-b border-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Final Resource Launch Strategy
                  </CardTitle>
                  <CardDescription>Resources that will be created in your GCP account upon launch.</CardDescription>
                </div>
                <Badge className="bg-blue-600 text-white border-none px-3 py-1">
                  Ready to Deploy
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">1. Core System Compute</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{specs.base.min} node{specs.base.min > 1 ? 's' : ''}</span>
                        <span className="text-xs text-muted-foreground">({specs.base.cpu} CPU)</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2. Hyperlake Compute</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          {specs.data.min === specs.data.max 
                            ? `${specs.data.min} node` 
                            : `${specs.data.min} – ${specs.data.max} nodes`}
                        </span>
                        <span className="text-xs text-muted-foreground">({specs.data.cpu} CPU/node)</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">3. System Addons Compute</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isAddonEnabled ? "Enabled" : "Disabled"}</span>
                        {computeState.isAddonEnabled && (
                          <span className="text-xs text-muted-foreground">{computeState.addonMachineType} / {computeState.addonMaxNodes} Nodes</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">4. Save Money on Compute</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.useSpot ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">5. System Backups</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isBackupEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">6. Install Datalake (Iceberg)</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isIcebergEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-blue-500/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">7. Datalake Backups</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{computeState.isIcebergBackupEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50/50 flex flex-col justify-between border-l border-blue-500/10">
                  <div className="space-y-8">
                    <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                      <span className="text-[10px] uppercase font-bold tracking-widest mb-1 block opacity-80">Total Processing Capacity</span>
                      <div className="text-4xl font-black">
                        {specs.totalMin} → {specs.totalMax} CPU
                      </div>
                      <p className="text-xs opacity-70 mt-2 font-medium">Dynamically scales based on your workload</p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Config Summary</h4>
                      <div className="bg-white rounded-xl border border-blue-500/10 shadow-sm overflow-hidden divide-y divide-blue-500/5">
                        <div className="p-3 flex items-center gap-3">
                          <Fingerprint className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight block">System Identity</span>
                            <span className="text-xs font-bold truncate block">{clusterState.clusterName || "system-primary"}</span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center gap-3">
                          <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight block">Deployment Region</span>
                            <span className="text-xs font-bold block">{cloudState.region || "northamerica-northeast2"}</span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center gap-3">
                          <PlusSquare className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight block">Availability Zones</span>
                            <span className="text-xs font-bold block">{clusterState.zones?.join(", ") || "northamerica-northeast2-a, northamerica-northeast2-b"}</span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center gap-3">
                          <Database className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight block">Data Bucket</span>
                            <span className="text-xs font-bold truncate block line-clamp-1">{clusterState.gcsBucketName || "default-storage"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground flex items-start gap-2 pt-6 border-t border-dashed border-blue-500/20 leading-relaxed mt-8">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    Compute automatically scales based on how busy your system is.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
