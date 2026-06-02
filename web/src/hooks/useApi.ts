import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BACKEND = 'http://localhost:8000';

// Fetch Global Drift Index
export const useGlobalDrift = () => {
  return useQuery({
    queryKey: ['global-drift'],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/api/global-drift`);
      if (!res.ok) throw new Error('Failed to fetch global drift');
      return res.json();
    },
    refetchInterval: 10000,
  });
};

// Fetch Pending Approvals for HITL Gatekeeper
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/api/pending-approvals`);
      if (!res.ok) throw new Error('Failed to fetch pending approvals');
      return res.json();
    },
    refetchInterval: 5000,
  });
};

// Approve MR
export const useApproveMR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch(`${BACKEND}/api/approve-mr/${runId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to approve MR');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['global-drift'] });
    },
  });
};

// Reject MR
export const useRejectMR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch(`${BACKEND}/api/reject-mr/${runId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reject MR');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['global-drift'] });
    },
  });
};

// Simulate Black Friday Incident
export const useSimulateIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BACKEND}/api/simulate-incident`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to simulate incident');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['global-drift'] });
    },
  });
};

// Trigger Manual Sweep
export const useTriggerManual = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BACKEND}/api/trigger-manual`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to trigger manual run');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    }
  });
};
