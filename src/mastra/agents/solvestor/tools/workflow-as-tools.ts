import { createTool } from "@mastra/core/tools";
import z from "zod";
import { mastra } from "../../../index";

export const startTradeExecutionTool = createTool({
    id: "start-trade-execution",
    description: "This workflow is used to start the execution of a trade. This will fetch the market quote and prompt the user to approve the trade with passcode.",
    inputSchema: z.object({
        ticker: z.string(),
        amount: z.string(),
        direction: z.enum(["BUY", "SELL"]),
    }),
    outputSchema: z.object({
        runId: z.string(),
    }),
    execute: async ({ context }) => {
        const { ticker, amount, direction } = context;
        const workflow = mastra.getWorkflow("executionWorkflow");
        const run = workflow.createRun();
        await run.start({
            inputData: {
                ticker,
                amount,
                direction
            }
        })

        return {runId: run.runId}
    }
})

export const resumeTradeExecutionTool = createTool({
    id: "resume-trade-execution",
    description: "This workflow is used to continue the execution of a trade afetr the user has provided their passcode.",
    inputSchema: z.object({
        runId: z.string(),
        passcode: z.string(),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        txHash: z.string(),
    }),
    execute: async ({ context }) => {
        const { runId, passcode } = context;
        const workflow = mastra.getWorkflow("executionWorkflow");
        const run = workflow.createRun({runId});
        const result = await run.resume({
            step: "getPasscodeFromUser",
            resumeData: {
                passcode
            }
        })
        console.log(`the result from resume execution tool is ${result}`);
        return {success: true, txHash: ""}
    }
})

export const analysisToolFormWorkflow = createTool({
    id:"analysis-tool",
    description: "This tool is used for carrying out complete analysis on a given token including fundamental and technical analysis.",
    inputSchema: z.object({
        ticker: z.string()
    }),
    outputSchema: z.object({
        analysis: z.any()
    }),
    execute: async ({ context, mastra })=>{
        const workflow =  mastra?.getWorkflow("analysisWorkflow");
        const run = await workflow?.createRun();

        const response = run?.start({
            inputData: {
                ticker: context.ticker
            }
        })

        return {analysis: response}
    }
})