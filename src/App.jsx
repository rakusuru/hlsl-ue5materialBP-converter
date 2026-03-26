import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NODE_TYPES, OUTPUT_TYPES, getTypeColor, highlightHLSL } from './constants';
import { parseHLSL } from './parser';
import { generateBlueprintPaste } from './generator';

// ============================================================
// Syntax-highlighted code editor (overlay approach)
// ============================================================
function CodeEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const tokens = useMemo(() => highlightHLSL(value), [value]);

  const handleScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const colorMap = {
    keyword: '#c678dd',
    type: '#e5c07b',
    builtin: '#61afef',
    comment: '#5c6370',
    number: '#d19a66',
    string: '#98c379',
    ident: '#c5d0dc',
    plain: '#c5d0dc',
  };

  return (
    <div className="code-editor">
      <pre ref={preRef} className="code-highlight" aria-hidden="true">
        {tokens.map((tok, i) => (
          <span key={i} style={{ color: colorMap[tok.type] }}>{tok.text}</span>
        ))}
        {'\n'}
      </pre>
      <textarea
        ref={textareaRef}
        className="code-textarea"
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}

// ============================================================
// Result Modal
// ============================================================
function ResultModal({ isOpen, onClose, content }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>生成結果</h3>
          <div className="modal-actions">
            <button className="btn ba btn-sm" onClick={handleCopy}>
              {copied ? '✓ コピー済み' : '📋 コピー'}
            </button>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <p className="modal-hint">UE5 マテリアルエディタで Ctrl+V で貼り付け</p>
        <textarea ref={textareaRef} className="oa modal-textarea" value={content} readOnly />
      </div>
    </div>
  );
}

