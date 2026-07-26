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

const Colors = {
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
  const [pulseIntensity, setPulseIntensity] = useState(1);

  // PARTICLE SYSTEM
  useEffect(() => {
    const timer = setInterval(() => {
      setParticles(p => 
        p.map(x => ({
          ...x,
          x: x.x + x.vx,
          y: x.y + x.vy,
          life: x.life - 0.03,
          vy: x.vy + 0.2, // gravity
        })).filter(x => x.life > 0)
      );
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const burst = useCallback((cx: number, cy: number, count = 15, emoji = '✨') => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        emoji: ['✨', '💫', '⭐', '🌟', emoji][Math.floor(Math.random() * 5)],
      });
    }
    setParticles(p => [...p, ...newParticles]);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(10);
    setTimeout(() => setShake(0), 200);
  }, []);

  const triggerPulse = useCallback(() => {
    setPulseIntensity(2);
    setTimeout(() => setPulseIntensity(1), 600);
  }, []);

  // INIT
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        const data = await res.json();
        setState(p => ({
          ...p,
          screen: 'explore',
          level: data.stats?.level ?? 1,
          hp: data.stats?.health ?? 100,
          maxHp: data.stats?.maxHealth ?? 100,
          xp: data.stats?.xp ?? 0,
        }));
        triggerPulse();
        burst(window.innerWidth / 2, window.innerHeight / 2, 25);
      } catch (e) {
        console.error(e);
      }
    };
    setTimeout(init, 600);
  }, [burst, triggerPulse]);

  // EXPLORE
  const explore = useCallback(async () => {
    try {
      const res = await fetch('/api/explore', { method: 'POST' });
      const data = await res.json();

      if (data.encounter?.type === 'COMBAT') {
        const enemyNames: Record<string, string> = {
          sewer_rat: '🐀 Sewer Rat',
          trash_goblin: '👹 Trash Goblin',
        };
        setState(p => ({
          ...p,
          screen: 'combat',
          sessionId: Math.random().toString(),
          enemyName: enemyNames[data.encounter.enemyId] || 'Enemy',
          enemyHp: 50,
          enemyMaxHp: 50,
        }));
        triggerShake();
        triggerPulse();
        burst(window.innerWidth / 2, window.innerHeight / 2, 20);
      } else {
        burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 8);
      }
    } catch (e) {
      console.error(e);
    }
  }, [burst, triggerShake, triggerPulse]);

  // ATTACK
  const attack = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      triggerShake();
      burst(window.innerWidth * 0.6, window.innerHeight * 0.3, 20, '💥');

      const res = await fetch('/api/combat/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.sessionId }),
      });

      const data = await res.json();

      if (data.type === 'combat_victory') {
        triggerPulse();
        burst(window.innerWidth / 2, window.innerHeight / 2, 40, '🏆');
        setState(p => ({
          ...p,
          screen: 'victory',
          level: data.stats?.level ?? p.level,
          xpGained: data.xp,
          loot: data.loot,
        }));
      } else if (data.type === 'combat_defeat') {
        setState(p => ({ ...p, screen: 'defeat' }));
      } else {
        setState(p => ({
          ...p,
          enemyHp: Math.max(0, (p.enemyHp ?? 50) - (data.damage || 15)),
          hp: Math.max(0, data.playerHealth ?? p.hp),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, [state.sessionId, burst, triggerShake, triggerPulse]);

  const cont = () => {
    setState(p => ({ ...p, screen: 'explore', hp: p.maxHp }));
    burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 12);
  };

  const xpPercent = (state.xp / state.xpToNext) * 100;
  const hpPercent = (state.hp / state.maxHp) * 100;
  const enemyPercent = state.enemyHp && state.enemyMaxHp ? (state.enemyHp / state.enemyMaxHp) * 100 : 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${Colors.dark}, #1a1f1a, #0d1511)`,
      color: Colors.text,
      fontFamily: '"Arial", sans-serif',
      overflow: 'hidden',
      position: 'relative',
      transform: shake ? `translate(${Math.sin(Date.now() / 10) * shake}px, 0)` : 'none',
    }}>
      {/* PARTICLES */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            fontSize: '32px',
            opacity: p.life,
            pointerEvents: 'none',
            textShadow: `0 0 10px ${Colors.primary}`,
          }}>
            {p.emoji}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        {/* HEADER */}
        <header style={{
          background: `linear-gradient(90deg, rgba(132,204,22,0.15), rgba(6,182,212,0.15))`,
          borderBottom: `4px solid ${Colors.primary}`,
          padding: '20px',
          textAlign: 'center',
          boxShadow: `0 0 30px ${Colors.primary}, inset 0 0 30px ${Colors.primary}${Math.floor(pulseIntensity * 100).toString(16)}`,
        }}>
          <h1 style={{
            fontSize: '56px',
            margin: '0 0 20px 0',
            textShadow: `0 0 20px ${Colors.primary}, 0 0 40px ${Colors.secondary}, 0 0 60px ${Colors.accent}`,
            background: `linear-gradient(90deg, ${Colors.primary}, ${Colors.secondary}, ${Colors.accent}, ${Colors.primary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold',
            letterSpacing: '4px',
            animation: 'pulse 2s infinite',
          }}>
            ⚡ STANKVILLE ⚡
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '20px', fontWeight: 'bold' }}>
            <div style={{ color: Colors.primary }}>🎖️ LVL {state.level}</div>
            <div style={{ color: Colors.secondary }}>❤️ {state.hp}/{state.maxHp} HP</div>
            <div style={{ color: Colors.accent }}>✨ {state.xp}/{state.xpToNext} XP</div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}>
          {state.screen === 'splash' && (
            <div style={{ textAlign: 'center', animation: 'fadeIn 1s' }}>
              <div style={{ fontSize: '120px', marginBottom: '30px', animation: 'bounce 1.5s infinite' }}>🌍💩</div>
              <h2 style={{ fontSize: '48px', color: Colors.primary, marginBottom: '20px', textShadow: `0 0 20px ${Colors.primary}` }}>STANKVILLE</h2>
              <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '30px' }}>Where legends are made... and the smell lingers forever</p>
              <div style={{ animation: 'pulse 1s infinite', fontSize: '24px' }}>⬇️ Initializing ⬇️</div>
            </div>
          )}

          {state.screen === 'explore' && (
            <div style={{ textAlign: 'center', maxWidth: '600px', animation: 'slideIn 0.5s' }}>
              <div style={{ fontSize: '100px', marginBottom: '30px' }}>🗺️</div>
              <h2 style={{ fontSize: '40px', color: Colors.secondary, marginBottom: '20px', textShadow: `0 0 20px ${Colors.secondary}` }}>EXPLORE THE STINK</h2>
              <p style={{ fontSize: '16px', color: '#bbb', marginBottom: '40px', lineHeight: '1.6' }}>
                The putrid aroma of adventure fills your nostrils.<br/>
                What horrors await in the darkness?
              </p>
              <button
                onClick={explore}
                style={{
                  padding: '20px 60px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${Colors.primary}, ${Colors.accent})`,
                  color: Colors.dark,
                  border: `3px solid ${Colors.primary}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: `0 0 40px ${Colors.primary}, 0 0 80px ${Colors.accent}`,
                  transition: 'all 0.2s',
                  transform: 'scale(1)',
                }}
                onMouseEnter={e => {
                  (e.target as any).style.transform = 'scale(1.08)';
                  (e.target as any).style.boxShadow = `0 0 60px ${Colors.primary}, 0 0 120px ${Colors.accent}`;
                }}
                onMouseLeave={e => {
                  (e.target as any).style.transform = 'scale(1)';
                  (e.target as any).style.boxShadow = `0 0 40px ${Colors.primary}, 0 0 80px ${Colors.accent}`;
                }}
              >
                🔥 EXPLORE 🔥
              </button>
            </div>
          )}

          {state.screen === 'combat' && (
            <div style={{ maxWidth: '700px', animation: 'slideUp 0.4s', width: '100%' }}>
              <div style={{
                background: `linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))`,
                border: `4px solid ${Colors.accent}`,
                borderRadius: '20px',
                padding: '50px',
                boxShadow: `0 0 60px ${Colors.accent}`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{ fontSize: '100px', marginBottom: '20px', animation: 'bounce 0.8s infinite' }}>{state.enemyName?.split(' ')[0]}</div>
                  <h2 style={{ fontSize: '40px', color: Colors.accent, margin: 0, textShadow: `0 0 20px ${Colors.accent}` }}>{state.enemyName}</h2>
                </div>

                {/* BARS */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', color: Colors.primary, fontWeight: 'bold' }}>
                    <span>YOUR HP</span>
                    <span>{state.hp}/{state.maxHp}</span>
                  </div>
                  <div style={{
                    height: '30px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: `2px solid ${Colors.primary}`,
                  }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${Colors.primary}, ${Colors.secondary})`,
                      width: `${hpPercent}%`,
                      transition: 'width 0.3s ease',
                      boxShadow: `0 0 10px ${Colors.primary}`,
                    }} />
                  </div>

                  <div style={{ marginTop: '30px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', color: Colors.accent, fontWeight: 'bold' }}>
                    <span>ENEMY HP</span>
                    <span>{state.enemyHp}/{state.enemyMaxHp}</span>
                  </div>
                  <div style={{
                    height: '30px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    border: `2px solid ${Colors.accent}`,
                  }}>
                    <div style={{
                      height: '100%',
                      background: Colors.accent,
                      width: `${enemyPercent}%`,
                      transition: 'width 0.3s ease',
                      boxShadow: `0 0 10px ${Colors.accent}`,
                    }} />
                  </div>
                </div>

                <button
                  onClick={attack}
                  style={{
                    width: '100%',
                    padding: '24px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    background: `linear-gradient(135deg, ${Colors.accent}, ${Colors.danger})`,
                    color: 'white',
                    border: `3px solid ${Colors.danger}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: `0 0 40px ${Colors.accent}`,
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={e => {
                    (e.target as any).style.transform = 'scale(1.05)';
                    (e.target as any).style.boxShadow = `0 0 60px ${Colors.accent}, 0 0 100px ${Colors.danger}`;
                  }}
                  onMouseLeave={e => {
                    (e.target as any).style.transform = 'scale(1)';
                    (e.target as any).style.boxShadow = `0 0 40px ${Colors.accent}`;
                  }}
                >
                  ⚔️ SMASH ⚔️
                </button>
              </div>
            </div>
          )}

          {state.screen === 'victory' && (
            <div style={{ textAlign: 'center', maxWidth: '600px', animation: 'slideDown 0.5s' }}>
              <div style={{ fontSize: '140px', marginBottom: '30px', animation: 'bounce 0.8s infinite' }}>🏆</div>
              <h2 style={{ fontSize: '56px', color: Colors.primary, marginBottom: '30px', textShadow: `0 0 30px ${Colors.primary}` }}>VICTORY!</h2>
              <div style={{
                background: `linear-gradient(135deg, rgba(132,204,22,0.2), rgba(6,182,212,0.2))`,
                borderRadius: '16px',
                padding: '30px',
                marginBottom: '40px',
                border: `3px solid ${Colors.primary}`,
                fontSize: '22px',
              }}>
                <div style={{ marginBottom: '20px', color: Colors.accent }}>⭐ +{state.xpGained} XP GAINED ⭐</div>
                <div style={{ color: Colors.secondary }}>🎁 LOOT: {state.loot?.join(', ') || 'Nothing'} 🎁</div>
              </div>
              <button
                onClick={cont}
                style={{
                  padding: '20px 60px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${Colors.primary}, ${Colors.secondary})`,
                  color: Colors.dark,
                  border: `3px solid ${Colors.primary}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: `0 0 40px ${Colors.primary}`,
                }}
              >
                🚀 NEXT ADVENTURE 🚀
              </button>
            </div>
          )}

          {state.screen === 'defeat' && (
            <div style={{ textAlign: 'center', maxWidth: '600px', animation: 'fadeIn 0.5s' }}>
              <div style={{ fontSize: '120px', marginBottom: '30px' }}>💀</div>
              <h2 style={{ fontSize: '48px', color: Colors.danger, marginBottom: '30px', textShadow: `0 0 20px ${Colors.danger}` }}>DEFEATED</h2>
              <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '40px' }}>The stench of failure fills the air...</p>
              <button
                onClick={cont}
                style={{
                  padding: '20px 60px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${Colors.secondary}, ${Colors.primary})`,
                  color: Colors.dark,
                  border: `3px solid ${Colors.secondary}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: `0 0 40px ${Colors.secondary}`,
                }}
              >
                🔄 TRY AGAIN 🔄
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
