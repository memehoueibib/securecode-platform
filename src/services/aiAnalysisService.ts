export interface AIAnalysisConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  maxTokens: number;
  supportsStreaming: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4',
    maxTokens: 4000,
    supportsStreaming: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    defaultModel: 'claude-3-sonnet',
    maxTokens: 4000,
    supportsStreaming: true
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    models: ['gemini-pro', 'gemini-pro-vision'],
    defaultModel: 'gemini-pro',
    maxTokens: 2000,
    supportsStreaming: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large', 'mistral-medium', 'mistral-small'],
    defaultModel: 'mistral-medium',
    maxTokens: 2000,
    supportsStreaming: true
  },
  {
    id: 'cohere',
    name: 'Cohere',
    models: ['command', 'command-light'],
    defaultModel: 'command',
    maxTokens: 2000,
    supportsStreaming: false
  }
];

export class AIAnalysisService {
  static async analyzeCodeWithAI(
    code: string,
    language: string,
    config: AIAnalysisConfig
  ): Promise<any> {
    try {
      const prompt = this.buildAnalysisPrompt(code, language);
      
      switch (config.provider) {
        case 'openai':
          return await this.analyzeWithOpenAI(prompt, config);
        case 'anthropic':
          return await this.analyzeWithAnthropic(prompt, config);
        case 'google':
          return await this.analyzeWithGoogle(prompt, config);
        case 'mistral':
          return await this.analyzeWithMistral(prompt, config);
        case 'cohere':
          return await this.analyzeWithCohere(prompt, config);
        default:
          throw new Error(`Provider ${config.provider} non supporté`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      throw error;
    }
  }

  private static buildAnalysisPrompt(code: string, language: string): string {
    return `Analysez ce code ${language} pour détecter les vulnérabilités de sécurité.

Code à analyser:
\`\`\`${language}
${code}
\`\`\`

Recherchez spécifiquement:
1. Vulnérabilités XSS (Cross-Site Scripting)
2. Injections de code (eval, Function, etc.)
3. Secrets codés en dur (mots de passe, clés API)
4. Autres problèmes de sécurité

Répondez au format JSON avec cette structure:
{
  "vulnerabilities": [
    {
      "type": "xss|injection|secrets|other",
      "severity": "critique|eleve|moyen|faible",
      "line": number,
      "description": "Description de la vulnérabilité",
      "codeSnippet": "Code problématique",
      "fix": "Solution recommandée",
      "confidence": number (0-100)
    }
  ],
  "summary": {
    "totalVulnerabilities": number,
    "securityScore": number (0-100),
    "recommendations": ["liste de recommandations"]
  }
}`;
  }

  private static async analyzeWithOpenAI(prompt: string, config: AIAnalysisConfig): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un expert en sécurité informatique spécialisé dans l\'analyse de code.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private static async analyzeWithAnthropic(prompt: string, config: AIAnalysisConfig): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur Anthropic: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  }

  private static async analyzeWithGoogle(prompt: string, config: AIAnalysisConfig): Promise<any> {
    // Implémentation pour Google Gemini
    throw new Error('Google Gemini non encore implémenté');
  }

  private static async analyzeWithMistral(prompt: string, config: AIAnalysisConfig): Promise<any> {
    // Implémentation pour Mistral
    throw new Error('Mistral AI non encore implémenté');
  }

  private static async analyzeWithCohere(prompt: string, config: AIAnalysisConfig): Promise<any> {
    // Implémentation pour Cohere
    throw new Error('Cohere non encore implémenté');
  }
}