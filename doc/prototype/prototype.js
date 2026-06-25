function showToast(message, tone = "info") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2400);
}

function initCreateTaskPage() {
  const page = document.querySelector("[data-page='create-task']");
  if (!page) return;

  const steps = Array.from(page.querySelectorAll("[data-step-card]"));
  const panels = Array.from(page.querySelectorAll("[data-step-panel]"));
  const nextBtn = page.querySelector("[data-action='next-step']");
  const prevBtn = page.querySelector("[data-action='prev-step']");
  const createBtn = page.querySelector("[data-action='create-task']");
  const cancelBtn = page.querySelector("[data-action='cancel-task']");

  const brand = page.querySelector("[data-field='brand']");
  const product = page.querySelector("[data-field='product']");
  const style = page.querySelector("[data-field='style']");
  const imageGen = page.querySelector("[data-field='image-generation']");
  const output = page.querySelector("[data-field='output']");
  const moduleSize = page.querySelector("[data-field='module-size']");

  const summaryBrand = page.querySelector("[data-summary='brand']");
  const summaryProduct = page.querySelector("[data-summary='product']");
  const summaryStrategy = page.querySelector("[data-summary='strategy']");
  const summaryOutput = page.querySelector("[data-summary='output']");

  let currentStep = 1;

  function updateSummary() {
    summaryBrand.textContent = `${brand.value} / 规则版本 V1.4`;
    summaryProduct.textContent = `${product.value} / 6 个核心卖点 / 14 张素材`;
    summaryStrategy.textContent = `${imageGen.value}图片生成 / ${moduleSize.value} / ${style.value}`;
    summaryOutput.textContent = `${output.value} 输出 / 任务进入异步执行队列`;
  }

  function renderStep(step) {
    currentStep = step;
    steps.forEach((item) => {
      const value = Number(item.dataset.stepCard);
      item.classList.toggle("active", value === step);
      item.classList.toggle("done", value < step);
    });
    panels.forEach((panel) => {
      panel.hidden = Number(panel.dataset.stepPanel) !== step;
    });
    prevBtn.disabled = step === 1;
    nextBtn.hidden = step === 4;
    createBtn.hidden = step !== 4;
  }

  steps.forEach((step) => {
    step.classList.add("clickable");
    step.addEventListener("click", () => renderStep(Number(step.dataset.stepCard)));
  });

  [brand, product, style, imageGen, output, moduleSize].forEach((field) => {
    field.addEventListener("change", updateSummary);
  });

  nextBtn.addEventListener("click", () => {
    const nextStep = Math.min(4, currentStep + 1);
    renderStep(nextStep);
  });

  prevBtn.addEventListener("click", () => {
    const prevStep = Math.max(1, currentStep - 1);
    renderStep(prevStep);
  });

  cancelBtn.addEventListener("click", () => {
    showToast("已取消本次任务创建，仅保留当前填写内容。", "warning");
  });

  createBtn.addEventListener("click", () => {
    showToast("任务创建成功，已进入异步执行队列。", "success");
    window.setTimeout(() => {
      window.location.href = "./design-tasks.html";
    }, 700);
  });

  updateSummary();
  renderStep(1);
}

function initDesignTasksPage() {
  const page = document.querySelector("[data-page='design-tasks']");
  if (!page) return;

  const brandFilter = page.querySelector("[data-filter='brand']");
  const statusFilter = page.querySelector("[data-filter='status']");
  const typeFilter = page.querySelector("[data-filter='type']");
  const searchInput = page.querySelector("[data-filter='search']");
  const rows = Array.from(page.querySelectorAll("[data-task-row]"));
  const emptyState = page.querySelector("[data-empty-state]");

  const totalMetric = page.querySelector("[data-metric='total']");
  const runningMetric = page.querySelector("[data-metric='running']");
  const successMetric = page.querySelector("[data-metric='success']");
  const failedMetric = page.querySelector("[data-metric='failed']");

  function applyFilters() {
    let visibleTotal = 0;
    let visibleRunning = 0;
    let visibleSuccess = 0;
    let visibleFailed = 0;
    const query = searchInput.value.trim().toLowerCase();

    rows.forEach((row) => {
      const matchesBrand = brandFilter.value === "全部品牌" || row.dataset.brand === brandFilter.value;
      const matchesStatus = statusFilter.value === "全部状态" || row.dataset.status === statusFilter.value;
      const matchesType = typeFilter.value === "全部任务类型" || row.dataset.type === typeFilter.value;
      const matchesQuery = !query || row.dataset.search.includes(query);

      const visible = matchesBrand && matchesStatus && matchesType && matchesQuery;
      row.style.display = visible ? "" : "none";

      if (visible) {
        visibleTotal += 1;
        if (row.dataset.status === "处理中") visibleRunning += 1;
        if (row.dataset.status === "生成成功") visibleSuccess += 1;
        if (row.dataset.status === "生成失败") visibleFailed += 1;
      }
    });

    totalMetric.textContent = String(visibleTotal);
    runningMetric.textContent = String(visibleRunning);
    successMetric.textContent = String(visibleSuccess);
    failedMetric.textContent = String(visibleFailed);
    emptyState.classList.toggle("visible", visibleTotal === 0);
  }

  [brandFilter, statusFilter, typeFilter].forEach((el) => el.addEventListener("change", applyFilters));
  searchInput.addEventListener("input", applyFilters);

  page.querySelector("[data-action='show-failed']").addEventListener("click", () => {
    statusFilter.value = "生成失败";
    applyFilters();
    showToast("已切换为失败任务视图。", "info");
  });

  page.querySelector("[data-action='new-task']").addEventListener("click", () => {
    window.location.href = "./create-task.html";
  });

  applyFilters();
}

