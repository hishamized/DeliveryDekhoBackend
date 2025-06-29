  const path = require("path");
  const express = require("express");
  const session = require("express-session");
  const SequelizeStore = require("connect-session-sequelize")(session.Store);
  const cors = require("cors");
  require("dotenv").config();

  const db = require("./models");
  const adminRoutes = require("./routes/adminRoutes");
  const riderRoutes = require("./routes/riderRoutes");

  const app = express();

  // ✅ Use dynamic base URL (for local vs Railway)
  const BASE_URL =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

  // ✅ CORS: allow frontend dev server (localhost) + Railway frontend
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        process.env.VITE_API_BASE_URL, // (optional) set on Railway if needed
      ].filter(Boolean),
      credentials: true,
    })
  );

  app.use(express.json());

  // ✅ Sequelize session store setup
  const sessionStore = new SequelizeStore({
    db: db.sequelize,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "mySecretKey",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  // ✅ Sync session table
  sessionStore.sync();

  // ✅ Define API routes
  app.use("/api/admins", adminRoutes);
  app.use("/api/riders", riderRoutes);
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // ✅ Health route
  app.get("/", (req, res) => {
    res.send("Backend is running!");
  });

  app.get("/test-db", async (req, res) => {
    try {
      await db.sequelize.authenticate();
      res.send("Database connection successful!");
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).send("DB Error");
    }
  });

  // ✅ Serve React frontend (in production only)
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "client-dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "client-dist", "index.html"));
    });
  }

  // ✅ Start the server + cron job
  const port = process.env.PORT || 5000;
  app.listen(port, async () => {
    try {
      await db.sequelize.sync(); // optional: add `{ alter: true }` during dev
      console.log(`✅ Backend is running on Port: ${port}`);

      // ✅ Call the cron job AFTER sequelize is ready
      const deadlineChecker = require("./jobs/deadlineCron");
      deadlineChecker(BASE_URL);
    } catch (err) {
      console.error("❌ Sequelize sync failed:", err);
    }
  });
