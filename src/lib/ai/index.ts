// ==========================================================================
// AI INTEGRATION - OpenRouter API
// ==========================================================================
import type {
     AIRequest,
     AIResponse,
     NarrativeBranch,
     AISuggestion,
     CanvasConnection,
     DetectedNoteType,
     Checkpoint,
     CheckpointRelationship,
     SpeculativeBranch,
     CheckpointType,
} from '@/types';
import { generateId } from '@/lib/db';

// ==========================================================================
// OPENROUTER CLIENT
// ==========================================================================
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free';

// Check if API key is configured
const isAPIKeyConfigured = OPENROUTER_API_KEY.length > 0 && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';

interface OpenRouterMessage {
     role: 'system' | 'user' | 'assistant';
     content: string;
}

interface OpenRouterResponse {
     id: string;
     choices: {
          message: {
               role: string;
               content: string;
          };
          finish_reason: string;
     }[];
     usage?: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
     };
}

/**
 * Make a request to OpenRouter API
 */
async function callOpenRouter(
     messages: OpenRouterMessage[],
     options: {
          temperature?: number;
          maxTokens?: number;
          model?: string;
     } = {}
): Promise<string> {
     if (!isAPIKeyConfigured) {
          throw new Error(
               'OpenRouter API key not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env.local file. ' +
               'Get your API key from: https://openrouter.ai/keys'
          );
     }

     const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
               'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
               'Content-Type': 'application/json',
               'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
               'X-Title': 'Orrery Notes',
          },
          body: JSON.stringify({
               model: options.model || DEFAULT_MODEL,
               messages,
               temperature: options.temperature ?? 0.7,
               max_tokens: options.maxTokens ?? 2048,
               top_p: 0.9,
          }),
     });

     if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
     }

     const data: OpenRouterResponse = await response.json();

     if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from OpenRouter API');
     }

     return data.choices[0].message.content;
}

/**
 * Helper function to generate content (wrapper for OpenRouter)
 */
async function generateContent(prompt: string): Promise<string> {
     return callOpenRouter([{ role: 'user', content: prompt }]);
}

// ==========================================================================
// AI FUNCTIONS
// ==========================================================================

// ==========================================================================
// INTELLIGENT GRAPH ANALYSIS FUNCTIONS
// ==========================================================================

/**
 * Detect the type of note content
 */