function initResultEditor() {
  const page = document.querySelector("[data-result-editor]");
  if (!page) return;

  const moduleItems = Array.from(page.querySelectorAll("[data-module-item]"));
  const previewModules = Array.from(page.querySelectorAll("[data-preview-module]"));
  const moduleSelect = page.querySelector("[data-editor='module-select']");
  const textEditor = page.querySelector("[data-editor='copy']");
  const imageBox = page.querySelector("[data-editor='image-box']");
  const hideBtn = page.querySelector("[data-action='toggle-visibility']");
  const moveUpBtn = page.querySelector("[data-action='move-up']");
  const moveDownBtn = page.querySelector("[data-action='move-down']");
  const regenerateBtn = page.querySelector("[data-action='regenerate-module']");
  const saveBtn = page.querySelector("[data-action='save-preview']");
  const exportBtn = page.querySelector("[data-action='export-figma']");

  const imageLabels = {
    hero: "已替换 Hero 主视觉图",
    feature: "Feature 模块当前不涉及图片替换",
    scenario: "已替换为新的卧室 / 客厅场景图",
    parameter: "已替换参数示意图",
    cta: "CTA 模块当前不涉及图片替换",
  };

  const regeneratedCopy = {
    hero: "把安静、香氛与夜间氛围同时带进你的卧室空间。",
    feature: "静音扩香、暖光陪伴、细腻雾化，照顾每一个睡前放松时刻。",
    scenario: "在卧室和客厅之间切换不同氛围，保持空间统一又有层次。",
    parameter: "关键参数清晰呈现，让选购信息更容易理解。",
    cta: "现在入手，让每次回家都更像一次轻松切换。",
  };

  let currentModule = "feature";

  function getModuleItem(id) {
    return moduleItems.find((item) => item.dataset.moduleItem === id);
  }

  function getPreviewModule(id) {
    return previewModules.find((item) => item.dataset.previewModule === id);
  }

  function getEditableTarget(moduleId) {
    return page.querySelector(`[data-copy-target='${moduleId}']`);
  }

  function selectModule(moduleId) {
    currentModule = moduleId;
    moduleItems.forEach((item) => item.classList.toggle("is-selected", item.dataset.moduleItem === moduleId));
    previewModules.forEach((item) => item.classList.toggle("is-selected", item.dataset.previewModule === moduleId));
    moduleSelect.value = moduleId;
    const target = getEditableTarget(moduleId);
    textEditor.value = target ? target.textContent.trim() : "";
    imageBox.textContent = imageLabels[moduleId] || "替换图片";
    const preview = getPreviewModule(moduleId);
    hideBtn.textContent = preview.classList.contains("is-hidden") ? "显示模块" : "隐藏模块";
  }

  function syncOrder() {
    moduleItems.forEach((item, index) => {
      const id = item.dataset.moduleItem;
      page.querySelector(".module-list").appendChild(item);
      page.querySelector(".preview-canvas").appendChild(getPreviewModule(id));
      item.dataset.order = String(index);
    });
  }

  moduleItems.forEach((item) => {
    item.addEventListener("click", () => selectModule(item.dataset.moduleItem));
  });

  previewModules.forEach((item) => {
    item.addEventListener("click", () => selectModule(item.dataset.previewModule));
  });

  moduleSelect.addEventListener("change", () => selectModule(moduleSelect.value));

  textEditor.addEventListener("input", () => {
    const target = getEditableTarget(currentModule);
    if (target) {
      target.textContent = textEditor.value.trim() || " ";
    }
  });

  hideBtn.addEventListener("click", () => {
    const item = getModuleItem(currentModule);
    const preview = getPreviewModule(currentModule);
    const hidden = !preview.classList.contains("is-hidden");
    item.classList.toggle("is-hidden", hidden);
    preview.classList.toggle("is-hidden", hidden);
    preview.style.display = hidden ? "none" : "";
    hideBtn.textContent = hidden ? "显示模块" : "隐藏模块";
    showToast(hidden ? "模块已隐藏。" : "模块已重新显示。", "info");
  });

  moveUpBtn.addEventListener("click", () => {
    const item = getModuleItem(currentModule);
    const previous = item.previousElementSibling;
    if (!previous) return;
    item.parentNode.insertBefore(item, previous);
    const preview = getPreviewModule(currentModule);
    const previousPreview = preview.previousElementSibling;
    preview.parentNode.insertBefore(preview, previousPreview);
    showToast("模块已上移。", "success");
  });

  moveDownBtn.addEventListener("click", () => {
    const item = getModuleItem(currentModule);
    const next = item.nextElementSibling;
    if (!next) return;
    item.parentNode.insertBefore(next, item);
    const preview = getPreviewModule(currentModule);
    const nextPreview = preview.nextElementSibling;
    if (nextPreview) {
      preview.parentNode.insertBefore(nextPreview, preview);
    }
    showToast("模块已下移。", "success");
  });

  regenerateBtn.addEventListener("click", () => {
    const target = getEditableTarget(currentModule);
    const nextCopy = regeneratedCopy[currentModule] || textEditor.value;
    if (target) target.textContent = nextCopy;
    textEditor.value = nextCopy;
    showToast("已重新生成当前模块文案。", "info");
  });

  imageBox.addEventListener("click", () => {
    imageBox.textContent = imageLabels[currentModule] || "已替换图片";
    showToast("已模拟替换图片。", "success");
  });

  saveBtn.addEventListener("click", () => {
    showToast("预览修改已保存。", "success");
  });

  exportBtn.addEventListener("click", () => {
    showToast("已模拟导出到 Figma。", "success");
  });

  selectModule(currentModule);
  syncOrder();
}

document.addEventListener("DOMContentLoaded", () => {
  initCreateTaskPage();
  initDesignTasksPage();
  initResultEditor();
});
