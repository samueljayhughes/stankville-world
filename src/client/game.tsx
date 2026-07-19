import './index.css';
import { StrictMode, useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

type Screen = "splash" | "explore" | "combat" | "npc" | "victory" | "defeat" | "inventory";

type GameState = {
  screen: Screen;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpToNext: number;
  
  // Combat
  sessionId?: string;
  enemyName?: string;
  enemyHealth?: number;
  enemyMaxHealth?: number;
  lastDamage?: number;
  
  // NPC
  npcName?: string;
  npcDialogue?: string[];
  
  // Loot
  lootItems?: string[];
  xpGained?: number;
};

const STANK_COLORS = {
  primary: '#84cc16',    // lime-500
  secondary: '#06b6d4',  // cyan-500
  accent: '#f59e0b',     // amber-500
  dark: '#0f1710',       // stank-dark
  darkText: '#1f2937',   // gray-800
};

const ENEMIES = {
  sewer_rat: { emoji: '🐀', name: 'Sewer Rat', color: '#ef4444' },
  trash_goblin: { emoji: '👹', name: 'Trash Goblin', color: '#f97316' },
};

const PARTICLES_BURST = (x: number, y: number, count: number = 8) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const velocity = { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 };
    particles.push({ x, y, velocity, life: 1, emoji: '✨' });
  }
  return particles;
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
  const [shaking, setShaking] = useState(false);
  const [glow, setGlow] = useState(false);

  // PARTICLE EFFECTS
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.velocity.x,
            y: p.y + p.velocity.y,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0);
        return updated;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // SCREEN SHAKE
  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  };

  const triggerGlow = () => {
    setGlow(true);
    setTimeout(() => setGlow(false), 800);
  };

  // INIT
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error('Init failed');
        const data = await res.json();
        
        setState(prev => ({
          ...prev,
          screen: 'explore',
          level: data.stats?.level ?? 1,
          hp: data.stats?.health ?? 100,
          maxHp: data.stats?.maxHealth ?? 100,
          xp: data.stats?.xp ?? 0,
          xpToNext: (data.stats?.level ?? 1) * 100,
        }));

        triggerGlow();
        setParticles(PARTICLES_BURST(window.innerWidth / 2, window.innerHeight / 2, 20));
      } catch (err) {
        console.error(err);
      }
    };
    
    setTimeout(init, 800);
  }, []);

  // EXPLORE
  const explore = useCallback(async () => {
    try {
      const res = await fetch('/api/explore', { method: 'POST' });
      const data = await res.json();
      const encounter = data.encounter;

      if (encounter?.type === 'COMBAT') {
        setState(prev => ({
          ...prev,
          screen: 'combat',
          enemyName: ENEMIES[encounter.enemyId as keyof typeof ENEMIES]?.name || encounter.enemyId,
          enemyHealth: 50,
          enemyMaxHealth: 50,
          sessionId: Math.random().toString(),
        }));
        shake();
        triggerGlow();
        setParticles(PARTICLES_BURST(window.innerWidth / 2, window.innerHeight / 2, 12));
      } else if (encounter?.type === 'NPC') {
        setState(prev => ({
          ...prev,
          screen: 'npc',
          npcName: 'Mysterious Wanderer',
          npcDialogue: ['Greetings, traveler...', 'Stankville grows darker...'],
        }));
      } else {
        setParticles(prev => [...prev, ...PARTICLES_BURST(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 4)]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ATTACK
  const attack = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      shake();
      setParticles(prev => [...prev, ...PARTICLES_BURST(window.innerWidth * 0.7, window.innerHeight * 0.4, 15)]);
      
      const res = await fetch('/api/combat/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.sessionId }),
      });

      const data = await res.json();

      if (data.type === 'combat_victory') {
        triggerGlow();
        setParticles(prev => [...prev, ...PARTICLES_BURST(window.innerWidth / 2, window.innerHeight / 2, 30)]);
        setState(prev => ({
          ...prev,
          screen: 'victory',
          level: data.stats?.level ?? prev.level,
          xpGained: data.xp,
          lootItems: data.loot,
          xp: data.stats?.xp ?? prev.xp,
        }));
      } else if (data.type === 'combat_defeat') {
        setState(prev => ({ ...prev, screen: 'defeat' }));
      } else {
        setState(prev => ({
          ...prev,
          enemyHealth: Math.max(0, (prev.enemyHealth ?? 50) - (data.damage || 10)),
          hp: Math.max(0, data.playerHealth ?? prev.hp),
          lastDamage: data.enemyDamage || 5,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [state.sessionId]);

  // CONTINUE
  const continueGame = () => {
    setState(prev => ({ ...prev, screen: 'explore' }));
    setParticles(prev => [...prev, ...PARTICLES_BURST(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 8)]);
  };

  const containerStyle = {
    transform: shaking ? `translate(${Math.sin(Date.now() / 50) * 10}px, ${Math.cos(Date.now() / 50) * 10}px)` : 'none',
    transition: 'transform 0.05s ease-out',
  };

  const glowStyle = glow ? {
    boxShadow: `0 0 40px ${STANK_COLORS.primary}, inset 0 0 40px ${STANK_COLORS.primary}`,
    transition: 'box-shadow 0.3s ease-out',
  } : {};

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${STANK_COLORS.dark} 0%, #1a1f1a 50%, #0d1511 100%)`,
      color: '#f5f5f4',
      fontFamily: '"Courier New", monospace',
      overflow: 'hidden',
      position: 'relative',
      ...containerStyle,
    }}>
      {/* PARTICLE EFFECTS */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              fontSize: '24px',
              opacity: p.life,
              transform: `scale(${p.life})`,
              pointerEvents: 'none',
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* HEADER */}
        <header style={{
          background: `linear-gradient(90deg, rgba(132,204,22,0.1), rgba(6,182,212,0.1))`,
          borderBottom: `3px solid ${STANK_COLORS.primary}`,
          padding: '24px',
          textAlign: 'center',
          boxShadow: `0 0 20px ${STANK_COLORS.primary}80`,
          ...glowStyle,
        }}>
          <h1 style={{
            fontSize: '48px',
            margin: '0 0 16px 0',
            textShadow: `0 0 30px ${STANK_COLORS.primary}, 0 0 60px ${STANK_COLORS.secondary}`,
            background: `linear-gradient(90deg, ${STANK_COLORS.primary}, ${STANK_COLORS.secondary}, ${STANK_COLORS.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold',
            letterSpacing: '3px',
          }}>
            ⚡ STANKVILLE ⚡
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '18px', fontWeight: 'bold' }}>
            <div>🎖️ Level {state.level}</div>
            <div>❤️ HP: {state.hp}/{state.maxHp}</div>
            <div>✨ XP: {state.xp}/{state.xpToNext}</div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}>
          {state.screen === 'splash' && (
            <div style={{
              textAlign: 'center',
              animation: 'pulse 2s infinite',
            }}>
              <div style={{ fontSize: '120px', marginBottom: '24px' }}>🌍💩</div>
              <h2 style={{ fontSize: '36px', color: STANK_COLORS.primary, marginBottom: '16px' }}>WELCOME TO STANKVILLE</h2>
              <p style={{ fontSize: '18px', color: '#a1a1a1', marginBottom: '32px' }}>Where the streets reek of fortune...</p>
              <div style={{ animation: 'bounce 1.5s infinite' }}>⬇️ Loading your destiny ⬇️</div>
            </div>
          )}

          {state.screen === 'explore' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '600px',
              animation: 'fadeIn 0.5s ease-out',
            }}>
              <div style={{ fontSize: '80px', marginBottom: '32px' }}>🗺️</div>
              <h2 style={{ fontSize: '32px', color: STANK_COLORS.secondary, marginBottom: '24px' }}>THE STINK AWAITS</h2>
              <p style={{ fontSize: '16px', color: '#d1d5db', marginBottom: '40px', lineHeight: '1.8' }}>
                The putrid aroma of adventure fills your nostrils.<br/>
                What horrors lurk in the darkness?
              </p>
              <button
                onClick={explore}
                style={{
                  padding: '16px 48px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${STANK_COLORS.primary}, ${STANK_COLORS.accent})`,
                  color: STANK_COLORS.darkText,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: `0 0 30px ${STANK_COLORS.primary}, 0 0 60px ${STANK_COLORS.accent}`,
                  transform: 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'scale(1.1)';
                  target.style.boxShadow = `0 0 40px ${STANK_COLORS.primary}, 0 0 80px ${STANK_COLORS.accent}`;
                }}
                onMouseLeave={e => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'scale(1)';
                  target.style.boxShadow = `0 0 30px ${STANK_COLORS.primary}, 0 0 60px ${STANK_COLORS.accent}`;
                }}
              >
                🔥 EXPLORE 🔥
              </button>
            </div>
          )}

          {state.screen === 'combat' && (
            <div style={{
              maxWidth: '700px',
              animation: 'slideUp 0.4s ease-out',
            }}>
              <div style={{
                background: `linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.1))`,
                border: `3px solid ${STANK_COLORS.accent}`,
                borderRadius: '16px',
                padding: '40px',
                boxShadow: `0 0 40px ${STANK_COLORS.accent}80`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ fontSize: '80px', marginBottom: '16px' }}>
                    {state.enemyName?.includes('Rat') ? '🐀' : '👹'}
                  </div>
                  <h2 style={{ fontSize: '32px', color: STANK_COLORS.accent, margin: 0 }}>{state.enemyName}</h2>
                </div>

                {/* HEALTH BARS */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: STANK_COLORS.primary }}>YOUR HP</span>
                    <span>{state.hp}/{state.maxHp}</span>
                  </div>
                  <div style={{
                    height: '20px',
                    background: '#1f2937',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `2px solid ${STANK_COLORS.primary}`,
                  }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${STANK_COLORS.primary}, ${STANK_COLORS.secondary})`,
                      width: `${(state.hp / state.maxHp) * 100}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  <div style={{ marginTop: '24px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: STANK_COLORS.accent }}>ENEMY HP</span>
                    <span>{state.enemyHealth}/{state.enemyMaxHealth}</span>
                  </div>
                  <div style={{
                    height: '20px',
                    background: '#1f2937',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `2px solid ${STANK_COLORS.accent}`,
                  }}>
                    <div style={{
                      height: '100%',
                      background: STANK_COLORS.accent,
                      width: `${((state.enemyHealth ?? 50) / (state.enemyMaxHealth ?? 50)) * 100}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {state.lastDamage && (
                  <div style={{
                    textAlign: 'center',
                    color: STANK_COLORS.accent,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '24px',
                    animation: 'pulse 0.5s ease',
                  }}>
                    💥 -{state.lastDamage} DAMAGE TAKEN 💥
                  </div>
                )}

                <button
                  onClick={attack}
                  style={{
                    width: '100%',
                    padding: '20px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: `linear-gradient(135deg, ${STANK_COLORS.accent}, #ef4444)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: `0 0 30px ${STANK_COLORS.accent}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'scale(1.05)';
                    target.style.boxShadow = `0 0 50px ${STANK_COLORS.accent}`;
                  }}
                  onMouseLeave={e => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'scale(1)';
                    target.style.boxShadow = `0 0 30px ${STANK_COLORS.accent}`;
                  }}
                >
                  ⚔️ ATTACK ⚔️
                </button>
              </div>
            </div>
          )}

          {state.screen === 'victory' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '600px',
              animation: 'slideDown 0.5s ease-out',
            }}>
              <div style={{ fontSize: '120px', marginBottom: '24px', animation: 'bounce 1s infinite' }}>🏆</div>
              <h2 style={{
                fontSize: '48px',
                color: STANK_COLORS.primary,
                marginBottom: '32px',
                textShadow: `0 0 30px ${STANK_COLORS.primary}`,
              }}>
                VICTORY!
              </h2>
              <div style={{
                background: `linear-gradient(135deg, rgba(132,204,22,0.1), rgba(6,182,212,0.1))`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                border: `2px solid ${STANK_COLORS.primary}`,
                fontSize: '20px',
              }}>
                <div style={{ marginBottom: '16px' }}>⭐ +{state.xpGained} XP ⭐</div>
                <div style={{ marginBottom: '16px' }}>🎁 Loot: {state.lootItems?.join(', ') || 'Nothing'} 🎁</div>
                <div>📈 Level {state.level}</div>
              </div>
              <button
                onClick={continueGame}
                style={{
                  padding: '16px 48px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${STANK_COLORS.primary}, ${STANK_COLORS.secondary})`,
                  color: STANK_COLORS.darkText,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: `0 0 30px ${STANK_COLORS.primary}`,
                }}
              >
                🚀 CONTINUE ADVENTURE 🚀
              </button>
            </div>
          )}

          {state.screen === 'defeat' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '600px',
              animation: 'fadeIn 0.5s ease-out',
            }}>
              <div style={{ fontSize: '100px', marginBottom: '24px' }}>💀</div>
              <h2 style={{ fontSize: '48px', color: '#ef4444', marginBottom: '32px' }}>DEFEATED</h2>
              <p style={{ fontSize: '18px', color: '#d1d5db', marginBottom: '32px' }}>
                The stench of failure fills the air...<br/>
                But your journey is far from over.
              </p>
              <button
                onClick={continueGame}
                style={{
                  padding: '16px 48px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${STANK_COLORS.secondary}, ${STANK_COLORS.primary})`,
                  color: STANK_COLORS.darkText,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: `0 0 30px ${STANK_COLORS.secondary}`,
                }}
              >
                🔄 TRY AGAIN 🔄
              </button>
            </div>
          )}
        </main>
      </div>

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
