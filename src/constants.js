export const HLSL_KEYWORDS = new Set(["if","else","for","while","do","return","break","continue","switch","case","default","struct","typedef","void","const","static","inline","true","false","discard"]);

export const HLSL_TYPES = new Set(["float","float1","float2","float3","float4","half","half1","half2","half3","half4","int","int2","int3","int4","uint","uint2","uint3","uint4","bool","bool2","bool3","bool4","Texture2D","Texture3D","TextureCube","SamplerState","FMaterialPixelParameters","FMaterialVertexParameters"]);

export const HLSL_BUILTINS = new Set(["sin","cos","tan","asin","acos","atan","atan2","sincos","sqrt","rsqrt","pow","exp","exp2","log","log2","log10","abs","sign","floor","ceil","round","trunc","frac","fmod","modf","min","max","clamp","saturate","lerp","step","smoothstep","dot","cross","normalize","length","distance","reflect","refract","mul","transpose","determinant","ddx","ddy","fwidth","any","all","clip","tex2D","tex2Dlod","Sample","radians","degrees","mad","rcp","isnan","isinf","isfinite","asuint","asfloat","asint","f16tof32","f32tof16","countbits","firstbithigh","firstbitlow","reversebits","InterlockedAdd","InterlockedAnd","InterlockedOr","InterlockedXor","InterlockedMin","InterlockedMax","InterlockedExchange","InterlockedCompareExchange","GroupMemoryBarrier","GroupMemoryBarrierWithGroupSync","DeviceMemoryBarrier","AllMemoryBarrier","AllMemoryBarrierWithGroupSync"]);

// UE internal structures/functions/types — truly skip (never input pins)
export const UE_BUILTINS = new Set([
  "View","ResolvedView","Primitive","Parameters",
  "GetDefaultSceneTextureUV","CalcSceneTexCoord",
  "SceneTextureLookup","DecodeSceneColorForMaterialNode","ConvertFromDeviceZ",
  "GetScreenPosition","GetWorldPosition",
  "MaterialFloat","MaterialFloat2","MaterialFloat3","MaterialFloat4",
  "BufferUVToOutputPixelPosition",
  "SharedSampler","Material",
]);

