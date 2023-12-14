export default class Image {
  constructor(id, url, title, description = "") {
    this.id = id
    this.url = url
    this.title = title
    this.description = description
    this.createdAt = new Date()
  }

  setDescription(newDescription) {
    this.description = newDescription
  }
}
