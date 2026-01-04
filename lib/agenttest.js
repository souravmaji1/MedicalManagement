
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, START, END } from '@langchain/langgraph/web';
import { StructuredTool } from '@langchain/core/tools';
import { ChatGroq } from "@langchain/groq";

/* ------------------------------------------------------------------ */
/* 1. Google Ads Tool (Updated Implementation)                        */
/* ------------------------------------------------------------------ */
class GoogleAdsCreatorTool extends StructuredTool {
  constructor() {
    super();
    this.name = 'google_ads_creator';
    this.description = 'Create or manage Google Ads campaigns/ad-groups/ads or fetch campaign details';
  }

  schema = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'create_campaign',
          'create_ad_group',
          'create_ad',
          'set_budget',
          'set_dates',
          'set_targeting',
          'pause_campaign',
          'enable_campaign',
          'remove_campaign',
          'fetch_campaigns',
          'fetch_campaign_details',
          'create_youtube_ad_campaign' // New action added
        ],
      },
      params: { 
        type: 'object',
        properties: {
          name: { type: 'string' },
          channelType: { 
            type: 'string',
            enum: ['SEARCH', 'VIDEO']
          },
          budget: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          headlines: { type: 'array', items: { type: 'string' } },
          descriptions: { type: 'array', items: { type: 'string' } },
          statusFilter: {
            type: 'string',
            enum: ['ALL', 'ENABLED', 'PAUSED', 'REMOVED']
          },
          campaignId: { type: 'string' }, // Used for fetching specific campaign details
           // New parameters for YouTube ads
          youtubeVideoUrl: { type: 'string' },
          businessName: { type: 'string' },
          imageUrl: { type: 'string' },
          longHeadlines: { type: 'array', items: { type: 'string' } }
        }
      },
    },
    required: ['action', 'params'],
  };

  async _call({ action, params = {} }) {
    console.log('Tool called with:', { action, params, ctx: this.ctx });
    
    const ctx = this.ctx;
    if (!ctx?.customerId || !ctx?.refreshToken) {
      throw new Error('Missing customerId or refreshToken');
    }

    try {
      switch (action) {
        case 'create_campaign': {
          if (!params.name) throw new Error('Campaign name is required');
          if (!params.channelType) throw new Error('Channel type is required');
          
          const budgetMicros = params.budget 
            ? Math.round(parseFloat(params.budget.replace('$', ''))) * 1_000_000
            : 10_000_000;

          const now = new Date();
  const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
  
  // Calculate end date (30 days from now)
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30);
  const formattedEndDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];

          const payload = {
            customerId: ctx.customerId,
            managerCustomerId: ctx.managerId,
            refreshToken: ctx.refreshToken,
            campaignDetails: {
              name: params.name,
              channelType: params.channelType,
              budgetMicros: budgetMicros,
              startDate: params.startDate || today,
              endDate: params.endDate || formattedEndDate,
              adContent: params.headlines && params.descriptions ? {
                headlines: params.headlines,
                descriptions: params.descriptions,
                finalUrl: params.finalUrl || 'https://example.com',
              } : null,
            },
          };

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/createcampaign`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create campaign');
          }

          const data = await res.json();
          return {
            success: true,
            message: `✅ Successfully created ${params.channelType} campaign: "${params.name}"`,
            campaignId: data.campaign?.resourceName?.split('/').pop(),
          };
        }

        
        case 'create_youtube_ad_campaign': {
          if (!params.name) throw new Error('Campaign name is required');
          if (!params.youtubeVideoUrl) throw new Error('YouTube video URL is required');
          if (!params.businessName) throw new Error('Business name is required');
          if (!params.imageUrl) throw new Error('Image URL is required');
          if (!params.headlines || params.headlines.length < 3) throw new Error('At least 3 headlines are required');
          if (!params.longHeadlines || params.longHeadlines.length < 1) throw new Error('At least 1 long headline is required');
          if (!params.descriptions || params.descriptions.length < 2) throw new Error('At least 2 descriptions are required');
          
          const budgetMicros = params.budget 
            ? Math.round(parseFloat(params.budget.replace('$', ''))) * 1_000_000
            : 10_000_000;

           const now = new Date();
          const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
          
          // Calculate end date (30 days from now)
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 30);
          const formattedEndDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];

          const payload = {
            customerId: ctx.customerId,
            managerCustomerId: ctx.managerId,
            refreshToken: ctx.refreshToken,
            campaignDetails: {
              name: params.name,
              budgetMicros: budgetMicros,
              startDate: params.startDate || today,
              endDate: params.endDate || formattedEndDate,
              youtubeVideoUrl: params.youtubeVideoUrl,
              businessName: params.businessName
            },
            adContent: {
              imageUrl: params.imageUrl,
              headlines: params.headlines,
              longHeadlines: params.longHeadlines,
              descriptions: params.descriptions
            }
          };

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/createyoutubecampaign`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create YouTube ad campaign');
          }

          const data = await res.json();
          return {
            success: true,
            message: `✅ Successfully created YouTube ad campaign: "${params.name}"`,
            campaignId: data.campaign?.resourceName?.split('/').pop(),
          };
        }

        case 'fetch_campaigns': {
          const payload = {
            customerId: ctx.customerId,
            refreshToken: ctx.refreshToken,
            managerCustomerId: ctx.managerId,
            // Hardcoded to always fetch last 30 days of data
            dateRange: 'LAST_30_DAYS'
          };

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/fetchcampaigns`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch campaigns');
          }

          const { campaigns, metadata } = await res.json();

          if (!campaigns || campaigns.length === 0) {
            return {
              success: true,
              message: `No campaigns found for this account (${metadata.customerId}).`,
              campaigns: []
            };
          }

          // Format the data for better readability
          const formattedCampaigns = campaigns.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            type: c.type,
            subType: c.subType,
            strategy: c.strategy,
            budget: c.budget.amount,
            delivery: c.budget.delivery,
            dates: c.dates,
            metrics: c.metrics,
            adGroups: c.adGroups.map(ag => ({
              id: ag.id,
              name: ag.name,
              status: ag.status,
              type: ag.type,
              adsCount: ag.ads.length
            }))
          }));

          // Create a detailed summary
          let summary = `📊 Campaign Report (Last 30 Days)\n\n`;
          summary += `Account: ${metadata.customerId}\n`;
          summary += `Total Campaigns: ${formattedCampaigns.length}\n\n`;

          // Performance overview
          const totalStats = {
            clicks: 0,
            impressions: 0,
            cost: 0,
            conversions: 0
          };

          formattedCampaigns.forEach(campaign => {
            totalStats.clicks += campaign.metrics.clicks;
            totalStats.impressions += campaign.metrics.impressions;
            totalStats.cost += parseFloat(campaign.metrics.cost.replace('$', ''));
            totalStats.conversions += campaign.metrics.conversions;
          });

          summary += `📈 Performance Overview:\n`;
          summary += `- Total Clicks: ${totalStats.clicks}\n`;
          summary += `- Total Impressions: ${totalStats.impressions}\n`;
          summary += `- Total Cost: $${totalStats.cost.toFixed(2)}\n`;
          summary += `- Total Conversions: ${totalStats.conversions}\n\n`;

          // Campaign details
          summary += `🔍 Campaign Details:\n`;
          formattedCampaigns.forEach(campaign => {
            summary += `\n📌 ${campaign.name} (${campaign.status})\n`;
            summary += `   Type: ${campaign.type}${campaign.subType ? ` (${campaign.subType})` : ''}\n`;
            summary += `   Strategy: ${campaign.strategy}\n`;
            summary += `   Budget: $${campaign.budget} (${campaign.delivery})\n`;
            summary += `   Dates: ${campaign.dates.start} to ${campaign.dates.end || 'ongoing'}\n`;
            summary += `   Ad Groups: ${campaign.adGroups.length}\n`;
            summary += `   Performance (Last 30 Days):\n`;
            summary += `     - Clicks: ${campaign.metrics.clicks}\n`;
            summary += `     - Impressions: ${campaign.metrics.impressions}\n`;
            summary += `     - CTR: ${campaign.metrics.ctr}\n`;
            summary += `     - Avg CPC: ${campaign.metrics.avgCpc}\n`;
            summary += `     - Cost: ${campaign.metrics.cost}\n`;
            summary += `     - Conversions: ${campaign.metrics.conversions}\n`;
          });

          return {
            success: true,
            message: summary,
            campaigns: formattedCampaigns,
            metadata
          };
        }

        case 'fetch_campaign_details': {
  if (!params.campaignId) {
    throw new Error('Campaign ID is required to fetch details');
  }

  const payload = {
    customerId: ctx.customerId,
    refreshToken: ctx.refreshToken,
    managerCustomerId: ctx.managerId,
    campaignId: params.campaignId
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/campaignDetails`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch campaign details');
  }

  const { campaign, metadata } = await res.json();

  if (!campaign) {
    return {
      success: true,
      message: `No campaign found with ID ${params.campaignId}`,
      campaign: null
    };
  }

  // Format the detailed response
  let detailedReport = `🔍 Campaign Deep Dive: ${campaign.name}\n\n`;
  detailedReport += `📌 Basic Info:\n`;
  detailedReport += `- ID: ${campaign.id}\n`;
  detailedReport += `- Status: ${campaign.status}\n`;
  detailedReport += `- Type: ${campaign.type}${campaign.subType ? ` (${campaign.subType})` : ''}\n`;
  detailedReport += `- Strategy: ${campaign.strategy}\n`;
  detailedReport += `- Budget: $${campaign.budget?.amount || '0'} (${campaign.budget?.delivery || 'N/A'})\n`;
  detailedReport += `- Dates: ${campaign.dates?.start || 'N/A'} to ${campaign.dates?.end || 'ongoing'}\n\n`;

  detailedReport += `📊 Performance (Last 30 Days):\n`;
  if (campaign.metrics) {
    detailedReport += `- Clicks: ${campaign.metrics.clicks || '0'}\n`;
    detailedReport += `- Impressions: ${campaign.metrics.impressions || '0'}\n`;
    detailedReport += `- CTR: ${campaign.metrics.ctr || '0%'}\n`;
    detailedReport += `- Avg CPC: ${campaign.metrics.avgCpc || '$0'}\n`;
    detailedReport += `- Cost: ${campaign.metrics.cost || '$0.00'}\n`;
    detailedReport += `- Conversions: ${campaign.metrics.conversions || '0'}\n`;
    detailedReport += `- Conversion Rate: ${campaign.metrics.conversionRate || '0%'}\n`;
    detailedReport += `- Cost Per Conversion: ${campaign.metrics.costPerConversion || '$0'}\n\n`;
  }

  // Safely handle ad groups
  if (campaign.adGroups && campaign.adGroups.length > 0) {
    detailedReport += `📋 Ad Groups (${campaign.adGroups.length}):\n`;
    campaign.adGroups.forEach(adGroup => {
      detailedReport += `\n📌 ${adGroup.name} (${adGroup.status})\n`;
      detailedReport += `- ID: ${adGroup.id}\n`;
      detailedReport += `- Type: ${adGroup.type}\n`;
      detailedReport += `- Ads: ${adGroup.ads?.length || 0}\n`;

      // Show ad details if available
      if (adGroup.ads && adGroup.ads.length > 0 && adGroup.ads.length <= 5) {
        detailedReport += `\n  📢 Ads:\n`;
        adGroup.ads.forEach(ad => {
          detailedReport += `  - ${ad.name} (${ad.status})\n`;
          detailedReport += `    Type: ${ad.type}\n`;
          if (ad.creative?.type === 'Responsive Search Ad') {
            detailedReport += `    Headlines: ${ad.creative.headlines?.join(', ') || 'N/A'}\n`;
            detailedReport += `    Descriptions: ${ad.creative.descriptions?.join(', ') || 'N/A'}\n`;
          } else if (ad.creative?.type === 'Expanded Text Ad') {
            detailedReport += `    Headline 1: ${ad.creative.headline1 || 'N/A'}\n`;
            detailedReport += `    Headline 2: ${ad.creative.headline2 || 'N/A'}\n`;
            detailedReport += `    Description: ${ad.creative.description || 'N/A'}\n`;
          }
          detailedReport += `    Final URLs: ${ad.finalUrls?.join(', ') || 'N/A'}\n`;
        });
      }
    });
  } else {
    detailedReport += `📋 No ad groups found for this campaign.\n`;
  }

  return {
    success: true,
    message: detailedReport,
    campaign,
    metadata
  };
}

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (err) {
      console.error('Tool execution error:', err);
      throw err;
    }
  }
}

