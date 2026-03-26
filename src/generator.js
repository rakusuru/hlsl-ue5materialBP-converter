import { generateGUID } from './constants';

const EXPRESSION_CLASS_MAP = {
  ScalarParameter: "MaterialExpressionScalarParameter",
  VectorParameter: "MaterialExpressionVectorParameter",
  TextureObjectParameter: "MaterialExpressionTextureObjectParameter",
  TextureCoordinate: "MaterialExpressionTextureCoordinate",
  Time: "MaterialExpressionTime",
  Constant: "MaterialExpressionConstant",
  Constant3Vector: "MaterialExpressionConstant3Vector",
};

const PIN_BOILERPLATE = 'PinType.PinSubCategoryObject=None,PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False';
const PIN_TAIL = 'PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=False,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,';
const PIN_TAIL_NC = 'PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=True,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,';

function pin(id, name, opts = {}) {
  const dir = opts.output ? ',Direction="EGPD_Output"' : '';
  const cat = opts.category ? `"${opts.category}"` : '""';
  const sub = opts.subCategory ? `"${opts.subCategory}"` : '""';
  const linked = opts.linkedTo ? `,LinkedTo=(${opts.linkedTo},)` : '';
  const defVal = opts.defaultValue ? `,DefaultValue="${opts.defaultValue}"` : '';
  const friendly = opts.friendlyName ? `,PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " ")` : '';
  const tail = opts.notConnectable ? PIN_TAIL_NC : PIN_TAIL;
  return `   CustomProperties Pin (PinId=${id},PinName="${name}"${friendly}${dir},PinType.PinCategory=${cat},PinType.PinSubCategory=${sub},${PIN_BOILERPLATE}${defVal}${linked},${tail})\n`;
}

