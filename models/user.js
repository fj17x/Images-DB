export default class User {
  isAdmin = false
  imageIds = []
  constructor(id, username, password) {
    this.id = id
    this.username = username
    this.password = password
    this.createdAt = new Date()
  }

  addImageId(id) {
    this.imageIds.push(id)
  }
}
