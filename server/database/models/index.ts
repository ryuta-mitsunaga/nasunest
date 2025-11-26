import { sequelize } from '../config'
import { DataTypes, Model, Optional } from 'sequelize'

// Memberモデル
export interface MemberAttributes {
  id: number
  name_sei: string
  name_mei: string
  start_date: Date
  end_date: Date | null
  mission: string
  description: string
  icon: Buffer | null
  x_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface MemberCreationAttributes
  extends Optional<
    MemberAttributes,
    | 'id'
    | 'end_date'
    | 'icon'
    | 'x_url'
    | 'instagram_url'
    | 'facebook_url'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Member
  extends Model<MemberAttributes, MemberCreationAttributes>
  implements MemberAttributes
{
  public id!: number
  public name_sei!: string
  public name_mei!: string
  public start_date!: Date
  public end_date!: Date | null
  public mission!: string
  public description!: string
  public icon!: Buffer | null
  public x_url!: string | null
  public instagram_url!: string | null
  public facebook_url!: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Member.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name_sei: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_mei: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    mission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    icon: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    x_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'XのURL',
    },
    instagram_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'InstagramのURL',
    },
    facebook_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'FacebookのURL',
    },
  },
  {
    sequelize,
    tableName: 'chiki_okoshi_members',
    timestamps: true,
  }
)

// Adminモデル
export interface AdminAttributes {
  id: number
  login_id: string
  password: string
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminCreationAttributes
  extends Optional<AdminAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  public id!: number
  public login_id!: string
  public password!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Admin.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    login_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'admins',
    timestamps: true,
  }
)

// Formモデル
export interface FormAttributes {
  id: number
  admin_id: number
  name: string
  content: any // JSON形式
  published_start: Date | null
  published_end: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export interface FormCreationAttributes
  extends Optional<
    FormAttributes,
    'id' | 'published_start' | 'published_end' | 'createdAt' | 'updatedAt'
  > {}

export class Form
  extends Model<FormAttributes, FormCreationAttributes>
  implements FormAttributes
{
  public id!: number
  public admin_id!: number
  public name!: string
  public content!: any
  public published_start!: Date | null
  public published_end!: Date | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Form.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    published_start: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '公開開始日',
    },
    published_end: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '公開終了日',
    },
  },
  {
    sequelize,
    tableName: 'forms',
    timestamps: true,
  }
)

// FormAnswerモデル
export interface FormAnswerAttributes {
  id: number
  form_id: number
  date: Date
  content: any // JSON形式
  createdAt?: Date
  updatedAt?: Date
}

export interface FormAnswerCreationAttributes
  extends Optional<FormAnswerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class FormAnswer
  extends Model<FormAnswerAttributes, FormAnswerCreationAttributes>
  implements FormAnswerAttributes
{
  public id!: number
  public form_id!: number
  public date!: Date
  public content!: any
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

FormAnswer.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    form_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'forms',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'forms_answer',
    timestamps: true,
  }
)

// Eventモデル
export interface EventAttributes {
  id: number
  admin_id: number
  title: string
  form_id: number | null
  start_date: Date
  end_date: Date | null
  description: string
  body: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: Buffer | null
  cta_button_text: string | null
  is_published: boolean
  published_start: Date | null
  published_end: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export interface EventCreationAttributes
  extends Optional<
    EventAttributes,
    | 'id'
    | 'form_id'
    | 'end_date'
    | 'body'
    | 'location_name'
    | 'location_address'
    | 'location_url'
    | 'thumbnail'
    | 'cta_button_text'
    | 'is_published'
    | 'published_start'
    | 'published_end'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  public id!: number
  public admin_id!: number
  public title!: string
  public form_id!: number | null
  public start_date!: Date
  public end_date!: Date | null
  public description!: string
  public body!: string | null
  public location_name!: string | null
  public location_address!: string | null
  public location_url!: string | null
  public thumbnail!: Buffer | null
  public cta_button_text!: string | null
  public is_published!: boolean
  public published_start!: Date | null
  public published_end!: Date | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Event.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    form_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'forms',
        key: 'id',
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Editor.jsで作成した本文（JSON形式）',
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    cta_button_text: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'CTAボタンのテキスト（デフォルト: 参加申し込み）',
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '公開フラグ（true: 公開, false: 非公開）',
    },
    published_start: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '公開開始日',
    },
    published_end: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '公開終了日',
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: true,
  }
)

// PickupEventモデル
export interface PickupEventAttributes {
  id: number
  event_id: number
  pickup_datetime_start: Date
  pickup_datetime_end: Date
  left_text: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PickupEventCreationAttributes
  extends Optional<PickupEventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PickupEvent
  extends Model<PickupEventAttributes, PickupEventCreationAttributes>
  implements PickupEventAttributes
{
  public id!: number
  public event_id!: number
  public pickup_datetime_start!: Date
  public pickup_datetime_end!: Date
  public left_text!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

PickupEvent.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    pickup_datetime_start: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'ピックアップ開始日時',
    },
    pickup_datetime_end: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'ピックアップ終了日時',
    },
    left_text: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CTAボタン左側に表示するテキスト',
    },
  },
  {
    sequelize,
    tableName: 'pickup_events',
    timestamps: true,
  }
)

// モデルの関連付け
Event.hasMany(PickupEvent, {
  foreignKey: 'event_id',
  as: 'pickupEvents',
})

PickupEvent.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
})

// すべてのモデルをエクスポート
export const models = {
  Member,
  Admin,
  Form,
  FormAnswer,
  Event,
  PickupEvent,
}
