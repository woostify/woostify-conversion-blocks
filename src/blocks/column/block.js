import { registerBlockType } from '@wordpress/blocks';

import blockAttributes from './attributes';
import Edit from './edit';
import save from './save';

registerBlockType( 'wcb/column', {
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