const STORAGE_KEY = "resume-builder-data";

const defaultData = {
  template: "classic",
  basic: { name: "", job: "", phone: "", email: "", location: "", summary: "", photo: "" },
  education: [{ school: "", major: "", degree: "", time: "" }],
  work: [{ company: "", position: "", time: "", desc: "" }],
  projects: [{ name: "", time: "", desc: "" }],
  skills: "",
  evaluation: ""
};

const sections = [
  {
    key: "basic",
    title: "基本信息",
    type: "fields",
    fields: [
      { key: "name", label: "姓名", placeholder: "张三" },
      { key: "photo", label: "简历照片", type: "photo" },
      { key: "job", label: "求职意向", placeholder: "前端开发实习生" },
      { key: "phone", label: "电话", placeholder: "138-0000-0000" },
      { key: "email", label: "邮箱", placeholder: "zhangsan@example.com" },
      { key: "location", label: "所在城市", placeholder: "上海" },
      { key: "summary", label: "个人简介", type: "textarea", ai: true, placeholder: "一句话介绍自己，例如：计算机专业大四学生，熟悉前端开发……" }
    ]
  },
  {
    key: "education",
    title: "教育背景",
    type: "list",
    fields: [
      { key: "school", label: "学校", placeholder: "XX 大学" },
      { key: "major", label: "专业", placeholder: "计算机科学与技术" },
      { key: "degree", label: "学历", placeholder: "本科" },
      { key: "time", label: "在校时间", placeholder: "2023.09 - 2027.06" }
    ]
  },
  {
    key: "work",
    title: "实习 / 工作经历",
    type: "list",
    fields: [
      { key: "company", label: "公司", placeholder: "XX 科技有限公司" },
      { key: "position", label: "职位", placeholder: "前端开发实习生" },
      { key: "time", label: "时间", placeholder: "2025.06 - 2025.09" },
      { key: "desc", label: "工作内容", type: "textarea", ai: true, placeholder: "每行一条，例如：\n参与公司官网页面开发与维护\n配合后端联调接口" }
    ]
  },
  {
    key: "projects",
    title: "项目经历",
    type: "list",
    fields: [
      { key: "name", label: "项目名称", placeholder: "在线简历生成器" },
      { key: "time", label: "项目时间", placeholder: "2026.03 - 2026.05" },
      { key: "desc", label: "项目描述", type: "textarea", ai: true, placeholder: "每行一条，例如：\n使用原生 JavaScript 实现表单与实时预览\n支持打印导出 PDF" }
    ]
  },
  {
    key: "skills",
    title: "技能特长",
    type: "textarea",
    ai: true,
    placeholder: "每行一条，例如：\nHTML / CSS / JavaScript\nVue 3\nGit / GitHub"
  },
  {
    key: "evaluation",
    title: "自我评价",
    type: "textarea",
    ai: true,
    placeholder: "描述你的优势与特点，例如：热爱编程，自学能力强，做事认真负责……"
  }
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 忽略损坏的本地数据 */ }
  return null;
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* 存储超限时忽略 */ }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const data = loadData() || clone(defaultData);
if (!data.basic.photo) data.basic.photo = "";

const formPanel = document.getElementById("form-panel");
const resumeEl = document.getElementById("resume");
const templateSelect = document.getElementById("template-select");

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fieldHtml(f, sectionKey, index) {
  if (f.type === "photo") {
    const photo = data.basic.photo;
    return `<div class="form-item">
      <label>${esc(f.label)}</label>
      <div class="photo-upload">
        ${photo ? `<img class="photo-preview" src="${photo}" alt="照片预览" />` : ""}
        <input type="file" accept="image/*" data-photo />
        ${photo ? `<button type="button" class="del-btn" data-photo-del>移除照片</button>` : ""}
      </div>
    </div>`;
  }

  const value = index !== undefined ? data[sectionKey][index][f.key] : data[sectionKey][f.key];
  const indexAttr = index !== undefined ? ` data-index="${index}"` : "";
  const aiBtn = (f.type === "textarea" && f.ai)
    ? `<button type="button" class="ai-btn" data-ai-section="${sectionKey}"${indexAttr} data-ai-key="${f.key}">AI 美化</button>`
    : "";
  const labelHtml = aiBtn
    ? `<div class="form-item-head"><label>${esc(f.label)}</label>${aiBtn}</div>`
    : `<label>${esc(f.label)}</label>`;
  const input = f.type === "textarea"
    ? `<textarea data-section="${sectionKey}"${indexAttr} data-key="${f.key}" placeholder="${esc(f.placeholder)}">${esc(value)}</textarea>`
    : `<input type="text" data-section="${sectionKey}"${indexAttr} data-key="${f.key}" placeholder="${esc(f.placeholder)}" value="${esc(value)}" />`;
  return `<div class="form-item">${labelHtml}${input}</div>`;
}

