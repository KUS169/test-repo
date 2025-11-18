// exp6.js — Clean Version (No complex regex issues)
(() => {
  const STORAGE_KEY = "exp6_markdown";

  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const wordCount = document.getElementById("wordCount");
  const charCount = document.getElementById("charCount");
  const downloadMd = document.getElementById("downloadMd");
  const exportHtml = document.getElementById("exportHtml");
  const openFile = document.getElementById("openFile");
  const clearBtn = document.getElementById("clearBtn");

  // default text
  editor.value =
    localStorage.getItem(STORAGE_KEY) ||
    `# Welcome  
Type **bold**, _italic_, or a [link](https://google.com).

- Item 1  
- Item 2  

\`\`\`
console.log("Hello world!");
\`\`\`
`;

  // ---------- SIMPLE MARKDOWN PARSER ----------
  function parseMarkdown(md) {
    let html = md;

    // escape HTML
    html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // code blocks
    html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

    // inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // headings
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

    // bold + italic
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/_(.*?)_/g, "<em>$1</em>");

    // links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `<a href='$2' target="_blank">$1</a>`
    );

    // lists
    html = html.replace(/^- (.*)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");

    // paragraphs
    html = html.replace(/\n{2,}/g, "</p><p>");
    html = `<p>${html}</p>`;

    return html;
  }

  // ---------- UPDATE PREVIEW ----------
  function update() {
    const text = editor.value;
    preview.innerHTML = parseMarkdown(text);

    // word / char count
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
    wordCount.textContent = "Words: " + words;
    charCount.textContent = "Chars: " + text.length;

    // autosave
    localStorage.setItem(STORAGE_KEY, text);
  }

  editor.addEventListener("input", update);
  update(); // initial load

  // ---------- DOWNLOAD MD ----------
  downloadMd.addEventListener("click", () => {
    const blob = new Blob([editor.value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.md";
    a.click();
    URL.revokeObjectURL(url);
  });

  // ---------- EXPORT HTML ----------
  exportHtml.addEventListener("click", () => {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Export</title></head>
<body>${preview.innerHTML}</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.html";
    a.click();
    URL.revokeObjectURL(url);
  });

  // ---------- OPEN FILE ----------
  openFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.value = ev.target.result;
      update();
    };
    reader.readAsText(file);
  });

  // ---------- CLEAR ----------
  clearBtn.addEventListener("click", () => {
    if (confirm("Clear editor?")) {
      editor.value = "";
      update();
    }
  });
})();
