// Navegación móvil
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Catálogo multimedia
const mediaType = document.getElementById("media-type");
const audioSearch = document.getElementById("audio-search");
const sortBtn = document.getElementById("sort-btn");
const audioResults = document.getElementById("audio-results");
const audioCount = document.getElementById("audio-count");
const mediaTitle = document.getElementById("media-title");
const mediaSubtitle = document.getElementById("media-subtitle");
const mediaPreview = document.getElementById("media-preview");

let mediaState = {
  category: "audios",
  all: [],
  filtered: [],
  sortedAsc: true,
};

function normalizeFilename(filename) {
  return filename.trim();
}

function getFileTypeFromName(name) {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "mp3") return "audio";
  if (ext === "mp4") return "video";
  if (ext === "pptx") return "pptx";
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "doc";
  return "unknown";
}

function insertionSortByFirstAscii(items) {
  const sorted = [...items];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    let j = i - 1;
    while (
      j >= 0 &&
      (sorted[j].name.charCodeAt(0) || 0) > (current.name.charCodeAt(0) || 0)
    ) {
      sorted[j + 1] = sorted[j];
      j -= 1;
    }
    sorted[j + 1] = current;
  }
  return sorted;
}

function getCurrentCategory() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("category")) {
    return urlParams.get("category");
  }
  if (document.body?.dataset?.page) {
    return document.body.dataset.page;
  }
  if (mediaType?.value) {
    return mediaType.value;
  }
  return "audios";
}

function getCurrentConfig() {
  const category = getCurrentCategory();
  const map = {
    audios: {
      label: "Audios LBDS",
      subtitle: "Busca y ordena tus archivos mp3.",
      manifest: "/LBD-WEB-PAGE/Audios/Pistas/audios.json",
      folder: "/LBD-WEB-PAGE/Audios/Pistas/",
      extensions: [".mp3"],
      type: "audio",
      hideSelector: false,
    },
    presentaciones: {
      label: "Presentaciones",
      subtitle: "Busca y ordena tus presentaciones en MP4 o PPTX.",
      manifest: "/LBD-WEB-PAGE/Media/Presentaciones/presentaciones.json",
      folder: "/LBD-WEB-PAGE/Media/Presentaciones/",
      extensions: [".mp4", ".pptx"],
      type: "video",
      hideSelector: true,
    },
    corario: {
      label: "Corario",
      subtitle: "Busca y ordena tus partituras en PDF o DOC(S).",
      manifest: "/LBD-WEB-PAGE/Partituras/Corario/corario.json",
      folder: "/LBD-WEB-PAGE/Partituras/Corario/",
      extensions: [".pdf", ".doc", ".docx"],
      type: "doc",
      hideSelector: true,
    },
  };
  return map[category] || map.audios;
}

function getFileName(entry) {
  if (!entry) return "";
  const parts = String(entry).split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : String(entry);
}

function normalizeSourcePath(entry, folder) {
  if (!entry) return "";
  try {
    const baseUrl = new URL(folder, window.location.href);
    // Codifica solo el nombre del archivo, no la URL completa
    const encodedEntry = entry.split("/").map(encodeURIComponent).join("/");
    return new URL(encodedEntry, baseUrl).href;
  } catch (e) {
    return folder + entry.split("/").map(encodeURIComponent).join("/");
  }
}

function goToFile(item) {
  if (!item) return;
  window.open(item.src, "_blank", "noopener,noreferrer");
}

