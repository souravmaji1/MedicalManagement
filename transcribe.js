const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class EbayCarScraper {
  constructor(country = 'com') {
    this.baseUrl = `https://www.ebay.${country}`;
    this.searchUrl = `${this.baseUrl}/b/Cars-Trucks/6001/bn_1865117`;
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Browser initialized');
  }

  async scrape(options = {}) {
    const {
      query = '',
      minPrice = null,
      maxPrice = null,
      minYear = null,
      maxYear = null,
      condition = null,
      maxResults = 50,
      maxPages = 1,
      screenshot = false
    } = options;

    if (!this.browser) await this.init();

    try {
      let allListings = [];
      
      for (let page = 1; page <= maxPages; page++) {
        console.log(`\n--- Scraping page ${page} of ${maxPages} ---`);
        
        const params = new URLSearchParams();
        
        if (query) params.append('_nkw', query);
        if (minPrice) params.append('_udlo', minPrice);
        if (maxPrice) params.append('_udhi', maxPrice);
        params.append('_pgn', page.toString());
        params.append('_sop', '12');
        
        if (condition === 'new') params.append('LH_ItemCondition', '1000');
        if (condition === 'used') params.append('LH_ItemCondition', '3000');

        const url = `${this.searchUrl}?${params.toString()}`;
        console.log(`Navigating to: ${url}`);

        await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await this.delay(5000); // Increased delay

        // Debug: Check what's on the page
        const pageContent = await this.page.content();
        await fs.writeFile(`debug_page_${page}.html`, pageContent);
        console.log(`Saved page content to debug_page_${page}.html`);

        if (screenshot && page === 1) {
          await this.page.screenshot({ path: `ebay_search_page_${page}.png`, fullPage: true });
          console.log('Screenshot saved');
        }

        // First, let's see what selectors are available
        const availableSelectors = await this.page.evaluate(() => {
          const selectors = {};
          
          // Check for common eBay listing containers
          selectors.sItem = document.querySelectorAll('.s-item').length;
          selectors.srpResults = document.querySelectorAll('.srp-results .s-item').length;
          selectors.liWithDataView = document.querySelectorAll('li[data-view]').length;
          selectors.liWithView = document.querySelectorAll('li[data-viewport]').length;
          
          // Check for any elements that might contain listings
          const allLis = document.querySelectorAll('li');
          selectors.allLis = allLis.length;
          
          // Look for elements containing car data
          const elementsWithCarData = Array.from(document.querySelectorAll('*'))
            .filter(el => {
              const text = el.textContent || '';
              return text.includes('$') && (text.includes('mile') || text.includes('mi') || text.includes('km'));
            }).length;
          selectors.elementsWithCarData = elementsWithCarData;
          
          return selectors;
        });

        console.log('Available selectors:', availableSelectors);

        // Try multiple selector strategies
        const listings = await this.page.evaluate((max, minYear, maxYear) => {
          const results = [];
          
          // Strategy 1: Standard eBay selectors
          let items = [];
          
          // Try multiple possible selectors for listing items
          const possibleSelectors = [
            '.s-item',
            '.srp-results .s-item',
            'li.s-item',
            '[data-view]',
            '[data-viewport]',
            '.s-item__wrapper',
            '.srp-results > li',
            '.b-list__items_nofooter > li'
          ];
          
          for (const selector of possibleSelectors) {
            const found = document.querySelectorAll(selector);
            if (found.length > 0) {
              console.log(`Found ${found.length} items with selector: ${selector}`);
              items = Array.from(found);
              break;
            }
          }
          
          // If no items found with specific selectors, try to find any elements that look like listings
          if (items.length === 0) {
            console.log('Trying fallback selector strategy...');
            const allElements = document.querySelectorAll('*');
            items = Array.from(allElements).filter(el => {
              const text = el.textContent || '';
              const hasPrice = /\$\d+/.test(text);
              const hasCarTerms = /(mile|mi|km|year|ford|toyota|honda|bmw|mercedes)/i.test(text);
              return hasPrice && hasCarTerms && text.length < 1000;
            });
            console.log(`Found ${items.length} potential items with fallback strategy`);
          }

          console.log(`Total items to process: ${items.length}`);

          items.forEach((item, i) => {
            if (results.length >= max) return;

            try {
              const fullText = item.textContent || '';
              
              // Skip if it's clearly not a listing
              if (fullText.includes('Shop on eBay') || 
                  fullText.includes('eBay Motors') || 
                  fullText.length < 50) {
                return;
              }

              // Title - try multiple selectors
              let title = '';
              const titleSelectors = [
                '.s-item__title',
                '.s-item__title span',
                'h3',
                '.s-item__info h3',
                '[class*="title"]',
                '[class*="item__title"]'
              ];
              
              for (const selector of titleSelectors) {
                const titleEl = item.querySelector(selector);
                if (titleEl) {
                  title = titleEl.textContent.trim();
                  if (title && !title.includes('Shop on eBay')) break;
                }
              }
              
              // If no title found, try to extract from text content
              if (!title) {
                const lines = fullText.split('\n').filter(line => line.trim().length > 10);
                if (lines.length > 0) {
                  title = lines[0].trim().substring(0, 100);
                }
              }

              if (!title) return;

              // URL
              let url = '';
              const linkSelectors = [
                '.s-item__link',
                'a[href*="/itm/"]',
                'a'
              ];
              
              for (const selector of linkSelectors) {
                const linkEl = item.querySelector(selector);
                if (linkEl && linkEl.href && linkEl.href.includes('/itm/')) {
                  url = linkEl.href;
                  break;
                }
              }

              // Price
              let price = '';
              const priceSelectors = [
                '.s-item__price',
                '.s-item__detail--primary',
                '[class*="price"]',
                '.s-item__price span'
              ];
              
              for (const selector of priceSelectors) {
                const priceEl = item.querySelector(selector);
                if (priceEl) {
                  price = priceEl.textContent.trim();
                  if (price && price.includes('$')) break;
                }
              }

              // Extract price from text if not found
              if (!price) {
                const priceMatch = fullText.match(/\$\d+[\d,.]*/);
                if (priceMatch) price = priceMatch[0];
              }

              // Year
              let year = null;
              const yearMatch = title.match(/\b(19|20)\d{2}\b/);
              if (yearMatch) {
                year = parseInt(yearMatch[0]);
              }

              // Apply year filter if specified
              if (minYear || maxYear) {
                if (!year) return;
                if (minYear && year < minYear) return;
                if (maxYear && year > maxYear) return;
              }

              // Mileage
              let mileage = '';
              const mileagePattern = /([\d,]+)\s*(miles?|mi|km)/i;
              const mileageMatch = fullText.match(mileagePattern);
              if (mileageMatch) {
                mileage = mileageMatch[0];
              }

              // Location
              let location = '';
              const locationSelectors = [
                '.s-item__location',
                '.s-item__itemLocation',
                '[class*="location"]'
              ];
              
              for (const selector of locationSelectors) {
                const locationEl = item.querySelector(selector);
                if (locationEl) {
                  location = locationEl.textContent.trim();
                  break;
                }
              }

              // Image
              let image = '';
              const imgSelectors = [
                '.s-item__image-img',
                'img',
                '.s-item__image img'
              ];
              
              for (const selector of imgSelectors) {
                const imgEl = item.querySelector(selector);
                if (imgEl) {
                  image = imgEl.src || imgEl.getAttribute('data-src') || '';
                  if (image) break;
                }
              }

              // ID from URL
              let id = '';
              if (url) {
                const idMatch = url.match(/\/itm\/(\d+)/);
                if (idMatch) id = idMatch[1];
              }

              const listing = {
                id,
                title: title.substring(0, 200),
                url,
                price,
                year,
                mileage,
                location,
                image,
                fullText: fullText.substring(0, 500) // For debugging
              };

              results.push(listing);
              
            } catch (err) {
              console.error(`Error parsing item ${i}:`, err.message);
            }
          });

          return results;
        }, maxResults, minYear, maxYear);

        console.log(`Found ${listings.length} listings on page ${page}`);
        
        if (listings.length > 0) {
          allListings = allListings.concat(listings);
          console.log('Sample listing:', listings[0]);
        } else {
          console.log('No listings found with current selectors');
          
          // Try alternative approach - search for any text that looks like car listings
          const alternativeResults = await this.page.evaluate(() => {
            const results = [];
            const textNodes = document.evaluate(
              '//text()[contains(., "$") and (contains(., "mile") or contains(., "mi") or contains(., "km"))]',
              document,
              null,
              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
              null
            );
            
            for (let i = 0; i < Math.min(textNodes.snapshotLength, 10); i++) {
              const node = textNodes.snapshotItem(i);
              const parent = node.parentElement;
              if (parent) {
                const text = parent.textContent?.substring(0, 200) || '';
                results.push({
                  text: text,
                  html: parent.outerHTML.substring(0, 300)
                });
              }
            }
            return results;
          });
          
          console.log('Alternative results found:', alternativeResults.length);
          if (alternativeResults.length > 0) {
            console.log('First alternative result:', alternativeResults[0]);
          }
        }
        
        if (allListings.length >= maxResults) {
          allListings = allListings.slice(0, maxResults);
          break;
        }
        
        if (page < maxPages) {
          await this.delay(3000);
        }
      }
      
      console.log(`\nTotal listings collected: ${allListings.length}`);
      return allListings;

    } catch (error) {
      console.error('Scraping error:', error.message);
      throw error;
    }
  }

  async saveToJson(data, filename = 'ebay_car_listings.json') {
    try {
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`✅ Data saved to ${filename}`);
    } catch (error) {
      console.error('Error saving to JSON:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed');
    }
  }
}

// Test function with better debugging
async function testScraper() {
  const scraper = new EbayCarScraper('com');

  try {
    await scraper.init();

    // Test with a simple search first
    console.log('\n🔍 Testing with simple search...\n');
    
    const testListings = await scraper.scrape({
      query: 'honda civic',
      maxResults: 10,
      maxPages: 1,
      screenshot: true
    });

    console.log(`\n✅ Test results: ${testListings.length} listings found`);
    
    if (testListings.length > 0) {
      testListings.forEach((listing, i) => {
        console.log(`\n${i + 1}. ${listing.title}`);
        console.log(`   Price: ${listing.price}`);
        console.log(`   URL: ${listing.url}`);
      });
      
      await scraper.saveToJson(testListings, 'test_results.json');
    } else {
      console.log('\n❌ No listings found in test. Check the debug files for page structure.');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await scraper.close();
  }
}

// Run the test
testScraper();