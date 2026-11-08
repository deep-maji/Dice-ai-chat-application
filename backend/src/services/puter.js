import { init } from "@heyputer/puter.js/src/init.cjs";
const puter = init(process.env.PUTER_API_TOKEN);

// Example: Use AI to answer a question
puter.ai.chat("What color was Napoleon's white horse?").then(console.log);
