export default class Image {
  isFlagged = false
  isDeleted = false
  constructor(id, url, title, description = "", ownerId, ownerUserName, tags = []) {
    this.id = id
    this.url = url
    this.title = title
    this.description = description
    this.createdAt = new Date()
    this.ownerId = ownerId
    this.ownerUserName = ownerUserName
    this.tags = tags
  }
}
