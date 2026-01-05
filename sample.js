const form = document.getElementById("search-form");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const resultsMetaEl = document.getElementById("results-meta");
const filterInput = document.getElementById("results-filter");
const resultsSticky = document.getElementById("results-sticky");
const resultsPanel = document.querySelector(".panel.results");
const querySummaryEl = document.getElementById("query-summary");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const recentFiltersEl = document.getElementById("recent-filters");
const recentFiltersChips = document.getElementById("recent-filters-chips");
const deltaToggle = document.getElementById("toggle-delta");
const infiniteToggle = document.getElementById("toggle-infinite");
const infiniteStatusEl = document.getElementById("infinite-status");
const infiniteSentinel = document.getElementById("infinite-sentinel");
const resetBtn = document.getElementById("reset-btn");
const copyUrlBtn = document.getElementById("copy-url-btn");
const copyLinkBtn = document.getElementById("copy-link-btn");
const downloadBtn = document.getElementById("download-btn");
const downloadCsvBtn = document.getElementById("download-csv-btn");
const downloadTsvBtn = document.getElementById("download-tsv-btn");
const downloadXlsBtn = document.getElementById("download-xls-btn");
const cancelBtn = document.getElementById("cancel-btn");
const paginationEl = document.getElementById("pagination");
const pagePrevBtn = document.getElementById("page-prev");
const pageNextBtn = document.getElementById("page-next");
const pageInfoEl = document.getElementById("page-info");
const pageInput = document.getElementById("page-input");
const pageGoBtn = document.getElementById("page-go");

// Bottom Pagination
const pagePrevBtnBottom = document.getElementById("page-prev-bottom");
const pageNextBtnBottom = document.getElementById("page-next-bottom");
const pageInfoBottom = document.getElementById("page-info-bottom");
const pageInputBottom = document.getElementById("page-input-bottom");
const pageGoBtnBottom = document.getElementById("page-go-bottom");
const paginationBottomEl = document.getElementById("pagination-bottom");
const htmlToggle = document.getElementById("toggle-html");
const analyticsToggle = document.getElementById("toggle-analytics");
const presetNameInput = document.getElementById("preset-name");
const presetSaveBtn = document.getElementById("preset-save");
const presetSelect = document.getElementById("preset-select");
const presetLoadBtn = document.getElementById("preset-load");
const presetDeleteBtn = document.getElementById("preset-delete");
const cpvFavoritesEl = document.getElementById("cpv-favorites");
const cpvFavoritesList = document.getElementById("cpv-favorites-list");
const cpvFavoritesAddBtn = document.getElementById("cpv-favorites-add");
const exportTemplateName = document.getElementById("export-template-name");
const exportTemplateSaveBtn = document.getElementById("export-template-save");
const exportTemplateSelect = document.getElementById("export-template-select");
const exportTemplateLoadBtn = document.getElementById("export-template-load");
const exportTemplateDeleteBtn = document.getElementById("export-template-delete");
const exportColumnsEl = document.getElementById("export-columns");
const exportSelectAllBtn = document.getElementById("export-select-all");
const exportClearAllBtn = document.getElementById("export-clear-all");
const exportFilteredToggle = document.getElementById("export-filtered");
const rangeButtons = document.querySelectorAll(".chip[data-range]");
const langRadios = document.querySelectorAll("input[name='lang']");
const modalEl = document.getElementById("html-modal");
const modalFrame = document.getElementById("modal-frame");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const autoRunToggle = document.getElementById("toggle-autorun");
const statsToggleBtn = document.getElementById("stats-toggle-btn");

const DEFAULT_BASE_URL = "https://ezamowienia.gov.pl/mo-board";
const DEFAULT_LANG = "pl";
const DEFAULT_DATE_RANGE_DAYS = 7;
const DEFAULT_NOTICE_TYPE = "ContractNotice";
const PRESET_STORAGE_KEY = "bzp.presets.v1";
const SESSION_STORAGE_KEY = "bzp.session.v1";
const LANG_STORAGE_KEY = "bzp.lang.v1";
const RECENT_FILTERS_KEY = "bzp.recentFilters.v1";
const RECENT_FILTERS_LIMIT = 5;
const STATS_COLLAPSE_KEY = "bzp.statsCollapse.v1";
const EXPORT_TEMPLATES_KEY = "bzp.exportTemplates.v1";
const EXPORT_COLUMNS_KEY = "bzp.exportColumns.v1";
const CPV_FAVORITES_KEY = "bzp.cpvFavorites.v1";
const INITIAL_LOAD_KEY = "bzp.initialLoad.v1";
const RESOURCE_CACHE_NAME = "bzp.resources.v1";
const DICTIONARY_DB_NAME = "bzp.dictionaryCache.v1";
const DICTIONARY_DB_VERSION = 1;
const DICTIONARY_STORE_NAME = "dictionaries";
const DICTIONARY_CACHE_VERSION = 1;
const AUTO_LOAD_MAX_PAGES = 10;
const NOTICE_DETAILS_BASE_URL =
  "https://ezamowienia.gov.pl/mo-client-board/bzp/notice-details/id/";
const PROCESSING_DETAILS_BASE_URL =
  "https://ezamowienia.gov.pl/mp-client/search/list/";
const translations = window.APP_LOCALES || {};
const noticeTypeLabels = window.NOTICE_TYPE_LABELS || {};
const ENDPOINT_PATHS = {
  notice: "notice",
  stats: "notice/stats",
};

const field = (id) => document.getElementById(id);
const endpointRadios = document.querySelectorAll("input[name='endpoint']");
const noticeNumberModeSelect = document.getElementById("notice-number-mode");
const orgNameModeSelect = document.getElementById("org-name-mode");

const inputs = {
  baseUrl: field("base-url"),
  noticeType: field("notice-type"),
  noticeNumber: field("notice-number"),
  publicationFrom: field("publication-from"),
  publicationTo: field("publication-to"),
  clientType: field("client-type"),
  orderType: field("order-type"),
  tenderType: field("tender-type"),
  orderObject: field("order-object"),
  cpvCode: field("cpv-code"),
  orgName: field("org-name"),
  orgCity: field("org-city"),
  orgProvince: field("org-province"),
  pageSize: field("page-size"),
  searchAfter: field("search-after"),
};

const SEARCH_AFTER_RESET_IDS = new Set([
  "notice-type",
  "notice-number",
  "publication-from",
  "publication-to",
  "client-type",
  "order-type",
  "tender-type",
  "order-object",
  "cpv-code",
  "org-name",
  "org-city",
  "org-province",
  "page-size",
]);

let currentLang = DEFAULT_LANG;
let noticeCardLabels = null;

const dictionaries = {
  noticeType: new Map(),
  clientType: new Map(),
  orderType: new Map(),
  tenderType: new Map(),
  province: new Map(),
  cpv: new Map(),
};

const LOCALE_MAP = {
  en: "en-US",
  pl: "pl-PL",
};
const numberFormatterCache = new Map();
const dateTimeFormatterCache = new Map();

const getLocale = () => LOCALE_MAP[currentLang] || currentLang || "en-US";
const formatOptionsKey = (options = {}) => {
  const keys = Object.keys(options);
  if (!keys.length) return "";
  return keys
    .sort()
    .map((key) => `${key}:${options[key]}`)
    .join("|");
};
const getNumberFormatter = (options = {}) => {
  const locale = getLocale();
  const key = `${locale}|${formatOptionsKey(options)}`;
  if (!numberFormatterCache.has(key)) {
    numberFormatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return numberFormatterCache.get(key);
};
const getDateTimeFormatter = (options = {}) => {
  const locale = getLocale();
  const key = `${locale}|${formatOptionsKey(options)}`;
  if (!dateTimeFormatterCache.has(key)) {
    dateTimeFormatterCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return dateTimeFormatterCache.get(key);
};
const formatNumber = (value, options) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "");
  return getNumberFormatter(options).format(number);
};
const formatPercent = (value, options = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return getNumberFormatter({ style: "percent", ...options }).format(number);
};

const NOTICE_EXPORT_COLUMNS = [
  { key: "noticeType", labelKey: "exportColNoticeType" },
  { key: "noticeNumber", labelKey: "exportColNoticeNumber" },
  { key: "bzpNumber", labelKey: "exportColBzpNumber" },
  { key: "publicationDate", labelKey: "exportColPublicationDate" },
  { key: "organizationName", labelKey: "exportColOrganizationName" },
  { key: "organizationCity", labelKey: "exportColOrganizationCity" },
  { key: "organizationProvince", labelKey: "exportColOrganizationProvince" },
  { key: "clientType", labelKey: "exportColClientType" },
  { key: "orderType", labelKey: "exportColOrderType" },
  { key: "tenderType", labelKey: "exportColTenderType" },
  { key: "contractValue", labelKey: "exportColContractValue" },
  { key: "proceedingWebsite", labelKey: "exportColProceedingWebsite" },
  { key: "orderObject", labelKey: "exportColOrderObject" },
  { key: "cpvCode", labelKey: "exportColCpvCode" },
  { key: "tenderId", labelKey: "exportColTenderId" },
  { key: "objectId", labelKey: "exportColObjectId" },
  { key: "contractors", labelKey: "exportColContractors" },
];

const STATS_EXPORT_COLUMNS = [
  { key: "noticeType", labelKey: "exportColNoticeType" },
  { key: "numberOfNotices", labelKey: "exportColNumberOfNotices" },
];

const tenderTypeTooltips = (() => {
  const map = new Map();
  const add = (id, text) => map.set(id, text);
  const addRange = (prefix, start, end, text) => {
    for (let i = start; i <= end; i += 1) {
      add(`${prefix}${i}`, text);
    }
  };

  add(
    "1.1",
    "art. 275 PZP - Tryb podstawowy udzielenia zamówienia publicznego. Procedura konkurencyjna, w której zamawiający publikuje ogłoszenie o zamówieniu w BZP, a następnie wybiera najkorzystniejszą ofertę. Można stosować trzy warianty: bez negocjacji, z możliwością negocjacji lub z obowiązkowymi negocjacjami. "
  );
  add(
    "1.1.1",
    "art. 275 pkt 1 PZP - Tryb podstawowy bez negocjacji. Zamawiający wybiera najkorzystniejszą ofertę bez prowadzenia negocjacji z wykonawcami. "
  );
  add(
    "1.1.2",
    "art. 275 pkt 2 PZP - Tryb podstawowy z negocjacjami fakultatywnymi. Zamawiający może negocjować treść ofert w celu ich ulepszenia, a następnie zaprasza do składania ofert dodatkowych. "
  );
  add(
    "1.1.3",
    "art. 275 pkt 3 PZP - Tryb podstawowy z obowiązkowymi negocjacjami. Zamawiający prowadzi negocjacje z wykonawcami i po ich zakończeniu zaprasza do składania ofert ostatecznych. "
  );
  add(
    "1.2",
    "art. 297 PZP (odniesienie do art. 189 PZP) - Partnerstwo innowacyjne. Tryb stosowany, gdy zamawiający potrzebuje innowacyjnego produktu, usługi lub robót budowlanych niedostępnych na rynku. Pozwala realizować badania i rozwój oraz późniejszy zakup. "
  );
  add(
    "1.3",
    "art. 301 ust. 1 PZP - Negocjacje bez ogłoszenia. Tryb, w którym zamawiający negocjuje warunki zamówienia z wybranymi wykonawcami bez uprzedniego ogłoszenia, stosowany tylko w przypadkach przewidzianych ustawą (np. pilne potrzeby, brak ofert). "
  );
  add(
    "1.3.1.1",
    "art. 209 ust. 1 pkt 2 w zw. z art. 301 - Przesłanki szczególne z art. 209 ust. 1 pkt 2 PZP związane z wyjątkowymi okolicznościami uzasadniającymi negocjacje. "
  );
  add(
    "1.3.1.2",
    "art. 209 ust. 1 pkt 3 w zw. z art. 301 - Inna przesłanka negocjacji bez ogłoszenia zgodna z art. 209 ust. 1 pkt 3 PZP. "
  );
  addRange(
    "1.3.",
    2,
    4,
    "art. 301 ust. 1 pkt 2-4 PZP - Kolejne konkrety zastosowania negocjacji bez ogłoszenia w ustawie, zależne od okoliczności i wcześniejszych etapów postępowania. "
  );
  add(
    "1.4",
    "art. 305 PZP wraz z art. 214 PZP - Zamówienie z wolnej ręki. Tryb niekonkurencyjny, stosowany wyłącznie w określonych okolicznościach wskazanych w art. 214 ust. 1 (np. tylko jeden wykonawca, pilna potrzeba natychmiastowego wykonania). "
  );
  addRange(
    "1.4.1.",
    1,
    13,
    "art. 214 ust. 1 pkt 1-14 PZP - Konkretne przesłanki do zastosowania zamówienia z wolnej ręki (m.in. wyłączność techniczna, ochrona praw wyłącznych, pilne potrzeby). "
  );
  addRange(
    "1.4.",
    2,
    5,
    "art. 305 pkt 2-5 PZP - Dodatkowe przesłanki udzielenia zamówienia z wolnej ręki zgodnie z art. 305 PZP (różne okoliczności prowadzące do wyjątkowego zastosowania trybu). "
  );
  add(
    "2.1",
    "art. 132 PZP - Przetarg nieograniczony. Tryb konkurencyjny, w którym każdy wykonawca może złożyć ofertę po ogłoszeniu zamówienia. "
  );
  add(
    "2.2",
    "art. 140 PZP - Przetarg ograniczony. Tryb dwuetapowy, w którym najpierw zgłaszają się wykonawcy, a następnie wybrani składają oferty. "
  );
  addRange(
    "2.3.",
    1,
    5,
    "art. 153 pkt 1-5 PZP - Negocjacje z ogłoszeniem. Tryb, w którym zamawiający prowadzi negocjacje z kandydatami po publikacji ogłoszenia o zamówieniu, stosowany w określonych sytuacjach wymienionych w art. 153 PZP. "
  );
  addRange(
    "2.4.",
    1,
    5,
    "art. 169 PZP w zw. z art. 153 pkt X - Dialog konkurencyjny. Procedura stosowana przy szczególnie złożonych zamówieniach, których warunków nie da się precyzyjnie określić w opisie przedmiotu. "
  );
  add(
    "2.5",
    "art. 189 PZP - Partnerstwo innowacyjne w innym kontekście. Tryb analogiczny do 1.2, stosowany do innowacyjnych zamówień z celem opracowania i nabycia nowych rozwiązań. "
  );
  addRange(
    "2.6.",
    1,
    4,
    "art. 208 ust. 1 + art. 209 ust. 1 pkt 1-4 PZP - Negocjacje bez ogłoszenia stosowane w kontekście innych przesłanek z art. 208 i art. 209 PZP (np. brak ofert, pilna potrzeba). "
  );
  addRange(
    "2.7.",
    1,
    14,
    "art. 214 ust. 1 pkt 1-14 PZP - Zamówienie z wolnej ręki w bardziej rozbudowanym katalogu przesłanek wynikających z art. 214 PZP (szczegółowe wskazania okoliczności wyjątkowych). "
  );
  addRange(
    "2.8.",
    1,
    5,
    "art. 378-383 PZP - Tryby udzielania zamówień sektorowych (np. przetarg nieograniczony, ograniczony, negocjacje z ogłoszeniem, dialog konkurencyjny, partnerstwo innowacyjne). "
  );
  addRange(
    "2.8.6.",
    1,
    4,
    "art. 386 w zw. z art. 209 ust. 1 pkt 1-4 PZP - Negocjacje bez ogłoszenia w zamówieniach sektorowych - stosuje się art. 386 PZP razem z przesłankami z art. 209 ust. 1. "
  );
  addRange(
    "2.8.7.",
    1,
    12,
    "art. 388 w zw. z art. 214 ust. 1 pkt X PZP - Zamówienia z wolnej ręki w sektorowych zamówieniach - analogicznie do art. 214 PZP, ale w kontekście sektora. "
  );
  addRange(
    "2.10.",
    1,
    3,
    "art. 411-413 PZP - Tryby stosowane w zamówieniach w dziedzinach obronności i bezpieczeństwa (ograniczony, negocjacje z ogłoszeniem, dialog konkurencyjny). "
  );
  add(
    "2.11",
    "art. 414 ust. 2 PZP - Negocjacje bez ogłoszenia w dziedzinach obronności i bezpieczeństwa na podstawie wskazanych przesłanek. "
  );
  add(
    "2.12",
    "art. 415 ust. 2 PZP w powiązaniu z art. 214 oraz art. 414 - Zamówienie z wolnej ręki w obronności - określone sytuacje z art. 415 ust. 2 łączone z przesłankami z art. 214 i 414 PZP. "
  );

  return map;
})();

const dropdownCache = new Map();
const dictionaryLoadPromises = new Map();
let dictionaryDbPromise = null;
let cpvWorker = null;
let cpvWorkerRequestId = 0;
let lastResults = [];
let lastEndpoint = "notice";
let lastQueryMeta = null;
let lastQueryState = null;
let previousSnapshot = new Map();
let deltaMap = new Map();
let isFetching = false;
let currentModalIndex = null;
let renderToken = 0;
let activeQueryToken = 0;
let activeController = null;
let previewObserver = null;
let sessionSaveTimer = null;
let filterDebounceTimer = null;
let lastSavedFilterTerm = "";
let lastRegexWarning = "";
let lastStatus = {
  key: "statusIdle",
  tone: "",
  params: {},
  custom: false,
  message: "",
};
const paginationState = {
  currentPage: 1,
  pageSize: 50,
  hasMore: false,
  nextCursor: "",
};
const BOOKMARK_KEY = "bzp.bookmarks.v1";
let bookmarks = new Set();
const bookmarksToggle = document.getElementById("toggle-bookmarks");
let cpvFavorites = [];
let cpvFavoritesSet = new Set();
let statsCollapsed = false;
let deltaMode = false;
let infiniteMode = false;
let autoLoadPages = 0;
let autoLoadInFlight = false;
let autoLoadCapped = false;
let timeSeriesMode = "daily";
let infiniteObserver = null;
let noticeAnalyticsEl = null;
let noticeListEl = null;

const formatTemplate = (template, params = {}) => {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) return match;
    const value = params[key];
    if (typeof value === "number") return formatNumber(value);
    return value;
  });
};

const setStatusMessage = (message, tone = "") => {
  statusEl.textContent = message;
  statusEl.className = tone;
  lastStatus = { message, tone, custom: true };
};

const setStatusKey = (key, tone = "", params = {}) => {
  const strings = translations[currentLang] || {};
  const template = strings[key] || key;
  const message = formatTemplate(template, params);
  statusEl.textContent = message;
  statusEl.className = tone;
  lastStatus = { key, tone, params, custom: false };
};

const applyStatus = () => {
  if (lastStatus.custom) {
    statusEl.textContent = lastStatus.message || "";
    statusEl.className = lastStatus.tone || "";
    return;
  }
  setStatusKey(
    lastStatus.key || "statusIdle",
    lastStatus.tone || "",
    lastStatus.params || {}
  );
};

