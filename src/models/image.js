import { DataTypes } from "sequelize"
import sequelize from "../config/connection.js"

const Image = sequelize.define(
  "Image",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(65),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    ownerId: {
      type: DataTypes.INTEGER,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    paranoid: true,
    deletedAt: "destroyTime",
  }
)

export default Image
