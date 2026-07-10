import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';


type GameState = {
  status: string;
  enemyId?: string;
  sessionId?: string;
  enemyHealth?: number;
  playerHealth?: number;
  xp?: number;
  loot?: string[];
};


export const App = () => {

  const [state, setState] = useState<GameState>({
    status: "Loading Stankville...",
  });


  useEffect(() => {

    const init = async () => {

      try {

        const res = await fetch('/api/init');

        if (!res.ok) {
          throw new Error(
            `Init failed ${res.status}`
          );
        }


        await res.json();


        setState({
          status:"Ready to explore.",
        });


      } catch(err) {

        console.error(err);

        setState({
          status:"Failed to load game.",
        });

      }

    };


    void init();

  }, []);



  const explore = async () => {

    const res =
      await fetch('/api/explore', {
        method:"POST",
      });


    const data =
      await res.json();


    if(data.encounter?.type === "COMBAT") {

      setState({

        status:`A ${data.encounter.enemyId} appeared!`,

        enemyId:
          data.encounter.enemyId,

      });

    } else {

      setState({

        status:
          `You found ${data.encounter.type}`,

      });

    }

  };



  const startCombat = async () => {

    if(!state.enemyId) return;


    const res =
      await fetch('/api/combat/start', {

        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },

        body:JSON.stringify({

          enemyId:
            state.enemyId,

        }),

      });


    const data =
      await res.json();


    setState({

      status:
        `Fighting ${data.session.enemy.name}`,

      sessionId:
        data.session.id,

      enemyId:
        data.session.enemy.id,

      enemyHealth:
        data.session.enemy.currentHealth,

      playerHealth:
        data.session.playerHealth,

    });

  };



  const attack = async () => {

    if(!state.sessionId) return;


    const res =
      await fetch('/api/combat/attack', {

        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },

        body:JSON.stringify({

          sessionId:
            state.sessionId,

        }),

      });


    const data =
      await res.json();


    if(data.type === "combat_victory") {

      setState({

        status:"Victory!",

        xp:data.xp,

        loot:data.loot,

      });

      return;

    }


    if(data.type === "combat_defeat") {

      setState({

        status:"You were defeated.",

      });

      return;

    }


    setState(prev => ({

      ...prev,

      status:
        `Turn ${data.turn}`,

      enemyHealth:
        data.enemyHealth,

      playerHealth:
        data.playerHealth,

    }));

  };



  return (

    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white dark:bg-gray-900">

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Stankville
      </h1>


      <p className="text-gray-700 dark:text-gray-200">
        {state.status}
      </p>



      {state.enemyId && !state.sessionId && (

        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={startCombat}
        >
          Start Combat
        </button>

      )}



      {state.sessionId && (

        <>

          <p>
            Player HP: {state.playerHealth}
          </p>

          <p>
            Enemy HP: {state.enemyHealth}
          </p>


          <button
            className="px-4 py-2 bg-orange-600 text-white rounded"
            onClick={attack}
          >
            Attack
          </button>

        </>

      )}



      {!state.sessionId && !state.xp && (

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={explore}
        >
          Explore
        </button>

      )}



      {state.xp !== undefined && (

        <div>

          <p>
            XP gained: {state.xp}
          </p>

          <p>
            Loot: {state.loot?.join(", ")}
          </p>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={explore}
          >
            Explore Again
          </button>

        </div>

      )}

    </div>

  );

};



createRoot(document.getElementById('root')!).render(

  <StrictMode>

    <App />

  </StrictMode>

);
