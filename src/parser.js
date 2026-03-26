import { HLSL_KEYWORDS, HLSL_TYPES, HLSL_BUILTINS, UE_BUILTINS } from './constants';

export function parseHLSL(code) {
  let cleaned = code.replace(/\/\/.*$/gm, " ").replace(/\/\*[\s\S]*?\*\//g, " ");

  // 1. Type-declared variables (locals)
  const declaredVars = new Map();
  const typePattern = new RegExp("\\b(float[1234]?|half[1234]?|int[234]?|uint[234]?|bool[234]?)\\s+(\\w+)", "g");
  let match;
  while ((match = typePattern.exec(cleaned)) !== null) {
    declaredVars.set(match[2], match[1]);
  }

  // 2. Texture sample patterns: XXX.Sample(XXXSampler, ...)
  const texSamplePattern = /(\w+)\.Sample\s*\(\s*(\w+)/g;
  const textureVars = new Set();
  const samplerVars = new Set();
  while ((match = texSamplePattern.exec(cleaned)) !== null) {
    textureVars.add(match[1]);
    samplerVars.add(match[2]);
  }

  // 3. Assignments to undeclared variables (potential outputs)
  const assignedUndeclared = new Set();
  for (const line of cleaned.split(/\n/)) {
    for (const m of [...line.matchAll(/\b([A-Za-z_]\w*)\s*([+\-*\/!<>]?)=/g)]) {
      if (m[2] === "" && line[m.index + m[0].length] !== "=") {
        const name = m[1];
        if (!declaredVars.has(name) && !HLSL_KEYWORDS.has(name) && !HLSL_TYPES.has(name)) {
          assignedUndeclared.add(name);
        }
      }
    }
  }

  // 4. All identifiers (excluding swizzle/member access via lookbehind)
  const identPattern = /(?<!\.)(\b[A-Za-z_]\w*)\b/g;
  const allIdents = new Set();
  while ((match = identPattern.exec(cleaned)) !== null) {
    allIdents.add(match[1]);
  }

  // 5. Read variables
  const readVars = new Set();
  for (const line of cleaned.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0 && trimmed[eqIdx - 1] !== "!" && trimmed[eqIdx - 1] !== "<" &&
        trimmed[eqIdx - 1] !== ">" && trimmed[eqIdx + 1] !== "=") {
      for (const m of trimmed.substring(eqIdx + 1).matchAll(/(?<!\.)(\b[A-Za-z_]\w*)\b/g)) {
        readVars.add(m[1]);
      }
    } else {
      for (const m of trimmed.matchAll(/(?<!\.)(\b[A-Za-z_]\w*)\b/g)) {
        readVars.add(m[1]);
      }
    }
  }

  // 6. Swizzle usage for type inference
  const swizzleMap = new Map();
  const swizzlePattern = /\b(\w+)\.([xyzwrgba]+)\b/g;
  while ((match = swizzlePattern.exec(cleaned)) !== null) {
    const name = match[1];
    const swizzle = match[2];
    let dim = 1;
    if (/[zb]/.test(swizzle)) dim = Math.max(dim, 3);
    else if (/[yg]/.test(swizzle)) dim = Math.max(dim, 2);
    if (/[wa]/.test(swizzle)) dim = 4;
    swizzleMap.set(name, Math.max(swizzleMap.get(name) || 1, dim));
  }

  // 7. Classify variables
  const skipSet = new Set([
    ...HLSL_KEYWORDS, ...HLSL_TYPES, ...HLSL_BUILTINS, ...UE_BUILTINS,
    ...samplerVars, ...declaredVars.keys(),
  ]);

  const inputs = [];
  const outputs = [];

  for (const name of allIdents) {
    if (skipSet.has(name) || /^\d/.test(name) || (name.length <= 1 && /^[a-z]$/.test(name))) continue;

    const isTexture = textureVars.has(name);
    const isAssigned = assignedUndeclared.has(name);
    const isRead = readVars.has(name);

    if (isTexture) {
      inputs.push({ name, inferredType: "Texture2D", nodeType: "TextureObjectParameter", defaultValue: "" });
      continue;
    }

    if (isAssigned && !isRead) {
      outputs.push({ name });
      continue;
    }

    if (isRead && !declaredVars.has(name)) {
      if (isAssigned) {
        const firstReadIdx = cleaned.indexOf(name);
        const firstAssignMatch = new RegExp(`\\b${name}\\s*=`).exec(cleaned);
        if (firstAssignMatch && firstAssignMatch.index <= firstReadIdx + name.length + 3) {
          outputs.push({ name });
          continue;
        }
      }

      let inferredType = "float";
      let nodeType = "ScalarParameter";
      let defaultValue = "0.0";

      const swizzleDim = swizzleMap.get(name);
      if (swizzleDim) {
        if (swizzleDim >= 4) { inferredType = "float4"; nodeType = "VectorParameter"; defaultValue = "(R=0.0,G=0.0,B=0.0,A=1.0)"; }
        else if (swizzleDim >= 3) { inferredType = "float3"; nodeType = "VectorParameter"; defaultValue = "(R=0.0,G=0.0,B=0.0,A=1.0)"; }
        else if (swizzleDim >= 2) { inferredType = "float2"; nodeType = "VectorParameter"; defaultValue = "(R=0.0,G=0.0,B=0.0,A=1.0)"; }
      }

      const nameLower = name.toLowerCase();
      if (nameLower === "time" || nameLower === "gametime") {
        nodeType = "Time"; inferredType = "float"; defaultValue = "";
      } else if (nameLower.includes("uv") || nameLower.includes("texcoord") || nameLower.includes("coord")) {
        nodeType = "TextureCoordinate"; inferredType = "float2"; defaultValue = "";
      } else if ((nameLower.includes("color") || nameLower.includes("colour")) && nodeType !== "VectorParameter") {
        nodeType = "VectorParameter"; inferredType = "float3"; defaultValue = "(R=0.0,G=0.0,B=0.0,A=1.0)";
      }

      inputs.push({ name, inferredType, nodeType, defaultValue });
    }
  }

  // 8. Return type
  let returnType = "CMOT_Float3";
  const retMatch = cleaned.match(/return\s+([\w.]+)/);
  if (retMatch) {
    const t = declaredVars.get(retMatch[1]);
    if (t === "float" || t === "float1") returnType = "CMOT_Float1";
    else if (t === "float2") returnType = "CMOT_Float2";
    else if (t === "float3") returnType = "CMOT_Float3";
    else if (t === "float4") returnType = "CMOT_Float4";
  }
  const retCon = cleaned.match(/return\s+(float[1234]?)\s*\(/);
  if (retCon) {
    const t = retCon[1];
    if (t === "float" || t === "float1") returnType = "CMOT_Float1";
    else if (t === "float2") returnType = "CMOT_Float2";
    else if (t === "float3") returnType = "CMOT_Float3";
    else if (t === "float4") returnType = "CMOT_Float4";
  }

  // Sort inputs
  const typeOrder = { TextureCoordinate: 0, Time: 1, VectorParameter: 2, ScalarParameter: 3, TextureObjectParameter: 4, Constant: 5, Constant3Vector: 5 };
  inputs.sort((a, b) => (typeOrder[a.nodeType] ?? 99) - (typeOrder[b.nodeType] ?? 99));

  return { inputs, outputs, returnType };
}
