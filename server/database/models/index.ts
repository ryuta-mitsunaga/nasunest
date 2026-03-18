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
  icon: Buffer | string | null // Supabase URLまたはBuffer
  x_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  homepage_url: string | null
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
    | 'homepage_url'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Member
  extends Model<MemberAttributes, MemberCreationAttributes>
  implements MemberAttributes
{
  declare id: number
  declare name_sei: string
  declare name_mei: string
  declare start_date: Date
  declare end_date: Date | null
  declare mission: string
  declare description: string
  declare icon: Buffer | string | null
  declare x_url: string | null
  declare instagram_url: string | null
  declare facebook_url: string | null
  declare homepage_url: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Member.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.TEXT, // Supabase URLまたはBase64文字列を保存
      allowNull: true,
      comment: 'Supabase StorageのURLまたはBase64文字列',
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
    homepage_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ホームページのURL',
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
  line_user_id: string | null
  icon_url: string | null
  isMaster: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminCreationAttributes
  extends Optional<
    AdminAttributes,
    'id' | 'line_user_id' | 'icon_url' | 'createdAt' | 'updatedAt'
  > {}

export class Admin
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  declare id: number
  declare login_id: string
  declare password: string
  declare line_user_id: string | null
  declare icon_url: string | null
  declare isMaster: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Admin.init(
  {
    id: {
      type: DataTypes.BIGINT,
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
    line_user_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'LINEユーザーID（LIFF連携用）',
    },
    icon_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Supabase Storageのアイコン画像URL',
    },
    isMaster: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'マスターユーザーフラグ（trueの場合、管理者管理が可能）',
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
  declare id: number
  declare admin_id: number
  declare name: string
  declare content: any
  declare published_start: Date | null
  declare published_end: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Form.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.DATE,
      allowNull: true,
      comment: '公開開始日時',
    },
    published_end: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '公開終了日時',
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
  event_id: number | null
  user_id: number | null
  date: Date
  content: any // JSON形式
  status: number | null
  is_cancel: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface FormAnswerCreationAttributes
  extends Optional<
    FormAnswerAttributes,
    | 'id'
    | 'event_id'
    | 'user_id'
    | 'status'
    | 'is_cancel'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class FormAnswer
  extends Model<FormAnswerAttributes, FormAnswerCreationAttributes>
  implements FormAnswerAttributes
{
  declare id: number
  declare form_id: number
  declare event_id: number | null
  declare user_id: number | null
  declare date: Date
  declare content: any
  declare status: number | null
  declare is_cancel: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

FormAnswer.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    form_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'forms',
        key: 'id',
      },
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'イベントID（イベント経由で回答した場合）',
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '承認ステータス（0: 回答待ち, 1: OK, 2: NG）',
    },
    is_cancel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'キャンセルフラグ（true: キャンセル済み）',
    },
  },
  {
    sequelize,
    tableName: 'form_answers',
    timestamps: true,
  }
)

// Eventモデル
export interface EventAttributes {
  id: number
  admin_id: number
  title: string
  form_id: number | null
  form_link: string | null
  start_date: Date
  end_date: Date | null
  description: string
  body: string | null
  body_html: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  thumbnail: Buffer | null
  cta_button_text: string | null
  is_displayed: boolean
  published_start: Date | null
  published_end: Date | null
  capacity: number | null
  approval_type: number | null
  creator_participates: boolean
  show_creator: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface EventCreationAttributes
  extends Optional<
    EventAttributes,
    | 'id'
    | 'form_id'
    | 'form_link'
    | 'end_date'
    | 'body'
    | 'body_html'
    | 'location_name'
    | 'location_address'
    | 'location_url'
    | 'thumbnail'
    | 'cta_button_text'
    | 'is_displayed'
    | 'published_start'
    | 'published_end'
    | 'capacity'
    | 'approval_type'
    | 'creator_participates'
    | 'show_creator'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  declare id: number
  declare admin_id: number
  declare title: string
  declare form_id: number | null
  declare form_link: string | null
  declare start_date: Date
  declare end_date: Date | null
  declare description: string
  declare body: string | null
  declare body_html: string | null
  declare location_name: string | null
  declare location_address: string | null
  declare location_url: string | null
  declare thumbnail: Buffer | null
  declare cta_button_text: string | null
  declare is_displayed: boolean
  declare published_start: Date | null
  declare published_end: Date | null
  declare capacity: number | null
  declare approval_type: number | null
  declare creator_participates: boolean
  declare show_creator: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Event.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'forms',
        key: 'id',
      },
    },
    form_link: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment:
        '外部フォームURL（NasuNestフォームではなく外部リンクを使う場合）',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
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
    body_html: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '本文のHTML表示用（SSR用）',
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
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Supabase StorageのURL',
    },
    cta_button_text: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'CTAボタンのテキスト（デフォルト: 参加申し込み）',
    },
    is_displayed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '表示フラグ（true: 表示, false: 非表示）',
    },
    published_start: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '公開開始日時',
    },
    published_end: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '公開終了日時',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '定員（nullの場合は無制限）',
    },
    approval_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '参加承認の方式（0: 自動承認, 1: 手動承認, 2: 承認なし）',
    },
    creator_participates: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'イベント作成者も参加者に含める（true: +1する）',
    },
    show_creator: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'イベント作成者を表示するかどうか',
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
  declare id: number
  declare event_id: number
  declare pickup_datetime_start: Date
  declare pickup_datetime_end: Date
  declare left_text: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

