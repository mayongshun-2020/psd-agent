"use client";

import {
  BookOpen,
  Boxes,
  ClipboardCheck,
  Cpu,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  API_BASE,
  artifactUrl,
  fetchDefaults,
  generateWorkflow,
  type AgentPrompts,
  type OutputType,
  type StageMeta,
  type WorkflowPayload,
  type WorkflowResult,
} from "@/lib/api";
import { PipelineRibbon } from "./PipelineRibbon";
import { Section } from "./Section";
import { StageTimeline } from "./StageTimeline";

const FALLBACK_STAGES: StageMeta[] = [
  { id: "product_understanding", title: "商品理解 Agent", icon: "eye" },
  { id: "product_brief", title: "Product Brief", icon: "layers" },
  { id: "brand_knowledge", title: "品牌知识库 / 规则版本", icon: "library" },
  { id: "page_planner", title: "页面规划 Agent", icon: "palette" },
  { id: "layout_engine", title: "Layout Engine", icon: "grid" },
  { id: "copy", title: "文案 Agent", icon: "type" },
  { id: "figma_psd", title: "Figma / PSD 生成 Agent", icon: "file-image" },
  { id: "design_score", title: "Design Score", icon: "check-circle" },
  { id: "output_review", title: "输出、审核与反馈", icon: "check-circle" },
];

const PROMPT_LABELS: Record<keyof AgentPrompts, string> = {
  system_prompt: "主控 System Prompt",
  vision_agent_prompt: "商品理解 Agent",
  structured_agent_prompt: "Product Brief Agent",
  brand_rag_agent_prompt: "品牌知识库与规则版本 Agent",
  design_agent_prompt: "页面规划 Agent",
  layout_agent_prompt: "Layout Engine Agent",
  copy_agent_prompt: "文案 Agent",
  psd_agent_prompt: "Figma / PSD 生成 Agent",
};

const OUTPUT_LABELS: Record<OutputType, string> = {
  detail_page: "商品详情页方案",
  figma_page: "Figma 页面",
  psd_file: "PSD 兼容文件",
  main_image: "主图设计稿",
  banner: "广告 Banner",
};

type ConfigSection = "model_config" | "typography" | "layout" | "prompts";

function patchSection<K extends ConfigSection>(
  value: WorkflowPayload,
  section: K,
  patch: Partial<WorkflowPayload[K]>,
): WorkflowPayload {
  return { ...value, [section]: { ...value[section], ...patch } };
}

