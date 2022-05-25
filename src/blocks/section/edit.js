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

    const TEMPLATE = [
        [ 'wcb/column', {} ],
        [ 'wcb/column', {} ],
    ];

    return (
        <div { ...blockProps }>
            <InnerBlocks 
                template={ TEMPLATE }
            />
        </div>
    )
}

export default Edit;
