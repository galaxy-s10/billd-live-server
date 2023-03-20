import Article from './article.model';
import ArticleTag from './articleTag.model';
import ArticleType from './articleType.model';
import Auth from './auth.model';
import Comment from './comment.model';
import EmailUser from './emailUser.model';
import GithubUser from './githubUser.model';
import Log from './log.model';
import QiniuData from './qiniuData.model';
import QqUser from './qqUser.model';
import Role from './role.model';
import RoleAuth from './roleAuth.model';
import Star from './star.model';
import Tag from './tag.model';
import ThirdUser from './thirdUser.model';
import Type from './type.model';
import User from './user.model';
import UserArticle from './userArticle.model';
import UserRole from './userRole.model';

import { chalkINFO } from '@/utils/chalkTip';

console.log(chalkINFO('加载了relation'));
/**
 * https://demopark.github.io/sequelize-docs-Zh-CN/core-concepts/assocs.html
 * A 称为 源 模型,而 B 称为 目标 模型.
 * A.hasOne(B) 关联意味着 A 和 B 之间存在一对一的关系,外键在目标模型(B)中定义.
 * A.belongsTo(B)关联意味着 A 和 B 之间存在一对一的关系,外键在源模型中定义(A).
 * A.hasMany(B) 关联意味着 A 和 B 之间存在一对多关系,外键在目标模型(B)中定义.
 * A.belongsToMany(B, { through: 'C' }) 关联意味着将表 C 用作联结表,在 A 和 B 之间存在多对多关系. 具有外键(例如,aId 和 bId). Sequelize 将自动创建此模型 C(除非已经存在),并在其上定义适当的外键.
 * Foo.belongsToMany(Bar, { through: 'foo_bar', sourceKey: 'name', targetKey: 'title' }); 这将创建带有字段 `fooName` 和 `barTitle` 的联结表 `foo_bar`.
 * A.belongsToMany(B) 包含一个额外的表(联结表),因此 sourceKey 和 targetKey 均可用,其中 sourceKey 对应于A(源)中的某个字段而 targetKey 对应于 B(目标)中的某个字段.
 * belongsToMany中，foreignKey 定义联结关系中源模型的 key,而 otherKey 定义目标模型中的 key
 */

/**
 * A 称为 源 模型,而 B 称为 目标 模型.
 * sourceKey:用作源表中关联键的字段的名称。默认为源表的主键
 * targetKey:要用作目标表中关联键的字段的名称。默认为目标表的主键
 * otherKey:联接表中外键的名称（表示目标模型）或表示另一列类型定义的对象的名称（有关语法，
 * 请参见“Sequelize.define”）。使用对象时，可以添加“name”属性来设置列的名称。默认为目标的名称+目标的主键
 * foreignKey:目标表中外键的名称，或表示外部列类型定义的对象的名称（有关语法，
 * 请参见'Sequelize.define'。使用对象时，可以添加“name”属性来设置列的名称。默认为源的名称+源的主键
 */

// Auth.belongsTo(Auth, {
//   foreignKey: 'id',
//   targetKey: 'p_id',
//   onDelete: 'CASCADE',
//   hooks: true,
//   constraints: false,
// });

// Auth.hasMany(Auth, {
//   foreignKey: 'p_id',
//   sourceKey: 'id',
//   as: 'auth_children',
//   onDelete: 'CASCADE',
//   hooks: true,
//   constraints: false,
// });

// User.hasMany(Star, {
//   foreignKey: 'to_user_id',
//   sourceKey: 'id',
//   constraints: false,
// });

User.belongsToMany(Article, {
  // sourceKey: 'id', // 默认为源表的主键
  // targetKey: 'id', // 默认为目标表的主键
  foreignKey: 'user_id', // 目标表中外键的名称
  otherKey: 'article_id', // 联接表中外键的名称
  constraints: false, // 不生成外键
  through: {
    model: UserArticle,
    unique: false, // 不生成唯一索引
  },
});

