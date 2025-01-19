export class AIGameMaster {
      constructor(apiKey) {
        this.apiKey = apiKey
      }

      async generateScenario() {
        // TODO: Implement API call to LLM
        return {
          description: 'A dark forest looms ahead...',
          enemies: [
            { type: 'goblin', count: 3 }
          ]
        }
      }

      async narrateOutcome(outcome) {
        // TODO: Implement API call to LLM
        return `The battle rages on! ${outcome}`
      }
    }
