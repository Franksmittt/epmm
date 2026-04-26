"use client";

import type { ChangeEvent } from "react";

const CAMP_IMG =
  "https://images.unsplash.com/photo-1517677129300-07b130802f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

type Props = {
  onPickImage: (e: ChangeEvent<HTMLInputElement>, targetImgId: string) => void;
  onDownload: (cardId: string) => void;
};

export function RapidStudioCampaignLayouts({ onPickImage, onDownload }: Props) {
  return (
    <>
      <div className="editor-wrapper">
        <h3 className="wrapper-title">Campaign 1: Classic</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-c7">Hero image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-c7"
              onChange={(e) => onPickImage(e, "img-7")}
            />
          </div>
        </div>
        <div className="story-card story-card--campaign" id="card-7">
          <div className="camp1v2-photo">
            <img src={CAMP_IMG} id="img-7" alt="" />
          </div>
          <div className="camp1v2-footer">
            <div className="camp1v2-footer-inner">
              <p className="campv2-eyebrow" contentEditable suppressContentEditableWarning>
                Limited edition
              </p>
              <div className="campv2-promo-pill camp-promo-fill">
                <span contentEditable suppressContentEditableWarning>
                  30% off this week
                </span>
              </div>
              <h2 className="campv2-headline">
                <span contentEditable suppressContentEditableWarning>
                  Vintage
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  jacket
                </span>
              </h2>
              <div className="campv2-accent-rule" aria-hidden />
              <p className="campv2-deck" contentEditable suppressContentEditableWarning>
                One drop. Built to layer. Ships fast.
              </p>
              <p className="campv2-cta" contentEditable suppressContentEditableWarning>
                Shop now →
              </p>
            </div>
          </div>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-7")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Campaign 2: Split</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-c8">Center image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-c8"
              onChange={(e) => onPickImage(e, "img-8")}
            />
          </div>
        </div>
        <div className="story-card story-card--campaign" id="card-8">
          <div className="camp2v2-photo">
            <img src={CAMP_IMG} id="img-8" alt="" />
          </div>
          <aside className="campv2-aside-panel campv2-aside-panel--invert" aria-label="Promo copy">
            <div className="campv2-aside-top">
              <p className="campv2-eyebrow campv2-eyebrow--invert" contentEditable suppressContentEditableWarning>
                Just landed
              </p>
              <div className="campv2-promo-pill camp-promo-fill">
                <span contentEditable suppressContentEditableWarning>
                  Sale · 50% off
                </span>
              </div>
            </div>
            <div className="campv2-aside-bottom">
              <h2 className="campv2-headline campv2-headline--invert">
                <span contentEditable suppressContentEditableWarning>
                  New
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  arrival
                </span>
              </h2>
              <div className="campv2-accent-rule" aria-hidden />
              <p className="campv2-deck campv2-deck--invert" contentEditable suppressContentEditableWarning>
                Fresh silhouettes, same energy. Tap in.
              </p>
              <p className="campv2-cta campv2-cta--invert" contentEditable suppressContentEditableWarning>
                View lookbook →
              </p>
            </div>
          </aside>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-8")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Campaign 3: Inverted</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-c9">Full bleed</label>
            <input
              type="file"
              accept="image/*"
              id="upload-c9"
              onChange={(e) => onPickImage(e, "img-9")}
            />
          </div>
        </div>
        <div className="story-card story-card--campaign" id="card-9">
          <div className="camp3v2-photo">
            <img src={CAMP_IMG} id="img-9" alt="" />
          </div>
          <div className="camp3v2-scrim" aria-hidden />
          <div className="camp3v2-copy">
            <p className="campv2-eyebrow campv2-eyebrow--invert" contentEditable suppressContentEditableWarning>
              www.yourbrand.com
            </p>
            <div className="campv2-promo-pill camp-promo-fill">
              <span contentEditable suppressContentEditableWarning>
                30% off · ends Sunday
              </span>
            </div>
            <h2 className="campv2-headline campv2-headline--invert">
              <span contentEditable suppressContentEditableWarning>
                Great
              </span>
              <br />
              <span contentEditable suppressContentEditableWarning>
                sale
              </span>
            </h2>
            <div className="campv2-accent-rule" aria-hidden />
            <p className="campv2-deck campv2-deck--invert" contentEditable suppressContentEditableWarning>
              Stack the staples you will actually wear on repeat.
            </p>
            <p className="campv2-cta campv2-cta--invert" contentEditable suppressContentEditableWarning>
              Shop the sale →
            </p>
          </div>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-9")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Campaign 4: Side promo</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-c10">Hero image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-c10"
              onChange={(e) => onPickImage(e, "img-10")}
            />
          </div>
        </div>
        <div className="story-card story-card--campaign" id="card-10">
          <div className="camp4v2-photo">
            <img src={CAMP_IMG} id="img-10" alt="" />
          </div>
          <aside className="campv2-aside-panel" aria-label="Promo copy">
            <div className="campv2-aside-top">
              <p className="campv2-eyebrow" contentEditable suppressContentEditableWarning>
                Limited run
              </p>
              <div className="campv2-promo-pill camp-promo-fill">
                <span contentEditable suppressContentEditableWarning>
                  Big sale · weekend only
                </span>
              </div>
            </div>
            <div className="campv2-aside-bottom">
              <h2 className="campv2-headline">
                <span contentEditable suppressContentEditableWarning>
                  Street
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  wear
                </span>
              </h2>
              <div className="campv2-accent-rule" aria-hidden />
              <p className="campv2-deck" contentEditable suppressContentEditableWarning>
                Drop-in fits, new palettes, same attitude.
              </p>
              <p className="campv2-cta" contentEditable suppressContentEditableWarning>
                Shop the drop →
              </p>
            </div>
          </aside>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-10")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Campaign 5: Corner tag</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-c11">Full bleed image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-c11"
              onChange={(e) => onPickImage(e, "img-11")}
            />
          </div>
        </div>
        <div className="story-card story-card--campaign" id="card-11">
          <div className="camp5v2-photo">
            <img src={CAMP_IMG} id="img-11" alt="" />
          </div>
          <div className="camp5v2-scrim" aria-hidden />
          <div className="camp5v2-tag" role="region" aria-label="Promo copy">
            <div className="camp5v2-tag-inner">
              <p className="campv2-eyebrow" contentEditable suppressContentEditableWarning>
                New drop
              </p>
              <div className="campv2-promo-pill camp-promo-fill">
                <span contentEditable suppressContentEditableWarning>
                  30% off · today only
                </span>
              </div>
              <h2 className="campv2-headline">
                <span contentEditable suppressContentEditableWarning>
                  New
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  collection
                </span>
              </h2>
              <div className="campv2-accent-rule" aria-hidden />
              <p className="campv2-deck" contentEditable suppressContentEditableWarning>
                Refined cuts, louder color. Built for the feed.
              </p>
              <p className="campv2-cta" contentEditable suppressContentEditableWarning>
                Explore drop →
              </p>
            </div>
          </div>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-11")}>
          Download Template
        </button>
      </div>

      <div className="editor-wrapper">
        <h3 className="wrapper-title">Campaign 6: Block headers</h3>
        <div className="controls">
          <div className="file-upload-group">
            <label htmlFor="upload-c12">Center image</label>
            <input
              type="file"
              accept="image/*"
              id="upload-c12"
              onChange={(e) => onPickImage(e, "img-12")}
            />
          </div>
        </div>
        <div className="story-card story-card--campaign" id="card-12">
          <header className="camp6v2-topbar">
            <p className="campv2-eyebrow" contentEditable suppressContentEditableWarning>
              New arrival
            </p>
            <div className="campv2-promo-pill camp-promo-fill">
              <span contentEditable suppressContentEditableWarning>
                Sale · 50% off
              </span>
            </div>
          </header>
          <div className="camp6v2-photo">
            <img src={CAMP_IMG} id="img-12" alt="" />
          </div>
          <footer className="camp6v2-footer">
            <div className="camp6v2-footer-inner">
              <h2 className="campv2-headline">
                <span contentEditable suppressContentEditableWarning>
                  New
                </span>
                <br />
                <span contentEditable suppressContentEditableWarning>
                  season
                </span>
              </h2>
              <div className="campv2-accent-rule" aria-hidden />
              <p className="campv2-deck" contentEditable suppressContentEditableWarning>
                www.yourbrand.com · Restocks weekly · Free returns
              </p>
              <p className="campv2-cta" contentEditable suppressContentEditableWarning>
                Shop new in →
              </p>
            </div>
          </footer>
        </div>
        <button type="button" className="download-btn" onClick={() => onDownload("card-12")}>
          Download Template
        </button>
      </div>
    </>
  );
}
