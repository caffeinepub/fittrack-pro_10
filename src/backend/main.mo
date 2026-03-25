import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // TYPES
  module Profile {
    public type FitnessGoal = {
      #fatLoss;
      #muscleGain;
      #endurance;
      #generalFitness;
    };

    public type Profile = {
      name : Text;
      age : Nat;
      weight : Float;
      height : Float;
      goal : FitnessGoal;
    };
  };
  public type Profile = Profile.Profile;

  module Exercise {
    public type MuscleGroup = {
      #chest;
      #back;
      #legs;
      #shoulders;
      #arms;
      #core;
      #cardio;
    };

    public type Exercise = {
      id : Nat;
      name : Text;
      muscleGroup : MuscleGroup;
      description : Text;
    };
  };
  public type Exercise = Exercise.Exercise;

  public type WorkoutPlan = {
    difficulty : { #beginner; #intermediate; #advanced };
    schedule : [(Text, [Exercise])];
  };

  public type ExerciseSet = {
    exerciseId : Nat;
    setNumber : Nat;
    reps : Nat;
    weight : Float;
  };

  module WorkoutSession {
    public type WorkoutSession = {
      id : Nat;
      user : Principal;
      notes : Text;
      sets : [ExerciseSet];
    };

    public func compare(a : WorkoutSession, b : WorkoutSession) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module WorkoutEntry {
    public type WorkoutEntry = {
      date : Text;
      sessionId : Nat;
    };

    public func compare(a : WorkoutEntry, b : WorkoutEntry) : Order.Order {
      a.date.compare(b.date); // Sort by date first
    };
  };

  // AUTHORIZATION
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // PRESEEDED DATA
  let exercises = Map.fromIter<Nat, Exercise>(
    [
      (1, { id = 1; name = "Push Ups"; muscleGroup = #chest; description = "Keep your body straight and lower yourself until elbows are 90 degrees."; }),
      (2, { id = 2; name = "Squats"; muscleGroup = #legs; description = "Stand with feet shoulder-width apart, bend knees and hips to lower body."; }),
      (3, { id = 3; name = "Plank"; muscleGroup = #core; description = "Hold body in straight line supported by forearms and toes."; }),
      (4, { id = 4; name = "Treadmill Run"; muscleGroup = #cardio; description = "Run or jog on treadmill at moderate pace."; }),
      (5, { id = 5; name = "Pull Ups"; muscleGroup = #back; description = "Hang from bar and pull body up until chin is above bar."; }),
      (6, { id = 6; name = "Bicep Curls"; muscleGroup = #arms; description = "Hold weights and curl arms to shoulders."; }),
      (7, { id = 7; name = "Shoulder Press"; muscleGroup = #shoulders; description = "Press weights above head from shoulder level."; }),
      (8, { id = 8; name = "Lunges"; muscleGroup = #legs; description = "Step forward, lower body until knee at 90 degrees, alternate legs."; }),
      (9, { id = 9; name = "Deadlift"; muscleGroup = #back; description = "Lift barbell from floor to thigh level, keep back straight."; }),
      (10, { id = 10; name = "Crunches"; muscleGroup = #core; description = "Lie on back, lift upper body using abdominal muscles." })
    ].values()
  );

  // WORKOUT PLANS
  let workoutPlans = Map.fromIter<Text, WorkoutPlan>(
    [
      ("beginner", {
        difficulty = #beginner;
        schedule = [
          ("Monday", exercises.values().toArray()),
          ("Wednesday", exercises.values().toArray()),
          ("Friday", exercises.values().toArray()),
        ];
      }),
      ("intermediate", {
        difficulty = #intermediate;
        schedule = [
          ("Monday", exercises.values().toArray()),
          ("Tuesday", exercises.values().toArray()),
          ("Thursday", exercises.values().toArray()),
          ("Saturday", exercises.values().toArray()),
        ];
      }),
      ("advanced", {
        difficulty = #advanced;
        schedule = [
          ("Monday", exercises.values().toArray()),
          ("Tuesday", exercises.values().toArray()),
          ("Wednesday", exercises.values().toArray()),
          ("Thursday", exercises.values().toArray()),
          ("Friday", exercises.values().toArray()),
          ("Saturday", exercises.values().toArray()),
        ];
      }),
    ].values()
  );

  // BACKEND STATE VARIABLES
  var nextWorkoutId = 0;
  var nextSessionId = 0;

  let profiles = Map.empty<Principal, Profile>();
  let workoutSessions = Map.empty<Nat, WorkoutSession.WorkoutSession>();
  let workoutEntries = Map.empty<Principal, Set.Set<WorkoutEntry.WorkoutEntry>>();
  let weightEntries = Map.empty<Principal, List.List<(Text, Float)>>();
  let loggedWorkouts = Map.empty<Nat, Text>(); // Maps workoutId to date

  // PROFILE MANAGEMENT
  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (not AccessControl.isAdmin(accessControlState, caller) and user != caller) {
      Runtime.trap("Unauthorized: Only admins or owner can access profile data.");
    };
    profiles.get(user);
  };

  // EXERCISE MANAGEMENT
  public query ({ caller }) func listAllExercises() : async [Exercise] {
    exercises.values().toArray();
  };

  public query ({ caller }) func getExerciseById(id : Nat) : async Exercise {
    switch (exercises.get(id)) {
      case (null) { Runtime.trap("Exercise not found") };
      case (?exercise) { exercise };
    };
  };

  // WORKOUT PLAN MANAGEMENT
  public query ({ caller }) func getAllWorkoutPlans() : async [WorkoutPlan] {
    workoutPlans.values().toArray();
  };

  public query ({ caller }) func getWorkoutPlanByName(name : Text) : async WorkoutPlan {
    switch (workoutPlans.get(name)) {
      case (null) { Runtime.trap("Plan not found") };
      case (?plan) { plan };
    };
  };

  // WORKOUT LOGGING
  public shared ({ caller }) func createWorkoutSession(notes : Text, sets : [ExerciseSet]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create workout sessions");
    };

    let sessionId = nextSessionId;
    nextSessionId += 1;

    let newSession : WorkoutSession.WorkoutSession = {
      id = sessionId;
      user = caller;
      notes;
      sets;
    };
    workoutSessions.add(sessionId, newSession);

    sessionId;
  };

  public shared ({ caller }) func addWorkoutEntry(sessionId : Nat, date : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };

    let workoutId = nextWorkoutId;
    nextWorkoutId += 1;

    // Validate session existence and ownership
    switch (workoutSessions.get(sessionId)) {
      case (?session) {
        if (session.user != caller) {
          Runtime.trap("Unauthorized: Cannot add workout for another user!");
        };
      };
      case (null) { Runtime.trap("Workout session not found!") };
    };

    let entry : WorkoutEntry.WorkoutEntry = {
      date;
      sessionId;
    };

    // Add workout entry to user's workout history
    switch (workoutEntries.get(caller)) {
      case (?userEntries) {
        userEntries.add(entry);
      };
      case (null) {
        let newEntries = Set.empty<WorkoutEntry.WorkoutEntry>();
        newEntries.add(entry);
        workoutEntries.add(caller, newEntries);
      };
    };

    // Save the logged workout
    loggedWorkouts.add(workoutId, date);

    workoutId; // Return the ID of the logged workout
  };

  public query ({ caller }) func getWorkoutHistory(user : Principal) : async [WorkoutEntry.WorkoutEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own workout history");
    };
    switch (workoutEntries.get(user)) {
      case (?entries) {
        entries.toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getWorkoutSession(sessionId : Nat) : async WorkoutSession.WorkoutSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    switch (workoutSessions.get(sessionId)) {
      case (?session) {
        if (session.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own workout sessions");
        };
        session;
      };
      case (null) { Runtime.trap("Workout session not found!") };
    };
  };

  public query ({ caller }) func getAllWorkoutSessions(user : Principal) : async [WorkoutSession.WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own workout sessions");
    };
    let sessions = List.empty<WorkoutSession.WorkoutSession>();
    workoutSessions.values().forEach(
      func(session) {
        if (session.user == user) {
          sessions.add(session);
        };
      }
    );
    sessions.toArray();
  };

  // WEIGHT TRACKING
  public shared ({ caller }) func logWeight(date : Text, weight : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };

    let entry = (date, weight);

    switch (weightEntries.get(caller)) {
      case (?existingEntries) {
        existingEntries.add(entry);
      };
      case (null) {
        let newEntries = List.empty<(Text, Float)>();
        newEntries.add(entry);
        weightEntries.add(caller, newEntries);
      };
    };
  };

  public query ({ caller }) func getWeightHistory(user : Principal) : async [(Text, Float)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own weight history");
    };
    switch (weightEntries.get(user)) {
      case (?entries) {
        entries.toArray();
      };
      case (null) { [] };
    };
  };

  // PROGRESS TRACKING (PER EXERCISE)
  public query ({ caller }) func getExerciseProgress(user : Principal, exerciseId : Nat) : async [(Text, Nat, Float)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: User role is required to access this function.");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own exercise progress");
    };

    let userSessions = workoutSessions.values().filter(func(session) { session.user == user });
    let progressList = List.empty<(Text, Nat, Float)>();

    userSessions.forEach(func(session) {
      session.sets.forEach(func(exSet) {
        if (exSet.exerciseId == exerciseId) {
          progressList.add(("Session_1", exSet.reps, exSet.weight));
        };
      });
    });

    progressList.toArray();
  };
};
