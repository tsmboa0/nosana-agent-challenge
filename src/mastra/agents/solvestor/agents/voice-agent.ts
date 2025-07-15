import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { CompositeVoice } from "@mastra/core/voice";
import { OpenAIVoice } from "@mastra/voice-openai";
import { PlayAIVoice } from "@mastra/voice-playai";
 

export const voiceAgent = new Agent({
  name: "Voice Agent",
  instructions: `You are an agent with both STT and TTS capabilities.`,
  model: openai("gpt-4o"),
  voice: new CompositeVoice({
    input: new OpenAIVoice(), // speech to text
    output: new PlayAIVoice(), // text to speech
  }),
});
