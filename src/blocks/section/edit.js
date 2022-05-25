import './editor.scss';

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
    InnerBlocks,
	ColorPalette,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { times } from 'lodash';

import { getDeviceSuffix } from '../../utils/get-device-type';

function Edit( props ) {
    const blockProps = useBlockProps();

    const [ columns, setColumns ] = useState( 2 );

    return (
        <div { ...blockProps }>
            <InspectorControls>
				<PanelBody title={ __( 'General Settings', 'wcb' ) }>
                    <RangeControl
                        label={__('Columns', 'wcb')}
                        value={ columns }
                        onChange={ ( value ) => setColumns( value ) }
                        min={ 1 }
                        max={ 6 }
                    />
                </PanelBody>
            </InspectorControls>
            <div className={'wcb-section-wrapper'}>
                <InnerBlocks 
                    template={ times( parseInt(columns), () => [ 'wcb/column' ] ) }
                    allowedBlocks={ [ 'wcb/column' ] }
                    templateLock={ 'all' }
                    orientation="horizontal"
                    renderAppender={ false }
                />
            </div>
        </div>
    )
}

export default Edit;
