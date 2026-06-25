"use client";

import { ChevronRight } from "lucide-react";
import type { StageMeta, StageResult } from "@/lib/api";
import { StageIcon } from "./icons";

interface PipelineRibbonProps {
  stages: StageMeta[];
  results: StageResult[];
  running: boolean;
  currentStageId?: string | null;
  selectedStageId?: string | null;
  onStageClick?: (stageId: string) => void;
}

type NodeState = "idle" | "running" | "completed" | "fallback" | "failed";

function nodeState(
  meta: StageMeta,
  results: StageResult[],
  running: boolean,
): NodeState {
  const result = results.find((item) => item.id === meta.id);
  if (result) {
    if (result.status === "completed") return "completed";
    if (result.status === "failed") return "failed";
    return "fallback";
  }
  if (running) return "running";
  return "idle";
}

export function PipelineRibbon({
  stages,
  results,
  running,
  currentStageId,
  selectedStageId,
  onStageClick,
}: PipelineRibbonProps) {
  return (
    <div className="ribbon">
      {stages.map((stage, index) => {
        const isCurrent = running && currentStageId === stage.id;
        const isSelected = selectedStageId === stage.id;
        const state = isCurrent
          ? "running"
          : nodeState(stage, results, running && !currentStageId && results.length === 0);
        const result = results.find((item) => item.id === stage.id);
        return (
          <div className="ribbon-item" key={stage.id}>
            <button
              className={`ribbon-node ribbon-${state} ${
                isCurrent ? "ribbon-current" : ""
              } ${isSelected ? "ribbon-selected" : ""}`}
              type="button"
              onClick={() => onStageClick?.(stage.id)}
            >
              <span className="ribbon-node-icon">
                <StageIcon name={stage.icon} size={18} />
              </span>
              <span className="ribbon-node-text">
                <span className="ribbon-node-title">{stage.title}</span>
                <span className="ribbon-node-meta">
                  {isCurrent
                    ? "当前执行中"
                    : result
                    ? result.used_model
                      ? "模型生成"
                      : "确定性生成"
                    : `阶段 ${index + 1}`}
                </span>
              </span>
            </button>
            {index < stages.length - 1 ? (
              <ChevronRight className="ribbon-arrow" size={16} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