// UE built-in variables → auto-detected as input pins with type hints
export const UE_AUTO_INPUTS = {
  PostProcessInput0: { inferredType: "Texture2D", nodeType: "ScalarParameter", defaultValue: "" },
  PostProcessInput1: { inferredType: "Texture2D", nodeType: "ScalarParameter", defaultValue: "" },
  PostProcessInput2: { inferredType: "Texture2D", nodeType: "ScalarParameter", defaultValue: "" },
  PostProcessInput3: { inferredType: "Texture2D", nodeType: "ScalarParameter", defaultValue: "" },
  PostProcessInput4: { inferredType: "Texture2D", nodeType: "ScalarParameter", defaultValue: "" },
  PostProcessInput0Size: { inferredType: "float4", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PostProcessInput1Size: { inferredType: "float4", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PostProcessInput2Size: { inferredType: "float4", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PostProcessInput0MinMax: { inferredType: "float4", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PostProcessInput1MinMax: { inferredType: "float4", nodeType: "ScalarParameter", defaultValue: "0.0" },
  SceneDepth:  { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PixelDepth:  { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  WorldDepth:  { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  SceneColor:  { inferredType: "float4", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  ScreenPosition: { inferredType: "float2", nodeType: "ScalarParameter", defaultValue: "0.0" },
  ViewportUV:     { inferredType: "float2", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PixelPosition:  { inferredType: "float2", nodeType: "ScalarParameter", defaultValue: "0.0" },
  SvPosition:     { inferredType: "float4", nodeType: "ScalarParameter", defaultValue: "0.0" },
  ViewSize:       { inferredType: "float2", nodeType: "ScalarParameter", defaultValue: "0.0" },
  ViewTexelSize:  { inferredType: "float2", nodeType: "ScalarParameter", defaultValue: "0.0" },
  SceneTexelSize: { inferredType: "float2", nodeType: "ScalarParameter", defaultValue: "0.0" },
  WorldPosition:   { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  CameraPosition:  { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  CameraVector:    { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  CameraDirection: { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  LightVector:      { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  LightColor:       { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  LightAttenuation: { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  ActorPosition:      { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  ObjectPosition:     { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  ObjectRadius:       { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  ActorWorldPosition: { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  VertexColor:   { inferredType: "float4", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  VertexNormal:  { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  VertexTangent: { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  WorldNormal:   { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  WorldTangent:  { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  WorldBinormal: { inferredType: "float3", nodeType: "VectorParameter", defaultValue: "(R=0.0,G=0.0,B=0.0,A=1.0)" },
  TwoSidedSign:      { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PerInstanceRandom: { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  PrecomputedAOMask: { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
  DistanceCullFade:  { inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" },
};

export const NODE_TYPES = [
  { value: "ScalarParameter", label: "Scalar Parameter" },
  { value: "VectorParameter", label: "Vector Parameter" },
  { value: "TextureObjectParameter", label: "Texture Object" },
  { value: "TextureCoordinate", label: "Texture Coordinate" },
  { value: "Time", label: "Time" },
  { value: "Constant", label: "Constant" },
  { value: "Constant3Vector", label: "Constant3Vector" },
  { value: "SceneTexture", label: "Scene Texture" },
];

// SceneTextureLookup index → ESceneTextureId enum name
export const SCENE_TEXTURE_ID_MAP = {
  0:  "PPI_SceneColor",
  1:  "PPI_SceneDepth",
  2:  "PPI_AmbientOcclusion",
  3:  "PPI_BaseColor",
  4:  "PPI_Specular",
  5:  "PPI_Metallic",
  6:  "PPI_Roughness",
  7:  "PPI_ShadingModel",
  8:  "PPI_WorldNormal",
  9:  "PPI_Opacity",
  10: "PPI_CustomDepth",
  11: "PPI_CustomStencil",
  12: "PPI_SubsurfaceColor",
  13: "PPI_IndirectIrradiance",
  14: "PPI_PostProcessInput0",
  15: "PPI_PostProcessInput1",
  16: "PPI_PostProcessInput2",
  17: "PPI_PostProcessInput3",
  18: "PPI_PostProcessInput4",
  19: "PPI_Velocity",
  20: "PPI_WorldTangent",
  21: "PPI_Anisotropy",
};

export const OUTPUT_TYPES = [
  { value: "CMOT_Float1", label: "Float 1" },
  { value: "CMOT_Float2", label: "Float 2" },
  { value: "CMOT_Float3", label: "Float 3" },
  { value: "CMOT_Float4", label: "Float 4" },
  { value: "CMOT_MaterialAttributes", label: "MaterialAttributes" },
];

export const TYPE_COLORS = {
  "float":     { bg: "rgba(79,195,247,0.1)",  border: "rgba(79,195,247,0.25)",  text: "#4fc3f7" },
  "float2":    { bg: "rgba(102,187,106,0.1)", border: "rgba(102,187,106,0.25)", text: "#66bb6a" },
  "float3":    { bg: "rgba(255,183,77,0.1)",  border: "rgba(255,183,77,0.25)",  text: "#ffb74d" },
  "float4":    { bg: "rgba(239,83,80,0.1)",   border: "rgba(239,83,80,0.25)",   text: "#ef5350" },
  "Texture2D":    { bg: "rgba(171,71,188,0.1)",  border: "rgba(171,71,188,0.25)",  text: "#ab47bc" },
  "SceneTexture": { bg: "rgba(38,166,154,0.1)",  border: "rgba(38,166,154,0.25)",  text: "#26a69a" },
};

export const getTypeColor = (t) =>
  TYPE_COLORS[t] || { bg: "rgba(120,120,140,0.1)", border: "rgba(120,120,140,0.25)", text: "#88899a" };

export function generateGUID() {
  const hex = "0123456789ABCDEF";
  let guid = "";
  for (let i = 0; i < 32; i++) guid += hex[Math.floor(Math.random() * 16)];
  return guid;
}

// Syntax highlight helpers
const KW_SET = new Set([...HLSL_KEYWORDS]);
const TYPE_SET = new Set([...HLSL_TYPES]);
const BUILTIN_SET = new Set([...HLSL_BUILTINS]);

export function highlightHLSL(code) {
  // Tokenize preserving whitespace and structure
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = code.length;
      tokens.push({ type: 'comment', text: code.slice(i, end) });
      i = end;
      continue;
    }
    // Block comment
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = code.length; else end += 2;
      tokens.push({ type: 'comment', text: code.slice(i, end) });
      i = end;
      continue;
    }
    // Number
    if (/[0-9]/.test(code[i]) && (i === 0 || !/[a-zA-Z_]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9.xXa-fA-F]/.test(code[j])) j++;
      if (j < code.length && /[fFhH]/.test(code[j])) j++;
      tokens.push({ type: 'number', text: code.slice(i, j) });
      i = j;
      continue;
    }
    // Identifier / keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      let type = 'ident';
      if (KW_SET.has(word)) type = 'keyword';
      else if (TYPE_SET.has(word)) type = 'type';
      else if (BUILTIN_SET.has(word)) type = 'builtin';
      tokens.push({ type, text: word });
      i = j;
      continue;
    }
    // String
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === '\\') j++; j++; }
      if (j < code.length) j++;
      tokens.push({ type: 'string', text: code.slice(i, j) });
      i = j;
      continue;
    }
    // Other (operators, whitespace, newlines)
    tokens.push({ type: 'plain', text: code[i] });
    i++;
  }
  return tokens;
}
