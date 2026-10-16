var defaultConfig = {
  navColor: "#0068ff",
  navImg: "",
  listColor: "#ffffff",
  listImg: "",
  chatColor: "#eef0f1",
  chatImg: "",
  bubbleMeColor: "#e5efff",
  bubbleYouColor: "#ffffff",
  bubbleTextColor: "#081c36",
};

var STYLE_ID = "zalo-custom-theme-style";
var currentConfig = Object.assign({}, defaultConfig);
var currentCss = "";
var checkTimer = null;

var TRANSPARENT =
  "background: transparent !important;" +
  "background-color: transparent !important;" +
  "background-image: none !important;";

function isAlive() {
  try {
    return !!(chrome.runtime && chrome.runtime.id);
  } catch (e) {
    return false;
  }
}

function safeColor(value, fallback) {
  var ok = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  return ok.test(value || "") ? value : fallback;
}

function safeImageUrl(value) {
  if (!value || typeof value !== "string") return "";
  // Cho phép cả URL http/https lẫn chuỗi Base64 (data:image/...) do người dùng tải lên từ máy
  if (!value.startsWith("http") && !value.startsWith("data:image/")) return "";
  return value.replace(/[\n\r]/g, "");
}

function textOn(hex) {
  var h = hex.replace("#", "");
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map(function (c) {
        return c + c;
      })
      .join("");
  }
  var r = parseInt(h.slice(0, 2), 16);
  var g = parseInt(h.slice(2, 4), 16);
  var b = parseInt(h.slice(4, 6), 16);
  var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5 ? "#ffffff" : "#081c36";
}

function autoTextColor(color, imgUrl) {
  return safeImageUrl(imgUrl) ? "" : textOn(color);
}

function rule(selectors, body) {
  return selectors.join(",\n") + " {\n" + body + "\n}";
}

function buildBgRule(color, imgUrl) {
  var img = safeImageUrl(imgUrl);
  if (img) {
    return (
      'background-image: url("' +
      img +
      '") !important;' +
      "background-size: cover !important;" +
      "background-position: center !important;" +
      "background-repeat: no-repeat !important;" +
      "background-color: transparent !important;"
    );
  }
  return (
    "background: " +
    color +
    " !important;" +
    "background-color: " +
    color +
    " !important;" +
    "background-image: none !important;"
  );
}