Article.belongsToMany(User, {
  foreignKey: 'article_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserArticle,
    unique: false, // 不生成唯一索引
  },
});

Article.belongsToMany(Type, {
  foreignKey: 'article_id',
  otherKey: 'type_id',
  constraints: false,
  through: {
    model: ArticleType,
    unique: false, // 不生成唯一索引
  },
});

Type.belongsToMany(Article, {
  foreignKey: 'type_id',
  otherKey: 'article_id',
  constraints: false,
  through: {
    model: ArticleType,
    unique: false, // 不生成唯一索引
  },
});

Article.belongsToMany(Tag, {
  foreignKey: 'article_id',
  otherKey: 'tag_id',
  constraints: false,
  through: {
    model: ArticleTag,
    unique: false, // 不生成唯一索引
  },
});

Tag.belongsToMany(Article, {
  foreignKey: 'tag_id',
  otherKey: 'article_id',
  constraints: false,
  through: {
    model: ArticleTag,
    unique: false, // 不生成唯一索引
  },
});

Comment.belongsTo(User, {
  as: 'from_user',
  foreignKey: 'from_user_id',
  constraints: false,
});
Comment.belongsTo(User, {
  as: 'to_user',
  foreignKey: 'to_user_id',
  constraints: false,
});

Article.hasMany(Comment, {
  foreignKey: 'article_id',
  constraints: false,
});

Comment.belongsTo(Article, {
  foreignKey: 'article_id',
  constraints: false,
});

Comment.hasMany(Star, {
  foreignKey: 'comment_id',
  constraints: false,
});
Comment.hasOne(Star, {
  foreignKey: 'comment_id',
  constraints: false,
  as: 'is_star',
});
Star.belongsTo(Comment, {
  foreignKey: 'comment_id',
  constraints: false,
  // as: 'all_star',
});
// Star.belongsTo(Comment, {
//   foreignKey: 'comment_id',
//   constraints: false,
//   as: 'is_star',
// });

Comment.hasMany(Comment, {
  as: 'children_comment',
  foreignKey: 'parent_comment_id',
  constraints: false,
});

// Comment.hasMany(Comment, {
//   // 为了分页时候的所有子评论数量，使用连接查询，但是这样太耗性能了，单独搞个字段维护吧
//   as: 'all_comment',
//   foreignKey: 'parent_comment_id',
//   constraints: false,
// });

Comment.belongsTo(Comment, {
  as: 'reply_comment',
  foreignKey: 'reply_comment_id',
  constraints: false,
});

Star.belongsTo(Article, {
  foreignKey: 'article_id',
  constraints: false,
});

Article.hasMany(Star, {
  foreignKey: 'article_id',
  constraints: false,
});

// Star.belongsTo(User, {
//   foreignKey: 'from_user_id',
//   constraints: false,
// });

Star.belongsTo(User, {
  as: 'from_user',
  foreignKey: 'from_user_id',
  constraints: false,
});
Star.belongsTo(User, {
  as: 'to_user',
  foreignKey: 'to_user_id',
  constraints: false,
});

User.belongsToMany(Role, {
  foreignKey: 'user_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: UserRole,
    unique: false, // 不生成唯一索引
  },
});

Role.belongsToMany(User, {
  foreignKey: 'role_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserRole,
    unique: false, // 不生成唯一索引
  },
});

Role.belongsToMany(Auth, {
  foreignKey: 'role_id',
  otherKey: 'auth_id',
  constraints: false,
  through: {
    model: RoleAuth,
    unique: false, // 不生成唯一索引
  },
});

Auth.belongsToMany(Role, {
  foreignKey: 'auth_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: RoleAuth,
    unique: false, // 不生成唯一索引
  },
});

Role.belongsTo(Role, {
  as: 'p_role',
  foreignKey: 'p_id',
  constraints: false,
});

