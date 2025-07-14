import { createTool } from "@mastra/core/tools";
import { jupiterService } from "../../../../services/api.services/jupiter.service";
import { z } from "zod";
import { getCAfromTicker } from "../../../../utils/constants";
import { JupiterQuoteResponse } from "../../../../types";
import { solanaService } from "../../../../services/solana.service";

const USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


export const getQuoteTool = createTool({
    id: "getQuoteTool",
    description: "Get a quote for a given token",
    inputSchema: z.object({
        ticker: z.string(),
        amount: z.string(),
        direction: z.enum(["BUY", "SELL"]),
    }),
    outputSchema: z.object({
        quote: z.any(),
    }),
    execute: async ({ context }) => {
        const { ticker, direction, amount } = context;
        const CA = getCAfromTicker(ticker+"X")!;
        const quote = await jupiterService.getQuote({
            inputMint: direction === "BUY" ? USDC_ADDRESS : CA,
            outputMint: direction === "BUY" ? CA : USDC_ADDRESS,
            amount: amount,
            slippageBps: 100,
        });
        return { quote };
    }
})

export const swapTool = createTool({
    id: "swapTool",
    description: "Swap a given token for a given amount",
    inputSchema: z.object({
        quote: z.any(),
        passcode: z.string(),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        txHash: z.string(),
    }),
    execute: async ({ context }) => {
        const { quote, passcode } = context;
        const serializedTransaction = await jupiterService.getSwapTransaction(quote as JupiterQuoteResponse);
        console.log(`serializedTransaction: ${serializedTransaction}`);
        const signAndSendTransaction = await solanaService.signAndSendJupiterTransaction(serializedTransaction, passcode);

        return { success: signAndSendTransaction.success, txHash: signAndSendTransaction.txHash };
    }
})