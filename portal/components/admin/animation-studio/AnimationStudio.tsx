"use client";

import html2canvas from "html2canvas";
import { Inter, Montserrat, Playfair_Display } from "next/font/google";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "./animation-studio.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

type AnimationTemplateId = "corner-paths" | "bottom-rail-burst";

const TEMPLATE_LABELS: Record<AnimationTemplateId, { title: string; subtitle: string }> = {
  "corner-paths": {
    title: "Corner paths",
    subtitle: "SVG frame draw + headline cascade (8s loop)",
  },
  "bottom-rail-burst": {
    title: "Maison editorial",
    subtitle: "Classic luxe fashion · gold rule · 8s loop",
  },
};

const TEMPLATE_COPY_SCHEMAS: Record<AnimationTemplateId, Record<string, number>> = {
  "corner-paths": {
    header_brand: 10,
    header_tag_1: 15,
    header_tag_2: 15,
    website: 30,
    main_title: 20,
    btn_text: 10,
  },
  "bottom-rail-burst": {
    hf_season: 28,
    hf_house: 22,
    hf_collection: 36,
    hf_tagline: 72,
    hf_cta: 26,
    hf_atelier: 42,
  },
};

const DEFAULT_VIDEO =
  "https://cdn.coverr.co/videos/coverr-roaring-fire-in-a-fireplace-5440/1080p.mp4";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";

/** Recording length; CSS timeline matches this (1s hold + 5s motion + 2s hold). */
const RECORD_DURATION_MS = 8_000;

function stripJsonFence(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```json")) {
    s = s.replace(/^```json\n?/, "").replace(/\n?```\s*$/, "");
  } else if (s.startsWith("```")) {
    s = s.replace(/^```\n?/, "").replace(/\n?```\s*$/, "");
  }
  return s.trim();
}

