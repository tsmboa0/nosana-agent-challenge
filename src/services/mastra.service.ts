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
        const voice = await this.mastra.getAgent("voice");
        if (!voice) {
            throw new Error("Voice agent not found");
        }
        try{
            const response = await voice.listen(oggBuffer)
            return response.text;
        }catch(e:any){
            throw new Error("Unable to get response from voice agent ",e)
        }
    }
    
}

export const mastraService = new MastraService();