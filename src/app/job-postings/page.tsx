import { cookies } from 'next/headers';
import JobPostingsClient from './JobPostingsClient';
import { AllResponse, JobResponse } from '@/types/job';

/**
 * Fetches the first page of job postings from the backend, selecting the authenticated or anonymous endpoint based on the caller's login state.
 *
 * @param isLoggedIn - Whether the current request is from an authenticated user
 * @returns An object with `jobs` (the fetched job DTOs, or an empty array on error) and `totalElements` (the total number of jobs, or `0` on error)
 */
async function fetchInitialJobs(
  isLoggedIn: boolean
): Promise<{ jobs: (AllResponse | JobResponse)[]; totalElements: number }> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return { jobs: [], totalElements: 0 };
  }

  try {
    if (isLoggedIn) {
      const accessToken = (await cookies()).get('accessToken')?.value;
      if (!accessToken) {
        return { jobs: [], totalElements: 0 };
      }
      const response = await fetch(`${backendUrl}/job/all?page=0&size=10`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        return { jobs: [], totalElements: 0 };
      }
      const result = await response.json();
      if (result.result !== 'SUCCESS') {
        return { jobs: [], totalElements: 0 };
      }
      return {
        jobs: result.data.jobDtoList || [],
        totalElements: result.data.totalElements || 0,
      };
    } else {
      const response = await fetch(
        `${backendUrl}/job/all/anonymous?page=0&size=10`,
        {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        }
      );
      if (!response.ok) {
        return { jobs: [], totalElements: 0 };
      }
      const result = await response.json();
      if (result.result !== 'SUCCESS') {
        return { jobs: [], totalElements: 0 };
      }
      return {
        jobs: result.data.jobDtoList || [],
        totalElements: result.data.totalElements || 0,
      };
    }
  } catch (_e) {
    return { jobs: [], totalElements: 0 };
  }
}

/**
 * Prepares initial job postings data based on authentication state and renders the JobPostingsClient component.
 *
 * @returns The JobPostingsClient React element configured with `initialJobs`, `initialTotalElements`, and `isLoggedInInitial`.
 */
export default async function JobPostings() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get('accessToken')?.value);
  const { jobs, totalElements } = await fetchInitialJobs(isLoggedIn);

  return (
    <JobPostingsClient
      initialJobs={jobs}
      initialTotalElements={totalElements}
      isLoggedInInitial={isLoggedIn}
    />
  );
}