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
      { key: "summary", label: "个人简介", type: "textarea", placeholder: "一句话介绍自己，例如：计算机专业大四学生，熟悉前端开发……" }
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
      { key: "desc", label: "工作内容", type: "textarea", placeholder: "每行一条，例如：\n参与公司官网页面开发与维护\n配合后端联调接口" }
    ]
  },
  {
    key: "projects",
    title: "项目经历",
    type: "list",
    fields: [
      { key: "name", label: "项目名称", placeholder: "在线简历生成器" },
      { key: "time", label: "项目时间", placeholder: "2026.03 - 2026.05" },
      { key: "desc", label: "项目描述", type: "textarea", placeholder: "每行一条，例如：\n使用原生 JavaScript 实现表单与实时预览\n支持打印导出 PDF" }
    ]
  },
  {
    key: "skills",
    title: "技能特长",
    type: "textarea",
    placeholder: "每行一条，例如：\nHTML / CSS / JavaScript\nVue 3\nGit / GitHub"
  },
  {
    key: "evaluation",
    title: "自我评价",
    type: "textarea",
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
  const input = f.type === "textarea"
    ? `<textarea data-section="${sectionKey}"${indexAttr} data-key="${f.key}" placeholder="${esc(f.placeholder)}">${esc(value)}</textarea>`
    : `<input type="text" data-section="${sectionKey}"${indexAttr} data-key="${f.key}" placeholder="${esc(f.placeholder)}" value="${esc(value)}" />`;
  return `<div class="form-item"><label>${esc(f.label)}</label>${input}</div>`;
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
      html += `<fieldset class="form-section"><legend>${section.title}</legend>
        <div class="form-item">
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
      name: "张三",
      job: "前端开发实习生",
      phone: "138-0000-0000",
      email: "zhangsan@example.com",
      location: "上海",
      summary: "计算机专业大四学生，熟悉 HTML/CSS/JavaScript，有良好的学习能力和团队协作精神。",
      photo: ""
    },
    education: [
      { school: "XX 大学", major: "计算机科学与技术", degree: "本科", time: "2023.09 - 2027.06" }
    ],
    work: [
      {
        company: "XX 科技有限公司",
        position: "前端开发实习生",
        time: "2025.06 - 2025.09",
        desc: "参与公司官网页面开发与维护\n配合后端联调 RESTful 接口\n编写组件使用文档"
      }
    ],
    projects: [
      {
        name: "在线简历生成器",
        time: "2026.03 - 2026.05",
        desc: "使用原生 JavaScript 实现简历表单与实时预览\n支持打印导出 PDF 与本地数据保存\n负责全部前端开发"
      }
    ],
    skills: "HTML / CSS / JavaScript\nVue 3\nGit / GitHub\nNode.js 基础",
    evaluation: "热爱编程，自学能力强；做事认真负责，善于沟通协作；希望在前端方向长期发展。"
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

renderForm();
renderPreview();
