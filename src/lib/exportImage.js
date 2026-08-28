import { downloadBlob } from "./fileIO.js";

function serializeSvg(svgEl, { background } = {}) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("width")) clone.setAttribute("width", svgEl.viewBox.baseVal.width || svgEl.clientWidth);
  if (!clone.getAttribute("height")) clone.setAttribute("height", svgEl.viewBox.baseVal.height || svgEl.clientHeight);

  if (background) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", background);
    clone.insertBefore(rect, clone.firstChild);
  }

  const xml = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" standalone="no"?>\r\n${xml}`;
}

export function svgToBlob(svgEl, options) {
  const xml = serializeSvg(svgEl, options);
  return new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
}

export function downloadSvg(svgEl, filename, options) {
  downloadBlob(filename, svgToBlob(svgEl, options));
}

export async function svgToPngBlob(svgEl, { scale = 3, background = "#ffffff" } = {}) {
  const width = svgEl.viewBox?.baseVal?.width || svgEl.clientWidth;
  const height = svgEl.viewBox?.baseVal?.height || svgEl.clientHeight;
  const blob = svgToBlob(svgEl, { background: null });
  const url = URL.createObjectURL(blob);

  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadPng(svgEl, filename, options) {
  const blob = await svgToPngBlob(svgEl, options);
  downloadBlob(filename, blob);
}
