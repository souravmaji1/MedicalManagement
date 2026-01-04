import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, START, END } from '@langchain/langgraph/web';
import { StructuredTool } from '@langchain/core/tools';
import { ChatGroq } from "@langchain/groq";

class ExpiredDomainsTool extends StructuredTool {
  constructor() {
    super();
    this.name = 'expired_domains_finder';
    this.description = 'Find and analyze expired domains based on various criteria';
  }

  schema = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'find_domains',
          'filter_domains',
          'analyze_domains',
          'get_stats',
          'find_similar',
          'check_availability'
        ],
      },
      params: { 
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100 },
          filter: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['available', 'registered', 'pending'] },
              min_backlinks: { type: 'number', minimum: 0 },
              max_backlinks: { type: 'number', minimum: 0 },
              tld: { type: 'string', minLength: 2 },
              min_length: { type: 'number', minimum: 1 },
              max_length: { type: 'number', minimum: 1 },
              has_archive: { type: 'boolean' },
              keyword: { type: 'string' }
            }
          },
          sort: {
            type: 'object',
            properties: {
              by: { type: 'string', enum: ['BL', 'ACR', 'DomainAge', 'Domain'] },
              order: { type: 'string', enum: ['asc', 'desc'] }
            }
          },
          domain: { type: 'string' }
        }
      },
    },
    required: ['action'],
  };

  async _call({ action, params = {} }) {
    try {
      const baseUrl = '/api/scrapedomain';
      let url = baseUrl;
      let method = 'GET';
      let body = null;

      switch (action) {
        case 'find_domains':
          url += `?limit=${params.limit || 20}`;
          if (params.filter) {
            if (params.filter.status) url += `&filter=${params.filter.status}`;
            if (params.filter.tld) url += `&tld=${params.filter.tld}`;
          }
          break;

        case 'filter_domains':
          method = 'POST';
          body = {
            filters: params.filter || {},
            sortBy: params.sort?.by,
            sortOrder: params.sort?.order || 'desc',
            limit: params.limit || 20
          };
          break;

        case 'analyze_domains':
          method = 'POST';
          body = {
            filters: params.filter || {},
            limit: params.limit || 10
          };
          break;

        case 'get_stats':
          url += '?limit=100'; // Get enough to calculate stats
          break;

        case 'check_availability':
          if (!params.domain) throw new Error('Domain is required');
          url += `?filter=available&limit=100`;
          break;

        default:
          throw new Error(`Action not yet supported: ${action}`);
      }

      const response = await fetch(url, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch domains data');
      }

      const data = await response.json();

      switch (action) {
        case 'find_domains':
          return this._formatDomainsList(data.domains);

        case 'filter_domains':
          return this._formatDomainsList(data.domains);

        case 'analyze_domains':
          return this._formatAnalysis(data.domains, data.stats);

        case 'get_stats':
          return this._formatStats(data.stats);

        case 'check_availability':
          const isAvailable = data.domains.some(d => d.Domain === params.domain);
          return {
            domain: params.domain,
            available: isAvailable,
            message: isAvailable 
              ? `✅ Domain ${params.domain} is available!` 
              : `❌ Domain ${params.domain} is not currently available in the expired domains list.`
          };

        default:
          return data;
      }
    } catch (err) {
      console.error('Expired Domains Tool error:', err);
      throw new Error(`I couldn't complete that action. ${err.message}`);
    }
  }

  _formatDomainsList(domains) {
    if (!domains || domains.length === 0) {
      return "No domains found matching your criteria.";
    }

    let result = "Here are the domains I found:\n\n";
    domains.forEach((domain, index) => {
      result += `${index + 1}. ${domain.Domain} (${domain.Status || 'unknown status'})\n`;
      result += `   - Backlinks: ${domain.BL || '0'}\n`;
      result += `   - Archive results: ${domain.ACR || '0'}\n`;
      if (domain.DomainAge) result += `   - Age: ${domain.DomainAge}\n`;
      result += "\n";
    });

    return result;
  }

  _formatAnalysis(domains, stats) {
    if (!domains || domains.length === 0) {
      return "No domains found to analyze.";
    }

    let result = "📊 Domain Analysis Report\n\n";
    
    // Top domains by backlinks
    const sortedByBacklinks = [...domains].sort((a, b) => (parseInt(b.BL || 0) - (parseInt(a.BL || 0))));
    result += "🔝 Top Domains by Backlinks:\n";
    sortedByBacklinks.slice(0, 5).forEach((domain, index) => {
      result += `${index + 1}. ${domain.Domain} - ${domain.BL || '0'} backlinks\n`;
    });
    result += "\n";

    // Stats summary
    if (stats) {
      result += "📈 Statistics:\n";
      result += `- Total domains: ${stats.total}\n`;
      result += `- Available: ${stats.available}\n`;
      result += `- With backlinks: ${stats.withBacklinks} (avg: ${stats.avgBacklinks})\n`;
      result += `- .com domains: ${stats.comDomains}\n`;
      result += `- .net domains: ${stats.netDomains}\n`;
      result += `- .org domains: ${stats.orgDomains}\n\n`;
    }

    // Recommendations
    result += "💡 Recommendations:\n";
    if (stats.withBacklinks > 0) {
      result += "- Focus on domains with backlinks for better SEO value\n";
    }
    if (stats.comDomains > 0) {
      result += "- .com domains generally have more trust and recognition\n";
    }
    result += "- Check archive results to understand previous content\n";

    return result;
  }

  _formatStats(stats) {
    if (!stats) return "No statistics available.";

    let result = "📊 Domain Statistics\n\n";
    result += `Total domains: ${stats.total}\n`;
    result += `Available: ${stats.available}\n`;
    result += `Registered: ${stats.registered}\n`;
    result += `With backlinks: ${stats.withBacklinks} (avg: ${stats.avgBacklinks}, max: ${stats.maxBacklinks})\n`;
    result += `With archive data: ${stats.withArchiveData}\n\n`;

    result += "Top Level Domains:\n";
    result += `.com: ${stats.comDomains}\n`;
    result += `.net: ${stats.netDomains}\n`;
    result += `.org: ${stats.orgDomains}\n\n`;

    result += "Other TLDs:\n";
    for (const [tld, count] of Object.entries(stats.domainsByTld)) {
      if (!['com', 'net', 'org'].includes(tld)) {
        result += `.${tld}: ${count}\n`;
      }
    }

    return result;
  }
}

