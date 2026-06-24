from __future__ import annotations

import json
import os
import re
from typing import Any

from .models import ModelConfig


class LLMUnavailable(Exception):
    """模型不可用（缺依赖、缺 key 或初始化失败）时抛出，触发规则降级。"""


def resolve_api_key(settings: ModelConfig) -> str | None:
    env_key_name = f"{settings.provider.upper()}_API_KEY"
    return (
        settings.api_key
        or os.getenv(env_key_name)
        or os.getenv("OPENAI_API_KEY")
        or os.getenv("DASHSCOPE_API_KEY")
    )


def resolve_base_url(settings: ModelConfig) -> str | None:
    if settings.base_url:
        return settings.base_url
    if settings.provider == "openai":
        model_name = (settings.model or "").lower()
        if model_name.startswith(("qwen", "qwq")):
            return "https://dashscope.aliyuncs.com/compatible-mode/v1"
    return None


class LLMClient:
    """对 langchain init_chat_model 的薄封装，提供文本与 JSON 两种调用。"""

    def __init__(self, settings: ModelConfig):
        self.settings = settings
        self._model = None

    def ensure_ready(self) -> None:
        if self._model is not None:
            return
        if not self.settings.enable_deepagents:
            raise LLMUnavailable("界面已关闭 DeepAgents / 模型调用")
        try:
            from langchain.chat_models import init_chat_model
        except Exception as exc:  # pragma: no cover - 取决于本地环境
            raise LLMUnavailable(f"langchain 依赖不可用：{exc}") from exc

        api_key = resolve_api_key(self.settings)
        if not api_key:
            raise LLMUnavailable("未配置模型 API Key（请在界面填写或设置环境变量）")

        kwargs: dict[str, Any] = {
            "model": self.settings.model,
            "model_provider": self.settings.provider,
            "temperature": self.settings.temperature,
            "max_tokens": self.settings.max_tokens,
            "api_key": api_key,
        }
        base_url = resolve_base_url(self.settings)
        if base_url:
            kwargs["base_url"] = base_url
        try:
            self._model = init_chat_model(**kwargs)
        except Exception as exc:  # pragma: no cover - 取决于模型服务
            raise LLMUnavailable(f"模型初始化失败：{exc}") from exc

    def invoke_text(self, system_prompt: str, user_prompt: str) -> str:
        self.ensure_ready()
        assert self._model is not None
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        try:
            response = self._model.invoke(messages)
        except Exception as exc:  # pragma: no cover - 取决于模型服务
            raise LLMUnavailable(f"模型调用失败：{exc}") from exc
        content = getattr(response, "content", None)
        if isinstance(content, list):
            content = "".join(
                part.get("text", "") if isinstance(part, dict) else str(part)
                for part in content
            )
        return str(content or "").strip()

    def invoke_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        guidance = (
            "\n\n请只输出一个合法 JSON 对象，不要包含解释文字、注释或 markdown 代码块标记。"
        )
        text = self.invoke_text(system_prompt + guidance, user_prompt)
        return _parse_json_object(text)


def _parse_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    else:
        brace = text.find("{")
        last = text.rfind("}")
        if brace != -1 and last != -1 and last > brace:
            text = text[brace : last + 1]
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise LLMUnavailable(f"模型未返回合法 JSON：{exc}") from exc
    if not isinstance(data, dict):
        raise LLMUnavailable("模型 JSON 顶层必须是对象")
    return data
