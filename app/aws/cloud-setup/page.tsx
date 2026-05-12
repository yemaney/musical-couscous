import { CloudSetupWizard } from "@/components/cloud-setup-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function CloudSetupPage() {
  return (
    <>
      <SetupStageProgress />
      <CloudSetupWizard />
    </>
  )
}
