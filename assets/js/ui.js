/* ==========================================================================
   ui.js
   共通UI挙動: 下部ナビのアクティブ表示 / タブ / フィルターチップ /
   お気に入り / 検索モーダル / トースト / 空状態・スケルトン描画
   ========================================================================== */

window.HE = window.HE || {};

(function () {
  var FAVORITE_KEY = "he-media:favorites";

  /**
   * 現在のURLに応じて下部ナビ(PCではサイドナビ)のアクティブ表示を切り替える。
   * data-nav-match には対象パスの先頭一致文字列を入れておく(例: "/events/")。
   */
  function initBottomNav() {
    var items = document.querySelectorAll("[data-nav-match]");
    if (!items.length) return;
    var path = window.location.pathname;

    items.forEach(function (item) {
      var match = item.getAttribute("data-nav-match");
      var isHome = match === "/";
      var active = isHome ? path === "/" || path === "/index.html" : path.indexOf(match) === 0;
      item.classList.toggle("is-active", active);
      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  /**
   * タブ切り替え(見た目のみ)。実データ絞り込みは将来 detail=value を使って実装できる。
   * data-tabs でグループ化し、クリックで is-active を排他的に付け替える。
   */
  function initTabGroups(selector) {
    document.querySelectorAll(selector).forEach(function (group) {
      var buttons = group.querySelectorAll("[data-tab-value]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          group.dispatchEvent(
            new CustomEvent("tabchange", { detail: { value: btn.getAttribute("data-tab-value") } })
          );
        });
      });
    });
  }

  /** カテゴリーフィルターチップ(単一選択、見た目のみ切り替え) */
  function initFilterChips(selector) {
    document.querySelectorAll(selector).forEach(function (group) {
      var chips = group.querySelectorAll("[data-filter-value]");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.classList.remove("is-active"); });
          chip.classList.add("is-active");
          group.dispatchEvent(
            new CustomEvent("filterchange", { detail: { value: chip.getAttribute("data-filter-value") } })
          );
        });
      });
    });
  }

  /** お気に入りボタン。状態はlocalStorageに保存し、複数ページ間で保持する。 */
  function getFavorites() {
    try {
      var raw = window.localStorage.getItem(FAVORITE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function setFavorites(list) {
    try {
      window.localStorage.setItem(FAVORITE_KEY, JSON.stringify(list));
    } catch (e) {
      /* localStorageが使えない環境でも表示は継続する */
    }
  }

  function initFavoriteButtons() {
    var favorites = getFavorites();
    document.querySelectorAll("[data-favorite-id]").forEach(function (btn) {
      var id = btn.getAttribute("data-favorite-id");
      var active = favorites.indexOf(id) !== -1;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var current = getFavorites();
        var idx = current.indexOf(id);
        var nowActive;
        if (idx === -1) {
          current.push(id);
          nowActive = true;
        } else {
          current.splice(idx, 1);
          nowActive = false;
        }
        setFavorites(current);
        btn.classList.toggle("is-active", nowActive);
        btn.setAttribute("aria-pressed", String(nowActive));
      });
    });
  }

  /** トースト表示(準備中通知など) */
  var toastTimer = null;
  function showToast(message) {
    var toast = document.querySelector("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  /** 「準備中」トーストを出すだけの要素をまとめて登録する */
  function initComingSoonTriggers() {
    document.querySelectorAll("[data-coming-soon]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showToast(el.getAttribute("data-coming-soon") || "準備中です");
      });
    });
  }

  /** 検索モーダルの開閉 */
  function initSearchModal() {
    var overlay = document.querySelector("[data-search-modal]");
    if (!overlay) return;
    var openers = document.querySelectorAll("[data-search-open]");
    var closers = overlay.querySelectorAll("[data-search-close]");

    function open() {
      overlay.classList.add("is-open");
      var input = overlay.querySelector("input");
      if (input) window.setTimeout(function () { input.focus(); }, 50);
    }

    function close() {
      overlay.classList.remove("is-open");
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });

    closers.forEach(function (btn) {
      btn.addEventListener("click", close);
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /** 戻るボタン。履歴が無い場合はホームへ遷移する。 */
  function initBackButtons() {
    document.querySelectorAll("[data-back-button]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
      });
    });
  }

  /** 空状態UIをコンテナへ描画する */
  function renderEmptyState(container, message) {
    if (!container) return;
    container.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-state__icon placeholder-image" aria-hidden="true"></span>' +
      "<p>" + message + "</p>" +
      "</div>";
  }

  /** スケルトンカードを一時的に描画する(データ取得中の表示パターン) */
  function renderSkeletonCards(container, count, className) {
    if (!container) return;
    var html = "";
    for (var i = 0; i < (count || 3); i++) {
      html +=
        '<div class="card ' + (className || "") + '">' +
        '<div class="skeleton ratio-4-3"></div>' +
        '<div class="card__body">' +
        '<div class="skeleton" style="height:12px;width:60%;margin-bottom:8px;"></div>' +
        '<div class="skeleton" style="height:12px;width:90%;"></div>' +
        "</div></div>";
    }
    container.innerHTML = html;
  }

  window.HE.ui = {
    initBottomNav: initBottomNav,
    initBackButtons: initBackButtons,
    initTabGroups: initTabGroups,
    initFilterChips: initFilterChips,
    initFavoriteButtons: initFavoriteButtons,
    initComingSoonTriggers: initComingSoonTriggers,
    initSearchModal: initSearchModal,
    showToast: showToast,
    renderEmptyState: renderEmptyState,
    renderSkeletonCards: renderSkeletonCards
  };
})();
