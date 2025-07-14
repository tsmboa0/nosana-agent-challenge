import { createTool } from "@mastra/core/tools";
import { birdeyeService } from "../../../../services/api.services/bird-eye.service";
import { z } from "zod";
import { computeIndicators } from "../../../../utils/indicator";
import { getCAfromTicker } from "../../../../utils/constants";

const outputSchema = z.object({
    address: z.string(),
    timestamp: z.number(),
    ohlcv: z.array(z.object({
        timestamp: z.number(),
        open: z.number(),
        high: z.number(),
        low: z.number(),
        close: z.number(),
    })),
    indicators: z.object({
        rsi: z.number(),
        macd: z.number(),
        ma: z.number(),
        bb: z.number(),
    }),
    trades: z.array(z.object({
        timestamp: z.number(),
        price: z.number(),
        quantity: z.number(),
        side: z.string(),
    })),
    liquidity: z.object({
        liquidity: z.number(),
        volume: z.number(),
        price: z.number(),
    }),
})

const USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

export const technicalTools = createTool({
    id: "technicalTools",
    description: "Fetch all the technical information regarding a given stock or token. Including the OHLCV data, technical indicators, liquidity, and recent trades, and volume",
    inputSchema: z.object({
        ticker: z.string().describe("The ticker for the stock. e.g TSLA for Tesla stock, AAPL for Apple stocks"),
    }),
    outputSchema: z.any(),
    execute: async ({ context }) => {
        const { ticker } = context;
        // Get the contract address from the Ticker
        const address = getCAfromTicker(ticker+"X");
        if(address==undefined){
            return {error: "The stock/token provided is not supported yet."}
        }
        //define the data period
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60;
        // fetch the ohlcv data
        try {
            const ohlcv = await birdeyeService.fetchOHLCV(address, oneWeekAgo, now);
            console.log(`Fetched OHLCV data for ${address}: ${ohlcv}`);
            // fetch the technical indicators
            const indicators = computeIndicators(ohlcv);
            console.log(`Fetched technical indicators for ${address}: ${indicators}`);

            // fetch the liquidity
            const liquidity = await birdeyeService.fetchLiquidity(address);
            console.log(`Fetched liquidity for ${address}: ${liquidity}`);

            // fetch the recent trades
            const trades = await birdeyeService.fetchRecentTrades(address);
            console.log(`Fetched recent trades for ${address}: ${trades}`);

            // fetch the price volume
            const priceVolume = await birdeyeService.fetchPriceVolume(address);
            console.log(`Fetched price volume for ${address}: ${priceVolume}`);

            return { address, timestamp: Date.now(), ohlcv, indicators, liquidity, trades, priceVolume };
            
        } catch (error) {
            console.error(error);
            return { error: "Failed to fetch OHLCV data" };
        }
    }
});