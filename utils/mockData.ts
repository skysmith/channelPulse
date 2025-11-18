import { SlackMessage } from '../types';

export const generateMockConversation = (): SlackMessage[] => {
  const now = new Date();
  const messages: SlackMessage[] = [
    {
      id: 'm1',
      user: 'Sarah Chen (Product)',
      avatar: 'https://picsum.photos/id/64/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 120).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Hey team, just looking at the metrics for the new dashboard launch. Are we still good for 2 PM deployment?",
      reactions: [{ emoji: '👀', count: 2 }]
    },
    {
      id: 'm2',
      user: 'David Ross (Eng)',
      avatar: 'https://picsum.photos/id/91/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 115).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Hold on. I'm seeing some elevated latency in the staging environment for the analytics widget. It's spiking to 2s.",
    },
    {
      id: 'm3',
      user: 'Marcus (DevOps)',
      avatar: 'https://picsum.photos/id/103/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 112).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "@David Ross I saw that too. It looks like the Redis cache isn't warming up correctly. Did we merge that config change?",
    },
    {
      id: 'm4',
      user: 'David Ross (Eng)',
      avatar: 'https://picsum.photos/id/91/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 110).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Checking... Ah, looks like PR #402 was reverted by accident during the conflict resolution earlier today. We are missing the cache eviction policy.",
    },
    {
      id: 'm5',
      user: 'Sarah Chen (Product)',
      avatar: 'https://picsum.photos/id/64/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 105).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Okay, what does that mean for the timeline? The marketing email goes out at 3 PM sharp.",
      reactions: [{ emoji: '😬', count: 3 }]
    },
    {
      id: 'm6',
      user: 'David Ross (Eng)',
      avatar: 'https://picsum.photos/id/91/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 100).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "We can fix it, but I need about 45 mins to re-apply the fix, verify on staging, and then green light. It's tight.",
    },
    {
      id: 'm7',
      user: 'Emily (QA)',
      avatar: 'https://picsum.photos/id/152/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 95).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "I can jump in and help verify immediately once it's on staging to speed things up.",
    },
    {
      id: 'm8',
      user: 'Marcus (DevOps)',
      avatar: 'https://picsum.photos/id/103/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 90).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "I'll prep the rollback strategy just in case. Let's do a partial rollout to 10% of traffic first.",
      reactions: [{ emoji: '🔥', count: 4 }]
    },
    {
      id: 'm9',
      user: 'Sarah Chen (Product)',
      avatar: 'https://picsum.photos/id/64/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 85).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Approved. Let's push deployment to 2:45 PM. I'll notify marketing to hold the email until we give the all-clear at 3:15 PM. Go go go!",
    },
    {
      id: 'm10',
      user: 'David Ross (Eng)',
      avatar: 'https://picsum.photos/id/91/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Fix is on staging. Latency back down to 200ms. @Emily ready for you.",
    },
    {
      id: 'm11',
      user: 'Emily (QA)',
      avatar: 'https://picsum.photos/id/152/48/48',
      timestamp: new Date(now.getTime() - 1000 * 60 * 15).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: "Verified. Analytics widget loads correctly. Data matches backend. We are green.",
      reactions: [{ emoji: '✅', count: 5 }, { emoji: '🚀', count: 2 }]
    },
  ];
  return messages;
}