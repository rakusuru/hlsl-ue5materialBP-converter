# HLSL → UE5 Material Blueprint Converter

UE5 マテリアルエディタの Custom ノードに記述する HLSL コードを解析し、入力ピン・出力ピン・接続ノードを自動生成して **Blueprint Paste Format** に変換するブラウザツール。

生成結果をそのまま UE5 のマテリアルエディタに `Ctrl+V` で貼り付けるだけで、カスタムノード＋接続済みパラメータノード群が一発でセットアップできます。

## 機能

- HLSL コードから入力変数を自動検出し、適切なノードタイプを推定
  - `ScalarParameter` / `VectorParameter` / `TextureObjectParameter` / `TextureCoordinate` / `Time`
- スウィズルアクセス（`.rgb`, `.xy` 等）から型を推定
- `XXX.Sample(XXXSampler, uv)` パターンで Texture Object を自動検出（Sampler は除外）
- 型宣言なし＋左辺代入のみの変数を追加出力ピン（AdditionalOutputs）として検出
- `return` 文の型から Output Type を自動推定
- 解析結果をテーブルで確認・編集してから生成可能
- 生成と同時にクリップボードへコピー

## 使い方

1. [ツールを開く](https://rakusuru.github.io/hlsl-ue5materialBP-converter/)
2. HLSL コードを貼り付けて「▶ 解析する」
3. 検出された入力/出力ピンを確認・調整
4. 「⚡ 生成してコピー」→ UE5 マテリアルエディタで `Ctrl+V`

## 技術スタック

- React 18（CDN）
- Babel Standalone（ビルド不要）
- 単一 HTML ファイル（GitHub Pages でそのままホスト可能）

## ライセンス / License

[MIT License](LICENSE)

---

# HLSL → UE5 Material Blueprint Converter (English)

A browser tool that parses HLSL code written for UE5 Material Editor Custom nodes and auto-generates input pins, output pins, and connected parameter nodes in **Blueprint Paste Format**.

Just `Ctrl+V` the generated result into the UE5 Material Editor to instantly set up a Custom node with all parameter nodes already wired up.

## Features

- Auto-detects input variables from HLSL code and infers appropriate node types
  - `ScalarParameter` / `VectorParameter` / `TextureObjectParameter` / `TextureCoordinate` / `Time`
- Infers types from swizzle access (`.rgb`, `.xy`, etc.)
- Auto-detects Texture Objects from `XXX.Sample(XXXSampler, uv)` patterns (Samplers are excluded)
- Detects undeclared left-hand-side-only assignments as additional output pins (AdditionalOutputs)
- Auto-infers Output Type from `return` statement
- Review and edit parsed results in a table before generating
- Copies to clipboard on generate

## Usage

1. [Open the tool](https://rakusuru.github.io/hlsl-ue5materialBP-converter/)
2. Paste your HLSL code and click "▶ 解析する" (Parse)
3. Review and adjust the detected input/output pins
4. Click "⚡ 生成してコピー" (Generate & Copy) → `Ctrl+V` in UE5 Material Editor

## Tech Stack

- React 18 (CDN)
- Babel Standalone (no build step required)
- Single HTML file (directly hostable on GitHub Pages)
