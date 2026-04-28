export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (HTMLElement | Text)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        element.className = value;
      } else if (key.startsWith("data-") || key.startsWith("aria-") || key === "role" || key === "id" || key === "type" || key === "href" || key === "target" || key === "rel") {
        element.setAttribute(key, value);
      } else {
        (element as any)[key] = value;
      }
    }
  }
  if (children) {
    for (const child of children) {
      element.appendChild(child);
    }
  }
  return element;
}

export function text(content: string): Text {
  return document.createTextNode(content);
}

export function injectStyle(css: string, id: string, mode?: "inline" | "nonce", nonce?: string): HTMLStyleElement {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.id = id;
  if (mode === "nonce" && nonce) {
    style.setAttribute("nonce", nonce);
  }
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

export function removeInjectedStyle(id: string): void {
  const el = document.getElementById(id);
  if (el) el.remove();
}
