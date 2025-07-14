// This tool is used to search the web for information using the Tavily API.

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";
import dotenv from "dotenv"

dotenv.config()

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY,
});

export const webSearch = createTool({
    id: "web-search",
    description: "Search the web for information.",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: z.object({
        results: z.string(),
    }),
    execute: async ({ context }) => {
        const { query } = context;
        const response = await tavilyClient.search(query);
        console.log(`Web search results: ${response}`);
        return {
            results: response.results.map((result) => result.content).join("\n"),
        };
    },
});