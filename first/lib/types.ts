// 生成器类型枚举
export type GeneratorType =
  | 'video-script'
  | 'moments-post'
  | 'sales-script'
  | 'event-plan'

// 多策略话术条目
export interface StrategyItem {
  label: string         // 策略名称
  icon: string          // emoji 图标
  content: string       // 话术内容
  category?: string     // 异议分类：价格异议/信任异议/竞品异议/时间异议
  style?: string        // 策略风格：温和/专业/直接，带心理策略标签
}

// API请求体
export interface GenerateRequest {
  type: GeneratorType
  input: string
  userId?: string
  multiStrategy?: boolean   // 是否生成多个策略方案
}

// API响应体
export interface GenerateResponse {
  success: boolean
  result: string
  strategies?: StrategyItem[]  // 多策略模式下的结果
  usage?: {
    promptTokens: number
    completionTokens: number
  }
  error?: string
}

// 生成器卡片配置
export interface GeneratorConfig {
  type: GeneratorType
  title: string
  description: string
  placeholder: string
  icon: string
}

// 本地历史记录
export interface HistoryItem {
  id: string
  type: GeneratorType
  input: string
  result: string
  strategies?: StrategyItem[]
  createdAt: number
}

// 用户信息（预留）
export interface UserInfo {
  id: string
  name: string
  email: string
  membership: 'free' | 'pro' | 'enterprise'
  monthlyQuota: number
  usedQuota: number
}
