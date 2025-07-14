import { Context } from 'telegraf';

/**
 * Format a message for Telegram with proper markdown escaping
 */
export function formatMessage(text: string): string {
  // Escape special characters for MarkdownV2
  return text
    .replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\~/g, '\\~')
    .replace(/\`/g, '\\`')
    .replace(/\>/g, '\\>')
    .replace(/\#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/\=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/\!/g, '\\!');
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format a large number with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * Create inline keyboard buttons for trading actions
 */
export function createTradingKeyboard(symbol: string) {
  return {
    inline_keyboard: [
      [
        { text: `📈 Buy ${symbol}`, callback_data: `buy_${symbol}` },
        { text: `📉 Sell ${symbol}`, callback_data: `sell_${symbol}` },
      ],
      [
        { text: `ℹ️ Info ${symbol}`, callback_data: `info_${symbol}` },
        { text: `📊 Chart ${symbol}`, callback_data: `chart_${symbol}` },
      ],
    ],
  };
}

/**
 * Create inline keyboard for portfolio actions
 */
export function createPortfolioKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💰 Add Funds', callback_data: 'add_funds' },
        { text: '📊 View Charts', callback_data: 'view_charts' },
      ],
      [
        { text: '📈 Trading History', callback_data: 'trading_history' },
        { text: '⚙️ Settings', callback_data: 'settings' },
      ],
    ],
  };
}

/**
 * Format asset information for display
 */
export function formatAssetInfo(
  symbol: string,
  name: string,
  price: number,
  change24h: number,
  volume24h: number,
  marketCap?: number
): string {
  const priceFormatted = formatCurrency(price);
  const changeFormatted = formatPercentage(change24h);
  const volumeFormatted = formatNumber(volume24h);
  const marketCapFormatted = marketCap ? formatNumber(marketCap) : 'N/A';

  return `
*${symbol} - ${name}*
💰 Price: ${priceFormatted}
📈 24h Change: ${changeFormatted}
📊 24h Volume: $${volumeFormatted}
🏦 Market Cap: $${marketCapFormatted}
  `.trim();
}

/**
 * Format portfolio summary
 */
export function formatPortfolioSummary(
  totalValue: number,
  totalChange24h: number,
  assetCount: number
): string {
  const totalValueFormatted = formatCurrency(totalValue);
  const totalChangeFormatted = formatPercentage(totalChange24h);

  return `
*📊 Portfolio Summary*
💰 Total Value: ${totalValueFormatted}
📈 24h Change: ${totalChangeFormatted}
📦 Assets: ${assetCount}
  `.trim();
}
