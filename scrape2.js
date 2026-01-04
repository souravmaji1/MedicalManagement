const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class EbayCarScraper {
  constructor() {
    this.baseUrl = 'https://www.ebay.com';
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Stealth settings to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Evade automation detection
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    console.log('Browser initialized with stealth mode');
  }

  async scrapeAllCategories(options = {}) {
    const {
      query = '',
      minPrice = null,
      maxPrice = null,
      minYear = null,
      maxYear = null,
      maxResults = 100
    } = options;

    if (!this.browser) await this.init();

    try {
      // Try multiple eBay Motors category URLs
      const categoryUrls = [
        'https://www.ebay.com/b/Cars-Trucks/6001/bn_1865115',
        'https://www.ebay.com/b/Cars-Trucks/6001/bn_1865116', 
        'https://www.ebay.com/b/Autos/6001/bn_1865117',
        'https://www.ebay.com/sch/Cars-Trucks/6001/i.html'
      ];

      let allListings = [];

      for (const categoryUrl of categoryUrls) {
        console.log(`Trying category: ${categoryUrl}`);
        
        try {
          const listings = await this.scrapeCategory(categoryUrl, options);
          allListings = allListings.concat(listings);
          
          if (allListings.length >= maxResults) {
            allListings = allListings.slice(0, maxResults);
            break;
          }
        } catch (error) {
          console.log(`Failed to scrape ${categoryUrl}: ${error.message}`);
          continue;
        }
      }

      return allListings;

    } catch (error) {
      console.error('Category scraping error:', error.message);
      throw error;
    }
  }

  async scrapeCategory(categoryUrl, options = {}) {
    const {
      query = '',
      minPrice = null,
      maxPrice = null,
      minYear = null,
      maxYear = null
    } = options;

    try {
      // Build search URL with parameters
      let searchUrl = categoryUrl;
      
      if (query || minPrice || maxPrice) {
        const params = new URLSearchParams();
        if (query) params.append('_nkw', query);
        if (minPrice) params.append('_udlo', minPrice);
        if (maxPrice) params.append('_udhi', maxPrice);
        
        searchUrl += (categoryUrl.includes('?') ? '&' : '?') + params.toString();
      }

      console.log(`Navigating to: ${searchUrl}`);
      await this.page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay(3000);

      // Check if we got blocked or got a different page
      const pageTitle = await this.page.title();
      if (pageTitle.includes('Access Denied') || pageTitle.includes('Security Measure')) {
        throw new Error('eBay blocked the request');
      }

      // Take screenshot for debugging
      await this.page.screenshot({ path: 'ebay_debug.png', fullPage: true });

      // Try multiple listing selectors for different eBay layouts
      const listings = await this.page.evaluate(() => {
        const results = [];
        
        // Multiple possible selectors for eBay listings
        const selectors = [
          '.s-item',
          '.srp-results .s-item',
          '[data-viewport*="item"]',
          '.srp-river-results .s-item',
          '.b-list__items_nofooter .s-item',
          '.srp-results .s-item__wrapper'
        ];

        let items = [];
        for (const selector of selectors) {
          items = document.querySelectorAll(selector);
          if (items.length > 0) {
            console.log(`Found ${items.length} items with selector: ${selector}`);
            break;
          }
        }

        // If no items found with standard selectors, try to find any repeating elements
        if (items.length === 0) {
          const allDivs = document.querySelectorAll('div[class*="item"]');
          console.log(`Trying fallback: ${allDivs.length} divs with "item" in class`);
          items = allDivs;
        }

        items.forEach((item, index) => {
          if (index > 50) return; // Limit for performance

          try {
            // Get all text content
            const fullText = item.textContent || item.innerText || '';
            
            // Skip if it's clearly not a listing
            if (fullText.length < 20 || fullText.includes('ebay') || fullText.includes('copyright')) {
              return;
            }

            // Try to find title
            let title = '';
            const titleSelectors = [
              '.s-item__title',
              '.s-item__title span',
              '[role="heading"]',
              'h3',
              '.s-item__info h3'
            ];
            
            for (const selector of titleSelectors) {
              const titleEl = item.querySelector(selector);
              if (titleEl) {
                title = titleEl.textContent.trim();
                if (title && !title.includes('ebay') && title.length > 5) break;
              }
            }

            // Try to find price
            let price = '';
            const priceSelectors = [
              '.s-item__price',
              '.s-item__detail .s-item__price',
              '.s-item__price span',
              '.s-item__details .s-item__price'
            ];
            
            for (const selector of priceSelectors) {
              const priceEl = item.querySelector(selector);
              if (priceEl) {
                price = priceEl.textContent.trim();
                if (price && price.includes('$')) break;
              }
            }

            // Try to find URL
            let url = '';
            const linkSelectors = [
              '.s-item__link',
              'a.s-item__link',
              'a[href*="itm"]',
              'a[href*="ebay.com/itm"]'
            ];
            
            for (const selector of linkSelectors) {
              const linkEl = item.querySelector(selector);
              if (linkEl && linkEl.href) {
                url = linkEl.href;
                if (url.includes('ebay.com/itm')) break;
              }
            }

            // Try to find image
            let image = '';
            const imgSelectors = [
              '.s-item__image-img',
              'img.s-item__image-img',
              '.s-item__image img',
              'img[src*="ebay"]'
            ];
            
            for (const selector of imgSelectors) {
              const imgEl = item.querySelector(selector);
              if (imgEl) {
                image = imgEl.src || imgEl.getAttribute('data-src') || '';
                if (image) break;
              }
            }

            // Extract vehicle info from title
            let year = '';
            let mileage = '';
            let makeModel = '';

            if (title) {
              // Extract year (typically at beginning)
              const yearMatch = title.match(/\b(19|20)\d{2}\b/);
              if (yearMatch) year = yearMatch[0];

              // Extract mileage
              const mileageMatch = title.match(/([\d,]+)\s*(?:mi|miles|k\s*mi)/i);
              if (mileageMatch) mileage = mileageMatch[1];

              // Try to extract make/model
              const commonMakes = ['toyota', 'honda', 'ford', 'chevrolet', 'chev', 'nissan', 'bmw', 'mercedes', 'audi', 'hyundai', 'kia', 'volkswagen', 'vw', 'subaru', 'mazda', 'lexus', 'acura', 'infiniti', 'buick', 'cadillac', 'chrysler', 'dodge', 'jeep', 'ram', 'gmc'];
              
              for (const make of commonMakes) {
                if (title.toLowerCase().includes(make)) {
                  const words = title.toLowerCase().split(' ');
                  const makeIndex = words.indexOf(make);
                  if (makeIndex !== -1 && words[makeIndex + 1]) {
                    makeModel = `${make} ${words[makeIndex + 1]}`;
                    break;
                  }
                }
              }
            }

            // Only add if we have meaningful data
            if (title && title.length > 5 && !title.includes('Shop on eBay') && !title.includes('ebay.com')) {
              results.push({
                id: url ? url.split('/').pop().split('?')[0] : `item-${index}`,
                title: title,
                price: price || 'Price not listed',
                url: url || '',
                image: image || '',
                year: year,
                mileage: mileage,
                makeModel: makeModel,
                rawText: fullText.substring(0, 200)
              });
            }

          } catch (err) {
            console.error('Error parsing item:', err);
          }
        });

        return results;
      });

      console.log(`Found ${listings.length} listings from this category`);
      return listings;

    } catch (error) {
      console.error(`Error scraping category ${categoryUrl}:`, error.message);
      return [];
    }
  }

  // Alternative method: Use eBay's search directly with simpler approach
  async scrapeWithSimpleSearch(options = {}) {
    const {
      query = 'cars',
      minPrice = null,
      maxPrice = null,
      maxResults = 50
    } = options;

    if (!this.browser) await this.init();

    try {
      // Simple search approach
      let searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
      
      if (minPrice) searchUrl += `&_udlo=${minPrice}`;
      if (maxPrice) searchUrl += `&_udhi=${maxPrice}`;
      
      searchUrl += '&_sacat=6001&_ipg=200&_sop=12';

      console.log(`Using simple search: ${searchUrl}`);
      await this.page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay(5000);

      // Wait for any dynamic content
      await this.page.waitForFunction(() => document.body.innerText.length > 1000, { timeout: 10000 });

      const listings = await this.page.evaluate((max) => {
        const results = [];
        
        // Look for any elements that look like listings
        const potentialItems = document.querySelectorAll('li, div[class*="item"], div[class*="card"]');
        
        potentialItems.forEach((item, index) => {
          if (results.length >= max) return;
          
          const text = item.textContent || '';
          
          // Basic heuristics to identify car listings
          const hasPrice = text.includes('$') && (text.includes('bid') || text.includes('buy') || text.match(/\$\d{3,}/));
          const hasCarTerms = text.match(/(car|truck|suv|vehicle|auto|mile|mi |vin|engine|transmission)/i);
          const hasYear = text.match(/\b(19|20)\d{2}\b/);
          
          if ((hasPrice && hasCarTerms) || (hasPrice && hasYear)) {
            // Extract basic info
            const titleMatch = text.match(/.{20,100}/)?.[0] || 'Unknown Title';
            const priceMatch = text.match(/\$[\d,]+/)?.[0] || 'Price unknown';
            
            // Find URL
            let url = '';
            const link = item.querySelector('a[href*="itm"]');
            if (link) url = link.href;
            
            results.push({
              id: url ? url.split('/').pop() : `item-${index}`,
              title: titleMatch.trim(),
              price: priceMatch,
              url: url,
              rawText: text.substring(0, 300)
            });
          }
        });
        
        return results;
      }, maxResults);

      console.log(`Found ${listings.length} listings with simple search`);
      return listings;

    } catch (error) {
      console.error('Simple search error:', error.message);
      throw error;
    }
  }

  // Method to scrape from multiple sources
  async scrapeComprehensive(options = {}) {
    console.log('Starting comprehensive eBay car search...');
    
    const allListings = [];
    
    // Try multiple approaches
    try {
      console.log('\n1. Trying category-based search...');
      const categoryResults = await this.scrapeAllCategories(options);
      allListings.push(...categoryResults);
      console.log(`Category search found: ${categoryResults.length} listings`);
    } catch (error) {
      console.log('Category search failed:', error.message);
    }
    
    try {
      console.log('\n2. Trying simple search approach...');
      const simpleResults = await this.scrapeWithSimpleSearch(options);
      allListings.push(...simpleResults);
      console.log(`Simple search found: ${simpleResults.length} listings`);
    } catch (error) {
      console.log('Simple search failed:', error.message);
    }
    
    // Remove duplicates based on URL
    const uniqueListings = allListings.filter((listing, index, self) => 
      index === self.findIndex(l => l.url === listing.url)
    );
    
    console.log(`\nTotal unique listings found: ${uniqueListings.length}`);
    return uniqueListings.slice(0, options.maxResults || 100);
  }

  async saveToJson(data, filename = 'ebay_cars.json') {
    try {
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`✅ Data saved to ${filename}`);
    } catch (error) {
      console.error('Save error:', error.message);
      throw error;
    }
  }

  async saveToCsv(data, filename = 'ebay_cars.csv') {
    try {
      if (data.length === 0) {
        console.log('No data to save');
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(val => {
          const str = String(val || '');
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',')
      );

      const csv = [headers, ...rows].join('\n');
      await fs.writeFile(filename, csv);
      console.log(`✅ Data saved to ${filename}`);
    } catch (error) {
      console.error('CSV save error:', error.message);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed');
    }
  }
}

