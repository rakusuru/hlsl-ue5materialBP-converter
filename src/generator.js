import { generateGUID } from './constants';

const EXPRESSION_CLASS_MAP = {
  ScalarParameter: "MaterialExpressionScalarParameter",
  VectorParameter: "MaterialExpressionVectorParameter",
  TextureObjectParameter: "MaterialExpressionTextureObjectParameter",
  TextureCoordinate: "MaterialExpressionTextureCoordinate",
  Time: "MaterialExpressionTime",
  Constant: "MaterialExpressionConstant",
  Constant3Vector: "MaterialExpressionConstant3Vector",
  SceneTexture: "MaterialExpressionSceneTexture",
};

const PB = 'PinType.PinSubCategoryObject=None,PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False';
const PT = 'PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=False,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,';
const PTC = 'PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=True,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,';

function pin(id, name, o = {}) {
  const dir = o.output ? ',Direction="EGPD_Output"' : '';
  const cat = o.category ? `"${o.category}"` : '""';
  const sub = o.subCategory ? `"${o.subCategory}"` : '""';
  const lnk = o.linkedTo ? `,LinkedTo=(${o.linkedTo},)` : '';
  const dv = o.defaultValue ? `,DefaultValue="${o.defaultValue}"` : '';
  const fn = o.friendlyName ? `,PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " ")` : '';
  return `   CustomProperties Pin (PinId=${id},PinName="${name}"${fn}${dir},PinType.PinCategory=${cat},PinType.PinSubCategory=${sub},${PB}${dv}${lnk},${o.notConnectable ? PTC : PT})\n`;
}

