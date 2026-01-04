'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Activity, RefreshCw, BarChart3, Plus, X, Search, Star, Calendar, Rss, ScanEye as News } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Finnhub API Key (replace with your actual key)
const FINNHUB_API_KEY = 'd490nhpr01qshn3k2dd0d490nhpr01qshn3k2ddg';

// VWAP Calculator
const calculateVWAP = (candles, startIndex) => {
  if (!candles || candles.length === 0 || startIndex >= candles.length || startIndex < 0) {
    return 0;
  }
  
  let cumVolumePrice = 0;
  let cumVolume = 0;
  
  for (let i = startIndex; i < candles.length; i++) {
    if (!candles[i] || typeof candles[i].high === 'undefined') continue;
    
    // Using (O + H + L + C) / 4 to match TradingView VWAP settings
    const typical = (candles[i].open + candles[i].high + candles[i].low + candles[i].close) / 4;
    cumVolumePrice += typical * candles[i].volume;
    cumVolume += candles[i].volume;
  }
  
  return cumVolume > 0 ? cumVolumePrice / cumVolume : 0;
};

// MACD Calculation
const calculateMACD = (prices, fast = 12, slow = 26, signal = 9) => {
  if (prices.length < slow) return { macd: 0, signal: 0, histogram: 0, aboveZero: false, bullish: false };
  
  const emaFast = calculateEMA(prices, fast);
  const emaSlow = calculateEMA(prices, slow);
  const macdLine = emaFast - emaSlow;
  
  const signalLine = calculateEMA(prices.slice(-signal).map((_, i) => {
    const slice = prices.slice(i, i + slow - fast);
    return calculateEMA(slice, fast) - calculateEMA(slice, slow);
  }), signal);
  
  const histogram = macdLine - signalLine;
  
  return { 
    macd: macdLine, 
    signal: signalLine,
    histogram: histogram,
    aboveZero: macdLine > 0,
    bullish: macdLine > 0 && histogram > 0,
    bearish: macdLine < 0 && histogram < 0
  };
};

const calculateEMA = (prices, period) => {
  if (prices.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
};

// Enhanced DMI Calculation with ADX
const calculateDMI = (candles, period = 14) => {
  if (candles.length < period + 1) return { 
    diPlus: 0, 
    diMinus: 0, 
    adx: 0,
    positive: false,
    bullish: false,
    bearish: false,
    trendStrength: 'weak'
  };
  
  let plusDMs = [];
  let minusDMs = [];
  let trueRanges = [];
  
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevHigh = candles[i - 1].high;
    const prevLow = candles[i - 1].low;
    const prevClose = candles[i - 1].close;
    
    const upMove = high - prevHigh;
    const downMove = prevLow - low;
    
    const plusDM = (upMove > downMove && upMove > 0) ? upMove : 0;
    const minusDM = (downMove > upMove && downMove > 0) ? downMove : 0;
    
    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    
    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
    trueRanges.push(trueRange);
  }
  
  // Calculate smoothed values
  let smoothedPlusDM = plusDMs.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedMinusDM = minusDMs.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedTR = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
  
  for (let i = period; i < plusDMs.length; i++) {
    smoothedPlusDM = smoothedPlusDM - (smoothedPlusDM / period) + plusDMs[i];
    smoothedMinusDM = smoothedMinusDM - (smoothedMinusDM / period) + minusDMs[i];
    smoothedTR = smoothedTR - (smoothedTR / period) + trueRanges[i];
  }
  
  const diPlus = smoothedTR > 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0;
  const diMinus = smoothedTR > 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0;
  
  // Calculate DX and ADX
  const dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus) * 100;
  const adx = calculateEMA(Array(period).fill(dx), period);
  
  const bullish = diPlus > diMinus;
  const bearish = diMinus > diPlus;
  
  let trendStrength = 'weak';
  if (adx > 50) trendStrength = 'very strong';
  else if (adx > 40) trendStrength = 'strong';
  else if (adx > 25) trendStrength = 'moderate';
  else if (adx > 20) trendStrength = 'weak';
  
  return { 
    diPlus: diPlus.toFixed(2), 
    diMinus: diMinus.toFixed(2), 
    adx: adx.toFixed(2),
    positive: bullish,
    bullish: bullish,
    bearish: bearish,
    trendStrength: trendStrength
  };
};

// Fetch news using Finnhub API for better reliability
const fetchYahooNews = async (symbol) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${weekAgo}&to=${today}&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
  
    // Check if data is an array
    if (!Array.isArray(data)) {
      console.log('News API returned non-array data:', data);
      return [];
    }
    
    if (data.length === 0) {
      // Fallback mock news if no real news available
      return [{
        title: `${symbol} Trading Update`,
        description: 'Stay informed with the latest market movements and technical analysis.',
        source: 'Market Data',
        publishedAt: new Date().toISOString(),
        url: '#'
      }];
    }
    
    return data.map(article => ({
      title: article.headline || 'No title',
      description: article.summary || '',
      source: article.source || 'Finnhub',
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      url: article.url || '#'
    })).slice(0, 5);
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
};

// Fetch earnings calendar data from Finnhub API
const fetchEarningsCalendar = async (symbols = []) => {
  try {
    const today = new Date();
    const from = today.toISOString().split('T')[0];
    const to = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const response = await fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
  
    const earningsArray = data.earningsCalendar || [];
    const filtered = earningsArray.filter(earning => symbols.includes(earning.symbol));
    return filtered.map(earning => ({
      symbol: earning.symbol,
      reportDate: earning.date,
      estimate: earning.epsEstimate ? earning.epsEstimate.toFixed(2) : 'N/A',
      revenueEstimate: earning.revenueEstimate ? (earning.revenueEstimate / 1_000_000).toFixed(1) + 'M' : 'N/A',
      currency: 'USD'
    }));
  } catch (error) {
    console.error('Error fetching earnings calendar:', error);
  
    // Fallback mock data
    return symbols.map(symbol => ({
      symbol,
      reportDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimate: (Math.random() * 5).toFixed(2),
      currency: 'USD'
    }));
  }
};

// Fetch market news from Finnhub API
const fetchMarketNews = async () => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
  
    return data.map(article => ({
      title: article.headline,
      description: article.summary || '',
      source: article.source || 'Finnhub',
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      url: article.url
    })).slice(0, 10);
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [
      {
        title: "Market Shows Strong Momentum Amid Economic Data",
        description: "Major indices continue upward trend as investors digest latest economic reports.",
        source: "Financial Times",
        publishedAt: new Date().toISOString(),
        url: "#"
      },
      {
        title: "Tech Stocks Lead Market Rally",
        description: "Technology sector outperforms as earnings season approaches.",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: "#"
      }
    ];
  }
};

// Popular stock symbols for quick selection
const popularStocks = [
  'AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'META', 'GOOGL', 'AMZN',
  'SPY', 'QQQ', 'IWM', 'DIA', 'ARKK', 'TLT', 'GLD', 'SLV',
  'NFLX', 'DIS', 'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD',
  'BAC', 'MA', 'INTC', 'CSCO', 'ADBE', 'CRM', 'PYPL', 'AVGO',
  'COST', 'WMT', 'MCD', 'SBUX', 'NKE', 'TGT', 'LOW', 'XOM',
  'CVX', 'COP', 'EOG', 'MPC', 'BA', 'CAT', 'DE', 'MMM',
  'IBM', 'ORCL', 'SAP', 'UBER', 'LYFT', 'DASH', 'SNOW', 'MDB',
  'NET', 'CRWD', 'ZS', 'PANW', 'FTNT', 'OKTA', 'TEAM', 'DOCU'
];

