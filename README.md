# HLSL → UE5 Material Blueprint Converter

> **[ツールを開く / Open Tool](https://rakusuru.github.io/hlsl-ue5materialBP-converter/)**

UE5 マテリアルエディタの Custom ノードに記述する HLSL コードを解析し、入力ピン・出力ピン・接続ノードを自動生成して **Blueprint Paste Format** に変換するブラウザツール。

生成結果をそのまま UE5 のマテリアルエディタに `Ctrl+V` で貼り付けるだけで、カスタムノード＋接続済みパラメータノード群が一発でセットアップできます。

## 機能

- HLSL コードから入力変数を自動検出し、適切なノードタイプを推定
  - `ScalarParameter` / `VectorParameter` / `TextureObjectParameter` / `TextureCoordinate` / `Time` / `SceneTexture`
- スウィズルアクセス（`.rgb`, `.xy` 等）から型を推定
- `XXX.Sample(XXXSampler, uv)` パターンで Texture Object を自動検出（Sampler は除外）
- `SceneTextureLookup` の使用を検出し、index から `SceneTextureId` を自動推定して `SceneTexture` ノードを生成
- 型宣言なし＋左辺代入のみの変数を追加出力ピン（AdditionalOutputs）として検出
- `return` 文の型から Output Type を自動推定
- UE ビルトイン変数（`PostProcessInput0`〜`4`, `SceneDepth`, `PixelDepth`, `ScreenPosition`, `ViewSize` 等 30+）を自動検出し、型情報付きで入力ピンに追加
- 💡 入力削減提案 — 外部ノード接続なしでカスタムノード内から直接取得可能な変数（`Time` → `View.RealTime`, `SceneDepth` → `CalcSceneDepth()` 等）を代替コード付きで提案
- HLSL シンタックスハイライト（キーワード・型・組込関数・コメント・数値）
- 解析結果をテーブルで確認・編集してから生成可能
- 「► 解析→生成→コピー」ボタンで1クリック完結
- 生成結果はモーダル表示 / 折りたたみパネルで確認可能
- コピー完了時にトースト通知

## 使い方

1. [ツールを開く](https://rakusuru.github.io/hlsl-ue5materialBP-converter/)
2. HLSL コードを貼り付け
3. 「► 解析→生成→コピー」で解析→生成→コピーを一発実行
4. UE5 マテリアルエディタで `Ctrl+V`

ピン設定を調整したい場合は「▶ 解析」→ テーブル編集 →「► 生成してコピー」の手順で。

## 技術スタック

- React 18 + Vite
- GitHub Actions による自動デプロイ（GitHub Pages）

## ローカル開発

```bash
npm install
npm run dev
```

## ライセンス / License

[MIT License](LICENSE)

---

# HLSL → UE5 Material Blueprint Converter (English)

> **[Open Tool](https://rakusuru.github.io/hlsl-ue5materialBP-converter/)**

A browser tool that parses HLSL code written for UE5 Material Editor Custom nodes and auto-generates input pins, output pins, and connected parameter nodes in **Blueprint Paste Format**.

Just `Ctrl+V` the generated result into the UE5 Material Editor to instantly set up a Custom node with all parameter nodes already wired up.

## Features

- Auto-detects input variables from HLSL code and infers appropriate node types
  - `ScalarParameter` / `VectorParameter` / `TextureObjectParameter` / `TextureCoordinate` / `Time` / `SceneTexture`
- Infers types from swizzle access (`.rgb`, `.xy`, etc.)
- Auto-detects Texture Objects from `XXX.Sample(XXXSampler, uv)` patterns (Samplers are excluded)
- Detects `SceneTextureLookup` usage and auto-infers `SceneTextureId` from index to generate `SceneTexture` nodes
- Detects undeclared left-hand-side-only assignments as additional output pins (AdditionalOutputs)
- Auto-infers Output Type from `return` statement
- Auto-detects UE built-in variables (`PostProcessInput0`–`4`, `SceneDepth`, `PixelDepth`, `ScreenPosition`, `ViewSize`, etc. 30+) as input pins with type hints
- 💡 Input reduction suggestions — proposes alternative HLSL code for variables that can be obtained directly inside the Custom node without external connections (`Time` → `View.RealTime`, `SceneDepth` → `CalcSceneDepth()`, etc.)
- HLSL syntax highlighting (keywords, types, built-in functions, comments, numbers)
- Review and edit parsed results in a table before generating
- One-click "► Parse → Generate → Copy" button
- View results in a modal dialog or collapsible inline panel
- Toast notification on successful copy

## Usage

1. [Open the tool](https://YOUR_USERNAME.github.io/hlsl-ue5materialBP-converter/)
2. Paste your HLSL code
3. Click "► 解析→生成→コピー" to parse, generate, and copy in one step
4. `Ctrl+V` in UE5 Material Editor

To fine-tune pin settings: click "▶ 解析" (Parse) → edit the table → "► 生成してコピー" (Generate & Copy).

## Tech Stack

- React 18 + Vite
- GitHub Actions auto-deploy (GitHub Pages)

## Local Development

```bash
npm install
npm run dev
```
