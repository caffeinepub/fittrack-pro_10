import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExerciseSet, Profile } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useExercises() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllExercises();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });
}

export function useWorkoutPlans() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["workoutPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkoutPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });
}

export function useWorkoutHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["workoutHistory", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getWorkoutHistory(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useWeightHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["weightHistory", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getWeightHistory(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useLogWeight() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, weight }: { date: string; weight: number }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.logWeight(date, weight);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weightHistory"] }),
  });
}

export function useCreateWorkoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      notes,
      sets,
    }: { notes: string; sets: ExerciseSet[] }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createWorkoutSession(notes, sets);
    },
  });
}

export function useAddWorkoutEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      date,
    }: { sessionId: bigint; date: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addWorkoutEntry(sessionId, date);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workoutHistory"] }),
  });
}

export function useExerciseProgress(exerciseId: bigint | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: [
      "exerciseProgress",
      exerciseId?.toString(),
      identity?.getPrincipal().toString(),
    ],
    queryFn: async () => {
      if (!actor || !identity || !exerciseId) return [];
      return actor.getExerciseProgress(identity.getPrincipal(), exerciseId);
    },
    enabled: !!actor && !isFetching && !!identity && !!exerciseId,
  });
}
