export const HLSL_KEYWORDS = new Set(["if","else","for","while","do","return","break","continue","switch","case","default","struct","typedef","void","const","static","inline","true","false","discard"]);

export const HLSL_TYPES = new Set(["float","float1","float2","float3","float4","half","half1","half2","half3","half4","int","int2","int3","int4","uint","uint2","uint3","uint4","bool","bool2","bool3","bool4","Texture2D","Texture3D","TextureCube","SamplerState","FMaterialPixelParameters","FMaterialVertexParameters"]);

export const HLSL_BUILTINS = new Set(["sin","cos","tan","asin","acos","atan","atan2","sincos","sqrt","rsqrt","pow","exp","exp2","log","log2","log10","abs","sign","floor","ceil","round","trunc","frac","fmod","modf","min","max","clamp","saturate","lerp","step","smoothstep","dot","cross","normalize","length","distance","reflect","refract","mul","transpose","determinant","ddx","ddy","fwidth","any","all","clip","tex2D","tex2Dlod","Sample","radians","degrees","mad","rcp","isnan","isinf","isfinite","asuint","asfloat","asint","f16tof32","f32tof16","countbits","firstbithigh","firstbitlow","reversebits","InterlockedAdd","InterlockedAnd","InterlockedOr","InterlockedXor","InterlockedMin","InterlockedMax","InterlockedExchange","InterlockedCompareExchange","GroupMemoryBarrier","GroupMemoryBarrierWithGroupSync","DeviceMemoryBarrier","AllMemoryBarrier","AllMemoryBarrierWithGroupSync"]);

export const UE_BUILTINS = new Set(["View","ResolvedView","Primitive","Parameters","GetDefaultSceneTextureUV","CalcSceneTexCoord","SceneTextureLookup","DecodeSceneColorForMaterialNode","GetScreenPosition","GetWorldPosition","MaterialFloat","MaterialFloat2","MaterialFloat3","MaterialFloat4"]);

export const NODE_TYPES = [
  { value: "ScalarParameter", label: "Scalar Parameter" },
  { value: "VectorParameter", label: "Vector Parameter" },
  { value: "TextureObjectParameter", label: "Texture Object" },
  { value: "TextureCoordinate", label: "Texture Coordinate" },
  { value: "Time", label: "Time" },
  { value: "Constant", label: "Constant" },
  { value: "Constant3Vector", label: "Constant3Vector" },
];

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
  "Texture2D": { bg: "rgba(171,71,188,0.1)",  border: "rgba(171,71,188,0.25)",  text: "#ab47bc" },
};

export const getTypeColor = (t) =>
  TYPE_COLORS[t] || { bg: "rgba(120,120,140,0.1)", border: "rgba(120,120,140,0.25)", text: "#88899a" };

export function generateGUID() {
  const hex = "0123456789ABCDEF";
  let guid = "";
  for (let i = 0; i < 32; i++) guid += hex[Math.floor(Math.random() * 16)];
  return guid;
}
