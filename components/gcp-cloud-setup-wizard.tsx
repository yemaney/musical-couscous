"use client"

import { useState, useCallback, useMemo } from "react"
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

type SetupMode = "recommended" | "advanced"
type GCSAccountOption = "create" | "existing"

interface WizardState {
  setupMode: SetupMode
  vpcName: string
  subnetName: string
  ipRangePods: string
  ipRangeServices: string
  networkCidr: string
  gcsAccountOption: GCSAccountOption
  gcsBucketName: string
  hmacAccessKey: string
  hmacSecretKey: string
  outputsUploaded: boolean
}

const initialState: WizardState = {
  setupMode: "recommended",
  vpcName: "",
  subnetName: "",
  ipRangePods: "",
  ipRangeServices: "",
  networkCidr: "",
  gcsAccountOption: "create",
  gcsBucketName: "",
  hmacAccessKey: "",
  hmacSecretKey: "",
  outputsUploaded: false,
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
      <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-blue-300 overflow-x-auto border border-white/10 shadow-inner">
        <code>{command}</code>
      </div>
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
        "relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 group",
        selected
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/5"
          : "border-border bg-card hover:border-blue-500/30 hover:bg-blue-50/30"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-6 px-3 py-1 text-[10px] font-bold bg-blue-500 text-white rounded-full uppercase tracking-wider shadow-sm">
          Recommended
        </span>
      )}
      <div className="flex gap-5">
        <div
          className={cn(
            "p-3 rounded-xl transition-colors",
            selected ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-muted text-muted-foreground group-hover:text-blue-600"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-lg font-bold", selected ? "text-blue-900" : "text-foreground")}>
            {title}
          </h4>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="shrink-0">
          {selected ? (
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground/30" />
          )}
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
    if (state.setupMode === "recommended") {
      return STEPS.filter((step) => step.id !== 2)
    }
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
      updateState({ outputsUploaded: true })
      setIsUploading(false)
    }
  }

  const generateCommand = () => {
    const vars: string[] = []
    if (state.setupMode === "recommended") {
      vars.push('create_network="true"')
    } else {
      vars.push('create_network="false"')
      vars.push(`vpc_name="${state.vpcName || "<vpc-name>"}"`)
      vars.push(`subnet_name="${state.subnetName || "<subnet-name>"}"`)
      vars.push(`ip_range_pods="${state.ipRangePods || "<pods-range>"}"`)
      vars.push(`ip_range_services="${state.ipRangeServices || "<services-range>"}"`)
      vars.push(`network_cidr="${state.networkCidr || "<cidr>"}"`)
    }
    vars.push(`gcs_bucket_name="${state.gcsBucketName || "<bucket-name>"}"`)
    vars.push(`hmac_access_key="${state.hmacAccessKey || "<access-key>"}"`)
    vars.push(`hmac_secret_key="${state.hmacSecretKey || "<secret-key>"}"`)
    
    return `terraform apply \\
  ${vars.map(v => `-var ${v}`).join(" \\\n  ")}`
  }

  const getOutputsCommand = `terraform output -json > outputs.json`

  const canGoNext = () => {
    switch (currentStep) {
      case 2:
        return (
          (state.vpcName || "").trim() !== "" &&
          (state.subnetName || "").trim() !== "" &&
          (state.ipRangePods || "").trim() !== "" &&
          (state.ipRangeServices || "").trim() !== "" &&
          (state.networkCidr || "").trim() !== ""
        )
      case 3:
        return (
          (state.gcsBucketName || "").trim() !== "" && 
          (state.hmacAccessKey || "").trim() !== "" && 
          (state.hmacSecretKey || "").trim() !== ""
        )
      case 5:
        return state.outputsUploaded
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Provision your GCP Environment</h2>
              <p className="text-lg text-muted-foreground">
                Choose how you want to set up your networking and base infrastructure via Terraform.
              </p>
            </div>

            <div className="grid gap-6">
              <OptionCard
                selected={state.setupMode === "recommended"}
                onClick={() => updateState({ setupMode: "recommended" })}
                recommended
                icon={CheckCircle2}
                title="Recommended"
                description="Fully automated VPC, Subnet, and IAM setup managed by our modules."
              />
              <OptionCard
                selected={state.setupMode === "advanced"}
                onClick={() => updateState({ setupMode: "advanced" })}
                icon={Settings}
                title="Advanced"
                description="Use your existing bootstrapped VPC network and custom IP ranges."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Network Configuration</h2>
              <p className="text-muted-foreground text-sm">Provide details for your existing GCP network.</p>
            </div>
            
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vpcName">VPC Name *</Label>
                    <Input id="vpcName" placeholder="testapp-app-958e7ba3-5d35" value={state.vpcName || ""} onChange={(e) => updateState({ vpcName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subnetName">Subnet Name *</Label>
                    <Input id="subnetName" placeholder="subnet-testapp" value={state.subnetName || ""} onChange={(e) => updateState({ subnetName: e.target.value })} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pods">Pod IP Range Name *</Label>
                      <Input id="pods" placeholder="pods-range" value={state.ipRangePods || ""} onChange={(e) => updateState({ ipRangePods: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="services">Service IP Range Name *</Label>
                      <Input id="services" placeholder="services-range" value={state.ipRangeServices || ""} onChange={(e) => updateState({ ipRangeServices: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidr">Network CIDR Block *</Label>
                    <Input id="cidr" placeholder="10.128.0.0/20" value={state.networkCidr || ""} onChange={(e) => updateState({ networkCidr: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Storage & Interoperability</h2>
              <p className="text-muted-foreground text-sm">Configure your GCS buckets and S3-compatible HMAC keys.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bucket">GCS Bucket Name *</Label>
                <Input id="bucket" placeholder="my-gcp-data-lake" value={state.gcsBucketName || ""} onChange={(e) => updateState({ gcsBucketName: e.target.value })} />
              </div>

              <div className="space-y-4">
                <Label>Service Account Credentials</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <OptionCard
                    selected={state.gcsAccountOption === "create"}
                    onClick={() => updateState({ gcsAccountOption: "create" })}
                    icon={UserPlus}
                    title="Create New SA"
                    description="We'll give you a command to create a new Service Account."
                  />
                  <OptionCard
                    selected={state.gcsAccountOption === "existing"}
                    onClick={() => updateState({ gcsAccountOption: "existing" })}
                    icon={KeyRound}
                    title="Existing SA"
                    description="Use an existing Service Account with HMAC keys."
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <KeyRound className="w-4 h-4" />
                    Create HMAC Keys
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Run this command to generate S3-compatible HMAC keys for your Service Account:
                  </p>
                  <div className="bg-slate-900 rounded-lg p-3 relative group">
                    <code className="text-[10px] text-blue-300 break-all">
                      gcloud storage hmac create --service-account=[SA_EMAIL]
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 text-white/40 hover:text-white"
                      onClick={() => navigator.clipboard.writeText("gcloud storage hmac create --service-account=[SA_EMAIL]")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessKey">HMAC Access Key *</Label>
                    <Input id="accessKey" placeholder="GOOG..." value={state.hmacAccessKey || ""} onChange={(e) => updateState({ hmacAccessKey: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secretKey">HMAC Secret Key *</Label>
                    <Input id="secretKey" type="password" placeholder="••••••••" value={state.hmacSecretKey || ""} onChange={(e) => updateState({ hmacSecretKey: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-10 pb-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-black">Review & Launch</h2>
              <p className="text-lg text-muted-foreground">Deploy your GCP infrastructure using Terraform.</p>
            </div>

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
                    Initialize Terraform and apply the changes to your GCP project:
                  </p>
                  <div className="space-y-3">
                    <CommandBlock command="terraform init" />
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
                    Once the apply completes, export the outputs to a JSON file for the next step:
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
              <h2 className="text-4xl font-black tracking-tight">GCP Environment Ready</h2>
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
              Next: Configure GKE <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
            <span className="text-blue-600">{visibleSteps[currentStepIndex]?.title}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
              style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 overflow-x-auto pb-2 gap-6 no-scrollbar">
            {visibleSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStepIndex
              const isComplete = index < currentStepIndex
              return (
                <button
                  key={step.id}
                  onClick={() => isComplete && setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all",
                    isActive ? "text-blue-600 translate-y-0" : isComplete ? "text-emerald-600" : "text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : isComplete ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "bg-muted text-muted-foreground/20"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="hidden md:inline">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {renderStepContent()}
      </main>

      {currentStep !== 9 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-xl border-t py-6 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={goBack} disabled={currentStepIndex === 0} className="h-12 px-6 font-bold hover:bg-muted/50">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="flex-1 flex justify-end gap-3">
              <Button 
                onClick={goNext} 
                disabled={!canGoNext()} 
                className="w-full sm:w-auto min-w-[200px] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
              >
                {currentStep === 5 ? "Verify & Finish" : "Continue"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
