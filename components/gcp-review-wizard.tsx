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

export function GCPReviewWizard() {
  const router = useRouter()
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [showBatchCommand, setShowBatchCommand] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [batchCommand, setBatchCommand] = useState<string[]>([])

  const [config, setConfig] = useState({
    clusterName: "gcp-production-cluster",
    region: "us-central1",
    dataRetention: 30,
    backupFrequency: "daily",
    maxMachines: 10,
  })

  useEffect(() => {
    const cloudState = JSON.parse(localStorage.getItem("gcpCloudSetupState") || "{}")
    const clusterState = JSON.parse(localStorage.getItem("gcpClusterSetupState") || "{}")
    const computeState = JSON.parse(localStorage.getItem("gcpComputeStrategyState") || "{}")

    setConfig({
      clusterName: clusterState.clusterName || "gcp-production-cluster",
      region: clusterState.region || "us-central1",
      dataRetention: computeState.dataRetention || 30,
      backupFrequency: computeState.backupSchedule || "daily",
      maxMachines: computeState.maxNodes || 10,
    })

    // Iceberg Logic for Command
    const isAdvanced = computeState.isAdvancedMode;
    const isIceberg = computeState.isIcebergEnabled || false;
    
    let icebergFlag = isIceberg.toString();
    let icebergBackup = (computeState.isIcebergBackupEnabled || false).toString();
    let icebergStorage = (computeState.icebergStorageSize || 20).toString();
    let icebergRetention = `${computeState.icebergRetention || 365}d`;
    let icebergSchedule = "0 0 0 * * 0"; // Default weekly

    if (!isAdvanced) {
      if (isIceberg) {
        // Simple mode enabled defaults per user request
        icebergFlag = "true"; 
        icebergBackup = "true";
        icebergStorage = "1000";
        icebergSchedule = "0 0 0 * * 0"; // Weekly
      }
    } else {
      // Advanced mode: set based on user selection
      if (computeState.icebergBackupSchedule === "hourly") icebergSchedule = "0 0 * * * *";
      else if (computeState.icebergBackupSchedule === "daily") icebergSchedule = "0 0 0 * * *";
      else if (computeState.icebergBackupSchedule === "weekly") icebergSchedule = "0 0 0 * * 0";
    }

    const cmd = [
      "python3", "gcp.py",
      "--command", "apply",
      "--spooling", "false",
      "--fault_tolerance", "false",
      "--tenantId", "afabc21e-6dbf-4ace-8971-b06212dcb2c9",
      "--userId", "afabc21e-6dbf-4ace-8971-b06212dcb2c9",
      "--projectid", clusterState.clusterName || "gcp-project",
      "--tier", "basic",
      "--max_nodes", (computeState.maxNodes || 10).toString(),
      "--min_nodes", (computeState.minNodes || 2).toString(),
      "--region", clusterState.region || "us-central1",
      "--subdomain", "gcp-subdomain",
      "--iceberg", icebergFlag,
      "--icebergBackup", icebergBackup,
      "--icebergPgStorageSize", icebergStorage,
      "--icebergPgRetentionPolicy", icebergRetention,
      "--icebergBackupSchedule", icebergSchedule,
      "--network", clusterState.network || cloudState.vpcName || "default",
      "--subnet", clusterState.subnet || cloudState.subnetName || "default",
      "--machine_type", computeState.machineType || "n2-standard-2",
      "--base_machine_type", computeState.baseMachineType || "n2-standard-2",
      "--kubernetes_version", clusterState.kubernetesVersion || "1.29",
      "--addon_enabled", (computeState.isAddonEnabled || false).toString(),
      "--addon_cpu_limit", (computeState.addonCpu || 2).toString(),
      "--addon_mem_limit", `${computeState.addonMemory || 8}Gi`,
      "--use_spot", (computeState.useSpot || false).toString(),
      "--backup_enabled", (computeState.isBackupEnabled || false).toString(),
      "--backup_schedule", computeState.backupSchedule === "daily" ? "0 0 * * *" : "0 0 * * 0"
    ]
    setBatchCommand(cmd)
  }, [])

  const handleLaunch = () => {
    setIsLaunching(true)
    setTimeout(() => {
      alert("GCP Deployment started! Redirecting to Google Cloud Console...")
      setIsLaunching(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-600 mb-2">
            <Rocket className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Launch on Google Cloud</h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">Confidence check: Review your GCP data system before deployment.</p>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" /> What you&apos;re getting
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, label: "GKE Autopilot Platform", desc: "Serverless Kubernetes" },
                { icon: Lock, label: "Workload Identity", desc: "Secure GCP service accounts" },
                { icon: Globe, label: "Cloud VPC Network", desc: "Global isolated environment" },
                { icon: ShieldCheck, label: "GCS Protection", desc: "Bucket versioning & replication" },
                { icon: Activity, label: "Vertical Pod Autoscaling", desc: "Optimal resource allocation" },
                { icon: Database, label: "BigQuery Integration", desc: "Analytics ready storage" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border shadow-sm">
                  <div className="p-2 rounded-lg bg-muted text-blue-600"><item.icon className="w-4 h-4" /></div>
                  <div>
                    <span className="text-sm font-semibold block">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Card className="bg-gradient-to-br from-muted/50 to-background border-2 border-blue-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> System Capacity
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">GCP Native</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Baseline</span>
                  <div className="text-xl font-bold">1–2 Nodes</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Scale Limit</span>
                  <div className="text-xl font-bold">Up to {config.maxMachines} Nodes</div>
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Performance</span>
                  <div className="text-xl font-bold text-blue-600">Standard Tier</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-blue-600" /> Compliance</h4>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Encryption</span>
                    <span className="font-semibold text-blue-600">GCP Managed Key</span>
                  </li>
                  <li className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Data Residency</span>
                    <span className="font-semibold">{config.region}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-50/10">
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-blue-600" /> Monthly Estimate</h4>
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fixed Infrastructure</span>
                    <span className="font-semibold">~$65/mo</span>
                  </div>
                  <div className="pt-2 border-t flex items-baseline justify-between">
                    <span className="text-sm font-bold">Est. Total</span>
                    <span className="text-lg font-bold text-blue-700">$110 – $340/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GCP Batch Command Expandable Card */}
          <div className="pt-2">
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-blue-600 transition-colors"
              onClick={() => setShowBatchCommand(!showBatchCommand)}
            >
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                <span className="font-semibold text-sm">View GCP Batch submission command</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showBatchCommand && "rotate-180")} />
            </Button>
            
            {showBatchCommand && (
              <Card className="mt-4 border-2 border-blue-500/20 bg-slate-950 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <CardHeader className="py-3 px-4 border-b border-blue-500/10 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      Payload Preview
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                      GCP Script
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative group">
                    <pre className="p-4 text-[11px] font-mono leading-relaxed text-blue-400/90 whitespace-pre overflow-x-auto max-h-[400px] custom-scrollbar">
                      {JSON.stringify(batchCommand, null, 2)}
                    </pre>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-7 text-[10px] bg-blue-500 text-white hover:bg-blue-600 border-none"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(batchCommand))
                          alert("GCP command copied!")
                        }}
                      >
                        Copy JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="pt-8 border-t flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => router.back()}><ChevronLeft className="w-4 h-4 mr-2" /> Back to Edit</Button>
              <Button 
                size="lg" 
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 h-16 text-lg font-bold group"
                onClick={handleLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? (
                  <span className="flex items-center gap-2"><Activity className="w-5 h-5 animate-spin" /> Provisioning GCP...</span>
                ) : (
                  <span className="flex items-center gap-2">Launch GCP System <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
