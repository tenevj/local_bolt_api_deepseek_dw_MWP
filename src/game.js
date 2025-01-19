export class Game {
      constructor() {
        this.players = new Map()
        this.combatQueue = []
        this.currentRound = 0
      }

      addPlayer(player) {
        this.players.set(player.id, player)
      }

      startCombat(attackerId, defenderId) {
        const attacker = this.players.get(attackerId)
        const defender = this.players.get(defenderId)
        
        if (!attacker || !defender) return
        
        this.combatQueue.push({ attacker, defender })
        this.processCombat()
      }

      processCombat() {
        if (this.combatQueue.length === 0) return
        
        const { attacker, defender } = this.combatQueue.shift()
        const attackRoll = this.rollD20()
        const modifiedRoll = attackRoll - defender.stats.defense
        
        if (attackRoll === 1 || modifiedRoll <= attacker.stats.attack) {
          const damageRoll = this.rollDamage(attacker.weapon)
          if (damageRoll > defender.stats.armorFactor) {
            defender.stats.health -= attacker.weapon.damage
          }
        }
        
        this.currentRound++
        this.processCombat()
      }

      rollD20() {
        return Math.floor(Math.random() * 20) + 1
      }

      rollDamage(weapon) {
        return Math.floor(Math.random() * weapon.damageDie) + 1
      }
    }