const readPresets = () => {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

const writePresets = (presets) => {
  try {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch (err) {
    return false;
  }
};

const readExportTemplates = () => {
  try {
    const raw = localStorage.getItem(EXPORT_TEMPLATES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
};

const writeExportTemplates = (payload) => {
  try {
    localStorage.setItem(EXPORT_TEMPLATES_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    return false;
  }
};

const getExportTemplatesForLang = (lang) => {
  const all = readExportTemplates();
  const templates = all[lang];
  return Array.isArray(templates) ? templates : [];
};

const saveExportTemplate = (name, endpoint, columns) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) return false;
  const all = readExportTemplates();
  const templates = Array.isArray(all[currentLang]) ? all[currentLang] : [];
  const existingIndex = templates.findIndex(
    (template) => template.name === trimmed && template.endpoint === endpoint
  );
  const payload = {
    name: trimmed,
    endpoint,
    columns: Array.isArray(columns) ? columns : [],
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    templates.splice(existingIndex, 1, payload);
  } else {
    templates.push(payload);
  }
  all[currentLang] = templates;
  return writeExportTemplates(all);
};

const deleteExportTemplate = (name, endpoint) => {
  const all = readExportTemplates();
  const templates = Array.isArray(all[currentLang]) ? all[currentLang] : [];
  const next = templates.filter(
    (template) => !(template.name === name && template.endpoint === endpoint)
  );
  all[currentLang] = next;
  return writeExportTemplates(all);
};

const readExportColumnState = () => {
  try {
    const raw = localStorage.getItem(EXPORT_COLUMNS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
};

const writeExportColumnState = (payload) => {
  try {
    localStorage.setItem(EXPORT_COLUMNS_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    return false;
  }
};

const getExportColumnDefs = (endpoint) => {
  return endpoint === "stats" ? STATS_EXPORT_COLUMNS : NOTICE_EXPORT_COLUMNS;
};

const getDefaultExportColumns = (endpoint) => {
  return getExportColumnDefs(endpoint).map((col) => col.key);
};

const getExportColumnSelection = (endpoint) => {
  const state = readExportColumnState();
  const langState =
    state && typeof state[currentLang] === "object" ? state[currentLang] : {};
  if (Object.prototype.hasOwnProperty.call(langState, endpoint)) {
    return Array.isArray(langState[endpoint]) ? langState[endpoint] : [];
  }
  return getDefaultExportColumns(endpoint);
};

const setExportColumnSelection = (endpoint, columns) => {
  const state = readExportColumnState();
  const langState =
    state && typeof state[currentLang] === "object" ? state[currentLang] : {};
  langState[endpoint] = Array.isArray(columns) ? columns : [];
  state[currentLang] = langState;
  writeExportColumnState(state);
};

const applyExportColumnSelection = (endpoint, columns) => {
  setExportColumnSelection(endpoint, columns);
  renderExportColumns();
};

const renderExportColumns = () => {
  if (!exportColumnsEl) return;
  const endpoint = getEndpoint();
  const defs = getExportColumnDefs(endpoint);
  const selected = new Set(getExportColumnSelection(endpoint));
  const strings = translations[currentLang] || {};
  exportColumnsEl.innerHTML = defs
    .map((col) => {
      const label = strings[col.labelKey] || col.key;
      const checked = selected.has(col.key) ? "checked" : "";
      return `
        <label class="export-column-item">
          <input type="checkbox" data-export-column="${escapeHtml(
        col.key
      )}" ${checked} />
          <span>${escapeHtml(label)}</span>
        </label>
      `;
    })
    .join("");
};

const getExportColumnsFromUI = () => {
  if (!exportColumnsEl) return [];
  return Array.from(
    exportColumnsEl.querySelectorAll("input[data-export-column]:checked")
  )
    .map((input) => input.dataset.exportColumn)
    .filter(Boolean);
};

const syncExportColumnsFromUI = () => {
  const endpoint = getEndpoint();
  const selected = getExportColumnsFromUI();
  if (selected.length) {
    setExportColumnSelection(endpoint, selected);
  } else {
    setExportColumnSelection(endpoint, []);
  }
};

const refreshExportTemplateOptions = () => {
  if (!exportTemplateSelect) return;
  const endpoint = getEndpoint();
  const strings = translations[currentLang] || {};
  const templates = getExportTemplatesForLang(currentLang)
    .filter((template) => template.endpoint === endpoint)
    .sort((a, b) => a.name.localeCompare(b.name));
  exportTemplateSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent =
    strings.exportTemplateSelectPlaceholder || "Select template";
  exportTemplateSelect.appendChild(placeholder);
  templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.name;
    option.textContent = template.name;
    exportTemplateSelect.appendChild(option);
  });
  exportTemplateSelect.disabled = templates.length === 0;
  const hasSelection = Boolean(exportTemplateSelect.value);
  if (exportTemplateLoadBtn) exportTemplateLoadBtn.disabled = !hasSelection;
  if (exportTemplateDeleteBtn) exportTemplateDeleteBtn.disabled = !hasSelection;
};

const loadExportTemplate = (name) => {
  const endpoint = getEndpoint();
  const templates = getExportTemplatesForLang(currentLang);
  const template = templates.find(
    (item) => item.name === name && item.endpoint === endpoint
  );
  if (!template) return false;
  applyExportColumnSelection(endpoint, template.columns || []);
  return true;
};

const normalizeRecentFilters = (filters) => {
  if (!Array.isArray(filters)) return [];
  const unique = [];
  const seen = new Set();
  filters.forEach((term) => {
    const cleaned = String(term || "").trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(cleaned);
  });
  return unique.slice(0, RECENT_FILTERS_LIMIT);
};

const readRecentFilters = () => {
  try {
    const raw = localStorage.getItem(RECENT_FILTERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeRecentFilters(parsed);
  } catch (err) {
    return [];
  }
};

const writeRecentFilters = (filters) => {
  try {
    const normalized = normalizeRecentFilters(filters);
    localStorage.setItem(RECENT_FILTERS_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (err) {
    return [];
  }
};

const collectFieldValues = () => {
  return {
    noticeType: inputs.noticeType.value,
    noticeNumber: inputs.noticeNumber.value,
    publicationFrom: inputs.publicationFrom.value,
    publicationTo: inputs.publicationTo.value,
    clientType: inputs.clientType.value,
    orderType: inputs.orderType.value,
    tenderType: inputs.tenderType.value,
    orderObject: inputs.orderObject.value,
    cpvCode: getCpvValueString(),
    orgName: inputs.orgName.value,
    orgCity: inputs.orgCity.value,
    orgProvince: inputs.orgProvince.value,
    pageSize: inputs.pageSize.value,
    searchAfter: inputs.searchAfter.value,
  };
};

const applyFieldValues = (fields = {}, { keepMissing = false } = {}) => {
  const applyValue = (key, input) => {
    if (keepMissing && !Object.prototype.hasOwnProperty.call(fields, key)) {
      return;
    }
    if (key === "cpvCode") {
      setCpvValueString(fields[key] || "");
      return;
    }
    input.value = fields[key] || "";
  };
  applyValue("noticeType", inputs.noticeType);
  applyValue("noticeNumber", inputs.noticeNumber);
  applyValue("publicationFrom", inputs.publicationFrom);
  applyValue("publicationTo", inputs.publicationTo);
  applyValue("clientType", inputs.clientType);
  applyValue("orderType", inputs.orderType);
  applyValue("tenderType", inputs.tenderType);
  applyValue("orderObject", inputs.orderObject);
  applyValue("cpvCode", inputs.cpvCode);
  applyValue("orgName", inputs.orgName);
  applyValue("orgCity", inputs.orgCity);
  applyValue("orgProvince", inputs.orgProvince);
  applyValue("pageSize", inputs.pageSize);
  applyValue("searchAfter", inputs.searchAfter);
};

const readSavedLang = () => {
  try {
    const lang = localStorage.getItem(LANG_STORAGE_KEY);
    return lang && translations[lang] ? lang : "";
  } catch (err) {
    return "";
  }
};

const writeSavedLang = (lang) => {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (err) {
    // Ignore storage errors and keep runtime language.
  }
};

const DEFAULT_MATCH_MODE = "contains";

const getMatchModeValue = (select) => {
  const value = select?.value;
  if (value === "exact" || value === "regex" || value === "contains") {
    return value;
  }
  return DEFAULT_MATCH_MODE;
};

const getNoticeNumberMode = () => getMatchModeValue(noticeNumberModeSelect);
const getOrgNameMode = () => getMatchModeValue(orgNameModeSelect);

const buildFieldFilter = (value, mode) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  return { value: trimmed, mode };
};

const getFieldFilters = () => {
  return {
    noticeNumber: buildFieldFilter(
      inputs.noticeNumber.value,
      getNoticeNumberMode()
    ),
    orgName: buildFieldFilter(inputs.orgName.value, getOrgNameMode()),
  };
};

const getMatchModes = () => {
  return {
    noticeNumber: getNoticeNumberMode(),
    orgName: getOrgNameMode(),
  };
};

const applyMatchModes = (modes = {}) => {
  if (noticeNumberModeSelect && modes.noticeNumber) {
    noticeNumberModeSelect.value = modes.noticeNumber;
  }
  if (orgNameModeSelect && modes.orgName) {
    orgNameModeSelect.value = modes.orgName;
  }
};

const readStatsCollapsed = () => {
  try {
    return localStorage.getItem(STATS_COLLAPSE_KEY) === "1";
  } catch (err) {
    return false;
  }
};

const writeStatsCollapsed = (value) => {
  try {
    localStorage.setItem(STATS_COLLAPSE_KEY, value ? "1" : "0");
  } catch (err) {
    // Ignore storage errors.
  }
};

const getPresetFormState = () => {
  return {
    endpoint: getEndpoint(),
    htmlPreview: htmlToggle ? htmlToggle.checked : true,
    fields: collectFieldValues(),
    modes: getMatchModes(),
  };
};

const applyPresetFormState = (state) => {
  if (!state) return;
  if (state.endpoint) {
    const radio = Array.from(endpointRadios).find(
      (item) => item.value === state.endpoint
    );
    if (radio) {
      radio.checked = true;
    }
  }
  applyFieldValues(state.fields || {});
  applyMatchModes(state.modes || {});
  if (htmlToggle && typeof state.htmlPreview === "boolean") {
    htmlToggle.checked = state.htmlPreview;
  }
  paginationState.pageSize = getPageSize();
  paginationState.currentPage = 1;
  updateEndpointUI();
  syncRangeButtons();
  updateResultsActions();
};

const refreshPresetOptions = () => {
  if (!presetSelect) return;
  const strings = translations[currentLang] || {};
  const presets = readPresets().sort((a, b) => a.name.localeCompare(b.name));
  presetSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = strings.presetSelectPlaceholder || "Select preset";
  presetSelect.appendChild(placeholder);
  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.name;
    option.textContent = preset.name;
    presetSelect.appendChild(option);
  });
  presetSelect.disabled = presets.length === 0;
  const hasSelection = Boolean(presetSelect.value);
  if (presetLoadBtn) presetLoadBtn.disabled = !hasSelection;
  if (presetDeleteBtn) presetDeleteBtn.disabled = !hasSelection;
};

const loadBookmarks = () => {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      bookmarks = new Set(parsed);
    }
  } catch (err) {
    console.error("Failed to load bookmarks", err);
  }
};

const saveBookmarks = () => {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...bookmarks]));
  } catch (err) {
    console.error("Failed to save bookmarks", err);
  }
};

const toggleBookmark = (id) => {
  if (bookmarks.has(id)) {
    bookmarks.delete(id);
  } else {
    bookmarks.add(id);
  }
  saveBookmarks();
  const safeId =
    typeof CSS !== "undefined" && CSS.escape
      ? CSS.escape(id)
      : String(id).replace(/["\\]/g, "\\$&");
  const btns = document.querySelectorAll(
    `button.bookmark-btn[data-id="${safeId}"]`
  );
  btns.forEach((btn) => {
    btn.classList.toggle("active", bookmarks.has(id));
    btn.textContent = bookmarks.has(id) ? "★" : "☆";
  });
  if (bookmarksToggle && bookmarksToggle.checked) {
    applyResultsFilter();
  }
};

const readSessionState = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (err) {
    return null;
  }
};

const writeSessionState = (state) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    return false;
  }
};

const getSessionState = () => {
  return {
    endpoint: getEndpoint(),
    lang: currentLang,
    htmlPreview: htmlToggle ? htmlToggle.checked : true,
    analytics: analyticsToggle ? analyticsToggle.checked : true,
    autoRun: autoRunToggle ? autoRunToggle.checked : false,
    exportFiltered: exportFilteredToggle ? exportFilteredToggle.checked : false,
    deltaMode: deltaToggle ? deltaToggle.checked : false,
    infiniteMode: infiniteToggle ? infiniteToggle.checked : false,
    timeSeriesMode,
    matchModes: getMatchModes(),
    filter: filterInput ? filterInput.value : "",
    fields: collectFieldValues(),
  };
};

const applySessionState = (state) => {
  if (!state) return;
  if (state.endpoint) {
    const radio = Array.from(endpointRadios).find(
      (item) => item.value === state.endpoint
    );
    if (radio) {
      radio.checked = true;
    }
  }
  applyFieldValues(state.fields || {});
  if (htmlToggle && typeof state.htmlPreview === "boolean") {
    htmlToggle.checked = state.htmlPreview;
  }
  if (analyticsToggle && typeof state.analytics === "boolean") {
    analyticsToggle.checked = state.analytics;
  }
  if (autoRunToggle && typeof state.autoRun === "boolean") {
    autoRunToggle.checked = state.autoRun;
  }
  if (exportFilteredToggle && typeof state.exportFiltered === "boolean") {
    exportFilteredToggle.checked = state.exportFiltered;
  }
  if (typeof state.deltaMode === "boolean") {
    setDeltaMode(state.deltaMode);
  }
  if (typeof state.infiniteMode === "boolean") {
    setInfiniteMode(state.infiniteMode);
  }
  if (state.matchModes) {
    applyMatchModes(state.matchModes);
  }
  if (state.timeSeriesMode === "weekly" || state.timeSeriesMode === "daily") {
    timeSeriesMode = state.timeSeriesMode;
  }
  if (filterInput && typeof state.filter === "string") {
    filterInput.value = state.filter;
  }
  paginationState.pageSize = getPageSize();
  paginationState.currentPage = 1;
  updateEndpointUI();
  syncRangeButtons();
  updateResultsActions();
  applyResultsFilter();
};

const saveSessionState = () => {
  if (sessionSaveTimer) {
    clearTimeout(sessionSaveTimer);
    sessionSaveTimer = null;
  }
  writeSessionState(getSessionState());
};

const scheduleSessionSave = () => {
  if (sessionSaveTimer) {
    clearTimeout(sessionSaveTimer);
  }
  sessionSaveTimer = setTimeout(() => {
    sessionSaveTimer = null;
    writeSessionState(getSessionState());
  }, 200);
};

const buildShareUrl = () => {
  const url = new URL(window.location.href);
  url.search = "";
  const params = url.searchParams;
  params.set("endpoint", getEndpoint());
  params.set("lang", currentLang);
  if (htmlToggle) {
    params.set("html", htmlToggle.checked ? "1" : "0");
  }
  if (analyticsToggle) {
    params.set("analytics", analyticsToggle.checked ? "1" : "0");
  }
  if (autoRunToggle && autoRunToggle.checked) {
    params.set("autorun", "1");
  }
  if (deltaToggle && deltaToggle.checked) {
    params.set("delta", "1");
  }
  if (infiniteToggle && infiniteToggle.checked) {
    params.set("infinite", "1");
  }
  if (noticeNumberModeSelect) {
    params.set("noticeNumberMode", getNoticeNumberMode());
  }
  if (orgNameModeSelect) {
    params.set("orgNameMode", getOrgNameMode());
  }
  if (timeSeriesMode) {
    params.set("series", timeSeriesMode);
  }
  const fields = collectFieldValues();
  Object.entries(fields).forEach(([key, value]) => {
    const trimmed = String(value || "").trim();
    if (trimmed) {
      params.set(key, trimmed);
    }
  });
  if (filterInput && filterInput.value.trim()) {
    params.set("filter", filterInput.value.trim());
  }
  return url.toString();
};

const readStateFromUrl = () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const keys = [
    "endpoint",
    "lang",
    "html",
    "analytics",
    "autorun",
    "delta",
    "infinite",
    "series",
    "noticeNumberMode",
    "orgNameMode",
    "filter",
    "noticeType",
    "noticeNumber",
    "publicationFrom",
    "publicationTo",
    "clientType",
    "orderType",
    "tenderType",
    "orderObject",
    "cpvCode",
    "orgName",
    "orgCity",
    "orgProvince",
    "pageSize",
    "searchAfter",
  ];
  const hasState = keys.some((key) => params.has(key));
  if (!hasState) return null;

  const fieldKeys = Object.keys(collectFieldValues());
  const fields = {};
  fieldKeys.forEach((key) => {
    if (params.has(key)) {
      fields[key] = params.get(key) || "";
    }
  });

  const htmlFlag = params.get("html");
  const analyticsFlag = params.get("analytics");
  const autoRunFlag = params.get("autorun");
  const deltaFlag = params.get("delta");
  const infiniteFlag = params.get("infinite");
  const seriesMode = params.get("series");
  const noticeNumberMode = params.get("noticeNumberMode");
  const orgNameMode = params.get("orgNameMode");
  const endpoint = params.get("endpoint");
  const lang = params.get("lang");

  return {
    endpoint: endpoint === "stats" || endpoint === "notice" ? endpoint : "",
    lang,
    htmlPreview: htmlFlag === null ? undefined : htmlFlag !== "0",
    analytics: analyticsFlag === null ? undefined : analyticsFlag !== "0",
    autoRun: autoRunFlag === null ? undefined : autoRunFlag === "1",
    deltaMode: deltaFlag === null ? undefined : deltaFlag === "1",
    infiniteMode: infiniteFlag === null ? undefined : infiniteFlag === "1",
    timeSeriesMode: seriesMode,
    matchModes: {
      noticeNumber: noticeNumberMode || undefined,
      orgName: orgNameMode || undefined,
    },
    filter: params.has("filter") ? params.get("filter") || "" : undefined,
    fields,
  };
};

const applyUrlState = (state) => {
  if (!state) return;
  if (state.endpoint) {
    const radio = Array.from(endpointRadios).find(
      (item) => item.value === state.endpoint
    );
    if (radio) {
      radio.checked = true;
    }
  }
  applyFieldValues(state.fields || {}, { keepMissing: true });
  if (state.matchModes) {
    applyMatchModes(state.matchModes);
  }
  if (htmlToggle && typeof state.htmlPreview === "boolean") {
    htmlToggle.checked = state.htmlPreview;
  }
  if (analyticsToggle && typeof state.analytics === "boolean") {
    analyticsToggle.checked = state.analytics;
  }
  if (autoRunToggle && typeof state.autoRun === "boolean") {
    autoRunToggle.checked = state.autoRun;
  }
  if (typeof state.deltaMode === "boolean") {
    setDeltaMode(state.deltaMode);
  }
  if (typeof state.infiniteMode === "boolean") {
    setInfiniteMode(state.infiniteMode);
  }
  if (state.timeSeriesMode === "weekly" || state.timeSeriesMode === "daily") {
    timeSeriesMode = state.timeSeriesMode;
  }
  if (filterInput && typeof state.filter === "string") {
    filterInput.value = state.filter;
  }
  paginationState.pageSize = getPageSize();
  paginationState.currentPage = 1;
  updateEndpointUI();
  syncRangeButtons();
  updateResultsActions();
  applyResultsFilter();
};

const statsOnlyFields = [
  inputs.noticeNumber,
  inputs.clientType,
  inputs.orderType,
  inputs.tenderType,
  inputs.orderObject,
  inputs.cpvCode,
  inputs.orgName,
  inputs.orgCity,
  inputs.orgProvince,
  inputs.pageSize,
  inputs.searchAfter,
];

const updateEndpointUI = () => {
  const endpoint = getEndpoint();
  const isStats = endpoint === "stats";

  statsOnlyFields.forEach((input) => {
    input.disabled = isStats;
  });

  inputs.noticeType.required = !isStats;
  inputs.pageSize.required = !isStats;

  if (isStats) {
    inputs.pageSize.value = "";
    inputs.searchAfter.value = "";
  } else if (!inputs.pageSize.value) {
    inputs.pageSize.value = 50;
  }
  if (!isStats) {
    setDefaultNoticeType();
  }

  if (htmlToggle) {
    htmlToggle.disabled = isStats;
  }
  if (analyticsToggle) {
    analyticsToggle.disabled = isStats;
  }
  if (noticeNumberModeSelect) {
    noticeNumberModeSelect.disabled = isStats;
  }
  if (orgNameModeSelect) {
    orgNameModeSelect.disabled = isStats;
  }

  updateResultsActions();
  updateInfiniteUI();
  renderExportColumns();
  refreshExportTemplateOptions();
  renderCpvFavorites();
  updateCpvFavoritesAddState();
};

const normalizeDateTime = (value) => {
  if (!value) return "";
  if (value.length === 16) return `${value}:00`;
  return value;
};

const toLocalInputValue = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const setActiveRangeButton = (days) => {
  rangeButtons.forEach((button) => {
    const target = Number(button.dataset.range);
    const isActive = days && target === days;
    button.classList.toggle("is-active", isActive);
  });
};

const syncRangeButtons = () => {
  if (!rangeButtons.length) return;
  const fromValue = inputs.publicationFrom.value;
  const toValue = inputs.publicationTo.value;
  if (!fromValue || !toValue) {
    setActiveRangeButton(null);
    return;
  }
  const from = new Date(fromValue);
  const to = new Date(toValue);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    setActiveRangeButton(null);
    return;
  }
  const diffDays = Math.round((to - from) / (24 * 60 * 60 * 1000));
  const matches = Array.from(rangeButtons).some(
    (button) => Number(button.dataset.range) === diffDays
  );
  setActiveRangeButton(matches ? diffDays : null);
};

const setDateRange = (days) => {
  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - days);
  inputs.publicationFrom.value = toLocalInputValue(fromDate);
  inputs.publicationTo.value = toLocalInputValue(now);
  setActiveRangeButton(days);
};

const setDefaultNoticeType = () => {
  if (getEndpoint() !== "notice") return;
  if (!inputs.noticeType.value.trim()) {
    inputs.noticeType.value = DEFAULT_NOTICE_TYPE;
  }
};

const resetSearchAfter = () => {
  inputs.searchAfter.value = "";
};

const shouldResetSearchAfter = (target) => {
  const id = target?.id || "";
  if (!id || id === "search-after") return false;
  return SEARCH_AFTER_RESET_IDS.has(id);
};

const clearSearchAfterIfNeeded = () => {
  if (!inputs.searchAfter.value) return;
  resetSearchAfter();
};

const setDefaultDates = () => {
  setDateRange(DEFAULT_DATE_RANGE_DAYS);
};

const normalizeCpvToken = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/\d{8}-\d/);
  if (match) return match[0];
  const digits = trimmed.match(/\d{8}/);
  return digits ? digits[0] : "";
};

const parseCpvInput = (value) => {
  const text = String(value || "");
  const matches = text.match(/\d{8}-\d|\d{8}/g);
  if (matches && matches.length) {
    const unique = [];
    const seen = new Set();
    matches.forEach((match) => {
      const normalized = normalizeCpvToken(match);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        unique.push(normalized);
      }
    });
    return unique;
  }
  const tokens = text
    .split(/[,;\n]+/)
    .map((chunk) => normalizeCpvToken(chunk))
    .filter(Boolean);
  return Array.from(new Set(tokens));
};

const getCpvTagsEl = () => document.getElementById("cpv-tags");

const getCpvValues = () => {
  const tagsEl = getCpvTagsEl();
  const tags = tagsEl
    ? Array.from(tagsEl.querySelectorAll(".cpv-tag-input"))
      .map((tag) => tag.dataset.value || "")
      .filter(Boolean)
    : [];
  const inputValues = parseCpvInput(inputs.cpvCode.value);
  const seen = new Set();
  const unique = [];
  [...tags, ...inputValues].forEach((value) => {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  });
  return unique;
};

const renderCpvTags = (values) => {
  const tagsEl = getCpvTagsEl();
  if (!tagsEl) {
    inputs.cpvCode.value = values.join(", ");
    return;
  }
  tagsEl.innerHTML = "";
  values.forEach((value) => {
    const tag = document.createElement("span");
    tag.className = `cpv-tag cpv-tag-input${isCpvFavorite(value) ? " is-favorite" : ""
      }`;
    tag.dataset.value = value;
    tag.textContent = value;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cpv-tag-remove";
    remove.setAttribute(
      "aria-label",
      translations[currentLang]?.removeTag || "Remove"
    );
    remove.textContent = "x";
    tag.appendChild(remove);
    tagsEl.appendChild(tag);
  });
  tagsEl.hidden = values.length === 0;
  inputs.cpvCode.value = "";
  updateCpvFavoritesAddState();
};

const setCpvValues = (values) => {
  const parsed = [];
  values.forEach((value) => {
    parsed.push(...parseCpvInput(value));
  });
  const seen = new Set();
  const unique = [];
  parsed.forEach((value) => {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  });
  renderCpvTags(unique);
};

const addCpvValue = (value) => {
  const parsed = parseCpvInput(value);
  if (!parsed.length) return;
  setCpvValues([...getCpvValues(), ...parsed]);
};

const removeCpvValue = (value) => {
  const key = String(value || "").toLowerCase();
  const filtered = getCpvValues().filter(
    (item) => item.toLowerCase() !== key
  );
  setCpvValues(filtered);
};

const getCpvValueString = () => getCpvValues().join(", ");