PickupEvent.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
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

// AdminInvitationモデル
export interface AdminInvitationAttributes {
  id: number
  admin_id: number
  token: string
  expiry_date: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminInvitationCreationAttributes
  extends Optional<
    AdminInvitationAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

export class AdminInvitation
  extends Model<AdminInvitationAttributes, AdminInvitationCreationAttributes>
  implements AdminInvitationAttributes
{
  declare id: number
  declare admin_id: number
  declare token: string
  declare expiry_date: Date
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

AdminInvitation.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '招待トークン',
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '有効期限',
    },
  },
  {
    sequelize,
    tableName: 'admin_invitations',
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

Event.belongsTo(Admin, {
  foreignKey: 'admin_id',
  as: 'admin',
})

Admin.hasMany(Event, {
  foreignKey: 'admin_id',
  as: 'events',
})

Admin.hasMany(AdminInvitation, {
  foreignKey: 'admin_id',
  as: 'invitations',
})

AdminInvitation.belongsTo(Admin, {
  foreignKey: 'admin_id',
  as: 'admin',
})

// AdminPermissionモデル
export interface AdminPermissionAttributes {
  id: number
  code: string
  name: string
  description: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminPermissionCreationAttributes
  extends Optional<
    AdminPermissionAttributes,
    'id' | 'description' | 'createdAt' | 'updatedAt'
  > {}

export class AdminPermission
  extends Model<AdminPermissionAttributes, AdminPermissionCreationAttributes>
  implements AdminPermissionAttributes
{
  declare id: number
  declare code: string
  declare name: string
  declare description: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

AdminPermission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '権限コード',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '権限名',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '権限の説明',
    },
  },
  {
    sequelize,
    tableName: 'admin_permissions',
    timestamps: true,
  }
)

// AdminAdminPermissionモデル（リレーションテーブル）
export interface AdminAdminPermissionAttributes {
  id: number
  admin_id: number
  admin_permission_id: number
  createdAt?: Date
  updatedAt?: Date
}

export interface AdminAdminPermissionCreationAttributes
  extends Optional<
    AdminAdminPermissionAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

export class AdminAdminPermission
  extends Model<
    AdminAdminPermissionAttributes,
    AdminAdminPermissionCreationAttributes
  >
  implements AdminAdminPermissionAttributes
{
  declare id: number
  declare admin_id: number
  declare admin_permission_id: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

AdminAdminPermission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    admin_permission_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'admin_permissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'admin_admin_permissions',
    timestamps: true,
  }
)

// AdminとAdminPermissionの多対多リレーション
Admin.belongsToMany(AdminPermission, {
  through: AdminAdminPermission,
  foreignKey: 'admin_id',
  otherKey: 'admin_permission_id',
  as: 'permissions',
})

AdminPermission.belongsToMany(Admin, {
  through: AdminAdminPermission,
  foreignKey: 'admin_permission_id',
  otherKey: 'admin_id',
  as: 'admins',
})

// EventCategoryモデル
export interface EventCategoryAttributes {
  id: number
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface EventCategoryCreationAttributes
  extends Optional<EventCategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class EventCategory
  extends Model<EventCategoryAttributes, EventCategoryCreationAttributes>
  implements EventCategoryAttributes
{
  declare id: number
  declare name: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EventCategory.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'event_categories',
    timestamps: true,
  }
)