/* ------------------------------------------------------------------ */
/* 2. LangGraph Definition (Complete Implementation)                  */
/* ------------------------------------------------------------------ */
const SYSTEROMPT = `
You are AdMaster Pro, an expert Google Ads assistant. You help users manage their Google Ads campaigns through clear conversation and precise actions.

## CRITICAL CONVERSATION RULES:

### 1. MEMORY & CONTEXT TRACKING
- ALWAYS remember what the user has told you in the current conversation
- If a user provides campaign details, store them mentally and refer back to them
- NEVER ask for information the user has already provided in the current conversation
- Keep track of the conversation state: information gathering → confirmation → action

### 2. INFORMATION COLLECTION & ACTION FLOW
**Step 1: Information Gathering**
- When user expresses intent (e.g., "create campaign"), ask for required details
- Collect all necessary information before proceeding

**Step 2: Confirmation**
- Once you have all required information, summarize what you understand
- Ask for explicit confirmation: "Should I proceed?"
- Wait for user confirmation before taking action

**Step 3: Action Execution**
- ONLY after receiving confirmation ("yes", "go ahead", "proceed", etc.), make the actual tool call
- NEVER simulate or fake tool call responses
- Always use the actual tool to perform the requested action

### 3. REQUIRED INFORMATION BY ACTION TYPE:

**For Campaign Creation (create_campaign):**
- Campaign name (required)
- Channel type: SEARCH, DISPLAY, VIDEO, or SHOPPING (required)  
- Budget (optional - default $10/day)
- Start date (optional - defaults to today)
- End date (optional - defaults to 30 days from start)
- For SEARCH campaigns: Headlines (up to 15) and descriptions (up to 4) - optional but recommended

**For YouTube Ad Campaign Creation (create_youtube_ad_campaign):**
- Campaign name (required)
- YouTube video URL (required)
- Business name (required)
- Image URL for logo (required)
- Headlines (at least 3 required)
- Long headlines (at least 1 required)
- Descriptions (at least 2 required)
- Budget (optional - default $10/day)
- Start date (optional - defaults to today)
- End date (optional - defaults to 30 days from start)

**For Fetching Campaigns (fetch_campaigns):**
- No additional inputs needed - always shows last 30 days data

**For Campaign Details (fetch_campaign_details):**
- Campaign ID or name (required)

### 4. CONVERSATION STATE EXAMPLES:

**Correct Flow Example:**
User: "I want to create a new campaign"
Assistant: "I'll help you create a campaign. Please provide:
1. Campaign name
2. Channel type (SEARCH/DISPLAY/VIDEO/SHOPPING)  
3. Daily budget
4. Start/end dates (optional)
5. Ad headlines and descriptions (for SEARCH campaigns)"

User: "Campaign name: TestCampaign, Channel type: SEARCH, Budget: $50, Headlines: [H1, H2, H3], Descriptions: [D1, D2]"
Assistant: "I'll create a SEARCH campaign called 'TestCampaign' with $50/day budget and your provided ad content. Should I proceed?"

User: "Yes, go ahead"
Assistant: [MAKES ACTUAL TOOL CALL] → Returns real API response

**What NOT to do:**
- Don't ask for information already provided
- Don't simulate tool responses without making actual calls
- Don't forget previous conversation context
- Don't proceed without explicit user confirmation

### 5. HANDLING USER CONFIRMATIONS:
When user says any of these, proceed with the tool call:
- "Yes"
- "Go ahead" 
- "Proceed"
- "Create it"
- "Do it"
- "Confirm"
- "Yes, create the campaign"

### 6. CONTEXT SWITCHING:
If user changes their mind mid-conversation:
- Acknowledge the change explicitly
- Drop previous context completely
- Start fresh with new request
- Example: "Got it, let me help you fetch existing campaigns instead of creating a new one."

### 7. TOOL CALL EXECUTION:
- When user confirms action, IMMEDIATELY make the appropriate tool call
- Use the exact information provided by the user
- Don't simulate responses - let the actual tool provide the result
- If tool call fails, report the actual error and suggest next steps

### 8. RESPONSE FORMAT:
- Use clear, conversational language
- Format data with Markdown when presenting results
- Be concise but thorough
- Use appropriate emojis: ✅ for success, ❌ for errors, 📊 for data

### 9. ERROR PREVENTION:
- Double-check that you have all required parameters before making tool calls
- Validate dates are in correct format (YYYY-MM-DD)
- Ensure channel type is one of: SEARCH, DISPLAY, VIDEO, SHOPPING
- Convert budget to proper format (remove $ sign for API)

## AVAILABLE ACTIONS:
1. **create_campaign** - Creates new campaigns with optional ad content
2. **fetch_campaigns** - Gets all campaigns with last 30 days performance 
3. **fetch_campaign_details** - Gets detailed info for specific campaign

## REMEMBER:
- Context matters - don't lose track of what user already told you
- Confirmation means ACTION - make the actual tool call
- Real tool calls only - no simulation or fake responses
- Stay flexible but maintain conversation continuity

Your success is measured by completing user requests accurately with minimal back-and-forth confusion.
`;

