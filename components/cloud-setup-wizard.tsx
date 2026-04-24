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
type S3UserOption = "create" | "existing"

interface WizardState {
  setupMode: SetupMode
  // Network fields (Advanced only)
  vpcId: string
  subnetIds: string
  securityGroupIds: string
  networkCidr: string
  serviceCidr: string
  // Storage fields
  s3UserOption: S3UserOption
  s3BucketName: string
  accessKeyId: string
  secretAccessKey: string
  // Progress tracking
  outputsUploaded: boolean
}

const initialState: WizardState = {
  setupMode: "recommended",
  vpcId: "",
  subnetIds: "",
  securityGroupIds: "",
  networkCidr: "",
  serviceCidr: "",
  s3UserOption: "create",
  s3BucketName: "",
  accessKeyId: "",
  secretAccessKey: "",
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
        "hover:border-emerald-500/50 hover:bg-emerald-50/50",
        selected
          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
          : "border-border bg-card"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-4 px-3 py-1 text-xs font-medium bg-emerald-500 text-white rounded-full">
          Recommended
        </span>
      )}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-lg",
            selected ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
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
            selected ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
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

export function CloudSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [state, setState] = useState<WizardState>(initialState)
  const [isUploading, setIsUploading] = useState(false)

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const getVisibleSteps = useCallback(() => {
    if (state.setupMode === "recommended") {
      // In recommended mode, skip Network step (user still sees Storage)
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
    
    // Network parameters
    if (state.setupMode === "recommended") {
      params.push("CreateNetwork=true")
    } else {
      params.push("CreateNetwork=false")
      params.push(`VpcId=${state.vpcId || "<vpc-id>"}`)
      params.push(`SubnetIds=${state.subnetIds || "<subnet-ids>"}`)
      params.push(`SecurityGroupIds=${state.securityGroupIds || "<sg-ids>"}`)
      params.push(`NetworkCidr=${state.networkCidr || "<network-cidr>"}`)
      params.push(`ServiceCidr=${state.serviceCidr || "<service-cidr>"}`)
    }
    
    // Storage parameters
    params.push(`S3BucketName=${state.s3BucketName || "<bucket-name>"}`)
    
    return `aws cloudformation deploy \\
  --template-file template.yaml \\
  --stack-name cloud-setup-stack \\
  --capabilities CAPABILITY_IAM \\
  --parameter-overrides \\
    ${params.join(" \\\n    ")}`
  }

  const createAccessKeyCommand = `aws iam create-access-key --user-name s3-backup-user`

  const getOutputsCommand = `aws cloudformation describe-stacks \\
  --stack-name cloud-setup-stack \\
  --query "Stacks[0].Outputs" > outputs.json`

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
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
                title="Recommended"
                description="Fully automated setup. No additional inputs required."
              />
              <OptionCard
                selected={state.setupMode === "advanced"}
                onClick={() => updateState({ setupMode: "advanced" })}
                icon={Settings}
                title="Advanced"
                description="Provide custom infrastructure details."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Network Configuration
              </h2>
              <p className="mt-2 text-muted-foreground">
                Provide your existing infrastructure details
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vpcId">Network ID (VPC ID) *</Label>
                  <HelperTooltip text="Your VPC ID, usually starts with 'vpc-'" />
                </div>
                <Input
                  id="vpcId"
                  placeholder="vpc-xxxxxxxxx"
                  value={state.vpcId}
                  onChange={(e) => updateState({ vpcId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="subnetIds">Subnet IDs *</Label>
                  <HelperTooltip text="Comma-separated list of subnet IDs" />
                </div>
                <Input
                  id="subnetIds"
                  placeholder="subnet-xxx, subnet-yyy"
                  value={state.subnetIds}
                  onChange={(e) => updateState({ subnetIds: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="securityGroupIds">Security Group IDs *</Label>
                  <HelperTooltip text="Comma-separated list of security group IDs" />
                </div>
                <Input
                  id="securityGroupIds"
                  placeholder="sg-xxx, sg-yyy"
                  value={state.securityGroupIds}
                  onChange={(e) => updateState({ securityGroupIds: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="networkCidr">Network CIDR Range *</Label>
                  <HelperTooltip text="The CIDR block for your VPC (e.g., 10.0.0.0/16)" />
                </div>
                <Input
                  id="networkCidr"
                  placeholder="10.0.0.0/16"
                  value={state.networkCidr}
                  onChange={(e) => updateState({ networkCidr: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="serviceCidr">EKS Service CIDR Range *</Label>
                  <HelperTooltip text="The CIDR block for Kubernetes services (e.g., 172.20.0.0/16)" />
                </div>
                <Input
                  id="serviceCidr"
                  placeholder="172.20.0.0/16"
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
                Storage Setup (S3)
              </h2>
              <p className="mt-2 text-muted-foreground">
                Configure your S3 bucket and access credentials
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <OptionCard
                selected={state.s3UserOption === "create"}
                onClick={() => updateState({ s3UserOption: "create" })}
                recommended
                icon={UserPlus}
                title="Create New S3 User"
                description="We'll guide you through creating a new IAM user."
              />
              <OptionCard
                selected={state.s3UserOption === "existing"}
                onClick={() => updateState({ s3UserOption: "existing" })}
                icon={KeyRound}
                title="Use Existing Credentials"
                description="I already have access keys for this bucket."
              />
            </div>

            <div className="space-y-6 max-w-lg mx-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="s3BucketName">S3 Bucket Name *</Label>
                  <HelperTooltip text="The name of your S3 bucket for backups" />
                </div>
                <Input
                  id="s3BucketName"
                  placeholder="my-bucket-name"
                  value={state.s3BucketName}
                  onChange={(e) => updateState({ s3BucketName: e.target.value })}
                  required
                />
              </div>

              {state.s3UserOption === "create" && (
                <div className="border-t pt-6 animate-in slide-in-from-top-4 duration-300">
                  <h3 className="font-semibold text-foreground mb-3">Create Access Credentials</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run this command to create an IAM user and generate access keys:
                  </p>
                  <CommandBlock command={createAccessKeyCommand} onCopy={() => {}} />
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-foreground">Enter Your Credentials</h3>
                <p className="text-sm text-muted-foreground">
                  {state.s3UserOption === "create"
                    ? "Copy the Access Key ID and Secret Access Key from the command output:"
                    : "Enter your existing access credentials:"}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="accessKeyId">Access Key ID *</Label>
                    <HelperTooltip text="The AccessKeyId for your S3 user" />
                  </div>
                  <Input
                    id="accessKeyId"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={state.accessKeyId}
                    onChange={(e) => updateState({ accessKeyId: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="secretAccessKey">Secret Access Key *</Label>
                    <HelperTooltip text="The SecretAccessKey for your S3 user" />
                  </div>
                  <Input
                    id="secretAccessKey"
                    type="password"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={state.secretAccessKey}
                    onChange={(e) => updateState({ secretAccessKey: e.target.value })}
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                * All fields are required
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Review and Deploy</h2>
              <p className="mt-2 text-muted-foreground">Follow these steps to complete your setup</p>
            </div>

            <Card className="max-w-lg mx-auto">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Your Selections</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm">
                      {state.setupMode === "recommended"
                        ? "Network will be automatically created"
                        : `Using existing VPC: ${state.vpcId || "Not specified"}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm">
                      S3 bucket &quot;{state.s3BucketName || "Not specified"}&quot; with credentials configured
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>This is safe and only creates required resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Estimated monthly cost: $50-$150</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="max-w-2xl mx-auto space-y-8">
              <h3 className="font-semibold text-foreground text-lg">Follow these steps</h3>

              <div className="space-y-6">
                {/* Step 1: Download */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Download the setup file</p>
                    <p className="text-sm text-muted-foreground">
                      Save this file as <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">template.yaml</code> in a folder you can access from your terminal or command prompt.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download template.yaml
                    </Button>
                  </div>
                </div>

                {/* Step 2: Run deploy command */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Run the setup command</p>
                    <p className="text-sm text-muted-foreground">
                      Open your terminal, navigate to the folder where you saved the file, and run this command:
                    </p>
                    <CommandBlock command={generateCommand()} onCopy={() => {}} />
                    <p className="text-xs text-muted-foreground">
                      This may take a few minutes to complete. Wait until you see a success message.
                    </p>
                  </div>
                </div>

                {/* Step 3: Get outputs */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Save the results</p>
                    <p className="text-sm text-muted-foreground">
                      After the setup finishes, run this command to save the results to a file called <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">outputs.json</code>:
                    </p>
                    <CommandBlock command={getOutputsCommand} onCopy={() => {}} />
                  </div>
                </div>

                {/* Step 4: Upload */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm shrink-0">
                    4
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium">Upload the results file</p>
                    <p className="text-sm text-muted-foreground">
                      Upload the <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-xs">outputs.json</code> file you just created:
                    </p>
                    <label
                      htmlFor="file-upload"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                        state.outputsUploaded
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-500 hover:bg-emerald-50/50"
                      )}
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      ) : state.outputsUploaded ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-emerald-600">
                            File uploaded successfully
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">outputs.json</p>
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
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground">
                🎉 Your cloud is ready!
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Everything has been configured successfully
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm">Environment created</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm">Permissions configured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm">Storage connected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                localStorage.setItem("cloudSetupState", JSON.stringify(state))
                router.push("/cluster-setup")
              }}
            >
              Continue to Cluster Setup
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
        // Network step (Advanced only) - all fields required
        return (
          state.vpcId.trim() !== "" &&
          state.subnetIds.trim() !== "" &&
          state.securityGroupIds.trim() !== "" &&
          state.networkCidr.trim() !== "" &&
          state.serviceCidr.trim() !== ""
        )
      case 3:
        // Storage step - bucket name and credentials required
        return (
          state.s3BucketName.trim() !== "" &&
          state.accessKeyId.trim() !== "" &&
          state.secretAccessKey.trim() !== ""
        )
      case 5:
        // Review step - file must be uploaded
        return state.outputsUploaded
      default:
        return true
    }
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStepIndex + 1} of {visibleSteps.length}
            </span>
            <span className="text-sm font-medium text-foreground">
              {visibleSteps[currentStepIndex]?.title}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {visibleSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStepIndex
              const isComplete = index < currentStepIndex

              return (
                <button
                  key={step.id}
                  onClick={() => index < currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "text-emerald-600"
                      : isComplete
                      ? "text-foreground hover:text-emerald-600 cursor-pointer"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          {renderStepContent()}
        </div>
      </main>

      {/* Navigation */}
      {currentStep !== 9 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={goNext}
              disabled={!canGoNext()}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
