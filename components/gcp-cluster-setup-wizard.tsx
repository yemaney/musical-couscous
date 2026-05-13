"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Shield,
  Globe,
  Settings,
  Lock,
  Network,
  DollarSign,
  Info,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Generate a random cluster name
function generateClusterName() {
  const adjectives = ["swift", "bright", "calm", "deep", "bold"]
  const nouns = ["cloud", "stream", "peak", "wave", "spark"]
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNum = Math.floor(Math.random() * 1000)
  return `${randomAdj}-${randomNoun}-${randomNum}`
}


interface ClusterState {
  clusterName: string
  region: string
  zones: string[]
  vpcName: string
  subnetName: string
  podRange: string
  serviceRange: string
  orchestratorSaEmail: string
  nodeSaEmail: string
  wifProvider: string
  wifPool: string
  kmsKeyName: string
  backupSaEmail: string
  gcsBucketName: string
  subnetCidr: string
  podCidr: string
  serviceCidr: string
  routerName: string
  natName: string
  kmsKeyRingName: string
  opencostApiKey: string
  customRoles: string[]
  hmacAccessKey: string
  hmacSecretKey: string
}

function HelperTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ValidationBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <CheckCircle2 className="w-4 h-4 text-blue-500" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={valid ? "text-blue-600" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-medium text-foreground">{title}</span>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function GCPClusterSetupWizard() {
  const router = useRouter()
  const [state, setState] = useState<ClusterState>({
    clusterName: "",
    region: "northamerica-northeast2",
    zones: ["northamerica-northeast2-a", "northamerica-northeast2-b"],
    vpcName: "testapp-app-58498364-0ad4",
    subnetName: "testapp-app-58498364-0ad4",
    podRange: "pods-testapp-app-58498364-0ad4",
    serviceRange: "services-testapp-app-58498364-0ad4",
    orchestratorSaEmail: "orchestrator-58498364-0ad4@wired-height-365016.iam.gserviceaccount.com",
    nodeSaEmail: "gke-node-sa-58498364-0ad4@wired-height-365016.iam.gserviceaccount.com",
    wifProvider: "projects/478466301778/locations/global/workloadIdentityPools/pool-58498364-0ad4-d30a/providers/aws-provider",
    wifPool: "projects/478466301778/locations/global/workloadIdentityPools/pool-58498364-0ad4-d30a",
    kmsKeyName: "projects/wired-height-365016/locations/northamerica-northeast2/keyRings/gke-keyring-58498364-0ad4-d30a/cryptoKeys/gke-key-58498364-0ad4",
    backupSaEmail: "backup-sa-58498364-0ad4@wired-height-365016.iam.gserviceaccount.com",
    gcsBucketName: "",
    subnetCidr: "",
    podCidr: "",
    serviceCidr: "",
    routerName: "",
    natName: "",
    kmsKeyRingName: "",
    opencostApiKey: "",
    customRoles: [],
    hmacAccessKey: "",
    hmacSecretKey: "",
  })

  useEffect(() => {
    // Try to load from gcpCloudSetupState outputs first
    const setupStateRaw = localStorage.getItem("gcpCloudSetupState")
    if (setupStateRaw) {
      try {
        const setupState = JSON.parse(setupStateRaw)
        if (setupState.provisioningOutputs) {
          const outputs = setupState.provisioningOutputs
          setState(prev => ({
            ...prev,
            vpcName: outputs.gcp_vpc_name || prev.vpcName,
            subnetName: outputs.gcp_subnet_name || prev.subnetName,
            podRange: outputs.gcp_ip_range_pods || prev.podRange,
            serviceRange: outputs.gcp_ip_range_services || prev.serviceRange,
            region: outputs.gcp_location || prev.region,
            zones: outputs.gcp_zones ? JSON.parse(outputs.gcp_zones) : prev.zones,
            orchestratorSaEmail: outputs.orchestrator_sa_email || prev.orchestratorSaEmail,
            nodeSaEmail: outputs.node_sa_email || prev.nodeSaEmail,
            wifProvider: outputs.wif_provider_resource_name || prev.wifProvider,
            wifPool: outputs.wif_pool_resource_name || prev.wifPool,
            kmsKeyName: outputs.gcp_kms_key_name || prev.kmsKeyName,
            backupSaEmail: outputs.backup_sa_email || prev.backupSaEmail,
            gcsBucketName: setupState.gcsBucketName || prev.gcsBucketName,
            subnetCidr: outputs.gcp_subnet_cidr || prev.subnetCidr,
            podCidr: outputs.gcp_pod_cidr || prev.podCidr,
            serviceCidr: outputs.gcp_service_cidr || prev.serviceCidr,
            routerName: outputs.gcp_router_name || prev.routerName,
            natName: outputs.gcp_nat_name || prev.natName,
            kmsKeyRingName: outputs.gcp_kms_key_ring_name || prev.kmsKeyRingName,
            opencostApiKey: outputs.opencost_api_key || prev.opencostApiKey,
            customRoles: outputs.gcp_custom_roles || prev.customRoles,
            hmacAccessKey: setupState.hmacAccessKey || prev.hmacAccessKey,
            hmacSecretKey: setupState.hmacSecretKey || prev.hmacSecretKey,
          }))
        } else {
          setState(prev => ({
            ...prev,
            vpcName: setupState.vpcName || prev.vpcName,
            subnetName: setupState.subnetName || prev.subnetName,
            podRange: setupState.ipRangePods || prev.podRange,
            serviceRange: setupState.ipRangeServices || prev.serviceRange,
            region: setupState.region || prev.region,
            zones: setupState.zones || prev.zones,
            gcsBucketName: setupState.gcsBucketName || prev.gcsBucketName,
            subnetCidr: setupState.networkCidr || prev.subnetCidr,
            podCidr: setupState.podCidr || prev.podCidr,
            serviceCidr: setupState.serviceCidr || prev.serviceCidr,
            hmacAccessKey: setupState.hmacAccessKey || prev.hmacAccessKey,
            hmacSecretKey: setupState.hmacSecretKey || prev.hmacSecretKey,
          }))
        }
      } catch (e) {
        console.error("Failed to parse setup state", e)
      }
    }
  }, [])

  useEffect(() => {
    if (!state.clusterName) {
      setState((prev) => ({ ...prev, clusterName: generateClusterName() }))
    }
  }, [state.clusterName])

  const updateState = (updates: Partial<ClusterState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem("gcpClusterSetupState", JSON.stringify(next))
      return next
    })
  }

  const validations = {
    clusterName: (state.clusterName || "").length >= 3,
    region: !!state.region,
    permissions: !!state.orchestratorSaEmail,
    encryption: !!state.kmsKeyName,
  }

  const allValid = Object.values(validations).every(Boolean)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Cloud Environment</h1>
          <p className="mt-2 text-muted-foreground">
            Review your system details — these are automatically filled in for you.
          </p>
        </div>

        {/* System Summary */}
        <div className="space-y-6 mb-6">
          <Card className="border-blue-100 shadow-sm bg-blue-50/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">System Summary</h2>
              </div>

              <div className="grid gap-4">
                {/* Cluster Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Identity</Label>
                  <div className="flex items-center gap-3">
                     <code className="px-3 py-1.5 bg-white rounded-lg text-sm font-mono border border-blue-200 text-blue-900">
                        {state.clusterName}
                     </code>
                     <ValidationBadge valid={true} label="Identified" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-blue-100/50">
                  <div className="space-y-1">
                    <ValidationBadge valid={validations.region} label="Location Ready" />
                    <p className="text-[10px] text-muted-foreground ml-6">Region: {state.region || "us-central1"}</p>
                  </div>
                  <div className="space-y-1">
                    <ValidationBadge valid={!!state.vpcName} label="Network Ready" />
                    <p className="text-[10px] text-muted-foreground ml-6">Private & Secure</p>
                  </div>
                  <div className="space-y-1">
                    <ValidationBadge valid={validations.permissions} label="Access Ready" />
                    <p className="text-[10px] text-muted-foreground ml-6">IAM Roles Verified</p>
                  </div>
                  <div className="space-y-1">
                    <ValidationBadge valid={validations.encryption} label="Data Protected" />
                    <p className="text-[10px] text-muted-foreground ml-6">KMS Encrypted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4 mb-8">
          {/* Network Foundation Section */}
          <SectionCard
            title="Network"
            icon={Network}
            badge="Read-only · Auto-filled"
            defaultOpen={true}
          >
            <div className="space-y-6 pt-4">
              <p className="text-sm text-muted-foreground">
                Your system will run inside the private network that was already set up for you. These values were imported from your cloud environment setup.
              </p>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-blue-900/60">Deployment Region</Label>
                      </div>
                      <code className="block p-2 bg-white/80 rounded-lg text-[11px] font-bold text-blue-900 font-mono border border-blue-200/50">
                        {state.region || "us-central1"}
                      </code>
                   </div>
                   <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Settings className="w-3.5 h-3.5 text-emerald-600" />
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-emerald-900/60">Availability Zones</Label>
                      </div>
                      <code className="block p-2 bg-white/80 rounded-lg text-[11px] font-bold text-emerald-900 font-mono border border-emerald-200/50">
                        {state.zones?.join(", ") || "us-central1-a, us-central1-b"}
                      </code>
                   </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">VPC Network</Label>
                    <p className="text-[10px] text-muted-foreground -mt-0.5">The main isolated container for all your cloud resources.</p>
                    <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                      {state.vpcName || "Pending..."}
                    </code>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subnet</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">A secure section of your network where your system's servers run.</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border break-all">
                    {state.subnetName || "Pending..."}
                  </code>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subnet CIDR Block</Label>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">The range of internal addresses for your primary network section.</p>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                    {state.subnetCidr || "Pending..."}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pod IP Range</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Internal addresses reserved for application containers.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.podRange || "Pending..."}
                      </code>
                      <code className="block mt-1 p-1 px-2 bg-white/50 rounded text-[9px] font-mono border border-dashed text-muted-foreground">
                        {state.podCidr || "0.0.0.0/0"}
                      </code>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service IP Range</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Addresses used for internal load balancing between apps.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.serviceRange || "Pending..."}
                      </code>
                      <code className="block mt-1 p-1 px-2 bg-white/50 rounded text-[9px] font-mono border border-dashed text-muted-foreground">
                        {state.serviceCidr || "0.0.0.0/0"}
                      </code>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cloud Router</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">The traffic director that manages communication for your network.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.routerName || "Pending..."}
                      </code>
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cloud NAT</Label>
                      <p className="text-[10px] text-muted-foreground -mt-0.5">Allows secure servers to download updates while staying private.</p>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono border">
                        {state.natName || "Pending..."}
                      </code>
                   </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Security Section */}
          <SectionCard
            title="Security Permissions"
            icon={Shield}
            badge="Read-only · Auto-filled"
            defaultOpen={false}
          >
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                These permissions were automatically set up to keep your system secure. No action needed.
              </p>                <div className="space-y-6">
                  {/* Deployment Service Account */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">System Orchestrator Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">The primary identity used to automate the creation and management of your cloud resources.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.orchestratorSaEmail || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Node Service Account */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Compute Node Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Permissions that allow your compute servers to run applications and securely access cloud services.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.nodeSaEmail || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Backup Service Account */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Storage Backup Identity</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Permissions used to safely create backups of your data and restore them during recovery.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Account Email</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                        {state.backupSaEmail || "Pending outputs..."}
                      </code>
                    </div>
                  </div>

                  {/* Workload Identity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Cross-Cloud Trust Pool</Label>
                    <p className="text-[10px] text-muted-foreground -mt-1.5">Allows our platform to securely access your System Orchestrator Identity without needing static keys.</p>
                    <div className="ml-6 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">WIF Provider</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                          {state.wifProvider || "Pending outputs..."}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">WIF Pool</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                          {state.wifPool || "Pending outputs..."}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Encryption */}
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Lock className="w-4 h-4" />
                      <Label className="text-sm font-bold">Master Encryption Key</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6 -mt-1">A master key used to encrypt and protect your system secrets and sensitive data at rest.</p>
                    <div className="ml-6 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Encryption Key Group (KeyRing)</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {state.kmsKeyRingName || "Pending outputs..."}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">KMS Crypto Key</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {state.kmsKeyName || "Pending outputs..."}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Billing Security */}
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-amber-600">
                      <DollarSign className="w-4 h-4" />
                      <Label className="text-sm font-bold">Billing Discovery Key</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6 -mt-1">Restricted key used exclusively for cloud cost monitoring.</p>
                    <div className="ml-6 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">OpenCost API Key</Label>
                      <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                        {state.opencostApiKey || "Sensitive · Managed"}
                      </code>
                    </div>
                  </div>

                  {/* Storage Credentials */}
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Database className="w-4 h-4" />
                      <Label className="text-sm font-bold">Storage Access Keys</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6 -mt-1">S3-compatible credentials used for managing your datalake and system logs.</p>
                    <div className="ml-6 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Access Key ID (HMAC)</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {state.hmacAccessKey || "Imported from setup"}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Secret Access Key (HMAC)</Label>
                        <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border">
                          {state.hmacSecretKey ? "••••••••••••••••" : "Imported from setup"}
                        </code>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </SectionCard>

          {/* Storage Section */}
          <SectionCard
            title="Cloud Storage"
            icon={Database}
            badge="Auto-detected"
            defaultOpen={true}
          >
            <div className="space-y-4 pt-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  This bucket is used as the primary storage for system backups and your internal datalake.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">Primary Data Bucket</Label>
                  <HelperTooltip text="The GCS bucket where your system backups and data files are stored." />
                </div>
                <div className="ml-6 space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">GCS Bucket Name</Label>
                  <code className="block p-2 bg-muted rounded text-[10px] font-mono break-all border min-h-[2.5rem]">
                    {state.gcsBucketName || "Not configured"}
                  </code>
                </div>
              </div>
            </div>
          </SectionCard>

        </div>

        <Card className="mb-8">
          <CardContent className="p-4 flex flex-wrap gap-4">
            <ValidationBadge valid={validations.clusterName} label="Name generated" />
            <ValidationBadge valid={validations.permissions} label="IAM ready" />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/gcp/cloud-setup")}>Back</Button>
          <Button
            size="lg"
            disabled={!allValid}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/gcp/compute-strategy")}
          >
            Continue to Compute Settings
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
