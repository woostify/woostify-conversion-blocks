import './editor.scss';

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
    InnerBlocks,
	ColorPalette,
	InspectorControls,
} from '@wordpress/block-editor';
import { select, dispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { PanelBody, RangeControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';

import WoostifyBaseControl from '../../components/controls/base';
import WoostifyDimensionsControl from '../../components/controls/dimensions';

import { getDeviceSuffix } from '../../utils/get-device-type';
import { convertToResponsiveStyle, getAllUniqueIds } from '../../utils/index';

function Edit( props ) {
    const minColWidth = 5;
    const blockProps = useBlockProps();
    const deviceSuffix = getDeviceSuffix();
    const { attributes, setAttributes, clientId } = props;
    
    const [ colWidth, setColWidth ] = useState( attributes.width || false );

    const { getBlockOrder, getBlocksByClientId, getBlockHierarchyRootClientId } = select('core/block-editor');

    const hasChildBlocks = getBlockOrder( clientId ).length > 0;

    useEffect( () => {
        // Generate a unique ID if none exists or if the same ID exists on this page.
		const allBlocks = select( 'core/block-editor' ).getBlocks();
		const uniqueIds = getAllUniqueIds( allBlocks, [], clientId );

		if ( ! attributes.uniqueId || uniqueIds.includes( attributes.uniqueId ) ) {
			setAttributes( { uniqueId: clientId.substr( 2, 9 ).replace( '-', '' ) } );
		}
    }, [] )

    useEffect( () => {

        if ( ! colWidth ) return;
        const parentBlockClientId = getBlockHierarchyRootClientId( clientId );
        const childBlocks = getBlocksByClientId(parentBlockClientId)[0]?.innerBlocks;
        let childBlocksLength = childBlocks.length;

        if ( childBlocksLength < 2 ) {
            return;
        }

        let currBlockPlusWidth,
        needUpdateBlockIndex,
        lastBlockIndex = childBlocksLength - 1,
        valueDiff = Number( colWidth ) - Number( attributes.width);

        childBlocks.forEach(function(child, index){
            if ( clientId === child.clientId) {
                if ( lastBlockIndex === index ) {
                    needUpdateBlockIndex = lastBlockIndex - 1;
                } else {
                    needUpdateBlockIndex = index + 1;
                }
            }
        });

        let available_width_for_update = Number( childBlocks[needUpdateBlockIndex]?.attributes.width ) - minColWidth;
        if ( valueDiff > available_width_for_update ) {
            valueDiff = available_width_for_update;
        }

        let needUpdateBlockWidth = Number( childBlocks[needUpdateBlockIndex]?.attributes.width ) - valueDiff;

        dispatch('core/block-editor').updateBlockAttributes(childBlocks[needUpdateBlockIndex]?.clientId, {width: needUpdateBlockWidth})
        
        let finalValue = Number( attributes.width ) + valueDiff;

        setAttributes({width: finalValue})
    }, [colWidth] )

    const onChangeColumnWidth = ( value, extra ) => {
        setColWidth( value )
    } 

    const classnames = 'wcb-column wcb-column-wrapper';

    const marginCSS = {
        top: attributes[ 'marginTop' + deviceSuffix ],
        right: attributes[ 'marginRight' + deviceSuffix ],
        bottom: attributes[ 'marginBottom' + deviceSuffix ],
        left: attributes[ 'marginLeft' + deviceSuffix ],
        unit: attributes['marginUnit' +deviceSuffix]
    }

    return (
        <div 
        id={`wcb-column-${clientId}`}
        className={classnames}
        >
            <InspectorControls>
                <PanelBody title={ __( 'General Settings', 'wcb' ) }>
                    <WoostifyBaseControl
                        label={ __( 'Width', 'wcb' ) }
                        responsive={ [ 'desktop', 'tablet', 'mobile' ] }
                        units={ [ '%' ] }
                        selectedUnit={'%'}
                    >
                        <NumberControl
                            value={ colWidth || attributes.width }
                            isShiftStepEnabled={true}
                            onChange={ ( newValue, extra ) => onChangeColumnWidth(newValue, extra) }
                            min={ 5 }
                            max={ 95 }
                        />
                    </WoostifyBaseControl>
                    <WoostifyBaseControl
                        label={ __( 'Spacing', 'wcb' ) }
                        responsive={ [ 'desktop', 'tablet', 'mobile' ] }
                        units={ [ 'px', 'em', 'rem' ] }
                        selectedUnit={
                            attributes[ 'marginUnit' + deviceSuffix ]
                        }
                        onUnitClick={ ( unit ) =>
                            setAttributes( {
                                [ 'marginUnit' + deviceSuffix ]: unit,
                            } )
                        }
                    >
                        <WoostifyDimensionsControl
                            { ...props }
                            type={ 'margin' }
                            attrTop={ 'marginTop' + deviceSuffix }
                            attrRight={ 'marginRight' + deviceSuffix }
                            attrBottom={ 'marginBottom' + deviceSuffix }
                            attrLeft={ 'marginLeft' + deviceSuffix }
                            labelTop={ __( 'Top', 'wcb' ) }
                            labelRight={ __( 'Right', 'wcbs' ) }
                            labelBottom={ __( 'Bottom', 'wcb' ) }
                            labelLeft={ __( 'Left', 'wcb' ) }
                        />
					</WoostifyBaseControl>
                </PanelBody>
            </InspectorControls>
            <style>
            {
                `
                #wcb-column-${clientId} {
                    margin-top: ${marginCSS.top + marginCSS.unit};
                    margin-right: ${marginCSS.right + marginCSS.unit};
                    margin-bottom: ${marginCSS.bottom + marginCSS.unit};
                    margin-left: ${marginCSS.left + marginCSS.unit};
                }
                .wcb-section-wrapper > div > .block-editor-block-list__layout > #block-${clientId} {
                    width: ${attributes.width}%;
                }
                `
            }
            </style>
            <InnerBlocks 
                templateLock={ false }
                template={ [] }
                renderAppender={ (
                    hasChildBlocks ?
                        undefined :
                        () => <InnerBlocks.ButtonBlockAppender />
                ) }
            />
        </div>
    )
}

export default Edit;
