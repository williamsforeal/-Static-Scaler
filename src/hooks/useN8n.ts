import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdCopyRecords,
  fetchAdCopyRecord,
  triggerGenerateAdCopy,
  triggerGenerateImages,
  triggerGeneratePrompts,
} from '@/lib/n8n';
import type { AdGeneratorForm } from '@/types/scaler';

// Fetch all Ad Copy records
export function useAdCopyList() {
  return useQuery({
    queryKey: ['adCopyRecords'],
    queryFn: fetchAdCopyRecords,
    staleTime: 30000,
  });
}

// Fetch single Ad Copy record with optional auto-refresh
export function useAdCopyRecord(
  recordId: string | null,
  options?: { refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: ['adCopyRecord', recordId],
    queryFn: () => fetchAdCopyRecord(recordId!),
    enabled: !!recordId,
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: 5000,
  });
}

// Mutation to trigger ad copy generation
export function useTriggerGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: AdGeneratorForm) => triggerGenerateAdCopy(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adCopyRecords'] });
    },
  });
}

// Mutation to trigger image generation
export function useTriggerImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => triggerGenerateImages(recordId),
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: ['adCopyRecord', recordId] });
    },
  });
}

// Mutation to trigger prompt generation
export function useTriggerPrompts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => triggerGeneratePrompts(recordId),
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: ['adCopyRecord', recordId] });
    },
  });
}