// EventEventCategoryモデル（中間テーブル）
export interface EventEventCategoryAttributes {
  id: number
  event_id: number
  event_category_id: number
  createdAt?: Date
  updatedAt?: Date
}

export interface EventEventCategoryCreationAttributes
  extends Optional<
    EventEventCategoryAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

export class EventEventCategory
  extends Model<
    EventEventCategoryAttributes,
    EventEventCategoryCreationAttributes
  >
  implements EventEventCategoryAttributes
{
  declare id: number
  declare event_id: number
  declare event_category_id: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EventEventCategory.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    event_category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'event_categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'event_event_categories',
    timestamps: true,
  }
)

// EventとEventCategoryの多対多リレーション
Event.belongsToMany(EventCategory, {
  through: EventEventCategory,
  foreignKey: 'event_id',
  otherKey: 'event_category_id',
  as: 'categories',
})

Event.belongsTo(Form, {
  foreignKey: 'form_id',
  as: 'form',
})

Form.hasMany(Event, {
  foreignKey: 'form_id',
  as: 'events',
})

EventCategory.belongsToMany(Event, {
  through: EventEventCategory,
  foreignKey: 'event_category_id',
  otherKey: 'event_id',
  as: 'events',
})

// EventEventCategoryとEventCategoryの関連
EventEventCategory.belongsTo(EventCategory, {
  foreignKey: 'event_category_id',
  as: 'category',
})

// Userモデル
export interface UserAttributes {
  id: number
  email: string
  password: string
  name: string | null
  name_sei: string | null
  name_mei: string | null
  display_name: string | null
  age: number | null
  postal_code: string | null
  address: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'name'
    | 'name_sei'
    | 'name_mei'
    | 'display_name'
    | 'age'
    | 'postal_code'
    | 'address'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number
  declare email: string
  declare password: string
  declare name: string | null
  declare name_sei: string | null
  declare name_mei: string | null
  declare display_name: string | null
  declare age: number | null
  declare postal_code: string | null
  declare address: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_sei: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_mei: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
)

// EventReportモデル
export interface EventReportAttributes {
  id: number
  event_id: number
  admin_id: number
  title: string
  thumbnail: string | null
  body: string | null
  body_html: string | null
  comment_token: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface EventReportCreationAttributes
  extends Optional<
    EventReportAttributes,
    | 'id'
    | 'thumbnail'
    | 'body'
    | 'body_html'
    | 'comment_token'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class EventReport
  extends Model<EventReportAttributes, EventReportCreationAttributes>
  implements EventReportAttributes
{
  declare id: number
  declare event_id: number
  declare admin_id: number
  declare title: string
  declare thumbnail: string | null
  declare body: string | null
  declare body_html: string | null
  declare comment_token: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EventReport.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    admin_id: {
      type: DataTypes.BIGINT,
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
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Supabase StorageのURL',
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Editor.jsで作成した本文（JSON形式）',
    },
    body_html: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '本文のHTML表示用（SSR用）',
    },
    comment_token: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'コメントフォーム用のトークン',
    },
  },
  {
    sequelize,
    tableName: 'event_reports',
    timestamps: true,
  }
)

// FormAnswerとEventの関連
FormAnswer.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
})

Event.hasMany(FormAnswer, {
  foreignKey: 'event_id',
  as: 'formAnswers',
})

// FormAnswerとUserの関連
FormAnswer.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

User.hasMany(FormAnswer, {
  foreignKey: 'user_id',
  as: 'formAnswers',
})

Form.hasMany(FormAnswer, {
  foreignKey: 'form_id',
  as: 'answers',
})

FormAnswer.belongsTo(Form, {
  foreignKey: 'form_id',
  as: 'form',
})

// EventReportCommentモデル
export interface EventReportCommentAttributes {
  id: number
  event_id: number
  email: string
  name: string
  age: string | null
  sex: string | null
  area: string
  comment: string
  createdAt?: Date
  updatedAt?: Date
}

export interface EventReportCommentCreationAttributes
  extends Optional<
    EventReportCommentAttributes,
    'id' | 'age' | 'sex' | 'createdAt' | 'updatedAt'
  > {}

export class EventReportComment
  extends Model<
    EventReportCommentAttributes,
    EventReportCommentCreationAttributes
  >
  implements EventReportCommentAttributes
{
  declare id: number
  declare event_id: number
  declare email: string
  declare name: string
  declare age: string | null
  declare sex: string | null
  declare area: string
  declare comment: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EventReportComment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sex: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'event_report_comments',
    timestamps: true,
  }
)