// ============================================================
// Toast notification
// ============================================================
function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? 'toast-visible' : ''}`}>
      {message}
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function App() {
  const [hlslCode, setHlslCode] = useState("");
  const [materialName, setMaterialName] = useState("M_Custom");
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [returnType, setReturnType] = useState("CMOT_Float3");
  const [generated, setGenerated] = useState("");
  const [parsed, setParsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultCollapsed, setResultCollapsed] = useState(true);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
  };

  const handleParse = useCallback(() => {
    const result = parseHLSL(hlslCode);
    setInputs(result.inputs);
    setOutputs(result.outputs);
    setReturnType(result.returnType);
    setParsed(true);
    setGenerated("");
    setResultCollapsed(true);
  }, [hlslCode]);

  const handleGenerateAndCopy = useCallback(async () => {
    const result = generateBlueprintPaste(hlslCode, inputs, outputs, returnType, materialName);
    setGenerated(result);
    try {
      await navigator.clipboard.writeText(result);
      showToast('✓ クリップボードにコピーしました');
    } catch { showToast('生成完了（手動コピーしてください）'); }
  }, [hlslCode, inputs, outputs, returnType, materialName]);

  // One-click: parse → generate → copy
  const handleOneClick = useCallback(async () => {
    if (!hlslCode.trim()) return;
    const parseResult = parseHLSL(hlslCode);
    setInputs(parseResult.inputs);
    setOutputs(parseResult.outputs);
    setReturnType(parseResult.returnType);
    setParsed(true);
    const result = generateBlueprintPaste(hlslCode, parseResult.inputs, parseResult.outputs, parseResult.returnType, materialName);
    setGenerated(result);
    setResultCollapsed(true);
    try {
      await navigator.clipboard.writeText(result);
      showToast(`✓ ${parseResult.inputs.length} inputs · ${parseResult.outputs.length} outputs → コピー済み`);
    } catch { showToast('生成完了（手動コピーしてください）'); }
  }, [hlslCode, materialName]);

  const updateInput = (i, f, v) => setInputs(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const removeInput = (i) => setInputs(p => p.filter((_, idx) => idx !== i));
  const addInput = () => setInputs(p => [...p, { name: "NewInput", inferredType: "float", nodeType: "ScalarParameter", defaultValue: "0.0" }]);
  const updateOutput = (i, f, v) => setOutputs(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const removeOutput = (i) => setOutputs(p => p.filter((_, idx) => idx !== i));
  const addOutput = () => setOutputs(p => [...p, { name: "NewOutput" }]);

  return (
    <div className="app">
      <Toast {...toast} />
      <ResultModal isOpen={modalOpen} onClose={() => setModalOpen(false)} content={generated} />

      {/* Header */}
      <header className="hdr">
        <div className="hdr-top">
          <div className="hdr-icon">⚙</div>
          <div>
            <h1>
              <span className="hdr-hlsl">HLSL</span>
              <span className="ar">→</span>
              <span className="hdr-ue">UE5 Material Blueprint</span>
            </h1>
            <p>Custom Node Converter — 解析・生成・コピーを自動化</p>
          </div>
        </div>
      </header>

      {/* Config + One-click */}
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
        <CodeEditor
          value={hlslCode}
          onChange={e => setHlslCode(e.target.value)}
          placeholder="// カスタムノードの HLSL コードを貼り付け..."
        />
        <div className="acts">
          <button className="btn bp" onClick={handleParse}>▶ 解析</button>
          <button className="btn ba" onClick={handleOneClick} disabled={!hlslCode.trim()}>⚡ 一括変換</button>
          {parsed && <span className="hint">{inputs.length} inputs · {outputs.length} outputs</span>}
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
                        <td><input className="ci" value={inp.name} onChange={e => updateInput(i, "name", e.target.value)} /></td>
                        <td><span className="tb" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{inp.inferredType}</span></td>
                        <td><select className="cs" value={inp.nodeType} onChange={e => updateInput(i, "nodeType", e.target.value)}>{NODE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></td>
                        <td><input className="ci" value={inp.defaultValue} onChange={e => updateInput(i, "defaultValue", e.target.value)} placeholder={inp.nodeType === "Time" || inp.nodeType === "TextureCoordinate" ? "—" : "0.0"} disabled={inp.nodeType === "Time" || inp.nodeType === "TextureCoordinate"} /></td>
                        <td style={{ textAlign: "center" }}><button className="bi" onClick={() => removeInput(i)}>✕</button></td>
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
                <thead><tr><th>Output Name</th><th style={{ width: "7%" }}></th></tr></thead>
                <tbody>
                  {outputs.length === 0 ? (
                    <tr><td colSpan={2} style={{ color: "var(--t3)", fontStyle: "italic", fontSize: 12 }}>追加出力ピンなし（return のみ）</td></tr>
                  ) : outputs.map((out, i) => (
                    <tr key={i}>
                      <td><input className="ci" value={out.name} onChange={e => updateOutput(i, "name", e.target.value)} /></td>
                      <td style={{ textAlign: "center" }}><button className="bi" onClick={() => removeOutput(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="bg" onClick={addOutput}>+ 出力ピンを追加</button>
            </div>
          </div>

          {/* Generate Actions */}
          <div className="card card-generate">
            <div className="acts" style={{ marginTop: 0 }}>
              <button className="btn ba" onClick={handleGenerateAndCopy}>⚡ 生成してコピー</button>
              {generated && (
                <>
                  <button className="btn bp btn-sm" onClick={() => setModalOpen(true)}>🔍 結果を表示</button>
                  <button className="btn bg btn-sm" onClick={() => setResultCollapsed(c => !c)}>
                    {resultCollapsed ? '▼ 展開' : '▲ 折りたたむ'}
                  </button>
                </>
              )}
            </div>

            {/* Collapsible result */}
            {generated && !resultCollapsed && (
              <div className="result-panel">
                <span className="fl" style={{ margin: 0, marginBottom: 6, display: "block" }}>
                  生成結果 — Ctrl+V でマテリアルエディタに貼り付け
                </span>
                <textarea className="oa" value={generated} readOnly />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