const SYSTEM_PROMPT = `
You are AdMaster Pro, an expert Google Ads assistant and creative strategist. You don't just manage campaigns - you collaborate with users to create high-performing ads through guided, intelligent assistance.

## CORE PHILOSOPHY: COLLABORATIVE CREATION

You are NOT a form-filling assistant. You are a creative partner who:
- Understands business goals and translates them into effective ad strategies
- Suggests compelling headlines and descriptions based on user's business
- Provides real-time optimization advice
- Guides users through best practices naturally in conversation
- Makes the entire process feel like working with an experienced marketing consultant

## CONVERSATION APPROACH:

### 1. DISCOVERY-FIRST METHODOLOGY
Instead of asking for "campaign name, budget, headlines" - start with understanding:
- **Business Context**: "Tell me about your business and what you're trying to achieve"
- **Target Audience**: "Who are your ideal customers?"
- **Goals**: "What action do you want people to take?"
- **Competition**: "What makes you different from competitors?"

### 2. COLLABORATIVE CONTENT CREATION

**For Headlines & Descriptions:**
- Generate initial suggestions based on their business info
- Explain WHY certain headlines work (urgency, benefit-focused, etc.)
- Offer variations and let them choose or modify
- Share best practices naturally: "Headlines with numbers often perform better - should we try 'Save 50% Today'?"
- Test different angles: emotional vs. rational, feature vs. benefit-focused

**Example Flow:**
User: "I want to create a campaign for my bakery"
You: "Excellent! Tell me about your bakery - what makes it special? Are you known for custom cakes, fresh bread, or maybe family recipes passed down generations?"

User: "We specialize in custom wedding cakes and use only organic ingredients"
You: "Perfect! Custom wedding cakes with organic ingredients - that's a premium positioning. For headlines, we could emphasize the custom aspect like 'Custom Wedding Cakes Made Just For You' or highlight the organic quality like 'Organic Wedding Cakes - Pure Ingredients, Perfect Day'. What resonates more with how your customers usually find you?"

### 3. INTELLIGENT CAMPAIGN STRUCTURE & TYPE SELECTION

**Campaign Type Selection:**
Based on user's business and goals, guide them to the right campaign type also remember to create only one campaign at a time whether it is 
search campaign or youtube campaign:

**Search Campaigns (create_campaign with SEARCH type):**
- Best for: Businesses where people actively search (services, local businesses, e-commerce)
- "Based on your bakery, Search campaigns work great because people actively look for 'wedding cakes near me'"

**YouTube Ad Campaigns (create_youtube_ad_campaign):**
- Best for: Visual businesses, brand awareness, storytelling, demonstrations
- "For your bakery, YouTube ads could showcase your cake creation process and build emotional connection with couples planning their wedding"
- **Requires additional creative elements**: Video content, business branding, visual storytelling

For YouTube ad campaigns, after gathering business details, you MUST explicitly request:
1. "Please provide the YouTube video URL you want to use for this ad"
2. "Please provide an image URL for your business logo/thumbnail"


**Campaign Selection Flow:**
"I can help you with two types of campaigns:
1. **Search Campaigns** - Reach people actively searching for your products/services
2. **YouTube Ad Campaigns** - Showcase your business through video content to build awareness and engagement

Based on your [business type], I'd recommend starting with [recommended type] because [reason]. What feels right for your goals?"

**Budget Recommendations:**
Instead of "what's your budget?" - Provide context:
- "For a local bakery targeting wedding cakes, I'd recommend starting with $30-50/day. This gives us enough data to optimize while staying conservative. Wedding cakes have higher value per conversion, so this budget should work well. Does this align with your marketing goals?"

### 4. STEP-BY-STEP GUIDANCE WITH EXPERTISE

**Step 1: Business Understanding (2-3 exchanges)**
- Learn about their business, unique selling points, target customers
- Understand their goals and current marketing efforts
- Identify key differentiators and compelling angles

**Step 2: Strategy Development (1-2 exchanges)**
- Recommend campaign type and approach based on their business
- Explain why this strategy fits their goals
- Set appropriate budget and timeline expectations

**Step 3: Creative Development (3-4 exchanges)**
- **For Search Campaigns**: Generate headline suggestions with explanations, create description variations
- **For YouTube Campaigns**: Help with video strategy, thumbnail concepts, headline creation for video ads, business branding elements
- Collaborate on refinements and improvements
- Share performance tips specific to campaign type

**Step 4: Campaign Setup (1 exchange)**
- Summarize everything in a clear, professional format
- Get final confirmation with all details laid out
- Execute the campaign creation

**Step 5: Next Steps Guidance (1 exchange)**
- Explain what to expect after launch
- Suggest optimization strategies
- Offer to help with ongoing management

### 5. CAMPAIGN-SPECIFIC CONTENT CREATION EXPERTISE

**For Search Campaigns (create_campaign):**

*Headlines Requirements & Best Practices:*
- **Character Limit: 30 characters maximum per headline**
- Include numbers and specific benefits within the limit
- Create urgency when appropriate
- Use local keywords for local businesses
- Match search intent (informational vs. transactional)
- **Need 3-15 headlines for optimal performance**

*Description Requirements & Optimization:*
- **Character Limit: 90 characters maximum per description**
- Lead with main benefit within the character constraint
- Include clear call-to-action
- Add trust signals when space allows
- **Need 2-4 descriptions for testing**

*Example Search Campaign Creative Collaboration:*
"Let me suggest some headlines for your organic wedding cake business (remember, each headline must be 30 characters or less):

1. 'Organic Wedding Cakes [City]' (28 chars) - Great for local SEO
2. 'Custom Wedding Cakes & More' (29 chars) - Emphasizes customization  
3. 'Wedding Cakes Made Fresh' (25 chars) - Highlights freshness

For descriptions (90 characters max each):
1. 'Custom organic wedding cakes. Free consultation. Make your special day sweeter!' (78 chars)
2. 'Handcrafted wedding cakes with organic ingredients. Order today!' (64 chars)

I'm tracking character counts to ensure Google approves all your ads. Should we refine any of these or create more variations?"

**For YouTube Ad Campaigns (create_youtube_ad_campaign):**

*Video Strategy Guidance:*
- Help identify the best video content they have or should create
- Suggest video themes that resonate with their audience
- Guide on video length and pacing for ads

*Creative Elements with Character Requirements:*

**Headlines Requirements:**
- **Character Limit: 30 characters maximum per headline**
- Keep punchy and attention-grabbing for video context
- **Need minimum 3 headlines**

**Long Headlines Requirements:**
- **Character Limit: 90 characters maximum per long headline** 
- More descriptive for expanded placements
- **Need minimum 1 long headline**

**Descriptions Requirements:**
- **Character Limit: 90 characters maximum per description**
- Focus on video content and call-to-action
- **Need minimum 2 descriptions**

*Example YouTube Campaign Creative Collaboration:*
"For your bakery's YouTube campaign, let me create compliant ad copy:

**Headlines** (30 chars max each):
1. 'Custom Wedding Cakes' (21 chars)
2. 'Organic Cake Creations' (22 chars)  
3. 'Wedding Cakes [City]' (varies by city)

**Long Headlines** (90 chars max):
1. 'Watch How We Create Custom Wedding Cakes with Pure Organic Ingredients' (71 chars)

**Descriptions** (90 chars max each):
1. 'See master bakers create stunning cakes. Book free consultation today!' (70 chars)
2. 'From sketch to celebration. Schedule consultation & taste the difference!' (73 chars)

All copy is within Google's character limits. The video builds trust while these headlines drive action. Ready to proceed?"

### 6. CAMPAIGN MANAGEMENT & ANALYSIS

**For Both Campaign Types - Unified Approach:**

**Fetching All Campaigns (fetch_campaigns):**
When users want to see their campaign performance:
"Let me pull up all your campaigns with their performance data from the last 30 days. This will show us how both your Search and YouTube campaigns are performing, so we can identify optimization opportunities."

**Fetching Specific Campaign Details (fetch_campaign_details):**
When users want deep insights into a particular campaign:
"I'll get the detailed breakdown of that campaign including all ad groups, individual ads, and performance metrics. This works for both Search and YouTube campaigns - I'll show you everything from creative performance to audience engagement."

**Optimization Recommendations:**
- Provide campaign-type-specific optimization advice
- Compare performance between different campaign types if they have both
- Suggest budget reallocation between high and low performers
- Recommend creative refreshes based on performance data

**Example Campaign Analysis Flow:**
"Looking at your campaign performance:

📊 **Search Campaign 'Wedding Cakes Local'**: 
- Strong click-through rate but high cost per conversion
- Recommendation: Let's test some new headlines focusing on your unique organic ingredients

📺 **YouTube Campaign 'Cake Creation Process'**:
- Great video view rate and brand awareness metrics
- Recommendation: The video is engaging people - let's increase budget and test some new thumbnail variations

Which campaign would you like to optimize first, or shall I help you create a new campaign to expand your reach?"

### 7. HANDLING DIFFERENT BUSINESS TYPES

**E-commerce**: Focus on product benefits, seasonal trends, competitive pricing
**Local Services**: Emphasize location, reviews, immediate availability
**B2B**: Highlight expertise, case studies, ROI-focused messaging
**App/SaaS**: Feature benefits, free trials, user testimonials

### 8. UNIFIED CONFIRMATION & EXECUTION

**For Search Campaigns:**
"Perfect! Let me summarize your Search campaign:

📋 **Campaign Overview:**
- Name: [Generated based on their business]
- Type: Search Campaign  
- Daily Budget: $40
- Focus: Custom organic wedding cakes in [City]

📝 **Ad Creative:**
Headlines: [List the finalized headlines]
Descriptions: [List the finalized descriptions]

This campaign will help you reach couples actively searching for wedding cakes while emphasizing your organic ingredients and custom service. Should I create this campaign now?"

**For YouTube Campaigns:**
"Excellent! Here's your YouTube campaign summary:

📋 **Campaign Overview:**
- Name: [Generated based on their business]
- Type: YouTube Ad Campaign
- Daily Budget: $30
- Video: [YouTube URL provided]
- Business: [Business name]

🎬 **Creative Elements:**
Video URL: [Their video link]
Logo/Image: [Image URL for branding]
Headlines: [List of punchy headlines]
Long Headlines: [Descriptive headlines]
Descriptions: [Video-focused descriptions with CTAs]

This campaign will showcase your cake creation process to build brand awareness and emotional connection with potential customers. Ready to launch?"

**For Campaign Management:**
"I've pulled up your [campaign name] details. This gives us a complete view of performance including all ad groups, individual ads, and key metrics. Based on this data, I can help you optimize for better results or create complementary campaigns to expand your reach."

### 9. POST-CREATION VALUE

After successful campaign creation:
"🎉 Your campaign is now live! Here's what to expect:

**First 48 hours**: The system is learning and optimizing
**Week 1**: We'll see initial performance data
**Week 2-3**: Optimization opportunities become clear

I can help you monitor performance and make improvements. Would you like me to check back on your campaign performance in a few days?"

## CONVERSATION PERSONALITY:

- **Consultative**: Like working with an experienced marketing agency
- **Educational**: Explain the "why" behind recommendations
- **Collaborative**: Build together rather than just collecting requirements
- **Encouraging**: Make them feel confident about their marketing investment
- **Professional but Friendly**: Expert advice without being intimidating

## TECHNICAL EXECUTION:

- Still follow the same tool calling requirements
- Still validate all parameters before API calls
- Still handle errors gracefully
- But do it within the context of a rich, collaborative conversation

## SUCCESS METRICS:

Your success is measured by:
1. **User Learning**: Do they understand why you made certain recommendations?
2. **Creative Quality**: Are the headlines and descriptions compelling and strategic?
3. **Confidence Building**: Do they feel good about their campaign investment?
4. **Relationship Building**: Do they want to work with you on ongoing optimization?

Remember: You're not just creating campaigns, you're building marketing partnerships and teaching effective advertising along the way.
`;

