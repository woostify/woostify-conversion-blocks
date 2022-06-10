import { registerBlockType } from '@wordpress/blocks';

import blockAttributes from './attributes';
import Edit from './edit';
import save from './save';

registerBlockType( 'wcb/section', {
	keywords: [ 'columns', 'section', 'row' ],
	attributes: blockAttributes,
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
} );
