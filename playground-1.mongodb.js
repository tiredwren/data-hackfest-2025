/* global use, db */
// MongoDB Playground for Distraction Events

use("focusApp"); // Change to your actual DB name

// Insert distraction events
db.getCollection("distractions").insertMany([
  {
    userId: "user123",
    event: "focus_lost",
    reason: "blur",
    timestamp: new Date("2025-07-25T10:00:00Z"),
  },
  {
    userId: "user123",
    event: "focus_lost",
    reason: "app_switch",
    timestamp: new Date("2025-07-25T10:15:00Z"),
  },
]);

// Count distractions for a user
const distractionCount = db.getCollection("distractions").find({
  userId: "user123",
}).count();

console.log(`${distractionCount} distraction events for user123`);

// Aggregation: Count events per type
db.getCollection("distractions").aggregate([
  { $match: { userId: "user123" } },
  {
    $group: {
      _id: "$reason",
      count: { $sum: 1 },
    },
  },
]);
