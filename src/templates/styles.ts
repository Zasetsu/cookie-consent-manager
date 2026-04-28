import headerSvgRaw from "../assets/cookie-popup-header.svg?raw";
import type { InternalConfig } from "../types";

const HEADER_DATA_URI = "data:image/svg+xml," + encodeURIComponent(headerSvgRaw);

function toAlpha(color: string, alpha: number): string {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let r: number, g: number, b: number;
    if (hex[1].length === 3) {
      r = parseInt(hex[1][0] + hex[1][0], 16);
      g = parseInt(hex[1][1] + hex[1][1], 16);
      b = parseInt(hex[1][2] + hex[1][2], 16);
    } else {
      r = parseInt(hex[1].slice(0, 2), 16);
      g = parseInt(hex[1].slice(2, 4), 16);
      b = parseInt(hex[1].slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

export function getHeaderImageUri(headerImage: string): string | null {
  if (headerImage === "none") return null;
  if (headerImage === "default") return HEADER_DATA_URI;
  return headerImage;
}

export function generateCSS(theme: InternalConfig["theme"]): string {
  return `
.ccm-root {
  --ccm-primary: ${theme.primaryColor};
  --ccm-primary-light: ${toAlpha(theme.primaryColor, 0.1)};
  --ccm-text: ${theme.textColor};
  --ccm-text-secondary: #484848;
  --ccm-bg: ${theme.backgroundColor};
  --ccm-border-radius: ${theme.borderRadius};
  --ccm-overlay-bg: rgba(39, 39, 39, 0.71);
  --ccm-table-header-bg: #EDEDED;
  --ccm-table-row-bg: #F4F4F4;
  --ccm-divider: #D8D8D8;
  --ccm-gray: #6A6A6A;
  --ccm-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --ccm-transition: 0.2s ease;
}

.ccm-banner {
  position: fixed;
  ${theme.position === "top" ? "top: 0" : "bottom: 0"};
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--ccm-bg);
  border-top-left-radius: ${theme.position === "bottom" ? theme.borderRadius : "0"};
  border-top-right-radius: ${theme.position === "bottom" ? theme.borderRadius : "0"};
  border-bottom-left-radius: ${theme.position === "top" ? theme.borderRadius : "0"};
  border-bottom-right-radius: ${theme.position === "top" ? theme.borderRadius : "0"};
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
  font-family: var(--ccm-font-family);
  color: var(--ccm-text);
  padding: 28px 32px;
  animation: ccm-slide-up 0.35s ease-out;
}

@keyframes ccm-slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes ccm-slide-down {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.ccm-banner[data-position="top"] {
  animation: ccm-slide-down 0.35s ease-out;
}

.ccm-banner__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.ccm-banner__text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ccm-text-secondary);
  margin-bottom: 20px;
}

.ccm-banner__text a {
  color: var(--ccm-primary);
  text-decoration: underline;
  font-weight: 500;
}

.ccm-banner__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ccm-banner__manage {
  color: var(--ccm-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-family: var(--ccm-font-family);
  text-decoration: underline;
  transition: opacity var(--ccm-transition);
}

.ccm-banner__manage:hover {
  opacity: 0.7;
}

.ccm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--ccm-font-family);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--ccm-transition);
  line-height: 1;
  white-space: nowrap;
}

.ccm-btn:focus-visible {
  outline: 3px solid var(--ccm-primary);
  outline-offset: 2px;
}

.ccm-btn--primary {
  background: var(--ccm-primary);
  color: #ffffff;
  border-color: var(--ccm-primary);
}

.ccm-btn--primary:hover {
  opacity: 0.9;
}

.ccm-btn--secondary {
  background: transparent;
  color: var(--ccm-primary);
  border-color: var(--ccm-primary);
}

.ccm-btn--secondary:hover {
  background: var(--ccm-primary-light);
}

.ccm-btn--save {
  background: transparent;
  color: var(--ccm-text);
  border-color: var(--ccm-divider);
}

.ccm-btn--save:hover {
  border-color: var(--ccm-gray);
}

.ccm-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: var(--ccm-overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ccm-font-family);
  color: var(--ccm-text);
}

.ccm-modal__dialog {
  position: relative;
  z-index: 1;
  background: var(--ccm-bg);
  border-radius: var(--ccm-border-radius);
  width: 90%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  animation: ccm-modal-in 0.25s ease-out;
  overflow: hidden;
}

@keyframes ccm-modal-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.ccm-modal__header {
  position: relative;
  width: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.ccm-modal__header-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ccm-modal__header-bg {
  position: absolute;
  inset: 0;
  background-color: var(--ccm-primary);
}

.ccm-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--ccm-transition);
  line-height: 1;
}

.ccm-modal__close:hover {
  background: rgba(255, 255, 255, 0.5);
}

.ccm-modal__close:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}

.ccm-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.ccm-modal__body-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ccm-text);
  margin-bottom: 20px;
}

.ccm-modal__category {
  margin-bottom: 24px;
}

.ccm-modal__category:last-child {
  margin-bottom: 0;
}

.ccm-modal__category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.ccm-modal__category-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ccm-text);
}

.ccm-modal__category-desc {
  font-size: 13px;
  color: var(--ccm-text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.ccm-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.ccm-toggle__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ccm-toggle__slider {
  width: 48px;
  height: 26px;
  background: var(--ccm-divider);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background var(--ccm-transition);
}

.ccm-toggle__slider::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  top: 3px;
  left: 3px;
  transition: transform var(--ccm-transition);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.ccm-toggle__input:checked + .ccm-toggle__slider {
  background: var(--ccm-primary);
}

.ccm-toggle__input:checked + .ccm-toggle__slider::after {
  transform: translateX(22px);
}

.ccm-toggle__input:focus-visible + .ccm-toggle__slider {
  outline: 3px solid var(--ccm-primary);
  outline-offset: 2px;
}

.ccm-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 4px;
}

.ccm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 600px;
}

.ccm-table th {
  background: var(--ccm-table-header-bg);
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  color: var(--ccm-text-secondary);
  white-space: nowrap;
  border: 1px solid var(--ccm-divider);
}

.ccm-table td {
  padding: 8px 10px;
  border: 1px solid var(--ccm-divider);
  color: var(--ccm-text-secondary);
  background: var(--ccm-table-row-bg);
  vertical-align: top;
}

.ccm-modal__policy {
  display: block;
  padding: 16px 28px;
  font-size: 13px;
  color: var(--ccm-text-secondary);
  border-top: 1px solid var(--ccm-divider);
  flex-shrink: 0;
}

.ccm-modal__policy a {
  color: var(--ccm-primary);
  text-decoration: underline;
  font-weight: 500;
}

.ccm-modal__footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 28px 24px;
  border-top: 1px solid var(--ccm-divider);
  flex-shrink: 0;
}

.ccm-modal__footer .ccm-btn {
  width: 100%;
  padding: 14px 28px;
}

.ccm-body-lock {
  overflow: hidden !important;
}

@media (max-width: 1200px) {
  .ccm-modal__dialog {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .ccm-banner {
    padding: 20px;
  }

  .ccm-banner__text {
    font-size: 13px;
  }

  .ccm-modal__dialog {
    width: 95%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .ccm-modal__header {
    min-height: 70px;
  }

  .ccm-modal__body {
    padding: 16px 20px;
  }

  .ccm-modal__policy {
    padding: 12px 20px;
  }

  .ccm-modal__footer {
    padding: 12px 20px 20px;
  }
}

@media (max-width: 600px) {
  .ccm-banner {
    padding: 16px;
  }

  .ccm-banner__text {
    font-size: 12px;
    margin-bottom: 14px;
  }

  .ccm-btn {
    font-size: 13px;
    padding: 10px 20px;
  }

  .ccm-banner__actions {
    gap: 8px;
  }

  .ccm-modal__dialog {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .ccm-modal__category-title {
    font-size: 14px;
  }

  .ccm-modal__category-desc {
    font-size: 12px;
  }

  .ccm-table {
    font-size: 11px;
    min-width: 480px;
  }

  .ccm-table th,
  .ccm-table td {
    padding: 6px 8px;
  }
}
`;
}
