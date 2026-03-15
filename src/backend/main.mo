import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type as required by the frontend
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // 2048 Game specific types and state
  type Score = Nat;
  type DisplayName = Text;

  type LeaderboardEntry = {
    user : Principal;
    displayName : DisplayName;
    score : Score;
  };

  let globalScores = Map.empty<Principal, Score>();
  let displayNames = Map.empty<Principal, DisplayName>();

  // Submit a score - requires user role
  public shared ({ caller }) func submitScore(score : Score) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit scores");
    };
    updateGlobalScore(caller, score);
  };

  func updateGlobalScore(caller : Principal, score : Score) {
    switch (globalScores.get(caller)) {
      case (null) {
        globalScores.add(caller, score);
      };
      case (?existingScore) {
        if (score > existingScore) {
          globalScores.add(caller, score);
        };
      };
    };
  };

  // Set display name - requires user role
  public shared ({ caller }) func setDisplayName(displayName : DisplayName) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set display names");
    };
    displayNames.add(caller, displayName);
  };

  // Get personal best - requires user role
  public query ({ caller }) func getPersonalBest() : async ?Score {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view personal best");
    };
    globalScores.get(caller);
  };

  // Get leaderboard - public, no authorization required (guests can view)
  public query func getLeaderboard() : async [LeaderboardEntry] {
    var entries = List.empty<LeaderboardEntry>();

    for ((user, score) in globalScores.entries()) {
      let displayName = switch (displayNames.get(user)) {
        case (null) { "Anonymous" };
        case (?name) { name };
      };

      let entry : LeaderboardEntry = {
        user;
        displayName;
        score;
      };

      entries.add(entry);
    };

    let entriesArray = entries.toArray();
    let sortedEntries = entriesArray.sort(
      func(entry1 : LeaderboardEntry, entry2 : LeaderboardEntry) : Order.Order {
        Nat.compare(entry2.score, entry1.score);
      },
    );

    let sliceSize = if (sortedEntries.size() < 10) {
      sortedEntries.size();
    } else {
      10;
    };

    Array.tabulate<LeaderboardEntry>(sliceSize, func(i : Nat) : LeaderboardEntry { sortedEntries[i] });
  };
};
