import "./config/loadEnv.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const port = process.env.PORT || 5000;
const configuredHost = process.env.HOST || "0.0.0.0";
const fallbackHost = "0.0.0.0";

const listen = (host) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`);
      resolve(server);
    });

    server.once("error", reject);
  });

const startServer = async () => {
  await connectDB();

  try {
    await listen(configuredHost);
  } catch (error) {
    const canRetryOnFallback = configuredHost !== fallbackHost && ["EADDRNOTAVAIL", "UNKNOWN"].includes(error.code);

    if (!canRetryOnFallback) {
      throw error;
    }

    console.warn(`Unable to bind to ${configuredHost}:${port}. Falling back to ${fallbackHost}:${port}.`);
    await listen(fallbackHost);
  }
};

startServer();
