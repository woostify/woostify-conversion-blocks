import './style.scss';

import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
export default function save( { attributes } ) {
	const blockProps = useBlockProps.save();
	return (
		<div
			{ ...blockProps }
			id={ `wcb-${ attributes.uniqueId }` }
		>
			<div className='wcb-column-wrapper'><InnerBlocks.Content /></div>
		</div>
	);
}