const setCpvValueString = (value) => {
  const parsed = parseCpvInput(value);
  setCpvValues(parsed);
};

const updateCpvTagLabels = () => {
  const tagsEl = getCpvTagsEl();
  if (!tagsEl) return;
  const label = translations[currentLang]?.removeTag || "Remove";
  tagsEl.querySelectorAll(".cpv-tag-remove").forEach((button) => {
    button.setAttribute("aria-label", label);
  });
};

const normalizeCpvFavorites = (values) => {
  const parsed = [];
  values.forEach((value) => {
    parsed.push(...parseCpvInput(value));
  });
  const seen = new Set();
  const unique = [];
  parsed.forEach((value) => {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(value);
    }
  });
  return unique;
};

const readCpvFavorites = () => {
  try {
    const raw = localStorage.getItem(CPV_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeCpvFavorites(parsed) : [];
  } catch (err) {
    return [];
  }
};

const writeCpvFavorites = (values) => {
  try {
    localStorage.setItem(CPV_FAVORITES_KEY, JSON.stringify(values));
    return true;
  } catch (err) {
    return false;
  }
};

const setCpvFavorites = (values, { persist = true, render = true } = {}) => {
  const normalized = normalizeCpvFavorites(values);
  cpvFavorites = normalized;
  cpvFavoritesSet = new Set(normalized.map((value) => value.toLowerCase()));
  if (persist) {
    writeCpvFavorites(cpvFavorites);
  }
  if (render) {
    renderCpvFavorites();
    updateCpvTagFavorites();
  }
};

const hydrateCpvFavorites = () => {
  setCpvFavorites(readCpvFavorites(), { persist: false, render: false });
};

const addCpvFavorites = (values) => {
  const next = normalizeCpvFavorites([...cpvFavorites, ...values]);
  setCpvFavorites(next);
};

const removeCpvFavorite = (value) => {
  const key = String(value || "").toLowerCase();
  const next = cpvFavorites.filter((item) => item.toLowerCase() !== key);
  setCpvFavorites(next);
};

const isCpvFavorite = (value) => {
  const key = String(value || "").toLowerCase();
  return cpvFavoritesSet.has(key);
};

const formatCpvFavoriteLabel = (code) => {
  const normalized = String(code || "").replace(/\s/g, "");
  const label =
    dictionaries.cpv.get(normalized) ||
    dictionaries.cpv.get(normalized.replace(/-/g, ""));
  return label ? `${code} - ${label}` : code;
};

const updateCpvFavoritesAddState = () => {
  if (!cpvFavoritesAddBtn) return;
  if (inputs.cpvCode?.disabled) {
    cpvFavoritesAddBtn.disabled = true;
    return;
  }
  const values = getCpvValues();
  cpvFavoritesAddBtn.disabled = values.length === 0;
};

const updateCpvFavoriteLabels = () => {
  if (!cpvFavoritesList) return;
  const label =
    translations[currentLang]?.cpvFavoriteRemove || "Remove from favorites";
  cpvFavoritesList
    .querySelectorAll(".cpv-favorite-remove")
    .forEach((button) => {
      button.setAttribute("aria-label", label);
    });
};

const renderCpvFavorites = () => {
  if (!cpvFavoritesEl || !cpvFavoritesList) return;
  if (!cpvFavorites.length || inputs.cpvCode?.disabled) {
    cpvFavoritesEl.hidden = true;
    cpvFavoritesList.innerHTML = "";
    updateCpvFavoritesAddState();
    return;
  }
  const sorted = [...cpvFavorites].sort((a, b) => a.localeCompare(b));
  cpvFavoritesEl.hidden = false;
  cpvFavoritesList.innerHTML = sorted
    .map((value) => {
      const label = formatCpvFavoriteLabel(value);
      return `
        <div class="cpv-favorite-item" data-value="${escapeHtml(value)}">
          <button type="button" class="cpv-favorite-add" data-value="${escapeHtml(
        value
      )}">
            ${escapeHtml(label)}
          </button>
          <button type="button" class="cpv-favorite-remove" data-value="${escapeHtml(
        value
      )}">×</button>
        </div>
      `;
    })
    .join("");
  updateCpvFavoriteLabels();
  updateCpvFavoritesAddState();
};

const updateCpvTagFavorites = () => {
  const tagsEl = getCpvTagsEl();
  if (!tagsEl) return;
  tagsEl.querySelectorAll(".cpv-tag-input").forEach((tag) => {
    const value = tag.dataset.value || "";
    tag.classList.toggle("is-favorite", isCpvFavorite(value));
  });
};

const getEndpoint = () =>
  Array.from(endpointRadios).find((radio) => radio.checked)?.value || "notice";

const buildParams = (
  endpoint,
  { searchAfterOverride, pageSizeOverride } = {}
) => {
  const params = new URLSearchParams();
  const publicationFrom = normalizeDateTime(inputs.publicationFrom.value);
  const publicationTo = normalizeDateTime(inputs.publicationTo.value);

  if (publicationFrom) params.set("PublicationDateFrom", publicationFrom);
  if (publicationTo) params.set("PublicationDateTo", publicationTo);

  const optionalPairs = [];

  if (endpoint === "notice") {
    params.set("NoticeType", inputs.noticeType.value.trim());
    const pageSizeValue =
      pageSizeOverride !== undefined
        ? String(pageSizeOverride)
        : inputs.pageSize.value.trim();
    params.set("PageSize", pageSizeValue);
    if (getNoticeNumberMode() === "exact") {
      optionalPairs.push(["NoticeNumber", inputs.noticeNumber.value]);
    }
    if (getOrgNameMode() === "exact") {
      optionalPairs.push(["OrganizationName", inputs.orgName.value]);
    }
    optionalPairs.push(
      ["ClientType", inputs.clientType.value],
      ["OrderType", inputs.orderType.value],
      ["TenderType", inputs.tenderType.value],
      ["OrderObject", inputs.orderObject.value],
      ["OrganizationCity", inputs.orgCity.value],
      ["OrganizationProvince", inputs.orgProvince.value],
      [
        "SearchAfter",
        searchAfterOverride !== undefined
          ? searchAfterOverride
          : inputs.searchAfter.value,
      ]
    );
  } else {
    optionalPairs.push(["NoticeType", inputs.noticeType.value]);
  }

  optionalPairs.forEach(([key, value]) => {
    const trimmed = String(value || "").trim();
    if (trimmed) params.set(key, trimmed);
  });
  const cpvCodes = getCpvValues();
  cpvCodes.forEach((code) => {
    const trimmed = String(code || "").trim();
    if (trimmed) params.append("CpvCode", trimmed);
  });

  return params;
};

const buildApiUrl = (endpoint, overrides = {}) => {
  const baseUrl = inputs.baseUrl.value.trim().replace(/\/$/, "");
  const params = buildParams(endpoint, overrides);
  const path = ENDPOINT_PATHS[endpoint] || endpoint;
  return `${baseUrl}/api/v1/${path}?${params.toString()}`;
};

const buildNoticeDetailsUrl = (id) => {
  const trimmed = String(id || "").trim();
  if (!trimmed) return "";
  return `${NOTICE_DETAILS_BASE_URL}${encodeURIComponent(trimmed)}`;
};

const buildProcessingDetailsUrl = (id) => {
  const trimmed = String(id || "").trim();
  if (!trimmed) return "";
  return `${PROCESSING_DETAILS_BASE_URL}${encodeURIComponent(trimmed)}`;
};

const setDatalistOptions = (id, options) => {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = "";
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    if (option.label) item.label = option.label;
    if (option.tooltip) {
      item.title = option.tooltip;
      item.dataset.tooltip = option.tooltip;
    }
    list.appendChild(item);
  });
  dropdownCache.delete(id); // Clear potentially stale/empty cache
  dropdownCache.set(id, options);
};

const setLanguage = (lang) => {
  currentLang = translations[lang] ? lang : DEFAULT_LANG;
  document.documentElement.lang = currentLang;
  langRadios.forEach((radio) => {
    radio.checked = radio.value === currentLang;
  });
  writeSavedLang(currentLang);
  const strings = translations[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (strings[key]) {
      node.textContent = strings[key];
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    if (strings[key]) {
      node.placeholder = strings[key];
    }
  });
  applyStatus();
  setDatalistOptions("notice-type-list", noticeTypeLabels[currentLang]);
  dictionaries.noticeType = toMap(noticeTypeLabels[currentLang] || []);
  noticeCardLabels = buildNoticeCardLabels();
  updateCpvTagLabels();
  updateCompareFab();
  setupClearButtons();
  setupDropdowns();
  if (Array.isArray(lastResults) && lastResults.length) {
    if (lastEndpoint === "notice") {
      renderNoticePage(paginationState.currentPage || 1);
    } else {
      renderStats(lastResults);
    }
  } else if (lastQueryMeta) {
    renderEmpty();
  }
  applyResultsFilter();
  updateResultsMeta();
  updateResultsActions();
  updateQuerySummary();
  renderRecentFilters();
  applyStatsCollapsed();
  if (modalEl?.classList.contains("is-open") && modalTitle) {
    const notice =
      currentModalIndex !== null ? lastResults[currentModalIndex] : null;
    modalTitle.textContent = notice
      ? getNoticeTitle(notice)
      : strings.modalTitleFallback || "Notice";
  }
  refreshPresetOptions();
  renderExportColumns();
  refreshExportTemplateOptions();
  updateClearButtonLabels();
  updateCpvTagLabels();
  renderCpvFavorites();
  updateCpvFavoriteLabels();
};

const flattenDictionaryItems = (items, acc = []) => {
  if (!Array.isArray(items)) return acc;
  items.forEach((item) => {
    if (item && item.identifier) {
      acc.push({ value: item.identifier, label: item.key || "" });
    }
    if (Array.isArray(item?.Items)) {
      flattenDictionaryItems(item.Items, acc);
    }
  });
  return acc;
};

const fetchWithCache = async (path) => {
  if (!("caches" in window)) return fetch(path);
  try {
    const cache = await caches.open(RESOURCE_CACHE_NAME);
    const cached = await cache.match(path);
    if (cached) return cached.clone();
    const response = await fetch(path);
    if (response.ok) {
      await cache.put(path, response.clone());
    }
    return response;
  } catch (err) {
    return fetch(path);
  }
};

const openDictionaryDb = () => {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  if (dictionaryDbPromise) return dictionaryDbPromise;
  dictionaryDbPromise = new Promise((resolve) => {
    const request = indexedDB.open(DICTIONARY_DB_NAME, DICTIONARY_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DICTIONARY_STORE_NAME)) {
        db.createObjectStore(DICTIONARY_STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  return dictionaryDbPromise;
};

const getDictionaryCacheKey = (listId) =>
  `v${DICTIONARY_CACHE_VERSION}:${listId}`;

const readDictionaryCache = async (key) => {
  const db = await openDictionaryDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(DICTIONARY_STORE_NAME, "readonly");
    const store = tx.objectStore(DICTIONARY_STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value ?? null);
    request.onerror = () => resolve(null);
  });
};

const writeDictionaryCache = async (key, value) => {
  const db = await openDictionaryDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(DICTIONARY_STORE_NAME, "readwrite");
    const store = tx.objectStore(DICTIONARY_STORE_NAME);
    const request = store.put({
      key,
      value,
      updatedAt: Date.now(),
    });
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
};

const readDictionaryListCache = async (listId) => {
  const cached = await readDictionaryCache(getDictionaryCacheKey(listId));
  return Array.isArray(cached) ? cached : null;
};

const writeDictionaryListCache = (listId, items) =>
  writeDictionaryCache(getDictionaryCacheKey(listId), items);

const readCpvCache = async () => {
  const cached = await readDictionaryCache(getDictionaryCacheKey("cpv-list"));
  if (
    cached &&
    Array.isArray(cached.options) &&
    Array.isArray(cached.mapEntries)
  ) {
    return cached;
  }
  return null;
};

const writeCpvCache = (payload) =>
  writeDictionaryCache(getDictionaryCacheKey("cpv-list"), payload);

const loadDictionaryItems = async (paths) => {
  const list = Array.isArray(paths) ? paths : [paths];
  const responses = await Promise.all(list.map((path) => fetchWithCache(path)));
  const items = await Promise.all(
    responses.map(async (response, index) => {
      if (!response.ok) throw new Error(`Failed to load ${list[index]}`);
      const data = await response.json();
      return flattenDictionaryItems(data.items);
    })
  );
  return items.flat();
};

const getCpvWorker = () => {
  if (cpvWorker) return cpvWorker;
  if (typeof Worker === "undefined") return null;
  try {
    cpvWorker = new Worker("cpv-worker.js");
    return cpvWorker;
  } catch (err) {
    cpvWorker = null;
    return null;
  }
};

const parseCpvCsvAsync = async (text) => {
  const worker = getCpvWorker();
  if (!worker) return parseCpvCsv(text);
  const requestId = (cpvWorkerRequestId += 1);
  return new Promise((resolve) => {
    const fallback = () => resolve(parseCpvCsv(text));
    const handleMessage = (event) => {
      const { id, result } = event.data || {};
      if (id !== requestId) return;
      cleanup();
      resolve(result || parseCpvCsv(text));
    };
    const handleError = () => {
      cleanup();
      fallback();
    };
    const cleanup = () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
    };
    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError, { once: true });
    worker.postMessage({ id: requestId, text });
  });
};

const parseCpvCsv = (text) => {
  const options = [];
  const map = new Map();
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!/^\"\d{8}-\d\",/.test(trimmed)) return;
    const parts = trimmed.slice(1, -1).split('","');
    if (parts.length < 2) return;
    const code = parts[0].trim();
    const label = parts.slice(1).join('","').trim();
    if (!code || !label) return;
    options.push({ value: code, label });
    map.set(code, label);
    map.set(code.replace(/-/g, ""), label);
  });
  return { options, mapEntries: Array.from(map.entries()) };
};

function toMap(items) {
  const map = new Map();
  items.forEach((item) => {
    map.set(item.value, item.label || "");
  });
  return map;
}

const dictionaryLoaders = {
  "client-type-list": async () => {
    const cached = await readDictionaryListCache("client-type-list");
    if (cached) {
      setDatalistOptions("client-type-list", cached);
      dictionaries.clientType = toMap(cached);
      return;
    }
    const clientTypes = await loadDictionaryItems("Docs/SL.MO.013.json");
    setDatalistOptions("client-type-list", clientTypes);
    dictionaries.clientType = toMap(clientTypes);
    void writeDictionaryListCache("client-type-list", clientTypes);
  },
  "order-type-list": async () => {
    const cached = await readDictionaryListCache("order-type-list");
    if (cached) {
      setDatalistOptions("order-type-list", cached);
      dictionaries.orderType = toMap(cached);
      return;
    }
    const [orderTypesA, orderTypesB] = await Promise.all([
      loadDictionaryItems("Docs/ENUM.002.json"),
      loadDictionaryItems("Docs/SL.MO.042.json"),
    ]);
    const orderTypes = [...orderTypesA, ...orderTypesB];
    setDatalistOptions("order-type-list", orderTypes);
    dictionaries.orderType = toMap(orderTypes);
    void writeDictionaryListCache("order-type-list", orderTypes);
  },
  "tender-type-list": async () => {
    const cached = await readDictionaryListCache("tender-type-list");
    if (cached) {
      setDatalistOptions("tender-type-list", cached);
      dictionaries.tenderType = toMap(cached);
      return;
    }
    const [tenderTypesA, tenderTypesB, tenderTypesC] = await Promise.all([
      loadDictionaryItems("Docs/ENUM.018.json"),
      loadDictionaryItems("Docs/ENUM.019.json"),
      loadDictionaryItems("Docs/ENUM.017.json"),
    ]);
    const tenderTypes = [...tenderTypesA, ...tenderTypesB, ...tenderTypesC].map(
      (item) => ({
        ...item,
        tooltip: tenderTypeTooltips.get(item.value) || "",
      })
    );
    setDatalistOptions("tender-type-list", tenderTypes);
    dictionaries.tenderType = toMap(tenderTypes);
    void writeDictionaryListCache("tender-type-list", tenderTypes);
  },
  "province-list": async () => {
    const cached = await readDictionaryListCache("province-list");
    if (cached) {
      setDatalistOptions("province-list", cached);
      dictionaries.province = toMap(cached);
      return;
    }
    const provinces = await loadDictionaryItems("Docs/SL.MT.007.json");
    setDatalistOptions("province-list", provinces);
    dictionaries.province = toMap(provinces);
    void writeDictionaryListCache("province-list", provinces);
  },
  "cpv-list": async () => {
    const cached = await readCpvCache();
    if (cached) {
      setDatalistOptions("cpv-list", cached.options);
      dictionaries.cpv = new Map(cached.mapEntries);
      renderCpvFavorites();
      updateCpvTagFavorites();
      return;
    }
    const response = await fetchWithCache("Docs/cpv-2008.csv");
    if (!response.ok) throw new Error("Failed to load CPV codes");
    const cpvText = await response.text();
    const { options, mapEntries } = await parseCpvCsvAsync(cpvText);
    setDatalistOptions("cpv-list", options);
    dictionaries.cpv = new Map(mapEntries);
    void writeCpvCache({ options, mapEntries });
    renderCpvFavorites();
    updateCpvTagFavorites();
  },
};

const ensureDictionaryLoaded = (listId) => {
  const loader = dictionaryLoaders[listId];
  if (!loader) return Promise.resolve(true);
  if (dropdownCache.has(listId)) return Promise.resolve(true);
  if (dictionaryLoadPromises.has(listId)) {
    return dictionaryLoadPromises.get(listId);
  }
  const promise = loader()
    .then(() => {
      dictionaryLoadPromises.delete(listId);
      return true;
    })
    .catch((err) => {
      setStatusMessage(`Dictionary load failed: ${err.message}`, "error");
      dictionaryLoadPromises.delete(listId);
      return false;
    });
  dictionaryLoadPromises.set(listId, promise);
  return promise;
};

const validateForm = (endpoint) => {
  const strings = translations[currentLang];
  if (!inputs.baseUrl.value.trim()) {
    return strings?.baseUrlRequired || "Base URL is required.";
  }
  if (endpoint === "notice") {
    if (!inputs.noticeType.value.trim()) {
      return strings?.noticeTypeRequired || "NoticeType is required.";
    }
    if (!inputs.publicationFrom.value) {
      return (
        strings?.publicationFromRequired || "PublicationDateFrom is required."
      );
    }
    if (!inputs.publicationTo.value) {
      return strings?.publicationToRequired || "PublicationDateTo is required.";
    }
    if (!inputs.pageSize.value.trim()) {
      return strings?.pageSizeRequired || "PageSize is required.";
    }
  }
  if (inputs.publicationFrom.value && inputs.publicationTo.value) {
    const from = new Date(inputs.publicationFrom.value);
    const to = new Date(inputs.publicationTo.value);
    if (
      !Number.isNaN(from.getTime()) &&
      !Number.isNaN(to.getTime()) &&
      from > to
    ) {
      return (
        strings?.dateRangeInvalid ||
        "PublicationDateFrom must be before PublicationDateTo."
      );
    }
  }
  return "";
};

const showToast = (message, type = "info") => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  if (type === "success") {
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>${escapeHtml(message)}</span>`;
  } else if (type === "error") {
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${escapeHtml(message)}</span>`;
  } else {
    toast.textContent = message;
  }
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
};

