// Inputs that can be obtained directly inside the Custom HLSL node
// without connecting external nodes.
// key = variable name (as detected by parser), value = suggestion info

export const REDUCIBLE_INPUTS = {
  // Time
  Time: {
    label: "Time",
    description: "View構造体から直接取得可能（Timeノード接続不要）",
    alternatives: [
      { label: "リアルタイム（秒）", code: "float time = View.RealTime;" },
      { label: "ゲーム内時間（Pause中は止まる）", code: "float gameTime = View.GameTime;" },
      { label: "デルタタイム", code: "float dt = View.DeltaTime;" },
    ],
  },

  // Depth
  SceneDepth: {
    label: "SceneDepth",
    description: "CalcSceneDepthで直接取得可能（SceneTextureノード接続不要）",
    alternatives: [
      { label: "シーン深度", code: "float depth = CalcSceneDepth(GetDefaultSceneTextureUV(Parameters, 1));" },
      { label: "リニア深度（カメラ距離）", code: "float depth = CalcSceneDepth(GetDefaultSceneTextureUV(Parameters, 1));\nfloat linearDepth = ConvertFromDeviceZ(depth);" },
    ],
  },
  PixelDepth: {
    label: "PixelDepth",
    description: "Parameters.ScreenPosition.wで直接取得可能",
    alternatives: [
      { label: "ピクセル自体の深度", code: "float pixelDepth = Parameters.ScreenPosition.w;" },
    ],
  },
  WorldDepth: {
    label: "WorldDepth",
    description: "CalcSceneDepthで直接取得可能",
    alternatives: [
      { label: "ワールド深度", code: "float depth = CalcSceneDepth(GetDefaultSceneTextureUV(Parameters, 1));" },
    ],
  },

  // Screen / Viewport
  ScreenPosition: {
    label: "ScreenPosition",
    description: "Parametersから直接取得可能",
    alternatives: [
      { label: "クリップスペース座標", code: "float4 screenPos = Parameters.ScreenPosition;" },
      { label: "正規化デバイス座標（-1〜1）", code: "float2 ndc = Parameters.ScreenPosition.xy / Parameters.ScreenPosition.w;" },
    ],
  },
  ViewportUV: {
    label: "ViewportUV",
    description: "GetViewportUVで直接取得可能",
    alternatives: [
      { label: "ビューポートUV（0〜1）", code: "float2 viewportUV = GetViewportUV(Parameters);" },
    ],
  },
  PixelPosition: {
    label: "PixelPosition",
    description: "SvPositionから直接取得可能",
    alternatives: [
      { label: "ピクセル座標", code: "float2 pixelPos = Parameters.SvPosition.xy;" },
    ],
  },
  SvPosition: {
    label: "SvPosition",
    description: "Parametersから直接取得可能",
    alternatives: [
      { label: "SV_Position", code: "float4 svPos = Parameters.SvPosition;" },
    ],
  },

  // View size
  ViewSize: {
    label: "ViewSize",
    description: "View構造体から直接取得可能",
    alternatives: [
      { label: "ビューサイズ", code: "float2 viewSize = View.ViewSizeAndInvSize.xy;" },
      { label: "テクセルサイズ（1/解像度）", code: "float2 texelSize = View.ViewSizeAndInvSize.zw;" },
    ],
  },
  ViewTexelSize: {
    label: "ViewTexelSize",
    description: "View構造体から直接取得可能",
    alternatives: [
      { label: "テクセルサイズ", code: "float2 texelSize = View.ViewSizeAndInvSize.zw;" },
    ],
  },
  SceneTexelSize: {
    label: "SceneTexelSize",
    description: "View構造体から直接取得可能",
    alternatives: [
      { label: "シーンテクセルサイズ", code: "float2 sceneTexelSize = View.BufferSizeAndInvSize.zw;" },
    ],
  },

  // Camera
  CameraPosition: {
    label: "CameraPosition",
    description: "ResolvedViewから直接取得可能",
    alternatives: [
      { label: "カメラ位置", code: "float3 camPos = ResolvedView.WorldCameraOrigin;" },
    ],
  },
  CameraVector: {
    label: "CameraVector",
    description: "ResolvedViewから直接取得可能",
    alternatives: [
      { label: "カメラ前方ベクトル", code: "float3 camDir = ResolvedView.ViewForward;" },
    ],
  },
  CameraDirection: {
    label: "CameraDirection",
    description: "ResolvedViewから直接取得可能",
    alternatives: [
      { label: "カメラ前方ベクトル", code: "float3 camDir = ResolvedView.ViewForward;" },
    ],
  },

  // World
  WorldPosition: {
    label: "WorldPosition",
    description: "深度から復元可能（ポストプロセスの場合）",
    alternatives: [
      {
        label: "深度からワールド位置を復元",
        code: `float3 camPos = ResolvedView.WorldCameraOrigin;
float2 uv = GetViewportUV(Parameters);
float depth = CalcSceneDepth(GetDefaultSceneTextureUV(Parameters, 1));
float2 screenUV = (uv - 0.5) * float2(2.0, -2.0);
float3 viewDir = mul(float4(screenUV, 1.0, 1.0), ResolvedView.ClipToView).xyz;
float3 worldPos = camPos + normalize(mul(float4(viewDir, 0.0), ResolvedView.ViewToTranslatedWorld).xyz) * depth;`,
      },
    ],
  },
  ActorWorldPosition: {
    label: "ActorWorldPosition",
    description: "GetObjectWorldPosition で直接取得可能（サーフェスマテリアルの場合）",
    alternatives: [
      { label: "オブジェクトのワールド位置", code: "float3 objPos = GetObjectWorldPosition(Parameters);" },
    ],
  },

  // Vertex / Normal (surface materials only)
  WorldNormal: {
    label: "WorldNormal",
    description: "Parametersから直接取得可能（サーフェスマテリアルの場合）、またはSceneTextureLookupで取得可能（PP）",
    alternatives: [
      { label: "サーフェス: ワールド法線", code: "float3 worldNormal = Parameters.WorldNormal;" },
      { label: "PP: SceneTextureLookupで取得", code: "float3 worldNormal = SceneTextureLookup(GetDefaultSceneTextureUV(Parameters, 8), 8, false).rgb;" },
    ],
  },
  VertexColor: {
    label: "VertexColor",
    description: "Parametersから直接取得可能（サーフェスマテリアルの場合）",
    alternatives: [
      { label: "頂点カラー", code: "float4 vertCol = Parameters.VertexColor;" },
    ],
  },
  VertexNormal: {
    label: "VertexNormal",
    description: "Parameters.TangentToWorldから直接取得可能",
    alternatives: [
      { label: "頂点法線", code: "float3 vertNormal = Parameters.TangentToWorld[2];" },
    ],
  },

  // Misc
  TwoSidedSign: {
    label: "TwoSidedSign",
    description: "Parametersから直接取得可能",
    alternatives: [
      { label: "両面符号", code: "float twoSidedSign = Parameters.TwoSidedSign;" },
    ],
  },
  PerInstanceRandom: {
    label: "PerInstanceRandom",
    description: "Primitiveから直接取得可能",
    alternatives: [
      { label: "インスタンスランダム", code: "float rand = GetPerInstanceRandom(Parameters);" },
    ],
  },
};
