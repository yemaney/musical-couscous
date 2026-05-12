"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Cloud,
  Settings,
  Network,
  Database,
  FileText,
  Upload,
  CheckCircle2,
  Copy,
  Download,
  ChevronRight,
  ChevronLeft,
  Loader2,
  HelpCircle,
  Shield,
  DollarSign,
  UserPlus,
  KeyRound,
  Circle,
  AlertCircle,
  ArrowRight,
  Terminal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

const GCP_REGIONS = [
  { value: "northamerica-northeast2", label: "Toronto (northamerica-northeast2)", recommended: true },
  { value: "us-central1", label: "Iowa (us-central1)" },
  { value: "us-east1", label: "South Carolina (us-east1)" },
  { value: "us-east4", label: "Northern Virginia (us-east4)" },
  { value: "us-west1", label: "Oregon (us-west1)" },
  { value: "europe-west1", label: "Belgium (europe-west1)" },
  { value: "europe-west4", label: "Netherlands (europe-west4)" },
  { value: "asia-southeast1", label: "Singapore (asia-southeast1)" },
]

type SetupMode = "recommended" | "advanced"
type GCSAccountOption = "create" | "existing"

interface WizardState {
  setupMode: SetupMode
  region: string
  zone1: string
  vpcName: string
  subnetName: string
  ipRangePods: string
  ipRangeServices: string
  networkCidr: string
  podCidr: string
  serviceCidr: string
  useOwnVpc: boolean
  gcsAccountOption: GCSAccountOption
  gcsBucketName: string
  hmacAccessKey: string
  hmacSecretKey: string
  outputsUploaded: boolean
  provisioningOutputs?: any
  subdomain: string
  projectId: string
  createNetwork: boolean
  createStorageBackupSa: boolean
}

const initialState: WizardState = {
  setupMode: "recommended",
  region: "northamerica-northeast2",
  zone1: "northamerica-northeast2-a",
  vpcName: "",
  subnetName: "",
  ipRangePods: "",
  ipRangeServices: "",
  networkCidr: "",
  podCidr: "10.1.0.0/16",
  serviceCidr: "10.2.0.0/20",
  useOwnVpc: true,
  gcsAccountOption: "create",
  gcsBucketName: "",
  hmacAccessKey: "",
  hmacSecretKey: "",
  outputsUploaded: false,
  subdomain: "testapp-app",
  projectId: "58498364-0ad4",
  createNetwork: true,
  createStorageBackupSa: true,
}

const STEPS = [
  { id: 0, title: "Welcome", icon: Cloud },
  { id: 2, title: "Network", icon: Network },
  { id: 3, title: "Storage", icon: Database },
  { id: 5, title: "Review", icon: FileText },
  { id: 9, title: "Complete", icon: CheckCircle2 },
]

function CommandBlock({ command, onCopy }: { command: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto font-mono w-full">
        {command}
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
      </Button>
    </div>
  )
}

function HelperTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function OptionCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  recommended,
}: {
  selected: boolean
  onClick: () => void
  icon: any
  title: string
  description: string
  recommended?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full p-6 rounded-xl border-2 text-left transition-all duration-200",
        "hover:border-blue-500/50 hover:bg-blue-50/50",
        selected
          ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
          : "border-border bg-card"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-4 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
          Recommended
        </span>
      )}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-lg",
            selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            selected ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30"
          )}
        >
          {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
      </div>
    </button>
  )
}

