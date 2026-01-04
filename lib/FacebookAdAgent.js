import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, START, END } from '@langchain/langgraph/web';
import { StructuredTool } from '@langchain/core/tools';
import { ChatGroq } from "@langchain/groq";



class FacebookAdCreatorTool extends StructuredTool {
  constructor() {
    super();
    this.name = 'facebook_ad_creator';
    this.description = 'Create or manage Facebook Ads campaigns/ad-sets/ads';
  }

  schema = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'create_campaign',
          'create_ad_set',
          'create_ad',
          'set_budget',
          'set_dates',
          'set_targeting',
          'pause_campaign',
          'enable_campaign',
          'remove_campaign',
        ],
      },
      params: { 
        type: 'object',
        properties: {
          name: { type: 'string' },
          objective: { 
            type: 'string',
            enum: [
              'OUTCOME_AWARENESS',
              'OUTCOME_TRAFFIC',
              'OUTCOME_ENGAGEMENT',
              'OUTCOME_LEADS',
              'OUTCOME_SALES'
            ]
          },
          budget: { type: 'number', minimum: 5 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          adCreative: { 
            type: 'object',
            required: ['message', 'link'],
            properties: {
              message: { type: 'string', minLength: 10 },
              link: { type: 'string', format: 'uri' },
              imageUrl: { type: 'string', format: 'uri' }
            }
          },
          special_ad_categories: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'NONE',
                'EMPLOYMENT',
                'HOUSING',
                'CREDIT',
                'ISSUES_ELECTIONS_POLITICS',
                'ONLINE_GAMBLING_AND_GAMING'
              ]
            }
          },
          targeting: {
            type: 'object',
            properties: {
              countries: { 
                type: 'array', 
                items: { type: 'string', minLength: 2, maxLength: 2 },
                minItems: 1
              },
              ageMin: { type: 'number', minimum: 13, maximum: 65 },
              ageMax: { type: 'number', minimum: 13, maximum: 65 }
            }
          }
        },
        required: ['name', 'objective']
      },
    },
    required: ['action', 'params'],
  };

  // Map objectives to their valid optimization goals
  objectiveOptimizationMap = {
    'OUTCOME_AWARENESS': {
      default: 'REACH',
      valid: ['REACH', 'IMPRESSIONS']
    },
    'OUTCOME_TRAFFIC': {
      default: 'LINK_CLICKS',
      valid: ['LINK_CLICKS', 'LANDING_PAGE_VIEWS']
    },
    'OUTCOME_ENGAGEMENT': {
      default: 'POST_ENGAGEMENT',
      valid: ['POST_ENGAGEMENT', 'PAGE_LIKES']
    },
    'OUTCOME_LEADS': {
      default: 'LEAD_GENERATION',
      valid: ['LEAD_GENERATION', 'CONVERSIONS']
    },
    'OUTCOME_SALES': {
      default: 'CONVERSIONS',
      valid: ['CONVERSIONS', 'VALUE']
    }
  };

  async _call({ action, params = {} }) {
    const ctx = this.ctx;
    if (!ctx?.accessToken) {
      throw new Error('Please connect your Facebook account first (missing access token)');
    }
    
    const cleanAdAccountId = ctx.adAccountId.replace(/^act_/i, '');
    
    if (!cleanAdAccountId) {
      throw new Error('Please provide a valid ad account ID');
    }

    if (!ctx?.pageId && ['create_ad', 'create_ad_set'].includes(action)) {
      throw new Error('Page ID is required for creating ads');
    }

    try {
      switch (action) {
        case 'create_campaign': {
          // Validate required parameters
          if (!params.name) throw new Error('Campaign name is required');
          if (!params.objective) throw new Error('Objective is required');
          
          // Step 1: Create Campaign
          const campaignRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/facebooks/createcampaign`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: ctx.accessToken,
                adAccountId: `act_${cleanAdAccountId}`,
                campaignDetails: {
                  name: params.name,
                  objective: params.objective,
                  status: 'PAUSED',
                  special_ad_categories: params.special_ad_categories || []
                }
              }),
            }
          );

          const campaignData = await campaignRes.json();
          
          if (!campaignRes.ok) {
            throw new Error(
              campaignData.error?.message || 
              campaignData.message || 
              'Failed to create campaign'
            );
          }

          const campaignId = campaignData.campaignId || campaignData.id;

          // Step 2: Create Ad Set with properly mapped optimization goal
          const defaultBudget = params.budget || 20;
          const defaultTargeting = params.targeting || {
            geo_locations: { countries: ['US'] },
            age_min: 18,
            age_max: 65
          };

          // Get the correct optimization goal for the campaign objective
          const optimizationGoal = this._getOptimizationGoal(params.objective);

          const adSetRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/facebooks/createadset`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: ctx.accessToken,
                adAccountId: `act_${cleanAdAccountId}`,
                adSetDetails: {
                  name: `${params.name} Ad Set`,
                  campaign_id: campaignId,
                  daily_budget: defaultBudget * 1000,
                  billing_event: 'IMPRESSIONS',
                  optimization_goal: optimizationGoal,
                  targeting: defaultTargeting,
                  status: 'PAUSED',
                  start_time: params.startDate ? Math.floor(new Date(params.startDate).getTime() / 1000) : '0',
                  end_time: params.endDate ? Math.floor(new Date(params.endDate).getTime() / 1000) : '0'
                }
              }),
            }
          );

          const adSetData = await adSetRes.json();
          
          if (!adSetRes.ok) {
            await this._cleanupCampaign(ctx.accessToken, campaignId);
            throw new Error(
              adSetData.error?.message || 
              adSetData.message || 
              'Failed to create ad set'
            );
          }

          const adSetId = adSetData.id;

          // Step 3: Create Ad Creative with default values if not provided
          const creativeRes = await fetch(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/facebooks/createcreative`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: ctx.accessToken,
      adAccountId: `act_${cleanAdAccountId}`,
      creativeDetails: {
        name: `${params.name} Creative`,
        object_story_spec: {
          page_id: ctx.pageId,
          link_data: {
            link: params.adCreative?.link || 'https://www.aisitegen.xyz',
            message: params.adCreative?.message || 'Check out our new offer!',
            image_url: params.adCreative?.imageUrl || 'https://skezvvinpjzxdpidbglf.supabase.co/storage/v1/object/public/fgfg/uploads/user_2xR60F9U4ngOHCrWs0NbsrjviHI/logos/logo_1754554009087_TS2W74VR_400x400.jpg',
            // Optional fields
            name: params.name,
            description: "Click to learn more"
          }
        }
      }
    }),
  }
);

          const creativeData = await creativeRes.json();
          
          if (!creativeRes.ok) {
            await this._cleanupAdSet(ctx.accessToken, adSetId);
            await this._cleanupCampaign(ctx.accessToken, campaignId);
            throw new Error(
              creativeData.error?.message || 
              creativeData.message || 
              'Failed to create ad creative'
            );
          }

          const creativeId = creativeData.id;

          // Step 4: Create Ad
          const adRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/facebooks/createad`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: ctx.accessToken,
                adAccountId: `act_${cleanAdAccountId}`,
                adDetails: {
                  name: `${params.name} Ad`,
                  adset_id: adSetId,
                  creative: { creative_id: creativeId },
                  status: 'PAUSED'
                }
              }),
            }
          );

          const adData = await adRes.json();
          
          if (!adRes.ok) {
            await this._cleanupCreative(ctx.accessToken, creativeId);
            await this._cleanupAdSet(ctx.accessToken, adSetId);
            await this._cleanupCampaign(ctx.accessToken, campaignId);
            throw new Error(
              adData.error?.message || 
              adData.message || 
              'Failed to create ad'
            );
          }

          return {
            success: true,
            message: `✅ Successfully created campaign "${params.name}"!\n\n` +
                    `- Objective: ${this._formatObjective(params.objective)}\n` +
                    `- Optimization Goal: ${this._formatOptimizationGoal(optimizationGoal)}\n` +
                    `- Budget: $${defaultBudget}/day\n` +
                    `- Targeting: ${defaultTargeting.geo_locations.countries.join(', ')}, ages ${defaultTargeting.age_min}-${defaultTargeting.age_max}\n` +
                    `- Status: Paused (ready for review)\n\n` +
                    `You can update any settings later if needed.`,
            campaignId,
            adSetId,
            creativeId,
            adId: adData.id
          };
        }

        default:
          throw new Error(`Action not yet supported: ${action}`);
      }
    } catch (err) {
      console.error('Facebook Ad Tool error:', {
        action,
        params,
        error: err.message
      });
      throw new Error(`I couldn't complete that action. ${err.message}`);
    }
  }

  // Helper method to get the correct optimization goal for an objective
  _getOptimizationGoal(objective) {
    const mapping = this.objectiveOptimizationMap[objective];
    return mapping ? mapping.default : 'LINK_CLICKS';
  }

  _formatObjective(objective) {
    const map = {
      'OUTCOME_AWARENESS': 'Awareness',
      'OUTCOME_TRAFFIC': 'Traffic',
      'OUTCOME_ENGAGEMENT': 'Engagement',
      'OUTCOME_LEADS': 'Leads',
      'OUTCOME_SALES': 'Sales'
    };
    return map[objective] || objective;
  }

  _formatOptimizationGoal(goal) {
    const map = {
      'REACH': 'Reach',
      'IMPRESSIONS': 'Impressions',
      'LINK_CLICKS': 'Link Clicks',
      'LANDING_PAGE_VIEWS': 'Landing Page Views',
      'POST_ENGAGEMENT': 'Post Engagement',
      'PAGE_LIKES': 'Page Likes',
      'LEAD_GENERATION': 'Lead Generation',
      'CONVERSIONS': 'Conversions',
      'VALUE': 'Value'
    };
    return map[goal] || goal;
  }

  async _cleanupCampaign(accessToken, campaignId) {
    try {
      await fetch(
        `https://graph.facebook.com/v18.0/${campaignId}`, 
        {
          method: 'DELETE',
          body: new URLSearchParams({ access_token: accessToken })
        }
      );
    } catch (cleanupError) {
      console.error('Failed to cleanup campaign:', cleanupError);
    }
  }

  async _cleanupAdSet(accessToken, adSetId) {
    try {
      await fetch(
        `https://graph.facebook.com/v18.0/${adSetId}`, 
        {
          method: 'DELETE',
          body: new URLSearchParams({ access_token: accessToken })
        }
      );
    } catch (cleanupError) {
      console.error('Failed to cleanup ad set:', cleanupError);
    }
  }

  async _cleanupCreative(accessToken, creativeId) {
    try {
      await fetch(
        `https://graph.facebook.com/v18.0/${creativeId}`, 
        {
          method: 'DELETE',
          body: new URLSearchParams({ access_token: accessToken })
        }
      );
    } catch (cleanupError) {
      console.error('Failed to cleanup creative:', cleanupError);
    }
  }
}

