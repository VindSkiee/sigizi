const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

// Load .env.local
dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
});

const port = process.env.PORT || "3000";

console.log(`🚀 Starting Next.js on port ${port}`);

spawn("next", ["dev", "--port", port], {
  stdio: "inherit",
  shell: true,
});