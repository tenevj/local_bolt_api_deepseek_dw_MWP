export class Monster {
      constructor(type, position) {
        this.id = crypto.randomUUID()
        this.type = type
        this.position = position
        this.stats = {
          health: 10,
          attack: 5,
          defense: 3,
          armorFactor: 2
        }
      }
    }
