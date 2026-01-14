const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Roblox Gamepasses - Actif',
    version: '1.0.0'
  });
});

// Route principale pour récupérer les gamepasses
app.get('/api/gamepasses/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`📡 Récupération des gamepasses pour l'utilisateur: ${userId}`);

    const gamepasses = [];
    let cursor = '';
    let hasMore = true;

    // Récupérer tous les gamepasses du joueur (avec pagination)
    while (hasMore) {
      try {
        const url = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50${cursor ? '&cursor=' + cursor : ''}`;
        
        const gamesResponse = await axios.get(url, {
          headers: {
            'User-Agent': 'Roblox/WinInet'
          },
          timeout: 10000
        });

        if (gamesResponse.data && gamesResponse.data.data) {
          // Pour chaque jeu, récupérer ses gamepasses
          for (const game of gamesResponse.data.data) {
            try {
              const gamepassUrl = `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`;
              const passResponse = await axios.get(gamepassUrl, {
                headers: {
                  'User-Agent': 'Roblox/WinInet'
                },
                timeout: 10000
              });

              if (passResponse.data && passResponse.data.data) {
                for (const pass of passResponse.data.data) {
                  // Récupérer le prix du gamepass
                  try {
                    const priceUrl = `https://apis.roblox.com/game-passes/v1/game-passes/${pass.id}/product-info`;
                    const priceResponse = await axios.get(priceUrl, {
                      headers: {
                        'User-Agent': 'Roblox/WinInet'
                      },
                      timeout: 10000
                    });

                    const price = priceResponse.data?.price || 0;

                    gamepasses.push({
                      id: pass.id,
                      name: pass.name,
                      price: price,
                      iconImageId: pass.iconImageId || 0
                    });

                  } catch (priceError) {
                    console.log(`⚠️ Erreur prix pour gamepass ${pass.id}`);
                    gamepasses.push({
                      id: pass.id,
                      name: pass.name,
                      price: 0,
                      iconImageId: pass.iconImageId || 0
                    });
                  }
                }
              }
            } catch (gamepassError) {
              console.log(`⚠️ Erreur gamepasses pour jeu ${game.id}`);
            }
          }
        }

        cursor = gamesResponse.data.nextPageCursor || '';
        hasMore = cursor !== '' && cursor !== null;

      } catch (pageError) {
        console.log('⚠️ Erreur pagination:', pageError.message);
        hasMore = false;
      }
    }

    console.log(`✅ ${gamepasses.length} gamepasses trouvés pour ${userId}`);

    res.json({
      success: true,
      userId: userId,
      count: gamepasses.length,
      gamepasses: gamepasses
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      gamepasses: []
    });
  }
});

// Route de statistiques
app.get('/api/stats', (req, res) => {
  res.json({
    status: 'operational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
});
```

Clique "Commit new file"

---

### 4️⃣ Déployer sur Render.com

1. Va sur **render.com**
2. Clique "Get Started" et connecte-toi avec ton compte GitHub
3. Clique "New +" → "Web Service"
4. Connecte ton repository `roblox-gamepass-api`
5. Configure :
   - **Name** : `roblox-gamepass-api`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : `Free`
6. Clique "Create Web Service"
7. **Attends 2-3 minutes** que le déploiement se termine

### 5️⃣ Récupérer ton URL

Une fois déployé, tu verras une URL comme :
```
https://roblox-gamepass-api-xxxx.onrender.com
