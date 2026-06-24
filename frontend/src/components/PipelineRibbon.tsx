"use client";

import { ChevronRight } from "lucide-react";
import type { StageMeta, StageResult } from "@/lib/api";
import { StageIcon } from "./icons";

interface PipelineRibbonProps {
  stages: StageMeta[];
  results: StageResult[];
  running: boolean;
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
}: PipelineRibbonProps) {
  return (
    <div className="ribbon">
      {stages.map((stage, index) => {
        const state = nodeState(stage, results, running && results.length === 0);
        const result = results.find((item) => item.id === stage.id);
        return (
          <div className="ribbon-item" key={stage.id}>
            <div className={`ribbon-node ribbon-${state}`}>
              <span className="ribbon-node-icon">
                <StageIcon name={stage.icon} size={18} />
              </span>
              <span className="ribbon-node-text">
                <span className="ribbon-node-title">{stage.title}</span>
                <span className="ribbon-node-meta">
                  {result
                    ? result.used_model
                      ? "模型生成"
                      : "规则生成"
                    : `阶段 ${index + 1}`}
                </span>
              </span>
            </div>
            {index < stages.length - 1 ? (
              <ChevronRight className="ribbon-arrow" size={16} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