const renderEmpty = () => {
  const message =
    translations[currentLang]?.emptyResults || "No data returned.";
  resultsEl.innerHTML = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <p>${escapeHtml(message)}</p>
    </div>`;
  noticeAnalyticsEl = null;
  noticeListEl = null;
};

const getNoticeDateValue = (notice) => {
  const raw = notice?.publicationDate;
  if (!raw) return 0;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const mergeNoticeRecords = (base, incoming) => {
  if (!incoming) return base;
  const merged = { ...base };
  Object.keys(incoming).forEach((key) => {
    const value = incoming[key];
    if (value !== null && value !== undefined && value !== "") {
      merged[key] = value;
    }
  });
  return merged;
};

const mergeNoticeResults = (existing, incoming) => {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return { merged: Array.isArray(existing) ? existing : [], added: 0 };
  }
  if (!Array.isArray(existing) || existing.length === 0) {
    return { merged: incoming.slice(), added: incoming.length };
  }

  const merged = existing.slice();
  const byId = new Map();
  const byNumber = new Map();
  merged.forEach((notice, index) => {
    if (notice?.objectId) byId.set(notice.objectId, index);
    if (notice?.noticeNumber) {
      const key = `${notice.noticeType || ""}::${notice.noticeNumber}`;
      byNumber.set(key, index);
    }
  });

  let added = 0;
  incoming.forEach((notice) => {
    if (!notice) return;
    const objectId = notice.objectId;
    const noticeNumber = notice.noticeNumber;
    if (objectId && byId.has(objectId)) {
      const idx = byId.get(objectId);
      merged[idx] = mergeNoticeRecords(merged[idx], notice);
      return;
    }
    if (noticeNumber) {
      const key = `${notice.noticeType || ""}::${noticeNumber}`;
      if (byNumber.has(key)) {
        const idx = byNumber.get(key);
        const existingNotice = merged[idx];
        if (getNoticeDateValue(notice) >= getNoticeDateValue(existingNotice)) {
          merged[idx] = mergeNoticeRecords(existingNotice, notice);
        }
        return;
      }
    }
    merged.push(notice);
    if (objectId) byId.set(objectId, merged.length - 1);
    if (noticeNumber) {
      const key = `${notice.noticeType || ""}::${noticeNumber}`;
      byNumber.set(key, merged.length - 1);
    }
    added += 1;
  });

  return { merged, added };
};

const getNoticeKey = (notice) => {
  if (!notice) return "";
  return (
    notice.objectId ||
    notice.noticeNumber ||
    notice.tenderId ||
    notice.bzpNumber ||
    ""
  );
};

const getBookmarkId = (notice) => {
  if (!notice) return "";
  return notice.objectId || notice.noticeNumber || notice.tenderId || "";
};

const buildNoticeFingerprint = (notice) => {
  if (!notice) return "";
  const contractors = Array.isArray(notice.contractors)
    ? notice.contractors
      .map((contractor) => contractor.contractorName)
      .filter(Boolean)
      .sort()
    : [];
  const payload = {
    noticeType: notice.noticeType || "",
    noticeNumber: notice.noticeNumber || "",
    publicationDate: notice.publicationDate || "",
    organizationName: notice.organizationName || "",
    organizationCity: notice.organizationCity || "",
    organizationProvince: notice.organizationProvince || "",
    clientType: notice.clientType || "",
    orderType: notice.orderType || "",
    tenderType: notice.tenderType || "",
    cpvCode: notice.cpvCode || "",
    tenderId: notice.tenderId || "",
    objectId: notice.objectId || "",
    bzpNumber: notice.bzpNumber || "",
    contractValue: getTenderResultValue(notice) || "",
    proceedingWebsite: getTenderResultProceedingWebsite(notice) || "",
    contractName: getTenderResultContractName(notice) || "",
    outcomeStatus: getTenderResultOutcomeStatus(notice) || "",
    offersCount: getTenderResultOffersCount(notice) || "",
    contractors,
  };
  return JSON.stringify(payload);
};

const buildSnapshotMap = (results) => {
  const map = new Map();
  if (!Array.isArray(results)) return map;
  results.forEach((notice) => {
    const key = getNoticeKey(notice);
    if (!key) return;
    map.set(key, buildNoticeFingerprint(notice));
  });
  return map;
};

const updateDeltaMap = (items) => {
  if (!previousSnapshot || previousSnapshot.size === 0) return;
  items.forEach((notice) => {
    const key = getNoticeKey(notice);
    if (!key) return;
    const prev = previousSnapshot.get(key);
    if (!prev) {
      deltaMap.set(key, "new");
      return;
    }
    const next = buildNoticeFingerprint(notice);
    if (prev !== next) {
      deltaMap.set(key, "updated");
    }
  });
};

const getNoticeDeltaStatus = (notice) => {
  const key = getNoticeKey(notice);
  return key ? deltaMap.get(key) || "" : "";
};

const mapValue = (map, value) => {
  if (!value) return "";
  if (!map || map.size === 0) return value;
  const label = map.get(value);
  return label ? `${value} - ${label}` : value;
};

const mapLabel = (map, value) => {
  if (!value) return "";
  if (!map || map.size === 0) return value;
  return map.get(value) || value;
};

const formatCpv = (value) => {
  if (!value) return "";
  return String(value)
    .split(",")
    .map((part) => {
      let text = part.trim();
      // Try lookup if it looks like just a code (no parentheses)
      if (!text.includes("(")) {
        const normalized = text.replace(/\s/g, "");
        const label =
          dictionaries.cpv.get(normalized) ||
          dictionaries.cpv.get(normalized.replace(/-/g, ""));
        if (label) text = `${text} - ${label}`;
      }
      return `<span class="cpv-tag">${escapeHtml(text)}</span>`;
    })
    .join(" ");
};

const summarizeCpv = (value) => {
  const codes = parseCpvInput(value);
  if (!codes.length) return String(value || "").trim();
  const mapped = codes.map((code) => {
    const normalized = String(code || "").replace(/\s/g, "");
    const label =
      dictionaries.cpv.get(normalized) ||
      dictionaries.cpv.get(normalized.replace(/-/g, ""));
    return label ? `${code} - ${label}` : code;
  });
  const limit = 2;
  if (mapped.length <= limit) return mapped.join(", ");
  return `${mapped.slice(0, limit).join(", ")} +${mapped.length - limit}`;
};

const compareSet = new Set();
const compareFab = document.getElementById("compare-fab");
const compareModal = document.getElementById("compare-modal");
const compareContent = document.getElementById("compare-content");
const compareClose = document.getElementById("compare-modal-close");

const toggleCompareSelection = (index) => {
  if (compareSet.has(index)) {
    compareSet.delete(index);
  } else {
    if (compareSet.size >= 2) {
      const message =
        translations[currentLang]?.compareLimit ||
        "You can only compare 2 notices at a time.";
      alert(message);
      // Revert checkbox visual if possible, or force re-render
      // Simple way: prevent adding
      const checkboxes = document.querySelectorAll(`.notice-select[data-index="${index}"]`);
      checkboxes.forEach(cb => cb.checked = false);
      return;
    }
    compareSet.add(index);
  }
  updateCompareFab();
};

const updateCompareFab = () => {
  if (!compareFab) return;
  const count = compareSet.size;
  const template =
    translations[currentLang]?.compareFabLabel || "Compare ({count})";
  compareFab.textContent = formatTemplate(template, { count });
  compareFab.hidden = count < 2; // Show only when 2 are selected ? Or allow 1? Typically compare needs 2.
};

const openCompareView = () => {
  if (compareSet.size !== 2) return;
  const [idx1, idx2] = Array.from(compareSet);
  const n1 = lastResults[idx1];
  const n2 = lastResults[idx2];

  if (!n1 || !n2) return;

  // Simple key-value diff or side-by-side rendering
  // Let's do side-by-side
  const keys = new Set([...Object.keys(n1), ...Object.keys(n2)]);
  // Filter out irrelevant keys for display
  const ignore = ["htmlBody", "contractors"];

  let html = "";

  // Header
  html += `
    <div class="compare-column">
      <h3>${n1.noticeNumber || "Notice A"}</h3>
    </div>
    <div class="compare-column">
       <h3>${n2.noticeNumber || "Notice B"}</h3>
    </div>
  `;

  // Fields
  keys.forEach(key => {
    if (ignore.includes(key)) return;
    const v1 = n1[key];
    const v2 = n2[key];
    const isDiff = JSON.stringify(v1) !== JSON.stringify(v2);
    const style = isDiff ? "background:#fff3cd" : "";

    html += `
      <div class="compare-column" style="${style}">
        <div class="compare-row">
           <strong>${key}</strong>
           <span>${typeof v1 === 'object' ? JSON.stringify(v1) : v1}</span>
        </div>
      </div>
      <div class="compare-column" style="${style}">
        <div class="compare-row">
           <strong>${key}</strong>
           <span>${typeof v2 === 'object' ? JSON.stringify(v2) : v2}</span>
        </div>
      </div>
    `;
  });

  compareContent.innerHTML = html;

  // Add styling for grid flow
  // Wait, grid-template is 1fr 1fr. so we need to wrap pairs? 
  // Actually, simplest is to render full object A in col 1, full object B in col 2.
  // But strictly aligned rows are better.

  // Revised Loop
  const strings = translations[currentLang] || {};
  const leftLabel = strings.compareLeftLabel || "Left";
  const rightLabel = strings.compareRightLabel || "Right";
  let leftCol = `<h3>${n1.noticeNumber || leftLabel}</h3>`;
  let rightCol = `<h3>${n2.noticeNumber || rightLabel}</h3>`;

  Array.from(keys).sort().forEach(key => {
    if (ignore.includes(key)) return;
    const v1 = n1[key] !== undefined ? n1[key] : "—";
    const v2 = n2[key] !== undefined ? n2[key] : "—";
    const val1Str = typeof v1 === 'object' ? JSON.stringify(v1) : String(v1);
    const val2Str = typeof v2 === 'object' ? JSON.stringify(v2) : String(v2);

    const isDiff = val1Str !== val2Str;
    const bg = isDiff ? "background:#fff9c4;" : "";

    leftCol += `
        <div class="compare-row" style="${bg}">
          <strong>${key}</strong>
          <span>${val1Str}</span>
        </div>
      `;
    rightCol += `
         <div class="compare-row" style="${bg}">
          <strong>${key}</strong>
          <span>${val2Str}</span>
        </div>
      `;
  });

  compareContent.innerHTML = `
    <div class="compare-column">${leftCol}</div>
    <div class="compare-column">${rightCol}</div>
  `;

  compareModal.classList.add("is-open");
};

if (compareFab) {
  compareFab.addEventListener("click", openCompareView);
}
if (compareClose) {
  compareClose.addEventListener("click", () => compareModal.classList.remove("is-open"));
}

const buildNoticeCardLabels = () => {
  const strings = translations[currentLang] || {};
  const raw = {
    loadPreviewButton: strings.loadPreviewButton || "Load Preview",
    fullPageButton: strings.fullPageButton || "Full page",
    copyJsonButton: strings.copyJsonButton || "Copy JSON",
    copyObjectIdButton: strings.copyObjectIdButton || "Copy Object ID",
    copyNoticeNumberButton: strings.copyNoticeNumberButton || "Copy Notice number",
    bookmarkTooltip: strings.bookmarkTooltip || "Toggle bookmark",
    noticeTypeLabel: strings.noticeTypeLabel || "Notice type",
    clientTypeLabel: strings.clientTypeLabel || "Client type",
    orderTypeLabel: strings.orderTypeLabel || "Order type",
    tenderTypeLabel: strings.tenderTypeLabel || "Tender type",
    contractValueLabel: strings.contractValueLabel || "Contract value",
    contractNameLabel: strings.contractNameLabel || "Contract name",
    outcomeStatusLabel: strings.outcomeStatusLabel || "Outcome",
    outcomeBasisLabel: strings.outcomeBasisLabel || "Legal basis",
    outcomeReasonLabel: strings.outcomeReasonLabel || "Cancellation reason",
    offersCountLabel: strings.offersCountLabel || "Offers received",
    proceedingWebsiteLabel:
      strings.proceedingWebsiteLabel || "Proceeding website",
    bzpNumberLabel: strings.bzpNumberLabel || "BZP number",
    publicationLabel: strings.publicationLabel || "Publication",
    organizationLabel: strings.organizationLabel || "Organization",
    cityLabel: strings.cityLabel || "City",
    provinceLabel: strings.provinceLabel || "Province",
    cpvLabel: strings.cpvLabel || "CPV",
    tenderIdLabel: strings.tenderIdLabel || "Tender ID",
    objectIdLabel: strings.objectIdLabel || "Object ID",
    linksLabel: strings.linksLabel || "Links",
    contractorsLabel: strings.contractorsLabel || "Contractors",
    viewProceeding: strings.viewProceeding || "View Proceeding",
    viewNotice: strings.viewNotice || "View Notice",
    viewTender: strings.viewTender || "View Tender",
  };

  return {
    raw,
    escaped: {
      loadPreviewButton: escapeHtml(raw.loadPreviewButton),
      fullPageButton: escapeHtml(raw.fullPageButton),
      copyJsonButton: escapeHtml(raw.copyJsonButton),
      copyObjectIdButton: escapeHtml(raw.copyObjectIdButton),
      copyNoticeNumberButton: escapeHtml(raw.copyNoticeNumberButton),
      bookmarkTooltip: escapeHtml(raw.bookmarkTooltip),
    },
  };
};

const buildNoticeSearchText = (notice) => {
  if (!notice) return "";
  const contractors = Array.isArray(notice.contractors)
    ? notice.contractors
      .map((contractor) => contractor.contractorName)
      .filter(Boolean)
    : [];
  const noticeTypeLabel = mapValue(dictionaries.noticeType, notice.noticeType);
  const tenderResultValue = getTenderResultValue(notice);
  const tenderProceedingWebsite = getTenderResultProceedingWebsite(notice);
  const tenderContractName = getTenderResultContractName(notice);
  const tenderOutcomeStatus = getTenderResultOutcomeStatus(notice);
  const tenderOffersCount = getTenderResultOffersCount(notice);
  const title = notice.noticeNumber || noticeTypeLabel || "Notice";
  return [
    title,
    noticeTypeLabel,
    notice.noticeType,
    notice.noticeNumber,
    notice.organizationName,
    notice.organizationCity,
    notice.organizationProvince,
    notice.cpvCode,
    notice.tenderId,
    notice.objectId,
    notice.bzpNumber,
    tenderResultValue,
    tenderProceedingWebsite,
    tenderContractName,
    tenderOutcomeStatus,
    tenderOffersCount,
    ...contractors,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getNoticeSearchText = (notice) => {
  if (!notice) return "";
  if (typeof notice._searchText === "string") return notice._searchText;
  const text = buildNoticeSearchText(notice);
  notice._searchText = text;
  return text;
};

const buildNoticeCard = (notice, index, showHtml, labels) => {
  const labelSet = labels || noticeCardLabels || buildNoticeCardLabels();
  const rawLabels = labelSet.raw;
  const escapedLabels = labelSet.escaped;
  const noticeTypeLabel = mapValue(dictionaries.noticeType, notice.noticeType);
  const title = notice.noticeNumber || noticeTypeLabel || "Notice";
  let htmlBody = "";
  if (showHtml && notice.htmlBody) {
    htmlBody = `
      <div class="notice-html-preview-area" data-index="${index}">
        <button type="button" class="secondary notice-load-preview" data-index="${index}">
          ${escapedLabels.loadPreviewButton}
        </button>
      </div>
    `;
  }
  const contractors = Array.isArray(notice.contractors)
    ? notice.contractors
      .map((contractor) => contractor.contractorName)
      .filter(Boolean)
    : [];
  const tenderResultValue = getTenderResultValue(notice);
  const tenderProceedingWebsite = getTenderResultProceedingWebsite(notice);
  const tenderContractName = getTenderResultContractName(notice);
  const tenderOutcomeStatus = getTenderResultOutcomeStatus(notice);
  const tenderOutcomeBasis = getTenderResultOutcomeBasis(notice);
  const tenderOutcomeReason = getTenderResultOutcomeReason(notice);
  const tenderOffersCount = getTenderResultOffersCount(notice);
  const outcomeTooltipParts = [];
  if (tenderOutcomeBasis) {
    outcomeTooltipParts.push(
      `${rawLabels.outcomeBasisLabel}: ${tenderOutcomeBasis}`
    );
  }
  if (tenderOutcomeReason) {
    outcomeTooltipParts.push(
      `${rawLabels.outcomeReasonLabel}: ${tenderOutcomeReason}`
    );
  }
  const outcomeTooltip = outcomeTooltipParts.join(" | ");
  const isProceedingWebsiteUrl = /^(https?:\/\/|www\.)/i.test(
    tenderProceedingWebsite
  );
  const tenderProceedingWebsiteHref = isProceedingWebsiteUrl
    ? tenderProceedingWebsite.startsWith("http")
      ? tenderProceedingWebsite
      : `https://${tenderProceedingWebsite}`
    : "";

  const searchText = getNoticeSearchText(notice);

  const actionButtons = [];
  if (notice.htmlBody) {
    actionButtons.push(
      `<button type="button" class="secondary notice-expand" data-index="${index}">
        ${escapedLabels.fullPageButton}
      </button>`
    );
  }
  actionButtons.push(
    `<button type="button" class="secondary notice-action notice-copy" data-action="json" data-index="${index}">
      ${escapedLabels.copyJsonButton}
    </button>`
  );
  if (notice.objectId) {
    actionButtons.push(
      `<button type="button" class="secondary notice-action notice-copy" data-action="objectId" data-index="${index}">
        ${escapedLabels.copyObjectIdButton}
      </button>`
    );
  }
  if (notice.noticeNumber) {
    actionButtons.push(
      `<button type="button" class="secondary notice-action notice-copy" data-action="noticeNumber" data-index="${index}">
        ${escapedLabels.copyNoticeNumberButton}
      </button>`
    );
  }
  const actionsMarkup = actionButtons.length
    ? `<div class="notice-actions">${actionButtons.join("")}</div>`
    : "";

  const bookmarkId = getBookmarkId(notice);
  const isBookmarked = bookmarkId ? bookmarks.has(bookmarkId) : false;
  const bookmarkBtn = `
    <button type="button" class="bookmark-btn ${isBookmarked ? "active" : ""}" data-id="${bookmarkId}" title="${escapedLabels.bookmarkTooltip}">
      ${isBookmarked ? "★" : "☆"}
    </button>
  `;

  const isSelected = compareSet.has(index);
  const deltaStatus = deltaMode ? getNoticeDeltaStatus(notice) : "";
  const deltaBadge = deltaStatus
    ? `<span class="notice-badge ${deltaStatus}">${escapeHtml(
      deltaStatus === "new"
        ? translations[currentLang]?.deltaNew || "New"
        : translations[currentLang]?.deltaUpdated || "Updated"
    )}</span>`
    : "";
  const noticeDetailsUrl = buildNoticeDetailsUrl(notice.objectId);
  const safeNoticeDetailsUrl = escapeHtml(noticeDetailsUrl);
  const processingDetailsUrl = buildProcessingDetailsUrl(notice.tenderId);
  const safeProcessingDetailsUrl = escapeHtml(processingDetailsUrl);
  const linkIcon = `
    <svg class="notice-link-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M10.6 13.4a1 1 0 0 0 1.4 1.4l4.95-4.95a3 3 0 1 0-4.25-4.25l-2.1 2.1a1 1 0 0 0 1.4 1.4l2.1-2.1a1 1 0 1 1 1.42 1.42l-4.95 4.95z"/>
      <path d="M8.05 18.95a3 3 0 0 1-4.25-4.25l4.95-4.95a1 1 0 1 1 1.4 1.4l-4.95 4.95a1 1 0 1 0 1.42 1.42l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1z"/>
    </svg>
  `;
  const docIcon = `
    <svg class="notice-link-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8 1H7v17h11V9h-4V4z"/>
    </svg>
  `;
  const idIcon = `
    <svg class="notice-link-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M3 7a4 4 0 0 1 4-4h6a4 4 0 0 1 0 8H7a4 4 0 0 1-4-4zm4-2a2 2 0 0 0 0 4h6a2 2 0 0 0 0-4H7zm4 10h6a4 4 0 1 1 0 8h-6a4 4 0 1 1 0-8zm0 2a2 2 0 1 0 0 4h6a2 2 0 1 0 0-4h-6z"/>
    </svg>
  `;
  const linkItems = [];
  if (isProceedingWebsiteUrl && tenderProceedingWebsiteHref) {
    linkItems.push({
      href: tenderProceedingWebsiteHref,
      label: rawLabels.viewProceeding,
      text: tenderProceedingWebsite,
      icon: linkIcon,
    });
  }
  if (noticeDetailsUrl) {
    linkItems.push({
      href: noticeDetailsUrl,
      label: rawLabels.viewNotice,
      text: notice.objectId || safeNoticeDetailsUrl,
      icon: docIcon,
    });
  }
  if (processingDetailsUrl) {
    linkItems.push({
      href: processingDetailsUrl,
      label: rawLabels.viewTender,
      text: notice.tenderId || safeProcessingDetailsUrl,
      icon: idIcon,
    });
  }
  const linksMarkup = linkItems.length
    ? `<div class="notice-links">${linkItems
        .map(
          (item) => `<a class="notice-action-link" href="${escapeHtml(
            item.href
          )}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(
            item.label
          )}">
          ${item.icon}
          <div class="notice-link-content">
             <span class="notice-link-title">${escapeHtml(item.label)}</span>
             <span class="notice-link-value">${escapeHtml(item.text)}</span>
          </div>
        </a>`
        )
        .join("")}</div>`
    : "";

  return `
    <article class="notice-card" data-search="${escapeHtml(
      searchText
    )}" data-index="${index}" data-id="${bookmarkId}">
      <div class="notice-header">
        <div class="notice-header-top">
           <div class="notice-id-group">
              <input type="checkbox" class="notice-select" data-index="${index}" ${
    isSelected ? "checked" : ""
  }>
              <span class="notice-id">${escapeHtml(
                notice.bzpNumber || notice.noticeNumber || "N/A"
              )}</span>
              ${
                notice.bzpNumber || notice.noticeNumber
                  ? `<button type="button" class="copy-id-btn" data-id="${escapeHtml(
                      notice.bzpNumber || notice.noticeNumber
                    )}" title="Copy ID">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>`
                  : ""
              }
           </div>
           <div class="notice-badges">
              ${deltaBadge}
              <span class="notice-badge type">${escapeHtml(
                noticeTypeLabel
              )}</span>
           </div>
           ${bookmarkBtn}
        </div>
        <h3 class="notice-title">${escapeHtml(title)}</h3>
      </div>

      <div class="notice-body">
         <div class="notice-info-grid">
            <div class="notice-info-item">
               <span class="label">${rawLabels.organizationLabel}</span>
               <span class="value">${escapeHtml(
                 notice.organizationName || "-"
               )}</span>
            </div>
            <div class="notice-info-item">
               <span class="label">${rawLabels.cityLabel}</span>
               <span class="value">${escapeHtml(
                 notice.organizationCity || "-"
               )}</span>
            </div>
             <div class="notice-info-item">
               <span class="label">${rawLabels.publicationLabel}</span>
               <span class="value">${formatDate(notice.publicationDate)}</span>
            </div>
            <div class="notice-info-item">
               <span class="label">${rawLabels.contractValueLabel}</span>
               <span class="value">${escapeHtml(
                 tenderResultValue || "-"
               )}</span>
            </div>
            <div class="notice-info-item full-width">
               <span class="label">${rawLabels.cpvLabel}</span>
               <span class="value">${formatCpv(notice.cpvCode)}</span>
            </div>
         </div>

         <details class="notice-details">
            <summary>More Details</summary>
            <div class="notice-details-grid">
               ${metaRow(
                 rawLabels.clientTypeLabel,
                 mapValue(dictionaries.clientType, notice.clientType)
               )}
               ${metaRow(
                 rawLabels.orderTypeLabel,
                 mapValue(dictionaries.orderType, notice.orderType)
               )}
               ${metaRow(
                 rawLabels.tenderTypeLabel,
                 mapValue(dictionaries.tenderType, notice.tenderType)
               )}
               ${(() => {
                 const trimmed = truncateWithTooltip(tenderContractName, 200);
                 return metaRowWithTooltip(
                   rawLabels.contractNameLabel,
                   trimmed.display,
                   trimmed.tooltip
                 );
               })()}
               ${metaRowWithTooltip(
                 rawLabels.outcomeStatusLabel,
                 tenderOutcomeStatus,
                 outcomeTooltip
               )}
               ${metaRow(rawLabels.offersCountLabel, tenderOffersCount)}
               ${metaRow(
                 rawLabels.provinceLabel,
                 mapValue(dictionaries.province, notice.organizationProvince)
               )}
               ${
                 contractors.length
                   ? metaRow(
                       rawLabels.contractorsLabel,
                       contractors.join(", ")
                     )
                   : ""
               }
            </div>
         </details>
      </div>

      <div class="notice-footer">
         ${linksMarkup}
         ${actionsMarkup}
      </div>
      ${htmlBody}
    </article>
  `;
};

const renderSkeletons = (count = 10) => {
  const safeCount = Math.min(count, 20);
  const skeletons = Array.from({ length: safeCount })
    .map(() => '<article class="notice-card skeleton"></article>')
    .join("");
  ensureNoticeContainers();
  const listEl =
    noticeListEl && resultsEl.contains(noticeListEl) ? noticeListEl : resultsEl;
  listEl.innerHTML = skeletons;
};

const renderStatsSkeleton = () => {
  const summaryCards = Array.from({ length: 3 })
    .map(() => '<div class="stat-card skeleton"></div>')
    .join("");
  const legendLines = Array.from({ length: 6 })
    .map((_, index) => {
      const width = 70 + (index % 3) * 10;
      return `<div class="skeleton skeleton-line" style="width:${width}%"></div>`;
    })
    .join("");
  resultsEl.innerHTML = `
    <div class="stats-dashboard">
      <div class="stats-summary-grid">
        ${summaryCards}
      </div>
      <div class="stats-chart-container">
        <div class="chart-wrapper skeleton skeleton-block"></div>
        <div class="chart-legend">
          ${legendLines}
        </div>
      </div>
      <div class="stats-table-container skeleton skeleton-block"></div>
    </div>
  `;
  noticeAnalyticsEl = null;
  noticeListEl = null;
};

const CHART_COLORS = [
  "#ee6c4d",
  "#3d5a80",
  "#98c1d9",
  "#e0fbfc",
  "#293241",
  "#f4a261",
  "#2a9d8f",
  "#e9c46a",
];

const renderStats = (items, { append = false } = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    if (!append) {
      renderEmpty();
    }
    return;
  }

  // Aggregate data
  const total = items.reduce(
    (acc, item) => acc + (item.numberOfNotices || 0),
    0
  );

  if (total === 0) {
    renderEmpty();
    return;
  }

  // Analytics Calculations
  const sortedItems = [...items].sort((a, b) => (b.numberOfNotices || 0) - (a.numberOfNotices || 0));
  const topItem = sortedItems[0];
  const activeCategories = items.filter(i => i.numberOfNotices > 0).length;

  const topLabel = mapValue(dictionaries.noticeType, topItem?.noticeType) || topItem?.noticeType || "N/A";

  // Summary Cards HTML
  const summaryHtml = `
    <div class="stats-summary-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${formatNumber(total)}</div>
        <div class="stat-label">${translations[currentLang]?.statsTotalNotices || "Total Notices"}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${formatNumber(topItem?.numberOfNotices || 0)}</div>
        <div class="stat-label">${translations[currentLang]?.statsTopCategory || "Top Category"}: <br><small>${escapeHtml(topLabel)}</small></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📑</div>
        <div class="stat-value">${formatNumber(activeCategories)}</div>
        <div class="stat-label">${translations[currentLang]?.statsActiveCategories || "Active Categories"}</div>
      </div>
    </div>
  `;

  // Chart Logic (Donut)
  let currentAngle = 0;
  const slices = items.map((item, i) => {
    const value = item.numberOfNotices || 0;
    const percentage = value / total;
    return {
      ...item,
      value,
      percentage,
      color: CHART_COLORS[i % CHART_COLORS.length],
      label: mapValue(dictionaries.noticeType, item.noticeType) || item.noticeType,
    };
  }).sort((a, b) => b.value - a.value);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const svgSegments = slices.map((slice) => {
    const strokeLength = slice.percentage * circumference;
    const offset = accumulatedPercent * circumference;
    const dashArray = `${strokeLength} ${circumference}`;
    const dashOffset = -1 * offset;
    accumulatedPercent += slice.percentage;
    return `<circle cx="50" cy="50" r="${radius}" fill="none" stroke="${slice.color}" stroke-width="20" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" />`;
  }).join("");

  const legendItems = slices.map(slice => `
    <div class="legend-item">
      <div class="legend-color" style="background: ${slice.color}"></div>
      <div class="legend-info">
        <div class="legend-label">${escapeHtml(slice.label)}</div>
      </div>
      <div class="legend-count">${formatNumber(slice.value)}</div>
    </div>
  `).join("");

  // Detailed Table HTML
  const tableRows = slices.map(slice => `
    <tr>
      <td><span class="legend-color" style="display:inline-block;background:${slice.color};margin-right:8px;"></span>${escapeHtml(slice.label)}</td>
      <td class="text-right">${formatNumber(slice.value)}</td>
      <td class="text-right">${formatPercent(slice.percentage, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
    </tr>
  `).join("");

  const tableHtml = `
    <div class="stats-table-container">
      <table class="stats-table">
        <thead>
          <tr>
            <th>${translations[currentLang]?.statsTableNoticeType || "Notice Type"}</th>
            <th class="text-right">${translations[currentLang]?.statsTableCount || "Count"}</th>
            <th class="text-right">${translations[currentLang]?.statsTableShare || "Share"}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  const html = `
    <div class="stats-dashboard">
      ${summaryHtml}
      <div class="stats-chart-container">
        <div class="chart-wrapper">
          <svg viewBox="0 0 100 100" class="pie-chart">
            ${svgSegments}
            <text x="50" y="50" text-anchor="middle" dy="0.3em" font-size="12" font-weight="bold" fill="#333">
              ${formatNumber(total)}
            </text>
          </svg>
        </div>
        <div class="chart-legend">
          ${legendItems}
        </div>
      </div>
      ${tableHtml}
    </div>
  `;

  resultsEl.innerHTML = html;
  noticeAnalyticsEl = null;
  noticeListEl = null;
  updateResultsMeta();
  applyStatsCollapsed();
};

const getFilterTerm = () => {
  return filterInput ? filterInput.value.trim().toLowerCase() : "";
};

const getFilterTermRaw = () => {
  return filterInput ? filterInput.value.trim() : "";
};

const buildRegex = (pattern) => {
  const trimmed = String(pattern || "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
    const lastSlash = trimmed.lastIndexOf("/");
    const body = trimmed.slice(1, lastSlash);
    const flags = trimmed.slice(lastSlash + 1) || "";
    return new RegExp(body, flags || "i");
  }
  return new RegExp(trimmed, "i");
};

const matchFieldValue = (value, filter) => {
  if (!filter) return true;
  const target = String(value || "");
  const query = filter.value;
  const mode = filter.mode;
  if (!query) return true;
  if (mode === "exact") {
    return target.toLowerCase() === query.toLowerCase();
  }
  if (mode === "regex") {
    try {
      const regex = buildRegex(query);
      if (!regex) return true;
      return regex.test(target);
    } catch (err) {
      return false;
    }
  }
  return target.toLowerCase().includes(query.toLowerCase());
};

const getFieldFilterMatchers = () => {
  const filters = getFieldFilters();
  const errors = [];
  ["noticeNumber", "orgName"].forEach((key) => {
    const filter = filters[key];
    if (!filter || filter.mode !== "regex") return;
    try {
      buildRegex(filter.value);
    } catch (err) {
      errors.push(key);
    }
  });
  if (errors.length) {
    const errorKey = errors.join(",");
    if (lastRegexWarning !== errorKey) {
      const strings = translations[currentLang] || {};
      const message =
        strings.regexInvalid || "Invalid regex pattern for match mode.";
      setStatusMessage(message, "error");
      lastRegexWarning = errorKey;
    }
  } else {
    lastRegexWarning = "";
  }
  return filters;
};

const renderRecentFilters = () => {
  if (!recentFiltersEl || !recentFiltersChips) return;
  const filters = readRecentFilters();
  if (!filters.length) {
    recentFiltersEl.hidden = true;
    recentFiltersChips.innerHTML = "";
    return;
  }
  recentFiltersEl.hidden = false;
  recentFiltersChips.innerHTML = filters
    .map(
      (term) =>
        `<button type="button" class="chip is-subtle recent-filter-chip" data-value="${escapeHtml(
          term
        )}">${escapeHtml(term)}</button>`
    )
    .join("");
};

