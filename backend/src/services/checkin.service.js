import User from "../models/user.js";

export async function processCheckIn(userId) {
  const now = new Date();

  // Get user data
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const { lastCheckInAt, nextEligibleAt, currentStreak } = user.streak;

  // 1. Prevent spam / early check-in
  if (nextEligibleAt && now < nextEligibleAt) {
    return {
      success: false,
      message: "Not eligible yet. Please wait until the next check-in window.",
      nextEligibleAt,
    };
  }

  // 2. First-ever check-in
  if (!lastCheckInAt) {
    user.streak.currentStreak = 1;
    user.streak.lastCheckInAt = now;
    user.streak.nextEligibleAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    user.heroPoints += 10;

    await user.save();

    return {
      success: true,
      message: "First check-in successful!",
      streak: user.streak.currentStreak,
      heroPoints: user.heroPoints,
      nextEligibleAt: user.streak.nextEligibleAt,
    };
  }

  const hoursSinceLast = (now - new Date(lastCheckInAt)) / (1000 * 60 * 60);

  // 3. Continue streak (within 24–48 hrs gap)
  if (hoursSinceLast <= 48) {
    user.streak.currentStreak = currentStreak + 1;
    user.streak.lastCheckInAt = now;
    user.streak.nextEligibleAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    user.heroPoints += 10;

    await user.save();

    return {
      success: true,
      message: "Streak continued!",
      streak: user.streak.currentStreak,
      heroPoints: user.heroPoints,
      nextEligibleAt: user.streak.nextEligibleAt,
    };
  }

  // 4. Missed >48 hrs → reset streak
  user.streak.currentStreak = 1;
  user.streak.lastCheckInAt = now;
  user.streak.nextEligibleAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  user.heroPoints += 10;

  await user.save();

  return {
    success: true,
    message: "Streak reset. Starting new streak!",
    streak: user.streak.currentStreak,
    heroPoints: user.heroPoints,
    nextEligibleAt: user.streak.nextEligibleAt,
  };
}
