// pm2: um único processo com o binário Rust (frontend embutido, SQLite em ./data).
// Depois de `bun run build`: pm2 start ecosystem.config.cjs && pm2 save
// (scripts/deploy-vps.sh faz isso com verificações.)
const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "app-dnd",
      cwd: __dirname,
      script: path.join(__dirname, "server", "target", "release", "app-dnd"),
      interpreter: "none",
      env: {
        // Atrás do nginx, 127.0.0.1 basta; sem nginx use APP_DND_HOST=0.0.0.0.
        HOST: process.env.APP_DND_HOST || "127.0.0.1",
        PORT: process.env.APP_DND_PORT || process.env.PORT || "8080",
        APP_DND_DB: process.env.APP_DND_DB || path.join(__dirname, "data", "app-dnd.sqlite"),
      },
      max_restarts: 10,
      restart_delay: 1000,
      kill_timeout: 5000,
    },
  ],
};
