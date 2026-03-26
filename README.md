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

1. [ツールを開く](https://YOUR_USERNAME.github.io/hlsl-material-converter/)
2. HLSL コードを貼り付けて「▶ 解析する」
3. 検出された入力/出力ピンを確認・調整
4. 「⚡ 生成してコピー」→ UE5 マテリアルエディタで `Ctrl+V`

## 技術スタック

- React 18（CDN）
- Babel Standalone（ビルド不要）
- 単一 HTML ファイル（GitHub Pages でそのままホスト可能）

## ライセンス

[MIT License](LICENSE)