const addRecentFilter = (term) => {
  const cleaned = String(term || "").trim();
  if (!cleaned) return [];
  const existing = readRecentFilters();
  const next = [cleaned, ...existing.filter((item) => item !== cleaned)];
  return writeRecentFilters(next);
};

const maybeStoreRecentFilter = (term) => {
  const cleaned = String(term || "").trim();
  if (!cleaned || cleaned.length < 2) return;
  if (!Array.isArray(lastResults) || lastResults.length === 0) return;
  if (cleaned.toLowerCase() === lastSavedFilterTerm.toLowerCase()) return;
  const updated = addRecentFilter(cleaned);
  if (updated.length) {
    lastSavedFilterTerm = cleaned;
    renderRecentFilters();
  }
};

const applyFilterToCard = (card, term) => {
  if (!card) return;
  if (!term) {
    card.hidden = false;
    return;
  }
  const haystack = card.dataset.search || "";
  card.hidden = !haystack.includes(term);
};

const checkFilterMatch = (haystack, term) => {
  if (!term) return true;
  return String(haystack || "").includes(term);
};

const prepareNoticeContainers = () => {
  if (!resultsEl) return;
  resultsEl.innerHTML = `
    <div class="notice-analytics" id="notice-analytics"></div>
    <div class="notice-list" id="notice-list"></div>
  `;
  noticeAnalyticsEl = document.getElementById("notice-analytics");
  noticeListEl = document.getElementById("notice-list");
};

const ensureNoticeContainers = () => {
  if (!resultsEl) return;
  if (!noticeListEl || !resultsEl.contains(noticeListEl)) {
    prepareNoticeContainers();
  }
};

const renderNoticesAsync = (items, { append = false, startIndex = 0 } = {}) => {
  renderToken += 1;
  const token = renderToken;
  if (!Array.isArray(items) || items.length === 0) {
    if (!append) {
      renderEmpty();
    }
    return;
  }

  const showHtml = htmlToggle ? htmlToggle.checked : true;
  const listEl =
    noticeListEl && resultsEl.contains(noticeListEl) ? noticeListEl : resultsEl;
  if (!append) {
    listEl.innerHTML = "";
  } else {
    const empty = listEl.querySelector(".empty");
    if (empty) {
      listEl.innerHTML = "";
    }
  }

  const cardLabels = noticeCardLabels || buildNoticeCardLabels();
  let index = 0;
  const batchSize = 12;
  const step = () => {
    if (token !== renderToken) return;
    if (index >= items.length) {
      updateResultsMeta();
      updateResultsActions();
      return;
    }
    const endIndex = Math.min(index + batchSize, items.length);
    let markup = "";
    for (let i = index; i < endIndex; i += 1) {
      markup += buildNoticeCard(
        items[i],
        startIndex + i,
        showHtml,
        cardLabels
      );
    }
    const template = document.createElement("template");
    template.innerHTML = markup;
    const fragment = template.content;
    const filterTerm = getFilterTermRaw().toLowerCase();
    Array.from(fragment.children).forEach((card) => {
      applyFilterToCard(card, filterTerm);
    });
    listEl.appendChild(fragment);
    observeNoticePreviews();
    index = endIndex;
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const loadNoticePreview = (placeholder) => {
  if (!placeholder || placeholder.dataset.loaded) return;
  const index = Number(placeholder.dataset.index);
  if (Number.isNaN(index)) return;
  const notice = lastResults[index];
  if (!notice || !notice.htmlBody) return;
  const frame = document.createElement("iframe");
  frame.className = "notice-html";
  frame.setAttribute("sandbox", "");
  frame.setAttribute("loading", "lazy");
  frame.srcdoc = notice.htmlBody || "";
  placeholder.dataset.loaded = "true";
  placeholder.replaceWith(frame);
};

const observeNoticePreviews = () => {
  if (!htmlToggle || !htmlToggle.checked) {
    if (previewObserver) {
      previewObserver.disconnect();
    }
    return;
  }
  if (typeof IntersectionObserver === "undefined") return;
  if (!previewObserver) {
    previewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (previewObserver) {
            previewObserver.unobserve(entry.target);
          }
          loadNoticePreview(entry.target);
        });
      },
      { rootMargin: "200px" }
    );
  }
  document.querySelectorAll(".notice-html-preview-area").forEach((placeholder) => {
    if (placeholder.dataset.loaded) return;
    if (placeholder.dataset.observing) return;
    placeholder.dataset.observing = "true";
    previewObserver.observe(placeholder);
  });
};

const metaRow = (label, value, isHtml = false) => {
  if (!value) return "";
  const content = isHtml ? value : escapeHtml(value);
  return `<span><strong>${escapeHtml(label)}:</strong> ${content}</span>`;
};

const metaRowWithTooltip = (label, value, tooltip, isHtml = false) => {
  if (!value) return "";
  const content = isHtml ? value : escapeHtml(value);
  const title = tooltip ? ` title="${escapeHtml(tooltip)}"` : "";
  return `<span${title}><strong>${escapeHtml(label)}:</strong> ${content}</span>`;
};

const truncateWithTooltip = (value, maxLength = 200) => {
  const text = String(value ?? "");
  if (text.length <= maxLength) {
    return { display: text, tooltip: "" };
  }
  return { display: `${text.slice(0, maxLength)}…`, tooltip: text };
};

const formatContractValue = (value) => {
  if (!value) return "";
  const match = value.match(/(\d[\d\s]*)([.,]\d+)?/);
  if (!match) return value;
  const [full, integerPart, decimalPart = ""] = match;
  const digits = integerPart.replace(/\s+/g, "");
  if (digits.length <= 3) return value;
  const fractionDigits = decimalPart ? decimalPart.length - 1 : 0;
  const normalized = `${digits}${decimalPart ? `.${decimalPart.slice(1)}` : ""}`;
  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number)) return value;
  const formatted = formatNumber(number, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return value.replace(full, formatted);
};

const getTenderResultValue = (notice) => {
  if (!notice || notice.noticeType !== "TenderResultNotice") return "";
  if (!notice.htmlBody) return "";
  if (typeof notice._tenderResultValue === "string") {
    return notice._tenderResultValue;
  }
  let value = "";
  try {
    const doc = new DOMParser().parseFromString(notice.htmlBody, "text/html");
    const text = doc.body?.textContent || "";
    const normalized = text.replace(/\s+/g, " ").trim();
    const match = normalized.match(
      /8\.2\.\)\s*Wartość umowy\/umowy ramowej:\s*(.+?)(?=8\.3\.\)|$)/i
    );
    if (match) value = formatContractValue(match[1].trim());
  } catch (error) {
    value = "";
  }
  notice._tenderResultValue = value;
  return value;
};

const getTenderResultText = (notice) => {
  if (!notice || notice.noticeType !== "TenderResultNotice") return "";
  if (!notice.htmlBody) return "";
  if (typeof notice._tenderResultText === "string") {
    return notice._tenderResultText;
  }
  let value = "";
  try {
    const doc = new DOMParser().parseFromString(notice.htmlBody, "text/html");
    value = doc.body?.textContent || "";
    value = value.replace(/\s+/g, " ").trim();
  } catch (error) {
    value = "";
  }
  notice._tenderResultText = value;
  return value;
};

const getTenderResultProceedingWebsite = (notice) => {
  if (!notice || notice.noticeType !== "TenderResultNotice") return "";
  if (!notice.htmlBody) return "";
  if (typeof notice._tenderProceedingWebsite === "string") {
    return notice._tenderProceedingWebsite;
  }
  let value = "";
  try {
    const doc = new DOMParser().parseFromString(notice.htmlBody, "text/html");
    const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();
    const label =
      "Adres strony internetowej prowadzonego postępowania:";
    const lowerLabel = label.toLowerCase();
    const cells = Array.from(doc.querySelectorAll("td, th"));
    const labelCell = cells.find((cell) =>
      normalize(cell.textContent).toLowerCase().startsWith(lowerLabel)
    );
    if (labelCell) {
      const row = labelCell.closest("tr");
      const rowCells = row ? Array.from(row.children) : [];
      const index = rowCells.indexOf(labelCell);
      if (index >= 0 && rowCells[index + 1]) {
        value = normalize(rowCells[index + 1].textContent);
      }
    }
    if (!value) {
      const text = normalize(doc.body?.textContent || "");
      const labelIndex = text.toLowerCase().indexOf(lowerLabel);
      if (labelIndex !== -1) {
        const rest = text.slice(labelIndex + label.length).trim();
        const nextLabelMatch = rest.match(
          /\s[A-ZĄĆĘŁŃÓŚŹŻ][^:]{0,80}:\s/
        );
        value = nextLabelMatch
          ? rest.slice(0, nextLabelMatch.index).trim()
          : rest;
      }
    }
    if (value) {
      const urlMatch =
        value.match(/https?:\/\/\S+/i) || value.match(/\bwww\.\S+/i);
      if (urlMatch) {
        value = urlMatch[0].replace(/[),.;]+$/, "");
      }
    }
  } catch (error) {
    value = "";
  }
  notice._tenderProceedingWebsite = value;
  return value;
};

const extractTenderResultLabelValue = (notice, labels, cacheKey) => {
  if (!notice || notice.noticeType !== "TenderResultNotice") return "";
  if (typeof notice[cacheKey] === "string") return notice[cacheKey];
  const text = getTenderResultText(notice);
  if (!text) {
    notice[cacheKey] = "";
    return "";
  }
  const lowerText = text.toLowerCase();
  const nextLabelPattern =
    /(?:^|\s)\d+\.\d+(?:\.\d+)?\.\)\s*|(?:^|\s)SEKCJA\s*/i;
  let value = "";
  for (const label of labels) {
    const needle = label.toLowerCase();
    const index = lowerText.indexOf(needle);
    if (index === -1) continue;
    const rest = text.slice(index + label.length).trim();
    const withoutColon = rest.replace(/^:\s*/, "");
    const nextIndex = withoutColon.search(nextLabelPattern);
    value = nextIndex !== -1
      ? withoutColon.slice(0, nextIndex).trim()
      : withoutColon.trim();
    break;
  }
  notice[cacheKey] = value;
  return value;
};

const getTenderResultContractName = (notice) =>
  extractTenderResultLabelValue(
    notice,
    [
      "2.3.) Nazwa zamówienia albo umowy ramowej:",
      "2.3.) Nazwa zamówienia albo umowy ramowej",
    ],
    "_tenderContractName"
  );

const getTenderResultOutcomeStatus = (notice) =>
  extractTenderResultLabelValue(
    notice,
    [
      "5.1.) Postępowanie zakończyło się zawarciem umowy albo unieważnieniem postępowania:",
      "5.1.) Postępowanie zakończyło się zawarciem umowy albo unieważnieniem postępowania",
    ],
    "_tenderOutcomeStatus"
  );

const getTenderResultOutcomeBasis = (notice) =>
  extractTenderResultLabelValue(
    notice,
    [
      "5.2.) Podstawa prawna unieważnienia postępowania:",
      "5.2.) Podstawa prawna unieważnienia postępowania",
    ],
    "_tenderOutcomeBasis"
  );

const getTenderResultOutcomeReason = (notice) =>
  extractTenderResultLabelValue(
    notice,
    [
      "5.2.1.) Przyczyna unieważnienia postępowania:",
      "5.2.1.) Przyczyna unieważnienia postępowania",
    ],
    "_tenderOutcomeReason"
  );

const getTenderResultOffersCount = (notice) =>
  extractTenderResultLabelValue(
    notice,
    [
      "7.2.1.) Liczba otrzymanych ofert:",
      "6.1.) Liczba otrzymanych ofert:",
      "5.5.) Liczba otrzymanych ofert:",
      "Liczba otrzymanych ofert:",
    ],
    "_tenderOffersCount"
  );



