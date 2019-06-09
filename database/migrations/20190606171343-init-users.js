'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const { DATE, STRING, TINYINT, INTEGER } = Sequelize
    await queryInterface.createTable('user_name', {
      user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: 'userandname',
      },
      name: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: 'userandname'
      }
    })
    await queryInterface.createTable('user_account_info', {
      user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      password: {
        type: STRING(20),
      },
      secure_q: {
        type: STRING(40),
      },
      secure_a: {
        type: STRING(40),
      },
      id_card: {
        type: STRING(20),
        unique: true,
      },
      permission: {
        type: TINYINT(1),
      },
      created_at: DATE,
      updated_at: DATE,
    })

    await queryInterface.createTable('user_const_info', {
      user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      gender: {
        type: TINYINT(1),
      },
      country: {
        type: INTEGER,
      },
      birthday: {
        type: DATE,
      },
      deathday: {
        type: DATE,
      },
    })

    await queryInterface.createTable('user_optional_info', {
      user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        unique: true,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      home_location: {
        type: STRING(40),
      },
      work: {
        type: STRING(40),
      },
      work_location: {
        type: STRING(40),
      },
      tele: {
        type: STRING(40),
      },
      qq: {
        type: STRING(40),
      },
      email: {
        type: STRING(40),
      },
      interest: {
        type: STRING(40),
      },
      avatar: {
        type: STRING(40),
      },
    })
    await queryInterface.createTable('family_tree', {
      node_id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      parent_node_id: {
        type: INTEGER,
      },
      lft: {
        type: INTEGER,
      },
      rgt: {
        type: INTEGER,
      },
    })
    await queryInterface.createTable('user_node', {
      user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      node_id: {
        type: INTEGER,
        references: {
          model: 'family_tree',
          key: 'node_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }
    })
    await queryInterface.createTable('delete_event', {
      event_id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      passive_user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      subject_user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    })
    await queryInterface.createTable('insert_event', {
      event_id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      passive_user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      subject_user_id: {
        type: STRING(20),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      relation: {
        type: INTEGER,
      }
    })
    await queryInterface.createTable('poster', {
      poster_id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: STRING(20),
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      poster_title: {
        type: STRING(40),
      },
      poster_content: {
        type: STRING(120),
      }
    })
    await queryInterface.createTable('bbs_essay', {
      essay_id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: STRING(20),
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      essay_content: {
        type: STRING(120),
      }
    })
    await queryInterface.createTable('bbs_essay_comments', {
      comment_id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      attached_essay_id: {
        type: INTEGER,
        references: {
          model: 'bbs_essay',
          key: 'essay_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      user_id: {
        type: STRING(20),
        references: {
          model: 'user_name',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      comment_content: {
        type: STRING(120),
      }
    })
  },

  down: async queryInterface => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.dropTable('user_account_info')
    await queryInterface.dropTable('user_const_info')
    await queryInterface.dropTable('user_optional_info')
    await queryInterface.dropTable('user_node')
    await queryInterface.dropTable('family_tree')
    await queryInterface.dropTable('insert_event')
    await queryInterface.dropTable('delete_event')
    await queryInterface.dropTable('poster')
    await queryInterface.dropTable('bbs_essay_comments')
    await queryInterface.dropTable('bbs_essay')
    await queryInterface.dropTable('user_name')
  },
}
