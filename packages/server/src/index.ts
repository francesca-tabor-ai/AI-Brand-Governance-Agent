import { loadConfig } from "./config.js";
import { createApp } from "./app.js";

const config = loadConfig();
const { app } = createApp(config);

app.listen(config.port, () => {
  console.log(`[Governance Server] Running on port ${config.port}`);
  console.log(`[Governance Server] Phase: ${config.phase}`);
  console.log(`[Governance Server] Brand middleware: ${config.brandMiddlewareUrl}`);
  console.log(
    `[Governance Server] Airtable: ${config.airtable.apiKey ? "configured" : "not configured"}`,
  );
  console.log(
    `[Governance Server] Slack: ${config.slack.botToken ? "configured" : "not configured"}`,
  );
});
