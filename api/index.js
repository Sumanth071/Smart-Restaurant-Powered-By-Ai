import "../server/src/config/loadEnv.js";

import app from "../server/src/app.js";
import connectDB from "../server/src/config/db.js";

let bootPromise;

const ensureServerReady = async () => {
  if (!bootPromise) {
    bootPromise = connectDB().catch((error) => {
      bootPromise = undefined;
      throw error;
    });
  }

  await bootPromise;
};

export default async function handler(req, res) {
  await ensureServerReady();
  return app(req, res);
}
