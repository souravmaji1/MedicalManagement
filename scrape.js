const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class CraigslistCarScraper {
  constructor(location = 'losangeles') {
    this.baseUrl = `https://${location}.craigslist.org`;
    this.searchUrl = `${this.baseUrl}/search/cta`;
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
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
      maxResults = 50,
      screenshot = false
    } = options;

    if (!this.browser) await this.init();

    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (minYear) params.append('min_auto_year', minYear);
      if (maxYear) params.append('max_auto_year', maxYear);
      params.append('sort', 'rel');

      const url = `${this.searchUrl}?${params.toString()}`;
      console.log(`Navigating to: ${url}`);

      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait a bit for dynamic content
      await this.delay(2000);

      if (screenshot) {
        await this.page.screenshot({ path: 'craigslist_search.png', fullPage: true });
        console.log('Screenshot saved');
      }

      // Get page content to analyze structure
      const content = await this.page.content();
      
      // Try multiple selectors for listings
      const listings = await this.page.evaluate((max) => {
        const results = [];
        
        // Try to find listing containers using various possible selectors
        let items = document.querySelectorAll('li.cl-search-result');
        
        if (items.length === 0) {
          items = document.querySelectorAll('.result-row');
        }
        
        if (items.length === 0) {
          items = document.querySelectorAll('[class*="result"]');
        }

        if (items.length === 0) {
          // Try to find any repeating structure with car info
          items = document.querySelectorAll('li[class*="cl-"]');
        }

        console.log(`Found ${items.length} potential listing elements`);

        items.forEach((item, i) => {
          if (results.length >= max) return;

          try {
            // Extract all text content
            const fullText = item.textContent || '';
            
            // Look for links
            const links = item.querySelectorAll('a');
            let mainLink = null;
            let title = '';
            
            links.forEach(link => {
              const href = link.getAttribute('href');
              if (href && (href.includes('/cto/') || href.includes('/ctd/'))) {
                mainLink = href.startsWith('http') ? href : `https://losangeles.craigslist.org${href}`;
                title = link.textContent.trim() || link.getAttribute('title') || '';
              }
            });

            // Extract price
            let price = '';
            const priceMatch = fullText.match(/\$[\d,]+/);
            if (priceMatch) price = priceMatch[0];

            // Extract mileage
            let mileage = '';
            const mileageMatch = fullText.match(/([\d,]+k?\s*mi)/i);
            if (mileageMatch) mileage = mileageMatch[1];

            // Extract location
            let location = '';
            const locationPatterns = [
              /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Valley|Hills|Park|Beach|Grove|CA))\b/,
              /\b(?:central LA|westside|valley|SGV)\b/i
            ];
            locationPatterns.forEach(pattern => {
              const match = fullText.match(pattern);
              if (match && !location) location = match[0].trim();
            });

            // Extract date/time
            const timeEl = item.querySelector('time');
            const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
            const postedAgo = timeEl ? timeEl.getAttribute('title') : '';

            // Extract images
            let image = null;
            const imgEl = item.querySelector('img');
            if (imgEl) {
              image = imgEl.src || imgEl.getAttribute('data-src');
            }

            // Get ID from data attributes or URL
            let id = item.getAttribute('data-pid') || 
                     item.getAttribute('data-id') ||
                     (mainLink ? mainLink.split('/').filter(Boolean).pop().split('.')[0] : '');

            if (mainLink || title || price) {
              const listing = {
                id,
                title: title || fullText.substring(0, 100).trim(),
                url: mainLink || '',
                price,
                mileage,
                location,
                datetime,
                postedAgo,
                image,
                rawText: fullText.substring(0, 200)
              };

              results.push(listing);
            }
          } catch (err) {
            console.error('Error parsing item:', err.message);
          }
        });

        return results;
      }, maxResults);

      console.log(`Found ${listings.length} listings`);
      
      if (listings.length === 0) {
        console.log('\n⚠️  No listings found. Checking page structure...');
        
        // Debug: Get all text content
        const allText = await this.page.evaluate(() => {
          return document.body.innerText.substring(0, 500);
        });
        console.log('Page text preview:', allText);

        // Try to get HTML structure
        const bodyHTML = await this.page.evaluate(() => {
          const body = document.body;
          return body ? body.innerHTML.substring(0, 1000) : 'No body found';
        });
        console.log('\nHTML structure preview:', bodyHTML.substring(0, 500));
      }

      return listings;

    } catch (error) {
      console.error('Scraping error:', error.message);
      throw error;
    }
  }

  async scrapeWithCustomSelector(customSelector, options = {}) {
    if (!this.browser) await this.init();

    const {
      query = '',
      minPrice = null,
      maxPrice = null,
      minYear = null,
      maxYear = null
    } = options;

    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (minYear) params.append('min_auto_year', minYear);
      if (maxYear) params.append('max_auto_year', maxYear);

      const url = `${this.searchUrl}?${params.toString()}`;
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      await this.delay(2000);

      const listings = await this.page.evaluate((selector) => {
        const items = document.querySelectorAll(selector);
        const results = [];

        items.forEach(item => {
          results.push({
            html: item.outerHTML.substring(0, 500),
            text: item.textContent.substring(0, 200)
          });
        });

        return results;
      }, customSelector);

      return listings;
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
  }

  async scrapeDetails(listingUrl) {
    if (!this.browser) await this.init();

    try {
      console.log(`Fetching details from: ${listingUrl}`);
      
      await this.page.goto(listingUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(1000);

      const details = await this.page.evaluate(() => {
        const data = {
          title: '',
          price: '',
          description: '',
          vin: '',
          images: [],
          attributes: {},
          postingInfo: {}
        };

        // Title - try multiple selectors
        const titleSelectors = ['#titletextonly', '.postingtitle', 'h1', '.title'];
        for (const sel of titleSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            data.title = el.textContent.trim();
            break;
          }
        }

        // Price
        const priceEl = document.querySelector('.price') || 
                        document.querySelector('[class*="price"]');
        if (priceEl) data.price = priceEl.textContent.trim();

        // Description
        const descSelectors = ['#postingbody', '.posting-body', '.postingbody'];
        for (const sel of descSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            data.description = el.textContent
              .replace(/QR Code Link to This Post/g, '')
              .trim();
            break;
          }
        }

        // Images
        const imgSelectors = ['#thumbs a', '.thumb', '.gallery img', 'img[src*="craigslist"]'];
        imgSelectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => {
            const url = el.href || el.src;
            if (url && url.includes('craigslist') && !data.images.includes(url)) {
              data.images.push(url);
            }
          });
        });

        // Attributes
        document.querySelectorAll('.attrgroup span, [class*="attr"] span').forEach(span => {
          const text = span.textContent.trim();
          
          if (text.includes(':')) {
            const [key, value] = text.split(':').map(s => s.trim());
            if (key && value) {
              const keyLower = key.toLowerCase().replace(/\s+/g, '_');
              data.attributes[keyLower] = value;
              
              // Check if this is a VIN
              if (keyLower === 'vin' || key.toLowerCase().includes('vin')) {
                data.vin = value;
              }
            }
          } else if (text) {
            const lower = text.toLowerCase();
            data.attributes[lower.replace(/\s+/g, '_')] = true;
          }
        });

        // Extract VIN from description if not found in attributes
        if (!data.vin && data.description) {
          // VIN is typically 17 characters, alphanumeric (excluding I, O, Q)
          const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
          const vinMatch = data.description.match(vinPattern);
          if (vinMatch) {
            data.vin = vinMatch[0];
          }
        }

        // Also check title and all text for VIN
        if (!data.vin) {
          const allText = document.body.textContent;
          const vinPattern = /(?:VIN|vin|Vehicle Identification Number)[\s:]*([A-HJ-NPR-Z0-9]{17})/gi;
          const vinMatch = allText.match(vinPattern);
          if (vinMatch) {
            const extractedVin = vinMatch[0].match(/[A-HJ-NPR-Z0-9]{17}/);
            if (extractedVin) {
              data.vin = extractedVin[0];
            }
          }
        }

        // Get all text if no specific fields found
        if (!data.title && !data.description) {
          data.rawContent = document.body.textContent.substring(0, 1000);
        }

        return data;
      });

      return details;

    } catch (error) {
      console.error('Detail scraping error:', error.message);
      throw error;
    }
  }

  async saveToJson(data, filename = 'craigslist_cars.json') {
    try {
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`✅ Data saved to ${filename}`);
    } catch (error) {
      console.error('Save error:', error.message);
      throw error;
    }
  }

  async saveToCsv(data, filename = 'craigslist_cars.csv') {
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

// Example usage
async function main() {
  const scraper = new CraigslistCarScraper('losangeles');

  try {
    await scraper.init();

    // Search with filters
    const listings = await scraper.scrape({
      query: 'toyota camry',
      minPrice: 10000,
      maxPrice: 25000,
      minYear: 2015,
      maxYear: 2023,
      maxResults: 30,
      screenshot: true
    });

          console.log(`\n✅ Found ${listings.length} listings`);
    
    if (listings.length > 0) {
      console.log('\n📋 First 3 listings:');
      listings.slice(0, 3).forEach((listing, i) => {
        console.log(`\n${i + 1}. ${listing.title}`);
        console.log(`   Price: ${listing.price}`);
        console.log(`   Mileage: ${listing.mileage}`);
        console.log(`   Location: ${listing.location}`);
        console.log(`   URL: ${listing.url}`);
      });

      // Save basic listings first
      await scraper.saveToJson(listings, 'craigslist_cars_basic.json');

      // Fetch detailed info for ALL listings (including VINs)
      console.log('\n--- Fetching detailed info for all listings (this may take a while) ---');
      const detailedListings = [];

      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        
        if (listing.url) {
          try {
            console.log(`\n[${i + 1}/${listings.length}] Fetching: ${listing.title.substring(0, 50)}...`);
            
            // Add delay to be respectful to the server
            await scraper.delay(2000);
            
            const details = await scraper.scrapeDetails(listing.url);
            
            // Combine basic listing info with detailed info
            const combined = {
              ...listing,
              ...details,
              vin: details.vin || ''
            };
            
            detailedListings.push(combined);
            console.log(`   ✓ VIN: ${details.vin || 'Not found'}`);
            
          } catch (error) {
            console.error(`   ✗ Error fetching details: ${error.message}`);
            // Still add the basic listing even if details fail
            detailedListings.push({ ...listing, vin: '', error: error.message });
          }
        }
      }

      // Save complete data with all details and VINs
      await scraper.saveToJson(detailedListings, 'craigslist_cars_complete.json');
      await scraper.saveToCsv(detailedListings, 'craigslist_cars_complete.csv');
      
      console.log(`\n✅ Complete! Scraped ${detailedListings.length} listings with details`);
      console.log(`   - VINs found: ${detailedListings.filter(l => l.vin).length}`);
      console.log(`   - VINs missing: ${detailedListings.filter(l => !l.vin).length}`);
    } else {
      console.log('\n⚠️  Try running with headless: false to see what the page looks like');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await scraper.close();
  }
}


  main();


