import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { getQuoteTool, swapTool } from "../tools/execution-tools";


const fetchQuote = createStep(getQuoteTool);
const executeSwap = createStep(swapTool);

const getPasscodeFromUser = createStep({
    id: "get-passcode-from-human",
    description:"This step is used for suspending the workflow and request passcode from user for authentication",
    inputSchema: z.object({
        quote:z.any()
    }),
    outputSchema:z.object({ 
        quote:z.any()
    }),
    resumeSchema:z.object({
        passcode:z.string()
    }),
    suspendSchema:z.object({
        quote:z.any()
    }),
    execute: async({inputData, resumeData, getInitData, suspend})=>{
        if(!resumeData?.passcode) {
            suspend({ quote: inputData?.quote });
        }

        return { quote: inputData?.quote, passcode: resumeData?.passcode }
    }
})


const executionWorkflow = createWorkflow({
    id: "execution-workflow",
    inputSchema:z.object({
        ticker:z.string(),
        amount:z.string(),
        direction:z.enum(["BUY", "SELL"]),
    }),
    outputSchema:z.object({
        success:z.boolean(),
        txHash:z.string(),
    }),
    steps: [fetchQuote, getPasscodeFromUser, executeSwap],
}).then(fetchQuote).then(getPasscodeFromUser).then(executeSwap);

export { executionWorkflow }