export async function detectNoteType(
     content: string
): Promise<{ type: DetectedNoteType; confidence: number } | null> {
     const prompt = `Analyze this text and determine what type of note/document it is.

Text to analyze:
"""
${content.substring(0, 2000)}
"""

Possible types:
- story: Narrative fiction with characters, plot, dialogue
- research: Academic or scientific with hypotheses, findings, citations
- argument: Essay with thesis, supporting points, counterarguments
- process: Tutorial or how-to with sequential steps
- decision: Analysis with options, pros/cons, criteria
- concept: Philosophical or theoretical with definitions, implications
- meeting: Notes with attendees, action items, decisions
- technical: Documentation with code, functions, parameters
- journal: Personal reflection with emotions, events, insights
- brainstorm: Ideas list, features, creative exploration

Return ONLY valid JSON (no markdown):
{
  "type": "story",
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return null;

          const parsed = JSON.parse(jsonMatch[0]);
          return {
               type: parsed.type as DetectedNoteType,
               confidence: parsed.confidence,
          };
     } catch (error) {
          console.error('Error detecting note type:', error);
          return null;
     }
}

/**
 * Extract checkpoints from note content based on detected type
 */
export async function extractCheckpoints(
     content: string,
     noteType: DetectedNoteType
): Promise<Checkpoint[]> {
     const typeInstructions: Record<DetectedNoteType, string> = {
          story: `Extract: plot events, character decisions, conflicts, scene changes, resolutions.
Types: plot-event, character-decision, conflict, scene-change, resolution`,
          research: `Extract: hypotheses, key findings, data points, insights, questions, conclusions.
Types: hypothesis, finding, data-point, insight, research-question, conclusion`,
          argument: `Extract: thesis statements, supporting points, counterarguments, rebuttals, conclusions.
Types: thesis, supporting-point, counterargument, rebuttal, essay-conclusion`,
          process: `Extract: steps, warnings, checkpoints, branch points, completion states.
Types: step, warning, checkpoint, branch-point, completion`,
          decision: `Extract: problem definition, criteria, options, trade-offs, final decisions.
Types: problem, criteria, option, trade-off, decision-made`,
          concept: `Extract: concept definitions, relationships, implications, philosophical questions.
Types: concept-definition, relationship, implication, philosophical-question`,
          meeting: `Extract: topics discussed, discussion points, action items, deadlines.
Types: topic, discussion-point, action-item, deadline`,
          technical: `Extract: functions, inputs, outputs, error cases, examples.
Types: function, input, output, error-case, example`,
          journal: `Extract: emotional states, events described, reflections, future intentions.
Types: emotional-state, event, reflection, future-intent`,
          brainstorm: `Extract: core ideas, features, connections, promising ideas, rejected ideas.
Types: core-idea, feature, connection, promising, rejected`,
     };

     const prompt = `Analyze this ${noteType} content and extract key checkpoints.

Content:
"""
${content.substring(0, 3000)}
"""

Instructions:
${typeInstructions[noteType]}

For each checkpoint, provide:
- title: Short descriptive title (5-10 words)
- content: The actual text from the note
- excerpt: First 100 characters for preview
- type: One of the types listed above
- importance: 1-10 rating

Return ONLY valid JSON (no markdown):
{
  "checkpoints": [
    {
      "title": "Discovery of Evidence",
      "content": "Sarah found documents...",
      "excerpt": "Sarah found documents in the old warehouse...",
      "type": "plot-event",
      "importance": 8,
      "startOffset": 0,
      "endOffset": 150
    }
  ]
}`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return [];

          const parsed = JSON.parse(jsonMatch[0]);

          return parsed.checkpoints.map(
               (cp: {
                    title: string;
                    content: string;
                    excerpt: string;
                    type: string;
                    importance: number;
                    startOffset: number;
                    endOffset: number;
               }) => ({
                    id: generateId(),
                    title: cp.title,
                    content: cp.content,
                    excerpt: cp.excerpt,
                    type: cp.type as CheckpointType,
                    noteType,
                    importance: cp.importance,
                    position: {
                         startOffset: cp.startOffset,
                         endOffset: cp.endOffset,
                    },
               })
          );
     } catch (error) {
          console.error('Error extracting checkpoints:', error);
          return [];
     }
}

/**
 * Analyze relationships between checkpoints
 */
export async function analyzeRelationships(
     checkpoints: Checkpoint[],
     noteType: DetectedNoteType
): Promise<CheckpointRelationship[]> {
     if (checkpoints.length < 2) return [];

     const checkpointsContext = checkpoints
          .map((cp, i) => `${i}: "${cp.title}" (${cp.type})`)
          .join('\n');

     const prompt = `Analyze relationships between these ${noteType} checkpoints.

Checkpoints:
${checkpointsContext}

Identify connections between checkpoint pairs.
Relationship types:
- causal: One leads to/causes another
- temporal: Sequential in time
- supportive: One supports/reinforces another
- contradictory: One contradicts another
- thematic: Share common themes
- sequential: Ordered steps

Return ONLY valid JSON (no markdown):
{
  "relationships": [
    {
      "sourceIndex": 0,
      "targetIndex": 1,
      "type": "causal",
      "strength": 0.8,
      "description": "Discovery leads to decision"
    }
  ]
}`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return [];

          const parsed = JSON.parse(jsonMatch[0]);

          return parsed.relationships
               .filter(
                    (rel: { sourceIndex: number; targetIndex: number }) =>
                         checkpoints[rel.sourceIndex] && checkpoints[rel.targetIndex]
               )
               .map(
                    (rel: {
                         sourceIndex: number;
                         targetIndex: number;
                         type: string;
                         strength: number;
                         description: string;
                    }) => ({
                         id: generateId(),
                         sourceId: checkpoints[rel.sourceIndex].id,
                         targetId: checkpoints[rel.targetIndex].id,
                         type: rel.type as CheckpointRelationship['type'],
                         strength: rel.strength,
                         description: rel.description,
                    })
               );
     } catch (error) {
          console.error('Error analyzing relationships:', error);
          return [];
     }
}

/**
 * Generate "what if" alternative branches
 */
export async function generateWhatIfBranches(
     checkpoint: Checkpoint,
     whatIfQuestion: string,
     noteContent: string,
     noteType: DetectedNoteType,
     allCheckpoints: Checkpoint[]
): Promise<SpeculativeBranch[]> {
     const contextCheckpoints = allCheckpoints
          .slice(0, 5)
          .map((cp) => `- ${cp.title}`)
          .join('\n');

     const typeSpecificInstructions: Record<DetectedNoteType, string> = {
          story: 'Generate alternative plot directions. Stay true to characters and world rules.',
          research: 'Generate alternative interpretations or methodological approaches.',
          argument: 'Generate alternative positions or challenge assumptions.',
          process: 'Generate alternative methods, optimizations, or different sequences.',
          decision: 'Generate alternative choices with different criteria weights.',
          concept: 'Generate alternative interpretations or applications to new domains.',
          meeting: 'Generate alternative assignments, timelines, or decisions.',
          technical: 'Generate alternative implementations or architectural approaches.',
          journal: 'Generate alternative perspectives or reframed interpretations.',
          brainstorm: 'Generate idea combinations, pivots, or expanded concepts.',
     };

     const prompt = `You are exploring alternative possibilities for a ${noteType} document.

Selected Checkpoint:
Title: "${checkpoint.title}"
Content: "${checkpoint.content}"

User's Question:
"${whatIfQuestion}"

Document Context:
${noteContent.substring(0, 1500)}

Related Checkpoints:
${contextCheckpoints}

Instructions:
${typeSpecificInstructions[noteType]}

Generate 3 distinct alternative paths/outcomes.

Return ONLY valid JSON (no markdown):
{
  "branches": [
    {
      "title": "Alternative title (5-8 words)",
      "description": "What would happen (2-3 sentences)",
      "consequences": "Implications and effects",
      "pros": ["Benefit 1", "Benefit 2"],
      "cons": ["Drawback 1"],
      "confidence": 0.75,
      "nextCheckpoints": [
        {"title": "Next point", "description": "What follows"}
      ]
    }
  ]
}`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return [];

          const parsed = JSON.parse(jsonMatch[0]);

          return parsed.branches.map(
               (branch: {
                    title: string;
                    description: string;
                    consequences: string;
                    pros?: string[];
                    cons?: string[];
                    confidence: number;
                    nextCheckpoints: { title: string; description: string }[];
               }) => ({
                    id: generateId(),
                    parentCheckpointId: checkpoint.id,
                    whatIfQuestion,
                    title: branch.title,
                    description: branch.description,
                    consequences: branch.consequences,
                    pros: branch.pros || [],
                    cons: branch.cons || [],
                    confidence: branch.confidence,
                    nextCheckpoints: branch.nextCheckpoints || [],
                    generatedAt: new Date(),
               })
          );
     } catch (error) {
          console.error('Error generating what-if branches:', error);
          return [];
     }
}

/**
 * Enhance writing - improve clarity and style
 */
export async function enhanceWriting(text: string, context?: string): Promise<string> {
     const prompt = `You are an editorial assistant helping improve writing quality.

Text to enhance:
"""
${text}
"""

${context ? `Context: ${context}` : ''}

Task: Improve the clarity, style, and flow of this text while maintaining the original meaning and voice. Fix any grammatical errors. Return ONLY the revised text, no explanations.`;

     try {
          return await generateContent(prompt);
     } catch (error) {
          console.error('Error enhancing writing:', error);
          throw error;
     }
}

/**
 * Expand content - add more detail
 */
export async function expandContent(text: string, context?: string): Promise<string> {
     const prompt = `You are a writing assistant helping expand ideas.

Text to expand:
"""
${text}
"""

${context ? `Context: ${context}` : ''}

Task: Expand this text with more detail, examples, or explanation while maintaining the same tone and style. Add 2-3 paragraphs of relevant content. Return ONLY the expanded text, no explanations.`;

     try {
          return await generateContent(prompt);
     } catch (error) {
          console.error('Error expanding content:', error);
          throw error;
     }
}

/**
 * Summarize content
 */
export async function summarizeContent(text: string): Promise<string> {
     const prompt = `Summarize the following text in a concise manner, capturing the key points:

"""
${text}
"""

Return ONLY the summary, no explanations or prefixes.`;

     try {
          return await generateContent(prompt);
     } catch (error) {
          console.error('Error summarizing:', error);
          throw error;
     }
}

/**
 * Continue writing - generate next paragraph
 */
export async function continueWriting(text: string, context?: string): Promise<string> {
     const prompt = `You are a writing assistant helping continue a piece of writing.

Text so far:
"""
${text}
"""

${context ? `Context/Style notes: ${context}` : ''}

Task: Write the next 1-2 paragraphs that naturally continue this text. Match the tone, style, and voice. Return ONLY the continuation, no explanations.`;

     try {
          return await generateContent(prompt);
     } catch (error) {
          console.error('Error continuing writing:', error);
          throw error;
     }
}

/**
 * Generate narrative branches for story exploration
 */
export async function generateNarrativeBranches(
     decision: string,
     storyContext: {
          characters?: string[];
          genre?: string;
          previousEvents?: string[];
          worldRules?: string;
     }
): Promise<NarrativeBranch[]> {
     const prompt = `You are a creative writing assistant specializing in plot development.

Story Context:
- Genre: ${storyContext.genre || 'General Fiction'}
- Characters: ${storyContext.characters?.join(', ') || 'Not specified'}
- Previous Events: ${storyContext.previousEvents?.join('; ') || 'None provided'}
- World Rules: ${storyContext.worldRules || 'Standard reality'}

Current Decision Point:
"${decision}"

Task: Generate 3 distinct plot branches from this decision point.

Requirements:
1. Each branch must stay true to character personalities and world rules
2. Create compelling conflict and lead to meaningfully different outcomes
3. Avoid clichés

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "branches": [
    {
      "name": "Short title (5-8 words)",
      "consequence": "Immediate result (1-2 sentences)",
      "nextDecision": "The next choice point this leads to"
    }
  ]
}`;

     try {
          const responseText = await generateContent(prompt);

          // Parse JSON response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
               throw new Error('Invalid JSON response from AI');
          }

          const parsed = JSON.parse(jsonMatch[0]);

          return parsed.branches.map((branch: { name: string; consequence: string; nextDecision?: string }) => ({
               id: generateId(),
               name: branch.name,
               description: branch.consequence,
               consequence: branch.consequence,
               nextDecision: branch.nextDecision,
               status: 'unexplored' as const,
               parentNodeId: '',
               childNodes: []
          }));
     } catch (error) {
          console.error('Error generating narrative branches:', error);
          throw error;
     }
}

/**
 * Suggest note links based on content
 */
export async function suggestLinks(
     currentContent: string,
     availableNotes: { id: string; title: string; excerpt: string }[]
): Promise<AISuggestion[]> {
     if (availableNotes.length === 0) return [];

     const notesContext = availableNotes
          .slice(0, 20)
          .map(n => `- "${n.title}": ${n.excerpt.substring(0, 100)}`)
          .join('\n');

     const prompt = `Analyze this note content and suggest relevant links to other notes.

