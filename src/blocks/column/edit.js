import './editor.scss';

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
    InnerBlocks,
	ColorPalette,
	InspectorControls,
} from '@wordpress/block-editor';
import { select } from '@wordpress/data';

import { Fragment } from '@wordpress/element'

import { PanelBody } from '@wordpress/components';

import { getDeviceSuffix } from '../../utils/get-device-type';

function Edit( props ) {
    const blockProps = useBlockProps();

    const { clientId } = props;

    const { getBlockOrder, getBlockRootClientId, getBlockAttributes } = select('core/block-editor');

    const hasChildBlocks = getBlockOrder( clientId ).length > 0;

    const classnames = 'wcb-column-wrapper'

    return (
            <Fragment>
                <InnerBlocks 
                    templateLock={ false }
                    template={ [] }
                    renderAppender={ (
                        hasChildBlocks ?
                            undefined :
                            () => <InnerBlocks.ButtonBlockAppender />
                    ) }
                />
            </Fragment>
    )
}

export default Edit;