function renderForm() {
  let html = "";

  sections.forEach((section) => {
    if (section.type === "fields") {
      html += `<fieldset class="form-section"><legend>${section.title}</legend>`;
      section.fields.forEach((f) => {
        html += fieldHtml(f, section.key);
      });
      html += `</fieldset>`;
    } else if (section.type === "list") {
      html += `<fieldset class="form-section"><legend>${section.title}</legend><div class="list-wrap">`;
      if (data[section.key].length === 0) {
        html += `<p class="empty-hint">暂无记录，点击下方按钮添加</p>`;
      }
      data[section.key].forEach((item, index) => {
        html += `<div class="list-item">
          <div class="list-item-header">
            <span>#${index + 1}</span>
            <button type="button" class="del-btn" data-del="${section.key}" data-index="${index}">删除</button>
          </div>`;
        section.fields.forEach((f) => {
          html += fieldHtml(f, section.key, index);
        });
        html += `</div>`;
      });
      html += `</div><button type="button" class="add-btn" data-add="${section.key}">＋ 添加一条</button></fieldset>`;
    } else {
      const aiBtn = section.ai
        ? `<button type="button" class="ai-btn" data-ai-section="${section.key}">AI 美化</button>`
        : "";
      const head = aiBtn ? `<div class="form-item-head"><label>内容</label>${aiBtn}</div>` : "";
      html += `<fieldset class="form-section"><legend>${section.title}</legend>
        <div class="form-item">
          ${head}
          <textarea data-section="${section.key}" data-textarea placeholder="${esc(section.placeholder)}">${esc(data[section.key])}</textarea>
        </div>
      </fieldset>`;
    }
  });

  formPanel.innerHTML = html;
}

function hasContent(item) {
  if (item == null) return false;
  if (typeof item === "string") return item.trim() !== "";
  return Object.values(item).some((v) => String(v == null ? "" : v).trim() !== "");
}

