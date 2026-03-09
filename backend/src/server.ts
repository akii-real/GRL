import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

// User schema for strength RPG
interface MuscleStats {
  chest: number;
  back: number;
  core: number;
  legs: number;
  arms: number;
}

interface UserDocument extends mongoose.Document {
  strength: number;
  muscles: MuscleStats;
}

const userSchema = new mongoose.Schema<UserDocument>({
  strength: { type: Number, default: 0 },
  muscles: {
    chest: { type: Number, default: 0 },
    back: { type: Number, default: 0 },
    core: { type: Number, default: 0 },
    legs: { type: Number, default: 0 },
    arms: { type: Number, default: 0 }
  }
});

const User = mongoose.model<UserDocument>("User", userSchema);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Create test user
app.post("/api/users", async (_req, res) => {
  const user = new User({});
  await user.save();
  res.json({ message: "User created", id: user._id });
});

// Add XP to muscle
app.post("/api/users/:id/xp", async (req, res) => {
  const { id } = req.params;
  const { muscle, points } = req.body as { muscle: keyof MuscleStats; points: number };

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Safe muscle XP update
  if (muscle in user.muscles) {
    (user.muscles as any)[muscle] += points;
  }

  // Safe total XP calculation
  let totalXP = 0;
  if (user.muscles) {
    totalXP = Object.values(user.muscles).reduce((sum: number, v: number) => sum + v, 0);
  }
  user.strength = Math.floor(totalXP / 1000);

  await user.save();
  res.json(user);
});

// Get stats
app.get("/api/users/:id/stats", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user || { message: "User not found" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log("📱 Test: http://localhost:5000/api/health");
    });
  })
  .catch((err) => {
    console.error("❌ Mongo connection failed:", err);
    console.log("💡 Add MONGO_URI to .env and restart");
  });
