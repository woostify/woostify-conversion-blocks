import './editor.scss';

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
    InnerBlocks,
	ColorPalette,
	InspectorControls,
} from '@wordpress/block-editor';

import { PanelBody } from '@wordpress/components';

import { getDeviceSuffix } from '../../utils/get-device-type';

function Edit( props ) {
    const blockProps = useBlockProps();

    return (
        <div { ...blockProps }>
            <InnerBlocks 
                renderAppender={ () => <InnerBlocks.ButtonBlockAppender /> }
            />
        </div>
    )
}

export default Edit;
