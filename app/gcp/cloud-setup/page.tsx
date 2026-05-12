import { GCPCloudSetupWizard } from "@/components/gcp-cloud-setup-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function GCPCloudSetupPage() {
  return (
    <>
      <SetupStageProgress />
      <GCPCloudSetupWizard />
    </>
  )
}
