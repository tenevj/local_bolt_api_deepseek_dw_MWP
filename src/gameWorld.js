import { HexUtils } from './hexUtils.js'

    export class GameWorld {
      constructor() {
        this.characters = new Map()
        this.monsters = new Map()
        this.mapSize = 15
        this.hexSize = 40
        this.obstacles = new Set()
        this.generateMap()
      }

      generateMap() {
        // Generate some random obstacles
        for (let q = -this.mapSize; q <= this.mapSize; q++) {
          for (let r = -this.mapSize; r <= this.mapSize; r++) {
            if (Math.random() < 0.1) {
              this.obstacles.add(`${q},${r}`)
            }
          }
        }
      }

      addCharacter(character) {
        this.characters.set(character.id, character)
        // Place character at center
        character.position = { q: 0, r: 0, s: 0 }
      }

      addMonster(monster) {
        this.monsters.set(monster.id, monster)
        // Place monster near character
        monster.position = { q: 3, r: -2, s: -1 }
      }

      moveCharacter(characterId, direction) {
        const character = this.characters.get(characterId)
        if (!character) return false

        const neighbors = HexUtils.getNeighbors(character.position)
        const newPosition = neighbors[direction]
        
        if (this.isPositionValid(newPosition)) {
          character.position = newPosition
          return true
        }
        return false
      }

      isPositionValid(position) {
        const key = `${position.q},${position.r}`
        return (
          Math.abs(position.q) <= this.mapSize &&
          Math.abs(position.r) <= this.mapSize &&
          Math.abs(position.s) <= this.mapSize &&
          !this.obstacles.has(key)
        )
      }

      getEntities() {
        return {
          characters: Array.from(this.characters.values()),
          monsters: Array.from(this.monsters.values()),
          obstacles: Array.from(this.obstacles)
        }
      }
    }
