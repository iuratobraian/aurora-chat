import { NewsFeed } from './NewsFeed';
import { RiskAssistant } from './RiskAssistant';
import { CourseAssistant } from './CourseAssistant';
import { CreatorAssistant } from './CreatorAssistant';
import { CreatorAssistantChat } from './CreatorAssistantChat';
import { VoiceAgent } from './VoiceAgent';
import { ExpertConsultant } from './ExpertConsultant';

export { NewsFeed };
export { RiskAssistant };
export { CourseAssistant };
export { CreatorAssistant };
export { CreatorAssistantChat };
export { VoiceAgent };
export { ExpertConsultant };

export const NewsFeedDefault = NewsFeed;
export const RiskAssistantDefault = RiskAssistant;
export const CourseAssistantDefault = CourseAssistant;
export const CreatorAssistantDefault = CreatorAssistant;
export const CreatorAssistantChatDefault = CreatorAssistantChat;
export const VoiceAgentDefault = VoiceAgent;
export const ExpertConsultantDefault = ExpertConsultant;

export type { NewsItem, AnalysisResult } from '../../services/agents/newsAgentService';

export {
  agentOrchestrator,
  default as orchestratorDefault,
  type AgentType,
  type AgentStatus,
  type AgentConfig,
  type AgentState,
  type AgentTask,
  type AgentResult
} from '../../services/agents/agentOrchestrator';

export {
  subAgentManager,
  default as subAgentManagerDefault,
  type SubAgentType,
  type SubAgentConfig,
  type SubAgentTask,
  type AggregatedResult,
  type SubAgentResult
} from '../../services/agents/subAgentManager';

export const AGENT_COMPONENTS = {
  newsfeed: { component: NewsFeed, name: 'NewsFeed Agent', icon: '📰' },
  risk: { component: RiskAssistant, name: 'Risk Assistant', icon: '🛡️' },
  course: { component: CourseAssistant, name: 'Course Assistant', icon: '📚' },
  creator: { component: CreatorAssistant, name: 'Creator Assistant', icon: '🎨' },
  creator_chat: { component: CreatorAssistantChat, name: 'Creator Chat', icon: '🎨' },
  voice: { component: VoiceAgent, name: 'Voice Agent', icon: '🎤' },
  expert: { component: ExpertConsultant, name: 'Expert Consultant', icon: '👨‍💼' }
} as const;

export type AgentComponentKey = keyof typeof AGENT_COMPONENTS;

export const getAgentComponent = (key: AgentComponentKey) => {
  return AGENT_COMPONENTS[key]?.component;
};

export const getAgentInfo = (key: AgentComponentKey) => {
  return AGENT_COMPONENTS[key];
};