// Enhanced main function with multiple fallbacks
async function main() {
  const scraper = new EbayCarScraper();

  try {
    await scraper.init();

    console.log('🚗 Starting comprehensive eBay car search...\n');

    // Use comprehensive search that tries multiple methods
    const listings = await scraper.scrapeComprehensive({
      query: 'toyota camry',
      minPrice: 5000,
      maxPrice: 30000,
      minYear: 2010,
      maxResults: 50
    });

    console.log(`\n✅ Final result: Found ${listings.length} car listings`);
    
    if (listings.length > 0) {
      console.log('\n📋 Sample listings:');
      listings.slice(0, 5).forEach((listing, i) => {
        console.log(`\n${i + 1}. ${listing.title}`);
        console.log(`   Price: ${listing.price}`);
        console.log(`   URL: ${listing.url ? listing.url.substring(0, 80) + '...' : 'No URL'}`);
      });

      // Save results
      await scraper.saveToJson(listings, 'ebay_cars_comprehensive.json');
      await scraper.saveToCsv(listings, 'ebay_cars_comprehensive.csv');
      
      console.log(`\n💾 Saved ${listings.length} listings to files`);
      
      // Show statistics
      const withPrices = listings.filter(l => l.price && l.price !== 'Price not listed');
      const withUrls = listings.filter(l => l.url);
      
      console.log(`\n📊 Statistics:`);
      console.log(`   - Listings with prices: ${withPrices.length}`);
      console.log(`   - Listings with URLs: ${withUrls.length}`);
      console.log(`   - Average title length: ${(listings.reduce((sum, l) => sum + l.title.length, 0) / listings.length).toFixed(0)} chars`);
      
    } else {
      console.log('\n❌ No listings found. This could be due to:');
      console.log('   - eBay blocking the scraper');
      console.log('   - Network issues');
      console.log('   - Changes in eBay website structure');
      console.log('\n💡 Try running with headless: false to see what the browser displays');
    }

  } catch (error) {
    console.error('❌ Comprehensive scraping error:', error);
  } finally {
    await scraper.close();
  }
}

// Run the enhanced scraper
main();