export function generateBlueprintPaste(hlslCode, inputs, outputs, returnType, materialName) {
  const escCode = hlslCode.replace(/\r\n/g, "\n").replace(/\n/g, "\\r\\n").replace(/"/g, '\\"');
  const matPath = `/Engine/Transient.${materialName}`;
  const graphPath = `${matPath}:MaterialGraph_0`;

  // Build node data
  let nodeIdx = 0;
  const nodeData = [];
  for (const inp of inputs) {
    const ec = EXPRESSION_CLASS_MAP[inp.nodeType] || "MaterialExpressionScalarParameter";
    nodeData.push({ idx: nodeIdx, input: inp, expressionClass: ec, expressionName: `${ec}_${nodeIdx}` });
    nodeIdx++;
  }

  // Generate IDs
  const customPinIds = {};
  inputs.forEach(inp => { customPinIds[inp.name] = generateGUID(); });
  const returnPinId = generateGUID();
  const outputPinIds = {};
  outputs.forEach(out => { outputPinIds[out.name] = generateGUID(); });
  const srcPinIds = {};
  nodeData.forEach(nd => { srcPinIds[nd.input.name] = generateGUID(); });

  const customNodeGuid = generateGUID();
  const customExprGuid = generateGUID();
  const customX = -800, customY = 16, paramBaseX = -1500;
  let paramY = -640;
  const paramYSpacing = 112;
  const cn = "MaterialGraphNode_Custom_0", ce = "MaterialExpressionCustom_0";

  let r = "";

  // ---- Custom Node ----
  r += `Begin Object Class=/Script/UnrealEd.MaterialGraphNode_Custom Name="${cn}" ExportPath="/Script/UnrealEd.MaterialGraphNode_Custom'${graphPath}.${cn}'"\n`;
  r += `   Begin Object Class=/Script/Engine.MaterialExpressionCustom Name="${ce}" ExportPath="/Script/Engine.MaterialExpressionCustom'${graphPath}.${cn}.${ce}'"\n   End Object\n`;
  r += `   Begin Object Name="${ce}" ExportPath="/Script/Engine.MaterialExpressionCustom'${graphPath}.${cn}.${ce}'"\n`;
  r += `      Code="${escCode}"\n`;
  if (returnType !== "CMOT_Float3") r += `      OutputType=${returnType}\n`;

  // Inputs
  inputs.forEach((inp, i) => {
    const nd = nodeData[i], nm = `MaterialGraphNode_${nd.idx}`;
    let line = `      Inputs(${i})=(InputName="${inp.name}",Input=(Expression="/Script/Engine.${nd.expressionClass}'${nm}.${nd.expressionName}'"`;
    if (inp.nodeType === "VectorParameter" && (inp.inferredType === "float3" || !inp.inferredType.includes("4"))) {
      line += `,Mask=1,MaskR=1,MaskG=1,MaskB=1`;
    }
    r += line + `))\n`;
  });

  // Additional outputs
  outputs.forEach((out, i) => { r += `      AdditionalOutputs(${i})=(OutputName="${out.name}")\n`; });

  r += `      ShowCode=True\n`;
  r += `      MaterialExpressionEditorX=${customX}\n      MaterialExpressionEditorY=${customY}\n`;
  r += `      MaterialExpressionGuid=${customExprGuid}\n`;
  r += `      Material="/Script/UnrealEd.PreviewMaterial'${matPath}'"\n`;
  if (outputs.length > 0) r += `      bShowOutputNameOnPin=True\n`;
  r += `      Outputs(0)=(OutputName="return")\n`;
  outputs.forEach((out, i) => { r += `      Outputs(${i + 1})=(OutputName="${out.name}")\n`; });
  r += `   End Object\n`;
  r += `   MaterialExpression="/Script/Engine.MaterialExpressionCustom'${ce}'"\n`;
  r += `   NodePosX=${customX}\n   NodePosY=${customY}\n   NodeGuid=${customNodeGuid}\n`;

  // Custom node pins
  inputs.forEach(inp => {
    const nd = nodeData.find(n => n.input.name === inp.name);
    r += pin(customPinIds[inp.name], inp.name, { category: "required", linkedTo: `MaterialGraphNode_${nd.idx} ${srcPinIds[inp.name]}` });
  });
  r += pin(returnPinId, "return", { output: true });
  outputs.forEach(out => { r += pin(outputPinIds[out.name], out.name, { output: true }); });
  r += `End Object\n`;

  // ---- Source Nodes ----
  for (const nd of nodeData) {
    const inp = nd.input, nm = `MaterialGraphNode_${nd.idx}`, en = nd.expressionName, ec = nd.expressionClass;
    const nodeGuid = generateGUID(), exprGuid = generateGUID(), paramGuid = generateGUID();
    const outPinId = srcPinIds[inp.name], linkedPinId = customPinIds[inp.name];
    const posX = paramBaseX, posY = paramY;
    paramY += paramYSpacing;

    r += `Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="${nm}" ExportPath="/Script/UnrealEd.MaterialGraphNode'${graphPath}.${nm}'"\n`;
    r += `   Begin Object Class=/Script/Engine.${ec} Name="${en}" ExportPath="/Script/Engine.${ec}'${graphPath}.${nm}.${en}'"\n   End Object\n`;
    r += `   Begin Object Name="${en}" ExportPath="/Script/Engine.${ec}'${graphPath}.${nm}.${en}'"\n`;

    switch (inp.nodeType) {
      case "ScalarParameter":
        r += `      DefaultValue=${parseFloat(inp.defaultValue || "0.0").toFixed(6)}\n      ParameterName="${inp.name}"\n      ExpressionGUID=${paramGuid}\n`;
        break;
      case "VectorParameter":
        r += `      DefaultValue=${inp.defaultValue || "(R=0.000000,G=0.000000,B=0.000000,A=1.000000)"}\n      ParameterName="${inp.name}"\n      ExpressionGUID=${paramGuid}\n`;
        break;
      case "TextureObjectParameter":
        r += `      ParameterName="${inp.name}"\n      ExpressionGUID=${paramGuid}\n`;
        break;
      case "Constant":
        r += `      R=${parseFloat(inp.defaultValue || "0.0").toFixed(6)}\n`;
        break;
      case "Constant3Vector":
        r += `      Constant=${inp.defaultValue || "(R=0.0,G=0.0,B=0.0)"}\n`;
        break;
    }

    r += `      MaterialExpressionEditorX=${posX}\n      MaterialExpressionEditorY=${posY}\n`;
    r += `      MaterialExpressionGuid=${exprGuid}\n      Material="/Script/UnrealEd.PreviewMaterial'${matPath}'"\n`;
    r += `   End Object\n`;
    r += `   MaterialExpression="/Script/Engine.${ec}'${en}'"\n   NodePosX=${posX}\n   NodePosY=${posY}\n`;

    if (["ScalarParameter", "VectorParameter", "TextureObjectParameter"].includes(inp.nodeType)) {
      r += `   bCanRenameNode=True\n`;
    }
    r += `   NodeGuid=${nodeGuid}\n`;

    // Default value pin
    if (inp.nodeType === "ScalarParameter") {
      r += pin(generateGUID(), "Default Value", { category: "optional", subCategory: "red", defaultValue: inp.defaultValue || "0.0", notConnectable: true });
    } else if (inp.nodeType === "VectorParameter") {
      r += pin(generateGUID(), "Default Value", { category: "optional", subCategory: "rgba", defaultValue: inp.defaultValue || "(R=0.000000,G=0.000000,B=0.000000,A=1.000000)", notConnectable: true });
    } else if (inp.nodeType === "Constant") {
      r += pin(generateGUID(), "Value", { category: "optional", subCategory: "red", defaultValue: inp.defaultValue || "0.0", notConnectable: true });
    }

    // Output pin
    r += pin(outPinId, "Output", {
      output: true,
      friendlyName: true,
      category: inp.nodeType === "VectorParameter" ? "mask" : "",
      linkedTo: `${cn} ${linkedPinId}`,
    });

    // VectorParameter channel pins
    if (inp.nodeType === "VectorParameter") {
      for (const [suffix, sub] of [["Output2", "red"], ["Output3", "green"], ["Output4", "blue"], ["Output5", "alpha"]]) {
        r += pin(generateGUID(), suffix, { output: true, friendlyName: true, category: "mask", subCategory: sub });
      }
    }

    r += `End Object\n`;
  }

  return r;
}