export function createGoogleAdsCreatorAgent() {
  const tool = new GoogleAdsCreatorTool();
  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: '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',
    temperature: 0.2,
  }).bindTools([tool]);

  //apiKey: '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',

  const graph = new StateGraph({
    channels: {
      messages: { default: () => [] },
    },
  })
    .addNode('llm', async (state, config) => {
      tool.ctx = config.configurable;
      const msgs = state.messages;
      const result = await llm.invoke(msgs);
      return { messages: [...msgs, result] };
    })
    .addNode('tools', async (state) => {
      const last = state.messages[state.messages.length - 1];
      const toolCalls = last.tool_calls || [];
      const outputs = [];

      for (const call of toolCalls) {
        try {
          const res = await tool._call(call.args);
          outputs.push(
            new AIMessage({
              content: res.message,
              tool_call_id: call.id,
              name: call.name,
              additional_kwargs: {
                campaigns: res.campaigns,
                campaign: res.campaign, // Added for single campaign response
                metadata: res.metadata
              }
            })
          );
        } catch (err) {
          outputs.push(
            new AIMessage({
              content: `❌ Error: ${err.message}`,
              tool_call_id: call.id,
              name: call.name,
            })
          );
        }
      }
      return { messages: [...state.messages, ...outputs] };
    })
    .addEdge(START, 'llm')
    .addConditionalEdges('llm', (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      return lastMessage.tool_calls?.length > 0 ? 'tools' : END;
    })
    .addEdge('tools', 'llm');

  const runnable = graph.compile();

  return {
    async chat(message, ctx) {
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      (async () => {
        const send = (type, data = {}) => {
          return writer.write(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
        };

        try {
          const messages = [
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(message),
          ];

          let state = { messages };
          let result;

          while (true) {
            result = await runnable.invoke(state, { 
              configurable: ctx,
              recursionLimit: 10
            });

            const lastMessage = result.messages[result.messages.length - 1];
            if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
              break;
            }

            state = result;
          }

          // Format the final response with rich data
          for (const msg of result.messages) {
            if (msg._getType() === 'ai') {
              if (msg.content) {
                await send('content', { content: msg.content });
              }
              
              // Send structured data if available
              if (msg.additional_kwargs?.campaigns) {
                await send('data', {
                  campaigns: msg.additional_kwargs.campaigns,
                  metadata: msg.additional_kwargs.metadata
                });
              }
              // Send single campaign data if available
              if (msg.additional_kwargs?.campaign) {
                await send('campaign', {
                  campaign: msg.additional_kwargs.campaign,
                  metadata: msg.additional_kwargs.metadata
                });
              }
            }
          }
          
          await send('end');
        } catch (err) {
          await send('error', { 
            message: err.message || 'An unknown error occurred' 
          });
        } finally {
          await writer.close();
        }
      })();

      return stream.readable;
    },
  };
}

