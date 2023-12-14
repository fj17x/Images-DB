export default class Image {
  constructor(id, url, title, description = "", ownerId) {
    this.id = id
    this.url = url
    this.title = title
    this.description = description
    this.createdAt = new Date()
    this.ownerId = ownerId
  }

  setDescription(newDescription) {
    this.description = newDescription
  }
}