function buildCss(cfg) {
  var navColor = safeColor(cfg.navColor, defaultConfig.navColor);
  var listColor = safeColor(cfg.listColor, defaultConfig.listColor);
  var chatColor = safeColor(cfg.chatColor, defaultConfig.chatColor);
  var meColor = safeColor(cfg.bubbleMeColor, defaultConfig.bubbleMeColor);
  var youColor = safeColor(cfg.bubbleYouColor, defaultConfig.bubbleYouColor);
  var textColor = safeColor(cfg.bubbleTextColor, defaultConfig.bubbleTextColor);

  var navBg = buildBgRule(navColor, cfg.navImg);
  var listBg = buildBgRule(listColor, cfg.listImg);
  var chatBg = buildBgRule(chatColor, cfg.chatImg);

  var navText = autoTextColor(navColor, cfg.navImg);
  var listText = autoTextColor(listColor, cfg.listImg);
  var chatText = autoTextColor(chatColor, cfg.chatImg);

  var css = [];

  // 1. THANH MENU DỌC BÊN TRÁI
  css.push(
    rule(["nav#sidebarNav > #main-tab", "div#main-tab.nav__tabs"], navBg),
  );
  if (navText) {
    css.push(
      rule(
        [
          "#main-tab .lb-tab-title",
          "#main-tab .leftbar-tab i",
          "#main-tab .internal-icon",
        ],
        "color: " + navText + " !important;",
      ),
    );
  }

  // 2. NỀN DANH SÁCH HỘI THOẠI
  css.push(
    rule(
      [
        "nav#sidebarNav > div.conv-list-semi-compact",
        "nav#sidebarNav > div.flx-cell",
        ".conv-list-semi-compact",
      ],
      listBg +
        "--layer-background: transparent !important;" +
        "--layer-background-subtle: transparent !important;" +
        "--surface-background: transparent !important;",
    ),
  );

  css.push(
    rule(
      [
        ".conv-list-semi-compact div:not(.z-noti-badge):not(.zavatar):not(.tab-indicator)",
        ".conv-list-semi-compact nav",
        ".conv-list-semi-compact section",
        ".conv-list-semi-compact div-16",
        ".conv-list-semi-compact div-b16",
        ".conv-list-semi-compact div-b14",
        ".conv-list-semi-compact [class*='tds-global-search']",
        ".conv-list-semi-compact .z-conv-message",
        ".conv-list-semi-compact .conv-item-body",
        ".conv-list-semi-compact .conv-item-title__more",
        "#contact-search",
        ".msg-filters-bar",
        "#conversationListId",
        "#conversationList",
        ".virtualized-scroll",
        ".ReactVirtualized__Grid",
        ".ReactVirtualized__Grid__innerScrollContainer",
        ".msg-item",
        ".conv-item",
        ".conv-item::before",
        ".conv-item::after",
      ],
      TRANSPARENT,
    ),
  );

  css.push(
    rule(
      ["#contact-search .group-search"],
      "background-color: rgba(128, 128, 128, 0.25) !important;" +
        "border-radius: 6px !important;",
    ),
  );

  css.push(
    rule(
      [
        ".conv-list-semi-compact .conv-item:hover",
        ".conv-list-semi-compact .msg-item:hover",
        ".conv-list-semi-compact .conv-item.selected",
      ],
      "background-color: rgba(128, 128, 128, 0.2) !important;",
    ),
  );

  if (listText) {
    css.push(
      rule(
        [
          ".conv-item-title__name",
          ".conv-item-title__name .truncate",
          ".z-conv-message",
          ".z-conv-message__preview-message",
          ".z-conv-message__preview-sender-name",
          ".preview-time",
          ".msg-filters-bar .tab-item",
          ".msg-filters-bar div-b14",
          ".msg-filters-bar .label-filter-preview",
          "#contact-search i",
          "#contact-search .fake-textholder",
        ],
        "color: " + listText + " !important;",
      ),
    );
  }

  // 3. NỀN KHUNG ĐOẠN CHAT
  css.push(rule(["#chatView"], chatBg));

  // Các lớp còn lại trong suốt
  css.push(
    rule(
      [
        "main",
        "main > span",
        "#chatViewContainer",
        "#header",
        ".threadChat",
        "#chatOnboard",
        ".chat-view",
        ".chat-onboard",
        "#messageView",
        ".message-view",
        "#messageViewContainer",
        ".message-view__scroll",
        ".message-view__scroll__inner",
        ".chat-message-list",
        "#chat-box",
        ".chat-date-divider",
        "aside.compact-chat-info .cp-bg",
      ],
      TRANSPARENT,
    ),
  );

  // Panel Thông tin nhóm (Hỗ trợ cả khi bật F12 lẫn Toàn màn hình)
  css.push(
    rule(
      [
        "aside div:not(.z--btn--v2):not(.zavatar):not(.img-media):not(.img-center-box):not(.z-toggle):not(.image-menu-container):not(.WEB)",
        "aside section",
        "aside header",
        "#chatInfo div:not(.z--btn--v2):not(.zavatar):not(.img-media):not(.img-center-box):not(.z-toggle):not(.image-menu-container):not(.WEB)",
        "#chatInfo section",
        "#chatInfo header",
        ".chat-info div:not(.z--btn--v2):not(.zavatar):not(.img-media):not(.img-center-box):not(.z-toggle):not(.image-menu-container):not(.WEB)",
        ".chat-info section",
        ".chat-info header",
        "aside .cp-bg",
        ".chat-info .cp-bg",
      ],
      TRANSPARENT,
    ),
  );

  // Header (tên đoạn chat) + panel Thông tin nhóm dùng chung nền danh sách
  css.push(
    rule(
      [
        "#chatViewContainer > #header",
        "aside.compact-chat-info",
        "aside",
        "#chatInfo",
        ".chat-info",
      ],
      listBg +
        "--layer-background: transparent !important;" +
        "--layer-background-subtle: transparent !important;" +
        "--surface-background: transparent !important;",
    ),
  );

  // 4. BONG BÓNG CHAT
  css.push(
    rule(
      [
        ".card:not(.card--me):not(.card--group-photo)",
        ".chat-message:not(.me) .bubble-content",
        ".bubble-recv",
      ],
      "background: " +
        youColor +
        " !important;" +
        "background-color: " +
        youColor +
        " !important;" +
        "color: " +
        textColor +
        " !important;",
    ),
  );
  css.push(
    rule(
      [".card.card--me", ".chat-message.me .bubble-content", ".bubble-send"],
      "background: " +
        meColor +
        " !important;" +
        "background-color: " +
        meColor +
        " !important;" +
        "color: " +
        textColor +
        " !important;",
    ),
  );
  css.push(
    rule(
      [".card .card--text", ".card span", ".bubble-content"],
      "color: " + textColor + " !important;",
    ),
  );

  // 5. BANNER GHIM, THANH CÔNG CỤ, Ô NHẬP (Dùng chung màu/ảnh nền với danh sách hội thoại)
  css.push(
    rule(
      [
        ".list-chat-box-banner__content",
        ".chat-group-topic-outer",
        ".chat-group-topic",
        ".chat-group-topic__item",
        ".chat-box-input-container",
        ".chat-box-bar",
        ".chat-box-input",
        ".chat-input-container",
        ".chat-input-scrollable",
        ".chat-input-wrapper",
        ".chat-input-content",
        ".rich-input",
      ],
      listBg + "box-shadow: none !important;" + "border: none !important;",
    ),
  );

  // 6a. MÀU CHỮ VÙNG TIN NHẮN (theo nền khung chat)
  if (chatText) {
    css.push(
      rule(
        [
          ".chat-date .content",
          ".chat-date .content span",
          ".rich-input",
          ".chat-box-toolbar-button i",
          ".chat-box-input-button i",
          ".content-title",
          ".content-message-name",
          ".content-message-type",
        ],
        "color: " + chatText + " !important;",
      ),
    );
  }

  // 6b. MÀU CHỮ HEADER + PANEL PHẢI (theo nền danh sách)
  if (listText) {
    css.push(
      rule(
        [
          ".header-title",
          ".subtitle__groupmember__content",
          ".subtitle__label .truncate",
          "#header i",
          ".chat-info__header__title",
          ".chat-info__header__title span",
          ".header-info__name",
          ".header-info__name .truncate",
          ".header-info__tool__button div-12",
          ".header-info__tool__button span",
          ".chat-info-general__section__header--title",
          ".chat-info-general__section__header--icon i",
          ".chat-info-general__item--title",
          ".chat-info-general__item--icon",
          ".chat-info-link__title",
          ".chat-info-link__subtitle",
          ".media-item-date__link",
          ".media-empty-text__preview span",
        ],
        "color: " + listText + " !important;",
      ),
    );
  }

  return css.join("\n\n");
}

