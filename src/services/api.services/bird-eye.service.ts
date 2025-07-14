import axios from 'axios';
import { BirdeyeTokenData, BirdeyeOHLCVResponse, OHLCVData } from '../../types';
import dotenv from 'dotenv';
dotenv.config();

export class BirdeyeService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.BIRDEYE_API_KEY;
    if (!apiKey) {
      throw new Error('BIRDEYE_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = process.env.BIRDEYE_API_URL || 'https://public-api.birdeye.so';
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-API-KEY': this.apiKey,
          'X-Chain': 'solana',
          'Content-Type': 'application/json',
        },
        params,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Birdeye API error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Birdeye API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchOHLCV(address: string, from: number, to: number, interval = '1h') {
    const url = `${this.baseUrl}/defi/ohlcv`;
    const { data } = await axios.get(url, {
      headers: {
        'X-Chain': 'solana',
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      params: {
        address,
        time_from: from,
        time_to: to,
        type: interval,
        currency: 'usd',
        ui_amount_mode: 'ui',
      },
    });
    return data.data;
  };

  async fetchPriceVolume(address: string) {
    const { data } = await axios.get(`${this.baseUrl}/defi/price-volume`, {
      headers: {
        'X-Chain': 'solana',
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      params: { address },
    });
    return data.data;
  };

  async fetchRecentTrades(address: string) {
    const { data } = await axios.get(`${this.baseUrl}/v3/trades/token`, {
      headers: {
        'X-Chain': 'solana',
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      params: { address, limit: 50 },
    });
    return data.data.items;
  };

  async fetchLiquidity(address: string) {
    const { data } = await axios.get(`${this.baseUrl}/defi/pair-overview`, {
      headers: {
        'X-Chain': 'solana',
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      params: { address },
    });
    return data.data;
  };


}

// Export singleton instance
export const birdeyeService = new BirdeyeService();
