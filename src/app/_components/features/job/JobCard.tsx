import { JobSummary } from '@/types/job';
import JobCardClient from './JobCardClient';

interface JobCardProps {
  job: JobSummary;
  onToggleScrap: (jobId: string) => void;
}

/**
 * Renders a job card by delegating to the client-side JobCardClient component.
 *
 * @param job - The job summary to render.
 * @param onToggleScrap - Callback invoked with the job's id when the scrap state is toggled.
 * @returns The JobCardClient element configured for the provided job and callback.
 */
export default function JobCard({ job, onToggleScrap }: JobCardProps) {
  return <JobCardClient job={job} onToggleScrap={onToggleScrap} />;
}