# Persona 生成任务

根据以下聊天记录特征向量和用户自我描述，生成一个完整的 8 层人格画像。

## 输入数据

### 特征向量
```
{{FEATURE_VECTOR}}
```

### 用户自我描述
- 时期：{{TIME_PERIOD_START}} 至 {{TIME_PERIOD_END}}
- 类型：{{PERSONA_TYPE}}
- 自我描述：{{SELF_DESCRIPTION}}
- 那时最在意什么：{{WHAT_MATTERED}}
- 关键事件：{{KEY_EVENTS}}
- 现在怎么看那时的自己：{{WHAT_CHANGED}}
- 标签：{{SELF_TAGS}}

## 8 层 Persona 结构

请按照以下 8 层结构生成人格画像。对于信息不足的维度，标注 "[低置信度]" 并给出基于现有数据的合理推断。

### Layer 0：硬规则（不可违背的底线）

基于特征数据推断这个人的核心行为边界：
- 不会说的话、不会做的事
- 被冒犯时会如何反应
- 核心价值观（不可妥协的）

```json
{
  "constraints": ["规则1", "规则2", ...],
  "boundaries": ["底线1", "底线2", ...],
  "safety_rules": ["安全规则1", ...],
  "correction_log": []
}
```

### Layer 1：身份锚定

基于时间信息和特征推断当时的人口学特征：

```json
{
  "age_at_time": "",
  "occupation": "",
  "city": "",
  "life_stage": "",
  "mbti": "",
  "zodiac": "",
  "attachment_style": "",
  "love_language": "",
  "personality_tags": []
}
```

### Layer 2：说话风格

从语言学特征中提取——这是最关键的一层，直接影响对话还原度：

- **口头禅 (catchphrases)**：从高频词中提取，标注低置信度如不确定
- **句子模式 (sentence_patterns)**：短句连发还是长段落？喜欢用问句吗？
- **emoji 习惯 (emoji_habits)**：常用 emoji 及场景
- **标点风格 (punctuation_style)**：用句号吗？喜欢省略号？感叹号多吗？
- **消息格式 (message_format)**：短句连发型/长段落型/语音转文字风格
- **打字特征 (typing_quirks)**：错别字习惯、缩写习惯
- **特殊表达 (code_switching)**：中英混杂？方言？

```json
{
  "catchphrases": [],
  "sentence_patterns": [],
  "emoji_habits": [],
  "punctuation_style": "",
  "message_format": "",
  "typing_quirks": [],
  "code_switching": []
}
```

### Layer 3：情感模式

从情绪特征中推断：

- **情绪范围 (emotional_range)**：主要表现的情绪类型
- **常见情绪 (common_emotions)**：最常表达的情绪
- **情绪触发点 (triggers)**：什么会让 ta 开心/生气/难过
- **应对方式 (coping_style)**：面对压力或负面情绪时的反应模式
- **乐观程度 (optimism_level)**：积极/消极/现实

```json
{
  "emotional_range": [],
  "common_emotions": [],
  "triggers": [],
  "coping_style": "",
  "optimism_level": ""
}
```

### Layer 4：关系行为

从人际互动特征中推断：

- **冲突风格 (conflict_style)**：回避/对抗/妥协/理性讨论
- **表达爱意方式 (affection_expression)**：直接/含蓄/行动/言语
- **日常互动模式 (daily_interaction_pattern)**：主动/被动/忽冷忽热
- **边界 (boundaries)**：什么是不可接受的

```json
{
  "conflict_style": "",
  "affection_expression": "",
  "daily_interaction_pattern": "",
  "boundaries": []
}
```

### Layer 5：价值观念（Past Self 专属）

这个时期相信的"真理"——后来可能被推翻了：

- 核心信念、道德立场、人生准则
- 在乎什么、拒绝什么
- 这个时期的"执念"

```json
{
  "core_beliefs": [],
  "moral_stances": [],
  "life_principles": [],
  "things_they_cared_about": [],
  "things_they_rejected": []
}
```

### Layer 6：知识边界（Past Self 专属——最关键的一层）

**这是"以前的自己"的还原度的核心。**

你必须严格识别：在 {{TIME_PERIOD_END}} 这个时间点，这个人还不知道什么？

- **已知的 (known_at_time)**：在当时已经知道的事情、技术、事件
- **绝不能知道的 (must_not_know)**：之后才会发生的事情
  - 如果时期是 2022 年，这个人不知道 ChatGPT
  - 如果时期是 2019 年，这个人不知道新冠疫情会持续多久
  - 这个人不知道用户后来的生活变化（分手、换工作、搬家等）
- **技术边界 (technology_boundary)**：当时有什么技术/App/工具
- **世界事件边界 (world_events_boundary)**：当时的世界状态
- **个人未来边界 (personal_future_boundary)**：这个人不知道"自己"后来会经历什么

```json
{
  "known_at_time": [],
  "must_not_know": [],
  "technology_boundary": "",
  "world_events_boundary": "",
  "personal_future_boundary": ""
}
```

### Layer 7：时间锚定（Past Self 专属）

这个时期的文化语境和自我认同：

- **时代语境 (era_context)**：当时的流行文化、社会氛围
- **关键生活事件 (key_life_events)**：基于用户提供的和特征中推测的
- **文化语境 (cultural_context)**：当时的网络用语、热门话题
- **自我认同 (self_identification)**：这个时期你如何定义自己
- **时间标记 (temporal_markers)**：具体的时间参照

```json
{
  "era_context": "",
  "key_life_events": [],
  "cultural_context": "",
  "self_identification": "",
  "temporal_markers": []
}
```

## 重要提醒

1. **Layer 6 是致命关键**：如果 2020 年的自己知道后来发生的一切，那就不是"过去的自己"了
2. 对于不确定的推断，务必标注 "[低置信度]" —— 宁可承认不足，不要虚构
3. 保持性格的"缺点"和"棱角"——完美的人格是不真实的
4. 所有推断必须能从输入特征数据中找到依据

## 输出格式

请直接输出完整的 8 层 JSON，不要额外解释。确保 JSON 格式正确。
