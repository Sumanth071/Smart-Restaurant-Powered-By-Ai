import "./config/loadEnv.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const port = process.env.PORT || 5000;
const host = process.env.HOST || "127.0.0.1";

const startServer = async () => {
  await connectDB();

  app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });
};

startServer();
