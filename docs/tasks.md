# DevOps Co-pilot 任务拆解文档

> 版本：v2.0
> 更新日期：2025-12-19
> 状态：与 design.md / test.md 对齐

---

## 目录

1. [任务总览](#1-任务总览)
2. [详细任务清单](#2-详细任务清单)
3. [依赖关系](#3-依赖关系)
4. [执行检查清单](#4-执行检查清单)

---

## 1. 任务总览

### 1.1 模块划分

```
┌─────────────────────────────────────────────────────────────┐
│                        任务模块划分                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   M1. 项目初始化（6个任务）                                  │
│   ├── Next.js 项目创建                                      │
│   ├── 依赖安装                                              │
│   ├── 目录结构创建                                          │
│   ├── 环境变量配置                                          │
│   ├── TypeScript 配置                                       │
│   └── 启动验证                                              │
│                                                             │
│   M2. 核心后端（12个任务）                                   │
│   ├── 日志模块                                              │
│   ├── LLM 客户端                                            │
│   ├── Prompt 模块                                           │
│   ├── 翻译 API                                              │
│   └── 错误处理                                              │
│                                                             │
│   M3. 会话管理（10个任务）                                   │
│   ├── Session 类型                                          │
│   ├── Append-Only 索引                                      │
│   ├── Markdown 存储                                         │
│   ├── Session API                                           │
│   └── 异步持久化                                            │
│                                                             │
│   M4. 前端界面（15个任务）                                   │
│   ├── 类型定义                                              │
│   ├── 布局组件                                              │
│   ├── 输入面板                                              │
│   ├── 输出面板                                              │
│   ├── 会话栏                                                │
│   ├── 对话历史                                              │
│   ├── SSE Hook                                              │
│   └── 状态管理                                              │
│                                                             │
│   M5. 前后端联调（5个任务）                                  │
│   ├── 接口联调                                              │
│   ├── 流式渲染验证                                          │
│   ├── 会话管理验证                                          │
│   └── 错误处理验证                                          │
│                                                             │
│   M6. E2E 测试验证（8个任务）                                │
│   ├── 典型用户流程                                          │
│   ├── 多轮对话                                              │
│   ├── 上下文恢复                                            │
│   └── 容错场景                                              │
│                                                             │
│   M7. 文档完善（2个任务）                                    │
│   └── README.md                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 任务统计

| 模块 | 任务数 |
|-----|-------|
| M1. 项目初始化 | 6 |
| M2. 核心后端 | 12 |
| M3. 会话管理 | 10 |
| M4. 前端界面 | 15 |
| M5. 前后端联调 | 5 |
| M6. E2E 测试验证 | 8 |
| M7. 文档完善 | 2 |
| **总计** | **58** |


---

## 2. 详细任务清单

### M1. 项目初始化

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-101 | 创建 Next.js 项目 | `npx create-next-app@latest --typescript --tailwind --app` | P0 | ⬜ |
| T-102 | 安装核心依赖 | `openai`, `nanoid`, `react-markdown` | P0 | ⬜ |
| T-103 | 创建目录结构 | 按 design.md 第8章创建 lib/, components/, sessions/ | P0 | ⬜ |
| T-104 | 配置环境变量 | 创建 `.env.local`，配置 DeepSeek API Key | P0 | ⬜ |
| T-105 | TypeScript 配置 | 确认 tsconfig.json 路径别名 `@/*` | P0 | ⬜ |
| T-106 | 启动验证 | `npm run dev` 确认项目正常启动 | P0 | ⬜ |

**T-101 命令**：
```bash
npx create-next-app@latest co-pilot --typescript --tailwind --app --src-dir=false
```

**T-102 依赖清单**：
```bash
npm install openai nanoid react-markdown
```

**T-103 目录结构**：
```
co-pilot/
├── app/
│   ├── api/
│   │   ├── translate/route.ts
│   │   └── session/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── InputPanel.tsx
│   ├── OutputPanel.tsx
│   ├── SessionBar.tsx
│   └── ChatHistory.tsx
├── lib/
│   ├── llm/
│   │   ├── config.ts
│   │   └── client.ts
│   ├── prompts/
│   │   └── system-prompt.ts
│   ├── session/
│   │   ├── types.ts
│   │   ├── manager.ts
│   │   ├── storage.ts
│   │   ├── index-log.ts
│   │   └── persist.ts
│   ├── logger.ts
│   ├── trace.ts
│   └── types.ts
├── hooks/
│   ├── useTranslate.ts
│   └── useSession.ts
├── sessions/
│   └── _index.jsonl
└── .env.local
```

**T-104 环境变量**：
```bash
# .env.local
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-reasoner
LOG_LEVEL=INFO
```

---

### M2. 核心后端

#### 2.1 日志模块

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-201 | TraceId 生成器 | 创建 `lib/trace.ts`，使用 nanoid 生成 8 位 traceId | P0 | ⬜ |
| T-202 | Logger 工具类 | 创建 `lib/logger.ts`，格式：`{timestamp} [{level}] [{traceId}] {caller} - {message}` | P0 | ⬜ |

**T-201 代码**：
```typescript
// lib/trace.ts
import { nanoid } from 'nanoid';
export function generateTraceId(): string {
  return nanoid(8);
}
```

**T-202 日志格式**：
```
2025-12-19 10:49:34.494 [INFO ] [abc123] TranslateAPI - Request received
```

#### 2.2 LLM 客户端

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-203 | LLM 配置模块 | 创建 `lib/llm/config.ts`，读取环境变量 | P0 | ⬜ |
| T-204 | LLM 客户端基础 | 创建 `lib/llm/client.ts`，初始化 OpenAI SDK | P0 | ⬜ |
| T-205 | 流式调用封装 | 实现 `streamChat()` 方法，返回 AsyncGenerator | P0 | ⬜ |
| T-206 | 错误处理封装 | 处理 API 错误、超时、限流 | P0 | ⬜ |

**T-203 配置结构**：
```typescript
// lib/llm/config.ts
export interface LLMConfig {
  provider: 'deepseek';
  apiKey: string;
  baseURL: string;
  model: string;
}
export function getLLMConfig(): LLMConfig { ... }
```

**T-205 核心方法**：
```typescript
// lib/llm/client.ts
async *streamChat(
  systemPrompt: string,
  userMessage: string,
  traceId: string
): AsyncGenerator<string> {
  // 1. 调用 OpenAI SDK stream
  // 2. 逐 chunk yield
  // 3. 记录日志
}
```

#### 2.3 Prompt 模块

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-207 | System Prompt 定义 | 创建 `lib/prompts/system-prompt.ts`，完整 Prompt | P0 | ⬜ |
| T-208 | 上下文构造函数 | 实现 `buildContextPrompt(turns: Turn[]): string` | P0 | ⬜ |

**T-207 Prompt 结构**：
```
Part 1: 角色定义
Part 2: 识别规则（4种场景）
Part 3: 翻译规则（产品→开发 / 开发→产品）
Part 4: 输出格式
Part 5: 上下文处理
```

#### 2.4 翻译 API

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-209 | 翻译 API 路由 | 创建 `app/api/translate/route.ts` | P0 | ⬜ |
| T-210 | 输入验证 | 验证 content 长度 1-5000 字符 | P0 | ⬜ |
| T-211 | SSE 流式响应 | 实现 `text/event-stream` 响应 | P0 | ⬜ |
| T-212 | 关键链路日志 | 在请求入口、LLM 调用、完成等节点记录日志 | P0 | ⬜ |

**T-211 SSE 格式**：
```
data: {"content":"🎯 识别结果","done":false}
data: {"content":"\n━━━━━","done":false}
...
data: {"content":"","done":true}
```


---

### M3. 会话管理

#### 3.1 Session 类型定义

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-301 | Session 接口定义 | 创建 `lib/session/types.ts`，定义 Session, Turn, RecognitionResult | P0 | ⬜ |
| T-302 | SessionId 生成 | 实现 `generateSessionId(): string`，格式 `{timestamp}_{randomId}` | P0 | ⬜ |

**T-301 类型定义**：
```typescript
// lib/session/types.ts
interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  turns: Turn[];
}

interface Turn {
  index: number;
  timestamp: string;
  userInput: string;
  recognition: RecognitionResult;
  systemOutput: string;
}

type RecognitionResult =
  | { type: 'business'; confidence: number }
  | { type: 'technical'; confidence: number }
  | { type: 'insufficient'; questions: string[] }
  | { type: 'unrecognized'; reason: string };
```

#### 3.2 Append-Only 索引

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-303 | 索引文件初始化 | 创建 `sessions/_index.jsonl`，确保目录存在 | P0 | ⬜ |
| T-304 | appendLog 函数 | 实现追加写入索引，格式 `{"op":"C","id":"...","ts":...,"pv":"..."}` | P0 | ⬜ |
| T-305 | getLatestSessionId 函数 | 实现读取文件尾部获取最新 Session ID | P0 | ⬜ |
| T-306 | getAllSessions 函数 | 实现读取所有 Session 列表（用于侧边栏） | P0 | ⬜ |

**T-304 索引格式**：
```jsonl
{"op":"C","id":"1734412800000_a1b2c3","ts":1734412800000,"pv":"我们需要一个智能推荐..."}
{"op":"U","id":"1734412800000_a1b2c3","ts":1734412860000,"ti":2}
```

#### 3.3 Markdown 存储

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-307 | 序列化 Session 为 Markdown | 实现 `serializeSession(session: Session): string` | P0 | ⬜ |
| T-308 | 解析 Markdown 为 Session | 实现 `parseSession(markdown: string): Session` | P0 | ⬜ |
| T-309 | 文件读写操作 | 实现 `readSessionFile()`, `writeSessionFile()` | P0 | ⬜ |

**T-307 Markdown 格式**：
```markdown
# Session: 1702800000000_abc123

> 创建时间：2025-12-19 10:00:00
> 最后更新：2025-12-19 10:15:00

---

## 第 1 轮

### 用户输入
我们需要一个智能推荐功能...

### 识别结果
- 类型：业务语言
- 置信度：0.95

### 系统输出
🎯 **识别结果**
...
```

#### 3.4 异步持久化

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-310 | persistTurnAsync 函数 | 实现异步持久化，不阻塞 SSE 主流程 | P0 | ⬜ |

**T-310 核心逻辑**：
```typescript
// lib/session/persist.ts
export async function persistTurnAsync(
  sessionId: string | null,
  turn: Turn,
  isFirstTurn: boolean
): Promise<string> {
  const finalSessionId = sessionId || generateSessionId();

  // 异步执行，不阻塞主流程
  setImmediate(async () => {
    if (isFirstTurn) {
      await createSessionFile(finalSessionId, turn);
      await logSessionCreate(finalSessionId, turn.userInput);
    } else {
      await appendTurnToFile(finalSessionId, turn);
      await logSessionUpdate(finalSessionId, turn.index);
    }
  });

  return finalSessionId;
}
```

---

### M4. 前端界面

#### 4.1 类型定义

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-401 | 前端类型定义 | 创建 `lib/types.ts`，定义 TranslateState, SSEChunk 等 | P0 | ⬜ |

**T-401 类型定义**：
```typescript
// lib/types.ts
interface TranslateState {
  input: string;
  output: string;
  status: 'idle' | 'loading' | 'streaming' | 'done' | 'error';
  error: string | null;
}

interface SSEChunk {
  content: string;
  done: boolean;
}
```

#### 4.2 布局组件

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-402 | 页面布局 | 修改 `app/layout.tsx`，设置全局样式 | P0 | ⬜ |
| T-403 | Header 组件 | 创建 `components/Header.tsx`，显示标题和 Logo | P0 | ⬜ |
| T-404 | 主页面结构 | 修改 `app/page.tsx`，组合各组件 | P0 | ⬜ |

**T-404 页面布局**：
```
┌─────────────────────────────────────────────────────────────┐
│                         Header                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    SessionBar                        │   │
│   │   [+ 新建会话]  当前会话: 2025-12-19 10:00          │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   ChatHistory                        │   │
│   │   (历史对话轮次展示)                                  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   InputPanel                         │   │
│   │   [输入框]                          [开始翻译]       │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   OutputPanel                        │   │
│   │   (流式输出展示区)                                   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3 输入面板

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-405 | InputPanel 组件 | 创建 `components/InputPanel.tsx` | P0 | ⬜ |
| T-406 | 输入验证 | 前端验证输入长度 1-5000 字符 | P0 | ⬜ |
| T-407 | 快捷键支持 | Ctrl+Enter 提交 | P0 | ⬜ |

#### 4.4 输出面板

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-408 | OutputPanel 组件 | 创建 `components/OutputPanel.tsx` | P0 | ⬜ |
| T-409 | Markdown 渲染 | 使用 react-markdown 渲染输出 | P0 | ⬜ |
| T-410 | 打字机光标效果 | 流式输出时显示闪烁光标 | P0 | ⬜ |
| T-411 | 状态指示器 | 显示 loading/streaming/done/error 状态 | P0 | ⬜ |

#### 4.5 会话栏

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-412 | SessionBar 组件 | 创建 `components/SessionBar.tsx` | P0 | ⬜ |
| T-413 | 新建会话按钮 | 点击 "+" 创建新会话 | P0 | ⬜ |
| T-414 | 当前会话显示 | 显示当前会话 ID 或时间 | P0 | ⬜ |

#### 4.6 对话历史

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-415 | ChatHistory 组件 | 创建 `components/ChatHistory.tsx` | P0 | ⬜ |
| T-416 | 历史轮次渲染 | 展示每轮的用户输入和系统输出 | P0 | ⬜ |

#### 4.7 SSE Hook

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-417 | useTranslate Hook | 创建 `hooks/useTranslate.ts` | P0 | ⬜ |
| T-418 | SSE 流式处理 | 使用 fetch + ReadableStream 处理 SSE | P0 | ⬜ |
| T-419 | 错误处理 | 处理网络错误、超时、流中断 | P0 | ⬜ |

**T-417 Hook 接口**：
```typescript
// hooks/useTranslate.ts
export function useTranslate() {
  const [state, setState] = useState<TranslateState>({...});

  const translate = async (content: string, sessionId?: string) => {
    // 1. 设置 loading 状态
    // 2. 调用 /api/translate
    // 3. 处理 SSE 流
    // 4. 累积输出
    // 5. 完成或错误处理
  };

  return { ...state, translate };
}
```

#### 4.8 会话 Hook

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-420 | useSession Hook | 创建 `hooks/useSession.ts` | P0 | ⬜ |
| T-421 | 加载最新会话 | 应用启动时加载最新 Session | P0 | ⬜ |
| T-422 | 创建新会话 | 点击 "+" 时创建临时 Session | P0 | ⬜ |


---

### M5. 前后端联调

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-501 | 翻译接口联调 | 验证 /api/translate 接口正常工作 | P0 | ⬜ |
| T-502 | 流式渲染验证 | 验证前端能正确接收和渲染 SSE 流 | P0 | ⬜ |
| T-503 | 会话管理联调 | 验证会话创建、加载、持久化正常 | P0 | ⬜ |
| T-504 | 错误处理验证 | 验证各种错误场景的处理 | P0 | ⬜ |
| T-505 | 日志输出验证 | 验证关键链路日志正确输出 | P0 | ⬜ |

**T-501 验证方法**：
```bash
# 使用 curl 测试 API
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"content":"我们需要一个智能推荐功能"}' \
  --no-buffer
```

**T-505 日志检查点**：
```
✓ TranslateAPI - Request received
✓ LLMClient - Stream started
✓ LLMClient - First chunk received
✓ SessionPersist - Turn persisted async
✓ TranslateAPI - Request completed
```

---

### M6. E2E 测试验证（Playwright MCP）

> **说明**：所有 E2E 测试通过 Playwright MCP 实操，AI 助手直接操作浏览器进行验证。

#### 6.1 典型用户流程

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-601 | E2E-001 产品经理流程 | 输入业务需求，验证翻译成技术语言 | P0 | ⬜ |
| T-602 | E2E-002 开发工程师流程 | 输入技术成果，验证翻译成业务价值 | P0 | ⬜ |
| T-603 | E2E-003 业务指标驱动 | 输入 DAU 提升需求，验证技术方案 | P0 | ⬜ |
| T-604 | E2E-004 用户反馈问题 | 输入"页面太慢"，验证性能优化方案 | P0 | ⬜ |

**T-601 操作步骤**：
```
1. browser_navigate → http://localhost:3000
2. browser_snapshot → 确认页面加载
3. browser_type → 输入"我们需要一个智能推荐功能，提升用户停留时长"
4. browser_click → 点击"开始翻译"
5. browser_snapshot → 观察输出结果
6. 验收：识别为【产品→开发】，包含5个维度
```

#### 6.2 多轮对话

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-605 | E2E-201 信息不足追问 | 输入简短内容，验证系统追问 | P0 | ⬜ |
| T-606 | E2E-202 多人协作 | 产品输入后开发输入，验证上下文 | P0 | ⬜ |

#### 6.3 上下文恢复（核心）

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-607 | E2E-203 关闭浏览器后恢复 | 关闭页面重新打开，验证历史回显 | P0 | ⬜ |
| T-608 | E2E-204 长对话围绕一个需求 | 5轮对话，验证上下文累积 | P0 | ⬜ |

**T-607 操作步骤**：
```
准备：先完成一轮对话
1. browser_close → 关闭页面
2. browser_navigate → 重新打开 http://localhost:3000
3. browser_snapshot → 验证历史对话回显
4. browser_type → 输入"那技术方案大概需要多久？"
5. browser_click → 点击翻译
6. browser_snapshot → 验证输出引用了之前的上下文
```

**T-608 操作步骤**：
```
第1轮：产品输入需求
第2轮：开发追问细节
第3轮：产品补充信息
第4轮：开发给出方案
第5轮：产品确认验收标准
验收：每轮输出都能引用之前的上下文
```

#### 6.4 容错场景

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-609 | E2E-401 无法识别 | 输入"今天天气怎么样"，验证友好提示 | P0 | ⬜ |
| T-610 | E2E-402 边界输入 | 测试空输入、超长输入 | P0 | ⬜ |

---

### M7. 文档完善

| 任务ID | 任务名称 | 描述 | 优先级 | 状态 |
|-------|---------|------|-------|------|
| T-701 | README.md | 编写项目说明文档 | P1 | ⬜ |
| T-702 | 启动指南 | 说明如何启动和使用项目 | P1 | ⬜ |

**T-701 内容结构**：
```markdown
# DevOps Co-pilot

## 简介
研发效能协作智能体，产品与开发之间的沟通翻译助手

## 快速开始
1. 安装依赖：npm install
2. 配置环境变量：复制 .env.example 到 .env.local
3. 启动项目：npm run dev
4. 访问：http://localhost:3000

## 功能说明
- 产品→开发：业务需求翻译成技术方案
- 开发→产品：技术成果翻译成业务价值
- 多轮对话：支持上下文累积
- 会话管理：支持历史会话恢复
```


---

## 3. 依赖关系

### 3.1 模块依赖图

```
┌─────────────────────────────────────────────────────────────┐
│                        模块依赖关系                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   M1. 项目初始化                                             │
│      │                                                      │
│      ├──→ M2. 核心后端                                      │
│      │       │                                              │
│      │       └──→ M5. 前后端联调 ──→ M6. E2E 测试           │
│      │               ↑                                      │
│      ├──→ M3. 会话管理 ──┘                                  │
│      │               ↑                                      │
│      └──→ M4. 前端界面 ──┘                                  │
│                                                             │
│                              M7. 文档完善（可并行）          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 任务依赖详情

```
M1 项目初始化
├── T-101 创建项目
│   ├── T-102 安装依赖
│   ├── T-103 目录结构
│   ├── T-104 环境变量
│   ├── T-105 TS配置
│   └── T-106 启动验证

M2 核心后端（依赖 M1）
├── T-201 TraceId → T-202 Logger
├── T-203 LLM配置 → T-204 LLM客户端 → T-205 流式调用 → T-206 错误处理
├── T-207 Prompt → T-208 上下文构造
└── T-209 API路由 → T-210 输入验证 → T-211 SSE响应 → T-212 日志埋点

M3 会话管理（依赖 M1）
├── T-301 类型定义 → T-302 SessionId生成
├── T-303 索引初始化 → T-304 appendLog → T-305 getLatest → T-306 getAll
├── T-307 序列化 → T-308 解析 → T-309 文件读写
└── T-310 异步持久化

M4 前端界面（依赖 M1）
├── T-401 类型定义
├── T-402 布局 → T-403 Header → T-404 主页面
├── T-405 InputPanel → T-406 验证 → T-407 快捷键
├── T-408 OutputPanel → T-409 Markdown → T-410 光标 → T-411 状态
├── T-412 SessionBar → T-413 新建 → T-414 显示
├── T-415 ChatHistory → T-416 轮次渲染
└── T-417 useTranslate → T-418 SSE处理 → T-419 错误处理
    T-420 useSession → T-421 加载 → T-422 创建

M5 前后端联调（依赖 M2, M3, M4）
├── T-501 接口联调
├── T-502 流式渲染
├── T-503 会话管理
├── T-504 错误处理
└── T-505 日志验证

M6 E2E测试（依赖 M5）
├── T-601~T-604 典型流程
├── T-605~T-606 多轮对话
├── T-607~T-608 上下文恢复
└── T-609~T-610 容错场景

M7 文档完善（可并行）
├── T-701 README
└── T-702 启动指南
```

## 4. 执行检查清单

```markdown
## 执行检查清单

### M1. 项目初始化
- [ ] T-101: 创建 Next.js 项目
- [ ] T-102: 安装核心依赖（openai, nanoid, react-markdown）
- [ ] T-103: 创建目录结构（lib/, components/, hooks/, sessions/）
- [ ] T-104: 配置环境变量（.env.local）
- [ ] T-105: 确认 TypeScript 配置
- [ ] T-106: 启动验证（npm run dev）

### M2. 核心后端
#### 日志模块
- [ ] T-201: TraceId 生成器
- [ ] T-202: Logger 工具类

#### LLM 客户端
- [ ] T-203: LLM 配置模块
- [ ] T-204: LLM 客户端基础
- [ ] T-205: 流式调用封装
- [ ] T-206: 错误处理封装

#### Prompt 模块
- [ ] T-207: System Prompt 定义
- [ ] T-208: 上下文构造函数

#### 翻译 API
- [ ] T-209: 翻译 API 路由
- [ ] T-210: 输入验证
- [ ] T-211: SSE 流式响应
- [ ] T-212: 关键链路日志

### M3. 会话管理
#### Session 类型
- [ ] T-301: Session 接口定义
- [ ] T-302: SessionId 生成

#### Append-Only 索引
- [ ] T-303: 索引文件初始化
- [ ] T-304: appendLog 函数
- [ ] T-305: getLatestSessionId 函数
- [ ] T-306: getAllSessions 函数

#### Markdown 存储
- [ ] T-307: 序列化 Session 为 Markdown
- [ ] T-308: 解析 Markdown 为 Session
- [ ] T-309: 文件读写操作

#### 异步持久化
- [ ] T-310: persistTurnAsync 函数

### M4. 前端界面
#### 类型定义
- [ ] T-401: 前端类型定义

#### 布局组件
- [ ] T-402: 页面布局
- [ ] T-403: Header 组件
- [ ] T-404: 主页面结构

#### 输入面板
- [ ] T-405: InputPanel 组件
- [ ] T-406: 输入验证
- [ ] T-407: 快捷键支持

#### 输出面板
- [ ] T-408: OutputPanel 组件
- [ ] T-409: Markdown 渲染
- [ ] T-410: 打字机光标效果
- [ ] T-411: 状态指示器

#### 会话栏
- [ ] T-412: SessionBar 组件
- [ ] T-413: 新建会话按钮
- [ ] T-414: 当前会话显示

#### 对话历史
- [ ] T-415: ChatHistory 组件
- [ ] T-416: 历史轮次渲染

#### SSE Hook
- [ ] T-417: useTranslate Hook
- [ ] T-418: SSE 流式处理
- [ ] T-419: 错误处理

#### 会话 Hook
- [ ] T-420: useSession Hook
- [ ] T-421: 加载最新会话
- [ ] T-422: 创建新会话

### M5. 前后端联调
- [ ] T-501: 翻译接口联调
- [ ] T-502: 流式渲染验证
- [ ] T-503: 会话管理联调
- [ ] T-504: 错误处理验证
- [ ] T-505: 日志输出验证

### M6. E2E 测试验证
#### 典型用户流程
- [ ] T-601: E2E-001 产品经理流程
- [ ] T-602: E2E-002 开发工程师流程
- [ ] T-603: E2E-003 业务指标驱动
- [ ] T-604: E2E-004 用户反馈问题

#### 多轮对话
- [ ] T-605: E2E-201 信息不足追问
- [ ] T-606: E2E-202 多人协作

#### 上下文恢复
- [ ] T-607: E2E-203 关闭浏览器后恢复
- [ ] T-608: E2E-204 长对话围绕一个需求

#### 容错场景
- [ ] T-609: E2E-401 无法识别
- [ ] T-610: E2E-402 边界输入

### M7. 文档完善
- [ ] T-701: README.md
- [ ] T-702: 启动指南
```

---

## 附录

### A. 风险项

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| LLM API 不稳定 | 功能不可用 | 添加重试机制，记录详细日志 |
| 流式输出兼容性 | 部分浏览器异常 | 使用 fetch + ReadableStream 方案 |
| Prompt 效果不佳 | 翻译质量低 | 预留 Prompt 调优时间，通过日志分析 |
| 上下文过长 | Token 超限 | MVP 先不压缩，后续迭代优化 |
| 追问死循环 | 用户体验差 | 设置最大轮次限制（默认4轮） |
| 会话文件损坏 | 数据丢失 | Append-Only 设计，天然安全 |

### B. 日志辅助问题排查

当 E2E 测试不符合预期时，通过日志定位问题：

```
问题类型          │ 日志检查点                    │ 可能原因
─────────────────┼──────────────────────────────┼─────────────────
识别错误          │ SceneRecognizer 日志         │ Prompt 识别规则不完善
翻译质量差        │ LLMClient 输入输出日志        │ Prompt 翻译规则需调整
上下文未利用      │ buildContextPrompt 日志      │ 上下文构造逻辑问题
会话未持久化      │ SessionPersist 日志          │ 异步持久化失败
流式中断          │ LLMClient stream 日志        │ 网络问题或 API 限流
```

---

*文档结束*