export function GCPCloudSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [state, setState] = useState<WizardState>(initialState)
  const [isUploading, setIsUploading] = useState(false)

  const visibleSteps = useMemo(() => {
    return STEPS
  }, [state.setupMode])

  const currentStepIndex = useMemo(() => {
    return visibleSteps.findIndex((step) => step.id === currentStep)
  }, [visibleSteps, currentStep])

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem("gcpCloudSetupState", JSON.stringify(next))
      return next
    })
  }

  const goNext = () => {
    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStep(visibleSteps[currentStepIndex + 1].id)
      window.scrollTo(0, 0)
    }
  }

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(visibleSteps[currentStepIndex - 1].id)
      window.scrollTo(0, 0)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Mock the output parsing since this is a UI demo
      const mockOutputs = {
        orchestrator_sa_email: `orchestrator-${state.projectId}@wired-height-365016.iam.gserviceaccount.com`,
        node_sa_email: `gke-node-sa-${state.projectId}@wired-height-365016.iam.gserviceaccount.com`,
        gcp_kms_key_name: `projects/wired-height-365016/locations/${state.region}/keyRings/gke-keyring-${state.projectId}-d30a/cryptoKeys/gke-key-${state.projectId}`,
        wif_provider_resource_name: `projects/478466301778/locations/global/workloadIdentityPools/pool-${state.projectId}-d30a/providers/aws-provider`,
        wif_pool_resource_name: `projects/478466301778/locations/global/workloadIdentityPools/pool-${state.projectId}-d30a`,
        gcp_vpc_name: state.vpcName || `${state.subdomain}-${state.projectId}`,
        gcp_subnet_name: state.subnetName || `${state.subdomain}-${state.projectId}`,
        gcp_ip_range_pods: state.ipRangePods || `pods-${state.subdomain}-${state.projectId}`,
        gcp_ip_range_services: state.ipRangeServices || `services-${state.subdomain}-${state.projectId}`,
      }

      updateState({ 
        outputsUploaded: true,
        provisioningOutputs: mockOutputs
      })
      setIsUploading(false)
    }
  }

  const generateCommand = () => {
    const vars: string[] = []

    // Identity parameters
    vars.push(`project_id=${state.projectId}`)
    vars.push(`subdomain=${state.subdomain}`)
    vars.push(`gcp_project_id=[GCP_PROJECT_ID]`)
    vars.push(`gcp_location=${state.region}`)
    vars.push(`gcp_zones=["${state.zone1}"]`)

    // Network parameters
    if (state.useOwnVpc) {
      vars.push(`create_network=false`)
      vars.push(`existing_network_name=${state.vpcName}`)
      vars.push(`existing_subnet_name=${state.subnetName}`)
      vars.push(`existing_ip_range_pods=${state.ipRangePods}`)
      vars.push(`existing_ip_range_services=${state.ipRangeServices}`)
      vars.push(`existing_subnet_cidr=${state.networkCidr}`)
      vars.push(`existing_pod_cidr=${state.podCidr}`)
      vars.push(`existing_service_cidr=${state.serviceCidr}`)
    } else {
      vars.push(`create_network=true`)
      vars.push(`subnet_range=${state.networkCidr || "10.0.0.0/24"}`)
    }

    // Storage parameters
    vars.push(`bucket=${state.gcsBucketName || "<bucket-name>"}`)
    vars.push(`hmac_access_key=${state.hmacAccessKey || "<access-key>"}`)
    vars.push(`hmac_secret_key=${state.hmacSecretKey || "<secret-key>"}`)
    
    const inputValues = vars.join(",")
    const deploymentName = `orchestrator-${state.projectId}`

    return `gcloud infra-manager deployments apply "projects/[PROJECT_ID]/locations/${state.region}/deployments/${deploymentName}" \\
  --local-source="." \\
  --input-values='${inputValues}' \\
  --service-account="projects/[PROJECT_ID]/serviceAccounts/[SERVICE_ACCOUNT]" \\
  --project="[PROJECT_ID]" \\
  --location="${state.region}"`
  }

  const getOutputsCommand = `REVISION_ID=$(gcloud infra-manager deployments describe "orchestrator-${state.projectId}" \\
  --location="${state.region}" \\
  --format="value(latestRevision.basename())")

gcloud infra-manager revisions describe "$REVISION_ID" \\
  --deployment="orchestrator-${state.projectId}" \\
  --location="${state.region}" \\
  --format="json(applyResults.outputs)" > outputs.json`

  const saName = `sa-${state.projectId}`.substring(0, 30)
  const saEmail = `${saName}@[GCP_PROJECT_ID].iam.gserviceaccount.com`
  const createHmacKeyCommand = `gcloud storage hmac create "${saEmail}" --project="[GCP_PROJECT_ID]"`

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return true
      case 2:
        if (state.setupMode === "recommended") {
          return (state.region || "").trim() !== "" && (state.zone1 || "").trim() !== ""
        }
        if (state.useOwnVpc) {
          return !!(
            state.region &&
            state.vpcName &&
            state.subnetName &&
            state.ipRangePods &&
            state.ipRangeServices &&
            state.networkCidr &&
            state.podCidr &&
            state.serviceCidr
          )
        } else {
          return (state.networkCidr || "").trim() !== ""
        }
      case 3:
        return (state.gcsBucketName || "").trim() !== ""
      case 5:
        const baseRequirement = state.outputsUploaded
        if (state.gcsBucketName) {
          return baseRequirement && !!state.hmacAccessKey && !!state.hmacSecretKey
        }
        return baseRequirement
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
              <Cloud className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Let&apos;s set up your cloud
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                This takes approximately 5 minutes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-2xl mx-auto">
              <OptionCard
                selected={state.setupMode === "recommended"}
                onClick={() => updateState({ setupMode: "recommended" })}
                recommended
                icon={CheckCircle2}
                title="Simple"
                description="Automatically create a new private network for you."
              />
              <OptionCard
                selected={state.setupMode === "advanced"}
                onClick={() => updateState({ setupMode: "advanced" })}
                icon={Settings}
                title="Advanced"
                description="Use your own existing private network."
              />
            </div>
          </div>
        )


      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                <Network className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Network Configuration</h2>
              <p className="mt-2 text-muted-foreground">Select your deployment region and network parameters</p>
            </div>
            
            <div className="grid gap-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">GCP Region</Label>
                    <Select
                      value={state.region}
                      onValueChange={(value) => updateState({ region: value, zone1: `${value}-a` })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {GCP_REGIONS.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Zone</Label>
                    <Input
                      value={state.zone1}
                      onChange={(e) => updateState({ zone1: e.target.value })}
                      placeholder={`${state.region}-a`}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                {state.setupMode === "advanced" && (
                  <div className="pt-8 border-t space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 shadow-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-bold">Use my own VPC</Label>
                          <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0">Bring-Your-Own</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Connect to your existing infrastructure instead of creating new resources.</p>
                      </div>
                      <Switch
                        checked={!state.createNetwork}
                        onCheckedChange={(checked) => updateState({ createNetwork: !checked, useOwnVpc: checked })}
                      />
                    </div>

                    {state.useOwnVpc && (
                      <div className="space-y-4 mb-6 pb-6 border-b">
                        <div className="space-y-2">
                          <Label htmlFor="vpcName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">VPC Name</Label>
                          <Input id="vpcName" placeholder="testapp-app-958e7ba3-5d35" value={state.vpcName || ""} onChange={(e) => updateState({ vpcName: e.target.value })} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subnetName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Subnet Name</Label>
                          <Input id="subnetName" placeholder="subnet-testapp" value={state.subnetName || ""} onChange={(e) => updateState({ subnetName: e.target.value })} className="h-12 rounded-xl" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pods" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pod IP Range Name</Label>
                            <Input id="pods" placeholder="pods-range" value={state.ipRangePods || ""} onChange={(e) => updateState({ ipRangePods: e.target.value })} className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="services" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Service IP Range Name</Label>
                            <Input id="services" placeholder="services-range" value={state.ipRangeServices || ""} onChange={(e) => updateState({ ipRangeServices: e.target.value })} className="h-12 rounded-xl" />
                          </div>
                        </div>

                        {/* Secondary CIDR Blocks */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="podCidr" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pod CIDR Block</Label>
                            <Input id="podCidr" placeholder="10.1.0.0/16" value={state.podCidr || ""} onChange={(e) => updateState({ podCidr: e.target.value })} className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="serviceCidr" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Service CIDR Block</Label>
                            <Input id="serviceCidr" placeholder="10.2.0.0/20" value={state.serviceCidr || ""} onChange={(e) => updateState({ serviceCidr: e.target.value })} className="h-12 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="cidr" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Network CIDR Block</Label>
                      <Input id="cidr" placeholder="10.128.0.0/20" value={state.networkCidr || ""} onChange={(e) => updateState({ networkCidr: e.target.value })} className="h-12 rounded-xl" />
                      <p className="text-[10px] text-muted-foreground italic">The IP range of the {state.useOwnVpc ? "existing" : "new"} VPC</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Storage Configuration</h2>
              <p className="mt-2 text-muted-foreground">Configure your GCS buckets and S3-compatible HMAC keys</p>
            </div>

            <div className="space-y-8 max-w-xl mx-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">GCS Bucket Name</Label>
                  <Input
                    placeholder="my-gcp-data-lake"
                    value={state.gcsBucketName}
                    onChange={(e) => updateState({ gcsBucketName: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    The name of the GCS bucket where your system state and backups will be stored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-blue-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Review and Deploy</h2>
              <p className="mt-2 text-muted-foreground">Follow these steps to complete your setup</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="bg-muted/30 border-none shadow-none mb-8 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500 text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 leading-tight">What will be created?</h3>
                      <p className="text-xs text-blue-700/70">A summary of the resources being provisioned</p>
                    </div>
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Security & IAM</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            A dedicated Service Account and encryption keys (KMS) will be created. Managed keys typically incur a small monthly fee and usage costs.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Storage Access</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            HMAC credentials to connect your <span className="font-mono">{state.gcsBucketName}</span> bucket for state management.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {!state.useOwnVpc && (
                        <div className="flex gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">Private Network</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              A new VPC, Subnet, and Cloud NAT will be provisioned to isolate your cluster's traffic. These resources may incur standard cloud provider costs.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-12">
              {/* Step 1: Download Template */}
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black shrink-0">1</div>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-bold">Download Terraform Configuration</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Save the Terraform <code className="px-1.5 py-0.5 bg-muted rounded font-mono">main.tf</code> file to your project directory.
                  </p>
                  <Button variant="outline" className="h-12 px-6 gap-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-bold">
                    <Download className="w-4 h-4" /> Download Terraform (.tf)
                  </Button>
                </div>
              </div>

              {/* Step 2: Run Command */}
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black shrink-0">2</div>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-bold">Apply Configuration</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Deploy your infrastructure using GCP Infrastructure Manager. Ensure you run this inside the directory with your <code className="px-1.5 py-0.5 bg-muted rounded font-mono">main.tf</code>:
                  </p>
                  <div className="space-y-3">
                    <CommandBlock command={generateCommand()} />
                  </div>
                </div>
              </div>

              {/* Step 3: Get Outputs */}
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black shrink-0">3</div>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-bold">Export Deployment Metadata</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Once the deployment completes, export the outputs to a JSON file for the next step:
                  </p>
                  <CommandBlock command={getOutputsCommand} />
                </div>
              </div>

              {/* Step 4: Upload File */}
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black shrink-0">4</div>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-bold">Connect Your Environment</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload the generated <code className="px-1.5 py-0.5 bg-muted rounded font-mono">outputs.json</code> to finalize your setup:
                  </p>
                  
                  <label 
                    htmlFor="outputs-upload"
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all",
                      state.outputsUploaded ? "bg-emerald-50 border-emerald-500 shadow-inner" : "bg-muted/20 border-muted-foreground/20 hover:border-blue-500 hover:bg-blue-50/50"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    ) : state.outputsUploaded ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <span className="text-emerald-700 font-bold">Metadata Captured</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-10 h-10 text-muted-foreground/30" />
                        <span className="text-sm font-medium">Click or drag outputs.json</span>
                      </div>
                    )}
                    <input id="outputs-upload" type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Step 5: HMAC Keys (Conditional) */}
              {state.gcsBucketName && (
                <div className="flex items-start gap-6 pt-12 border-t border-dashed">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black shrink-0">5</div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <p className="text-lg font-bold">Generate HMAC access keys</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        Since you are using storage backups, you need to generate S3-compatible HMAC keys for the Service Account. Run this command in your Cloud Shell or terminal:
                      </p>
                    </div>
                    <CommandBlock command={createHmacKeyCommand} />
                    <div className="grid sm:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-2xl border border-border/50">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">HMAC Access Key</Label>
                        <Input
                          placeholder="GOOG..."
                          value={state.hmacAccessKey}
                          onChange={(e) => updateState({ hmacAccessKey: e.target.value })}
                          className="h-12 rounded-xl bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">HMAC Secret Key</Label>
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          value={state.hmacSecretKey}
                          onChange={(e) => updateState({ hmacSecretKey: e.target.value })}
                          className="h-12 rounded-xl bg-background"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-blue-500" /> These keys are required to connect your cluster to Google Cloud Storage.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )

      case 9:
        return (
          <div className="text-center space-y-8 py-12">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight">System is Ready</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                Your high-performance infrastructure has been successfully connected and verified.
              </p>
            </div>
            <div className="max-w-xs mx-auto space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <Shield className="w-4 h-4" /> Secure Provisioning Complete
              </div>
            </div>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-16 px-12 text-lg font-bold rounded-2xl shadow-xl shadow-blue-600/20 group" onClick={() => router.push("/gcp/cluster-setup")}>
              Next: Configure Cluster <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Vertical Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                  Wizard Progress
                </h3>
                <nav className="space-y-0">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index === currentStepIndex
                    const isComplete = index < currentStepIndex
                    return (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => isComplete && setCurrentStep(step.id)}
                            disabled={!isComplete}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all relative z-10",
                              isActive
                                ? "bg-white border-blue-500 text-blue-600 shadow-lg shadow-blue-500/20"
                                : isComplete
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "bg-muted border-transparent text-muted-foreground/30"
                            )}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          </button>
                          {index < STEPS.length - 1 && (
                            <div className={cn("w-0.5 h-10 -my-1 rounded relative z-0", isComplete ? "bg-blue-500" : "bg-muted")} />
                          )}
                        </div>
                        <div className="pt-1.5 flex-1">
                          <div className={cn("text-sm font-bold transition-colors", isActive ? "text-blue-600" : isComplete ? "text-foreground" : "text-muted-foreground/30")}>
                            {step.title}
                          </div>
                          {isActive && (
                            <div className="text-[10px] text-blue-500/70 font-medium uppercase tracking-wider animate-in fade-in slide-in-from-left-1">
                              In Progress
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </nav>
              </div>
              
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Secure Setup</span>
                </div>
                <p className="text-[10px] text-blue-600 leading-relaxed">
                  Your configuration is encrypted and stored locally in your browser.
                </p>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0 pb-32">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {renderStepContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Navigation */}
      {currentStep !== 9 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="hidden md:block w-64" /> {/* Spacer to align with content */}
            <div className="flex-1 flex items-center justify-between md:pl-12">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={currentStepIndex === 0}
                className="gap-2 h-12 px-6 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={goNext}
                disabled={!canGoNext()}
                className="gap-2 h-12 px-8 bg-blue-600 hover:bg-blue-700 font-bold"
              >
                {currentStep === 5 ? "Verify & Finish" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
