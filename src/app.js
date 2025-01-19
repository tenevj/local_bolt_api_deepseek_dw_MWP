import { AuthSystem } from './auth.js'
    import { GameWorld } from './gameWorld.js'
    import { Character } from './character.js'
    import { Monster } from './monster.js'
    import { HexUtils } from './hexUtils.js'

    export function createApp() {
      const auth = new AuthSystem()
      const gameWorld = new GameWorld()
      const hexSize = 40
      let selectedCharacter = null
      let isMoving = false
      const moveDuration = 300 // milliseconds

      // Add some test users
      auth.register('test', 'test')
      auth.createCharacter('test', new Character(
        'Test Hero',
        'Knight',
        {
          health: 20,
          attack: 8,
          defense: 5,
          armorFactor: 3
        }
      ))

      const app = document.createElement('div')
      app.innerHTML = `
        <div id="login-section">
          <h1>Dragon Warriors RPG</h1>
          <input type="text" id="username" placeholder="Username">
          <input type="password" id="password" placeholder="Password">
          <button id="login-btn">Login</button>
          <button id="register-btn">Register</button>
          <div id="login-message" style="color: red; margin-top: 10px;"></div>
        </div>
        <div id="character-section" style="display: none;">
          <h2>Select or Create Character</h2>
          <div id="character-list"></div>
          <button id="create-character-btn">Create New Character</button>
        </div>
        <div id="game-section" style="display: none;">
          <h2>Game World</h2>
          <div id="game-map" style="position: relative; width: 100%; height: 80vh;"></div>
        </div>
      `

      // Get references to elements
      const loginSection = app.querySelector('#login-section')
      const characterSection = app.querySelector('#character-section')
      const gameSection = app.querySelector('#game-section')
      const characterList = app.querySelector('#character-list')
      const loginMessage = app.querySelector('#login-message')

      function renderCharacters() {
        characterList.innerHTML = ''
        auth.getCharacters().forEach(character => {
          const charDiv = document.createElement('div')
          charDiv.textContent = `${character.name} (${character.className})`
          charDiv.style.cursor = 'pointer'
          charDiv.style.margin = '5px'
          charDiv.style.padding = '5px'
          charDiv.style.border = '1px solid #666'
          
          charDiv.addEventListener('click', () => {
            gameWorld.addCharacter(character)
            const monster = new Monster('Goblin', { q: 3, r: -2, s: -1 })
            gameWorld.addMonster(monster)
            characterSection.style.display = 'none'
            gameSection.style.display = 'block'
            renderHexGrid()
          })
          characterList.appendChild(charDiv)
        })
      }

      function renderHexGrid() {
        const gameMap = app.querySelector('#game-map')
        if (!gameMap) return
        
        gameMap.innerHTML = ''
        
        const entities = gameWorld.getEntities()
        const hexSize = 40
        const hexHeight = Math.sqrt(3) * hexSize

        // Render grid
        for (let q = -gameWorld.mapSize; q <= gameWorld.mapSize; q++) {
          for (let r = -gameWorld.mapSize; r <= gameWorld.mapSize; r++) {
            const s = -q - r
            if (Math.abs(s) > gameWorld.mapSize) continue
            
            const { x, y } = HexUtils.hexToPixel({ q, r }, hexSize)
            const hexDiv = document.createElement('div')
            hexDiv.classList.add('hex')
            hexDiv.dataset.q = q
            hexDiv.dataset.r = r
            hexDiv.style.position = 'absolute'
            hexDiv.style.left = `calc(50% + ${x}px)`
            hexDiv.style.top = `calc(50% + ${y}px)`
            hexDiv.style.width = `${hexSize * 2}px`
            hexDiv.style.height = `${hexHeight}px`
            hexDiv.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
            hexDiv.style.backgroundColor = entities.obstacles.includes(`${q},${r}`) ? '#555' : '#333'
            hexDiv.style.cursor = 'pointer'
            hexDiv.style.transform = 'translate(-50%, -50%)'
            gameMap.appendChild(hexDiv)
          }
        }

        // Render character
        const character = entities.characters[0]
        if (character) {
          const { x, y } = HexUtils.hexToPixel(character.position, hexSize)
          const charDiv = document.createElement('div')
          charDiv.textContent = '🧙'
          charDiv.classList.add('character')
          charDiv.style.position = 'absolute'
          charDiv.style.left = `calc(50% + ${x}px)`
          charDiv.style.top = `calc(50% + ${y}px)`
          charDiv.style.fontSize = `${hexSize}px`
          charDiv.style.pointerEvents = 'none'
          charDiv.style.transform = 'translate(-50%, -50%)'
          charDiv.style.transition = `all ${moveDuration}ms ease-in-out`
          gameMap.appendChild(charDiv)
        }

        // Render monster
        const monster = entities.monsters[0]
        if (monster) {
          const { x, y } = HexUtils.hexToPixel(monster.position, hexSize)
          const monsterDiv = document.createElement('div')
          monsterDiv.textContent = '👹'
          monsterDiv.classList.add('monster')
          monsterDiv.style.position = 'absolute'
          monsterDiv.style.left = `calc(50% + ${x}px)`
          monsterDiv.style.top = `calc(50% + ${y}px)`
          monsterDiv.style.fontSize = `${hexSize}px`
          monsterDiv.style.pointerEvents = 'none'
          monsterDiv.style.transform = 'translate(-50%, -50%)'
          gameMap.appendChild(monsterDiv)
        }

        // Add click handler after grid is rendered
        gameMap.addEventListener('click', handleHexClick)
      }

      async function moveCharacterTo(character, destination) {
        if (isMoving) return
        isMoving = true
        
        const gameMap = app.querySelector('#game-map')
        const charDiv = gameMap.querySelector('.character')
        
        // Calculate new position
        const { x, y } = HexUtils.hexToPixel(destination, 40)
        
        // Update character position
        character.position = destination
        
        // Animate movement
        charDiv.style.left = `calc(50% + ${x}px)`
        charDiv.style.top = `calc(50% + ${y}px)`
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, moveDuration))
        isMoving = false
      }

      function handleHexClick(event) {
        if (isMoving) return
        
        const hex = event.target.closest('.hex')
        if (!hex) return
        
        const q = parseInt(hex.dataset.q)
        const r = parseInt(hex.dataset.r)
        const targetHex = { q, r, s: -q-r }
        
        const character = gameWorld.getEntities().characters[0]
        if (!character) return
        
        // Check if target is occupied
        const isOccupied = (hex) => {
          const entities = gameWorld.getEntities()
          return entities.monsters.some(m => m.position.q === hex.q && m.position.r === hex.r) ||
                 entities.obstacles.includes(`${hex.q},${hex.r}`)
        }
        
        let destination = targetHex
        if (isOccupied(targetHex)) {
          destination = HexUtils.findClosestEmptyHex(targetHex, isOccupied)
          if (!destination) return
        }
        
        // Move character to destination
        moveCharacterTo(character, destination)
      }

      function handleKeyDown(event) {
        if (isMoving) return
        
        const keyMap = {
          'ArrowUp': 5,    // Up-left
          'ArrowRight': 1, // Right
          'ArrowDown': 2,  // Down-right
          'ArrowLeft': 4,  // Left
          'KeyW': 5,       // Up-left
          'KeyD': 1,       // Right
          'KeyS': 2,       // Down-right
          'KeyA': 4        // Left
        }
        
        const direction = keyMap[event.code]
        if (direction !== undefined) {
          const character = gameWorld.getEntities().characters[0]
          if (character) {
            const neighbors = HexUtils.getNeighbors(character.position)
            const destination = neighbors[direction]
            if (gameWorld.isPositionValid(destination)) {
              moveCharacterTo(character, destination)
            }
          }
        }
      }

      // Login handler
      app.querySelector('#login-btn').addEventListener('click', () => {
        const username = app.querySelector('#username').value
        const password = app.querySelector('#password').value
        
        if (!username || !password) {
          loginMessage.textContent = 'Please enter both username and password'
          return
        }

        if (auth.login(username, password)) {
          loginSection.style.display = 'none'
          characterSection.style.display = 'block'
          renderCharacters()
          loginMessage.textContent = ''
        } else {
          loginMessage.textContent = 'Invalid username or password'
        }
      })

      // Register handler
      app.querySelector('#register-btn').addEventListener('click', () => {
        const username = app.querySelector('#username').value
        const password = app.querySelector('#password').value
        
        if (!username || !password) {
          loginMessage.textContent = 'Please enter both username and password'
          return
        }

        if (auth.register(username, password)) {
          loginMessage.textContent = 'Registration successful! Please login.'
        } else {
          loginMessage.textContent = 'Username already exists'
        }
      })

      // Character creation handler
      app.querySelector('#create-character-btn').addEventListener('click', () => {
        const character = new Character(
          `Hero ${auth.getCharacters().length + 1}`,
          'Knight',
          {
            health: 20,
            attack: 8,
            defense: 5,
            armorFactor: 3
          }
        )
        auth.createCharacter(auth.currentUser, character)
        renderCharacters()
      })

      // Add keyboard controls
      window.addEventListener('keydown', handleKeyDown)

      return app
    }