function getOrCreateStyleTag() {
  var styleTag = document.getElementById(STYLE_ID);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(styleTag);
    styleTag.textContent = currentCss;
  }
  return styleTag;
}

function applyTheme(cfg) {
  try {
    currentConfig = Object.assign({}, defaultConfig, cfg);
    currentCss = buildCss(currentConfig);
    getOrCreateStyleTag().textContent = currentCss;
  } catch (e) {
    console.error("[Zalo Theme] Loi ap dung theme:", e);
  }
}

function loadAndApply() {
  if (!isAlive()) return;
  try {
    chrome.storage.local.get(defaultConfig, function (data) {
      if (!isAlive() || chrome.runtime.lastError) return;
      applyTheme(data);
    });
  } catch (e) {
    // Extension vừa bị reload
  }
}

loadAndApply();

try {
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (!isAlive() || area !== "local") return;
    var updated = {};
    for (var key in changes) updated[key] = changes[key].newValue;
    applyTheme(Object.assign({}, currentConfig, updated));
  });
} catch (e) {
  // Context đã hỏng
}

checkTimer = setInterval(function () {
  if (!isAlive()) {
    clearInterval(checkTimer);
    return;
  }
  if (currentCss && !document.getElementById(STYLE_ID)) {
    getOrCreateStyleTag();
  }
}, 2000);