function bullets(text) {
  const lines = String(text == null ? "" : text)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) return "";
  return `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
}

function section(title, content) {
  return `<section class="resume-section"><h3>${esc(title)}</h3>${content}</section>`;
}

function contactParts() {
  const b = data.basic;
  return [b.phone, b.email, b.location].map((v) => v.trim()).filter(Boolean);
}

function contactHtml() {
  const parts = contactParts();
  return parts.length ? parts.map((v) => esc(v)).join('<span class="dot">·</span>') : "";
}

function photoHtml(cls, placeholderText) {
  const p = data.basic.photo;
  if (p) return `<img class="resume-photo ${cls}" src="${p}" alt="简历照片" />`;
  return placeholderText ? `<div class="resume-photo ${cls} photo-placeholder">${placeholderText}</div>` : "";
}

function summaryHtml() {
  if (!hasContent(data.basic.summary)) return "";
  return section("个人简介", `<p class="resume-summary">${esc(data.basic.summary)}</p>`);
}

function eduHtml() {
  const items = data.education.filter(hasContent);
  if (!items.length) return "";
  const rows = items.map((e) => `
    <div class="entry">
      <div class="entry-top">
        <strong>${esc(e.school) || "学校名称"}</strong>
        <span class="entry-time">${esc(e.time) || "在校时间"}</span>
      </div>
      <div class="entry-sub">${[esc(e.major), esc(e.degree)].filter((v) => v).join(" · ") || "专业 / 学历"}</div>
    </div>`).join("");
  return section("教育背景", rows);
}

function workHtml() {
  const items = data.work.filter(hasContent);
  if (!items.length) return "";
  const rows = items.map((w) => `
    <div class="entry">
      <div class="entry-top">
        <strong>${esc(w.company) || "公司名称"}</strong>
        <span class="entry-time">${esc(w.time) || "时间"}</span>
      </div>
      <div class="entry-sub">${esc(w.position) || "职位"}</div>
      ${bullets(w.desc)}
    </div>`).join("");
  return section("实习 / 工作经历", rows);
}

function projHtml() {
  const items = data.projects.filter(hasContent);
  if (!items.length) return "";
  const rows = items.map((p) => `
    <div class="entry">
      <div class="entry-top">
        <strong>${esc(p.name) || "项目名称"}</strong>
        <span class="entry-time">${esc(p.time) || "项目时间"}</span>
      </div>
      ${bullets(p.desc)}
    </div>`).join("");
  return section("项目经历", rows);
}

function skillsHtml() {
  const list = data.skills.split("\n").map((s) => s.trim()).filter(Boolean);
  if (!list.length) return "";
  return section("技能特长", `<div class="skill-chips">${list.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>`);
}

function evalHtml() {
  if (!hasContent(data.evaluation)) return "";
  return section("自我评价", `<p class="resume-summary">${esc(data.evaluation)}</p>`);
}

function renderClassic() {
  const b = data.basic;
  let html = `
    <header class="resume-header">
      ${photoHtml("classic-photo", "照片")}
      <h2>${esc(b.name) || "你的姓名"}</h2>
      <div class="resume-job">${esc(b.job) || "求职意向"}</div>
      ${contactHtml() ? `<div class="resume-contact">${contactHtml()}</div>` : ""}
    </header>`;
  html += summaryHtml() + eduHtml() + workHtml() + projHtml() + skillsHtml() + evalHtml();
  return html;
}

function renderDark() {
  const b = data.basic;
  let html = `
    <header class="dark-header">
      <div class="dark-info">
        <h2>${esc(b.name) || "你的姓名"}</h2>
        <div class="resume-job">${esc(b.job) || "求职意向"}</div>
        ${contactHtml() ? `<div class="resume-contact">${contactHtml()}</div>` : ""}
      </div>
      ${photoHtml("dark-photo", "照片")}
    </header>`;
  html += summaryHtml() + eduHtml() + workHtml() + projHtml() + skillsHtml() + evalHtml();
  return html;
}

function renderSidebar() {
  const b = data.basic;
  const contacts = [];
  if (b.phone.trim()) contacts.push({ label: "电话", value: b.phone });
  if (b.email.trim()) contacts.push({ label: "邮箱", value: b.email });
  if (b.location.trim()) contacts.push({ label: "城市", value: b.location });

  let side = "";
  if (b.photo) side += `<img class="resume-photo side-photo" src="${b.photo}" alt="简历照片" />`;
  if (contacts.length) {
    side += `<section class="side-section"><h3>联系方式</h3>
      ${contacts.map((c) => `<p class="side-contact"><span>${esc(c.label)}</span>${esc(c.value)}</p>`).join("")}
    </section>`;
  }
  const skillList = data.skills.split("\n").map((s) => s.trim()).filter(Boolean);
  if (skillList.length) {
    side += `<section class="side-section"><h3>技能特长</h3>
      <ul class="side-list">${skillList.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </section>`;
  }
  if (hasContent(data.evaluation)) {
    side += `<section class="side-section"><h3>自我评价</h3>
      <p class="side-text">${esc(data.evaluation)}</p>
    </section>`;
  }
  if (!side) side = `<p class="side-text">填写左侧表单后，这里会显示联系方式与技能</p>`;

  let main = `
    <header class="sidebar-header">
      <h2>${esc(b.name) || "你的姓名"}</h2>
      <div class="resume-job">${esc(b.job) || "求职意向"}</div>
    </header>`;
  main += summaryHtml() + eduHtml() + workHtml() + projHtml();

  return `<div class="sidebar-layout">
    <aside class="resume-sidebar">${side}</aside>
    <div class="resume-main">${main}</div>
  </div>`;
}

function renderPreview() {
  const t = data.template || "classic";
  resumeEl.className = "resume-page template-" + t;
  if (t === "dark") resumeEl.innerHTML = renderDark();
  else if (t === "sidebar") resumeEl.innerHTML = renderSidebar();
  else resumeEl.innerHTML = renderClassic();
}

function processPhoto(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 320;
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => alert("图片读取失败，请换一张图片试试");
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

formPanel.addEventListener("input", (e) => {
  const t = e.target;
  if (!t.dataset.section) return;
  const sectionKey = t.dataset.section;

  if (t.dataset.textarea !== undefined) {
    data[sectionKey] = t.value;
  } else if (t.dataset.index !== undefined) {
    data[sectionKey][Number(t.dataset.index)][t.dataset.key] = t.value;
  } else {
    data[sectionKey][t.dataset.key] = t.value;
  }

  renderPreview();
  saveData();
});

formPanel.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.photo !== undefined && t.files && t.files[0]) {
    processPhoto(t.files[0], (url) => {
      data.basic.photo = url;
      renderForm();
      renderPreview();
      saveData();
    });
  }
});

formPanel.addEventListener("click", (e) => {
  const photoDel = e.target.closest("[data-photo-del]");
  if (photoDel) {
    data.basic.photo = "";
    renderForm();
    renderPreview();
    saveData();
    return;
  }

  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    const sectionKey = addBtn.dataset.add;
    const cfg = sections.find((s) => s.key === sectionKey);
    const empty = {};
    cfg.fields.forEach((f) => { empty[f.key] = ""; });
    data[sectionKey].push(empty);
    renderForm();
    renderPreview();
    saveData();
    return;
  }

  const delBtn = e.target.closest("[data-del]");
  if (delBtn) {
    data[delBtn.dataset.del].splice(Number(delBtn.dataset.index), 1);
    renderForm();
    renderPreview();
    saveData();
  }
});

function demoData() {
  return {
    basic: {
      name: "陈继尧",
      job: "数据分析 · 数据运营 · AI 应用",
      phone: "13622994294",
      email: "746437110@qq.com",
      location: "深圳 · 2027 届 · 可立即到岗（每周 5 天）",
      summary: "韩山师范学院统计学 2027 届本科，系统掌握 SQL、Python、R 等数据分析工具，熟悉 GMV、转化漏斗、留存率等核心业务指标口径，具备从需求对接到分析交付的完整项目经验。",
      photo: ""
    },
    education: [
      {
        school: "韩山师范学院",
        major: "统计学（主修：SQL 数据库原理、Python/R 语言编程、应用回归分析、多元统计、时间序列分析）",
        degree: "本科",
        time: "2023.09 - 2027.06"
      }
    ],
    work: [
      {
        company: "深圳点宽网络科技有限公司",
        position: "数据分析见习生",
        time: "2026.06 - 至今",
        desc: "负责电商与咨询业务线的日常取数和日报，日均处理 3-5 个需求，熟悉 GMV、转化漏斗、留存率等核心指标口径\n借助 AI 工具辅助写 SQL 和做图表，常规取数效率提升约 30%\n参与用户画像和竞品分析，独立完成调研报告，走通从需求对接到交付的完整链路"
      }
    ],
    projects: [
      {
        name: "京东 618 大促电商用户行为分析",
        time: "2026.06 - 至今",
        desc: "处理 74 万条大促用户行为数据，搭建浏览到购买的转化漏斗（82.2% → 69.7% → 57.3%），定位加购到收藏环节的主要流失\n用 RFM 模型划分 8 类客群，发现前 20% 用户贡献 70.2% GMV，为资源投放提供依据\n从品类、地域、时段等维度做交叉分析，产出 BI 看板供运营团队参考"
      },
      {
        name: "竞赛智能客服机器人（泰迪杯 C 题）",
        time: "2025.03 - 2025.05",
        desc: "用 Python pdfplumber 解析 20 余份竞赛规程 PDF（约 500 页），提取 300 多条结构化知识存入 MySQL，搭建客服机器人知识库\n接入 Claude、DeepSeek 模型，通过 Prompt 调试覆盖报名指导、规则解读、赛程查询三类场景，问答准确率达到 89%\n编写文档增量更新脚本，新规程可自动解析入库；带领 3 人小组完成技术方案与答辩，获省一等奖（全省前 5%）"
      }
    ],
    skills: "指标体系搭建\n转化漏斗分析\nRFM 用户分层\nBI 看板开发\n竞品调研\nMySQL / JOIN 多表 / 子查询 / 窗口函数\nPython（Pandas / NumPy / Matplotlib / pdfplumber）\nR 语言（ggplot2）\nExcel（VLOOKUP / 透视表）\nLLM API（Claude / DeepSeek）\nPrompt Engineering\nAI 辅助分析与图表",
    evaluation: "第 13 届泰迪杯数据挖掘挑战赛省一等奖（全省前 5%）；CET-4、普通话二级乙等；做事认真负责，自学能力强，善于借助 AI 工具提效。"
  };
}

templateSelect.value = data.template || "classic";
templateSelect.addEventListener("change", () => {
  data.template = templateSelect.value;
  renderPreview();
  saveData();
});

document.getElementById("btn-demo").addEventListener("click", () => {
  Object.assign(data, demoData());
  renderForm();
  renderPreview();
  saveData();
});

document.getElementById("btn-clear").addEventListener("click", () => {
  if (!confirm("确定要清空所有内容吗？")) return;
  const tpl = data.template;
  Object.assign(data, clone(defaultData));
  data.template = tpl;
  renderForm();
  renderPreview();
  saveData();
});

document.getElementById("btn-export").addEventListener("click", () => {
  window.print();
});

/* ================= AI 智能美化 ================= */
const AI_CONFIG_KEY = "resume-builder-ai-config";

const AI_PROVIDERS = [
  { id: "deepseek", name: "DeepSeek（深度求索）", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { id: "dashscope", name: "阿里通义千问", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
  { id: "zhipu", name: "智谱 GLM", baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-flash" },
  { id: "moonshot", name: "月之暗面 Kimi", baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { id: "custom", name: "自定义（OpenAI 兼容接口）", baseUrl: "", model: "" }
];

let aiConfig = { provider: "deepseek", baseUrl: AI_PROVIDERS[0].baseUrl, apiKey: "", model: AI_PROVIDERS[0].model };
try {
  Object.assign(aiConfig, JSON.parse(localStorage.getItem(AI_CONFIG_KEY) || "{}"));
} catch (e) { /* 忽略损坏的本地配置 */ }

function saveAiConfig() {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(aiConfig));
  } catch (e) { /* 存储异常时忽略 */ }
}

const aiModal = document.getElementById("ai-modal");
const aiProviderSelect = document.getElementById("ai-provider");
const aiBaseUrlInput = document.getElementById("ai-baseurl");
const aiModelInput = document.getElementById("ai-model");
const aiKeyInput = document.getElementById("ai-key");

AI_PROVIDERS.forEach((p) => {
  const opt = document.createElement("option");
  opt.value = p.id;
  opt.textContent = p.name;
  aiProviderSelect.appendChild(opt);
});

function fillProviderDefaults(overwrite) {
  const p = AI_PROVIDERS.find((x) => x.id === aiProviderSelect.value);
  if (!p) return;
  if (overwrite || !aiBaseUrlInput.value.trim()) {
    aiBaseUrlInput.value = p.baseUrl;
    aiModelInput.value = p.model;
  }
}

function openAiModal() {
  aiProviderSelect.value = aiConfig.provider;
  aiBaseUrlInput.value = aiConfig.baseUrl;
  aiModelInput.value = aiConfig.model;
  aiKeyInput.value = aiConfig.apiKey;
  aiModal.hidden = false;
}

document.getElementById("btn-ai-config").addEventListener("click", openAiModal);
aiProviderSelect.addEventListener("change", () => fillProviderDefaults(true));
document.getElementById("ai-cancel").addEventListener("click", () => { aiModal.hidden = true; });
aiModal.addEventListener("click", (e) => { if (e.target === aiModal) aiModal.hidden = true; });
document.getElementById("ai-save").addEventListener("click", () => {
  aiConfig.provider = aiProviderSelect.value;
  aiConfig.baseUrl = aiBaseUrlInput.value.trim().replace(/\/+$/, "");
  aiConfig.model = aiModelInput.value.trim();
  aiConfig.apiKey = aiKeyInput.value.trim();
  if (!aiConfig.baseUrl || !aiConfig.model) {
    alert("请填写接口地址与模型名称");
    return;
  }
  saveAiConfig();
  aiModal.hidden = true;
});

function buildAiMessages(kind, label, context, content) {
  const sys = "你是一位拥有 10 年经验的资深 HR 和简历优化专家，擅长把平淡的描述改写成专业、量化、有说服力的简历语言。直接输出优化后的正文本身，不要任何解释说明，不要使用 Markdown 语法（不用加粗、标题、代码块）。";
  let user = "";
  if (kind === "desc") {
    user = `请优化简历中「${label}」的经历描述${context ? `（${context}）` : ""}。\n要求：\n1. 每条以动词开头，突出行动与结果\n2. 尽量量化成果（数量、比例、效率提升）\n3. 每条一行，共 3-5 条\n4. 只基于原有事实润色，不要编造数据\n\n当前内容：\n${content}`;
  } else if (kind === "skills") {
    user = `请优化简历的「技能特长」列表。\n要求：\n1. 每行一条技能，合并同类项\n2. 使用招聘方搜索的常用关键词\n3. 总行数控制在 12 行以内\n4. 只基于原有技能润色，不要编造\n\n当前内容：\n${content}`;
  } else {
    user = `请优化简历的「${label}」。\n要求：\n1. 保留关键信息，语言精炼、有吸引力\n2. 控制在 120 字以内\n3. 只基于原有内容润色，不要编造\n\n当前内容：\n${content}`;
  }
  return [{ role: "system", content: sys }, { role: "user", content: user }];
}

async function callAi(messages) {
  let resp;
  try {
    resp = await fetch(aiConfig.baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + aiConfig.apiKey
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        temperature: 0.7,
        stream: false
      })
    });
  } catch (e) {
    throw new Error("网络请求失败：请检查接口地址是否正确，以及该服务商是否允许浏览器跨域（CORS）调用");
  }
  if (!resp.ok) {
    let msg = "HTTP " + resp.status;
    try {
      const j = await resp.json();
      msg += "：" + ((j.error && j.error.message) || j.message || "");
    } catch (e) { /* 非 JSON 响应时仅展示状态码 */ }
    if (resp.status === 401) msg += "（API Key 无效或未填写）";
    throw new Error(msg);
  }
  const j = await resp.json();
  let text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  text = text.trim()
    .replace(/^```[a-zA-Z]*\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
  if (!text) throw new Error("模型未返回内容，请稍后重试或更换模型");
  return text;
}

async function aiPolish(btn) {
  const sectionKey = btn.dataset.aiSection;
  const key = btn.dataset.aiKey;
  const index = btn.dataset.index === undefined ? undefined : Number(btn.dataset.index);

  let kind, label, context, content;
  if (index !== undefined) {
    const item = data[sectionKey][index] || {};
    content = item[key] || "";
    if (sectionKey === "work") {
      kind = "desc";
      label = "工作内容";
      context = [item.company, item.position].filter(Boolean).join(" · ");
    } else {
      kind = "desc";
      label = "项目描述";
      context = item.name;
    }
  } else if (key) {
    content = data[sectionKey][key] || "";
    kind = "summary";
    label = "个人简介";
  } else {
    content = data[sectionKey] || "";
    kind = sectionKey;
    label = sectionKey === "skills" ? "技能特长" : "自我评价";
  }

  if (!String(content).trim()) {
    alert("请先填写内容，AI 会在此基础上进行润色");
    return;
  }
  if (!aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
    openAiModal();
    alert("首次使用请先完成 AI 设置：选择服务商并填写你自己的 API Key");
    return;
  }

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "AI 处理中…";
  try {
    const result = await callAi(buildAiMessages(kind, label, context, content));
    if (index !== undefined) data[sectionKey][index][key] = result;
    else if (key) data[sectionKey][key] = result;
    else data[sectionKey] = result;
    renderForm();
    renderPreview();
    saveData();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    alert("AI 美化失败：" + err.message);
  }
}

formPanel.addEventListener("click", (e) => {
  const aiBtn = e.target.closest("[data-ai-section]");
  if (aiBtn) {
    aiPolish(aiBtn);
  }
});

/* ===== URL 参数快速预览（用于截图与演示）：?demo=1&template=sidebar ===== */
(function () {
  const params = new URLSearchParams(window.location.search);
  const tpl = params.get("template");
  if (tpl && ["classic", "dark", "sidebar"].includes(tpl)) {
    data.template = tpl;
    templateSelect.value = tpl;
  }
  if (params.get("demo") === "1" && !loadData()) {
    Object.assign(data, demoData());
  }
})();

renderForm();
renderPreview();
