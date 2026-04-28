import type { TranslationSet } from "../types";
import { el, text } from "../utils/dom";

export interface BannerCallbacks {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onManage: (triggerElement: HTMLElement) => void;
}

function renderDescription(
  desc: string,
  policyUrl: string | undefined,
  policyLabel: string
): HTMLParagraphElement {
  const p = el("p", { className: "ccm-banner__text" });

  if (policyUrl && desc.includes("{policyLink}")) {
    const parts = desc.split("{policyLink}");
    p.appendChild(text(parts[0]));
    const link = el("a", {
      href: policyUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    link.appendChild(text(policyLabel));
    p.appendChild(link);
    if (parts[1]) p.appendChild(text(parts[1]));
  } else if (policyUrl) {
    p.appendChild(text(desc.replace("{policyLink}", "") + " "));
    const link = el("a", {
      href: policyUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    link.appendChild(text(policyLabel));
    p.appendChild(link);
  } else {
    p.appendChild(text(desc.replace("{policyLink}", "")));
  }

  return p;
}

export function createBanner(
  translation: TranslationSet,
  policyUrl: string | undefined,
  position: "bottom" | "top",
  callbacks: BannerCallbacks
): { root: HTMLElement } {
  const banner = el("div", {
    className: "ccm-banner",
    "data-position": position,
    role: "region",
    "aria-label": translation.banner.ariaLabel,
  });

  const inner = el("div", { className: "ccm-banner__inner" });

  const descriptionEl = renderDescription(
    translation.banner.description,
    policyUrl,
    translation.modal.policyDocument
  );

  const actions = el("div", { className: "ccm-banner__actions" });

  const acceptBtn = el("button", { className: "ccm-btn ccm-btn--primary", type: "button" });
  acceptBtn.appendChild(text(translation.banner.acceptAll));
  acceptBtn.addEventListener("click", callbacks.onAcceptAll);

  const rejectBtn = el("button", { className: "ccm-btn ccm-btn--secondary", type: "button" });
  rejectBtn.appendChild(text(translation.banner.rejectAll));
  rejectBtn.addEventListener("click", callbacks.onRejectAll);

  const manageBtn = el("button", { className: "ccm-banner__manage", type: "button" });
  manageBtn.appendChild(text(translation.banner.manage));
  manageBtn.addEventListener("click", () => callbacks.onManage(manageBtn));

  actions.appendChild(acceptBtn);
  actions.appendChild(rejectBtn);
  actions.appendChild(manageBtn);

  inner.appendChild(descriptionEl);
  inner.appendChild(actions);
  banner.appendChild(inner);

  const root = el("div", { className: "ccm-root" });
  root.appendChild(banner);

  return { root };
}
