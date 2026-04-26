"use client";

import html2canvas from "html2canvas";
import { useCallback, useMemo, useState } from "react";
import { RapidStudioCampaignLayouts } from "./RapidStudioCampaignLayouts";
import "./rapid-studio.css";

function bindImage(
  e: React.ChangeEvent<HTMLInputElement>,
  targetImgId: string,
) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const el = document.getElementById(targetImgId) as HTMLImageElement | null;
    if (el) el.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

const CAMPAIGN_CARD_IDS = new Set([
  "card-7",
  "card-8",
  "card-9",
  "card-10",
  "card-11",
  "card-12",
]);

async function downloadImage(cardId: string) {
  if (typeof document === "undefined") return;
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();

  await document.fonts.ready;

  const targetElement = document.getElementById(cardId);
  if (!targetElement) return;

  const isCampaign = CAMPAIGN_CARD_IDS.has(cardId);
  const canvas = await html2canvas(targetElement, {
    scale: 3,
    useCORS: true,
    backgroundColor: isCampaign ? "#ffffff" : "#000000",
  });

  const link = document.createElement("a");
  link.download = isCampaign
    ? `${cardId}-campaign-story.png`
    : `${cardId}-streetwear-story.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function RapidStudio() {
  const [theme, setTheme] = useState("red");

  const themeVars = useMemo(() => {
    if (theme === "blue") {
      return {
        "--rs-red-overlay": "rgba(0, 102, 204, 0.9)",
        "--rs-red-solid": "#0066cc",
        "--rs-red-hover": "#2a85e6",
      } as React.CSSProperties;
    }
    if (theme === "green") {
      return {
        "--rs-red-overlay": "rgba(0, 153, 102, 0.9)",
        "--rs-red-solid": "#009966",
        "--rs-red-hover": "#00b377",
      } as React.CSSProperties;
    }
    if (theme === "purple") {
      return {
        "--rs-red-overlay": "rgba(121, 40, 202, 0.9)",
        "--rs-red-solid": "#7928ca",
        "--rs-red-hover": "#9a4de2",
      } as React.CSSProperties;
    }
    if (theme === "orange") {
      return {
        "--rs-red-overlay": "rgba(217, 102, 0, 0.9)",
        "--rs-red-solid": "#d96600",
        "--rs-red-hover": "#ff8a1f",
      } as React.CSSProperties;
    }
    if (theme === "mono") {
      return {
        "--rs-red-overlay": "rgba(51, 51, 51, 0.92)",
        "--rs-red-solid": "#333333",
        "--rs-red-hover": "#4a4a4a",
      } as React.CSSProperties;
    }
    return {
      "--rs-red-overlay": "rgba(215, 10, 10, 0.92)",
      "--rs-red-solid": "#d70a0a",
      "--rs-red-hover": "#ff1a1a",
    } as React.CSSProperties;
  }, [theme]);

  const onDownload = useCallback((cardId: string) => {
    void downloadImage(cardId);
  }, []);

  return (
    <div id="rapid-studio-root" style={themeVars}>
      <div className="theme-toolbar">
        <label htmlFor="rapid-theme-select">Accent theme</label>
        <select
          id="rapid-theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          aria-label="Rapid studio accent theme"
        >
          <option value="red">Red (default)</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="orange">Orange</option>
          <option value="mono">Monochrome</option>
        </select>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Layout 1: Bottom Bar</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-1">Background Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-1"
              onChange={(e) => bindImage(e, "img-1")}
            />
          </div>
        </div>
        <div className="story-card" id="card-1">
          <div className="inner-frame" />
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"
            id="img-1"
            className="bg-img"
            alt="Background"
          />
          <div className="t1-bottom text-white text-center">
            <span contentEditable suppressContentEditableWarning style={{ fontSize: "0.5rem", fontWeight: 600 }}>
              #WILDSTYLE
            </span>
            <h1 className="font-black" style={{ fontSize: "1.3rem", margin: "5px 0" }}>
              <span className="x-mark" contentEditable={false}>
                x
              </span>
              <span contentEditable suppressContentEditableWarning>NEW ARRIVAL</span>
              <span className="x-mark" contentEditable={false}>
                x
              </span>
            </h1>
            <span contentEditable suppressContentEditableWarning className="badge">
              GET 50% OFF
            </span>
          </div>
          <button type="button" className="shop-btn" contentEditable suppressContentEditableWarning>
            SHOP NOW
          </button>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-1")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Layout 2: Left Split</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-2">Right Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-2"
              onChange={(e) => bindImage(e, "img-2")}
            />
          </div>
        </div>
        <div className="story-card" id="card-2">
          <div className="inner-frame" />
          <div
            style={{
              position: "absolute",
              right: 0,
              width: "60%",
              height: "100%",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1550614000-4b95d4ed79fa?w=400&q=80"
              id="img-2"
              className="bg-img"
              style={{ objectPosition: "left" }}
              alt=""
            />
          </div>
          <div className="t2-left text-white text-center">
            <h1 className="font-black t2-rotated-text">
              <span className="x-mark" contentEditable={false}>
                x
              </span>
              <span contentEditable suppressContentEditableWarning>
                FEATURED <br /> COLLECTION
              </span>
            </h1>
            <div style={{ position: "absolute", bottom: "80px" }}>
              <span contentEditable suppressContentEditableWarning style={{ fontSize: "0.5rem", fontWeight: 600 }}>
                #NEWSTYLE
              </span>
              <br />
              <span contentEditable suppressContentEditableWarning className="badge">
                GET 50% OFF
              </span>
            </div>
          </div>
          <button
            type="button"
            className="shop-btn"
            style={{ left: "22.5%" }}
            contentEditable
            suppressContentEditableWarning
          >
            SHOP NOW
          </button>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-2")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Layout 3: Grid Matrix</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-3-tr">Top Right Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-3-tr"
              onChange={(e) => bindImage(e, "img-3-tr")}
            />
          </div>
          <div className="file-upload-group">
            <label htmlFor="upload-3-bl">Bottom Left Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-3-bl"
              onChange={(e) => bindImage(e, "img-3-bl")}
            />
          </div>
        </div>
        <div className="story-card" id="card-3">
          <div className="inner-frame" />
          <div className="t3-grid">
            <div className="t3-red-box text-white">
              <h2 className="font-black" style={{ fontSize: "1.2rem", margin: 0 }}>
                <span className="x-mark" contentEditable={false}>
                  x
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  ALL <br /> NEW <br /> ITEM
                </span>
                <br />
                <span className="x-mark" contentEditable={false}>
                  x
                </span>
              </h2>
              <span contentEditable suppressContentEditableWarning style={{ fontSize: "0.5rem", marginTop: "5px" }}>
                #WILDSTYLE
              </span>
            </div>
            <div className="t3-img-box">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                id="img-3-tr"
                alt=""
              />
            </div>
            <div className="t3-img-box">
              <img
                src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80"
                id="img-3-bl"
                alt=""
              />
            </div>
            <div className="t3-red-box text-white">
              <h2 className="font-black" style={{ fontSize: "1.2rem", margin: 0 }}>
                <span className="x-mark" contentEditable={false}>
                  x
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  STYLE <br /> DROP
                </span>
                <br />
                <span className="x-mark" contentEditable={false}>
                  x
                </span>
              </h2>
              <span contentEditable suppressContentEditableWarning className="badge">
                GET 50% OFF
              </span>
            </div>
          </div>
          <button type="button" className="shop-btn" contentEditable suppressContentEditableWarning>
            SHOP NOW
          </button>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-3")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Layout 4: Horizontal Cut</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-4-top">Top Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-4-top"
              onChange={(e) => bindImage(e, "img-4-top")}
            />
          </div>
          <div className="file-upload-group">
            <label htmlFor="upload-4-bot">Bottom Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-4-bot"
              onChange={(e) => bindImage(e, "img-4-bot")}
            />
          </div>
        </div>
        <div className="story-card" id="card-4">
          <div className="inner-frame" />
          <div className="t4-top-img">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c028b?w=400&q=80"
              id="img-4-top"
              className="bg-img"
              style={{ objectPosition: "top" }}
              alt=""
            />
          </div>
          <div className="t4-mid-bar text-white">
            <span contentEditable suppressContentEditableWarning style={{ fontSize: "0.5rem", fontWeight: 600 }}>
              #STREETWEAR
            </span>
            <h1 className="font-black" style={{ fontSize: "1.4rem", margin: 0 }}>
              <span className="x-mark" contentEditable={false}>
                x
              </span>
              <span contentEditable suppressContentEditableWarning>FASHION SALE</span>
              <span className="x-mark" contentEditable={false}>
                x
              </span>
            </h1>
            <span contentEditable suppressContentEditableWarning className="badge">
              UP TO 70% OFF
            </span>
          </div>
          <div className="t4-bottom-img">
            <img
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80"
              id="img-4-bot"
              className="bg-img"
              style={{ objectPosition: "center" }}
              alt=""
            />
          </div>
          <button type="button" className="shop-btn" contentEditable suppressContentEditableWarning>
            SHOP NOW
          </button>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-4")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Layout 5: Cinematic Bars</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-5">Main Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-5"
              onChange={(e) => bindImage(e, "img-5")}
            />
          </div>
        </div>
        <div className="story-card" id="card-5">
          <div className="inner-frame" />
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80"
            id="img-5"
            className="bg-img"
            alt="Fashion"
          />
          <div className="t5-top text-white">
            <span contentEditable suppressContentEditableWarning style={{ fontSize: "0.5rem" }}>
              #NEWSTYLE
            </span>
            <h2 className="font-black" style={{ fontSize: "1.1rem", margin: "2px 0" }} contentEditable suppressContentEditableWarning>
              FEATURED ITEM
            </h2>
          </div>
          <div className="t5-bottom text-white text-center">
            <h1 className="font-black" style={{ fontSize: "1.3rem", margin: 0 }}>
              <span className="x-mark" contentEditable={false}>
                x
              </span>
              <span contentEditable suppressContentEditableWarning>GET 50% OFF</span>
              <span className="x-mark" contentEditable={false}>
                x
              </span>
            </h1>
            <p
              contentEditable
              suppressContentEditableWarning
              style={{
                fontSize: "0.45rem",
                width: "80%",
                margin: "5px auto 0",
                lineHeight: 1.4,
                opacity: 0.8,
              }}
            >
              Enter your promo details or short descriptive text here to hook the audience.
            </p>
          </div>
          <button type="button" className="shop-btn" contentEditable suppressContentEditableWarning>
            SHOP NOW
          </button>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-5")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Layout 6: Right Split</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-6">Left Image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-6"
              onChange={(e) => bindImage(e, "img-6")}
            />
          </div>
        </div>
        <div className="story-card" id="card-6">
          <div className="inner-frame" />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: "60%",
              height: "100%",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80"
              id="img-6"
              className="bg-img"
              style={{ objectPosition: "right" }}
              alt=""
            />
          </div>
          <div className="t6-right text-white text-center">
            <div style={{ marginTop: "-60px" }}>
              <h2 className="font-black" style={{ fontSize: "1.5rem", margin: 0 }} contentEditable suppressContentEditableWarning>
                ALL <br /> NEW <br /> ITEM
              </h2>
              <span
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  marginTop: "5px",
                  display: "block",
                }}
              >
                #WILDSTYLE
              </span>
              <span contentEditable suppressContentEditableWarning className="badge">
                GET 50% OFF
              </span>
            </div>
            <p
              contentEditable
              suppressContentEditableWarning
              style={{
                fontSize: "0.45rem",
                position: "absolute",
                bottom: "80px",
                width: "80%",
                opacity: 0.8,
                marginLeft: "10%",
              }}
            >
              Limited time offer. Tap below to shop the collection.
            </p>
          </div>
          <button
            type="button"
            className="shop-btn"
            style={{ left: "77.5%" }}
            contentEditable
            suppressContentEditableWarning
          >
            SHOP NOW
          </button>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-6")}>
          Download Template
        </button>
      </div>

      <RapidStudioCampaignLayouts onPickImage={bindImage} onDownload={onDownload} />
    </div>
  );
}