Role.hasMany(Role, {
  as: 'c_role',
  foreignKey: 'p_id',
  constraints: false,
});

Auth.belongsTo(Auth, {
  as: 'p_auth',
  foreignKey: 'p_id',
  constraints: false,
});

Auth.hasMany(Auth, {
  as: 'c_auth',
  foreignKey: 'p_id',
  constraints: false,
});

User.hasMany(Log, {
  foreignKey: 'user_id',
  constraints: false,
});
Log.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

/**
 * 一对一的话，这样就可以根据根据邮件表查出来第三方用户表，第三方表里面再查出来用户，但是感觉比较臃肿。
 * 所以还是直接用多对多查询吧，虽然多对多查出来的是一个数组。
ThirdUser.belongsTo(User, {
  foreignKey: 'third_user_id',
  constraints: false,
});
ThirdUser.belongsTo(Email, {
  foreignKey: 'third_user_id',
  constraints: false,
});
Email.hasOne(ThirdUser, {
  foreignKey: 'third_user_id',
  constraints: false,
});
 */
EmailUser.belongsToMany(User, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});
User.belongsToMany(EmailUser, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});

GithubUser.belongsToMany(User, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});
User.belongsToMany(GithubUser, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});

ThirdUser.belongsTo(User, {
  foreignKey: 'third_user_id',
  constraints: false,
});
//   foreignKey: 'third_user_id',
//   constraints: false,
//   as: 'third_user1',
// });
QqUser.belongsToMany(User, {
  foreignKey: 'third_user_id',
  otherKey: 'user_id',
  sourceKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});
User.belongsToMany(QqUser, {
  foreignKey: 'user_id',
  otherKey: 'third_user_id',
  targetKey: 'id',
  constraints: false,
  through: {
    model: ThirdUser,
    unique: false, // 不生成唯一索引
  },
});

Star.belongsTo(User, {
  foreignKey: 'from_user_id',
  constraints: false,
});

// 发出的star
User.hasMany(Star, {
  foreignKey: 'from_user_id',
  constraints: false,
  as: 'send_stars',
});
// 收到的star
User.hasMany(Star, {
  foreignKey: 'to_user_id',
  constraints: false,
  as: 'receive_stars',
});

// 发出的评论
User.hasMany(Comment, {
  foreignKey: 'from_user_id',
  constraints: false,
  as: 'send_comments',
});
// 收到的评论
User.hasMany(Comment, {
  foreignKey: 'to_user_id',
  constraints: false,
  as: 'receive_comments',
});

Comment.belongsTo(User, {
  foreignKey: 'from_user_id',
  constraints: false,
});

Role.belongsToMany(User, {
  foreignKey: 'role_id',
  otherKey: 'user_id',
  constraints: false,
  through: {
    model: UserRole,
    unique: false, // 不生成唯一索引
  },
});
User.belongsToMany(Role, {
  foreignKey: 'user_id',
  otherKey: 'role_id',
  constraints: false,
  through: {
    model: UserRole,
    unique: false, // 不生成唯一索引
  },
});

// =================

QiniuData.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

// 流量统计
// DayData.belongsTo(VisitorLog, { foreignKey: 'today' });
// DayData.hasMany(VisitorLog, { foreignKey: 'today', sourceKey: 'createdAt' });
// VisitorLog.belongsTo(DayData, {
//   foreignKey: 'createdAt',
//   // targetKey: 'today',
// });
// Article有很多Comment,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article里
// DayData.hasMany(VisitorLog, { foreignKey: 'today', sourceKey: 'createdAt' });
// Comment属于Article,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article表里
// VisitorLog.belongsTo(DayData, {
//   foreignKey: 'createdAt',
//   sourceKey: 'today',
//   // targetKey: 'createdAt',
// });
// DayData.hasMany(VisitorLog, {
//   foreignKey: 'today1',
//   sourceKey: 'today',
//   // targetKey: 'createdAt',
//   constraints: false,
// });