Current Note Content:
"""
${currentContent.substring(0, 1500)}
"""

Available Notes to Link To:
${notesContext}

Task: Suggest up to 3 notes that would be relevant to link from the current content. Consider thematic connections, referenced concepts, and logical relationships.

Return ONLY valid JSON (no markdown):
{
  "suggestions": [
    {
      "noteTitle": "Title of note to link",
      "reason": "Brief explanation of why this link makes sense",
      "confidence": 0.8
    }
  ]
}`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return [];

          const parsed = JSON.parse(jsonMatch[0]);

          return parsed.suggestions.map((s: { noteTitle: string; reason: string; confidence: number }) => {
               const matchedNote = availableNotes.find(n =>
                    n.title.toLowerCase() === s.noteTitle.toLowerCase()
               );

               return {
                    id: generateId(),
                    type: 'link' as const,
                    content: s.reason,
                    targetNoteId: matchedNote?.id,
                    confidence: s.confidence
               };
          }).filter((s: AISuggestion) => s.targetNoteId);
     } catch (error) {
          console.error('Error suggesting links:', error);
          return [];
     }
}

/**
 * Suggest tags based on content
 */
export async function suggestTags(content: string, existingTags: string[]): Promise<string[]> {
     const prompt = `Analyze this content and suggest relevant tags.

