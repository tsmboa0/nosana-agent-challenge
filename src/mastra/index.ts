import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { fundamentalAnalyst } from "./agents/solvestor/agents/fundamental-analyst";
import { technicalAnalyst } from "./agents/solvestor/agents/technical-analyst";
import { analysisWorkflow } from "./agents/solvestor/workflows/analysis-workflow";
import { executionWorkflow } from "./agents/solvestor/workflows/execution-workflow";
import { MainAgent } from "./agents/solvestor/agents/main-agent";
import { voiceAgent } from "./agents/solvestor/agents/voice-agent";

export const mastra = new Mastra({
	workflows: { analysisWorkflow, executionWorkflow },
	agents: { MainAgent, fundamentalAnalyst, technicalAnalyst, voiceAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000, 
	},
});