// EventReportとEventの関連
EventReport.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
})

Event.hasMany(EventReport, {
  foreignKey: 'event_id',
  as: 'reports',
})

EventReport.belongsTo(Admin, {
  foreignKey: 'admin_id',
  as: 'admin',
})

Admin.hasMany(EventReport, {
  foreignKey: 'admin_id',
  as: 'eventReports',
})

// EventReportCommentとEventの関連
EventReportComment.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
})

Event.hasMany(EventReportComment, {
  foreignKey: 'event_id',
  as: 'comments',
})

// EmailSendLogモデル
export interface EmailSendLogAttributes {
  id: number
  form_id: number
  admin_id: number
  recipient_email: string
  subject: string
  html: string | null
  text: string | null
  status: 'success' | 'failed'
  error_message: string | null
  is_test: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface EmailSendLogCreationAttributes
  extends Optional<
    EmailSendLogAttributes,
    'id' | 'html' | 'text' | 'error_message' | 'createdAt' | 'updatedAt'
  > {}

export class EmailSendLog
  extends Model<EmailSendLogAttributes, EmailSendLogCreationAttributes>
  implements EmailSendLogAttributes
{
  declare id: number
  declare form_id: number
  declare admin_id: number
  declare recipient_email: string
  declare subject: string
  declare html: string | null
  declare text: string | null
  declare status: 'success' | 'failed'
  declare error_message: string | null
  declare is_test: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EmailSendLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    form_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'forms',
        key: 'id',
      },
    },
    admin_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
    recipient_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
      defaultValue: 'success',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_test: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'email_send_logs',
    timestamps: true,
  }
)

// EmailSendLogとFormの関連
EmailSendLog.belongsTo(Form, {
  foreignKey: 'form_id',
  as: 'form',
})

Form.hasMany(EmailSendLog, {
  foreignKey: 'form_id',
  as: 'emailSendLogs',
})

// EmailSendLogとAdminの関連
EmailSendLog.belongsTo(Admin, {
  foreignKey: 'admin_id',
  as: 'admin',
})

Admin.hasMany(EmailSendLog, {
  foreignKey: 'admin_id',
  as: 'emailSendLogs',
})

// EditorJsPromptMasterモデル
export interface EditorJsPromptMasterAttributes {
  id: number
  name: string
  prompt: string
  display_order: number
  createdAt?: Date
  updatedAt?: Date
}

export interface EditorJsPromptMasterCreationAttributes
  extends Optional<
    EditorJsPromptMasterAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

export class EditorJsPromptMaster
  extends Model<
    EditorJsPromptMasterAttributes,
    EditorJsPromptMasterCreationAttributes
  >
  implements EditorJsPromptMasterAttributes
{
  declare id: number
  declare name: string
  declare prompt: string
  declare display_order: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EditorJsPromptMaster.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'editorjs_prompts_master',
    timestamps: true,
  }
)

// EditorJsPromptCustomモデル
export interface EditorJsPromptCustomAttributes {
  id: number
  admin_id: number
  name: string
  prompt: string
  createdAt?: Date
  updatedAt?: Date
}

export interface EditorJsPromptCustomCreationAttributes
  extends Optional<
    EditorJsPromptCustomAttributes,
    'id' | 'createdAt' | 'updatedAt'
  > {}

export class EditorJsPromptCustom
  extends Model<
    EditorJsPromptCustomAttributes,
    EditorJsPromptCustomCreationAttributes
  >
  implements EditorJsPromptCustomAttributes
{
  declare id: number
  declare admin_id: number
  declare name: string
  declare prompt: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EditorJsPromptCustom.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.BIGINT,
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
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'editorjs_prompts_custom',
    timestamps: true,
  }
)

// EditorJsPromptCustomとAdminの関連
EditorJsPromptCustom.belongsTo(Admin, {
  foreignKey: 'admin_id',
  as: 'admin',
})

Admin.hasMany(EditorJsPromptCustom, {
  foreignKey: 'admin_id',
  as: 'editorJsPromptCustoms',
})

// すべてのモデルをエクスポート
export const models = {
  Member,
  Admin,
  Form,
  FormAnswer,
  Event,
  PickupEvent,
  AdminInvitation,
  AdminPermission,
  AdminAdminPermission,
  EventCategory,
  EventEventCategory,
  User,
  EventReport,
  EventReportComment,
  EmailSendLog,
  EditorJsPromptMaster,
  EditorJsPromptCustom,
}