const SYSTEM_PROMPT = `
You are DomainHunter Pro, an expert assistant for finding and analyzing expired domains. Follow these rules:

Don't find any expired domain untill and unless user ask for 

1. When users ask for domains:
   - Always ask clarifying questions if their request is vague
   - Provide a good default (e.g., 20 domains) unless specified
   - Highlight domains with backlinks and archive data

2. For analysis:
   - Focus on backlinks, domain age, and TLD
   - Compare to industry standards
   - Provide actionable recommendations

3. Format responses clearly:
   - Use emojis for visual organization
   - Separate different sections clearly
   - Highlight important numbers

4. Default filters when not specified:
   - Prefer available domains
   - Minimum 5 backlinks
   - .com, .net, .org TLDs

Example response:
"🔍 Found 20 available domains with backlinks:

1. example.com (Available)
   - Backlinks: 42
   - Archive results: 120
   - Age: 5 years

2. sample.net (Available)
   - Backlinks: 18
   - Archive results: 85
   - Age: 3 years

💡 Recommendation: example.com has strong backlinks and history - great for SEO!"
`;

export function createExpiredDomainsAgent() {
  const tool = new ExpiredDomainsTool();
  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: "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",
    temperature: 0.3,
  }).bindTools([tool]);

  const graph = new StateGraph({
    channels: {
      messages: { default: () => [] },
    },
  })
    .addNode('llm', async (state, config) => {
      console.log('--- LLM NODE ---');
      console.log('Current state:', JSON.stringify(state, null, 2));
      console.log('Config:', config);
      
      const msgs = state.messages;
      console.log('Messages before LLM:', msgs.map(m => ({
        type: m._getType(),
        content: m.content,
        tool_calls: m.tool_calls
      })));

      const result = await llm.invoke(msgs);
      console.log('LLM result:', {
        type: result._getType(),
        content: result.content,
        tool_calls: result.tool_calls
      });

      return { messages: [...msgs, result] };
    })
    .addNode('tools', async (state) => {
      console.log('--- TOOLS NODE ---');
      const last = state.messages[state.messages.length - 1];
      console.log('Last message:', {
        type: last._getType(),
        content: last.content,
        tool_calls: last.tool_calls
      });

      const toolCalls = last.tool_calls || [];
      console.log('Tool calls:', toolCalls);
      const outputs = [];

      for (const call of toolCalls) {
        try {
          console.log('Executing tool:', call.name, 'with args:', call.args);
          const res = await tool._call(call.args);
          console.log('Tool result:', res);
          
          outputs.push(
            new AIMessage({
              content: res.message || res,
              tool_call_id: call.id,
              name: call.name,
            })
          );
        } catch (err) {
          console.error('Tool error:', err);
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
      const hasToolCalls = lastMessage.tool_calls?.length > 0;
      console.log('Conditional edge check - has tool calls:', hasToolCalls);
      return hasToolCalls ? 'tools' : END;
    })
    .addEdge('tools', 'llm');

  const runnable = graph.compile();

  return {
    async chat(message) {
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      (async () => {
        const send = (type, data = {}) => {
          console.log('Sending event:', type, data);
          const payload = JSON.stringify({ type, ...data });
          return writer.write(encoder.encode(`data: ${payload}\n\n`));
        };

        try {
          console.log('--- NEW CHAT REQUEST ---');
          console.log('User message:', message);

          const messages = [
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage(message),
          ];

          let state = { messages };
          let result;
          let iteration = 0;
          const maxIterations = 5; // Increased from default 3

          while (iteration < maxIterations) {
            iteration++;
            console.log(`--- ITERATION ${iteration} ---`);
            
            result = await runnable.invoke(state, { 
              configurable: { recursionLimit: maxIterations }
            });

            const lastMessage = result.messages[result.messages.length - 1];
            console.log('Last message after iteration:', {
              type: lastMessage._getType(),
              content: lastMessage.content,
              tool_calls: lastMessage.tool_calls
            });

            if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
              console.log('No more tool calls - ending loop');
              break;
            }

            if (iteration >= maxIterations) {
              console.warn('Max iterations reached');
              throw new Error(`Recursion limit of ${maxIterations} reached without hitting a stop condition.`);
            }

            state = result;
          }

          console.log('Final result messages:', result.messages);
          for (const msg of result.messages) {
            if (msg._getType() === 'ai' && msg.content) {
              await send('content', { content: msg.content });
            }
          }
          
          await send('end');
        } catch (err) {
          console.error('Agent execution error:', err);
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