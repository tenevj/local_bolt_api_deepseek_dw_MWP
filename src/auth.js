export class AuthSystem {
      constructor() {
        this.users = new Map()
        this.currentUser = null
      }

      register(username, password) {
        if (this.users.has(username)) {
          return false
        }
        this.users.set(username, {
          password,
          characters: []
        })
        return true
      }

      login(username, password) {
        const user = this.users.get(username)
        if (user && user.password === password) {
          this.currentUser = username
          return true
        }
        return false
      }

      createCharacter(username, character) {
        const user = this.users.get(username)
        if (user) {
          user.characters.push(character)
          return true
        }
        return false
      }

      getCharacters() {
        const user = this.users.get(this.currentUser)
        return user ? user.characters : []
      }
    }
