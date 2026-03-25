import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    id: bigint;
    name: string;
    description: string;
    muscleGroup: MuscleGroup;
}
export interface WorkoutPlan {
    difficulty: Variant_intermediate_beginner_advanced;
    schedule: Array<[string, Array<Exercise>]>;
}
export interface WorkoutSession {
    id: bigint;
    sets: Array<ExerciseSet>;
    user: Principal;
    notes: string;
}
export interface Profile {
    age: bigint;
    weight: number;
    height: number;
    goal: FitnessGoal;
    name: string;
}
export interface WorkoutEntry {
    date: string;
    sessionId: bigint;
}
export interface ExerciseSet {
    setNumber: bigint;
    weight: number;
    exerciseId: bigint;
    reps: bigint;
}
export enum FitnessGoal {
    generalFitness = "generalFitness",
    fatLoss = "fatLoss",
    muscleGain = "muscleGain",
    endurance = "endurance"
}
export enum MuscleGroup {
    shoulders = "shoulders",
    arms = "arms",
    back = "back",
    core = "core",
    chest = "chest",
    legs = "legs",
    cardio = "cardio"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_intermediate_beginner_advanced {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export interface backendInterface {
    addWorkoutEntry(sessionId: bigint, date: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createWorkoutSession(notes: string, sets: Array<ExerciseSet>): Promise<bigint>;
    getAllWorkoutPlans(): Promise<Array<WorkoutPlan>>;
    getAllWorkoutSessions(user: Principal): Promise<Array<WorkoutSession>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExerciseById(id: bigint): Promise<Exercise>;
    getExerciseProgress(user: Principal, exerciseId: bigint): Promise<Array<[string, bigint, number]>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    getWeightHistory(user: Principal): Promise<Array<[string, number]>>;
    getWorkoutHistory(user: Principal): Promise<Array<WorkoutEntry>>;
    getWorkoutPlanByName(name: string): Promise<WorkoutPlan>;
    getWorkoutSession(sessionId: bigint): Promise<WorkoutSession>;
    isCallerAdmin(): Promise<boolean>;
    listAllExercises(): Promise<Array<Exercise>>;
    logWeight(date: string, weight: number): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
}
