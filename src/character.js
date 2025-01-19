export class Character {
      constructor(name, className, stats) {
        this.id = crypto.randomUUID()
        this.name = name
        this.className = className
        this.stats = stats
        this.position = { x: 0, y: 0 }
      }
    }