export function PsdWorkflowApp() {
  const [payload, setPayload] = useState<WorkflowPayload | null>(null);
  const [stages, setStages] = useState<StageMeta[]>(FALLBACK_STAGES);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaults()
      .then((defaults) => {
        setPayload(defaults.payload);
        if (defaults.stages?.length) setStages(defaults.stages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const previewUrl = useMemo(
    () => (result?.run_id ? artifactUrl(result.run_id, "preview.svg") : null),
    [result],
  );

  if (!payload) {
    return (
      <main className="page">
        <div className="boot">
          <Loader2 className="spin" size={22} /> 正在加载工作流配置…
          {error ? <div className="error">{error}</div> : null}
        </div>
      </main>
    );
  }

  const setField = <K extends keyof WorkflowPayload>(
    key: K,
    value: WorkflowPayload[K],
  ) => setPayload((current) => (current ? { ...current, [key]: value } : current));

  const setModel = (key: keyof WorkflowPayload["model_config"], value: unknown) =>
    setPayload((c) =>
      c
        ? patchSection(c, "model_config", {
            [key]: value,
          } as Partial<WorkflowPayload["model_config"]>)
        : c,
    );

  const setTypo = (key: keyof WorkflowPayload["typography"], value: unknown) =>
    setPayload((c) =>
      c
        ? patchSection(c, "typography", {
            [key]: value,
          } as Partial<WorkflowPayload["typography"]>)
        : c,
    );

  const setLayout = (key: keyof WorkflowPayload["layout"], value: unknown) =>
    setPayload((c) =>
      c
        ? patchSection(c, "layout", {
            [key]: value,
          } as Partial<WorkflowPayload["layout"]>)
        : c,
    );

  const setPrompt = (key: keyof AgentPrompts, value: string) =>
    setPayload((c) =>
      c ? patchSection(c, "prompts", { [key]: value } as Partial<AgentPrompts>) : c,
    );

  const toggleOutput = (type: OutputType) =>
    setPayload((c) => {
      if (!c) return c;
      const exists = c.output_types.includes(type);
      return {
        ...c,
        output_types: exists
          ? c.output_types.filter((item) => item !== type)
          : [...c.output_types, type],
      };
    });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await generateWorkflow(payload, files));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <header className="hero">
        <div className="hero-text">
          <div className="eyebrow">
            <Sparkles size={14} /> BrandOS AI Design Operating System
          </div>
          <h1>BrandOS AI 电商设计平台</h1>
          <p>
            围绕「品牌资产 → 品牌知识库 → 规则版本 → Product Brief → 页面规划 → Layout
            Engine → Figma / PSD → 评分与反馈」编排。当前页面是可运行的 MVP 控制台，对齐新版
            PRD 与静态原型的核心链路。
          </p>
        </div>
        <div className="hero-side">
          <span className={`pill ${payload.model_config.enable_deepagents ? "pill-on" : "pill-off"}`}>
            <Cpu size={14} />
            {payload.model_config.enable_deepagents ? "DeepAgents 开启" : "规则降级"}
          </span>
          <span className="pill pill-ghost">{API_BASE}</span>
        </div>
      </header>

      <section className="ribbon-wrap">
        <PipelineRibbon
          stages={stages}
          results={result?.stages ?? []}
          running={loading}
        />
      </section>

      <section className="brandos-overview">
        <OverviewCard
          icon={<BookOpen size={17} />}
          label="品牌知识库"
          title="Core / Derived / Asset Memory"
          text="核心规则不可自动覆盖，新资产先进入训练池并生成变更建议。"
        />
        <OverviewCard
          icon={<ShieldCheck size={17} />}
          label="规则版本"
          title="V1.1 Draft → 审批发布"
          text="支持 Diff、审批、回滚和审计思路，避免持续上传导致品牌漂移。"
        />
        <OverviewCard
          icon={<Layers size={17} />}
          label="页面中间结构"
          title="Layout JSON First"
          text="详情页不是一张图，先生成模块、组件和图层结构，再映射设计稿。"
        />
        <OverviewCard
          icon={<ClipboardCheck size={17} />}
          label="评分与反馈"
          title="Design Score + Human Feedback"
          text="输出评分解释和设计师修改记录，但本阶段不自动改写品牌规则。"
        />
      </section>

      <div className="shell">
        <section className="panel config-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={18} /> 工作流配置
            </div>
          </div>

          <div className="panel-scroll">
            <Section
              title="任务基础信息"
              description="品牌、商品、规则模式与 Product Brief"
              icon={<FileText size={16} />}
              defaultOpen
            >
              <div className="grid-2">
                <Field label="项目名称">
                  <input
                    value={payload.project_name}
                    onChange={(e) => setField("project_name", e.target.value)}
                  />
                </Field>
                <Field label="品牌名称">
                  <input
                    value={payload.brand_name}
                    onChange={(e) => setField("brand_name", e.target.value)}
                  />
                </Field>
                <Field label="商品名称">
                  <input
                    value={payload.product_name}
                    onChange={(e) => setField("product_name", e.target.value)}
                  />
                </Field>
                <Field label="工作流模式">
                  <select
                    value={payload.workflow_mode}
                    onChange={(e) =>
                      setField(
                        "workflow_mode",
                        e.target.value as WorkflowPayload["workflow_mode"],
                      )
                    }
                  >
                    <option value="smart_recommend">智能推荐模式</option>
                    <option value="strict_brand">严格品牌规范模式</option>
                  </select>
                </Field>
              </div>
                <Field label="Product Brief / 商品信息">
                <textarea
                  value={payload.product_brief}
                  onChange={(e) => setField("product_brief", e.target.value)}
                />
              </Field>
              <Field label="品牌规范 / Core Rule">
                <textarea
                  value={payload.brand_guidelines}
                  onChange={(e) => setField("brand_guidelines", e.target.value)}
                />
              </Field>
              <Field label="参考案例 / Asset Memory">
                <textarea
                  value={payload.reference_notes}
                  onChange={(e) => setField("reference_notes", e.target.value)}
                />
              </Field>
            </Section>

            <Section
              title="品牌资产与输出"
              description="上传品牌规范、参考案例、商品图、字体"
              icon={<Upload size={16} />}
              badge={files.length ? `${files.length} 个文件` : undefined}
              defaultOpen
            >
              <label className="dropzone">
                <Upload size={18} />
                <span>点击选择资产文件（可多选）</span>
                <input
                  multiple
                  style={{ display: "none" }}
                  type="file"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              {files.length ? (
                <div className="chips">
                  {files.map((file) => (
                    <span className="chip-static" key={`${file.name}-${file.size}`}>
                      <ImageIcon size={13} />
                      {file.name} · {(file.size / 1024).toFixed(0)} KB
                    </span>
                  ))}
                </div>
              ) : (
                <p className="hint">未选择文件时，将基于文本、默认规则版本和示例 Asset Memory 生成。</p>
              )}
              <div className="section-subtitle">输出类型</div>
              <div className="chips">
                {(Object.keys(OUTPUT_LABELS) as OutputType[]).map((type) => (
                  <label
                    className={`chip-toggle ${
                      payload.output_types.includes(type) ? "chip-active" : ""
                    }`}
                    key={type}
                  >
                    <input
                      checked={payload.output_types.includes(type)}
                      type="checkbox"
                      onChange={() => toggleOutput(type)}
                    />
                    {OUTPUT_LABELS[type]}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="模型参数" description="Provider / 模型 / Key" icon={<Cpu size={16} />}>
              <div className="grid-2">
                <Field label="Provider">
                  <input
                    value={payload.model_config.provider}
                    onChange={(e) => setModel("provider", e.target.value)}
                  />
                </Field>
                <Field label="文本模型">
                  <input
                    value={payload.model_config.model}
                    onChange={(e) => setModel("model", e.target.value)}
                  />
                </Field>
                <Field label="视觉模型（多模态）">
                  <input
                    value={payload.model_config.vision_model}
                    onChange={(e) => setModel("vision_model", e.target.value)}
                  />
                </Field>
                <Field label={`视觉最多读图 · ${payload.model_config.max_vision_images}`}>
                  <input
                    max={12}
                    min={1}
                    type="range"
                    value={payload.model_config.max_vision_images}
                    onChange={(e) =>
                      setModel("max_vision_images", Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Base URL">
                  <input
                    value={payload.model_config.base_url ?? ""}
                    placeholder="OpenAI compatible 可选"
                    onChange={(e) => setModel("base_url", e.target.value)}
                  />
                </Field>
                <Field label="API Key">
                  <input
                    type="password"
                    value={payload.model_config.api_key ?? ""}
                    placeholder="可留空，后端读环境变量"
                    onChange={(e) => setModel("api_key", e.target.value)}
                  />
                </Field>
                <Field label={`Temperature · ${payload.model_config.temperature}`}>
                  <input
                    max={2}
                    min={0}
                    step={0.1}
                    type="range"
                    value={payload.model_config.temperature}
                    onChange={(e) => setModel("temperature", Number(e.target.value))}
                  />
                </Field>
                <Field label="Max Tokens">
                  <input
                    min={512}
                    step={512}
                    type="number"
                    value={payload.model_config.max_tokens}
                    onChange={(e) => setModel("max_tokens", Number(e.target.value))}
                  />
                </Field>
              </div>
              <label className="switch">
                <input
                  checked={payload.model_config.enable_deepagents}
                  type="checkbox"
                  onChange={(e) => setModel("enable_deepagents", e.target.checked)}
                />
                <span className="switch-track" />
                使用 DeepAgents 执行多 Agent 链路（关闭则全程规则生成）
              </label>
              <label className="switch">
                <input
                  checked={payload.model_config.enable_vision}
                  type="checkbox"
                  onChange={(e) => setModel("enable_vision", e.target.checked)}
                />
                <span className="switch-track" />
                视觉理解阶段用多模态模型真正读取上传图片
              </label>
            </Section>

            <Section title="品牌字体与字号" description="Core Rule 中的字体约束" icon={<Type size={16} />}>
              <div className="grid-2">
                <Field label="主标题字体">
                  <input
                    value={payload.typography.title_font}
                    onChange={(e) => setTypo("title_font", e.target.value)}
                  />
                </Field>
                <Field label="正文字体">
                  <input
                    value={payload.typography.body_font}
                    onChange={(e) => setTypo("body_font", e.target.value)}
                  />
                </Field>
                <Field label="英文字体">
                  <input
                    value={payload.typography.english_font}
                    onChange={(e) => setTypo("english_font", e.target.value)}
                  />
                </Field>
                <Field label="字重">
                  <select
                    value={payload.typography.font_weight}
                    onChange={(e) =>
                      setTypo(
                        "font_weight",
                        e.target.value as WorkflowPayload["typography"]["font_weight"],
                      )
                    }
                  >
                    <option value="Regular">Regular</option>
                    <option value="Medium">Medium</option>
                    <option value="Bold">Bold</option>
                  </select>
                </Field>
                <Field label="主标题字号">
                  <input
                    type="number"
                    value={payload.typography.title_size}
                    onChange={(e) => setTypo("title_size", Number(e.target.value))}
                  />
                </Field>
                <Field label="正文字号">
                  <input
                    type="number"
                    value={payload.typography.body_size}
                    onChange={(e) => setTypo("body_size", Number(e.target.value))}
                  />
                </Field>
                <Field label={`行距 · ${payload.typography.line_height}`}>
                  <input
                    max={3}
                    min={0.8}
                    step={0.1}
                    type="range"
                    value={payload.typography.line_height}
                    onChange={(e) => setTypo("line_height", Number(e.target.value))}
                  />
                </Field>
                <Field label="文字颜色">
                  <input
                    className="color"
                    type="color"
                    value={payload.typography.text_color}
                    onChange={(e) => setTypo("text_color", e.target.value)}
                  />
                </Field>
              </div>
              <label className="switch">
                <input
                  checked={payload.typography.lock_brand_typography}
                  type="checkbox"
                  onChange={(e) => setTypo("lock_brand_typography", e.target.checked)}
                />
                <span className="switch-track" />
                严格锁定品牌字体规范
              </label>
            </Section>

            <Section title="Layout Engine 参数" description="画布、标准模块与配色" icon={<Palette size={16} />}>
              <div className="grid-2">
                <Field label="画布宽度">
                  <input
                    type="number"
                    value={payload.layout.canvas_width}
                    onChange={(e) => setLayout("canvas_width", Number(e.target.value))}
                  />
                </Field>
                <Field label={`模块数量 · ${payload.layout.module_count}`}>
                  <input
                    max={12}
                    min={1}
                    type="range"
                    value={payload.layout.module_count}
                    onChange={(e) => setLayout("module_count", Number(e.target.value))}
                  />
                </Field>
                <Field label="主视觉高度">
                  <input
                    type="number"
                    value={payload.layout.hero_height}
                    onChange={(e) => setLayout("hero_height", Number(e.target.value))}
                  />
                </Field>
                <Field label="普通模块高度">
                  <input
                    type="number"
                    value={payload.layout.module_height}
                    onChange={(e) => setLayout("module_height", Number(e.target.value))}
                  />
                </Field>
                <Field label="背景色">
                  <input
                    className="color"
                    type="color"
                    value={payload.layout.background_color}
                    onChange={(e) => setLayout("background_color", e.target.value)}
                  />
                </Field>
                <Field label="强调色">
                  <input
                    className="color"
                    type="color"
                    value={payload.layout.accent_color}
                    onChange={(e) => setLayout("accent_color", e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Agent 提示词"
              description="品牌知识库、页面规划、Layout 与设计稿生成提示词"
              icon={<Boxes size={16} />}
            >
              {(Object.keys(payload.prompts) as Array<keyof AgentPrompts>).map((key) => (
                <Field label={PROMPT_LABELS[key]} key={key}>
                  <textarea
                    className="prompt"
                    value={payload.prompts[key]}
                    onChange={(e) => setPrompt(key, e.target.value)}
                  />
                </Field>
              ))}
            </Section>
          </div>

          <div className="actions">
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setResult(null);
                setError(null);
                fetchDefaults().then((d) => setPayload(d.payload)).catch(() => {});
              }}
            >
              <RefreshCw size={15} /> 重置
            </button>
            <button
              className="btn primary"
              disabled={loading}
              type="button"
              onClick={handleGenerate}
            >
              {loading ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
              {loading ? "生成中…" : "运行 BrandOS 任务"}
            </button>
          </div>
        </section>

        <aside className="panel result-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Sparkles size={18} /> 生成结果
            </div>
            {result ? (
              <span className={`pill ${result.used_deepagents ? "pill-on" : "pill-off"}`}>
                {result.used_deepagents ? "模型链路" : "规则链路"}
              </span>
            ) : null}
          </div>

          <div className="panel-scroll">
            {error ? <div className="error">{error}</div> : null}

            {!result && !error && !loading ? (
              <div className="placeholder">
                <Sparkles size={28} />
                <p>
                  配置好参数后点击「运行 BrandOS 任务」，这里会显示品牌规则、页面结构、
                  详情页预览图、设计评分和可下载的设计 JSON / PSD 兼容脚本。
                </p>
              </div>
            ) : null}

            {loading ? (
              <div className="placeholder">
                <Loader2 className="spin" size={28} />
                <p>正在依次执行商品理解 → 品牌知识库 → 页面规划 → Layout → Figma/PSD → 评分反馈…</p>
              </div>
            ) : null}

            {result ? (
              <div className="result">
                <p className="result-summary">{result.summary}</p>

                <div className="downloads">
                  <a
                    className="download"
                    href={artifactUrl(result.run_id, "preview.svg")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ImageIcon size={14} /> 预览 SVG
                  </a>
                  <a
                    className="download"
                    href={artifactUrl(result.run_id, "design_spec.json")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Download size={14} /> 设计 JSON
                  </a>
                  <a
                    className="download"
                    href={artifactUrl(result.run_id, "create_detail_page.jsx")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Download size={14} /> PSD 兼容 JSX
                  </a>
                  <a
                    className="download"
                    href={artifactUrl(result.run_id, "README.md")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileText size={14} /> README
                  </a>
                </div>

                <div className="result-grid">
                  <div className="preview-card">
                    <div className="card-label">详情页结构预览</div>
                    {previewUrl ? (
                      <iframe className="preview-frame" src={previewUrl} title="详情页预览" />
                    ) : null}
                  </div>
                  <div className="stages-card">
                    <div className="card-label">Agent 执行时间线</div>
                    <StageTimeline stages={result.stages} />
                  </div>
                </div>

                {result.warnings.length ? (
                  <details className="warnings">
                    <summary>降级 / 提示信息（{result.warnings.length}）</summary>
                    <pre>{result.warnings.join("\n")}</pre>
                  </details>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

function OverviewCard({
  icon,
  label,
  title,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <article className="overview-card">
      <div className="overview-icon">{icon}</div>
      <div>
        <div className="overview-label">{label}</div>
        <div className="overview-title">{title}</div>
        <p>{text}</p>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
