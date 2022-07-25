import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import attributes from './attributes';
import save from './save';
import edit from './edit';

registerBlockType(metadata as BlockConfiguration, {
  attributes,
  edit,
  save
});
