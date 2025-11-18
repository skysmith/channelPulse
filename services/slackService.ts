import { SlackMessage } from '../types';

export async function fetchSlackHistory(token: string, channel: string, hours: number): Promise<SlackMessage[]> {
  // Calculate timestamp for "oldest" message to fetch
  const oldest = (Date.now() / 1000) - (hours * 3600);
  
  const url = new URL('https://slack.com/api/conversations.history');
  url.searchParams.append('channel', channel);
  url.searchParams.append('oldest', oldest.toString());
  url.searchParams.append('limit', '100');

  try {
      const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ok) {
          // Common errors: 'channel_not_found', 'missing_scope', 'invalid_auth'
          throw new Error(`Slack API Error: ${data.error}`);
      }

      // Map Slack's raw JSON to our App's schema
      // Note: We use the User ID as the name to avoid N+1 lookups for this prototype
      return data.messages.map((msg: any) => ({
          id: msg.ts,
          user: msg.user || 'Unknown', 
          avatar: '', // Avatar fetching requires 'users.info' scope and extra calls
          timestamp: new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          text: msg.text,
          reactions: msg.reactions?.map((r: any) => ({ emoji: r.name, count: r.count }))
      })).reverse(); // Slack returns newest first, we want chronological

  } catch (error: any) {
      console.error("Slack fetch failed:", error);
      // Enhance error message for CORS issues
      if (error.message === 'Failed to fetch') {
        throw new Error("Browser blocked the request (CORS). Slack API does not allow direct access from browsers. Please use the 'Paste Transcript' tab or a CORS proxy.");
      }
      throw error;
  }
}