export default class User {
  isAdmin = false
  isDeleted = false
  constructor(id, userName, password) {
    this.id = id
    this.userName = userName
    this.password = password
    this.createdAt = new Date()
  }
}
