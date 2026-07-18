/* ==========================================================================
   app.js
   各ページの初期化(ブートストラップ)。
   共通UIの起動 + ページ種別ごとのデータ読み込み・空状態表示を行う。
   ========================================================================== */

(function () {
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    // file://表示やCloudflare Pages以外のプレビューでも失敗して壊れないようにする
    if (window.location.protocol === "file:") return;
    navigator.serviceWorker.register("/service-worker.js").catch(function () {
      /* 登録できない環境でも画面表示は継続する */
    });
  }

  /** 期間タブ(今日/明日/今週/今月)。将来はvalueでイベント一覧を絞り込む想定 */
  function initPeriodTabs() {
    var group = document.querySelector("[data-period-tabs]");
    if (!group) return;
    group.addEventListener("tabchange", function (e) {
      // 現時点では実データが無いため見た目の切り替えのみ。
      // 将来: HE.data.load('events') 等の結果を e.detail.value で絞り込む。
      console.debug("period changed:", e.detail.value);
    });
  }

  /** タブ切り替えに応じて対応するパネルの表示/非表示を切り替える汎用処理 */
  function initTabPanels(tabsSelector) {
    var group = document.querySelector(tabsSelector);
    if (!group) return;
    var panels = document.querySelectorAll("[data-panel]");
    if (!panels.length) return;

    function show(value) {
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== value;
      });
    }

    group.addEventListener("tabchange", function (e) {
      show(e.detail.value);
    });

    var initial = group.querySelector(".is-active[data-tab-value]");
    if (initial) show(initial.getAttribute("data-tab-value"));
  }

  /** イベント一覧: JSONを読み込み、空であれば空状態を表示する */
  function initEventsPage() {
    var list = document.querySelector('[data-event-list="upcoming"]');
    if (!list) return;
    HE.ui.renderSkeletonCards(list, 3, "event-card");
    HE.data.load("events").then(function (res) {
      if (res.items.length === 0) {
        HE.ui.renderEmptyState(
          list,
          "イベント情報は準備中です。地域のイベントが決まり次第、順次掲載します。"
        );
      }
      // 将来: res.items を event-card として描画する。
    });
  }

  /** 店舗一覧: JSONを読み込み、空であれば空状態を表示する */
  function initShopsPage() {
    var list = document.querySelector("[data-shop-list]");
    if (!list) return;
    HE.ui.renderSkeletonCards(list, 4, "shop-card in-grid");
    HE.data.load("shops").then(function (res) {
      if (res.items.length === 0) {
        HE.ui.renderEmptyState(
          list,
          "店舗情報は準備中です。協力店・おすすめのお店が決まり次第、順次掲載します。"
        );
      }
      // 将来: res.items を shop-card として描画する。
    });
  }

  /** メディア一覧: 動画・記事・ニュースをまとめて読み込み、空であれば空状態を表示する */
  function initMediaPage() {
    var list = document.querySelector("[data-media-list]");
    if (!list) return;
    HE.ui.renderSkeletonCards(list, 4, "media-card");
    Promise.all([HE.data.load("videos"), HE.data.load("articles")]).then(function (results) {
      var total = results.reduce(function (sum, r) { return sum + r.items.length; }, 0);
      if (total === 0) {
        HE.ui.renderEmptyState(
          list,
          "メディアコンテンツは準備中です。ショート動画や特集記事を順次掲載します。"
        );
      }
      // 将来: results の items を media-card として描画する。
    });
  }

  /** 地域ニュース(ホーム): 空であれば空状態を表示する */
  function initHomeNews() {
    var list = document.querySelector("[data-news-list]");
    if (!list) return;
    HE.data.load("news").then(function (res) {
      if (res.items.length === 0) {
        HE.ui.renderEmptyState(list, "地域ニュースを順次掲載します。");
      }
      // 将来: res.items を news-card として描画する。
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    HE.ui.initBottomNav();
    HE.ui.initBackButtons();
    HE.ui.initSearchModal();
    HE.ui.initComingSoonTriggers();
    HE.ui.initFavoriteButtons();
    HE.ui.initTabGroups("[data-tabs]");
    HE.ui.initFilterChips("[data-filter-chips]");
    initPeriodTabs();
    initTabPanels("[data-page-tabs]");
    registerServiceWorker();

    var page = document.body.getAttribute("data-page");
    if (page === "home") initHomeNews();
    if (page === "events") initEventsPage();
    if (page === "shops") initShopsPage();
    if (page === "media") initMediaPage();
  });
})();
