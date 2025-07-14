import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const getFundamentalAnalysis = createStep({
    id: "fundamental-analysis",
    description: "Get the fundamental analysis of a given stock",
    inputSchema: z.object({
        ticker: z.string(),
    }),
    outputSchema: z.object({
        analysis: z.string(),
    }),
    execute: async ({ inputData, mastra }) => {
        const { ticker } = inputData;
        const prompt = `Get the fundamental analysis of ${ticker}`
        const response = await mastra?.getAgent("fundamentalAnalyst")?.stream([
            {
              role: "user",
              content: prompt,
            },
        ]);
       
        let analysisText = "";
       
        for await (const chunk of response.textStream) {
            process.stdout.write(chunk);
            analysisText += chunk;
        }
        return {
            analysis: analysisText,
        };
    }
})

const getTechnicalAnalysis = createStep({
    id: "technical-analysis",
    description: "Get the technical analysis of a given stock",
    inputSchema: z.object({
        ticker: z.string(),
    }),
    outputSchema: z.object({
        analysis: z.string(),
    }),
    execute: async ({ inputData, mastra }) => {
        const { ticker } = inputData;

        const prompt = `Get the technical analysis of ${ticker}`
        const response = await mastra?.getAgent("technicalAnalyst")?.stream([
            {
              role: "user",
              content: prompt,
            },
        ]);
       
        let analysisText = "";
       
        for await (const chunk of response.textStream) {
            process.stdout.write(chunk);
            analysisText += chunk;
        }
        return {
            analysis: analysisText,
        };
    }
})

const analysisWorkflow = createWorkflow({
    id: "analysisWorkflow",
    inputSchema: z.object({
        ticker: z.string(),
    }),
    outputSchema: z.object({
        analysis: z.any(),
    }),
    steps: [getFundamentalAnalysis, getTechnicalAnalysis],
}).parallel([getFundamentalAnalysis, getTechnicalAnalysis]);

analysisWorkflow.commit();

export { analysisWorkflow };