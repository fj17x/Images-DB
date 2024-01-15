import { DataTypes } from "sequelize"
import sequelize from "../db/connection.js"

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // createdAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // modifiedAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    ownerUserName: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // isDeleted: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    // },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    paranoid: true,
    deletedAt: "destroyTime",
  }
)

export default User

// export default class User {
//   isAdmin = false
//   isDeleted = false
//   constructor(id, userName, password) {
//     this.id = id
//     this.userName = userName
//     this.password = password
//     this.createdAt = new Date()
//     this.modifiedAt = new Date()
//   }
// }
