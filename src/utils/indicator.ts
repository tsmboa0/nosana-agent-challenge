// This file contains the functions to compute the indicators for a given stock or token.

import {
    RSI,
    MACD,
    SMA,
    BollingerBands,
  } from 'technicalindicators';
  
  export const computeIndicators = (ohlcv: any[]) => {
    const closes = ohlcv.map(d => d.close);
  
    const rsi = RSI.calculate({ values: closes, period: 14 });
    const macd = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const ma = SMA.calculate({ values: closes, period: 20 });
    const bb = BollingerBands.calculate({
      period: 20,
      stdDev: 2,
      values: closes,
    });
  
    return {
      latestRSI: rsi[rsi.length - 1],
      latestMACD: macd[macd.length - 1],
      latestMA: ma[ma.length - 1],
      latestBB: bb[bb.length - 1],
    };
  };
  