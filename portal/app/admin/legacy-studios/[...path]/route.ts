import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const LEGACY_PUBLIC_ROOT = path.resolve(
  process.cwd(),
  "..",
  "vpk_braai_ultimate",
  "public",
);

const MIME_BY_EXT: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const LEGACY_STUDIO_INJECT_CSS = `
<style id="legacy-studio-admin-inject">
  .site-nav,
  .back,
  nav.site-nav,
  .mav-subnav {
    display: none !important;
  }

  .legacy-focus-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin-top: 14px;
  }

  .legacy-inline-editable {
    cursor: text;
  }
  .legacy-inline-editable:focus {
    outline: 2px dashed rgba(56, 189, 248, 0.95);
    outline-offset: 2px;
    background: rgba(2, 132, 199, 0.16);
  }

  body.legacy-single-template .template-wrapper {
    display: none !important;
  }
  body.legacy-single-template .template-wrapper.legacy-focused-template {
    display: flex !important;
    margin: 0 auto;
    max-width: 860px;
  }
</style>
`;

const LEGACY_STUDIO_INJECT_JS = `
<script id="legacy-studio-admin-script">
  (function () {
    if (window.__legacyStudioAdminApplied) return;
    window.__legacyStudioAdminApplied = true;

    function makeEditable(root) {
      var selectors = [
        ".h-mega", ".h-mid", ".t-body", ".t-mono", ".t-tag", ".t-brand",
        ".t-name", ".t-phone", "h1", "h2", "h3", "h4", "p", "span", "strong", "div"
      ];
      var nodes = root.querySelectorAll(selectors.join(","));
      nodes.forEach(function (el) {
        if (!(el instanceof HTMLElement)) return;
        if (el.closest(".toolbar-btn, .otma-toolbar, .msoc-toolbar, .per-actions, button, a, label")) return;
        if (el.querySelector("input, button, label, a, svg, img")) return;
        var txt = (el.textContent || "").trim();
        if (!txt) return;
        if (txt.length > 220) return;
        el.classList.add("legacy-inline-editable");
        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");
      });
    }

    var wrappers = Array.prototype.slice.call(document.querySelectorAll(".template-wrapper"));
    if (!wrappers.length) return;

    wrappers.forEach(function (w) { makeEditable(w); });

    var controlPanel = document.querySelector(".control-panel");
    var showAllBtn = document.createElement("button");
    showAllBtn.type = "button";
    showAllBtn.textContent = "Show all templates";
    showAllBtn.className = "toolbar-btn toolbar-btn--secondary";
    showAllBtn.hidden = true;

    var hint = document.createElement("span");
    hint.style.fontSize = "12px";
    hint.style.opacity = "0.85";
    hint.textContent = "Click a template to focus it. Click text to edit copy.";

    var toolbar = document.createElement("div");
    toolbar.className = "legacy-focus-toolbar";
    toolbar.appendChild(showAllBtn);
    toolbar.appendChild(hint);
    if (controlPanel) controlPanel.appendChild(toolbar);

    var focused = null;
    function setFocused(next) {
      wrappers.forEach(function (w) { w.classList.remove("legacy-focused-template"); });
      focused = next;
      if (focused) {
        focused.classList.add("legacy-focused-template");
        document.body.classList.add("legacy-single-template");
        showAllBtn.hidden = false;
        focused.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.body.classList.remove("legacy-single-template");
        showAllBtn.hidden = true;
      }
    }

    showAllBtn.addEventListener("click", function () { setFocused(null); });

    wrappers.forEach(function (w) {
      w.addEventListener("click", function (ev) {
        var t = ev.target;
        if (!(t instanceof HTMLElement)) return;
        if (t.closest(".toolbar-btn, button, label, input, a")) return;
        if (t.closest(".legacy-inline-editable")) return;
        setFocused(w);
      });
    });
  })();
</script>
`;

function injectLegacyStudioEnhancements(html: string): string {
  const withCss = html.includes("</head>")
    ? html.replace("</head>", `${LEGACY_STUDIO_INJECT_CSS}</head>`)
    : `${LEGACY_STUDIO_INJECT_CSS}${html}`;

  const withScript = withCss.includes("</body>")
    ? withCss.replace("</body>", `${LEGACY_STUDIO_INJECT_JS}</body>`)
    : `${withCss}${LEGACY_STUDIO_INJECT_JS}`;

  return withScript;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await context.params;
  if (!parts?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const requested = path.normalize(parts.join("/"));
  const absolutePath = path.resolve(LEGACY_PUBLIC_ROOT, requested);
  const relativeToRoot = path.relative(LEGACY_PUBLIC_ROOT, absolutePath);

  // Prevent directory traversal beyond vpk_braai_ultimate/public.
  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot) ||
    relativeToRoot.includes(`..${path.sep}`)
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

    if (ext === ".html") {
      const html = await readFile(absolutePath, "utf8");
      const enhancedHtml = injectLegacyStudioEnhancements(html);
      return new NextResponse(enhancedHtml, {
        status: 200,
        headers: {
          "content-type": contentType,
          "cache-control": "no-store",
        },
      });
    }

    const file = await readFile(absolutePath);

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
