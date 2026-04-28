import type { TranslationSet, CategoryConfig, ThemeConfig } from "../types";
import { resolveLocalizedString } from "../i18n";
import { el, text } from "../utils/dom";
import { getHeaderImageUri } from "./styles";

export interface ModalCallbacks {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSavePreferences: (prefs: Record<string, boolean>) => void;
  onClose: () => void;
}

export function createModal(
  translation: TranslationSet,
  lang: string,
  categories: CategoryConfig[],
  currentPreferences: Record<string, boolean>,
  theme: ThemeConfig & { headerImage: string },
  policyUrl: string | undefined,
  triggerElement: HTMLElement | null,
  callbacks: ModalCallbacks
): { root: HTMLElement; destroy: () => void } {
  const toggleRefs = new Map<string, HTMLInputElement>();
  const focusTrapHandler = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      callbacks.onClose();
    }
  };

  const root = el("div", { className: "ccm-root ccm-modal", "aria-hidden": "false" });

  const dialog = el("div", {
    className: "ccm-modal__dialog",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "ccm-modal-title",
  });

  const header = el("div", { className: "ccm-modal__header" });

  const headerImage = getHeaderImageUri(theme.headerImage);
  if (headerImage) {
    const img = el("img", {
      className: "ccm-modal__header-image",
      src: headerImage,
      alt: "",
    });
    header.appendChild(img);
  } else {
    const headerBg = el("div", { className: "ccm-modal__header-bg" });
    header.appendChild(headerBg);
  }

  const closeBtn = el("button", {
    className: "ccm-modal__close",
    type: "button",
    "aria-label": translation.modal.close,
  });
  closeBtn.innerHTML = "&#x2715;";
  closeBtn.addEventListener("click", callbacks.onClose);
  header.appendChild(closeBtn);

  const body = el("div", { className: "ccm-modal__body" });

  const bodyTitle = el("div", { className: "ccm-modal__body-title", id: "ccm-modal-title" });
  bodyTitle.appendChild(text(translation.modal.title));
  body.appendChild(bodyTitle);

  for (const category of categories) {
    const section = el("div", { className: "ccm-modal__category" });

    const headerRow = el("div", { className: "ccm-modal__category-header" });

    const catTitle = el("div", { className: "ccm-modal__category-title" });
    catTitle.appendChild(text(resolveLocalizedString(category.title, lang)));
    headerRow.appendChild(catTitle);

    if (!category.required) {
      const toggle = el("label", { className: "ccm-toggle" });

      const input = el("input", {
        className: "ccm-toggle__input",
        type: "checkbox",
        "aria-label": resolveLocalizedString(category.title, lang),
      }) as HTMLInputElement;

      if (currentPreferences[category.id]) {
        input.checked = true;
      }

      toggleRefs.set(category.id, input);

      const slider = el("span", { className: "ccm-toggle__slider" });

      toggle.appendChild(input);
      toggle.appendChild(slider);
      headerRow.appendChild(toggle);
    }

    section.appendChild(headerRow);

    const catDesc = el("div", { className: "ccm-modal__category-desc" });
    catDesc.appendChild(text(resolveLocalizedString(category.description, lang)));
    section.appendChild(catDesc);

    if (category.cookies.length > 0) {
      const tableWrapper = el("div", { className: "ccm-table-wrapper" });
      const table = el("table", { className: "ccm-table" });

      const thead = el("thead");
      const headerRow2 = el("tr");
      const columns = [
        translation.table.cookieName,
        translation.table.provider,
        translation.table.description,
        translation.table.purpose,
        translation.table.expiry,
        translation.table.party,
      ];
      for (const col of columns) {
        const th = el("th");
        th.appendChild(text(col));
        headerRow2.appendChild(th);
      }
      thead.appendChild(headerRow2);
      table.appendChild(thead);

      const tbody = el("tbody");
      for (const cookie of category.cookies) {
        const row = el("tr");
        const nameCell = el("td");
        nameCell.appendChild(text(cookie.name));
        row.appendChild(nameCell);

        const providerCell = el("td");
        providerCell.appendChild(text(resolveLocalizedString(cookie.provider, lang)));
        row.appendChild(providerCell);

        const descCell = el("td");
        if (cookie.description) {
          descCell.appendChild(text(resolveLocalizedString(cookie.description, lang)));
        }
        row.appendChild(descCell);

        const purposeCell = el("td");
        purposeCell.appendChild(text(resolveLocalizedString(cookie.purpose, lang)));
        row.appendChild(purposeCell);

        const expiryCell = el("td");
        expiryCell.appendChild(text(resolveLocalizedString(cookie.expiry, lang)));
        row.appendChild(expiryCell);

        const partyCell = el("td");
        const partyText =
          cookie.party === "first" ? translation.table.firstParty : translation.table.thirdParty;
        partyCell.appendChild(text(partyText));
        row.appendChild(partyCell);

        tbody.appendChild(row);
      }
      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      section.appendChild(tableWrapper);
    }

    body.appendChild(section);
  }

  dialog.appendChild(header);
  dialog.appendChild(body);

  if (policyUrl) {
    const policySection = el("div", { className: "ccm-modal__policy" });
    const policyLink = el("a", {
      href: policyUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    policyLink.appendChild(text(translation.modal.policyClick));
    policySection.appendChild(text(translation.modal.policyLink + " "));
    policySection.appendChild(policyLink);
    dialog.appendChild(policySection);
  }

  const footer = el("div", { className: "ccm-modal__footer" });

  const rejectBtn = el("button", { className: "ccm-btn ccm-btn--secondary", type: "button" });
  rejectBtn.appendChild(text(translation.modal.rejectAll));
  rejectBtn.addEventListener("click", callbacks.onRejectAll);

  const acceptBtn = el("button", { className: "ccm-btn ccm-btn--primary", type: "button" });
  acceptBtn.appendChild(text(translation.modal.acceptAll));
  acceptBtn.addEventListener("click", callbacks.onAcceptAll);

  const saveBtn = el("button", { className: "ccm-btn ccm-btn--save", type: "button" });
  saveBtn.appendChild(text(translation.modal.savePreferences));
  saveBtn.addEventListener("click", () => {
    const prefs: Record<string, boolean> = {};
    for (const category of categories) {
      if (category.required) {
        prefs[category.id] = true;
      } else {
        const input = toggleRefs.get(category.id);
        prefs[category.id] = input ? input.checked : false;
      }
    }
    callbacks.onSavePreferences(prefs);
  });

  footer.appendChild(rejectBtn);
  footer.appendChild(acceptBtn);
  footer.appendChild(saveBtn);
  dialog.appendChild(footer);

  root.appendChild(dialog);

  dialog.addEventListener("keydown", focusTrapHandler);
  document.addEventListener("keydown", escapeHandler);

  requestAnimationFrame(() => {
    const firstFocusable = dialog.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) firstFocusable.focus();
    else closeBtn.focus();
  });

  function destroy(): void {
    dialog.removeEventListener("keydown", focusTrapHandler);
    document.removeEventListener("keydown", escapeHandler);
    if (triggerElement && document.contains(triggerElement)) {
      triggerElement.focus();
    }
  }

  return { root, destroy };
}
