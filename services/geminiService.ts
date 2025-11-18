import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SlackMessage, AnalysisResult, DeepDiveSection } from "../types";
import { decode, decodeAudioData } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSummary = async (messages: SlackMessage[]): Promise<AnalysisResult> => {
  const transcript = messages.map(m => `${m.user} (${m.timestamp}): ${m.text}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Analyze the following Slack conversation transcript.
      Provide a structured summary including:
      1. A concise executive summary paragraph.
      2. A list of Key Decisions made.
      3. A list of Action Items assigned or implied.
      4. A list of Topic Intensities (topic name and a score 1-100 based on discussion volume/emotion).

      Transcript:
      ${transcript}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyDecisions: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          topicIntensity: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                intensity: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No summary generated");
  return JSON.parse(text) as AnalysisResult;
};

export const generateDeepDive = async (messages: SlackMessage[]): Promise<DeepDiveSection[]> => {
  const transcript = messages.map(m => `${m.user}: ${m.text}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Create a "Deep Dive" study guide based on this Slack conversation.
      Think of it like a NotebookLM automated report.
      Return a JSON array of sections. Each section has a 'title' and 'content' (which can contain markdown).
      
      Include sections for:
      1. Context & Background (What initiated this?)
      2. Technical/Operational Breakdown (The 'Why' and 'How')
      3. Risk Analysis (What was at stake?)
      4. Glossary of Terms (Define acronyms or project terms mentioned)

      Transcript:
      ${transcript}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No deep dive generated");
  return JSON.parse(text) as DeepDiveSection[];
};

export const generatePodcastAudio = async (messages: SlackMessage[]): Promise<AudioBuffer | null> => {
  const transcript = messages.map(m => `${m.user}: ${m.text}`).join('\n');

  // First, generate the script
  const scriptResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Convert this Slack conversation into a lively, engaging podcast script between two hosts, "Nova" (Host A) and "Orio" (Host B).
      They should discuss the events dramatically but professionally, analyzing the team's performance.
      Keep it short (approx 45 seconds spoken).
      Format the output strictly as:
      Nova: [Text]
      Orio: [Text]
      ...
    `,
  });
  
  const script = scriptResponse.text;
  if (!script) return null;

  // Now generate the audio using Multi-speaker TTS
  // We need to parse the script to build the voice configs, but the API handles the turn-taking if we structure it right.
  // For simpler implementation with the preview API, we will just pass the script text and ask the model to enact it using multi-speaker config.
  
  try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                      {
                          speaker: 'Nova',
                          voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' }
                          }
                      },
                      {
                          speaker: 'Orio',
                          voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Puck' }
                          }
                      }
                ]
              }
          }
        }
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      return await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1,
      );
  } catch (e) {
      console.error("Audio generation failed", e);
      return null;
  }
};