const SYSTEM_PROMPT = `
You are AdMaster Pro, an expert Facebook Ads assistant. Follow these rules:

1. When creating campaigns, you only need:
   - Campaign name
   - Objective (Awareness, Traffic, Engagement, Leads, Sales)
   All other parameters will use smart defaults.

2. Default settings used:
   - Budget: $10/day
   - Targeting: US, ages 18-65
   - Status: Paused (ready for review)
   - Start immediately with no end date

3. For ads, you need:
   - Message text
   - Link URL
   Image is optional (default will be used if not provided)

4. Always verify:
   - User is authenticated
   - Ad account ID is valid
   - Page ID is available when needed

5. After creation, summarize what was created including:
   - Campaign name
   - Objective
   - Budget
   - Targeting
   - Status
   - Note that defaults were used where unspecified

Example response:
"✅ Successfully created campaign 'Summer Sale'!
- Objective: Sales
- Budget: $10/day
- Targeting: US, ages 18-65
- Status: Paused (ready for review)
Note: Default settings were used for targeting and budget. You can update these later if needed."
`;

export function createFacebookAdCreatorAgent() {
  const tool = new FacebookAdCreatorTool();
  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: "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",
    temperature: 0.2,
  }).bindTools([tool]);

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
            })
          );
        } catch (err) {
          outputs.push(
            new AIMessage({
              content: err.message,
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
          const payload = JSON.stringify({ type, ...data });
          return writer.write(encoder.encode(`data: ${payload}\n\n`));
        };

        try {
          if (!ctx?.accessToken) {
            throw new Error('Please connect your Facebook account first');
          }
          
          const cleanAdAccountId = ctx.adAccountId?.replace(/^act_/i, '');
          if (!cleanAdAccountId) {
            throw new Error('Please provide a valid ad account ID (format: act_123456789)');
          }

          const messages = [
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(message),
          ];

          let state = { messages };
          let result;

          while (true) {
            result = await runnable.invoke(state, { 
              configurable: {
                ...ctx,
                adAccountId: cleanAdAccountId
              },
              recursionLimit: 3
            });

            const lastMessage = result.messages[result.messages.length - 1];
            if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
              break;
            }

            state = result;
          }

          for (const msg of result.messages) {
            if (msg._getType() === 'ai' && msg.content) {
              await send('content', { content: msg.content });
            }
          }
          
          await send('end');
        } catch (err) {
          console.error('Agent error:', err);
          await send('error', { 
            message: `I encountered an issue: ${err.message}. Please try again or provide more details.` 
          });
        } finally {
          await writer.close();
        }
      })();

      return stream.readable;
    },
  };
}