const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return getDateTimeFormatter({
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const getNoticeTitle = (notice) => {
  const mappedType = mapValue(dictionaries.noticeType, notice?.noticeType);
  return (
    notice?.noticeNumber ||
    mappedType ||
    translations[currentLang]?.modalTitleFallback ||
    "Notice"
  );
};

const openHtmlModal = (notice, index = null) => {
  if (!modalEl || !modalFrame) return;
  if (index !== null && !Number.isNaN(Number(index))) {
    currentModalIndex = Number(index);
  } else {
    currentModalIndex = null;
  }
  const title = getNoticeTitle(notice);
  if (modalTitle) {
    modalTitle.textContent = title;
  }
  modalFrame.srcdoc = notice?.htmlBody || "";
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeHtmlModal = () => {
  if (!modalEl || !modalFrame) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  modalFrame.srcdoc = "";
  document.body.style.overflow = "";
  currentModalIndex = null;
};

const getVisibleResultCount = () => {
  const cards = resultsEl.querySelectorAll(".notice-card, .stats-card");
  if (!cards.length) return 0;
  return Array.from(cards).filter((card) => !card.hidden).length;
};

const updateResultsMeta = () => {
  if (!resultsMetaEl) return;
  const strings = translations[currentLang] || {};
  if (!lastQueryMeta) {
    resultsMetaEl.textContent =
      strings.resultsMetaIdle || "Run a query to see summary.";
    return;
  }
  const endpointLabel =
    lastQueryMeta.endpoint === "stats"
      ? strings.toggleStats || "Stats"
      : strings.toggleNotices || "Notices";
  const fromLabel = lastQueryMeta.from
    ? formatDate(lastQueryMeta.from)
    : strings.metaNone || "n/a";
  const toLabel = lastQueryMeta.to
    ? formatDate(lastQueryMeta.to)
    : strings.metaNone || "n/a";
  const total = Array.isArray(lastResults) ? lastResults.length : 0;
  const visible = getVisibleResultCount();
  const formattedTotal = formatNumber(total);
  const formattedVisible = formatNumber(visible);
  const resultCount =
    visible < total ? `${formattedVisible} / ${formattedTotal}` : formattedTotal;

  const segments = [
    `${strings.metaEndpoint || "Endpoint"}: ${endpointLabel}`,
    `${strings.metaDate || "Date window"}: ${fromLabel} - ${toLabel}`,
  ];

  if (lastQueryMeta.endpoint === "notice") {
    const pageSizeValue = lastQueryMeta.pageSize;
    const pageSizeLabel = pageSizeValue
      ? formatNumber(pageSizeValue)
      : strings.metaNone || "n/a";
    segments.push(`${strings.metaPageSize || "PageSize"}: ${pageSizeLabel}`);
  }

  segments.push(`${strings.metaResults || "Results"}: ${resultCount}`);
  resultsMetaEl.textContent = segments.join(" · ");
};

const buildSummaryChips = () => {
  if (!lastQueryState || !lastQueryMeta) return [];
  const strings = translations[currentLang] || {};
  const fields = lastQueryState.fields || {};
  const modes = getMatchModes();
  const modeLabels = {
    contains: strings.matchContains || "Contains",
    exact: strings.matchExact || "Exact",
    regex: strings.matchRegex || "Regex",
  };
  const noticeNumberValue = inputs.noticeNumber
    ? inputs.noticeNumber.value.trim()
    : fields.noticeNumber || "";
  const orgNameValue = inputs.orgName
    ? inputs.orgName.value.trim()
    : fields.orgName || "";
  const chips = [];
  const noneLabel = strings.metaNone || "n/a";

  const fromLabel = lastQueryMeta.from ? formatDate(lastQueryMeta.from) : noneLabel;
  const toLabel = lastQueryMeta.to ? formatDate(lastQueryMeta.to) : noneLabel;
  chips.push({
    label: strings.metaDate || "Date window",
    value: `${fromLabel} - ${toLabel}`,
  });

  if (fields.noticeType) {
    chips.push({
      label: strings.noticeTypeLabel || strings.noticeType || "Notice type",
      value: mapLabel(dictionaries.noticeType, fields.noticeType),
    });
  }

  if (lastQueryState.endpoint === "notice" && fields.pageSize) {
    chips.push({
      label: strings.metaPageSize || "PageSize",
      value: fields.pageSize,
    });
  }

  if (noticeNumberValue) {
    const mode = modes.noticeNumber || DEFAULT_MATCH_MODE;
    const modeSuffix = mode !== "exact" ? ` (${modeLabels[mode] || mode})` : "";
    chips.push({
      label: `${strings.noticeNumber || "NoticeNumber"}${modeSuffix}`,
      value: noticeNumberValue,
    });
  }
  if (fields.clientType) {
    chips.push({
      label: strings.clientTypeLabel || strings.clientType || "Client type",
      value: mapLabel(dictionaries.clientType, fields.clientType),
    });
  }
  if (fields.orderType) {
    chips.push({
      label: strings.orderTypeLabel || strings.orderType || "Order type",
      value: mapLabel(dictionaries.orderType, fields.orderType),
    });
  }
  if (fields.tenderType) {
    chips.push({
      label: strings.tenderTypeLabel || strings.tenderType || "Tender type",
      value: mapLabel(dictionaries.tenderType, fields.tenderType),
    });
  }
  if (fields.orderObject) {
    chips.push({
      label: strings.orderObject || "OrderObject",
      value: fields.orderObject,
    });
  }
  if (fields.cpvCode) {
    chips.push({
      label: strings.cpvLabel || strings.cpvCode || "CPV",
      value: summarizeCpv(fields.cpvCode),
    });
  }
  if (orgNameValue) {
    const mode = modes.orgName || DEFAULT_MATCH_MODE;
    const modeSuffix = mode !== "exact" ? ` (${modeLabels[mode] || mode})` : "";
    chips.push({
      label: `${strings.organizationLabel || strings.orgName || "Organization"}${modeSuffix}`,
      value: orgNameValue,
    });
  }
  if (fields.orgCity) {
    chips.push({
      label: strings.cityLabel || strings.orgCity || "City",
      value: fields.orgCity,
    });
  }
  if (fields.orgProvince) {
    chips.push({
      label: strings.provinceLabel || strings.orgProvince || "Province",
      value: mapLabel(dictionaries.province, fields.orgProvince),
    });
  }
  if (fields.searchAfter) {
    chips.push({
      label: strings.searchAfter || "SearchAfter",
      value: fields.searchAfter,
    });
  }

  const filterTerm = getFilterTermRaw();
  if (filterTerm) {
    chips.push({
      label: strings.filterChipLabel || "Filter",
      value: filterTerm,
      isFlag: true,
    });
  }
  if (bookmarksToggle?.checked) {
    chips.push({
      label: strings.bookmarksOnlyChip || "Bookmarks only",
      value: "",
      isFlag: true,
    });
  }
  if (deltaMode) {
    chips.push({
      label: strings.deltaChip || "Changes",
      value: "",
      isFlag: true,
    });
  }
  if (infiniteMode) {
    chips.push({
      label: strings.autoLoadChip || "Auto-load",
      value: "",
      isFlag: true,
    });
  }

  return chips;
};

const renderFilterChip = ({ label, value, isFlag }) => {
  const parts = [];
  if (label) {
    const suffix = value ? ":" : "";
    parts.push(`<strong>${escapeHtml(label)}${suffix}</strong>`);
  }
  if (value) {
    parts.push(`<span>${escapeHtml(value)}</span>`);
  }
  const flagClass = isFlag ? " is-flag" : "";
  return `<span class="filter-chip${flagClass}">${parts.join(" ")}</span>`;
};

const updateQuerySummary = () => {
  if (!resultsSticky || !querySummaryEl) return;
  if (!lastQueryMeta) {
    resultsSticky.hidden = true;
    return;
  }
  const strings = translations[currentLang] || {};
  const chips = buildSummaryChips();
  resultsSticky.hidden = false;
  if (!chips.length) {
    const empty =
      strings.querySummaryEmpty || "No active filters for this query.";
    querySummaryEl.innerHTML = `<span class="query-summary-empty">${escapeHtml(
      empty
    )}</span>`;
  } else {
    querySummaryEl.innerHTML = chips.map(renderFilterChip).join("");
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.disabled = false;
  }
};

const scheduleResultsFilter = () => {
  if (filterDebounceTimer) {
    clearTimeout(filterDebounceTimer);
  }
  filterDebounceTimer = setTimeout(() => {
    filterDebounceTimer = null;
    applyResultsFilter();
  }, 200);
};

const applyResultsFilter = () => {
  if (filterDebounceTimer) {
    clearTimeout(filterDebounceTimer);
    filterDebounceTimer = null;
  }
  const showBookmarksOnly = bookmarksToggle ? bookmarksToggle.checked : false;
  const termRaw = getFilterTermRaw();
  const term = termRaw.toLowerCase();
  const fieldFilters = getFieldFilterMatchers();
  const cards = resultsEl.querySelectorAll(".notice-card, .stats-card");

  if (!cards.length) {
    updateResultsMeta();
    updateQuerySummary();
    return;
  }

  cards.forEach((card) => {
    let visible = true;
    if (showBookmarksOnly) {
      const id = card.getAttribute("data-id");
      if (!id || !bookmarks.has(id)) {
        visible = false;
      }
    }
    const index = Number(card.dataset.index);
    const notice =
      lastEndpoint === "notice" && Number.isFinite(index)
        ? lastResults[index]
        : null;
    if (visible && notice) {
      if (!matchFieldValue(notice.noticeNumber, fieldFilters.noticeNumber)) {
        visible = false;
      }
    }
    if (visible && notice) {
      if (!matchFieldValue(notice.organizationName, fieldFilters.orgName)) {
        visible = false;
      }
    }
    if (visible && term) {
      const haystack = notice ? getNoticeSearchText(notice) : "";
      visible = checkFilterMatch(haystack, term);
    }
    card.hidden = !visible;
    card.style.display = visible ? "" : "none";
  });
  updateResultsMeta();
  updateQuerySummary();
  maybeStoreRecentFilter(termRaw);
  renderNoticeAnalytics();
};

const getAnalyticsSourceResults = () => {
  if (lastEndpoint !== "notice" || !Array.isArray(lastResults)) return [];
  const term = getFilterTermRaw().toLowerCase();
  const fieldFilters = getFieldFilterMatchers();
  return lastResults.filter((notice) => {
    if (!notice) return false;
    if (bookmarksToggle?.checked) {
      const id = getBookmarkId(notice);
      if (!id || !bookmarks.has(id)) return false;
    }
    if (!matchFieldValue(notice.noticeNumber, fieldFilters.noticeNumber)) {
      return false;
    }
    if (!matchFieldValue(notice.organizationName, fieldFilters.orgName)) {
      return false;
    }
    if (term && !getNoticeSearchText(notice).includes(term)) return false;
    return true;
  });
};

const countBy = (items, getKey) => {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
};

const countByMultiple = (items, getKeys) => {
  const map = new Map();
  items.forEach((item) => {
    const keys = getKeys(item);
    if (!Array.isArray(keys)) return;
    keys.forEach((key) => {
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
  });
  return map;
};

const toTopList = (map, limit = 5) => {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const formatCount = (value) => {
  return formatNumber(Number(value || 0));
};

const getDateKey = (value, mode) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (mode === "weekly") {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
    const weekLabel = String(week).padStart(2, "0");
    const year = temp.getUTCFullYear();
    return { key: `${year}-W${weekLabel}`, sort: `${year}-${weekLabel}` };
  }
  return { key: date.toISOString().slice(0, 10), sort: date.toISOString().slice(0, 10) };
};

const buildTimeSeries = (items, mode) => {
  const map = new Map();
  items.forEach((notice) => {
    const info = getDateKey(notice.publicationDate, mode);
    if (!info) return;
    map.set(info.key, (map.get(info.key) || 0) + 1);
  });
  const series = Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const maxPoints = 14;
  return series.slice(-maxPoints);
};

const parseContractValueNumber = (value) => {
  const cleaned = String(value || "")
    .replace(/[^\d,.\s]/g, "")
    .trim();
  if (!cleaned) return null;
  let normalized = cleaned.replace(/\s/g, "");
  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastDot > lastComma) {
      normalized = normalized.replace(/,/g, "");
    } else {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    }
  } else if (lastComma !== -1) {
    normalized = normalized.replace(/,/g, (match, index) =>
      index === lastComma ? "." : ""
    );
  } else {
    normalized = normalized.replace(/,/g, "");
  }
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : null;
};

const computeStats = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  const avg = sum / sorted.length;
  const percentile = (p) => {
    const idx = Math.floor((p / 100) * (sorted.length - 1));
    return sorted[idx];
  };
  const median = percentile(50);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    median,
    p90: percentile(90),
    p95: percentile(95),
  };
};

const renderBarList = (items, formatLabel) => {
  if (!items.length) return "";
  const max = Math.max(...items.map((item) => item.count), 1);
  return `
    <div class="bar-list">
      ${items
      .map((item) => {
        const label = formatLabel ? formatLabel(item.key) : item.key;
        const width = (item.count / max) * 100;
        return `
            <div class="bar-item">
              <span class="bar-label">${escapeHtml(label)}</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%"></div>
              </div>
              <span class="bar-value">${formatCount(item.count)}</span>
            </div>
          `;
      })
      .join("")}
    </div>
  `;
};

const renderTimeSeries = (series) => {
  if (!series.length) return "";
  const max = Math.max(...series.map((point) => point.count), 1);
  return `
    <div class="series-chart">
      ${series
      .map((point) => {
        const height = (point.count / max) * 100;
        return `
            <div class="series-bar" style="height:${height}%" title="${escapeHtml(
          `${point.key}: ${formatCount(point.count)}`
        )}">
              <span>${escapeHtml(point.key)}</span>
            </div>
          `;
      })
      .join("")}
    </div>
  `;
};

const renderNoticeAnalytics = () => {
  if (!noticeAnalyticsEl || lastEndpoint !== "notice") return;
  const analyticsEnabled = analyticsToggle ? analyticsToggle.checked : true;
  noticeAnalyticsEl.hidden = !analyticsEnabled;
  if (!analyticsEnabled) return;
  const strings = translations[currentLang] || {};
  const items = getAnalyticsSourceResults();
  const total = items.length;
  if (!total) {
    noticeAnalyticsEl.innerHTML = `
      <div class="analytics-card">
        <h4>${escapeHtml(strings.analyticsTitle || "Analytics")}</h4>
        <p class="field-hint">${strings.analyticsEmpty || "Run a query to see analytics."
      }</p>
      </div>
    `;
    return;
  }

  const cpvCounts = countByMultiple(items, (notice) =>
    parseCpvInput(notice.cpvCode)
  );
  const topCpv = toTopList(cpvCounts, 5);
  const topProvinces = toTopList(
    countBy(items, (notice) => notice.organizationProvince || ""),
    5
  );
  const topClientTypes = toTopList(
    countBy(items, (notice) => notice.clientType || ""),
    5
  );
  const topOrgs = toTopList(
    countBy(items, (notice) => notice.organizationName || ""),
    5
  );

  const series = buildTimeSeries(items, timeSeriesMode);

  const valueItems = items
    .map((notice) => {
      const valueStr = getTenderResultValue(notice);
      const value = parseContractValueNumber(valueStr);
      return value ? { notice, value } : null;
    })
    .filter(Boolean);
  const values = valueItems.map((item) => item.value);
  const valueStats = computeStats(values);
  const topValues = [...valueItems]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const orgRepeats = toTopList(
    countBy(items, (notice) => notice.organizationName || ""),
    5
  );

  const qualityFields = [
    { key: "organizationProvince", labelKey: "qualityProvince" },
    { key: "cpvCode", labelKey: "qualityCpv" },
    { key: "tenderType", labelKey: "qualityTenderType" },
    { key: "orderType", labelKey: "qualityOrderType" },
    { key: "clientType", labelKey: "qualityClientType" },
  ];

  const qualityItems = qualityFields.map((field) => {
    const missing = items.filter((notice) => !notice[field.key]).length;
    const ratio = total ? missing / total : 0;
    return {
      label: strings[field.labelKey] || field.key,
      ratio,
      missing,
    };
  });

  const cpvLabel = (code) => {
    const label =
      dictionaries.cpv.get(code) ||
      dictionaries.cpv.get(String(code).replace(/-/g, "")) ||
      "";
    return label ? `${code} - ${label}` : code;
  };

  noticeAnalyticsEl.innerHTML = `
    <div class="analytics-header">
      <h3 class="analytics-title">${strings.analyticsTitle || "Analytics"
    } · ${formatCount(total)} ${strings.analyticsNoticeLabel || "notices"
    }</h3>
      <div class="analytics-controls">
        <span class="analytics-subtitle">${strings.timeSeriesLabel || "Time series"
    }</span>
        <button type="button" class="chip ${timeSeriesMode === "daily" ? "is-active" : ""
    }" data-series="daily">${strings.timeSeriesDaily || "Daily"
    }</button>
        <button type="button" class="chip ${timeSeriesMode === "weekly" ? "is-active" : ""
    }" data-series="weekly">${strings.timeSeriesWeekly || "Weekly"
    }</button>
      </div>
    </div>
    <div class="analytics-grid">
      <div class="analytics-card">
        <h4>${strings.analyticsTopCpv || "Top CPV codes"}</h4>
        ${renderBarList(topCpv, cpvLabel)}
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsTopProvinces || "Top provinces"}</h4>
        ${renderBarList(topProvinces, (value) =>
      mapValue(dictionaries.province, value)
    )}
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsTopClients || "Top client types"}</h4>
        ${renderBarList(topClientTypes, (value) =>
      mapValue(dictionaries.clientType, value)
    )}
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsTopOrgs || "Top organizations"}</h4>
        ${renderBarList(topOrgs, (value) => value)}
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsTimeSeries || "Notice volume"}</h4>
        ${renderTimeSeries(series)}
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsContractStats || "Contract value stats"}</h4>
        ${valueStats
      ? `
              <div class="stat-line"><span>${strings.analyticsMin || "Min"}</span><strong>${formatCount(
        Math.round(valueStats.min)
      )}</strong></div>
              <div class="stat-line"><span>${strings.analyticsMedian || "Median"}</span><strong>${formatCount(
        Math.round(valueStats.median)
      )}</strong></div>
              <div class="stat-line"><span>${strings.analyticsAvg || "Avg"}</span><strong>${formatCount(
        Math.round(valueStats.avg)
      )}</strong></div>
              <div class="stat-line"><span>${strings.analyticsP90 || "P90"}</span><strong>${formatCount(
        Math.round(valueStats.p90)
      )}</strong></div>
              <div class="stat-line"><span>${strings.analyticsP95 || "P95"}</span><strong>${formatCount(
        Math.round(valueStats.p95)
      )}</strong></div>
            `
      : `<p class="field-hint">${strings.analyticsNoValues || "No contract values detected."
      }</p>`
    }
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsQuality || "Data quality"}</h4>
        <div class="quality-list">
          ${qualityItems
      .map((item) => {
        const percent = Math.round(item.ratio * 100);
        const percentLabel =
          formatPercent(item.ratio, { maximumFractionDigits: 0 }) ||
          `${percent}%`;
        return `
                <div class="quality-item">
                  <strong>${escapeHtml(item.label)}</strong>
                  <div class="quality-bar">
                    <div class="quality-fill" style="width:${percent}%"></div>
                  </div>
                  <span>${percentLabel}</span>
                </div>
              `;
      })
      .join("")}
        </div>
      </div>
      <div class="analytics-card">
        <h4>${strings.analyticsOutliers || "Outliers"}</h4>
        <div class="outlier-list">
          ${topValues
      .map((item) => {
        const title =
          item.notice.noticeNumber ||
          item.notice.organizationName ||
          strings.modalTitleFallback ||
          "Notice";
        return `
                <div class="outlier-item">
                  <span>${escapeHtml(title)}</span>
                  <strong>${formatCount(Math.round(item.value))}</strong>
                </div>
              `;
      })
      .join("")}
        </div>
        <div class="outlier-list" style="margin-top:12px;">
          ${orgRepeats
      .map(
        (item) => `
                <div class="outlier-item">
                  <span>${escapeHtml(item.key)}</span>
                  <strong>${formatCount(item.count)}</strong>
                </div>
              `
      )
      .join("")}
        </div>
      </div>
    </div>
  `;
};
const getPageSize = () => {
  const value = Number.parseInt(inputs.pageSize.value, 10);
  if (!Number.isFinite(value) || value <= 0) return 50;
  return Math.min(Math.max(value, 1), 500);
};

const updatePaginationUI = () => {
  if (!paginationEl) return;
  const isNotice = getEndpoint() === "notice";
  const hasResults = Array.isArray(lastResults) && lastResults.length > 0;
  const pageSize = paginationState.pageSize || getPageSize();
  const totalPages = pageSize ? Math.ceil(lastResults.length / pageSize) : 0;
  const current = paginationState.currentPage || 1;

  const showPagination = isNotice && !infiniteMode;
  paginationEl.style.display = showPagination ? "flex" : "none";
  if (paginationBottomEl) {
    paginationBottomEl.style.display = showPagination ? "flex" : "none";
  }

  const hasPrev = hasResults && current > 1 && !isFetching;
  const hasNext =
    hasResults &&
    !isFetching &&
    (current < totalPages || paginationState.hasMore);

  if (pagePrevBtn) pagePrevBtn.disabled = !hasPrev;
  if (pagePrevBtnBottom) pagePrevBtnBottom.disabled = !hasPrev;

  if (pageNextBtn) pageNextBtn.disabled = !hasNext;
  if (pageNextBtnBottom) pageNextBtnBottom.disabled = !hasNext;

  if (pageInput) {
    pageInput.disabled = !hasResults;
    pageInput.value = hasResults ? String(current) : "1";
  }
  if (pageInputBottom) {
    pageInputBottom.disabled = !hasResults;
    pageInputBottom.value = hasResults ? String(current) : "1";
  }

  if (pageGoBtn) pageGoBtn.disabled = !hasResults || isFetching;
  if (pageGoBtnBottom) pageGoBtnBottom.disabled = !hasResults || isFetching;

  const infoText = (() => {
    const strings = translations[currentLang] || {};
    if (!hasResults) return strings.pageInfoEmpty || "Page 0";
    const start = (current - 1) * pageSize + 1;
    const end = Math.min(current * pageSize, lastResults.length);
    const template =
      strings.pageInfoTemplate ||
      "Page {page} · Showing {start}-{end} (loaded {loaded})";
    return formatTemplate(template, {
      page: formatNumber(current),
      start: formatNumber(start),
      end: formatNumber(end),
      loaded: formatNumber(lastResults.length),
    });
  })();

  if (pageInfoEl) pageInfoEl.textContent = infoText;
  if (pageInfoBottom) pageInfoBottom.textContent = infoText;
};

const resetPagination = () => {
  paginationState.currentPage = 1;
  paginationState.pageSize = getPageSize();
  paginationState.hasMore = true;
  paginationState.nextCursor = inputs.searchAfter.value.trim();
  updatePaginationUI();
};

const renderNoticePage = (page) => {
  const pageSize = paginationState.pageSize || getPageSize();
  ensureNoticeContainers();
  renderNoticeAnalytics();
  if (infiniteMode) {
    renderNoticesAsync(lastResults, { append: false, startIndex: 0 });
    return;
  }
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const slice = lastResults.slice(startIndex, endIndex);
  renderNoticesAsync(slice, { append: false, startIndex });
};

const isActiveToken = (token) => token === activeQueryToken;

const ensureController = () => {
  if (!activeController) {
    activeController = new AbortController();
  }
  return activeController;
};

const startNewQuery = () => {
  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  activeQueryToken += 1;
  return activeQueryToken;
};

const abortActiveRequest = (silent = false) => {
  if (!activeController) return false;
  activeController.abort();
  activeController = null;
  activeQueryToken += 1;
  isFetching = false;
  updateResultsActions();
  if (!silent) {
    setStatusKey("statusCancelled", "ok");
  }
  return true;
};

const setFetching = (value, token) => {
  if (token && !isActiveToken(token)) return;
  isFetching = value;
  updateResultsActions();
};

const scrollToResults = () => {
  const target = resultsPanel || resultsEl;
  if (!target || typeof target.scrollIntoView !== "function") return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.requestAnimationFrame(() => {
    window.scrollBy({ top: 80, behavior: "smooth" });
  });
};

