import { mastra } from "../mastra";

export class MastraService {
    private readonly mastra: any;

    constructor() {
        this.mastra = mastra;
    }
    
    async callTraderAgent(query:string){
        const trader = await this.mastra.getAgent("MainAgent");
        if (!trader) {
            throw new Error("Trader agent not found");
        }
        try{
            const response = await trader.generate(query)

            console.log(response.text);
            return response.text;
        }catch(e:any){
            throw new Error("Unable to get response from agent ",e)
        }
    }

    async callVoiceAgent(oggBuffer:Buffer){
        const voice = await this.mastra.getAgent("voiceAgent");
        if (!voice) {
            throw new Error("Voice agent not found");
        }
        try{
            const response = await voice.listen(oggBuffer);
            const text = await this.convertToText(response);
            return text;
        }catch(e:any){
            throw new Error("Unable to get response from voice agent ",e)
        }
    }

    async convertToText(
        input: string | NodeJS.ReadableStream,
      ): Promise<string> {
        if (typeof input === "string") {
          return input;
        }
       
        const chunks: Buffer[] = [];
        return new Promise<string>((resolve, reject) => {
          input.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          input.on("error", (err) => reject(err));
          input.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        });
    }
    
}

export const mastraService = new MastraService();