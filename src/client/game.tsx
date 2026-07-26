import './index.css';
import { StrictMode, useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

type GameState = {
  screen: 'splash' | 'explore' | 'combat' | 'victory' | 'defeat';
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpToNext: number;
  sessionId?: string;
  enemyName?: string;
  enemyHp?: number;
  enemyMaxHp?: number;
  loot?: string[];
  xpGained?: number;
};

const C = {
  primary: '#84cc16',
  secondary: '#06b6d4', 
  accent: '#f59e0b',
  dark: '#0a0e0a',
  text: '#f5f5f4',
  danger: '#ef4444',
};

export const App = () => {
  const [state, setState] = useState<GameState>({
    screen: 'splash',
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpToNext: 100,
  });

  const [particles, setParticles] = useState<any[]>([]);
  const [shake, setShake] = useState(0);
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setParticles(p => p.map(x => ({ ...x, x: x.x + x.vx, y: x.y + x.vy, life: x.life - 0.03, vy: x.vy + 0.2 })).filter(x => x.life > 0));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const burst = useCallback((cx: number, cy: number, count = 15, emoji = '✨') => {
    const np = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      np.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, emoji });
    }
    setParticles(p => [...p, ...np]);
  }, []);

  const triggerShake = () => { setShake(10); setTimeout(() => setShake(0), 200); };
  const triggerPulse = () => { setPulse(2); setTimeout(() => setPulse(1), 600); };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        const data = await res.json();
        setState(p => ({ ...p, screen: 'explore', level: data.stats?.level ?? 1, hp: data.stats?.health ?? 100, maxHp: data.stats?.maxHealth ?? 100, xp: data.stats?.xp ?? 0 }));
        triggerPulse();
        burst(window.innerWidth / 2, window.innerHeight / 2, 25);
      } catch (e) { console.error(e); }
    };
    setTimeout(init, 600);
  }, [burst]);

  const explore = useCallback(async () => {
    try {
      const res = await fetch('/api/explore', { method: 'POST' });
      const data = await res.json();
      if (data.encounter?.type === 'COMBAT') {
        const names: Record<string, string> = { sewer_rat: '🐀 Sewer Rat', trash_goblin: '👹 Trash Goblin' };
        setState(p => ({ ...p, screen: 'combat', sessionId: 'session_' + Date.now(), enemyName: names[data.encounter.enemyId] || 'Enemy', enemyHp: 50, enemyMaxHp: 50 }));
        triggerShake();
        burst(window.innerWidth / 2, window.innerHeight / 2, 20);
      }
    } catch (e) { console.error(e); }
  }, [burst]);

  const attack = useCallback(async () => {
    if (!state.sessionId) return;
    triggerShake();
    burst(window.innerWidth * 0.6, window.innerHeight * 0.3, 20, '💥');

    try {
      const res = await fetch('/api/combat/attack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) });
      const data = await res.json();

      if (data.type === 'combat_victory') {
        triggerPulse();
        burst(window.innerWidth / 2, window.innerHeight / 2, 40, '🏆');
        setState(p => ({ ...p, screen: 'victory', level: data.stats?.level ?? p.level, xpGained: data.xp, loot: data.loot }));
      } else if (data.type === 'combat_defeat') {
        setState(p => ({ ...p, screen: 'defeat' }));
      } else {
        setState(p => ({ ...p, enemyHp: Math.max(0, (p.enemyHp ?? 50) - (data.damage || 15)), hp: Math.max(0, data.playerHealth ?? p.hp) }));
      }
    } catch (e) { console.error(e); }
  }, [state.sessionId, burst]);

  const cont = () => { setState(p => ({ ...p, screen: 'explore', hp: p.maxHp })); burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 12); };

  const hpPct = (state.hp / state.maxHp) * 100;
  const enemyPct = state.enemyHp && state.enemyMaxHp ? (state.enemyHp / state.enemyMaxHp) * 100 : 100;

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.dark}, #1a1f1a, #0d1511)`, color: C.text, fontFamily: '"Arial", sans-serif', overflow: 'hidden', position: 'relative', transform: shake ? `translate(${Math.sin(Date.now() / 10) * shake}px, 0)` : 'none' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        {particles.map((p, i) => (<div key={i} style={{ position: 'absolute', left: p.x, top: p.y, fontSize: '32px', opacity: p.life, pointerEvents: 'none', textShadow: `0 0 10px ${C.primary}` }}>{p.emoji}</div>))}
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        <header style={{ background: `linear-gradient(90deg, rgba(132,204,22,0.15), rgba(6,182,212,0.15))`, borderBottom: `4px solid ${C.primary}`, padding: '20px', textAlign: 'center', boxShadow: `0 0 30px ${C.primary}` }}>
          <h1 style={{ fontSize: '56px', margin: '0 0 20px 0', textShadow: `0 0 20px ${C.primary}, 0 0 40px ${C.secondary}`, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary}, ${C.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 'bold', letterSpacing: '4px' }}>⚡ STANKVILLE ⚡</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '20px', fontWeight: 'bold' }}>
            <div style={{ color: C.primary }}>🎖️ LVL {state.level}</div>
            <div style={{ color: C.secondary }}>❤️ {state.hp}/{state.maxHp}</div>
            <div style={{ color: C.accent }}>✨ {state.xp}/{state.xpToNext}</div>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          {state.screen === 'splash' && (<div style={{ textAlign: 'center' }}><div style={{ fontSize: '120px', marginBottom: '30px' }}>🌍💩</div><h2 style={{ fontSize: '48px', color: C.primary }}>STANKVILLE</h2><p style={{ fontSize: '18px', color: '#aaa' }}>Where legends smell forever</p></div>)}

          {state.screen === 'explore' && (<div style={{ textAlign: 'center', maxWidth: '600px' }}><div style={{ fontSize: '100px', marginBottom: '30px' }}>🗺️</div><h2 style={{ fontSize: '40px', color: C.secondary }}>EXPLORE</h2><p style={{ fontSize: '16px', color: '#bbb', marginBottom: '40px' }}>What horrors await?</p><button onClick={explore} style={{ padding: '20px 60px', fontSize: '24px', fontWeight: 'bold', background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, color: C.dark, border: `3px solid ${C.primary}`, borderRadius: '12px', cursor: 'pointer', boxShadow: `0 0 40px ${C.primary}` }} onMouseEnter={e => { (e.target as any).style.transform = 'scale(1.08)'; }} onMouseLeave={e => { (e.target as any).style.transform = 'scale(1)'; }}>🔥 EXPLORE 🔥</button></div>)}

          {state.screen === 'combat' && (<div style={{ maxWidth: '700px', width: '100%' }}><div style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))`, border: `4px solid ${C.accent}`, borderRadius: '20px', padding: '50px', boxShadow: `0 0 60px ${C.accent}` }}><div style={{ textAlign: 'center', marginBottom: '40px' }}><div style={{ fontSize: '100px', marginBottom: '20px' }}>{state.enemyName?.split(' ')[0]}</div><h2 style={{ fontSize: '40px', color: C.accent, margin: 0 }}>{state.enemyName}</h2></div><div style={{ marginBottom: '40px' }}><div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', color: C.primary, fontWeight: 'bold' }}><span>YOUR HP</span><span>{state.hp}/{state.maxHp}</span></div><div style={{ height: '30px', background: 'rgba(0,0,0,0.5)', borderRadius: '15px', overflow: 'hidden', border: `2px solid ${C.primary}` }}><div style={{ height: '100%', background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, width: `${hpPct}%`, transition: 'width 0.3s', boxShadow: `0 0 10px ${C.primary}` }} /></div><div style={{ marginTop: '30px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', color: C.accent, fontWeight: 'bold' }}><span>ENEMY HP</span><span>{state.enemyHp}/{state.enemyMaxHp}</span></div><div style={{ height: '30px', background: 'rgba(0,0,0,0.5)', borderRadius: '15px', overflow: 'hidden', border: `2px solid ${C.accent}` }}><div style={{ height: '100%', background: C.accent, width: `${enemyPct}%`, transition: 'width 0.3s', boxShadow: `0 0 10px ${C.accent}` }} /></div></div><button onClick={attack} style={{ width: '100%', padding: '24px', fontSize: '28px', fontWeight: 'bold', background: `linear-gradient(135deg, ${C.accent}, ${C.danger})`, color: 'white', border: `3px solid ${C.danger}`, borderRadius: '12px', cursor: 'pointer', boxShadow: `0 0 40px ${C.accent}` }} onMouseEnter={e => { (e.target as any).style.transform = 'scale(1.05)'; }} onMouseLeave={e => { (e.target as any).style.transform = 'scale(1)'; }}>⚔️ SMASH ⚔️</button></div></div>)}

          {state.screen === 'victory' && (<div style={{ textAlign: 'center', maxWidth: '600px' }}><div style={{ fontSize: '140px', marginBottom: '30px' }}>🏆</div><h2 style={{ fontSize: '56px', color: C.primary }}>VICTORY!</h2><div style={{ background: `linear-gradient(135deg, rgba(132,204,22,0.2), rgba(6,182,212,0.2))`, borderRadius: '16px', padding: '30px', marginBottom: '40px', border: `3px solid ${C.primary}`, fontSize: '22px' }}><div style={{ marginBottom: '20px', color: C.accent }}>⭐ +{state.xpGained} XP ⭐</div><div style={{ color: C.secondary }}>🎁 LOOT: {state.loot?.join(', ') || 'Nothing'} 🎁</div></div><button onClick={cont} style={{ padding: '20px 60px', fontSize: '24px', fontWeight: 'bold', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: C.dark, border: `3px solid ${C.primary}`, borderRadius: '12px', cursor: 'pointer', boxShadow: `0 0 40px ${C.primary}` }}>🚀 NEXT 🚀</button></div>)}

          {state.screen === 'defeat' && (<div style={{ textAlign: 'center', maxWidth: '600px' }}><div style={{ fontSize: '120px', marginBottom: '30px' }}>💀</div><h2 style={{ fontSize: '48px', color: C.danger }}>DEFEATED</h2><button onClick={cont} style={{ padding: '20px 60px', fontSize: '24px', fontWeight: 'bold', background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`, color: C.dark, border: `3px solid ${C.secondary}`, borderRadius: '12px', cursor: 'pointer', boxShadow: `0 0 40px ${C.secondary}` }}>🔄 RETRY 🔄</button></div>)}
        </main>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } } @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
