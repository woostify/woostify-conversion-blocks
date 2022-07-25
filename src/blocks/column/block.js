import { registerBlockType } from '@wordpress/blocks';
import { column as icon } from '@wordpress/icons';

import blockAttributes from './attributes';
import Edit from './edit';
import save from './save';

registerBlockType( 'wcb/column', {
  title: 'Column',
	icon,
	attributes: blockAttributes,
	parent: [ 'wcb/section' ],
	supports: {
		inserter: false,
		reusable: false,
		html: false,
	},

	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
} );
