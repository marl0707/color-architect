import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Layout, Type, Moon, Sun, Shuffle, CheckCircle, ArrowRight, Menu, X, Star, Sparkles, Copy, Check, Search, Tag, User } from 'lucide-react';

const App = () => {
  const defaultColors = {
    base: '#f8fafc',
    main: '#3b82f6',
    sub: '#bfdbfe',
    accent: '#f59e0b',
    text: '#1e293b',
  };

  const [colors, setColors] = useState(defaultColors);
  const [activeSlots, setActiveSlots] = useState(4);
  const [styleMode, setStyleMode] = useState('clean');
  const [showToast, setShowToast] = useState(false);

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#1e293b' : '#ffffff';
  };

  const updateColor = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const getThemeStyles = () => {
    let styles = {
      '--c-base': colors.base,
      '--c-main': colors.main,
      '--c-sub': colors.sub,
      '--c-accent': colors.accent,
      '--c-text': colors.text,
      '--c-on-main': getContrastColor(colors.main),
      '--c-on-accent': getContrastColor(colors.accent),
      '--c-border': styleMode === 'dark' ? '#334155' : '#e2e8f0',
    };

    if (styleMode === 'dark') {
      styles['--c-base'] = '#0f172a';
      styles['--c-text'] = '#f1f5f9';
    }

    if (activeSlots < 4) styles['--c-accent'] = colors.main;
    if (activeSlots < 3) styles['--c-sub'] = colors.base;
    if (activeSlots < 2) {
      styles['--c-main'] = '#334155';
    }

    return styles;
  };

  // HSL⇔HEX変換ユーティリティ
  const hslToHex = (h, s, l) => {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => { const k = (n + h / 30) % 12; const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = 0, l = (max + min) / 2;
    if (d !== 0) { s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break; case g: h = ((b - r) / d + 2) * 60; break; case b: h = ((r - g) / d + 4) * 60; break; } }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  };

  // 完全ランダム生成
  const generateFullRandom = () => {
    const rc = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColors({ ...colors, main: rc(), sub: rc(), accent: rc() });
  };

  // デザイン理論ベースのスマートランダム生成
  const generateSmartRandom = () => {
    const mainH = Math.floor(Math.random() * 360);
    const mainS = 55 + Math.floor(Math.random() * 30); // 55-85%
    const mainL = 35 + Math.floor(Math.random() * 20); // 35-55%

    const schemes = [
      { name: 'complementary', accentH: (mainH + 180) % 360, subShift: 0 },
      { name: 'splitComplementary', accentH: (mainH + 150 + Math.round(Math.random()) * 60) % 360, subShift: 0 },
      { name: 'analogous', accentH: (mainH + (Math.random() > 0.5 ? 30 : -30) + 360) % 360, subShift: (Math.random() > 0.5 ? 15 : -15) },
      { name: 'triadic', accentH: (mainH + 120) % 360, subShift: 0 },
    ];
    const scheme = schemes[Math.floor(Math.random() * schemes.length)];

    const mainHex = hslToHex(mainH, mainS, mainL);
    const subHex = hslToHex((mainH + scheme.subShift + 360) % 360, 30 + Math.floor(Math.random() * 15), 88 + Math.floor(Math.random() * 7));
    const accentHex = hslToHex(scheme.accentH, 65 + Math.floor(Math.random() * 25), 45 + Math.floor(Math.random() * 15));

    // メインの明度に応じてベース・テキストを自動調整
    const baseLightness = mainL < 40 ? 96 : 95 + Math.floor(Math.random() * 3);
    const baseHex = hslToHex(mainH, 15 + Math.floor(Math.random() * 15), baseLightness);
    const textHex = hslToHex(mainH, 20 + Math.floor(Math.random() * 20), 10 + Math.floor(Math.random() * 10));

    setColors({ base: baseHex, main: mainHex, sub: subHex, accent: accentHex, text: textHex });
    setStyleMode('clean');
    setActiveSlots(4);
    setLastScheme(scheme.name);
  };

  // SVGグラデーション画像を生成
  const gradientImage = (colors, w = 800, h = 400) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((c, i) => `<stop offset="${Math.round(i / (colors.length - 1) * 100)}%" stop-color="${c}"/>`).join('')}
        </linearGradient>
        <radialGradient id="g2" cx="30%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g3" cx="80%" cy="70%" r="50%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g1)"/>
      <rect width="100%" height="100%" fill="url(#g2)"/>
      <rect width="100%" height="100%" fill="url(#g3)"/>
      <circle cx="${w * 0.15}" cy="${h * 0.3}" r="${h * 0.4}" fill="#fff" opacity="0.07"/>
      <circle cx="${w * 0.85}" cy="${h * 0.7}" r="${h * 0.5}" fill="#000" opacity="0.05"/>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };
  const heroImg = gradientImage(['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'], 1200, 500);
  const card1Img = gradientImage(['#0ea5e9', '#6366f1', '#a855f7'], 800, 400);
  const card2Img = gradientImage(['#f59e0b', '#ef4444', '#ec4899'], 800, 350);
  const avatarImg = (() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
      <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
      <rect width="150" height="150" fill="url(#ag)"/>
      <circle cx="75" cy="55" r="28" fill="#e0e7ff"/>
      <ellipse cx="75" cy="130" rx="40" ry="35" fill="#e0e7ff"/>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  })();

  const [lastScheme, setLastScheme] = useState(null);
  const schemeLabels = { complementary: '補色', splitComplementary: '分裂補色', analogous: '類似色', triadic: 'トライアド' };

  const applyTheoryPalette = (type) => {
    let newColors = { ...colors };
    let mode = 'clean';

    switch (type) {
      case 'trust':
        newColors = { base: '#f0f9ff', main: '#0369a1', sub: '#bae6fd', accent: '#0ea5e9', text: '#0c4a6e' };
        break;
      case 'energy':
        newColors = { base: '#fff7ed', main: '#ea580c', sub: '#fed7aa', accent: '#facc15', text: '#431407' };
        break;
      case 'relax':
        newColors = { base: '#fcfdf5', main: '#4d7c0f', sub: '#d9f99d', accent: '#a16207', text: '#1a2e05' };
        break;
      case 'luxury':
        newColors = { base: '#1c1917', main: '#d4af37', sub: '#44403c', accent: '#ffffff', text: '#fafaf9' };
        mode = 'dark';
        break;
      default:
        break;
    }
    setColors(newColors);
    setStyleMode(mode);
    setActiveSlots(4);
  };

  const copyToClipboard = () => {
    const cssText = `/* Color Palette Output */
:root {
  --color-base:   ${colors.base};
  --color-main:   ${colors.main};
  --color-sub:    ${colors.sub};
  --color-accent: ${colors.accent};
  --color-text:   ${styleMode === 'dark' ? '#f1f5f9' : colors.text};
}`;

    const textArea = document.createElement("textarea");
    textArea.value = cssText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 font-sans text-slate-800 overflow-hidden" style={{ height: '100vh' }}>

      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 md:h-full overflow-y-auto" style={{ maxHeight: '35vh', minHeight: 0 }}>
        <style>{`@media (min-width: 768px) { aside { max-height: 100vh !important; } }`}</style>
        <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Palette className="w-6 h-6 text-blue-500" />
                Color Architect
              </h1>
              <p className="text-xs text-slate-500 mt-1">Webサイト配色シミュレーター</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-8 flex-1">

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-500" />
              心理・理論から選ぶ
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => applyTheoryPalette('trust')} className="text-xs border p-2 rounded hover:bg-blue-50 hover:border-blue-200 text-left transition-colors">
                <span className="block font-bold text-slate-700">信頼・誠実</span>
                <span className="text-slate-400" style={{ fontSize: 10 }}>青系 / 企業・医療</span>
              </button>
              <button onClick={() => applyTheoryPalette('energy')} className="text-xs border p-2 rounded hover:bg-orange-50 hover:border-orange-200 text-left transition-colors">
                <span className="block font-bold text-slate-700">元気・活力</span>
                <span className="text-slate-400" style={{ fontSize: 10 }}>暖色 / 飲食・LP</span>
              </button>
              <button onClick={() => applyTheoryPalette('relax')} className="text-xs border p-2 rounded hover:bg-green-50 hover:border-green-200 text-left transition-colors">
                <span className="block font-bold text-slate-700">癒やし・自然</span>
                <span className="text-slate-400" style={{ fontSize: 10 }}>緑系 / サロン</span>
              </button>
              <button onClick={() => applyTheoryPalette('luxury')} className="text-xs border p-2 rounded hover:bg-slate-800 hover:text-white hover:border-slate-600 text-left transition-colors">
                <span className="block font-bold">高級・洗練</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>黒金 / ブランド</span>
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              使用する色数
            </label>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setActiveSlots(num)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeSlots === num
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {num}色
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              カラーパレット設定
            </label>

            <div className="group">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">ベース色 (背景)</span>
                <span className="text-xs text-slate-400 font-mono">{colors.base}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-400 transition-all">
                  <input
                    type="color"
                    value={colors.base}
                    onChange={(e) => updateColor('base', e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-0 border-0 cursor-pointer"
                    style={{ width: '150%', height: '150%' }}
                  />
                </div>
                <div className="text-xs text-slate-500 leading-tight">
                  全体の約70%を占める<br />最も広い面積の色
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">メイン色 (ブランド)</span>
                <span className="text-xs text-slate-400 font-mono">{colors.main}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-400 transition-all">
                  <input
                    type="color"
                    value={colors.main}
                    onChange={(e) => updateColor('main', e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-0 border-0 cursor-pointer"
                    style={{ width: '150%', height: '150%' }}
                  />
                </div>
                <div className="text-xs text-slate-500 leading-tight">
                  全体の約25%。<br />見出しやロゴに使用
                </div>
              </div>
            </div>

            <div className={`group transition-opacity duration-300 ${activeSlots < 3 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">サブ色 (装飾・背景)</span>
                <span className="text-xs text-slate-400 font-mono">{colors.sub}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-400 transition-all">
                  <input
                    type="color"
                    value={colors.sub}
                    onChange={(e) => updateColor('sub', e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-0 border-0 cursor-pointer"
                    style={{ width: '150%', height: '150%' }}
                  />
                </div>
                <div className="text-xs text-slate-500 leading-tight">
                  背景のアクセントや<br />薄い区切りに使用
                </div>
              </div>
            </div>

            <div className={`group transition-opacity duration-300 ${activeSlots < 2 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">アクセント色 (強調)</span>
                <span className="text-xs text-slate-400 font-mono">{colors.accent}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-400 transition-all">
                  <input
                    type="color"
                    value={colors.accent}
                    onChange={(e) => updateColor('accent', e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-0 border-0 cursor-pointer"
                    style={{ width: '150%', height: '150%' }}
                  />
                </div>
                <div className="text-xs text-slate-500 leading-tight">
                  全体の約5%。<br />ボタンや注目ポイント
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layout className="w-3 h-3" />
              配色のバランス (雰囲気)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setStyleMode('clean')}
                className={`p-2 rounded border text-xs font-medium flex flex-col items-center gap-1 transition-all ${styleMode === 'clean' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-slate-600 hover:bg-gray-50'}`}
              >
                <Sun className="w-4 h-4" />
                Clean
              </button>
              <button
                onClick={() => setStyleMode('bold')}
                className={`p-2 rounded border text-xs font-medium flex flex-col items-center gap-1 transition-all ${styleMode === 'bold' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-slate-600 hover:bg-gray-50'}`}
              >
                <Star className="w-4 h-4" />
                Bold
              </button>
              <button
                onClick={() => setStyleMode('dark')}
                className={`p-2 rounded border text-xs font-medium flex flex-col items-center gap-1 transition-all ${styleMode === 'dark' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-slate-600 hover:bg-gray-50'}`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-gray-100 space-y-3">
          <button
            onClick={copyToClipboard}
            className="w-full py-2.5 border border-slate-300 text-slate-700 rounded-md text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors relative"
          >
            {showToast ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">コピーしました!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                CSS変数をコピー
              </>
            )}
          </button>

          <button
            onClick={generateSmartRandom}
            className="w-full py-2.5 text-white rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
          >
            <Sparkles className="w-4 h-4" />
            スマート配色ランダム
          </button>
          {lastScheme && (
            <div className="text-center">
              <span className="text-xs text-purple-500 font-medium">配色理論: {schemeLabels[lastScheme] || lastScheme}</span>
            </div>
          )}

          <button
            onClick={generateFullRandom}
            className="w-full py-2 border border-slate-300 text-slate-500 rounded-md text-xs font-medium hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            完全ランダム
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-200 relative overflow-hidden flex flex-col">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2 flex justify-between items-center z-20">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Monitor className="w-4 h-4" />
            <span>Live Preview</span>
          </div>
          <div className="text-xs text-slate-400 hidden sm:block">
            リアルタイムで変更が反映されます
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div
            className="w-full max-w-5xl mx-auto shadow-2xl rounded-xl overflow-hidden transition-colors duration-500 ease-in-out"
            style={{ ...getThemeStyles(), minHeight: 1000 }}
          >

            <header
              className="px-6 py-4 flex items-center justify-between transition-colors duration-300 border-b"
              style={{
                backgroundColor: styleMode === 'bold' ? 'var(--c-main)' : 'var(--c-base)',
                color: styleMode === 'bold' ? 'var(--c-on-main)' : 'var(--c-text)',
                borderColor: 'var(--c-border)'
              }}
            >
              <div className="flex items-center gap-2 font-bold text-xl">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: styleMode === 'bold' ? 'var(--c-on-main)' : 'var(--c-main)' }}
                >
                  <span style={{ color: styleMode === 'bold' ? 'var(--c-main)' : 'var(--c-on-main)' }}>C</span>
                </div>
                <span>ColorPress.</span>
              </div>

              <nav className="hidden md:flex gap-6 text-sm font-medium opacity-90">
                <a href="#" className="hover:opacity-70">ホーム</a>
                <a href="#" className="hover:opacity-70">機能</a>
                <a href="#" className="hover:opacity-70">ブログ</a>
                <a href="#" className="hover:opacity-70">お問い合わせ</a>
              </nav>

              <div className="flex gap-2">
                <button
                  className="hidden sm:block px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-transform active:scale-95"
                  style={{
                    backgroundColor: styleMode === 'bold' ? 'var(--c-base)' : 'var(--c-main)',
                    color: styleMode === 'bold' ? 'var(--c-text)' : 'var(--c-on-main)'
                  }}
                >
                  登録する
                </button>
              </div>
            </header>

            <section
              className="py-12 px-6 text-center border-b relative overflow-hidden"
              style={{
                backgroundColor: styleMode === 'bold' ? 'var(--c-main)' : 'var(--c-base)',
                color: styleMode === 'bold' ? 'var(--c-on-main)' : 'var(--c-text)',
                borderColor: 'var(--c-border)'
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <img src={heroImg} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 inline-block border"
                  style={{
                    borderColor: styleMode === 'bold' ? 'rgba(255,255,255,0.3)' : 'var(--c-sub)',
                    backgroundColor: styleMode === 'bold' ? 'rgba(255,255,255,0.1)' : 'var(--c-sub)',
                    color: styleMode === 'bold' ? 'inherit' : 'var(--c-text)'
                  }}
                >
                  NEWS
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                  あなたの色で、<span style={{ color: styleMode === 'bold' ? 'var(--c-accent)' : 'var(--c-main)' }}>世界</span>を彩る。
                </h1>
                <p className="text-base md:text-lg max-w-2xl mx-auto opacity-80">
                  最適な配色パターンを見つけるためのシミュレーターへようこそ。<br />
                  サイドバーやカードUIでの色の見え方を確認しましょう。
                </p>
              </div>
            </section>

            <div
              className="py-10 px-4 md:px-8"
              style={{
                backgroundColor: styleMode === 'clean' ? '#ffffff' : (styleMode === 'bold' ? 'var(--c-base)' : '#1e293b'),
                color: styleMode === 'dark' ? '#f8fafc' : '#1e293b'
              }}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

                <div className="md:col-span-8 space-y-8">

                  <article
                    className="rounded-xl overflow-hidden border transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: styleMode === 'clean' ? 'var(--c-base)' : (styleMode === 'dark' ? '#0f172a' : '#ffffff'),
                      borderColor: 'var(--c-border)'
                    }}
                  >
                    <div className="h-48 w-full relative overflow-hidden" style={{ backgroundColor: 'var(--c-sub)' }}>
                      <img src={card1Img} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded shadow-sm" style={{ backgroundColor: 'var(--c-accent)', color: 'var(--c-on-accent)' }}>
                        おすすめ
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex gap-2 text-xs mb-3 opacity-60">
                        <span>2024.03.15</span>
                        <span>•</span>
                        <span>デザイン</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-3">配色の基本ルールと心理効果について</h2>
                      <p className="opacity-70 mb-4 leading-relaxed">
                        色は人の心理に大きな影響を与えます。例えば青は「信頼」、赤は「情熱」を表します。
                        メインカラーとアクセントカラーの比率を70:25:5に保つことで、バランスの取れたデザインを作ることができます。
                      </p>
                      <a href="#" className="inline-flex items-center gap-1 font-bold text-sm hover:underline" style={{ color: 'var(--c-main)' }}>
                        記事を読む <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </article>

                  <article
                    className="rounded-xl overflow-hidden border transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: styleMode === 'clean' ? 'var(--c-base)' : (styleMode === 'dark' ? '#0f172a' : '#ffffff'),
                      borderColor: 'var(--c-border)'
                    }}
                  >
                    <div className="h-40 w-full overflow-hidden" style={{ backgroundColor: 'var(--c-sub)' }}>
                      <img src={card2Img} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <div className="flex gap-2 text-xs mb-3 opacity-60">
                        <span>2024.03.10</span>
                        <span>•</span>
                        <span>チュートリアル</span>
                      </div>
                      <h2 className="text-xl font-bold mb-3">新しい機能がリリースされました</h2>
                      <p className="opacity-70 mb-4 leading-relaxed">
                        このセクションの背景色は、Baseカラーまたは白が一般的です。
                        文字色は自動的にコントラストが確保されるように計算されています。
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded border opacity-60" style={{ borderColor: 'var(--c-border)' }}>#UIデザイン</span>
                        <span className="text-xs px-2 py-1 rounded border opacity-60" style={{ borderColor: 'var(--c-border)' }}>#色彩</span>
                      </div>
                    </div>
                  </article>

                </div>

                <aside className="md:col-span-4 space-y-6">

                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: styleMode === 'clean' ? 'var(--c-base)' : (styleMode === 'dark' ? '#0f172a' : '#ffffff'),
                      borderColor: 'var(--c-border)'
                    }}
                  >
                    <div className="flex items-center gap-2 border rounded p-2" style={{ backgroundColor: styleMode === 'dark' ? '#1e293b' : '#fff', borderColor: 'var(--c-border)' }}>
                      <Search className="w-4 h-4 opacity-40" />
                      <input
                        type="text"
                        placeholder="サイト内検索..."
                        className="bg-transparent text-sm w-full outline-none"
                      />
                    </div>
                  </div>

                  <div
                    className="p-6 rounded-lg text-center shadow-sm"
                    style={{
                      backgroundColor: 'var(--c-main)',
                      color: 'var(--c-on-main)'
                    }}
                  >
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 border-2 overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                      <img src={avatarImg} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">管理者プロフィール</h3>
                    <p className="text-xs opacity-80 mb-4">
                      色の力でWebサイトのCVRを改善する専門家です。
                    </p>
                    <button
                      className="w-full py-2 rounded text-sm font-bold transition-transform active:scale-95"
                      style={{
                        backgroundColor: 'var(--c-accent)',
                        color: 'var(--c-on-accent)'
                      }}
                    >
                      フォローする
                    </button>
                  </div>

                  <div
                    className="p-5 rounded-lg border"
                    style={{
                      backgroundColor: styleMode === 'clean' ? 'var(--c-base)' : (styleMode === 'dark' ? '#0f172a' : '#ffffff'),
                      borderColor: 'var(--c-border)'
                    }}
                  >
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <Layout className="w-4 h-4" style={{ color: 'var(--c-main)' }} />
                      カテゴリー
                    </h3>
                    <ul className="space-y-2 text-sm opacity-80">
                      <li className="flex justify-between items-center py-1 border-b border-dashed border-gray-200">
                        <span>デザイン理論</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, backgroundColor: 'var(--c-sub)', color: 'var(--c-text)' }}>12</span>
                      </li>
                      <li className="flex justify-between items-center py-1 border-b border-dashed border-gray-200">
                        <span>マーケティング</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, backgroundColor: 'var(--c-sub)', color: 'var(--c-text)' }}>5</span>
                      </li>
                      <li className="flex justify-between items-center py-1 border-b border-dashed border-gray-200">
                        <span>開発・実装</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, backgroundColor: 'var(--c-sub)', color: 'var(--c-text)' }}>8</span>
                      </li>
                    </ul>
                  </div>

                  <div
                    className="p-5 rounded-lg border"
                    style={{
                      backgroundColor: styleMode === 'clean' ? 'var(--c-base)' : (styleMode === 'dark' ? '#0f172a' : '#ffffff'),
                      borderColor: 'var(--c-border)'
                    }}
                  >
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <Tag className="w-4 h-4" style={{ color: 'var(--c-main)' }} />
                      人気タグ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['UI/UX', 'Color', 'CSS', 'React', 'Design'].map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded transition-colors hover:opacity-80 cursor-pointer"
                          style={{ backgroundColor: 'var(--c-sub)', color: 'var(--c-text)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </aside>
              </div>
            </div>

            <section
              className="py-16 px-6 text-center"
              style={{ backgroundColor: 'var(--c-base)' }}
            >
              <div
                className="max-w-4xl mx-auto rounded-2xl p-10 relative overflow-hidden text-left flex flex-col md:flex-row items-center justify-between gap-8"
                style={{
                  backgroundColor: styleMode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>プロジェクトを始めましょう</h2>
                  <p className="opacity-70 text-sm" style={{ color: 'var(--c-text)' }}>
                    この配色はあなたのブランドに合っていますか？<br />
                    今すぐコードをコピーして使い始めましょう。
                  </p>
                </div>
                <button
                  className="px-6 py-3 rounded-md font-bold text-sm shadow-md transition-transform hover:scale-105 whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--c-accent)',
                    color: 'var(--c-on-accent)'
                  }}
                >
                  無料でダウンロード
                </button>
              </div>
            </section>

            <footer
              className="py-10 px-6 border-t"
              style={{
                backgroundColor: styleMode === 'clean' ? '#f8fafc' : (styleMode === 'dark' ? '#020617' : 'var(--c-base)'),
                borderColor: styleMode === 'dark' ? '#1e293b' : '#e2e8f0',
                color: styleMode === 'dark' ? '#94a3b8' : '#64748b'
              }}
            >
              <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-sm">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 font-bold text-xl mb-4" style={{ color: styleMode === 'dark' ? '#fff' : '#0f172a' }}>
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: 'var(--c-main)' }}
                    >
                    </div>
                    <span>ColorPress.</span>
                  </div>
                  <p className="max-w-xs text-xs leading-relaxed">
                    このサイトは配色シミュレーション用のデモサイトです。<br />
                    コンテンツは架空のものです。
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4 text-xs uppercase tracking-wider" style={{ color: styleMode === 'dark' ? '#fff' : '#0f172a' }}>製品</h4>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-blue-500">機能一覧</a></li>
                    <li><a href="#" className="hover:text-blue-500">料金プラン</a></li>
                    <li><a href="#" className="hover:text-blue-500">導入事例</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4 text-xs uppercase tracking-wider" style={{ color: styleMode === 'dark' ? '#fff' : '#0f172a' }}>サポート</h4>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-blue-500">ヘルプセンター</a></li>
                    <li><a href="#" className="hover:text-blue-500">利用規約</a></li>
                    <li><a href="#" className="hover:text-blue-500">お問い合わせ</a></li>
                  </ul>
                </div>
              </div>
              <div className="max-w-6xl mx-auto mt-10 pt-6 border-t text-center" style={{ borderColor: 'rgba(156,163,175,0.2)', fontSize: 10 }}>
                &copy; 2024 Color Simulator Demo. All rights reserved.
              </div>
            </footer>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
