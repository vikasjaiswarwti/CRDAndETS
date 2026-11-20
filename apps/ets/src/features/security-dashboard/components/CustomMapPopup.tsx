// shared/lib/map/customMapPopup.ts

export type PopupInstance = google.maps.OverlayView & {
  updatePosition: (p: google.maps.LatLng) => void;
  updateContent: (content: string) => void;
};

export type PopupConstructor = new (
  position: google.maps.LatLng,
  content: string,
  onClose: () => void,
) => PopupInstance;

let _PopupClass: PopupConstructor | null = null;

export function getCustomPopupClass(): PopupConstructor {
  if (_PopupClass) return _PopupClass;

  _PopupClass = class extends google.maps.OverlayView {
    private position: google.maps.LatLng;
    private container: HTMLDivElement;
    private body: HTMLDivElement;

    constructor(
      position: google.maps.LatLng,
      content: string,
      onClose: () => void,
    ) {
      super();
      this.position = position;

      this.container = document.createElement("div");
      this.container.style.cssText = `
        position:absolute;
        transform:translate(-50%,calc(-100% - 14px));
        background:#fff;
        border-radius:10px;
        box-shadow:0 8px 24px rgba(0,0,0,0.13),0 2px 6px rgba(0,0,0,0.08);
        border:1px solid #e5e7eb;
        font-family:system-ui,sans-serif;
        min-width:180px;
        max-width:240px;
        pointer-events:auto;
        z-index:9999;
        animation:popIn 0.15s ease;
      `;

      const arrow = document.createElement("div");
      arrow.style.cssText = `
        position:absolute;
        bottom:-7px;
        left:50%;
        width:12px;
        height:12px;
        background:#fff;
        border-right:1px solid #e5e7eb;
        border-bottom:1px solid #e5e7eb;
        transform:translateX(-50%) rotate(45deg);
      `;

      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      closeBtn.style.cssText = `
        position:absolute;
        top:5px;
        right:6px;
        width:16px;
        height:16px;
        border-radius:50%;
        background:#fee2e2;
        color:#ef4444;
        border:none;
        cursor:pointer;
        font-size:13px;
        line-height:1;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0;
        font-weight:700;
      `;
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onClose();
      });

      this.body = document.createElement("div");
      this.body.style.cssText = "padding:10px 24px 10px 12px;";
      this.body.innerHTML = content;

      this.container.appendChild(arrow);
      this.container.appendChild(closeBtn);
      this.container.appendChild(this.body);

      if (!document.getElementById("custom-map-popup-style")) {
        const style = document.createElement("style");
        style.id = "custom-map-popup-style";
        style.textContent = `
          @keyframes popIn {
            from { opacity:0; transform:translate(-50%,calc(-100% - 20px)); }
            to   { opacity:1; transform:translate(-50%,calc(-100% - 14px)); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    onAdd() {
      this.getPanes()!.floatPane.appendChild(this.container);
    }

    draw() {
      const point = this.getProjection().fromLatLngToDivPixel(this.position);
      if (point) {
        this.container.style.left = `${point.x}px`;
        this.container.style.top = `${point.y}px`;
      }
    }

    onRemove() {
      this.container.remove();
    }

    updatePosition(pos: google.maps.LatLng) {
      this.position = pos;
      this.draw();
    }

    updateContent(content: string) {
      this.body.innerHTML = content;
    }
  } as unknown as PopupConstructor;

  return _PopupClass;
}
