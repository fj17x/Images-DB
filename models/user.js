export default class User {
  isAdmin = false
  constructor(id, username, password) {
    this.id = id
    this.username = username
    this.password = password
    this.createdAt = new Date()
  }
}
