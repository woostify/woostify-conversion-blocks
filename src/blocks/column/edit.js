import './editor.scss';

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
    InnerBlocks,
	ColorPalette,
	InspectorControls,
} from '@wordpress/block-editor';
import { select, dispatch } from '@wordpress/data';
import { useEffect, useState, useRef, useCallback } from '@wordpress/element';
import { PanelBody, RangeControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';

import WoostifyBaseControl from '../../components/controls/base';
import WoostifyDimensionsControl from '../../components/controls/dimensions';

import { getDeviceSuffix } from '../../utils/get-device-type';
import { convertToResponsiveStyle, getAllUniqueIds } from '../../utils/index';

function Edit( props ) {
    const minColWidth = 5;
    const deviceSuffix = getDeviceSuffix();
    const { attributes, setAttributes, clientId, isSelected } = props;
    
    const [ colWidth, setColWidth ] = useState( attributes.width );

    const { getBlockOrder } = select('core/block-editor');

    const hasChildBlocks = getBlockOrder( clientId ).length > 0;

    useEffect( () => {
        // Generate a unique ID if none exists or if the same ID exists on this page.
		const allBlocks = select( 'core/block-editor' ).getBlocks();
		const uniqueIds = getAllUniqueIds( allBlocks, [], clientId );

		if ( ! attributes.uniqueId || uniqueIds.includes( attributes.uniqueId ) ) {
			setAttributes( { uniqueId: clientId.substr( 2, 9 ).replace( '-', '' ) } );
		}
    }, [] )

    if ( isSelected ) {
        if ( attributes.width !== colWidth ) {
            setColWidth( attributes.width );
        }
    }

    const onSetColumnWidth = useCallback( value => {
        const { getBlocksByClientId, getBlockRootClientId } = select('core/block-editor');
        const parentBlockClientId = getBlockRootClientId( clientId );
        const childBlocks = getBlocksByClientId(parentBlockClientId)[0]?.innerBlocks;
        let childBlocksLength = childBlocks.length;

        if ( childBlocksLength < 2 ) {
            return;
        }

        let needUpdateBlockIndex,
        needUpdateWidth,
        newCurrentBlockValue = parseFloat( value ),
        lastBlockIndex = childBlocksLength - 1,
        valueDiff = parseFloat( value ) - parseFloat( attributes.width );

        childBlocks.forEach(function(child, index){
            if ( clientId === child.clientId) {
                if ( lastBlockIndex === index ) {
                    needUpdateBlockIndex = lastBlockIndex - 1;
                } else {
                    needUpdateBlockIndex = index + 1;
                }
            }
        });

        let availableWidthForUpdate = parseFloat( childBlocks[needUpdateBlockIndex]?.attributes.width ) - minColWidth - valueDiff;
        if ( availableWidthForUpdate >= 0 ) {
            needUpdateWidth = minColWidth + availableWidthForUpdate;
        } else {
            needUpdateWidth = minColWidth;
            newCurrentBlockValue = parseFloat( value ) + availableWidthForUpdate;
        }
        
        dispatch('core/block-editor').updateBlockAttributes(childBlocks[needUpdateBlockIndex]?.clientId, {width: needUpdateWidth.toString() })
        setColWidth( newCurrentBlockValue );
        setAttributes({ width: newCurrentBlockValue.toString() })
    })
    
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
                            onChange={ ( value ) => onSetColumnWidth( value ) }
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
                renderAppender={ ((
                    hasChildBlocks ?
                        undefined :
                        () => <InnerBlocks.ButtonBlockAppender />
                )) }
            />
        </div>
    )
}

export default Edit;