Content:
"""
${content.substring(0, 1500)}
"""

Existing tags in the system: ${existingTags.slice(0, 30).join(', ') || 'None'}

Task: Suggest 3-5 relevant tags for this content. Tags should be:
- Single words or short hyphenated phrases
- Lowercase
- Descriptive of the content's themes or topics

Return ONLY a JSON array of tag strings (no markdown):
["tag1", "tag2", "tag3"]`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (!jsonMatch) return [];

          return JSON.parse(jsonMatch[0]);
     } catch (error) {
          console.error('Error suggesting tags:', error);
          return [];
     }
}

/**
 * Organize canvas elements
 */
export async function organizeCanvasElements(
     elements: { id: string; type: string; content: string }[]
): Promise<{
     groups: { id: string; name: string; items: string[] }[];
     connections: CanvasConnection[];
     layout: { itemId: string; x: number; y: number }[];
}> {
     const elementsContext = elements
          .slice(0, 30)
          .map(e => `{id: "${e.id}", type: "${e.type}", content: "${e.content.substring(0, 150)}"}`)
          .join('\n');

     const prompt = `You are a knowledge organization specialist.

Canvas Items:
${elementsContext}

Canvas Size: 2000x2000px

Task: Organize these items spatially with logical groupings.

Requirements:
1. Group related items together
2. Suggest meaningful connections between related items
3. Generate layout positions with no overlapping (min 200px between items)
4. Name each group descriptively (2-4 words)

