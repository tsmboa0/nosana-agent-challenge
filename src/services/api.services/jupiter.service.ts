import { JupiterQuoteRequest, JupiterQuoteResponse, TokenInfo } from '../../types';

export class JupiterService {
  private baseUrl: string;
  readonly usdc_address: string = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

  constructor() {
    this.baseUrl = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Jupiter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get quote for a token swap
   */
  async getQuote(request: JupiterQuoteRequest): Promise<JupiterQuoteResponse> {
    return this.makeRequest<JupiterQuoteResponse>('/quote', request);
  }

  /**
   * Get all available tokens
   */
  async getTokens(): Promise<TokenInfo[]> {
    const response = await this.makeRequest<{ tokens: TokenInfo[] }>('/tokens');
    return response.tokens;
  }

  /**
   * Search for tokens by symbol or name
   */
  async searchTokens(query: string): Promise<TokenInfo[]> {
    const tokens = await this.getTokens();
    const lowerQuery = query.toLowerCase();
    
    return tokens.filter(token => 
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get token by address
   */
  async getTokenByAddress(address: string): Promise<TokenInfo | null> {
    const tokens = await this.getTokens();
    return tokens.find(token => token.address === address) || null;
  }

  /**
   * Get token by symbol
   */
  async getTokenBySymbol(symbol: string): Promise<TokenInfo | null> {
    const tokens = await this.getTokens();
    return tokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase()) || null;
  }

  /**
   * Get swap transaction
   */
  async getSwapTransaction(quoteResponse: JupiterQuoteResponse): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: quoteResponse.inputMint, // This will be replaced with actual user public key
          wrapUnwrapSOL: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get swap transaction: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.swapTransaction;
    } catch (error) {
      throw new Error(`Failed to get swap transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get price impact for a swap
   */
  async getPriceImpact(inputMint: string, outputMint: string, amount: string): Promise<number> {
    try {
      const quote = await this.getQuote({
        inputMint,
        outputMint,
        amount,
        slippageBps: 50, // 0.5% slippage
      });
      
      return quote.priceImpactPct;
    } catch (error) {
      console.error('Error getting price impact:', error);
      return 0;
    }
  }

  /**
   * Get supported tokens for a given input token
   */
  async getSupportedTokens(inputMint: string): Promise<TokenInfo[]> {
    try {
      const allTokens = await this.getTokens();
      const supportedTokens: TokenInfo[] = [];

      // Test with a small amount to see which tokens are supported
      const testAmount = '1000000'; // 1 SOL in lamports

      for (const token of allTokens.slice(0, 10)) { // Limit to first 10 for performance
        if (token.address === inputMint) continue;
        
        try {
          await this.getQuote({
            inputMint,
            outputMint: token.address,
            amount: testAmount,
            slippageBps: 100,
          });
          supportedTokens.push(token);
        } catch {
          // Token not supported for this input
        }
      }

      return supportedTokens;
    } catch (error) {
      console.error('Error getting supported tokens:', error);
      return [];
    }
  }
}

// Export singleton instance
export const jupiterService = new JupiterService();
