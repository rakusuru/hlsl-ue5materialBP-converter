import { useState, useCallback, useRef } from 'react';
import { NODE_TYPES, OUTPUT_TYPES, getTypeColor } from './constants';
import { parseHLSL } from './parser';
import { generateBlueprintPaste } from './generator';

export default function App() {
  const [hlslCode, setHlslCode] = useState("");
  const [materialName, setMaterialName] = useState("M_Custom");
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [returnType, setReturnType] = useState("CMOT_Float3");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [parsed, setParsed] = useState(false);
  const outputRef = useRef(null);

  const handleParse = useCallback(() => {
    const result = parseHLSL(hlslCode);
    setInputs(result.inputs);
    setOutputs(result.outputs);
    setReturnType(result.returnType);
    setParsed(true);
    setGenerated("");
    setCopied(false);
  }, [hlslCode]);

  const handleGenerateAndCopy = useCallback(async () => {
    const result = generateBlueprintPaste(hlslCode, inputs, outputs, returnType, materialName);
    setGenerated(result);
    setCopied(false);
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.select();
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      }, 50);
    }
  }, [hlslCode, inputs, outputs, returnType, materialName]);

  const updateInput = (i, field, value) => setInputs(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: value } : x));
  const removeInput = (i) => setInputs(prev => prev.filter((_, idx) => idx !== i));
  const addInput = () => setInputs(prev => [...prev, { name: "NewInput", inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" }]);
  const updateOutput = (i, field, value) => setOutputs(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: value } : x));
  const removeOutput = (i) => setOutputs(prev => prev.filter((_, idx) => idx !== i));
  const addOutput = () => setOutputs(prev => [...prev, { name: "NewOutput" }]);

  return (
    <div className="app">
      {/* Header */}
      <div className="hdr">
        <h1>HLSL <span className="ar">→</span> UE5 Blueprint</h1>
        <p>Custom HLSL ノードから Blueprint Paste Format を自動生成</p>
      </div>

      {/* Config */}
      <div className="card">
        <div className="cfr">
          <div>
            <span className="fl">Material Name</span>
            <input className="ti" value={materialName} onChange={e => setMaterialName(e.target.value)} />
          </div>
          <div className="nw">
            <span className="fl">Output Type</span>
            <select className="si" value={returnType} onChange={e => setReturnType(e.target.value)}>
              {OUTPUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Code Input */}
      <div className="card">
        <div className="card-l"><span className="dot" /> HLSL Code</div>
        <textarea
          className="ca"
          value={hlslCode}
          onChange={e => setHlslCode(e.target.value)}
          placeholder="// カスタムノードの HLSL コードを貼り付け..."
          spellCheck={false}
        />
        <div className="acts">
          <button className="btn bp" onClick={handleParse}>▶ 解析する</button>
          {parsed && <span className="hint">{inputs.length} inputs · {outputs.length} outputs 検出</span>}
        </div>
      </div>

      {/* Parsed Results */}
      {parsed && (
        <>
          {/* Inputs Table */}
          <div className="card">
            <div className="st">
              入力ピン <span className="cnt">{inputs.length}</span>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Name</th>
                    <th style={{ width: "12%" }}>Type</th>
                    <th style={{ width: "28%" }}>Node Type</th>
                    <th style={{ width: "28%" }}>Default Value</th>
                    <th style={{ width: "7%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {inputs.map((inp, i) => {
                    const tc = getTypeColor(inp.inferredType);
                    return (
                      <tr key={i}>
                        <td>
                          <input className="ci" value={inp.name} onChange={e => updateInput(i, "name", e.target.value)} />
                        </td>
                        <td>
                          <span className="tb" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                            {inp.inferredType}
                          </span>
                        </td>
                        <td>
                          <select className="cs" value={inp.nodeType} onChange={e => updateInput(i, "nodeType", e.target.value)}>
                            {NODE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <input
                            className="ci"
                            value={inp.defaultValue}
                            onChange={e => updateInput(i, "defaultValue", e.target.value)}
                            placeholder={inp.nodeType === "Time" || inp.nodeType === "TextureCoordinate" ? "—" : "0.0"}
                            disabled={inp.nodeType === "Time" || inp.nodeType === "TextureCoordinate"}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button className="bi" onClick={() => removeInput(i)}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="bg" onClick={addInput}>+ 入力ピンを追加</button>
            </div>
          </div>

          {/* Outputs Table */}
          <div className="card">
            <div className="st">
              追加出力ピン <span className="cnt">{outputs.length}</span>
              <span className="ss">return は自動生成</span>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Output Name</th>
                    <th style={{ width: "7%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {outputs.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ color: "var(--t3)", fontStyle: "italic", fontSize: 12 }}>
                        追加出力ピンなし（return のみ）
                      </td>
                    </tr>
                  ) : outputs.map((out, i) => (
                    <tr key={i}>
                      <td>
                        <input className="ci" value={out.name} onChange={e => updateOutput(i, "name", e.target.value)} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="bi" onClick={() => removeOutput(i)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="bg" onClick={addOutput}>+ 出力ピンを追加</button>
            </div>
          </div>

          {/* Generate & Output */}
          <div className="card" style={{ borderColor: generated ? "rgba(245,158,11,0.3)" : undefined }}>
            <div className="acts" style={{ marginTop: 0 }}>
              <button className="btn ba" onClick={handleGenerateAndCopy}>⚡ 生成してコピー</button>
              {copied && <span className="cb">✓ コピー済み</span>}
            </div>
            {generated && (
              <div style={{ marginTop: 16 }}>
                <span className="fl" style={{ margin: 0, marginBottom: 6, display: "block" }}>
                  生成結果 — Ctrl+V でマテリアルエディタに貼り付け
                </span>
                <textarea ref={outputRef} className="oa" value={generated} readOnly />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