const fetchNextNoticePage = async (token) => {
  const endpoint = getEndpoint();
  if (endpoint !== "notice") return [];
  const requestToken = token || activeQueryToken;
  if (!isActiveToken(requestToken)) return [];
  const cursor = paginationState.nextCursor;
  const url = buildApiUrl(endpoint, {
    searchAfterOverride: cursor,
    pageSizeOverride: paginationState.pageSize || getPageSize(),
  });

  setStatusKey("statusFetching", "pending");
  setFetching(true, requestToken);
  const shouldSkeleton =
    !infiniteMode || !Array.isArray(lastResults) || lastResults.length === 0;
  if (shouldSkeleton) {
    renderSkeletons(paginationState.pageSize || getPageSize());
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: ensureController().signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Request failed (${response.status}). ${body}`);
    }

    const data = await response.json();
    if (!isActiveToken(requestToken)) return [];
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) {
      paginationState.hasMore = false;
      setStatusKey("statusNoMore", "ok");
      return [];
    }

    const merged = mergeNoticeResults(lastResults, items);
    lastResults = merged.merged;
    updateDeltaMap(items);
    const lastObjectId = items[items.length - 1]?.objectId;
    if (lastObjectId) {
      paginationState.nextCursor = lastObjectId;
      inputs.searchAfter.value = lastObjectId;
      scheduleSessionSave();
    }
    if (items.length < paginationState.pageSize) {
      paginationState.hasMore = false;
    }
    setStatusKey("statusReceived", "ok", { count: items.length });
    return items;
  } catch (err) {
    if (err?.name === "AbortError") {
      if (isActiveToken(requestToken)) {
        setStatusKey("statusCancelled", "ok");
      }
      return [];
    }
    const prefix = translations[currentLang]?.statusError || "Error";
    setStatusMessage(`${prefix}: ${err.message}`, "error");
    paginationState.hasMore = false;
    return [];
  } finally {
    setFetching(false, requestToken);
  }
};

const autoLoadNextPage = async () => {
  if (!infiniteMode) return;
  if (autoLoadInFlight || isFetching) return;
  if (getEndpoint() !== "notice") return;
  if (!paginationState.hasMore) {
    setInfiniteStatus("autoLoadStatusNoMore");
    return;
  }
  if (autoLoadCapped || autoLoadPages >= AUTO_LOAD_MAX_PAGES) {
    autoLoadCapped = true;
    setInfiniteStatus("autoLoadStatusLimit", { max: AUTO_LOAD_MAX_PAGES });
    return;
  }

  autoLoadInFlight = true;
  const nextPage = autoLoadPages + 1;
  setInfiniteStatus("autoLoadStatusLoading", { page: nextPage }, { loading: true });

  const items = await fetchNextNoticePage(activeQueryToken);
  if (items.length) {
    autoLoadPages += 1;
    renderNoticesAsync(items, {
      append: true,
      startIndex: lastResults.length - items.length,
    });
    renderNoticeAnalytics();
  }

  if (!paginationState.hasMore) {
    setInfiniteStatus("autoLoadStatusNoMore");
  } else if (autoLoadPages >= AUTO_LOAD_MAX_PAGES) {
    autoLoadCapped = true;
    setInfiniteStatus("autoLoadStatusLimit", { max: AUTO_LOAD_MAX_PAGES });
  } else {
    setInfiniteStatus("autoLoadStatusReady", {
      pages: autoLoadPages,
      max: AUTO_LOAD_MAX_PAGES,
    });
  }

  autoLoadInFlight = false;
};

const goToPage = async (page) => {
  if (getEndpoint() !== "notice") return;
  if (infiniteMode) return;
  const target = Number.parseInt(page, 10);
  if (!Number.isFinite(target) || target < 1) return;
  if (isFetching) return;

  const queryToken = activeQueryToken;
  const pageSize = paginationState.pageSize || getPageSize();
  const neededEnd = target * pageSize;
  while (lastResults.length < neededEnd && paginationState.hasMore) {
    if (!isActiveToken(queryToken)) return;
    const items = await fetchNextNoticePage(queryToken);
    if (!items.length) break;
  }
  if (!isActiveToken(queryToken)) return;

  const maxPage = Math.max(1, Math.ceil(lastResults.length / pageSize));
  paginationState.currentPage = Math.min(target, maxPage);
  renderNoticePage(paginationState.currentPage);
  updateResultsMeta();
  updateResultsActions();
};

const applyStatsCollapsed = () => {
  const isStats = getEndpoint() === "stats";
  if (resultsEl) {
    resultsEl.classList.toggle("is-collapsed", isStats && statsCollapsed);
  }
  if (statsToggleBtn) {
    const strings = translations[currentLang] || {};
    const hasResults = Array.isArray(lastResults) && lastResults.length > 0;
    statsToggleBtn.hidden = !isStats || !hasResults;
    statsToggleBtn.textContent = statsCollapsed
      ? strings.statsExpand || "Expand stats"
      : strings.statsCollapse || "Collapse stats";
  }
};

const setStatsCollapsed = (value) => {
  statsCollapsed = Boolean(value);
  writeStatsCollapsed(statsCollapsed);
  applyStatsCollapsed();
};

const setInfiniteStatus = (key, params = {}, { loading = false } = {}) => {
  if (!infiniteStatusEl) return;
  const strings = translations[currentLang] || {};
  const template = strings[key] || key;
  const message = formatTemplate(template, params);
  const spinner = loading ? '<span class="spinner"></span>' : "";
  infiniteStatusEl.innerHTML = `${spinner}<span>${escapeHtml(message)}</span>`;
  infiniteStatusEl.hidden = false;
};

const hideInfiniteStatus = () => {
  if (infiniteStatusEl) {
    infiniteStatusEl.hidden = true;
    infiniteStatusEl.textContent = "";
  }
};

const updateInfiniteUI = () => {
  const isNotice = getEndpoint() === "notice";
  if (infiniteToggle) {
    infiniteToggle.disabled = !isNotice;
  }
  if (deltaToggle) {
    deltaToggle.disabled = !isNotice;
  }
  if (infiniteSentinel) {
    infiniteSentinel.hidden = !(isNotice && infiniteMode);
  }
  if (!isNotice || !infiniteMode) {
    hideInfiniteStatus();
  }
};

const setupInfiniteObserver = () => {
  if (!infiniteSentinel) return;
  if (infiniteObserver) {
    infiniteObserver.disconnect();
  }
  infiniteObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          autoLoadNextPage();
        }
      });
    },
    { rootMargin: "200px" }
  );
  infiniteObserver.observe(infiniteSentinel);
};

const setInfiniteMode = (value) => {
  const next = Boolean(value);
  infiniteMode = next;
  if (infiniteToggle) {
    infiniteToggle.checked = next;
  }
  autoLoadCapped = false;
  autoLoadPages = Array.isArray(lastResults) && lastResults.length
    ? Math.ceil(lastResults.length / (paginationState.pageSize || 1))
    : 0;
  updatePaginationUI();
  updateInfiniteUI();
  if (next) {
    setupInfiniteObserver();
    if (Array.isArray(lastResults) && lastResults.length) {
      renderNoticePage(1);
    }
    const maxLabel = AUTO_LOAD_MAX_PAGES;
    setInfiniteStatus("autoLoadStatusReady", {
      pages: autoLoadPages,
      max: maxLabel,
    });
  } else {
    if (infiniteObserver) {
      infiniteObserver.disconnect();
    }
    hideInfiniteStatus();
  }
  updateQuerySummary();
};

const setDeltaMode = (value) => {
  deltaMode = Boolean(value);
  if (deltaToggle) {
    deltaToggle.checked = deltaMode;
  }
  if (lastEndpoint === "notice" && Array.isArray(lastResults)) {
    renderNoticePage(paginationState.currentPage || 1);
  }
  updateQuerySummary();
};

const updateResultsActions = () => {
  if (copyUrlBtn) {
    copyUrlBtn.disabled = false;
  }
  if (copyLinkBtn) {
    copyLinkBtn.disabled = false;
  }
  const hasResults = Array.isArray(lastResults) && lastResults.length > 0;
  if (downloadBtn) {
    downloadBtn.disabled = !hasResults;
  }
  if (downloadCsvBtn) {
    downloadCsvBtn.disabled = !hasResults;
  }
  if (downloadTsvBtn) {
    downloadTsvBtn.disabled = !hasResults;
  }
  if (downloadXlsBtn) {
    downloadXlsBtn.disabled = !hasResults;
  }
  if (cancelBtn) {
    cancelBtn.disabled = !isFetching;
  }
  if (filterInput) {
    filterInput.disabled = !hasResults;
  }
  if (exportFilteredToggle) {
    exportFilteredToggle.disabled = !hasResults;
  }
  applyStatsCollapsed();
  updateInfiniteUI();
  updatePaginationUI();
};

const getDropdownOptions = (listId) => {
  if (dropdownCache.has(listId)) {
    return dropdownCache.get(listId);
  }
  const list = document.getElementById(listId);
  if (!list) return [];
  const options = Array.from(list.options).map((option) => ({
    value: option.value,
    label: option.label || "",
    tooltip: option.dataset.tooltip || option.title || "",
  }));
  // Do not cache here to avoid caching empty lists before load
  return options;
};

const parseMultiInput = (value) => {
  return String(value || "")
    .split(/[,;\n]+/)
    .map((token) => token.trim())
    .filter(Boolean);
};

const formatMultiInput = (currentValue, selectedValue) => {
  const tokens = parseMultiInput(currentValue);
  const next = String(selectedValue || "").trim();
  if (!next) return currentValue;
  if (tokens.length) {
    tokens[tokens.length - 1] = next;
  } else {
    tokens.push(next);
  }
  const unique = [];
  const seen = new Set();
  tokens.forEach((token) => {
    const key = token.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(token);
    }
  });
  return unique.join(", ");
};

const getDropdownQuery = (input) => {
  const raw = String(input?.value || "").trim();
  if (!raw) return "";
  if (input?.dataset?.multi === "true") {
    const parts = raw.split(/[,;\n]+/);
    return parts[parts.length - 1].trim().toLowerCase();
  }
  return raw.toLowerCase();
};

const buildDropdownMetaText = (query, shown, matches, total) => {
  const strings = translations[currentLang] || {};
  if (query) {
    const template =
      strings.dropdownCountMatches || "Showing {shown} of {matches} matches";
    return formatTemplate(template, { shown, matches, total });
  }
  const template = strings.dropdownCount || "Showing {shown} options";
  return formatTemplate(template, { shown, total });
};

const highlightMatch = (text, query) => {
  const raw = String(text ?? "");
  if (!query) return escapeHtml(raw);
  const lower = raw.toLowerCase();
  const needle = query.toLowerCase();
  if (!needle) return escapeHtml(raw);
  let result = "";
  let start = 0;
  let index = lower.indexOf(needle, start);
  while (index !== -1) {
    const before = raw.slice(start, index);
    const match = raw.slice(index, index + needle.length);
    result += `${escapeHtml(before)}<span class="dropdown-match">${escapeHtml(
      match
    )}</span>`;
    start = index + needle.length;
    index = lower.indexOf(needle, start);
  }
  result += escapeHtml(raw.slice(start));
  return result;
};

const renderDropdownMenu = (input, menu) => {
  const listId = input.dataset.list;
  if (!listId) return;
  const options = getDropdownOptions(listId);
  const query = getDropdownQuery(input);
  const filtered = options.filter((option) => {
    if (!query) return true;
    const combined = `${option.value} ${option.label}`.toLowerCase();
    return combined.includes(query);
  });
  const limited = filtered.slice(0, 60);
  const metaText = buildDropdownMetaText(
    query,
    limited.length,
    filtered.length,
    options.length
  );
  const metaHtml = `<div class="dropdown-meta">${escapeHtml(metaText)}</div>`;
  if (!limited.length) {
    const empty =
      translations[currentLang]?.dropdownEmpty || "No matches found.";
    menu.innerHTML =
      metaHtml +
      `<div class="dropdown-empty">${escapeHtml(empty)}</div>`;
    return;
  }
  menu.innerHTML =
    metaHtml +
    limited
      .map((option) => {
        const label = option.label
          ? `<span class="dropdown-label">${highlightMatch(
            option.label,
            query
          )}</span>`
          : "";
        const tooltip = option.tooltip
          ? ` title="${escapeHtml(option.tooltip)}"`
          : "";
        return `
        <button type="button" class="dropdown-item"${tooltip} data-value="${escapeHtml(
          option.value
        )}">
          <span class="dropdown-code">${highlightMatch(
          option.value,
          query
        )}</span>
          ${label}
        </button>
      `;
      })
      .join("");
};

const closeAllDropdowns = () => {
  document.querySelectorAll(".dropdown-menu.is-open").forEach((menu) => {
    menu.classList.remove("is-open");
  });
};

const positionDropdown = (input, menu) => {
  const rect = input.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const spaceBelow = viewportHeight - rect.bottom - 12;
  const spaceAbove = rect.top - 12;
  const useAbove = spaceBelow < 160 && spaceAbove > spaceBelow;

  menu.classList.toggle("is-up", useAbove);
  menu.style.maxHeight = `${Math.max(
    140,
    Math.min(320, useAbove ? spaceAbove : spaceBelow)
  )}px`;
};

const setupDropdowns = () => {
  const inputs = Array.from(document.querySelectorAll("input[data-list]"));
  inputs.forEach((input) => {
    if (input.dataset.dropdownReady) return;
    input.dataset.dropdownReady = "true";
    const menu = document.createElement("div");
    menu.className = "dropdown-menu";
    input.parentElement.appendChild(menu);

    const openMenu = async () => {
      if (input.disabled) return;
      closeAllDropdowns();
      const listId = input.dataset.list;
      if (listId) {
        const loaded = await ensureDictionaryLoaded(listId);
        if (!loaded || document.activeElement !== input) return;
      }
      renderDropdownMenu(input, menu);
      positionDropdown(input, menu);
      menu.classList.add("is-open");
    };

    input.addEventListener("focus", openMenu);
    input.addEventListener("input", openMenu);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menu.classList.remove("is-open");
      }
    });

    menu.addEventListener("mousedown", (event) => {
      const item = event.target.closest(".dropdown-item");
      if (!item) return;
      event.preventDefault();
      if (input.dataset.multi === "true") {
        if (input.dataset.tagsTarget) {
          addCpvValue(item.dataset.value || "");
          input.value = "";
          scheduleSessionSave();
        } else {
          input.value = formatMultiInput(input.value, item.dataset.value || "");
        }
      } else {
        input.value = item.dataset.value || "";
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      menu.classList.remove("is-open");
      input.focus();
    });

    input.addEventListener("blur", () => {
      setTimeout(() => menu.classList.remove("is-open"), 120);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.closest(".dropdown-menu") || target.closest("input[data-list]"))
      return;
    closeAllDropdowns();
  });
};

const setupClearButtons = () => {
  const strings = translations[currentLang] || {};
  document.querySelectorAll(".field").forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    if (!input) return;
    if (input.dataset.clearReady) return;
    if (input.classList.contains("autofill-trap")) return;
    if (input.type === "checkbox" || input.type === "radio") return;
    if (input.disabled || input.readOnly) return;

    const control = document.createElement("div");
    control.className = "field-control";
    input.parentNode.insertBefore(control, input);
    control.appendChild(input);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "clear-field";
    button.textContent = "×";
    button.dataset.clearTarget = input.id || "";
    button.setAttribute(
      "aria-label",
      strings.clearField || "Clear field"
    );
    control.appendChild(button);

    const toggleVisibility = () => {
      const hasValue = Boolean(input.value);
      button.hidden = !hasValue;
    };
    input.addEventListener("input", toggleVisibility);
    input.addEventListener("change", toggleVisibility);
    toggleVisibility();

    input.dataset.clearReady = "true";
  });
};

const updateClearButtonLabels = () => {
  const strings = translations[currentLang] || {};
  const label = strings.clearField || "Clear field";
  document.querySelectorAll(".clear-field").forEach((button) => {
    button.setAttribute("aria-label", label);
  });
};

const clearFieldValue = (input) => {
  if (!input) return;
  if (input.id === "cpv-code") {
    setCpvValues([]);
  } else if (input.tagName === "SELECT") {
    input.value = "";
  } else {
    input.value = "";
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const setupCpvTags = () => {
  const input = inputs.cpvCode;
  const tagsEl = getCpvTagsEl();
  if (!input || !tagsEl) return;

  const commitInput = () => {
    const values = parseCpvInput(input.value);
    if (!values.length) return;
    setCpvValues([...getCpvValues(), ...values]);
    input.value = "";
    clearSearchAfterIfNeeded();
    scheduleSessionSave();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "," || event.key === ";") {
      event.preventDefault();
      commitInput();
    }
  });

  input.addEventListener("input", () => {
    updateCpvFavoritesAddState();
  });

  tagsEl.addEventListener("click", (event) => {
    const button = event.target.closest(".cpv-tag-remove");
    if (!button) return;
    const tag = button.closest(".cpv-tag-input");
    if (!tag) return;
    removeCpvValue(tag.dataset.value || "");
    clearSearchAfterIfNeeded();
    scheduleSessionSave();
  });
};

const setupCpvFavorites = () => {
  if (cpvFavoritesAddBtn) {
    cpvFavoritesAddBtn.addEventListener("click", () => {
      const values = getCpvValues();
      if (!values.length) return;
      addCpvFavorites(values);
    });
  }
  if (cpvFavoritesList) {
    cpvFavoritesList.addEventListener("click", (event) => {
      const addBtn = event.target.closest(".cpv-favorite-add");
      if (addBtn) {
        const value = addBtn.dataset.value || "";
        if (value) {
          addCpvValue(value);
          clearSearchAfterIfNeeded();
          scheduleSessionSave();
        }
        return;
      }
      const removeBtn = event.target.closest(".cpv-favorite-remove");
      if (removeBtn) {
        const value = removeBtn.dataset.value || "";
        if (value) {
          removeCpvFavorite(value);
        }
      }
    });
  }
};

const hardenAutofill = () => {
  const targets = document.querySelectorAll("[data-no-autofill]");
  targets.forEach((input) => {
    const id = input.id || "field";
    const random = Math.random().toString(36).slice(2, 8);
    input.name = `${id}-${random}`;
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("data-form-type", "other");
    input.setAttribute("aria-autocomplete", "none");
  });
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (err) {
    copied = false;
  }
  textarea.remove();
  return copied;
};

const getExportResults = () => {
  const shouldFilter = Boolean(
    exportFilteredToggle?.checked && getFilterTerm()
  );
  if (!shouldFilter) return lastResults;
  const cards = resultsEl.querySelectorAll(".notice-card, .stats-card");
  if (!cards.length) return [];
  const indexes = Array.from(cards)
    .filter((card) => !card.hidden)
    .map((card) => Number(card.dataset.index))
    .filter((index) => Number.isFinite(index));
  return indexes.map((index) => lastResults[index]).filter(Boolean);
};

const buildNoticeExportRow = (notice) => {
  const contractors = Array.isArray(notice.contractors)
    ? notice.contractors
      .map((contractor) => contractor.contractorName)
      .filter(Boolean)
    : [];
  const tenderResultValue = getTenderResultValue(notice);
  const tenderProceedingWebsite = getTenderResultProceedingWebsite(notice);
  return {
    noticeType: notice.noticeType || "",
    noticeNumber: notice.noticeNumber || "",
    bzpNumber: notice.bzpNumber || "",
    publicationDate: notice.publicationDate || "",
    organizationName: notice.organizationName || "",
    organizationCity: notice.organizationCity || "",
    organizationProvince: notice.organizationProvince || "",
    clientType: notice.clientType || "",
    orderType: notice.orderType || "",
    tenderType: notice.tenderType || "",
    contractValue: tenderResultValue || "",
    proceedingWebsite: tenderProceedingWebsite || "",
    orderObject: notice.orderObject || "",
    cpvCode: notice.cpvCode || "",
    tenderId: notice.tenderId || "",
    objectId: notice.objectId || "",
    contractors: contractors.join("; "),
  };
};

const buildStatsExportRow = (item) => {
  return {
    noticeType: item.noticeType || "",
    numberOfNotices: item.numberOfNotices ?? 0,
  };
};

const applyExportColumns = (rows, columns) => {
  if (!Array.isArray(columns) || !columns.length) return rows;
  return rows.map((row) => {
    const next = {};
    columns.forEach((key) => {
      next[key] = Object.prototype.hasOwnProperty.call(row, key)
        ? row[key]
        : "";
    });
    return next;
  });
};

const buildDelimitedText = (rows, delimiter) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeValue = (value) => {
    const str = String(value ?? "");
    if (str.includes('"') || str.includes("\n") || str.includes(delimiter)) {
      return `"${str.replace(/\"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(delimiter)];
  rows.forEach((row) => {
    lines.push(headers.map((key) => escapeValue(row[key])).join(delimiter));
  });
  return lines.join("\n");
};

const buildHtmlTable = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
  html += '<head><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body>';
  html += "<table border='1'>";
  html += "<thead><tr>";
  headers.forEach((h) => {
    html += `<th style="background-color: #eee; font-weight: bold;">${escapeHtml(h)}</th>`;
  });
  html += "</tr></thead><tbody>";
  rows.forEach((row) => {
    html += "<tr>";
    headers.forEach((h) => {
      html += `<td>${escapeHtml(String(row[h] || ""))}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table></body></html>";
  return html;
};

const downloadResults = (format = "json") => {
  if (!Array.isArray(lastResults) || lastResults.length === 0) {
    setStatusKey("statusNoData", "error");
    return;
  }
  const endpoint = lastEndpoint || getEndpoint();
  const results = getExportResults();
  const filtered = exportFilteredToggle?.checked && getFilterTerm();
  if (!results.length) {
    setStatusKey(filtered ? "statusNoFiltered" : "statusNoData", "error");
    return;
  }
  const selectedColumns = getExportColumnSelection(endpoint);
  if (!selectedColumns.length) {
    setStatusKey("exportColumnsRequired", "error");
    return;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = filtered ? "-filtered" : "";
  let content = "";
  let mimeType = "application/json";
  let extension = "json";

  if (format === "csv" || format === "tsv") {
    const rowsRaw =
      endpoint === "stats"
        ? results.map((item) => buildStatsExportRow(item))
        : results.map((notice) => buildNoticeExportRow(notice));
    const rows = applyExportColumns(rowsRaw, selectedColumns);
    const delimiter = format === "csv" ? "," : "\t";
    content = buildDelimitedText(rows, delimiter);
    mimeType = format === "csv" ? "text/csv" : "text/tab-separated-values";
    extension = format;
  } else if (format === "xls") {
    const rowsRaw =
      endpoint === "stats"
        ? results.map((item) => buildStatsExportRow(item))
        : results.map((notice) => buildNoticeExportRow(notice));
    const rows = applyExportColumns(rowsRaw, selectedColumns);
    content = buildHtmlTable(rows);
    mimeType = "application/vnd.ms-excel";
    extension = "xls";
  } else {
    if (endpoint === "stats") {
      const rowsRaw = results.map((item) => buildStatsExportRow(item));
      const rows = applyExportColumns(rowsRaw, selectedColumns);
      content = JSON.stringify(rows, null, 2);
    } else {
      const rowsRaw = results.map((notice) => buildNoticeExportRow(notice));
      const rows = applyExportColumns(rowsRaw, selectedColumns);
      content = JSON.stringify(rows, null, 2);
    }
  }

  const filename = `bzp-${endpoint}-${stamp}${suffix}.${extension}`;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const runQuery = async () => {
  if (isFetching) {
    abortActiveRequest(true);
  }
  const endpoint = getEndpoint();
  const error = validateForm(endpoint);
  if (error) {
    setStatusMessage(error, "error");
    return;
  }

  const queryToken = startNewQuery();
  compareSet.clear();
  updateCompareFab();
  previousSnapshot =
    lastEndpoint === "notice" ? buildSnapshotMap(lastResults) : new Map();
  deltaMap = new Map();
  autoLoadPages = 0;
  autoLoadCapped = false;
  autoLoadInFlight = false;
  resultsEl.innerHTML = "";
  lastResults = [];
  if (filterInput) {
    filterInput.value = "";
  }

  lastQueryMeta = {
    endpoint,
    from: normalizeDateTime(inputs.publicationFrom.value),
    to: normalizeDateTime(inputs.publicationTo.value),
    pageSize: inputs.pageSize.value.trim(),
  };
  lastQueryState = {
    endpoint,
    fields: collectFieldValues(),
    modes: getMatchModes(),
  };

  lastEndpoint = endpoint;
  resetPagination();
  saveSessionState();
  updateQuerySummary();
  scrollToResults();

  if (endpoint === "notice") {
    const items = await fetchNextNoticePage(queryToken);
    paginationState.currentPage = 1;
    if (items.length) {
      renderNoticePage(1);
    } else {
      renderEmpty();
    }
    updateResultsMeta();
    updateResultsActions();
    return;
  }

  const url = buildApiUrl(endpoint);
  setStatusKey("statusFetching", "pending");
  setFetching(true, queryToken);
  renderStatsSkeleton();

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: ensureController().signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Request failed (${response.status}). ${body}`);
    }

    const data = await response.json();
    if (!isActiveToken(queryToken)) return;
    const items = Array.isArray(data) ? data : [];
    items.sort(
      (left, right) =>
        (right.numberOfNotices || 0) - (left.numberOfNotices || 0)
    );
    const count = items.length;

    lastResults = items;
    renderStats(items);

    setStatusKey("statusReceived", "ok", { count });
    updateResultsMeta();
    updateResultsActions();
  } catch (err) {
    if (err?.name === "AbortError") {
      if (isActiveToken(queryToken)) {
        setStatusKey("statusCancelled", "ok");
      }
      return;
    }
    const prefix = translations[currentLang]?.statusError || "Error";
    setStatusMessage(`${prefix}: ${err.message}`, "error");
    renderEmpty();
    lastResults = [];
    updateResultsMeta();
    updateResultsActions();
  } finally {
    setFetching(false, queryToken);
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runQuery();
});

