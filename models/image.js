import { DataTypes } from "sequelize"
import sequelize from "../db/connection.js"

const Image = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    // createdAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // modifiedAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    ownerId: {
      type: DataTypes.INTEGER,
    },
    ownerUserName: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // isDeleted: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    // },
  },
  {
    paranoid: true,
    deletedAt: "destroyTime",
  }
)

export default Image

// export default class Image {
//   isFlagged = false
//   isDeleted = false
//   constructor(id, url, title, description = "", ownerId, ownerUserName, tags = []) {
//     this.id = id
//     this.url = url
//     this.title = title
//     this.description = description
//     this.createdAt = new Date()
//     this.modifiedAt = new Date()
//     this.ownerId = ownerId
//     this.ownerUserName = ownerUserName
//     this.tags = tags
//   }
// }
