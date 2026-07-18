# H.E. MEDIA

株式会社H.E.が運営する、地域密着型のメディアWebアプリです。
「地域のイベント・お店・人・情報が集まる、地域メディアアプリ」をコンセプトに、スマートフォンで日常的に見る地域情報アプリのような体験を目指しています。

現時点ではイベント・店舗・記事・動画などの実データは登録されておらず、UIとデータ構造の土台のみを実装しています。すべてのコンテンツ枠は「準備中」表示になっています。

## 公開URL

- https://media.he-company.com

## 使用技術

- HTML / CSS / Vanilla JavaScript のみ
- 外部フレームワーク・npm・React・Vue・Viteなどは不使用
- ビルド不要の静的サイト構成(GitHubへpushするだけでCloudflare Pagesに反映されます)
- PWA対応の土台(manifest / service worker)

## フォルダ構成

```
he-media/
├── index.html                # ホーム
├── events/
│   ├── index.html            # イベント一覧
│   └── detail/index.html     # イベント詳細テンプレート(プレースホルダー)
├── shops/
│   ├── index.html            # お店一覧
│   └── detail/index.html     # 店舗詳細テンプレート(プレースホルダー)
├── media/
│   ├── index.html            # メディア一覧
│   ├── article/index.html    # 記事詳細テンプレート(プレースホルダー)
│   └── video/index.html      # 動画詳細テンプレート(プレースホルダー)
├── more/
│   └── index.html            # その他メニュー
├── offline.html               # オフライン時の簡易ページ
├── manifest.webmanifest
├── service-worker.js
├── assets/
│   ├── css/
│   │   ├── base.css          # CSS変数・リセット・基本レイアウト
│   │   ├── components.css    # ヘッダー・下部ナビ・カード等の共通部品
│   │   └── pages.css         # ページ固有のレイアウト
│   ├── js/
│   │   ├── app.js            # 各ページの初期化(ブートストラップ)
│   │   ├── data.js           # JSON取得(失敗時も画面を壊さない)
│   │   └── ui.js             # タブ・フィルター・お気に入り・モーダル等の共通UI処理
│   └── icons/                # PWA用アイコン(仮画像)
└── data/
    ├── events.json
    ├── shops.json
    ├── articles.json
    ├── videos.json
    └── news.json
```

## データの追加方法

すべて `data/*.json` に `{ "items": [] }` の形式で入っています。`items`配列に将来オブジェクトを追加すると、各ページのJavaScript(`assets/js/data.js` の `HE.data.load()`)が取得します。現状は空配列のため、各画面は空状態(「準備中」)を表示します。

実際の描画処理(カードへの反映)は `assets/js/app.js` 内の `initEventsPage` / `initShopsPage` / `initMediaPage` / `initHomeNews` にコメントで記載した箇所へ追記してください。

### イベントの追加方法

`data/events.json` の `items` にイベント情報のオブジェクトを追加します(項目名は今後の実装に合わせて調整してください。例: 日時・会場・カテゴリー・画像URLなど)。

### 店舗の追加方法

`data/shops.json` の `items` に店舗情報のオブジェクトを追加します(店名・カテゴリー・エリア・画像URLなど)。

### 記事・動画の追加方法

特集記事は `data/articles.json`、ショート動画は `data/videos.json` に追加します。地域ニュースは `data/news.json` に追加します。

## ローカル確認方法

このサイトはルート相対パス(`/assets/...`、`/data/...`)で各種ファイルを参照しているため、`file://` で直接開くと一部読み込みに失敗します(失敗時も画面が壊れないようフォールバック済みです)。正しく確認するには簡易サーバーを使ってください。

```
cd he-media
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いて確認します。

## GitHubへpushする手順

```
git add -A
git commit -m "変更内容がわかるメッセージ"
git push origin main
```

## Cloudflare Pagesへの反映について

このリポジトリはCloudflare Pagesと連携しており、`main` ブランチへpushすると自動的にビルド・デプロイされます(ビルドコマンドは不要な静的サイトのため、出力ディレクトリをリポジトリ直下に設定してください)。

## PWAキャッシュ更新時の注意点

`service-worker.js` はネットワーク優先(取得できたら常に最新を表示しキャッシュを更新)の方針で実装しています。オフラインでネットワークに到達できない場合のみ、キャッシュまたは `offline.html` を表示します。

サイトの内容を更新した際、スマートフォンでキャッシュが残り反映されない場合は、一度アプリを完全に閉じて再度開くか、`CACHE_NAME` の値(`service-worker.js` 冒頭)を変更してpushすると、古いキャッシュが破棄され新しい内容に切り替わります。
