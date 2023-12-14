export default class User {
  admin = false
  constructor(id, name) {
    this.id = id
    this.name = name
    this.createdAt = new Date()
  }
}
