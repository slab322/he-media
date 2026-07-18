/* ==========================================================================
   data.js
   JSONデータの取得。file://表示やネットワークエラー時も画面を壊さない。
   ========================================================================== */

window.HE = window.HE || {};

(function () {
  // 現時点ではすべて空配列。将来はここに実データを積むだけで各画面に反映される。
  var DATA_URLS = {
    events: "/data/events.json",
    shops: "/data/shops.json",
    articles: "/data/articles.json",
    videos: "/data/videos.json",
    news: "/data/news.json"
  };

  /**
   * 指定キーのJSONを取得する。
   * fetch非対応環境(file://等)や404、JSON破損時も {items: []} を返し、
   * 呼び出し側は常に配列として安全に扱える。
   */
  function loadData(key) {
    var url = DATA_URLS[key];
    if (!url || typeof fetch !== "function") {
      return Promise.resolve({ items: [] });
    }
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("failed to load " + url);
        return res.json();
      })
      .then(function (json) {
        return { items: Array.isArray(json && json.items) ? json.items : [] };
      })
      .catch(function () {
        return { items: [] };
      });
  }

  window.HE.data = {
    urls: DATA_URLS,
    load: loadData
  };
})();
