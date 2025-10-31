/**
 * AI Model configurations with pricing and capabilities
 */

export interface AIModelInfo {
  id: string;
  name: string;
  provider: 'deepseek' | 'openai' | 'anthropic';
  description: string;
  capabilities: string[];
  costPerPDF: string; // Estimated cost per typical MLS PDF
  tokensPerPDF: {
    input: number;   // Average input tokens per PDF
    output: number;  // Average output tokens per PDF
    total: number;   // Total tokens per PDF
  };
  bulkPricing: {
    per1000PDFs: string;      // Cost for 1,000 extractions
    tokensFor1000: string;    // Total tokens for 1,000 PDFs
  };
  pricing: {
    input: string;  // per million tokens
    output: string; // per million tokens
  };
  contextWindow: string;
  recommended?: boolean;
}

export const API_KEY_LINKS = {
  deepseek: 'https://platform.deepseek.com/api_keys',
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
};

export const AI_MODELS: Record<string, AIModelInfo> = {
  // DeepSeek Models
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    description: 'Cost-effective model excellent for structured data extraction',
    capabilities: [
      'JSON extraction',
      'Multi-language support',
      'Fast processing',
      'Best price/performance'
    ],
    costPerPDF: '~$0.001',
    tokensPerPDF: {
      input: 4500,    // System prompt + PDF text
      output: 1000,   // JSON response
      total: 5500
    },
    bulkPricing: {
      per1000PDFs: '~$0.90',
      tokensFor1000: '5.5M tokens'
    },
    pricing: {
      input: '$0.14',
      output: '$0.28'
    },
    contextWindow: '64K tokens',
    recommended: true,
  },
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    description: 'Advanced reasoning model for complex document analysis',
    capabilities: [
      'Deep reasoning',
      'Complex extraction',
      'High accuracy',
      'Better for difficult PDFs'
    ],
    costPerPDF: '~$0.005',
    tokensPerPDF: {
      input: 4500,
      output: 1000,
      total: 5500
    },
    bulkPricing: {
      per1000PDFs: '~$4.70',
      tokensFor1000: '5.5M tokens'
    },
    pricing: {
      input: '$0.55',
      output: '$2.19'
    },
    contextWindow: '64K tokens',
  },

  // OpenAI Models (only affordable ones)
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Affordable, intelligent small model for everyday tasks',
    capabilities: [
      'Fast responses',
      'Good accuracy',
      'Balanced performance',
      'Cost-effective'
    ],
    costPerPDF: '~$0.001',
    tokensPerPDF: {
      input: 4500,
      output: 1000,
      total: 5500
    },
    bulkPricing: {
      per1000PDFs: '~$1.30',
      tokensFor1000: '5.5M tokens'
    },
    pricing: {
      input: '$0.15',
      output: '$0.60'
    },
    contextWindow: '128K tokens',
    recommended: true,
  },

  // Anthropic Models (only affordable ones)
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Fast and cost-effective model for simple tasks',
    capabilities: [
      'Very fast',
      'Good for simple PDFs',
      'Cost-effective',
      'Quick responses'
    ],
    costPerPDF: '~$0.008',
    tokensPerPDF: {
      input: 4500,
      output: 1000,
      total: 5500
    },
    bulkPricing: {
      per1000PDFs: '~$7.60',
      tokensFor1000: '5.5M tokens'
    },
    pricing: {
      input: '$0.80',
      output: '$4.00'
    },
    contextWindow: '200K tokens',
    recommended: true,
  },
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Balanced model with excellent performance',
    capabilities: [
      'Excellent accuracy',
      'Strong reasoning',
      'Great for complex PDFs',
      'Best overall quality'
    ],
    costPerPDF: '~$0.029',
    tokensPerPDF: {
      input: 4500,
      output: 1000,
      total: 5500
    },
    bulkPricing: {
      per1000PDFs: '~$28.50',
      tokensFor1000: '5.5M tokens'
    },
    pricing: {
      input: '$3.00',
      output: '$15.00'
    },
    contextWindow: '200K tokens',
  },
};

export const AI_MODELS_BY_PROVIDER = {
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  openai: ['gpt-4o-mini'],
  anthropic: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'],
};

export const DEFAULT_MODELS = {
  deepseek: 'deepseek-chat',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
};
