import serverless from "serverless-http";
import { buildApp } from "../../server/app.js";
const app = buildApp();
export const handler = serverless(app);
