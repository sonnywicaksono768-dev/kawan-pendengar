"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HOTLINES, hotlineLabel } from "@/data/hotlines";
import { Icon } from "@/components/Icon";

type SosButtonProps = {
  compact?: boolean;
};

/**
 * Works with no network and no AI. The numbers come from data/hotlines.ts only.
 */
export function SosButton({ compact = false }: SosButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    document.body.style.overflow = "hidden";
    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      (previous ?? triggerRef.current)?.focus();
    };
  }, [open]);

  const dialog = mounted && open
    ? createPortal(
        <div
          className="sos-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="sos-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-title"
            ref={dialogRef}
          >
            <div className="sos-head">
              <h2 id="sos-title">Bantuan darurat</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Tutup bantuan darurat"
              >
                <Icon name="close" />
              </button>
            </div>

            <p>
              Kalau kamu merasa tidak aman atau ingin menyakiti diri, hubungi sekarang. Kamu tidak
              perlu menjelaskan panjang di telepon.
            </p>

            <ul className="hotline-list">
              {HOTLINES.map((hotline) => (
                <li className="hotline" key={hotline.id}>
                  <span className="hotline-label">{hotline.label}</span>
                  <a className="hotline-number" href={`tel:${hotline.phone}`}>
                    {hotlineLabel(hotline)}
                  </a>
                  <p>{hotline.description}</p>
                </li>
              ))}
            </ul>

            <p className="sos-foot">
              Kalau bahaya sedang terjadi, datang ke IGD rumah sakit terdekat atau minta bantuan
              orang di sekitarmu. Halaman{" "}
              <a href="/bantuan">Bantuan</a> berisi panduan yang sama tanpa perlu koneksi ke AI.
            </p>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={compact ? "btn btn-danger btn-sm" : "btn btn-danger"}
        aria-label="Bantuan darurat"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="life-buoy" />
        {compact ? (
          <>
            <span className="sos-label-full" aria-hidden="true">Bantuan darurat</span>
            <span className="sos-label-short" aria-hidden="true">Darurat</span>
          </>
        ) : (
          <span>Bantuan darurat</span>
        )}
      </button>
      {dialog}
    </>
  );
}
