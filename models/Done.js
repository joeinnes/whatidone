var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Done Model
 * ==========
 */
var Done = new keystone.List('Done');

Done.add({
  text: { type: String, required: true, index: true, initial: true },
  doneType: { type: Types.Select, options: '1, 2, 3', default: '1', required: true, index: true, initial: true },
  createdOn: { type: Types.Datetime, default: Date.now, required: true },
  createdBy: { type: Types.Relationship, ref: 'User' },
  completedOn: { type: Types.Datetime }
});

/**
 * Relationships
 */
// User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });

/**
 * Registration
 */
Done.defaultColumns = 'text, creator, doneType';
Done.register();