function setEditableLines(el: HTMLElement, value: unknown) {
  const str = typeof value === "string" ? value : String(value ?? "");
  el.replaceChildren();
  const lines = str.split("\n");
  lines.forEach((line, i) => {
    if (i > 0) el.appendChild(document.createElement("br"));
    el.appendChild(document.createTextNode(line));
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function pickWebmMimeType(): string | undefined {
  const candidates = [
    "video/webm; codecs=vp9",
    "video/webm; codecs=vp8",
    "video/webm",
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return undefined;
}

type DisplayMediaOptionsExtended = DisplayMediaStreamOptions & {
  preferCurrentTab?: boolean;
};

type CroppableVideoTrack = MediaStreamTrack & {
  cropTo?: (target: unknown) => Promise<void>;
};

function getCropTargetCtor(): { fromElement: (el: Element) => Promise<unknown> } | undefined {
  return (globalThis as unknown as { CropTarget?: { fromElement: (el: Element) => Promise<unknown> } })
    .CropTarget;
}

/** Region Capture: output is only the element’s on-screen box (here 450×800 ≈ 9:16). */
async function tryCropDisplayTrackToElement(
  track: MediaStreamTrack,
  element: HTMLElement,
): Promise<boolean> {
  const CropTargetCtor = getCropTargetCtor();
  const croppable = track as CroppableVideoTrack;
  if (!CropTargetCtor?.fromElement || typeof croppable.cropTo !== "function") {
    return false;
  }
  try {
    const target = await CropTargetCtor.fromElement(element);
    await croppable.cropTo(target);
    return true;
  } catch {
    return false;
  }
}

function tryClearTrackCrop(track: MediaStreamTrack | undefined) {
  if (!track) return;
  const croppable = track as CroppableVideoTrack;
  if (typeof croppable.cropTo !== "function") return;
  void croppable.cropTo(null).catch(() => {});
}

export function AnimationStudio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainStageRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const tplRef = useRef<HTMLDivElement>(null);
  const bgFileInputId = useId();
  const recordStopTimerRef = useRef<number | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy rules");
  const [injectLabel, setInjectLabel] = useState("Inject data");
  const [bgMode, setBgMode] = useState<"video" | "image">("video");
  const [bgVideoSrc, setBgVideoSrc] = useState(DEFAULT_VIDEO);
  const [bgImageSrc, setBgImageSrc] = useState(DEFAULT_IMAGE);
  const [isRecording, setIsRecording] = useState(false);
  const [canScreenRecord, setCanScreenRecord] = useState(false);
  const [templateId, setTemplateId] = useState<AnimationTemplateId>("corner-paths");

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      !!navigator.mediaDevices?.getDisplayMedia;
    setCanScreenRecord(ok);
  }, []);

  const lastVideoUrlRef = useRef(bgVideoSrc);
  const lastImageUrlRef = useRef(bgImageSrc);
  lastVideoUrlRef.current = bgVideoSrc;
  lastImageUrlRef.current = bgImageSrc;

  useEffect(() => {
    return () => {
      if (lastVideoUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(lastVideoUrlRef.current);
      }
      if (lastImageUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(lastImageUrlRef.current);
      }
    };
  }, []);

  const triggerAnimations = useCallback(() => {
    const el = captureRef.current;
    if (!el) return;
    el.classList.remove("as-trigger-anim");
    void el.offsetWidth;
    el.classList.add("as-trigger-anim");
  }, []);

  const fitCanvasToScreen = useCallback(() => {
    const canvas = captureRef.current;
    const main = mainStageRef.current;
    if (!canvas || !main) return;
    const rect = main.getBoundingClientRect();
    const safeHeight = rect.height - 64;
    const safeWidth = rect.width - 64;
    const scaleY = safeHeight / 800;
    const scaleX = safeWidth / 450;
    const scale = Math.min(scaleX, scaleY, 1);
    canvas.style.transform = `scale(${scale})`;
  }, []);

  useEffect(() => {
    fitCanvasToScreen();
    triggerAnimations();
  }, [fitCanvasToScreen, triggerAnimations]);

  useEffect(() => {
    triggerAnimations();
  }, [templateId, triggerAnimations]);

  useEffect(() => {
    const ro = new ResizeObserver(() => fitCanvasToScreen());
    const main = mainStageRef.current;
    if (main) ro.observe(main);
    window.addEventListener("resize", fitCanvasToScreen);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fitCanvasToScreen);
    };
  }, [fitCanvasToScreen]);

  const onBackgroundFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("video/")) {
      setBgMode("video");
      setBgVideoSrc((prev) => {
        if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } else if (file.type.startsWith("image/")) {
      setBgMode("image");
      setBgImageSrc((prev) => {
        if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      URL.revokeObjectURL(url);
      window.alert("Please choose a video or image file.");
      e.target.value = "";
      return;
    }
    e.target.value = "";
    triggerAnimations();
  };

  const onCopyRules = async () => {
    const root = tplRef.current;
    if (!root) return;
    const schema = TEMPLATE_COPY_SCHEMAS[templateId];
    const currentData: Record<string, string> = {};
    let charLimitsText = "";
    root.querySelectorAll<HTMLElement>("[data-as-key]").forEach((node) => {
      const key = node.getAttribute("data-as-key");
      if (!key) return;
      currentData[key] = node.innerText.trim().replace(/\n/g, "<br>");
      const lim = schema[key];
      if (typeof lim === "number") {
        charLimitsText += `- ${key}: Target ${lim} chars\n`;
      }
    });

    const promptText = `I am creating an After Effects style social media video ad. Write the copy for a company/product. Adhere to limits strictly so the layout does not break. ONLY output raw JSON.
LIMITS:
${charLimitsText}
TEMPLATE:
${JSON.stringify(currentData, null, 2)}`;

    setCopyLabel("Copied ✓");
    setTimeout(() => setCopyLabel("Copy rules"), 2000);
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      /* ignore */
    }
  };

  const onInjectData = () => {
    let jsonString = stripJsonFence(jsonInput);
    try {
      const newData = JSON.parse(jsonString) as Record<string, unknown>;
      const root = tplRef.current;
      if (!root) return;
      for (const [key, value] of Object.entries(newData)) {
        const target = root.querySelector<HTMLElement>(`[data-as-key="${key}"]`);
        if (target) setEditableLines(target, value);
      }
      setInjectLabel("Data injected ✓");
      setTimeout(() => setInjectLabel("Inject data"), 2000);
      triggerAnimations();
    } catch {
      window.alert("Invalid JSON format.");
    }
  };

  const onDownloadPng = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const editables = document.querySelectorAll<HTMLElement>(
      "#animation-studio-root [data-as-key][contenteditable='true']",
    );
    editables.forEach((el) => {
      el.style.backgroundColor = "transparent";
    });

    const captureArea = captureRef.current;
    if (!captureArea) return;

    captureArea.classList.add("as-exporting-mode");
    captureArea.style.transform = "scale(1)";

    window.setTimeout(async () => {
      try {
        await document.fonts.ready;
        const canvas = await html2canvas(captureArea, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#0a0a0a",
        });
        const link = document.createElement("a");
        link.download = "animation-studio-frame.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } finally {
        editables.forEach((el) => {
          el.style.backgroundColor = "";
        });
        captureArea.classList.remove("as-exporting-mode");
        fitCanvasToScreen();
      }
    }, 100);
  };

  const enterTheater = useCallback(() => {
    rootRef.current?.classList.add("as-theater");
    void rootRef.current?.offsetHeight;
  }, []);

  const exitTheater = useCallback(() => {
    rootRef.current?.classList.remove("as-theater");
  }, []);

  const resetCanvasVideosAndAnimations = useCallback(() => {
    tplRef.current?.querySelectorAll("video").forEach((v) => {
      const src = v.currentSrc || v.src;
      if (!src) return;
      try {
        v.pause();
        v.currentTime = 0;
        const p = v.play();
        if (p !== undefined) void p.catch(() => {});
      } catch {
        /* ignore */
      }
    });
    triggerAnimations();
  }, [triggerAnimations]);

  const onRecord8sVideo = useCallback(async () => {
    if (isRecording) return;
    if (!canScreenRecord) {
      window.alert(
        "Tab recording needs a secure context. Open this app with https:// or http://localhost (not a raw LAN IP over HTTP), then try again.",
      );
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      window.alert("Screen recording is not supported in this browser.");
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsRecording(true);
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;

    const clearRecordTimer = () => {
      if (recordStopTimerRef.current !== null) {
        window.clearTimeout(recordStopTimerRef.current);
        recordStopTimerRef.current = null;
      }
    };

    const killStream = () => {
      const vt = stream?.getVideoTracks()[0];
      tryClearTrackCrop(vt);
      stream?.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          /* ignore */
        }
      });
      stream = null;
    };

    const finish = () => {
      clearRecordTimer();
      exitTheater();
      fitCanvasToScreen();
      killStream();
      setIsRecording(false);
    };

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          frameRate: { ideal: 60 },
          cursor: "never",
        } as MediaTrackConstraints,
        audio: false,
        preferCurrentTab: true,
      } as DisplayMediaOptionsExtended);
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "AbortError") {
        window.alert(
          "Screen share was cancelled or denied. When prompted, choose **This tab** (Chrome tab / window)—not Entire screen—so the recording can be cropped to the 9:16 canvas only.",
        );
      } else {
        window.alert(
          err instanceof Error ? err.message : "Could not start screen capture. Try again or use another browser.",
        );
      }
      finish();
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      finish();
      return;
    }

    enterTheater();
    await sleep(800);

    const captureEl = captureRef.current;
    if (captureEl) {
      captureEl.style.transform = "scale(1)";
      void captureEl.offsetHeight;
    }

    resetCanvasVideosAndAnimations();

    const croppedOk = captureEl
      ? await tryCropDisplayTrackToElement(videoTrack, captureEl)
      : false;
    if (!croppedOk) {
      window.alert(
        "Could not lock the recording to the 9:16 canvas only.\n\n" +
          "• Use **Chrome** or **Edge** (Chromium).\n" +
          "• When sharing, pick **This tab** / **Chrome tab** — not **Entire screen**.\n" +
          "• If your browser is older, update it (Region Capture is required).",
      );
      finish();
      return;
    }

    const chunks: Blob[] = [];
    const mimeType = pickWebmMimeType();
    const recorderOptions: MediaRecorderOptions = {
      videoBitsPerSecond: 15_000_000,
    };
    if (mimeType) recorderOptions.mimeType = mimeType;

    try {
      recorder = new MediaRecorder(stream, recorderOptions);
    } catch {
      try {
        recorder = new MediaRecorder(stream, { videoBitsPerSecond: 15_000_000 });
      } catch (e2) {
        window.alert(
          e2 instanceof Error
            ? e2.message
            : "Could not start MediaRecorder. Your browser may not support VP9 / high-bitrate capture.",
        );
        finish();
        return;
      }
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunks.push(ev.data);
    };

    const onEnded = () => {
      clearRecordTimer();
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
      }
    };
    videoTrack.addEventListener("ended", onEnded);

    recorder.onstop = () => {
      clearRecordTimer();
      videoTrack.removeEventListener("ended", onEnded);
      exitTheater();
      fitCanvasToScreen();

      const blobType = recorder?.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunks, { type: blobType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "animation-studio-9x16.webm";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2_000);

      killStream();
      recorder = null;
      setIsRecording(false);
    };

    try {
      recorder.start(200);
    } catch (e3) {
      window.alert(e3 instanceof Error ? e3.message : "Failed to start recorder.");
      videoTrack.removeEventListener("ended", onEnded);
      finish();
      return;
    }

    recordStopTimerRef.current = window.setTimeout(() => {
      recordStopTimerRef.current = null;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* ignore */
        }
      }
    }, RECORD_DURATION_MS);
  }, [
    enterTheater,
    exitTheater,
    fitCanvasToScreen,
    isRecording,
    resetCanvasVideosAndAnimations,
    canScreenRecord,
  ]);

  return (
    <div id="animation-studio-root" ref={rootRef} className={inter.className}>
      <aside className="as-sidebar" aria-label="Animation controls">
        <div className="as-sidebar-head">
          <h1>Animation Studio</h1>
          <p>
            {TEMPLATE_LABELS[templateId].title} · {TEMPLATE_LABELS[templateId].subtitle}
          </p>
        </div>

        <div className="as-sidebar-body">
          <div className="flex flex-col gap-3">
            <span className="as-field-label">Template</span>
            <select
              className="as-template-select"
              value={templateId}
              disabled={isRecording}
              onChange={(e) => setTemplateId(e.target.value as AnimationTemplateId)}
              aria-label="Animation template"
            >
              <option value="corner-paths">Corner paths</option>
              <option value="bottom-rail-burst">Maison editorial</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <span className="as-field-label">1. Background</span>
            <div className="as-bg-mode-row" role="group" aria-label="Background type">
              <button
                type="button"
                className={`as-bg-mode-btn${bgMode === "video" ? " as-bg-mode-btn--on" : ""}`}
                onClick={() => setBgMode("video")}
                disabled={isRecording}
              >
                Video
              </button>
              <button
                type="button"
                className={`as-bg-mode-btn${bgMode === "image" ? " as-bg-mode-btn--on" : ""}`}
                onClick={() => setBgMode("image")}
                disabled={isRecording}
              >
                Image
              </button>
            </div>
            <label className="as-upload-zone" htmlFor={bgFileInputId} aria-disabled={isRecording}>
              <span>
                {bgMode === "video"
                  ? "Upload video (or switch to Image for .jpg / .png)"
                  : "Upload image (or switch to Video for .mp4)"}
              </span>
              <input
                type="file"
                id={bgFileInputId}
                className="sr-only"
                accept="video/*,image/*"
                disabled={isRecording}
                onChange={onBackgroundFile}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <span className="as-field-label">
              2. JSON payload
              <button
                type="button"
                className="as-btn-ghost"
                disabled={isRecording}
                onClick={() => void onCopyRules()}
              >
                {copyLabel}
              </button>
            </span>
            <textarea
              className="as-textarea"
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste AI JSON…"
              spellCheck={false}
              disabled={isRecording}
            />
            <button
              type="button"
              className="as-btn-teal"
              onClick={onInjectData}
              disabled={isRecording}
            >
              {injectLabel}
            </button>
          </div>
        </div>

        <div className="as-sidebar-foot">
          <button
            type="button"
            className="as-btn-gray"
            onClick={onDownloadPng}
            disabled={isRecording}
          >
            Capture static frame
          </button>
          <button
            type="button"
            className="as-btn-record"
            disabled={isRecording || !canScreenRecord}
            title={
              canScreenRecord
                ? "Records this tab for 8 seconds (1s intro hold, 5s animation, 2s outro hold). Choose This tab when prompted."
                : "Unavailable: open the app over HTTPS or localhost so the browser allows tab capture."
            }
            onClick={() => void onRecord8sVideo()}
          >
            <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            {isRecording
              ? "Recording…"
              : canScreenRecord
                ? "Record 8s video"
                : "Record unavailable"}
          </button>
          {!canScreenRecord ? (
            <p className="as-record-hint">
              <strong>Why?</strong> Browsers only expose tab recording on{" "}
              <strong>https://</strong> or <strong>http://localhost</strong>. Over plain{" "}
              <strong>http://</strong> on a network IP, the button stays off—use localhost or TLS.
            </p>
          ) : (
            <p className="as-record-hint">
              When the browser asks what to share, pick <strong>This tab</strong> (Chrome tab /
              window)—<strong>not Entire screen</strong>—so Region Capture can crop the stream to
              the <strong>450×800</strong> canvas only (9:16 for vertical social).
            </p>
          )}
        </div>
      </aside>

      <main className="as-main" ref={mainStageRef}>
        <div className="as-main-inner">
          <div
            ref={captureRef}
            className={`as-capture-area ${montserrat.className} as-trigger-anim`}
            id="as-capture-area"
          >
            <div ref={tplRef} className="as-tpl" id="as-tpl-master">
              {templateId === "corner-paths" ? (
                <>
                  {bgMode === "video" ? (
                    <video
                      key={bgVideoSrc}
                      className="as-main-bg"
                      autoPlay
                      loop
                      muted
                      playsInline
                      crossOrigin={
                        bgVideoSrc.startsWith("blob:") ? undefined : "anonymous"
                      }
                      src={bgVideoSrc}
                    />
                  ) : (
                    <img
                      className="as-main-bg"
                      src={bgImageSrc}
                      alt=""
                      crossOrigin={
                        bgImageSrc.startsWith("blob:") ? undefined : "anonymous"
                      }
                    />
                  )}
                  <div className="as-frame-border" aria-hidden />

                  <svg
                    className="as-svg-lines"
                    viewBox="0 0 450 800"
                    fill="none"
                    stroke="white"
                    strokeWidth={8}
                    strokeLinejoin="miter"
                    aria-hidden
                  >
                    <polyline
                      className="as-seq-svg-draw"
                      points="32,32 418,32 418,584"
                      style={{ strokeDasharray: 938, strokeDashoffset: 938 }}
                    />
                    <polyline
                      className="as-seq-svg-draw"
                      points="418,768 32,768 32,216"
                      style={{ strokeDasharray: 938, strokeDashoffset: 938 }}
                    />
                  </svg>

                  <div className="as-header-row as-seq-text-slide as-delay-200">
                    <span
                      data-as-key="header_brand"
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      className="as-header-brand"
                    >
                      INSTA
                    </span>
                    <div className="as-header-divider" aria-hidden />
                    <div className="as-header-tags">
                      <span
                        data-as-key="header_tag_1"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        className="as-header-tag-1"
                      >
                        Aftereffects
                      </span>
                      <span
                        data-as-key="header_tag_2"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        className="as-header-tag-2"
                      >
                        Template
                      </span>
                    </div>
                  </div>

                  <div className="as-mid-block as-seq-text-slide as-delay-0">
                    <span
                      data-as-key="website"
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      className="as-website"
                    >
                      www.instaweb.com
                    </span>
                    <h1
                      data-as-key="main_title"
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      className="as-main-title"
                    >
                      InstaStories
                    </h1>
                  </div>

                  <div className="as-cta-wrap as-seq-text-slide as-delay-400">
                    <div className="as-cta-box">
                      <span
                        data-as-key="btn_text"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        className="as-cta-text"
                      >
                        SHOP
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="as-br-stack">
                  <div className="as-br-bg-movie">
                    {bgMode === "video" ? (
                      <video
                        key={bgVideoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        crossOrigin={
                          bgVideoSrc.startsWith("blob:") ? undefined : "anonymous"
                        }
                        src={bgVideoSrc}
                      />
                    ) : (
                      <img
                        src={bgImageSrc}
                        alt=""
                        crossOrigin={
                          bgImageSrc.startsWith("blob:") ? undefined : "anonymous"
                        }
                      />
                    )}
                  </div>
                  <div className="as-hf-scrim" aria-hidden />
                  <div className={`as-hf-stage ${playfair.className}`}>
                    <div className="as-hf-inset">
                      <div className="as-hf-ornament as-hf-seq-line-draw" aria-hidden />
                      <p
                        className="as-hf-season as-hf-seq-rise as-hf-d0"
                        data-as-key="hf_season"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                      >
                        Printemps · Été MMXXVI
                      </p>
                      <p
                        className="as-hf-house as-hf-seq-rise as-hf-d1"
                        data-as-key="hf_house"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                      >
                        Maison Nocturne
                      </p>
                      <h2
                        className="as-hf-collection as-hf-seq-rise as-hf-d2"
                        data-as-key="hf_collection"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                      >
                        The Silk Archive
                      </h2>
                      <div className="as-hf-rule-wrap">
                        <div className="as-hf-rule as-hf-seq-line" aria-hidden />
                      </div>
                      <p
                        className="as-hf-tagline as-hf-seq-rise as-hf-d3"
                        data-as-key="hf_tagline"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                      >
                        Bias-cut slips, double-faced wool, and candlelight tailoring — made to order in limited
                        series.
                      </p>
                      <p
                        className="as-hf-cta as-hf-seq-rise as-hf-d4"
                        data-as-key="hf_cta"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                      >
                        Request the lookbook
                      </p>
                      <p
                        className="as-hf-atelier as-hf-seq-rise as-hf-d5"
                        data-as-key="hf_atelier"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                      >
                        Atelier Paris · Private fittings by appointment
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
