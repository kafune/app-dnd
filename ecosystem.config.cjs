module.exports = {
  apps: [
    {
      name: "app-dnd",
      cwd: "/home/paiva/app-dnd",
      script: "/home/paiva/.bun/bin/bun",
      args: "run start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
        APP_DND_DB: "./data/app-dnd.sqlite",
      },
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
};