Return ONLY valid JSON (no markdown):
{
  "groups": [{"id": "g1", "name": "Group Name", "items": ["itemId1", "itemId2"]}],
  "connections": [{"source": "id1", "target": "id2", "type": "thematic", "label": "relates to"}],
  "layout": [{"itemId": "id1", "x": 100, "y": 100}]
}`;

     try {
          const responseText = await generateContent(prompt);

          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
               throw new Error('Invalid response');
          }

          const parsed = JSON.parse(jsonMatch[0]);

          // Add IDs to connections
          parsed.connections = parsed.connections.map((c: Omit<CanvasConnection, 'id'>) => ({
               ...c,
               id: generateId()
          }));

          return parsed;
     } catch (error) {
          console.error('Error organizing canvas:', error);
          // Return default organization
          return {
               groups: [],
               connections: [],
               layout: elements.map((e, i) => ({
                    itemId: e.id,
                    x: 100 + (i % 5) * 300,
                    y: 100 + Math.floor(i / 5) * 250
               }))
          };
     }
}

/**
 * Main AI request handler
 */
export async function processAIRequest(request: AIRequest): Promise<AIResponse> {
     const { action, context, options } = request;

     try {
          let content = '';
          let branches: NarrativeBranch[] | undefined;
          let suggestions: AISuggestion[] | undefined;
          let canvasLayout: AIResponse['canvasLayout'];

          switch (action) {
               case 'enhance':
                    content = await enhanceWriting(
                         context.selectedText || '',
                         context.currentNote?.content
                    );
                    break;

               case 'expand':
                    content = await expandContent(
                         context.selectedText || '',
                         context.currentNote?.content
                    );
                    break;

               case 'summarize':
                    content = await summarizeContent(context.selectedText || context.currentNote?.content || '');
                    break;

               case 'continue':
                    content = await continueWriting(
                         context.currentNote?.content || '',
                         context.storyContext?.genre
                    );
                    break;

               case 'generateBranches':
                    branches = await generateNarrativeBranches(
                         context.selectedText || '',
                         context.storyContext || {}
                    );
                    break;

               case 'suggestLinks':
                    if (context.recentNotes) {
                         suggestions = await suggestLinks(
                              context.currentNote?.content || '',
                              context.recentNotes.map(n => ({
                                   id: n.id,
                                   title: n.title,
                                   excerpt: n.excerpt || ''
                              }))
                         );
                    }
                    break;

               case 'organizeCanvas':
                    if (context.canvasElements) {
                         canvasLayout = await organizeCanvasElements(
                              context.canvasElements.map(e => ({
                                   id: e.id,
                                   type: e.type,
                                   content: typeof e.content === 'string' ? e.content : JSON.stringify(e.content)
                              }))
                         );
                    }
                    break;
          }

          return {
               id: generateId(),
               action,
               content,
               branches,
               suggestions,
               canvasLayout,
               timestamp: new Date()
          };
     } catch (error) {
          console.error('AI request failed:', error);
          throw error;
     }
}
