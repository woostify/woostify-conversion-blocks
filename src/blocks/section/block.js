import { registerBlockType } from '@wordpress/blocks';
import { columns as icon } from '@wordpress/icons';

import blockAttributes from './attributes';
import Edit from './edit';
import save from './save';

registerBlockType( 'wcb/section', {
	icon,
	keywords: [ 'columns', 'section', 'row', 'grid', 'container' ],
	attributes: blockAttributes,
	supports: {
		align: [ "wide", "full" ],
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