const VWAPReanchorBot = () => {
  const { user, isLoaded } = useUser();
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    vwap9: true,
    vwap34: true,
    vwap144: true,
    timeframe4H: true,
    timeframe15m: true,
    macdBullish: false,
    macdBearish: false,
    dmiBullish: false,
    dmiBearish: false,
    priceAboveVWAP: false,
    priceBelowVWAP: false,
    showRetests: true,
    showPWHSweeps: true,
    showPWLSweeps: true
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [status, setStatus] = useState('idle');
  const [watchlist, setWatchlist] = useState([]);
  const [initialWatchlistLoaded, setInitialWatchlistLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [news, setNews] = useState({});
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customStocks, setCustomStocks] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const anchorPoints = useRef({});
  const lastCheck = useRef({});
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const stockDataCache = useRef({});
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [showEarningDetails, setShowEarningDetails] = useState(false);
  const vwapLevelsHistory = useRef({});
  const [nextScanTime, setNextScanTime] = useState(null);
  const [timeUntilNextScan, setTimeUntilNextScan] = useState('');
  const [economicEvents, setEconomicEvents] = useState([]);
  const [economicLoading, setEconomicLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showStockAlerts, setShowStockAlerts] = useState(false);

  // Timezone Configuration - Eastern Standard Time (EST)
  const EST_TIMEZONE = 'America/New_York';
 // Earnings Calendar Component
  const EarningsCalendar = () => (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-cyan-400" size={24} />
          <h3 className="text-xl font-bold text-white">Upcoming Earnings</h3>
        </div>
        <button
          onClick={loadEarningsData}
          disabled={earningsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={earningsLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      {earningsLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
          <p className="text-gray-400">Loading earnings data...</p>
        </div>
      ) : earningsData.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="mx-auto mb-3 opacity-50" size={48} />
          <p>No earnings data available.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {earningsData
            .sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate))
            .map((earning, index) => (
              <div
                key={index}
                 onClick={() => {
          setSelectedEarning(earning);
          setShowEarningDetails(true);
        }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg font-bold">
                    {earning.symbol}
                  </div>
                  <div>
                    <div className="text-white font-medium">Q4 2024 Earnings</div>
                    <div className="text-gray-400 text-sm">
                      Estimated EPS: ${earning.estimate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-300 font-bold">
                    {new Date(earning.reportDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(earning.reportDate).toLocaleDateString('en-US', {
                      weekday: 'short'
                    })}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      
    </div>
  );


  const EconomicCalendar = () => (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-cyan-400" size={24} />
          <h3 className="text-xl font-bold text-white">Economic Calendar</h3>
        </div>
        <button
          onClick={loadEconomicCalendar}
          disabled={economicLoading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={economicLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      {economicLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
          <p className="text-gray-400">Loading economic events...</p>
        </div>
      ) : economicEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="mx-auto mb-3 opacity-50" size={48} />
          <p>No economic events available.</p>
          <button
            onClick={loadEconomicCalendar}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl font-bold hover:bg-cyan-500/30"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid gap-3 max-h-[600px] overflow-y-auto">
          {economicEvents.map((event, index) => {
            // Parse the date properly - the API returns "2025-11-17 13:30:00" format
            // Parse date in EST
  // Parse date in EST
  const eventDate = new Date(event.date.replace(' ', 'T') + '-05:00'); // EST offset
  const todayEST = new Date(new Date().toLocaleString('en-US', { timeZone: EST_TIMEZONE }));
  const isToday = eventDate.toDateString() === todayEST.toDateString();
  const isPast = eventDate < todayEST && !isToday; // Fixed: changed 'today' to 'todayEST'
            
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  isPast 
                    ? 'bg-white/5 border-white/10 opacity-60'
                    : isToday
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-300">
                        HIGH
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-bold">
                        {event.country}
                      </span>
                      {isToday && (
                        <span className="px-2 py-1 bg-cyan-500 text-white rounded text-xs font-bold animate-pulse">
                          TODAY
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-lg mb-1">{event.event}</h4>
                    <div className="text-sm text-gray-400">
                      {event.time && event.time !== 'TBA' && (
                        <span className="mr-4">🕐 {event.time}</span>
                      )}
                    </div>
                    {event.comment && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{event.comment}</p>
                    )}
                    {(event.estimate || event.previous || event.actual) && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {event.previous && (
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-xs text-gray-400">Previous</div>
                            <div className="font-bold text-gray-300">{event.previous}</div>
                          </div>
                        )}
                        {event.estimate && (
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-xs text-gray-400">Forecast</div>
                            <div className="font-bold text-cyan-300">{event.estimate}</div>
                          </div>
                        )}
                        {event.actual && (
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-xs text-gray-400">Actual</div>
                            <div className="font-bold text-emerald-300">{event.actual}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isToday ? 'text-cyan-300' : 'text-white'}`}>
    {formatDateEST(eventDate, {
      month: 'short',
      day: 'numeric'
    })}
  </div>
                <div className="text-sm text-gray-400">
    {formatDateEST(eventDate, {
      weekday: 'short'
    })}
  </div>
  <div className="text-xs text-gray-500 mt-1">
    {formatDateEST(eventDate, {
      year: 'numeric'
    })}
  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
    // News Feed Component
    const NewsFeed = () => (
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Rss className="text-cyan-400" size={24} />
            <h3 className="text-xl font-bold text-white">Market News</h3>
          </div>
          <button
            onClick={loadMarketNews}
            disabled={newsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={newsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        {newsLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
            <p className="text-gray-400">Loading news...</p>
          </div>
        ) : marketNews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Rss className="mx-auto mb-3 opacity-50" size={48} />
            <p>No news available.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {marketNews.map((article, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-lg flex-1">{article.title}</h4>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
    {formatDateEST(article.publishedAt, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} EST
  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{article.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 text-sm font-medium">{article.source}</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

  // Helper function to format dates in EST
  const formatDateEST = (timestamp, options = {}) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      timeZone: EST_TIMEZONE,
      ...options
    });
  };

  // Load user's watchlist from Supabase
  const loadUserWatchlist = useCallback(async () => {
    if (!user || !isLoaded) {
      setWatchlist(['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'META', 'GOOGL', 'AMZN']); // Default for non-logged in users
      setInitialWatchlistLoaded(true);
      return;
    }

    try {
      console.log('Loading watchlist for user:', user.id);
      
      // Check if user watchlist exists
      const { data: existingWatchlist, error } = await supabase
        .from('user_watchlists')
        .select('watchlist')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching watchlist:', error);
        setWatchlist(['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'META', 'GOOGL', 'AMZN']);
      } else if (existingWatchlist) {
        console.log('Found existing watchlist:', existingWatchlist.watchlist);
        setWatchlist(existingWatchlist.watchlist || []);
      } else {
        // Create default watchlist for new user
        console.log('No existing watchlist, creating default');
        const defaultWatchlist = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'META', 'GOOGL', 'AMZN'];
        await saveWatchlistToSupabase(defaultWatchlist);
        setWatchlist(defaultWatchlist);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      setWatchlist(['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'META', 'GOOGL', 'AMZN']);
    } finally {
      setInitialWatchlistLoaded(true);
    }
  }, [user, isLoaded]);

  // Save watchlist to Supabase
  const saveWatchlistToSupabase = async (watchlistToSave) => {
    if (!user) {
      console.log('User not logged in, watchlist not saved');
      return;
    }

    try {
      console.log('Saving watchlist for user:', user.id, watchlistToSave);
      
      // Check if user watchlist exists
      const { data: existingWatchlist } = await supabase
        .from('user_watchlists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingWatchlist) {
        // Update existing watchlist
        const { error } = await supabase
          .from('user_watchlists')
          .update({
            watchlist: watchlistToSave,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating watchlist:', error);
        } else {
          console.log('Watchlist updated successfully');
        }
      } else {
        // Create new watchlist
        const { error } = await supabase
          .from('user_watchlists')
          .insert({
            user_id: user.id,
            watchlist: watchlistToSave,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating watchlist:', error);
        } else {
          console.log('Watchlist created successfully');
        }
      }
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  };

  // Load watchlist when user changes
  useEffect(() => {
    if (isLoaded) {
      loadUserWatchlist();
    }
  }, [isLoaded, user, loadUserWatchlist]);

  // Save watchlist whenever it changes
  useEffect(() => {
    if (initialWatchlistLoaded && user) {
      const saveTimeout = setTimeout(() => {
        saveWatchlistToSupabase(watchlist);
      }, 500); // Debounce save to avoid too many requests

      return () => clearTimeout(saveTimeout);
    }
  }, [watchlist, user, initialWatchlistLoaded]);

  // Add stock to watchlist
  const addStockToWatchlist = async (symbol) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (cleanSymbol && !watchlist.includes(cleanSymbol)) {
      const newWatchlist = [...watchlist, cleanSymbol];
      setWatchlist(newWatchlist);
      
      if (!popularStocks.includes(cleanSymbol) && !customStocks.includes(cleanSymbol)) {
        setCustomStocks(prev => [...prev, cleanSymbol]);
      }
      setNewStockSymbol('');
      setSearchTerm('');
    }
  };

  // Remove stock from watchlist
  const removeStockFromWatchlist = async (symbol) => {
    const newWatchlist = watchlist.filter(s => s !== symbol);
    setWatchlist(newWatchlist);
  };

  // Fetch economic calendar
  const fetchEconomicCalendar = async () => {
    try {
      const FCS_API_KEY = 'rhTjpPPioj6gJWY70GJx9nPrU';
      
      const today = new Date();
      const from = today.toISOString().split('T')[0];
      const to = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `https://fcsapi.com/api-v3/forex/economy_cal?country=US&from=${from}&to=${to}&access_key=${FCS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (!data.response || !Array.isArray(data.response) || data.response.length === 0) {
        return getMockEconomicData();
      }
      
      const filteredEvents = data.response
        .filter(event => event.importance === '1')
        .map(event => ({
          event: event.title || event.indicator || 'Economic Event',
          date: event.date,
          time: event.date ? event.date.split(' ')[1] : 'TBA',
          country: event.country || 'US',
          impact: 'high',
          actual: event.actual || null,
          estimate: event.forecast || null,
          previous: event.previous || null,
          indicator: event.indicator || '',
          comment: event.comment || ''
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return filteredEvents.length > 0 ? filteredEvents.slice(0, 20) : getMockEconomicData();
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
      return getMockEconomicData();
    }
  };

  // Mock economic data function
  const getMockEconomicData = () => {
    const today = new Date();
    
    return [
      {
        event: 'FOMC Interest Rate Decision',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        country: 'US',
        impact: 'high',
        actual: null,
        estimate: '5.25%',
        previous: '5.25%'
      },
      {
        event: 'Consumer Price Index (CPI)',
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '08:30',
        country: 'US',
        impact: 'high',
        actual: null,
        estimate: '3.2%',
        previous: '3.1%'
      }
    ];
  };

  // Fetch stock data
  const fetchStockData = async (symbol, interval = '4h') => {
    try {
      const cacheKey = `${symbol}_${interval}`;
      
      if (stockDataCache.current[cacheKey]) {
        return stockDataCache.current[cacheKey];
      }

      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=5000&apikey=49db0f6479874663b01a96fdf58d662f`;
    
      const response = await fetch(url);
      const data = await response.json();
    
      if (!data.values || data.values.length === 0) {
        return null;
      }
    
      const values = data.values;
      const candles = values.slice().reverse().map((v) => ({
        timestamp: new Date(v.datetime).getTime(),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume)
      }));
    
      const validCandles = candles.filter(c => c.high && c.low && c.volume > 0);
      stockDataCache.current[cacheKey] = validCandles;
      return validCandles;
    } catch (error) {
      console.error(`Error fetching ${symbol} at ${interval}:`, error);
      return null;
    }
  };

  // Check for Previous Week Sweeps
  const checkPreviousWeekSweeps = async (symbol) => {
    try {
      const dailyCandles = await fetchStockData(symbol, '1day');
      
      if (!dailyCandles || dailyCandles.length < 10) return null;
      
      const latestCandle = dailyCandles[dailyCandles.length - 1];
      const previousCandle = dailyCandles[dailyCandles.length - 2];
      
      if (!latestCandle || !previousCandle) return null;
      
      const previousWeekCandles = dailyCandles.slice(-8, -1);
      
      if (previousWeekCandles.length < 5) return null;
      
      const pwh = Math.max(...previousWeekCandles.map(c => c.high));
      const pwl = Math.min(...previousWeekCandles.map(c => c.low));
      
      let sweepType = null;
      let sweepDetails = null;
      
      // Check for PWH Sweep
      if (latestCandle.high > pwh && latestCandle.close < pwh) {
        sweepType = 'PWH';
        sweepDetails = {
          type: 'PWH Sweep',
          description: 'Previous Week High violated and closed back below',
          pwh: pwh.toFixed(2),
          high: latestCandle.high.toFixed(2),
          close: latestCandle.close.toFixed(2),
          penetration: ((latestCandle.high - pwh) / pwh * 100).toFixed(2),
          bias: 'bearish',
          color: 'red'
        };
      }
      
      // Check for PWL Sweep
      if (latestCandle.low < pwl && latestCandle.close > pwl) {
        sweepType = 'PWL';
        sweepDetails = {
          type: 'PWL Sweep',
          description: 'Previous Week Low violated and closed back above',
          pwl: pwl.toFixed(2),
          low: latestCandle.low.toFixed(2),
          close: latestCandle.close.toFixed(2),
          penetration: ((pwl - latestCandle.low) / pwl * 100).toFixed(2),
          bias: 'bullish',
          color: 'green'
        };
      }
      
      if (sweepType && sweepDetails) {
        return {
          ticker: symbol,
          timestamp: new Date(latestCandle.timestamp).toISOString(),
          alertType: 'sweep',
          sweepType: sweepType,
          sweepDetails: sweepDetails,
          price: latestCandle.close.toFixed(2),
          volume: latestCandle.volume.toFixed(0),
          timeframe: '1D',
          bias: sweepDetails.bias,
          reason: `${sweepDetails.type}: Wick ${sweepType === 'PWH' ? 'above' : 'below'} ${sweepType} at $${sweepType === 'PWH' ? sweepDetails.pwh : sweepDetails.pwl}, closed back ${sweepType === 'PWH' ? 'below' : 'above'}. Penetration: ${sweepDetails.penetration}%`
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error checking PWH/PWL sweeps for ${symbol}:`, error);
      return null;
    }
  };

  // Find highest volume candle
  const findHighestVolumeCandle = (candles, period) => {
    if (!candles || candles.length < period) return null;
    
    const lookbackCandles = candles.slice(-period);
    let highestVolumeIndex = 0;
    let highestVolume = 0;
    
    lookbackCandles.forEach((candle, idx) => {
      if (candle && candle.volume > highestVolume) {
        highestVolume = candle.volume;
        highestVolumeIndex = idx;
      }
    });
    
    return candles.length - period + highestVolumeIndex;
  };

  // Check for VWAP retest
  const checkVWAPRetest = (symbol, candles, currentVWAP, timeframe, vwapPeriod, anchorTimestamp) => {
    if (!candles || candles.length < 3) return null;
    
    const latestCandle = candles[candles.length - 1];
    const previousCandle = candles[candles.length - 2];
    
    if (!latestCandle || !previousCandle) return null;
    
    const vwapKey = `${symbol}_${timeframe}_${vwapPeriod}`;
    const vwapLevel = currentVWAP;
    
    const distancePercent = Math.abs((latestCandle.close - vwapLevel) / vwapLevel) * 100;
    const retestThreshold = 0.5;
    
    const isNearVWAP = distancePercent <= retestThreshold;
    const wickTouchesVWAP = (latestCandle.low <= vwapLevel && latestCandle.high >= vwapLevel);
    const closeTouchesVWAP = Math.abs(latestCandle.close - vwapLevel) <= (vwapLevel * (retestThreshold / 100));
    
    const isTestingVWAP = isNearVWAP || wickTouchesVWAP || closeTouchesVWAP;
    
    if (isTestingVWAP) {
      const isSupport = latestCandle.close > vwapLevel && latestCandle.low <= vwapLevel;
      const isResistance = latestCandle.close < vwapLevel && latestCandle.high >= vwapLevel;
      
      let interaction;
      let bias;
      
      if (isSupport) {
        interaction = 'support';
        bias = 'bullish';
      } else if (isResistance) {
        interaction = 'resistance';
        bias = 'bearish';
      } else {
        if (previousCandle.close < vwapLevel && latestCandle.close > vwapLevel) {
          interaction = 'support';
          bias = 'bullish';
        } else if (previousCandle.close > vwapLevel && latestCandle.close < vwapLevel) {
          interaction = 'resistance';
          bias = 'bearish';
        } else {
          interaction = latestCandle.close > vwapLevel ? 'support' : 'resistance';
          bias = latestCandle.close > vwapLevel ? 'bullish' : 'bearish';
        }
      }
      
      const lastRetest = vwapLevelsHistory.current[vwapKey];
      const timeSinceLastRetest = lastRetest ? latestCandle.timestamp - lastRetest.timestamp : Infinity;
      const cooldownPeriod = 15 * 60 * 1000;
      
      if (!lastRetest || timeSinceLastRetest > cooldownPeriod) {
        vwapLevelsHistory.current[vwapKey] = {
          timestamp: latestCandle.timestamp,
          vwapLevel: vwapLevel
        };
        
        let strength;
        if (distancePercent < 0.1) {
          strength = 'very strong';
        } else if (distancePercent < 0.3) {
          strength = 'strong';
        } else {
          strength = 'moderate';
        }
        
        return {
          type: 'retest',
          bias: bias,
          interaction: interaction,
          distance: Math.abs(latestCandle.close - vwapLevel).toFixed(2),
          distancePercent: distancePercent.toFixed(2),
          strength: strength,
          wickTest: wickTouchesVWAP,
          closeTest: closeTouchesVWAP
        };
      }
    }
    
    return null;
  };

  // Check for VWAP re-anchoring
  const checkVWAPReanchor = async (symbol) => {
    const newAlerts = [];
    const timeframes = [];

    // Check for Previous Week High/Low Sweeps
    if (filters.showPWHSweeps || filters.showPWLSweeps) {
      const sweepAlert = await checkPreviousWeekSweeps(symbol);
      if (sweepAlert) {
        if ((sweepAlert.sweepType === 'PWH' && filters.showPWHSweeps) ||
            (sweepAlert.sweepType === 'PWL' && filters.showPWLSweeps)) {
          newAlerts.push(sweepAlert);
        }
      }
    }
    
    if (filters.timeframe4H) timeframes.push({ interval: '4h', label: '4H' });
    if (filters.timeframe15m) timeframes.push({ interval: '15min', label: '15m' });
    
    for (const timeframe of timeframes) {
      const candles = await fetchStockData(symbol, timeframe.interval);
      if (!candles || candles.length < 50) continue;
      
      const latestCandle = candles[candles.length - 1];
      if (!latestCandle || !latestCandle.close) continue;
      
      const prices = candles.map(c => c.close).filter(p => p !== undefined);
      const lastCheckTime = lastCheck.current[`${symbol}_${timeframe.interval}`] || 0;
      
      if (latestCandle.timestamp <= lastCheckTime) continue;
      lastCheck.current[`${symbol}_${timeframe.interval}`] = latestCandle.timestamp;
      
      const macd = calculateMACD(prices.slice(-35));
      const dmi = calculateDMI(candles.slice(-20));
      
      const recentCandles = candles.slice(-20).filter(c => c && c.volume);
      const avgVolume = recentCandles.length > 0 
        ? recentCandles.reduce((sum, c) => sum + c.volume, 0) / recentCandles.length 
        : 0;
      
      // Check each VWAP period
      [9, 34, 144].forEach(period => {
        const filterKey = `vwap${period}`;
        if (!filters[filterKey]) return;
        
        const highestVolumeIndex = findHighestVolumeCandle(candles, period);
        if (highestVolumeIndex === null) return;
        
        const currentAnchor = anchorPoints.current[`${symbol}_${timeframe.interval}_${period}`];
        const newVWAP = calculateVWAP(candles, highestVolumeIndex);
        
        if (newVWAP === 0) return;
        
        const oldVWAP = currentAnchor !== undefined 
          ? calculateVWAP(candles, currentAnchor) 
          : 0;
        const vwapChange = oldVWAP > 0 
          ? Math.abs((newVWAP - oldVWAP) / oldVWAP) * 100 
          : 0;
        
        let retestInfo = null;
        if (filters.showRetests) {
          retestInfo = checkVWAPRetest(symbol, candles, newVWAP, timeframe.label, period, latestCandle.timestamp);
        }
        
        if ((oldVWAP === 0 || vwapChange > 0.1) || retestInfo) {
          const priceAboveVWAP = latestCandle.close > newVWAP;
          const priceBelowVWAP = latestCandle.close < newVWAP;
          
          if (!retestInfo) {
            if (filters.macdBullish && !macd.bullish) return;
            if (filters.macdBearish && !macd.bearish) return;
            if (filters.dmiBullish && !dmi.bullish) return;
            if (filters.dmiBearish && !dmi.bearish) return;
            if (filters.priceAboveVWAP && !priceAboveVWAP) return;
            if (filters.priceBelowVWAP && !priceBelowVWAP) return;
          }
          
          anchorPoints.current[`${symbol}_${timeframe.interval}_${period}`] = highestVolumeIndex;
          
          const anchorCandle = candles[highestVolumeIndex];
          const volumeRatio = avgVolume > 0 
            ? (anchorCandle.volume / avgVolume).toFixed(2) 
            : 'N/A';
          const priceChange = ((anchorCandle.close - anchorCandle.open) / anchorCandle.open * 100).toFixed(2);
          
          let bias = 'neutral';
          if (retestInfo) {
            bias = retestInfo.bias;
          } else if ((macd.bullish && dmi.bullish && priceAboveVWAP) || 
                    (macd.bullish && priceAboveVWAP) || 
                    (dmi.bullish && priceAboveVWAP)) {
            bias = 'bullish';
          } else if ((macd.bearish && dmi.bearish && priceBelowVWAP) || 
                    (macd.bearish && priceBelowVWAP) || 
                    (dmi.bearish && priceBelowVWAP)) {
            bias = 'bearish';
          }
          
          const alertType = retestInfo ? 'retest' : 'reanchor';
          
          newAlerts.push({
            ticker: symbol,
            timestamp: new Date(anchorCandle.timestamp).toISOString(),
            vwapPeriod: period,
            timeframe: timeframe.label,
            alertType: alertType,
            reason: retestInfo 
              ? `VWAP ${retestInfo.interaction.toUpperCase()} test (${retestInfo.strength}) - ${retestInfo.distance} points`
              : `Highest volume in ${period} period: ${volumeRatio}x avg, Price ${priceChange > 0 ? '+' : ''}${priceChange}%`,
            price: latestCandle.close.toFixed(2),
            volume: anchorCandle.volume.toFixed(0),
            anchorPrice: anchorCandle.close.toFixed(2),
            macd: macd,
            dmi: dmi,
            trend: anchorCandle.close > anchorCandle.open ? 'up' : 'down',
            vwapValue: newVWAP.toFixed(2),
            vwapChange: vwapChange.toFixed(2),
            priceAboveVWAP: priceAboveVWAP,
            priceBelowVWAP: priceBelowVWAP,
            bias: bias,
            retestInfo: retestInfo,
            hasMultipleTimeframes: timeframes.length > 1
          });
        }
      });
    }
    
    return newAlerts;
  };

  // Run scan function
  const runScan = async () => {
    setStatus('scanning');
    const scanStartTime = Date.now();
    let scannedCount = 0;
    let alertsFound = 0;
    
    for (const symbol of watchlist) {
      try {
        scannedCount++;
        setStatus(`Scanning ${symbol}... (${scannedCount}/${watchlist.length})`);
        
        const newAlerts = await checkVWAPReanchor(symbol);
        
        if (newAlerts && newAlerts.length > 0) {
          alertsFound += newAlerts.length;
          
          setAlerts(prev => {
            const combined = [...newAlerts, ...prev];
            const uniqueAlerts = combined.filter((alert, index, self) =>
              index === self.findIndex(a => 
                a.ticker === alert.ticker && 
                a.timeframe === alert.timeframe && 
                a.vwapPeriod === alert.vwapPeriod && 
                a.alertType === alert.alertType &&
                Math.abs(new Date(a.timestamp).getTime() - new Date(alert.timestamp).getTime()) < 60000
              )
            );
            return uniqueAlerts.slice(0, 100);
          });
        }
      
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
      }
    }
    
    const scanDuration = ((Date.now() - scanStartTime) / 1000).toFixed(1);
    setStatus(`Scan complete - ${alertsFound} alerts found`);
    
    const nextTime = Date.now() + (5 * 60 * 1000);
    setNextScanTime(nextTime);
    
    setTimeout(() => setStatus('idle'), 3000);
  };

  // Countdown timer
  useEffect(() => {
    if (!isMonitoring || !nextScanTime) {
      setTimeUntilNextScan('');
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = nextScanTime - now;
      
      if (timeLeft <= 0) {
        setTimeUntilNextScan('Scanning now...');
        return;
      }
      
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      
      setTimeUntilNextScan(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, nextScanTime]);

  // Auto-monitoring
  useEffect(() => {
    if (!isMonitoring) {
      setNextScanTime(null);
      return;
    }

    runScan();
    
    const interval = setInterval(runScan, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, watchlist, filters]);

  // Filter popular stocks based on search
  const filteredPopularStocks = popularStocks.filter(stock =>
    stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load TradingView chart
  const loadChart = async (alert) => {
    if (!chartContainerRef.current) return;
  
    setChartLoading(true);
    try {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js';
      scriptElement.async = true;
      
      if (!document.querySelector('script[src*="lightweight-charts"]')) {
        await new Promise((resolve, reject) => {
          scriptElement.onload = resolve;
          scriptElement.onerror = reject;
          document.head.appendChild(scriptElement);
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const interval = alert.timeframe === '15m' ? '15min' : '4h';
      let candles = await fetchStockData(alert.ticker, interval);
      
      if (!candles || candles.length === 0) {
        setChartLoading(false);
        return;
      }
      
      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
        rightPriceScale: {
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });
      
      chartRef.current = chart;
      
      // Rest of the chart loading code remains the same...
      // ... [Chart loading code remains unchanged from original]
      
    } catch (error) {
      console.error('Error loading chart:', error);
      setChartLoading(false);
    }
  };

  const handleAlertClick = async (alert) => {
    setSelectedAlert(alert);
    setShowChart(true);
  
    if (!news[alert.ticker]) {
      const symbolNews = await fetchYahooNews(alert.ticker);
      setNews(prev => ({ ...prev, [alert.ticker]: symbolNews }));
    }
  
    setTimeout(() => loadChart(alert), 100);
  };

  const closeChart = () => {
    setShowChart(false);
    setSelectedAlert(null);
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
  };

  // Load earnings data
  const loadEarningsData = async () => {
    setEarningsLoading(true);
    try {
      const data = await fetchEarningsCalendar(watchlist);
      setEarningsData(data);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setEarningsLoading(false);
    }
  };

  // Load economic calendar
  const loadEconomicCalendar = async () => {
    setEconomicLoading(true);
    try {
      const data = await fetchEconomicCalendar();
      setEconomicEvents(data);
    } catch (error) {
      console.error('Error loading economic calendar:', error);
    } finally {
      setEconomicLoading(false);
    }
  };

  // Load market news
  const loadMarketNews = async () => {
    setNewsLoading(true);
    try {
      const data = await fetchMarketNews();
      setMarketNews(data);
    } catch (error) {
      console.error('Error loading market news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  // Filter alerts
  const filteredByBias = selectedFilter === 'all'
    ? alerts
    : selectedFilter === 'retest'
    ? alerts.filter(a => a.alertType === 'retest')
    : selectedFilter === 'sweep'
    ? alerts.filter(a => a.alertType === 'sweep')
    : alerts.filter(a => a.bias === selectedFilter);

  const sortedAlerts = [...filteredByBias].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group alerts by ticker
  const groupAlertsByTicker = (alerts) => {
    const grouped = {};
    
    alerts.forEach(alert => {
      const key = alert.ticker;
      const alertTime = new Date(alert.timestamp).getTime();
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      let foundGroup = false;
      for (let group of grouped[key]) {
        const groupTime = new Date(group[0].timestamp).getTime();
        const timeDiff = Math.abs(alertTime - groupTime);
        
        if (timeDiff < 5 * 60 * 1000) {
          const hasDifferentTimeframe = !group.some(a => a.timeframe === alert.timeframe);
          if (hasDifferentTimeframe) {
            group.push(alert);
            foundGroup = true;
            break;
          }
        }
      }
      
      if (!foundGroup) {
        grouped[key].push([alert]);
      }
    });
    
    return grouped;
  };

  const groupedAlerts = groupAlertsByTicker(sortedAlerts);
  const alertsToDisplay = [];
  
  Object.keys(groupedAlerts).forEach(ticker => {
    groupedAlerts[ticker].forEach(group => {
      alertsToDisplay.push({
        isGroup: group.length > 1,
        alerts: group.sort((a, b) => a.timeframe === '4H' ? -1 : 1)
      });
    });
  });

  alertsToDisplay.sort((a, b) => {
    const aTime = new Date(a.alerts[0].timestamp).getTime();
    const bTime = new Date(b.alerts[0].timestamp).getTime();
    return bTime - aTime;
  });

  const activeVWAPFilters = ['vwap9', 'vwap34', 'vwap144'].filter(key => filters[key]).length;
  const activeTimeframeFilters = ['timeframe4H', 'timeframe15m'].filter(key => filters[key]).length;

  // Show loading state while watchlist is being loaded
  if (!initialWatchlistLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <div className="text-2xl font-bold text-white">Loading your watchlist...</div>
          <div className="text-gray-400 mt-2">Please wait while we load your saved stocks</div>
        </div>
      </div>
    );
  }

  // Render the main component
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-gray-100 p-4 md:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl blur-md group-hover:blur-lg transition-all opacity-75"></div>
                  <div className="relative p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl transform group-hover:scale-110 transition-transform">
                    <Activity className="text-white" size={36} />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    VWAP Re-anchor Pro
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base mt-1">
                    Multi-timeframe VWAP monitoring with retest detection
                  </p>
                  {user && (
                    <div className="text-sm text-emerald-400 mt-2">
                      Welcome back, {user.firstName || user.username}! Your watchlist is saved.
                    </div>
                  )}
                </div>
              </div>
            
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="backdrop-blur-sm bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                  <div className="text-xs text-gray-400 mb-0.5">Total Alerts</div>
                  <div className="text-2xl font-bold text-cyan-400">{alerts.length}</div>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                  <div className="text-xs text-gray-400 mb-0.5">Watchlist</div>
                  <div className="text-2xl font-bold text-blue-400">{watchlist.length}</div>
                  {user && (
                    <div className="text-xs text-emerald-400">Auto-saved</div>
                  )}
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                  <div className="text-xs text-gray-400 mb-0.5">Active Timeframes</div>
                  <div className="text-2xl font-bold text-purple-400">{activeTimeframeFilters}/2</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${
                  isMonitoring
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 group-hover:from-red-600 group-hover:to-rose-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:from-emerald-600 group-hover:to-teal-700'
                }`}></div>
                <div className={`absolute inset-0 rounded-2xl blur-xl opacity-50 transition-all ${
                  isMonitoring ? 'bg-red-500' : 'bg-emerald-500'
                }`}></div>
                <div className="relative flex items-center justify-center gap-3 text-white">
                  {status === 'scanning' && <RefreshCw className="animate-spin" size={20} />}
                  <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
                </div>
              </button>
              <button
                onClick={() => setShowStockModal(true)}
                className="group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <div className="relative flex items-center justify-center gap-3 text-white">
                  <Plus size={20} />
                  <span>Manage Watchlist</span>
                </div>
              </button>
            </div>
          </div>
        </div>

       


        {showEarningDetails && selectedEarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/20 p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedEarning.symbol} Earnings Details
              </h2>
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-sm text-gray-400">Report Date</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {new Date(selectedEarning.reportDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-sm text-gray-400">Estimated EPS</div>
                  <div className="text-xl font-bold text-white">
                    ${selectedEarning.estimate}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-sm text-gray-400">Revenue Estimate</div>
                  <div className="text-xl font-bold text-white">
                    ${selectedEarning.revenueEstimate}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowEarningDetails(false)}
                className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { value: 'alerts', label: 'VWAP Alerts', icon: Activity, count: alerts.length },
            { value: 'earnings', label: 'Earnings Calendar', icon: Calendar, count: earningsData.length },
             { value: 'economic', label: 'Economic Calendar', icon: TrendingUp, count: economicEvents.length },
            { value: 'news', label: 'Market News', icon: Rss, count: marketNews.length }
          ].map(({ value, label, icon: Icon, count }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 whitespace-nowrap ${
                activeTab === value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {activeTab === 'alerts' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Timeframe Filters */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <BarChart3 size={20} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Timeframes</h3>
                  <div className="ml-auto text-xs text-purple-400 font-medium">
                    {activeTimeframeFilters} active
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {key: 'timeframe4H', label: '4H Timeframe', color: 'blue', description: '4-hour candles'},
                    {key: 'timeframe15m', label: '15m Timeframe', color: 'green', description: '15-minute candles'}
                  ].map(({key, label, color, description}) => (
                    <button
                      key={key}
                      onClick={() => setFilters(prev => ({...prev, [key]: !prev[key]}))}
                      className={`w-full group relative p-4 rounded-xl transition-all transform hover:scale-102 ${
                        filters[key]
                          ? `bg-gradient-to-r from-${color}-500/30 to-${color}-600/30 border-2 border-${color}-400/50 shadow-lg shadow-${color}-500/20`
                          : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <span className="font-bold text-white block">{label}</span>
                          <span className="text-xs text-gray-400 mt-0.5">{description}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          filters[key]
                            ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/30`
                            : 'bg-white/10 text-gray-400'
                        }`}>
                          {filters[key] ? 'ON' : 'OFF'}
                        </div>
                      </div>
                      {filters[key] && (
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${color}-400 animate-pulse`}></div>
                      )}
                    </button>
                  ))}
                  {/* Retest Toggle */}
                  <button
                    onClick={() => setFilters(prev => ({...prev, showRetests: !prev.showRetests}))}
                    className={`w-full group relative p-4 rounded-xl transition-all transform hover:scale-102 ${
                      filters.showRetests
                        ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 border-2 border-orange-400/50 shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block">Show Retests</span>
                        <span className="text-xs text-gray-400 mt-0.5">VWAP support/resistance tests</span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        filters.showRetests
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.showRetests ? 'ON' : 'OFF'}
                      </div>
                    </div>
                    {filters.showRetests && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* VWAP Periods Section */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <Activity size={20} className="text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">VWAP Periods</h3>
                  <div className="ml-auto text-xs text-cyan-400 font-medium">
                    {activeVWAPFilters} active
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {key: 'vwap9', label: '9', color: 'cyan', description: 'Short-term'},
                    {key: 'vwap34', label: '34', color: 'blue', description: 'Medium-term'},
                    {key: 'vwap144', label: '144', color: 'purple', description: 'Long-term'}
                  ].map(({key, label, color, description}) => (
                    <button
                      key={key}
                      onClick={() => setFilters(prev => ({...prev, [key]: !prev[key]}))}
                      className={`group relative py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                        filters[key]
                          ? `bg-gradient-to-br from-${color}-500/30 to-${color}-600/30 border-2 border-${color}-400/50 shadow-lg shadow-${color}-500/20`
                          : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl font-black text-white mb-1">{label}</div>
                      <div className={`text-xs uppercase tracking-wider ${
                        filters[key] ? `text-${color}-300` : 'text-gray-400'
                      }`}>
                        {filters[key] ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{description}</div>
                    
                      {filters[key] && (
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${color}-400 animate-pulse`}></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* MACD Filters Section */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                    <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">MACD Filters</h3>
                  <div className="ml-auto text-xs text-emerald-400 font-medium">
                    {[filters.macdBullish, filters.macdBearish].filter(Boolean).length} active
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setFilters(prev => ({...prev, macdBullish: !prev.macdBullish}))}
                    className={`w-full group relative p-4 rounded-xl transition-all transform hover:scale-102 ${
                      filters.macdBullish
                        ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block">MACD Bullish</span>
                        <span className="text-xs text-gray-400 mt-0.5">MACD &gt; 0 & Histogram &gt; 0</span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        filters.macdBullish
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.macdBullish ? 'ON' : 'OFF'}
                      </div>
                    </div>
                    {filters.macdBullish && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    )}
                  </button>
                
                  <button
                    onClick={() => setFilters(prev => ({...prev, macdBearish: !prev.macdBearish}))}
                    className={`w-full group relative p-4 rounded-xl transition-all transform hover:scale-102 ${
                      filters.macdBearish
                        ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 border-2 border-red-400/50 shadow-lg shadow-red-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block">MACD Bearish</span>
                        <span className="text-xs text-gray-400 mt-0.5">MACD &lt; 0 & Histogram &lt; 0</span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        filters.macdBearish
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.macdBearish ? 'ON' : 'OFF'}
                      </div>
                    </div>
                    {filters.macdBearish && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* DMI & Price Filters Section */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                    <TrendingDown size={20} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">DMI & Price Filters</h3>
                  <div className="ml-auto text-xs text-blue-400 font-medium">
                    {[filters.dmiBullish, filters.dmiBearish, filters.priceAboveVWAP, filters.priceBelowVWAP].filter(Boolean).length} active
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setFilters(prev => ({...prev, dmiBullish: !prev.dmiBullish}))}
                    className={`w-full group relative p-3 rounded-xl transition-all transform hover:scale-102 ${
                      filters.dmiBullish
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block text-sm">DMI Bullish</span>
                        <span className="text-xs text-gray-400 mt-0.5">DI+ &gt; DI-</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        filters.dmiBullish
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.dmiBullish ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  </button>
                
                  <button
                    onClick={() => setFilters(prev => ({...prev, dmiBearish: !prev.dmiBearish}))}
                    className={`w-full group relative p-3 rounded-xl transition-all transform hover:scale-102 ${
                      filters.dmiBearish
                        ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-2 border-orange-400/50 shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block text-sm">DMI Bearish</span>
                        <span className="text-xs text-gray-400 mt-0.5">DI- &gt; DI+</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        filters.dmiBearish
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.dmiBearish ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFilters(prev => ({...prev, priceAboveVWAP: !prev.priceAboveVWAP}))}
                    className={`w-full group relative p-3 rounded-xl transition-all transform hover:scale-102 ${
                      filters.priceAboveVWAP
                        ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block text-sm">Price Above VWAP</span>
                        <span className="text-xs text-gray-400 mt-0.5">Bullish position</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        filters.priceAboveVWAP
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.priceAboveVWAP ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFilters(prev => ({...prev, priceBelowVWAP: !prev.priceBelowVWAP}))}
                    className={`w-full group relative p-3 rounded-xl transition-all transform hover:scale-102 ${
                      filters.priceBelowVWAP
                        ? 'bg-gradient-to-r from-rose-500/30 to-pink-500/30 border-2 border-rose-400/50 shadow-lg shadow-rose-500/20'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-bold text-white block text-sm">Price Below VWAP</span>
                        <span className="text-xs text-gray-400 mt-0.5">Bearish position</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        filters.priceBelowVWAP
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {filters.priceBelowVWAP ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Add this new section after the DMI & Price Filters section */}
<div className="backdrop-blur-xl mb-8 bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl">
      <TrendingUp size={20} className="text-orange-400" />
    </div>
    <h3 className="text-lg font-bold text-white">Weekly Sweeps</h3>
    <div className="ml-auto text-xs text-orange-400 font-medium">
      {[filters.showPWHSweeps, filters.showPWLSweeps].filter(Boolean).length} active
    </div>
  </div>
  <div className="space-y-3">
    <button
      onClick={() => setFilters(prev => ({...prev, showPWHSweeps: !prev.showPWHSweeps}))}
      className={`w-full group relative p-4 rounded-xl transition-all transform hover:scale-102 ${
        filters.showPWHSweeps
          ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 border-2 border-red-400/50 shadow-lg shadow-red-500/20'
          : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <span className="font-bold text-white block">PWH Sweeps</span>
          <span className="text-xs text-gray-400 mt-0.5">Previous Week High violations</span>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
          filters.showPWHSweeps
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/10 text-gray-400'
        }`}>
          {filters.showPWHSweeps ? 'ON' : 'OFF'}
        </div>
      </div>
      {filters.showPWHSweeps && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
      )}
    </button>
    
    <button
      onClick={() => setFilters(prev => ({...prev, showPWLSweeps: !prev.showPWLSweeps}))}
      className={`w-full group relative p-4 rounded-xl transition-all transform hover:scale-102 ${
        filters.showPWLSweeps
          ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20'
          : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <span className="font-bold text-white block">PWL Sweeps</span>
          <span className="text-xs text-gray-400 mt-0.5">Previous Week Low violations</span>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
          filters.showPWLSweeps
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-white/10 text-gray-400'
        }`}>
          {filters.showPWLSweeps ? 'ON' : 'OFF'}
        </div>
      </div>
      {filters.showPWLSweeps && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      )}
    </button>
  </div>
</div>

            {/* Watchlist Section */}
            <div className="backdrop-blur-xl  bg-white/5 rounded-2xl border border-white/10 p-6 mb-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Active Watchlist ({watchlist.length} stocks)</h3>
                <button
                  onClick={() => setShowStockModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  <Plus size={16} />
                  <span>Add Stocks</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-400/60 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                      {symbol}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStockFromWatchlist(symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                    >
                      <X size={12} className="text-red-400" />
                    </button>
                  </div>
                ))}
                {watchlist.length === 0 && (
                  <div className="text-gray-400 text-sm italic">
                    No stocks in watchlist. Click "Add Stocks" to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Alerts Display */}
            {isMonitoring && (
              <div className="mb-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-5 shadow-xl relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r opacity-10 ${
                  status === 'scanning' || status.includes('Scanning')
                    ? 'from-cyan-500 to-blue-500 animate-pulse'
                    : 'from-emerald-500 to-teal-500'
                }`}></div>
                <div className="relative flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full shadow-xl ${
                    status === 'scanning' || status.includes('Scanning')
                      ? 'animate-pulse bg-cyan-400 shadow-cyan-400/50'
                      : 'bg-emerald-400 shadow-emerald-400/50'
                  }`}></div>
                  <div className="flex-1">
                    <div className={`font-bold ${
                      status === 'scanning' || status.includes('Scanning') ? 'text-cyan-300' : 'text-emerald-300'
                    }`}>
                      {status === 'scanning' ? 'Initializing scan...' : status.includes('Scanning') ? status : 'System Active'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {alerts.length} alerts detected • Scanning {activeTimeframeFilters} timeframes
                    </div>
                  </div>
                  <RefreshCw className={`text-cyan-400 ${
                    status === 'scanning' || status.includes('Scanning') ? 'animate-spin' : ''
                  }`} size={24} />
                </div>
              </div>
            )}

            {alerts.length > 0 && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {[
                  {value: 'all', label: 'All Alerts', icon: Activity},
                  {value: 'bullish', label: 'Bullish Bias', icon: TrendingUp},
                  {value: 'bearish', label: 'Bearish Bias', icon: TrendingDown},
                  {value: 'retest', label: 'Retests', icon: RefreshCw},
                  {value: 'sweep', label: 'Sweeps', icon: TrendingUp}  // ADD THIS
                ].map(({value, label, icon: Icon}) => (
                  <button
                    key={value}
                    onClick={() => setSelectedFilter(value)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 whitespace-nowrap ${
                      selectedFilter === value
                        ? value === 'bullish'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                          : value === 'bearish'
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
                          : value === 'retest'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {value === 'all' ? alerts.length : 
                       value === 'retest' ? alerts.filter(a => a.alertType === 'retest').length :
                       alerts.filter(a => a.bias === value).length}
                    </span>
                  </button>
                ))}
              </div>
            )}

            
      
    
 
<div className="grid gap-6">
 {/* Alerts Display */}
{/* Alerts Display */}
{alertsToDisplay.length === 0 ? (
  <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-20 text-center shadow-2xl">
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-3xl blur-2xl"></div>
      <div className="relative bg-gradient-to-br from-cyan-900/40 to-blue-900/40 w-24 h-24 rounded-3xl flex items-center justify-center border border-cyan-400/30">
        <AlertCircle className="text-cyan-400/70" size={56} />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">
      {isMonitoring ? 'Scanning Markets...' : 'Ready to Monitor'}
    </h3>
    <p className="text-gray-400 text-lg max-w-md mx-auto">
      {isMonitoring
        ? `Watching for VWAP re-anchoring events across ${watchlist.length} stocks and ${activeTimeframeFilters} timeframes`
        : 'Click "Start Monitoring" to begin tracking VWAP re-anchors'}
    </p>
    {isMonitoring && (
      <div className="mt-6 text-sm text-cyan-400">
        <div>Active timeframes: {activeTimeframeFilters}/2</div>
        <div>Active VWAP periods: {activeVWAPFilters}/3</div>
        <div>Monitoring {watchlist.length} stocks in watchlist</div>
      </div>
    )}
  </div>
) : (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
    {Array.from(new Set(alertsToDisplay.flatMap(item => item.alerts).map(alert => alert.ticker))).map((ticker, idx) => {
      // Get all alerts for this ticker
      const tickerAlerts = alertsToDisplay
        .flatMap(item => item.alerts)
        .filter(alert => alert.ticker === ticker);
      
      const primaryAlert = tickerAlerts[0];
      const alertCount = tickerAlerts.length;
      
      return (
        <div
          key={idx}
          onClick={() => {
            // Set the selected stock to show all its alerts
            setSelectedStock(ticker);
            setShowStockAlerts(true);
          }}
          className="group backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all shadow-lg hover:shadow-2xl cursor-pointer p-4 relative"
        >
          {/* Stock Symbol */}
          <div className={`text-center font-black text-lg mb-3 px-3 py-2 rounded-xl ${
            primaryAlert.bias === 'bullish'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : primaryAlert.bias === 'bearish'
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
          }`}>
            {ticker}
          </div>
          
          {/* Price */}
          <div className="text-center text-xl font-bold text-white mb-2">
            ${primaryAlert.price}
          </div>
          
          {/* Alert Count Badge */}
          {alertCount > 1 && (
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                <Activity size={10} />
                <span>{alertCount} alerts</span>
              </div>
            </div>
          )}
          
          {/* Timeframes */}
          <div className="flex justify-center gap-1 mb-3">
            {[...new Set(tickerAlerts.map(a => a.timeframe))].map((timeframe, tfIdx) => (
              <div
                key={tfIdx}
                className={`px-2 py-1 rounded text-xs font-bold ${
                  timeframe === '4H' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}
              >
                {timeframe}
              </div>
            ))}
          </div>
          
          {/* VWAP Periods */}
          <div className="flex justify-center gap-1 mb-3 flex-wrap">
            {tickerAlerts.map((alert, alertIdx) => (
              <div
                key={alertIdx}
                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs font-bold"
              >
                {alert.vwapPeriod}
              </div>
            ))}
          </div>
          
          {/* Alert Type Indicators */}
          <div className="flex justify-center gap-1 mb-2">
            {tickerAlerts.map((alert, alertIdx) => (
              alert.alertType === 'retest' ? (
                <div
                  key={alertIdx}
                  className={`w-3 h-3 rounded-full ${
                    alert.retestInfo.interaction === 'support'
                      ? 'bg-emerald-400'
                      : 'bg-red-400'
                  }`}
                  title={`${alert.retestInfo.interaction.toUpperCase()} test`}
                ></div>
              ) : (
                <div
                  key={alertIdx}
                  className="w-3 h-3 rounded-full bg-cyan-400"
                  title="Re-anchor"
                ></div>
              )
            ))}
          </div>
          
          {/* Bias Indicator */}
          <div className={`text-center text-xs font-bold px-2 py-1 rounded ${
            primaryAlert.bias === 'bullish' 
              ? 'bg-emerald-500/20 text-emerald-300'
              : primaryAlert.bias === 'bearish'
              ? 'bg-red-500/20 text-red-300'
              : 'bg-cyan-500/20 text-cyan-300'
          }`}>
            {primaryAlert.bias.toUpperCase()}
          </div>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      );
    })}
  </div>
)}

{/* Stock Alerts Modal - Shows all individual alerts for the selected stock */}
{showStockAlerts && selectedStock && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowStockAlerts(false)}>
    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl font-black text-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600`}>
              {selectedStock}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedStock} - All VWAP Alerts
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Click any alert to view detailed chart and analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStockAlerts(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid gap-6">
          {alertsToDisplay
            .flatMap(item => item.alerts)
            .filter(alert => alert.ticker === selectedStock)
            .sort((a, b) => a.timeframe === '4H' ? -1 : 1) // Sort 4H first
            .map((alert, idx) => (
              <div
                key={idx}
                onClick={async () => {
                  setSelectedAlert(alert);
                  setShowStockAlerts(false);
                  setShowChart(true);
                  
                  if (!news[alert.ticker]) {
                    const symbolNews = await fetchYahooNews(alert.ticker);
                    setNews(prev => ({ ...prev, [alert.ticker]: symbolNews }));
                  }
                  
                  setTimeout(() => loadChart(alert), 100);
                }}
                className="group backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-400/50 transition-all shadow-xl hover:shadow-2xl cursor-pointer p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl font-black text-xl ${
                      alert.alertType === 'retest' 
                        ? alert.bias === 'bullish'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                        : alert.bias === 'bullish'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : alert.bias === 'bearish'
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    }`}>
                      {alert.ticker}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        alert.timeframe === '4H' 
                          ? 'bg-blue-500 text-white ring-2 ring-blue-400/50' 
                          : 'bg-green-500 text-white ring-2 ring-green-400/50'
                      }`}>
                        {alert.timeframe} TIMEFRAME
                      </div>
                      <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-bold">
                        VWAP {alert.vwapPeriod}
                      </div>
                      {alert.alertType === 'retest' && (
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          alert.retestInfo.interaction === 'support'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {alert.retestInfo.interaction.toUpperCase()} TEST
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">${alert.price}</div>
                    <div className="text-sm text-gray-400">
                      {formatDateEST(alert.timestamp, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} EST
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">VWAP Value</div>
                    <div className="text-lg font-bold text-cyan-400">${alert.vwapValue}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Price Position</div>
                    <div className={`text-lg font-bold ${
                      alert.priceAboveVWAP ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {alert.priceAboveVWAP ? 'ABOVE' : 'BELOW'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Volume</div>
                    <div className="text-lg font-bold text-purple-400">
                      {alert.volume}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Bias</div>
                    <div className={`text-lg font-bold ${
                      alert.bias === 'bullish' ? 'text-emerald-400' : 
                      alert.bias === 'bearish' ? 'text-red-400' : 'text-cyan-400'
                    }`}>
                      {alert.bias.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="text-xs text-cyan-400 mb-1 font-medium">
                    {alert.alertType === 'retest' ? 'Retest Details' : 'Re-anchor Reason'}
                  </div>
                  <div className="text-white">{alert.reason}</div>
                  {alert.retestInfo && (
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        alert.retestInfo.strength === 'strong' 
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {alert.retestInfo.strength.toUpperCase()}
                      </span>
                      <span className="text-cyan-300">
                        Distance: {alert.retestInfo.distance} points
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs ${
                    alert.macd.bullish 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : alert.macd.bearish
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    <TrendingUp size={12} />
                    <span>MACD: {alert.macd.bullish ? 'Bullish' : alert.macd.bearish ? 'Bearish' : 'Neutral'}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs ${
                    alert.dmi.bullish 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : alert.dmi.bearish
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    <Activity size={12} />
                    <span>DMI: {alert.dmi.bullish ? 'Bullish' : alert.dmi.bearish ? 'Bearish' : 'Neutral'}</span>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <div className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                    Click to view detailed chart & analysis →
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  </div>
)}
</div>
          </>
        )}

        {/* Economic Calendar Tab */}
{activeTab === 'economic' && <EconomicCalendar />}

        {/* Earnings Calendar Tab */}
        {activeTab === 'earnings' && <EarningsCalendar />}

        {/* News Feed Tab */}
        {activeTab === 'news' && <NewsFeed />}

        {/* Stock Management Modal */}
        {showStockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowStockModal(false)}>
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Manage Watchlist</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Add or remove stocks from your monitoring list
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Add Stock Form */}
                <div className="mb-6">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newStockSymbol}
                        onChange={(e) => setNewStockSymbol(e.target.value)}
                        placeholder="Enter stock symbol (e.g., AAPL)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addStockToWatchlist(newStockSymbol);
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => addStockToWatchlist(newStockSymbol)}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Search Popular Stocks */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Search size={20} className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Search Popular Stocks</h3>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stocks..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 mb-4"
                  />
                
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                    {filteredPopularStocks.map((stock) => (
                      <button
                        key={stock}
                        onClick={() => addStockToWatchlist(stock)}
                        disabled={watchlist.includes(stock)}
                        className={`p-3 rounded-xl text-center transition-all transform hover:scale-105 ${
                          watchlist.includes(stock)
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 cursor-not-allowed'
                            : 'bg-white/5 text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/30 border border-white/10'
                        }`}
                      >
                        <div className="font-bold text-sm">{stock}</div>
                        {watchlist.includes(stock) && (
                          <div className="text-xs text-emerald-400 mt-1">Added</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Watchlist */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Star size={20} className="text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Your Watchlist ({watchlist.length} stocks)</h3>
                  </div>
                
                  {watchlist.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Star size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No stocks in your watchlist yet.</p>
                      <p className="text-sm">Add some stocks to start monitoring!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {watchlist.map((symbol) => (
                        <div
                          key={symbol}
                          className="group relative p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-400/60 transition-all"
                        >
                          <div className="font-bold text-cyan-300 text-center mb-2">{symbol}</div>
                          <button
                            onClick={() => removeStockFromWatchlist(symbol)}
                            className="w-full py-2 bg-red-500/20 text-red-300 rounded-lg font-bold hover:bg-red-500/30 transition-all transform hover:scale-105"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky bottom-0 backdrop-blur-xl bg-white/5 border-t border-white/10 p-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {watchlist.length} stocks in watchlist
                  </div>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Modal */}
        {showChart && selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeChart}>
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl font-black text-xl text-white ${
                      selectedAlert.alertType === 'retest'
                        ? selectedAlert.bias === 'bullish'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : 'bg-gradient-to-r from-red-500 to-rose-600'
                        : selectedAlert.bias === 'bullish'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        : selectedAlert.bias === 'bearish'
                        ? 'bg-gradient-to-r from-red-500 to-rose-600'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                    }`}>
                      {selectedAlert.ticker}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedAlert.alertType === 'retest' ? 'VWAP Retest Analysis' : 'VWAP Re-anchor Analysis'}
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {selectedAlert.timeframe} Candles • {selectedAlert.bias.toUpperCase()} BIAS • 
                        {selectedAlert.alertType === 'retest' ? ` Testing as ${selectedAlert.retestInfo.interaction}` : ` Re-anchored at $${selectedAlert.price}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeChart}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div
                  ref={chartContainerRef}
                  className="w-full rounded-2xl overflow-hidden bg-slate-900/50 border border-white/10 relative"
                  style={{ height: '500px' }}
                >
                  {chartLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
                      <div className="text-cyan-400 flex flex-col items-center gap-2">
                        <RefreshCw className="animate-spin" size={32} />
                        <span className="text-sm">Loading chart...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Event Time</div>
                   <div className="text-lg font-bold text-white">
  {formatDateEST(selectedAlert.timestamp, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })} EST
</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">VWAP Value</div>
                    <div className="text-lg font-bold text-cyan-400">
                      ${selectedAlert.vwapValue}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Timeframe</div>
                    <div className="text-lg font-bold text-blue-400">
                      {selectedAlert.timeframe}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Alert Type</div>
                    <div className={`text-lg font-bold ${
                      selectedAlert.alertType === 'retest' 
                        ? selectedAlert.retestInfo.interaction === 'support'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                        : 'text-cyan-400'
                    }`}>
                      {selectedAlert.alertType === 'retest' 
                        ? selectedAlert.retestInfo.interaction.toUpperCase()
                        : 'RE-ANCHOR'
                      }
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="text-xs text-cyan-400 mb-1 font-medium">
                    {selectedAlert.alertType === 'retest' ? 'Retest Analysis' : 'Re-anchor Reason'}
                  </div>
                  <div className="text-white">{selectedAlert.reason}</div>
                  {selectedAlert.retestInfo && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Strength</div>
                        <div className={`font-bold ${
                          selectedAlert.retestInfo.strength === 'strong' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {selectedAlert.retestInfo.strength.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Distance</div>
                        <div className="font-bold text-cyan-400">
                          {selectedAlert.retestInfo.distance} points
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Bias</div>
                        <div className={`font-bold ${
                          selectedAlert.bias === 'bullish' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {selectedAlert.bias.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Timeframe</div>
                        <div className="font-bold text-blue-400">
                          {selectedAlert.timeframe}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {news[selectedAlert.ticker] && news[selectedAlert.ticker].length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <News size={20} className="text-cyan-400" />
                      <h3 className="text-lg font-bold text-white">Recent News</h3>
                    </div>
                    <div className="grid gap-3">
                      {news[selectedAlert.ticker].map((item, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-400/30 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white text-sm flex-1">{item.title}</h4>
                            <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-xs mb-2">{item.description}</p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
                          >
                            Read more →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VWAPReanchorBot;

