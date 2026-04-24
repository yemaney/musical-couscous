"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SetupMode = "recommended" | "advanced"
type GCSAccountOption = "create" | "existing"

interface WizardState {
  setupMode: SetupMode
  // Network fields (Advanced only)
  vpcName: string
  subnetNames: string
  firewallRules: string
  networkCidr: string
  serviceCidr: string
  // Storage fields
  gcsAccountOption: GCSAccountOption
  gcsBucketName: string
  serviceAccountKey: string
  // Progress tracking
  outputsUploaded: boolean
}

const initialState: WizardState = {
  setupMode: "recommended",
  vpcName: "",
  subnetNames: "",
  firewallRules: "",
  networkCidr: "",
  serviceCidr: "",
  gcsAccountOption: "create",
  gcsBucketName: "",
  serviceAccountKey: "",
  outputsUploaded: false,
}

const STEPS = [
  { id: 0, title: "Welcome", icon: Cloud },
  { id: 2, title: "Network", icon: Network },
  { id: 3, title: "Storage", icon: Database },
  { id: 5, title: "Review", icon: FileText },
  { id: 9, title: "Complete", icon: CheckCircle2 },
]

function OptionCard({
  selected,
  onClick,
  recommended,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  recommended?: boolean
  icon: React.ElementType
  title: string
  description: string
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

function CommandBlock({ command, onCopy }: { command: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    onCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto font-mono">
        {command}
      </pre>
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function GCPCloudSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [state, setState] = useState<WizardState>(initialState)
  const [isUploading, setIsUploading] = useState(false)

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const getVisibleSteps = useCallback(() => {
    if (state.setupMode === "recommended") {
      return STEPS.filter((step) => step.id !== 2)
    }
    return STEPS
  }, [state.setupMode])

  const visibleSteps = getVisibleSteps()

  const getCurrentStepIndex = () => {
    return visibleSteps.findIndex((step) => step.id === currentStep)
  }

  const goNext = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < visibleSteps.length - 1) {
      setCurrentStep(visibleSteps[currentIndex + 1].id)
    }
  }

  const goBack = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(visibleSteps[currentIndex - 1].id)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateState({ outputsUploaded: true })
      setIsUploading(false)
    }
  }

  const generateCommand = () => {
    const params: string[] = []
    
    if (state.setupMode === "recommended") {
      params.push("create_network=true")
    } else {
      params.push("create_network=false")
      params.push(`vpc_name=${state.vpcName || "<vpc-name>"}`)
      params.push(`subnet_names=${state.subnetNames || "<subnet-names>"}`)
      params.push(`network_cidr=${state.networkCidr || "<network-cidr>"}`)
    }
    
    params.push(`gcs_bucket_name=${state.gcsBucketName || "<bucket-name>"}`)
    
    return `gcloud deployment-manager deployments create cloud-setup \\
  --template template.py \\
  --properties \\
    ${params.join(",")}`
  }

  const createServiceAccountKeyCommand = `gcloud iam service-accounts keys create key.json --iam-account=gcs-backup-sa@<project-id>.iam.gserviceaccount.com`

  const getOutputsCommand = `gcloud deployment-manager deployments describe cloud-setup --format=json > outputs.json`

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
              <Cloud className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Set up your Google Cloud
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Provisioning your GCP foundations takes about 5 minutes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-2xl mx-auto">
              <OptionCard
                selected={state.setupMode === "recommended"}
                onClick={() => updateState({ setupMode: "recommended" })}
                recommended
                icon={CheckCircle2}
                title="Recommended"
                description="Fully automated VPC and IAM setup."
              />
              <OptionCard
                selected={state.setupMode === "advanced"}
                onClick={() => updateState({ setupMode: "advanced" })}
                icon={Settings}
                title="Advanced"
                description="Use existing VPC networks and custom subnets."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                VPC Network Configuration
              </h2>
              <p className="mt-2 text-muted-foreground">
                Provide your existing GCP network details
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vpcName">VPC Network Name *</Label>
                  <HelperTooltip text="The name of your VPC network" />
                </div>
                <Input
                  id="vpcName"
                  placeholder="my-vpc-network"
                  value={state.vpcName}
                  onChange={(e) => updateState({ vpcName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="subnetNames">Subnet Names *</Label>
                  <HelperTooltip text="Comma-separated list of subnet names" />
                </div>
                <Input
                  id="subnetNames"
                  placeholder="subnet-1, subnet-2"
                  value={state.subnetNames}
                  onChange={(e) => updateState({ subnetNames: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="networkCidr">Network CIDR Range *</Label>
                  <HelperTooltip text="The primary CIDR range (e.g., 10.128.0.0/20)" />
                </div>
                <Input
                  id="networkCidr"
                  placeholder="10.128.0.0/20"
                  value={state.networkCidr}
                  onChange={(e) => updateState({ networkCidr: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="serviceCidr">GKE Pod Address Range *</Label>
                  <HelperTooltip text="Secondary range for GKE pods" />
                </div>
                <Input
                  id="serviceCidr"
                  placeholder="10.4.0.0/14"
                  value={state.serviceCidr}
                  onChange={(e) => updateState({ serviceCidr: e.target.value })}
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                * All fields are required
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Cloud Storage (GCS)
              </h2>
              <p className="mt-2 text-muted-foreground">
                Configure your storage buckets and service accounts
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <OptionCard
                selected={state.gcsAccountOption === "create"}
                onClick={() => updateState({ gcsAccountOption: "create" })}
                recommended
                icon={UserPlus}
                title="Create Service Account"
                description="We'll generate a dedicated SA for storage access."
              />
              <OptionCard
                selected={state.gcsAccountOption === "existing"}
                onClick={() => updateState({ gcsAccountOption: "existing" })}
                icon={KeyRound}
                title="Use Existing SA Key"
                description="I already have a JSON key for this bucket."
              />
            </div>

            <div className="space-y-6 max-w-lg mx-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="gcsBucketName">GCS Bucket Name *</Label>
                  <HelperTooltip text="Global name for your storage bucket" />
                </div>
                <Input
                  id="gcsBucketName"
                  placeholder="my-gcp-data-bucket"
                  value={state.gcsBucketName}
                  onChange={(e) => updateState({ gcsBucketName: e.target.value })}
                  required
                />
              </div>

              {state.gcsAccountOption === "create" && (
                <div className="border-t pt-6 animate-in slide-in-from-top-4 duration-300">
                  <h3 className="font-semibold text-foreground mb-3">Generate Service Account Key</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run this command to create and download the JSON key:
                  </p>
                  <CommandBlock command={createServiceAccountKeyCommand} onCopy={() => {}} />
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-foreground">Service Account Key (JSON)</h3>
                <p className="text-sm text-muted-foreground">
                  Paste the contents of your Service Account JSON key:
                </p>
                <textarea
                  className="w-full h-32 p-3 bg-muted rounded-lg font-mono text-xs border"
                  placeholder='{ "type": "service_account", ... }'
                  value={state.serviceAccountKey}
                  onChange={(e) => updateState({ serviceAccountKey: e.target.value })}
                />
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
              <p className="mt-2 text-muted-foreground">Follow these steps to complete your GCP setup</p>
            </div>

            <Card className="max-w-lg mx-auto">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Your GCP Selections</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="text-sm">
                      {state.setupMode === "recommended"
                        ? "VPC Network will be automatically created"
                        : `Using network: ${state.vpcName || "Not specified"}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="text-sm">
                      GCS bucket &quot;{state.gcsBucketName || "Not specified"}&quot; configured
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Using Deployment Manager (Safe)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Estimated monthly cost: $40-$120</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="max-w-2xl mx-auto space-y-8">
              <h3 className="font-semibold text-foreground text-lg">Deployment Steps</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">1</div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Download template</p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download template.py
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">2</div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Run gcloud command</p>
                    <CommandBlock command={generateCommand()} onCopy={() => {}} />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">3</div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Export outputs</p>
                    <CommandBlock command={getOutputsCommand} onCopy={() => {}} />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">4</div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Upload outputs.json</p>
                    <label
                      htmlFor="file-upload"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                        state.outputsUploaded
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-blue-500 hover:bg-blue-50/50"
                      )}
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : state.outputsUploaded ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-blue-600">Uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload outputs.json</p>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading || state.outputsUploaded}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground">🎉 Google Cloud Ready!</h2>
              <p className="mt-3 text-lg text-muted-foreground">Infrastructure provisioned successfully</p>
            </div>

            <Button 
              size="lg" 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                localStorage.setItem("gcpCloudSetupState", JSON.stringify(state))
                router.push("/gcp/cluster-setup")
              }}
            >
              Continue to GKE Setup
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 2:
        return state.vpcName.trim() !== "" && state.subnetNames.trim() !== "" && state.networkCidr.trim() !== ""
      case 3:
        return state.gcsBucketName.trim() !== "" && state.serviceAccountKey.trim() !== ""
      case 5:
        return state.outputsUploaded
      default:
        return true
    }
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Step {currentStepIndex + 1} of {visibleSteps.length}</span>
            <span className="text-sm font-medium text-foreground">{visibleSteps[currentStepIndex]?.title}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          {renderStepContent()}
        </div>
      </main>

      {currentStep !== 9 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="outline" onClick={goBack} disabled={currentStepIndex === 0} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={goNext} disabled={!canGoNext()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
