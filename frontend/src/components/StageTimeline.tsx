"use client";

import { useState } from "react";
import type { StageResult } from "@/lib/api";
import { StageIcon } from "./icons";

const STATUS_LABEL: Record<string, string> = {
  completed: "模型完成",
  fallback: "规则降级",
  skipped: "已跳过",
  failed: "失败",
};

export function StageTimeline({ stages }: { stages: StageResult[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="timeline">
      {stages.map((stage) => {
        const open = openId === stage.id;
        return (
          <div className={`timeline-item timeline-${stage.status}`} key={stage.id}>
            <div className="timeline-dot">
              <StageIcon name={stage.icon} size={16} />
            </div>
            <div className="timeline-content">
              <button
                className="timeline-head"
                type="button"
                onClick={() => setOpenId(open ? null : stage.id)}
              >
                <span className="timeline-title">{stage.title}</span>
                <span className="timeline-tags">
                  <span className={`timeline-tag tag-${stage.status}`}>
                    {STATUS_LABEL[stage.status] ?? stage.status}
                  </span>
                  <span className="timeline-ms">{stage.elapsed_ms}ms</span>
                </span>
              </button>
              <p className="timeline-summary">{stage.summary}</p>
              {open ? (
                <pre className="timeline-detail">{stage.detail}</pre>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