form.addEventListener("input", (event) => {
  if (shouldResetSearchAfter(event.target)) {
    clearSearchAfterIfNeeded();
  }
  scheduleSessionSave();
});
form.addEventListener("change", (event) => {
  if (shouldResetSearchAfter(event.target)) {
    clearSearchAfterIfNeeded();
  }
  scheduleSessionSave();
});

if (copyUrlBtn) {
  copyUrlBtn.addEventListener("click", async () => {
    const endpoint = getEndpoint();
    const error = validateForm(endpoint);
    if (error) {
      showToast(error, "error");
      return;
    }
    try {
      const url = buildApiUrl(endpoint);
      const copied = await copyText(url);
      if (copied) {
        showToast(translations[currentLang].statusCopied, "success");
      } else {
        showToast(translations[currentLang].statusCopyFailed, "error");
      }
    } catch (err) {
      showToast(translations[currentLang].statusCopyFailed, "error");
    }
  });
}

if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", async () => {
    try {
      const url = buildShareUrl();
      const copied = await copyText(url);
      if (copied) {
        showToast(translations[currentLang].statusLinkCopied, "success");
      } else {
        showToast(translations[currentLang].statusLinkCopyFailed, "error");
      }
    } catch (err) {
      showToast(translations[currentLang].statusLinkCopyFailed, "error");
    }
  });
}



if (downloadBtn) {

  downloadBtn.addEventListener("click", () => {
    downloadResults("json");
  });
}

if (downloadCsvBtn) {
  downloadCsvBtn.addEventListener("click", () => {
    downloadResults("csv");
  });
}

if (downloadTsvBtn) {
  downloadTsvBtn.addEventListener("click", () => {
    downloadResults("tsv");
  });
}

if (downloadXlsBtn) {
  downloadXlsBtn.addEventListener("click", () => {
    downloadResults("xls");
  });
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    abortActiveRequest();
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".clear-field");
  if (!button) return;
  const targetId = button.dataset.clearTarget;
  if (!targetId) return;
  clearFieldValue(document.getElementById(targetId));
});

if (statsToggleBtn) {
  statsToggleBtn.addEventListener("click", () => {
    setStatsCollapsed(!statsCollapsed);
  });
}

if (filterInput) {
  filterInput.addEventListener("input", () => {
    scheduleResultsFilter();
    scheduleSessionSave();
  });
}

if (recentFiltersChips) {
  recentFiltersChips.addEventListener("click", (event) => {
    const button = event.target.closest(".recent-filter-chip");
    if (!button || !filterInput) return;
    const value = button.dataset.value || "";
    filterInput.value = value;
    scheduleResultsFilter();
    scheduleSessionSave();
  });
}

if (pagePrevBtn) {
  pagePrevBtn.addEventListener("click", () => {
    goToPage(paginationState.currentPage - 1);
  });
}

if (pageNextBtn) {
  pageNextBtn.addEventListener("click", () => {
    goToPage(paginationState.currentPage + 1);
  });
}

if (pagePrevBtnBottom) {
  pagePrevBtnBottom.addEventListener("click", () => {
    goToPage(paginationState.currentPage - 1);
  });
}

if (pageNextBtnBottom) {
  pageNextBtnBottom.addEventListener("click", () => {
    goToPage(paginationState.currentPage + 1);
  });
}

if (pageGoBtn && pageInput) {
  pageGoBtn.addEventListener("click", () => {
    goToPage(pageInput.value);
  });
}

if (pageGoBtnBottom && pageInputBottom) {
  pageGoBtnBottom.addEventListener("click", () => {
    goToPage(pageInputBottom.value);
  });
}

if (pageInput) {
  pageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      goToPage(pageInput.value);
    }
  });
}

if (pageInputBottom) {
  pageInputBottom.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      goToPage(pageInputBottom.value);
    }
  });
}

if (resultsEl) {
  resultsEl.addEventListener("click", async (event) => {
    const seriesBtn = event.target.closest("[data-series]");
    if (seriesBtn) {
      const mode = seriesBtn.dataset.series;
      if (mode === "daily" || mode === "weekly") {
        timeSeriesMode = mode;
        renderNoticeAnalytics();
        scheduleSessionSave();
      }
      return;
    }
    const bookmarkBtn = event.target.closest(".bookmark-btn");
    if (bookmarkBtn) {
      const id = bookmarkBtn.dataset.id || "";
      if (id) {
        toggleBookmark(id);
      }
      return;
    }
    const checkbox = event.target.closest(".notice-select");
    if (checkbox) {
      toggleCompareSelection(Number(checkbox.dataset.index));
      return;
    }

    const copyIdBtn = event.target.closest(".copy-id-btn");
    if (copyIdBtn) {
      const id = copyIdBtn.dataset.id;
      if (id) {
        const copied = await copyText(id);
        setStatusKey(
          copied ? "statusCopiedGeneric" : "statusCopyFailedGeneric",
          copied ? "ok" : "error"
        );
      }
      return;
    }

    const copyButton = event.target.closest(".notice-copy");
    if (copyButton) {
      const index = Number(copyButton.dataset.index);
      if (Number.isNaN(index)) return;
      const notice = lastResults[index];
      if (!notice) return;
      const action = copyButton.dataset.action;
      let value = "";
      if (action === "json") {
        value = JSON.stringify(notice, null, 2);
      } else if (action === "objectId") {
        value = notice.objectId || "";
      } else if (action === "noticeNumber") {
        value = notice.noticeNumber || "";
      }
      if (!value) {
        setStatusKey("statusCopyEmpty", "error");
        return;
      }
      const copied = await copyText(value);
      setStatusKey(
        copied ? "statusCopiedGeneric" : "statusCopyFailedGeneric",
        copied ? "ok" : "error"
      );
      return;
    }

    const loadPreviewBtn = event.target.closest(".notice-load-preview");
    if (loadPreviewBtn) {
      const index = Number(loadPreviewBtn.dataset.index);
      if (Number.isNaN(index)) return;
      const notice = lastResults[index];
      if (!notice || !notice.htmlBody) return;

      const container = loadPreviewBtn.closest(".notice-html-preview-area");
      if (container) {
        loadNoticePreview(container);
      }
      return;
    }

    const button = event.target.closest(".notice-expand");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;
    const notice = lastResults[index];
    if (!notice || !notice.htmlBody) return;

    // Add to history
    try {
      addToHistory(notice);
    } catch (err) {
      console.error("Failed to add to history", err);
    }

    openHtmlModal(notice, index);
  });
}

if (modalClose) {
  modalClose.addEventListener("click", closeHtmlModal);
}

if (modalEl) {
  modalEl.addEventListener("click", (event) => {
    if (event.target === modalEl) {
      closeHtmlModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalEl?.classList.contains("is-open")) {
    closeHtmlModal();
  }
});

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const days = Number(button.dataset.range);
    if (!Number.isNaN(days)) {
      setDateRange(days);
      clearSearchAfterIfNeeded();
      scheduleSessionSave();
    }
  });
});

if (presetSelect) {
  presetSelect.addEventListener("change", () => {
    const hasSelection = Boolean(presetSelect.value);
    if (presetLoadBtn) presetLoadBtn.disabled = !hasSelection;
    if (presetDeleteBtn) presetDeleteBtn.disabled = !hasSelection;
  });
}

if (presetSaveBtn && presetNameInput) {
  presetSaveBtn.addEventListener("click", () => {
    const name = presetNameInput.value.trim();
    if (!name) {
      showToast(translations[currentLang].presetNameRequired, "error");
      return;
    }
    const presets = readPresets();
    const existingIndex = presets.findIndex((preset) => preset.name === name);
    if (existingIndex >= 0) {
      const confirmText =
        translations[currentLang]?.presetOverwriteConfirm ||
        "Overwrite existing preset?";
      if (!window.confirm(confirmText)) {
        return;
      }
    }
    const payload = {
      name,
      updatedAt: new Date().toISOString(),
      state: getPresetFormState(),
    };
    if (existingIndex >= 0) {
      presets.splice(existingIndex, 1, payload);
    } else {
      presets.push(payload);
    }
    const saved = writePresets(presets);
    if (!saved) {
      showToast(translations[currentLang].presetSaveFailed, "error");
      return;
    }
    refreshPresetOptions();
    presetSelect.value = name;
    if (presetLoadBtn) presetLoadBtn.disabled = false;
    if (presetDeleteBtn) presetDeleteBtn.disabled = false;
    showToast(translations[currentLang].presetSaved, "success");
  });
}

if (presetLoadBtn && presetSelect) {
  presetLoadBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) return;
    const presets = readPresets();
    const preset = presets.find((item) => item.name === name);
    if (!preset) return;
    applyPresetFormState(preset.state);
    resetSearchAfter();
    setStatusKey("presetLoaded", "ok");
    scheduleSessionSave();
  });
}

if (presetDeleteBtn && presetSelect) {
  presetDeleteBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) return;
    const confirmText =
      translations[currentLang]?.presetDeleteConfirm || "Delete this preset?";
    if (!window.confirm(confirmText)) {
      return;
    }
    const presets = readPresets().filter((preset) => preset.name !== name);
    const saved = writePresets(presets);
    if (!saved) {
      setStatusKey("presetDeleteFailed", "error");
      return;
    }
    refreshPresetOptions();
    setStatusKey("presetDeleted", "ok");
  });
}

if (exportTemplateSelect) {
  exportTemplateSelect.addEventListener("change", () => {
    const hasSelection = Boolean(exportTemplateSelect.value);
    if (exportTemplateLoadBtn) exportTemplateLoadBtn.disabled = !hasSelection;
    if (exportTemplateDeleteBtn) exportTemplateDeleteBtn.disabled = !hasSelection;
  });
}

if (exportTemplateSaveBtn && exportTemplateName) {
  exportTemplateSaveBtn.addEventListener("click", () => {
    const name = exportTemplateName.value.trim();
    if (!name) {
      showToast(translations[currentLang].exportTemplateNameRequired, "error");
      return;
    }
    const endpoint = getEndpoint();
    const templates = getExportTemplatesForLang(currentLang);
    const exists = templates.find(
      (template) => template.name === name && template.endpoint === endpoint
    );
    if (exists) {
      const confirmText =
        translations[currentLang]?.exportTemplateOverwriteConfirm ||
        "Overwrite existing template?";
      if (!window.confirm(confirmText)) {
        return;
      }
    }
    const columns = getExportColumnsFromUI();
    if (!columns.length) {
      showToast(translations[currentLang].exportColumnsRequired, "error");
      return;
    }
    const saved = saveExportTemplate(name, endpoint, columns);
    if (!saved) {
      showToast(translations[currentLang].exportTemplateSaveFailed, "error");
      return;
    }
    refreshExportTemplateOptions();
    exportTemplateSelect.value = name;
    if (exportTemplateLoadBtn) exportTemplateLoadBtn.disabled = false;
    if (exportTemplateDeleteBtn) exportTemplateDeleteBtn.disabled = false;
    showToast(translations[currentLang].exportTemplateSaved, "success");
  });
}

if (exportTemplateLoadBtn && exportTemplateSelect) {
  exportTemplateLoadBtn.addEventListener("click", () => {
    const name = exportTemplateSelect.value;
    if (!name) return;
    const loaded = loadExportTemplate(name);
    if (!loaded) {
      setStatusKey("exportTemplateLoadFailed", "error");
      return;
    }
    setStatusKey("exportTemplateLoaded", "ok");
  });
}

if (exportTemplateDeleteBtn && exportTemplateSelect) {
  exportTemplateDeleteBtn.addEventListener("click", () => {
    const name = exportTemplateSelect.value;
    if (!name) return;
    const confirmText =
      translations[currentLang]?.exportTemplateDeleteConfirm ||
      "Delete this template?";
    if (!window.confirm(confirmText)) {
      return;
    }
    const endpoint = getEndpoint();
    const deleted = deleteExportTemplate(name, endpoint);
    if (!deleted) {
      setStatusKey("exportTemplateDeleteFailed", "error");
      return;
    }
    refreshExportTemplateOptions();
    setStatusKey("exportTemplateDeleted", "ok");
  });
}

if (exportColumnsEl) {
  exportColumnsEl.addEventListener("change", () => {
    syncExportColumnsFromUI();
    scheduleSessionSave();
  });
}

if (exportSelectAllBtn) {
  exportSelectAllBtn.addEventListener("click", () => {
    const endpoint = getEndpoint();
    applyExportColumnSelection(endpoint, getDefaultExportColumns(endpoint));
  });
}

if (exportClearAllBtn) {
  exportClearAllBtn.addEventListener("click", () => {
    const endpoint = getEndpoint();
    applyExportColumnSelection(endpoint, []);
  });
}

[inputs.publicationFrom, inputs.publicationTo].forEach((input) => {
  input.addEventListener("input", () => {
    syncRangeButtons();
    scheduleSessionSave();
  });
});

inputs.searchAfter.addEventListener("input", () => {
  updateResultsActions();
  scheduleSessionSave();
});

if (inputs.noticeNumber) {
  inputs.noticeNumber.addEventListener("input", () => {
    applyResultsFilter();
    scheduleSessionSave();
  });
}

if (inputs.orgName) {
  inputs.orgName.addEventListener("input", () => {
    applyResultsFilter();
    scheduleSessionSave();
  });
}

if (noticeNumberModeSelect) {
  noticeNumberModeSelect.addEventListener("change", () => {
    applyResultsFilter();
    updateQuerySummary();
    scheduleSessionSave();
  });
}

if (orgNameModeSelect) {
  orgNameModeSelect.addEventListener("change", () => {
    applyResultsFilter();
    updateQuerySummary();
    scheduleSessionSave();
  });
}
inputs.pageSize.addEventListener("input", () => {
  paginationState.pageSize = getPageSize();
  paginationState.currentPage = 1;
  if (lastQueryMeta && lastQueryMeta.endpoint === "notice") {
    lastQueryMeta.pageSize = String(paginationState.pageSize);
  }
  if (
    lastEndpoint === "notice" &&
    Array.isArray(lastResults) &&
    lastResults.length
  ) {
    renderNoticePage(1);
    updateResultsMeta();
  }
  updateResultsActions();
  scheduleSessionSave();
});

if (htmlToggle) {
  htmlToggle.addEventListener("change", () => {
    if (
      lastEndpoint === "notice" &&
      Array.isArray(lastResults) &&
      lastResults.length
    ) {
      renderNoticePage(paginationState.currentPage || 1);
      updateResultsMeta();
    }
    scheduleSessionSave();
  });
}

if (analyticsToggle) {
  analyticsToggle.addEventListener("change", () => {
    renderNoticeAnalytics();
    scheduleSessionSave();
  });
}

if (autoRunToggle) {
  autoRunToggle.addEventListener("change", () => {
    scheduleSessionSave();
  });
}

if (exportFilteredToggle) {
  exportFilteredToggle.addEventListener("change", () => {
    scheduleSessionSave();
  });
}

if (deltaToggle) {
  deltaToggle.addEventListener("change", () => {
    setDeltaMode(deltaToggle.checked);
    scheduleSessionSave();
  });
}

if (infiniteToggle) {
  infiniteToggle.addEventListener("change", () => {
    setInfiniteMode(infiniteToggle.checked);
    scheduleSessionSave();
  });
}

const resetAll = ({ clearViewFilters = false } = {}) => {
  if (clearViewFilters) {
    if (filterInput) {
      filterInput.value = "";
    }
    if (exportFilteredToggle) exportFilteredToggle.checked = false;
    if (bookmarksToggle) bookmarksToggle.checked = false;
    if (deltaToggle) {
      setDeltaMode(false);
    }
    if (infiniteToggle) {
      setInfiniteMode(false);
    }
    applyResultsFilter();
    updateResultsActions();
    updateQuerySummary();
    saveSessionState();
    return;
  }
  form.reset();
  resultsEl.innerHTML = "";
  setStatusKey("statusIdle");
  inputs.baseUrl.value = DEFAULT_BASE_URL;
  setDefaultDates();
  setDefaultNoticeType();
  setCpvValues([]);
  resetSearchAfter();
  lastResults = [];
  lastQueryMeta = null;
  lastQueryState = null;
  compareSet.clear();
  updateCompareFab();
  if (deltaToggle) {
    setDeltaMode(false);
  }
  if (infiniteToggle) {
    setInfiniteMode(false);
  }
  if (filterInput) {
    filterInput.value = "";
  }
  if (presetNameInput) {
    presetNameInput.value = "";
  }
  if (presetSelect) {
    presetSelect.value = "";
  }
  if (presetLoadBtn) presetLoadBtn.disabled = true;
  if (presetDeleteBtn) presetDeleteBtn.disabled = true;
  resetPagination();
  updateResultsMeta();
  updateResultsActions();
  updateEndpointUI();
  updateQuerySummary();
  saveSessionState();
};

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    resetAll();
  });
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    resetAll({ clearViewFilters: true });
  });
}

endpointRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    clearSearchAfterIfNeeded();
    updateEndpointUI();
    scheduleSessionSave();
  });
});

langRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    setLanguage(radio.value);
    scheduleSessionSave();
  });
});

inputs.baseUrl.value = DEFAULT_BASE_URL;
inputs.baseUrl.readOnly = true;
inputs.baseUrl.disabled = true;
setDefaultDates();
setDefaultNoticeType();
resetSearchAfter();
statsCollapsed = readStatsCollapsed();
lastSavedFilterTerm = readRecentFilters()[0] || "";

const urlState = readStateFromUrl();
const initScrollButtons = () => {
  const topBtn = document.getElementById("scroll-top");
  const bottomBtn = document.getElementById("scroll-bottom");

  const updateButtons = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const bodyHeight = document.body.scrollHeight;

    if (topBtn) {
      topBtn.hidden = scrollY <= 300;
    }
    if (bottomBtn) {
      bottomBtn.hidden = scrollY + windowHeight >= bodyHeight - 300;
    }
  };

  window.addEventListener("scroll", updateButtons);
  // Also update on resize as body height might change relative to window
  window.addEventListener("resize", updateButtons);
  
  // Initial check
  updateButtons();

  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (bottomBtn) {
    bottomBtn.addEventListener("click", () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
  }
};

initScrollButtons();

const sessionState = urlState ? null : readSessionState();
const initialLang =
  urlState?.lang || sessionState?.lang || readSavedLang() || DEFAULT_LANG;
hydrateCpvFavorites();
setLanguage(initialLang);

if (sessionState) {
  applySessionState(sessionState);
}
if (urlState) {
  applyUrlState(urlState);
}
clearSearchAfterIfNeeded();
scheduleSessionSave();

hardenAutofill();
setupClearButtons();
setupDropdowns();
setupCpvTags();
setupCpvFavorites();
updateEndpointUI();
refreshPresetOptions();
renderExportColumns();
refreshExportTemplateOptions();
loadBookmarks();

if (bookmarksToggle) {
  bookmarksToggle.addEventListener("change", () => {
    applyResultsFilter();
  });
}

const shouldAutoRun = Boolean(
  urlState?.autoRun || (!urlState && sessionState?.autoRun)
);
const hasInitialLoad = (() => {
  try {
    return Boolean(localStorage.getItem(INITIAL_LOAD_KEY));
  } catch (err) {
    return false;
  }
})();
const shouldInitialLoad = !urlState && !sessionState && !hasInitialLoad;
if (shouldInitialLoad) {
  try {
    localStorage.setItem(INITIAL_LOAD_KEY, "1");
  } catch (err) {
    // Ignore storage failures to avoid blocking initial load.
  }
  endpointRadios.forEach((radio) => {
    radio.checked = radio.value === "notice";
  });
  inputs.noticeType.value = DEFAULT_NOTICE_TYPE;
  inputs.pageSize.value = "20";
  setDateRange(20);
  resetSearchAfter();
  updateEndpointUI();
  runQuery();
} else if (shouldAutoRun) {
  runQuery();
}
