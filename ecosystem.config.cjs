module.exports = {
  apps: [
    {
      name: "nigraan-backend",
      cwd: "/home/Hassan/CWA/backend",
      script: "/home/Hassan/CWA/.venv/bin/uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 8008",
      interpreter: "none",
      env: {
        PORT: 8008,
      },
    },
    {
      name: "nigraan-frontend",
      cwd: "/home/Hassan/CWA/frontend",
      script: "node_modules/.bin/vite",
      args: "--host 0.0.0.0 --port 5199",
      interpreter: "none",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
