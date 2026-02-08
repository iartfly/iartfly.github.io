const themeLink = document.getElementById('theme-css');
const treeContainer = document.querySelector('.tree-container');
const contentEl = document.getElementById('content');
const searchInput = document.getElementById('search-input');

// 1. 加载导航
async function loadNav() {
  const res = await fetch('nav.json');
  const data = await res.json();
  renderTree(data, treeContainer);
  bindTreeToggle();
  bindFileClick();
}

// 2. 渲染树形菜单
function renderTree(items, parentEl) {
  const ul = document.createElement('ul');
  ul.className = 'tree-ul';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'tree-li';
    if (item.children && item.children.length) {
      const folder = document.createElement('div');
      folder.className = 'tree-folder';
      folder.innerHTML = `<span class="tree-arrow">▶</span> ${item.label}`;
      const childUl = document.createElement('ul');
      childUl.className = 'tree-children';
      renderTree(item.children, childUl);
      li.append(folder, childUl);
    } else {
      const a = document.createElement('a');
      a.href = item.path;
      a.textContent = item.label;
      a.className = 'tree-file';
      li.append(a);
    }
    ul.appendChild(li);
  });
  parentEl.appendChild(ul);
}

// 3. 折叠/展开
function bindTreeToggle() {
  document.querySelectorAll('.tree-folder').forEach(folder => {
    folder.addEventListener('click', () => {
      const arrow = folder.querySelector('.tree-arrow');
      const child = folder.nextElementSibling;
      arrow.classList.toggle('open');
      child.classList.toggle('open');
    });
  });
}

// 4. 加载并渲染 Markdown
async function loadFile(path) {
  try {
    const res = await fetch(path);
    const text = await res.text();
    contentEl.innerHTML = marked.parse(text);
    document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    window.scrollTo(0,0);
  } catch(e) {
    contentEl.innerHTML = '<p>加载失败</p >';
  }
}

// 5. 点击文件加载
function bindFileClick() {
  document.querySelectorAll('.tree-file a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      loadFile(a.href);
    });
  });
}

// 6. 主题切换
document.querySelectorAll('[data-theme]').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.theme;
    themeLink.href = `css/theme-${t}.css`;
    localStorage.setItem('kb-theme', t);
  });
});

// 7. 搜索
searchInput.addEventListener('input', () => {
  const kw = searchInput.value.toLowerCase().trim();
  document.querySelectorAll('.tree-li').forEach(li => {
    const t = li.textContent.toLowerCase();
    li.style.display = t.includes(kw) ? '' : 'none';
  });
});

// 8. 记住主题
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('kb-theme') || 'light';
  themeLink.href = `css/theme-${saved}.css`;
  loadNav();
  loadFile('docs/01-快速开始/index.md');
});