export function generateBlueprintPaste(hlslCode, inputs, outputs, returnType, materialName) {
  const escCode = hlslCode.replace(/\r\n/g, "\n").replace(/\n/g, "\\r\\n").replace(/"/g, '\\"');
  const mp = `/Engine/Transient.${materialName}`, gp = `${mp}:MaterialGraph_0`;
  let ni = 0; const nd = [];
  for (const inp of inputs) { const ec = EXPRESSION_CLASS_MAP[inp.nodeType] || "MaterialExpressionScalarParameter"; nd.push({ idx: ni, input: inp, ec, en: `${ec}_${ni}` }); ni++; }
  const cpid = {}, opid = {}, spid = {};
  inputs.forEach(inp => { cpid[inp.name] = generateGUID(); });
  const rpid = generateGUID();
  outputs.forEach(out => { opid[out.name] = generateGUID(); });
  nd.forEach(n => { spid[n.input.name] = generateGUID(); });
  const cng = generateGUID(), ceg = generateGUID();
  const cx = -800, cy = 16, pbx = -1500; let py = -640; const pys = 112;
  const cn = "MaterialGraphNode_Custom_0", ce = "MaterialExpressionCustom_0";
  let r = "";
  r += `Begin Object Class=/Script/UnrealEd.MaterialGraphNode_Custom Name="${cn}" ExportPath="/Script/UnrealEd.MaterialGraphNode_Custom'${gp}.${cn}'"\n`;
  r += `   Begin Object Class=/Script/Engine.MaterialExpressionCustom Name="${ce}" ExportPath="/Script/Engine.MaterialExpressionCustom'${gp}.${cn}.${ce}'"\n   End Object\n`;
  r += `   Begin Object Name="${ce}" ExportPath="/Script/Engine.MaterialExpressionCustom'${gp}.${cn}.${ce}'"\n      Code="${escCode}"\n`;
  if (returnType !== "CMOT_Float3") r += `      OutputType=${returnType}\n`;
  inputs.forEach((inp, i) => { const n = nd[i], nm = `MaterialGraphNode_${n.idx}`; let l = `      Inputs(${i})=(InputName="${inp.name}",Input=(Expression="/Script/Engine.${n.ec}'${nm}.${n.en}'"`;
    if (inp.nodeType === "VectorParameter" && (inp.inferredType === "float3" || !inp.inferredType.includes("4"))) l += `,Mask=1,MaskR=1,MaskG=1,MaskB=1`;
    if (inp.nodeType === "SceneTexture") l += `,Mask=1,MaskR=1,MaskG=1,MaskB=1,MaskA=1`;
    r += l + `))\n`; });
  outputs.forEach((out, i) => { r += `      AdditionalOutputs(${i})=(OutputName="${out.name}")\n`; });
  r += `      ShowCode=True\n      MaterialExpressionEditorX=${cx}\n      MaterialExpressionEditorY=${cy}\n      MaterialExpressionGuid=${ceg}\n      Material="/Script/UnrealEd.PreviewMaterial'${mp}'"\n`;
  if (outputs.length > 0) r += `      bShowOutputNameOnPin=True\n`;
  r += `      Outputs(0)=(OutputName="return")\n`;
  outputs.forEach((out, i) => { r += `      Outputs(${i+1})=(OutputName="${out.name}")\n`; });
  r += `   End Object\n   MaterialExpression="/Script/Engine.MaterialExpressionCustom'${ce}'"\n   NodePosX=${cx}\n   NodePosY=${cy}\n   NodeGuid=${cng}\n`;
  inputs.forEach(inp => { const n = nd.find(x => x.input.name === inp.name); r += pin(cpid[inp.name], inp.name, { category: "required", linkedTo: `MaterialGraphNode_${n.idx} ${spid[inp.name]}` }); });
  r += pin(rpid, "return", { output: true });
  outputs.forEach(out => { r += pin(opid[out.name], out.name, { output: true }); });
  r += `End Object\n`;
  for (const n of nd) { const inp = n.input, nm = `MaterialGraphNode_${n.idx}`, en = n.en, ec = n.ec;
    const ng = generateGUID(), eg = generateGUID(), pg = generateGUID(), op = spid[inp.name], lp = cpid[inp.name];
    const px = pbx, ppy = py; py += pys;
    r += `Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="${nm}" ExportPath="/Script/UnrealEd.MaterialGraphNode'${gp}.${nm}'"\n`;
    r += `   Begin Object Class=/Script/Engine.${ec} Name="${en}" ExportPath="/Script/Engine.${ec}'${gp}.${nm}.${en}'"\n   End Object\n`;
    r += `   Begin Object Name="${en}" ExportPath="/Script/Engine.${ec}'${gp}.${nm}.${en}'"\n`;
    switch (inp.nodeType) {
      case "ScalarParameter": r += `      DefaultValue=${parseFloat(inp.defaultValue||"0.0").toFixed(6)}\n      ParameterName="${inp.name}"\n      ExpressionGUID=${pg}\n`; break;
      case "VectorParameter": r += `      DefaultValue=${inp.defaultValue||"(R=0.000000,G=0.000000,B=0.000000,A=1.000000)"}\n      ParameterName="${inp.name}"\n      ExpressionGUID=${pg}\n`; break;
      case "TextureObjectParameter": r += `      ParameterName="${inp.name}"\n      ExpressionGUID=${pg}\n`; break;
      case "Constant": r += `      R=${parseFloat(inp.defaultValue||"0.0").toFixed(6)}\n`; break;
      case "Constant3Vector": r += `      Constant=${inp.defaultValue||"(R=0.0,G=0.0,B=0.0)"}\n`; break;
      case "SceneTexture": r += `      SceneTextureId=${inp.defaultValue||"PPI_PostProcessInput0"}\n`; break;
    }
    r += `      MaterialExpressionEditorX=${px}\n      MaterialExpressionEditorY=${ppy}\n      MaterialExpressionGuid=${eg}\n      Material="/Script/UnrealEd.PreviewMaterial'${mp}'"\n   End Object\n`;
    r += `   MaterialExpression="/Script/Engine.${ec}'${en}'"\n   NodePosX=${px}\n   NodePosY=${ppy}\n`;
    if (["ScalarParameter","VectorParameter","TextureObjectParameter"].includes(inp.nodeType)) r += `   bCanRenameNode=True\n`;
    if (inp.nodeType === "SceneTexture") r += `   AdvancedPinDisplay=Hidden\n`;
    r += `   NodeGuid=${ng}\n`;
    if (inp.nodeType === "ScalarParameter") r += pin(generateGUID(), "Default Value", { category: "optional", subCategory: "red", defaultValue: inp.defaultValue||"0.0", notConnectable: true });
    else if (inp.nodeType === "VectorParameter") r += pin(generateGUID(), "Default Value", { category: "optional", subCategory: "rgba", defaultValue: inp.defaultValue||"(R=0.000000,G=0.000000,B=0.000000,A=1.000000)", notConnectable: true });
    else if (inp.nodeType === "Constant") r += pin(generateGUID(), "Value", { category: "optional", subCategory: "red", defaultValue: inp.defaultValue||"0.0", notConnectable: true });
    else if (inp.nodeType === "SceneTexture") {
      // SceneTexture input pins
      r += pin(generateGUID(), "UVs", { category: "optional" });
      // Scene Texture Id enum pin
      const stIdName = (inp.defaultValue || "PPI_PostProcessInput0").replace("PPI_", "");
      r += `   CustomProperties Pin (PinId=${generateGUID()},PinName="Scene Texture Id",PinType.PinCategory="optional",PinType.PinSubCategory="byte",PinType.PinSubCategoryObject="/Script/CoreUObject.Enum'/Script/Engine.ESceneTextureId'",PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False,DefaultValue="${stIdName}",PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=True,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=True,bOrphanedPin=False,)\n`;
      r += pin(generateGUID(), "Filtered", { category: "optional", subCategory: "bool", defaultValue: "false", notConnectable: true });
    }

    // Output pin — SceneTexture uses "Color" (mask/rgba), others use "Output"
    if (inp.nodeType === "SceneTexture") {
      r += pin(op, "Color", { output: true, category: "mask", subCategory: "rgba", linkedTo: `${cn} ${lp}` });
      r += pin(generateGUID(), "Size", { output: true });
      r += pin(generateGUID(), "InvSize", { output: true });
    } else {
      r += pin(op, "Output", { output: true, friendlyName: true, category: inp.nodeType === "VectorParameter" ? "mask" : "", linkedTo: `${cn} ${lp}` });
    }
    if (inp.nodeType === "VectorParameter") { for (const [s, sub] of [["Output2","red"],["Output3","green"],["Output4","blue"],["Output5","alpha"]]) r += pin(generateGUID(), s, { output: true, friendlyName: true, category: "mask", subCategory: sub }); }
    r += `End Object\n`;
  }
  return r;
}