function renderItems(items) {
  if (!audioResults) return;

  audioResults.innerHTML = "";

  if (!items.length) {
    audioResults.innerHTML =
      "<p>No se encontraron elementos. Verifica el JSON de configuración y los archivos de la carpeta.</p>";
    audioCount.textContent = "0 elementos encontrados";
    return;
  }

  const total = items.length;
  audioCount.textContent = `${total} elemento${total === 1 ? "" : "s"} encontrados`;

  items.forEach((item) => {
    const template = document.createElement("article");
    template.className = "audio-item";

    const title = document.createElement("h3");
    title.textContent = item.name;
    template.append(title);

    const resolvedUrl = new URL(item.src, window.location.href).href;
    const safeUrl = encodeURI(resolvedUrl);

    if (item.type === "audio") {
      const audioEl = document.createElement("audio");
      audioEl.controls = true;
      audioEl.src = item.src;
      audioEl.style.width = "100%";
      template.append(audioEl);

      // No botón Abrir aquí para audio, el control integrado permite reproducir aquí
    } else {
      const openButton = document.createElement("button");
      openButton.type = "button";
      openButton.textContent = "Abrir aquí";
      openButton.className = "btn-out";
      openButton.addEventListener("click", () => goToFile(item));

      template.append(openButton);

      if (item.type === "video") {
        const videoEl = document.createElement("video");
        videoEl.controls = true;
        videoEl.src = item.src;
        videoEl.width = 480;
        template.append(videoEl);
      } else if (
        item.type === "pdf" ||
        item.type === "pptx" ||
        item.type === "doc"
      ) {
        // Se mantiene solo el botón Abrir aquí, sin link adicional.
      } else {
        const message = document.createElement("p");
        message.textContent =
          "Tipo de archivo no compatible para vista previa.";
        template.append(message);
      }
    }

    audioResults.appendChild(template);
  });
}
function renderPreview(item) {
  if (!mediaPreview) return;
  mediaPreview.classList.remove("hidden");
  mediaPreview.innerHTML = "";

  // Actualiza la ubicación para permitir enlazar / leer desde la URL.
  window.location.hash = encodeURIComponent(item.src);

  const title = document.createElement("h3");
  title.textContent = `Vista previa: ${item.name}`;
  mediaPreview.appendChild(title);

  const locationInfo = document.createElement("p");
  locationInfo.innerHTML = `Archivo: <a href="${item.src}" target="_blank" rel="noopener noreferrer">${item.src}</a>`;
  mediaPreview.appendChild(locationInfo);

  const openNewTab = document.createElement("p");
  openNewTab.innerHTML = `<a href="${item.src}" target="_blank" rel="noopener noreferrer">Abrir en nueva pestaña</a>`;
  mediaPreview.appendChild(openNewTab);

  if (item.type === "audio") {
    const player = document.createElement("audio");
    player.controls = true;
    player.src = item.src;
    player.autoplay = true;
    mediaPreview.appendChild(player);
  } else if (item.type === "video") {
    const player = document.createElement("video");
    player.controls = true;
    player.src = item.src;
    player.width = 720;
    player.autoplay = true;
    mediaPreview.appendChild(player);
  } else if (item.type === "pptx" || item.type === "doc") {
    const fileUrl = encodeURIComponent(
      new URL(item.src, window.location.href).href,
    );
    const iframe = document.createElement("iframe");
    iframe.src = `https://docs.google.com/gview?url=${fileUrl}&embedded=true`;
    iframe.width = "100%";
    iframe.height = "640";
    iframe.style.border = "1px solid #ccc";
    mediaPreview.appendChild(iframe);
  } else if (item.type === "pdf") {
    const pdfFrame = document.createElement("iframe");
    pdfFrame.src = item.src;
    pdfFrame.width = "100%";
    pdfFrame.height = "640";
    pdfFrame.style.border = "1px solid #ccc";
    mediaPreview.appendChild(pdfFrame);
  } else {
    const message = document.createElement("p");
    message.textContent = "Tipo de archivo no compatible para vista previa.";
    mediaPreview.appendChild(message);
  }

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "Cerrar vista previa";
  closeBtn.className = "btn-out";
  closeBtn.addEventListener("click", () => {
    mediaPreview.classList.add("hidden");
    mediaPreview.innerHTML = "";
  });
  mediaPreview.appendChild(closeBtn);
}

function applySearch() {
  const query = (audioSearch?.value || "").trim().toLowerCase();
  mediaState.filtered = mediaState.all.filter((item) => {
    const searchSource =
      `${item.name} ${item.rawSrc} ${item.folder || ""}`.toLowerCase();
    return searchSource.includes(query);
  });
  renderItems(mediaState.filtered);
}

function sortItems() {
  mediaState.sortedAsc = !mediaState.sortedAsc;
  sortBtn.textContent = mediaState.sortedAsc
    ? "Ordenar A → Z"
    : "Ordenar Z → A";

  const sorted = insertionSortByFirstAscii(
    mediaState.filtered.length ? mediaState.filtered : mediaState.all,
  );
  if (!mediaState.sortedAsc) sorted.reverse();

  mediaState.filtered = sorted;
  renderItems(sorted);
}

async function loadManifest() {
  mediaState.category = getCurrentCategory();
  const config = getCurrentConfig();

  if (mediaTitle) mediaTitle.textContent = config.label;
  if (mediaSubtitle) mediaSubtitle.textContent = config.subtitle;

  if (mediaType) {
    mediaType.value = mediaState.category;
    if (config.hideSelector) {
      mediaType.closest(".audios-controls")?.classList.add("hidden");
    } else {
      mediaType.closest(".audios-controls")?.classList.remove("hidden");
    }
  }

  try {
    const manifestUrl = new URL(config.manifest, window.location.href).href;
    const folderUrl = new URL(config.folder, window.location.href).href;

    console.log(
      "loadManifest: category=",
      getCurrentCategory(),
      "manifest=",
      manifestUrl,
      "folder=",
      folderUrl,
    );

    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error("No hay manifest");
    const names = await response.json();
    if (!Array.isArray(names)) throw new Error("Formato inválido");
    console.log("manifest loaded. items=", names.length);

    mediaState.all = names
      .filter((entry) => {
        if (typeof entry !== "string") return false;
        const cleanEntry = entry.trim();
        return config.extensions.some((ext) =>
          cleanEntry.toLowerCase().endsWith(ext),
        );
      })
      .map((entry) => {
        const cleanEntry = String(entry).trim();
        const name = normalizeFilename(getFileName(cleanEntry));
        const src = normalizeSourcePath(cleanEntry, folderUrl);
        const folderPath = cleanEntry.includes("/")
          ? cleanEntry.substring(0, cleanEntry.lastIndexOf("/"))
          : "";

        return {
          name,
          src,
          rawSrc: cleanEntry,
          folder: folderPath,
          type: getFileTypeFromName(name),
        };
      });

    mediaState.filtered = mediaState.all;
    renderItems(mediaState.filtered);
  } catch (err) {
    mediaState.all = [];
    mediaState.filtered = [];
    audioResults.innerHTML = `<p class='error-msg'>Error leyendo manifest: ${err.message}. Revisa consola y rutas.</p>`;
    console.error("loadManifest error:", err);
  }
}

if (mediaType) {
  mediaType.addEventListener("change", () => {
    mediaState.category = mediaType.value;
    mediaState.sortedAsc = true;
    if (sortBtn) sortBtn.textContent = "Ordenar A → Z";
    loadManifest();
  });
}

if (audioSearch) {
  audioSearch.addEventListener("input", applySearch);
}

if (sortBtn) {
  sortBtn.addEventListener("click", sortItems);
}

loadManifest();
