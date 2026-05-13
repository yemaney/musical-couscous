import { GCPReviewWizard } from "@/components/gcp-review-wizard"
import { SetupStageProgress } from "@/components/setup-stage-progress"

export default function GCPReviewPage() {
  return (
    <>
      <SetupStageProgress />
      <GCPReviewWizard />
    </>
  )
}
