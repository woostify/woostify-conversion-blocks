import './editor.scss';

import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
    InnerBlocks,
	ColorPalette,
	InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    Placeholder,
    TextControl,
    Button
} from '@wordpress/components';
import { select, dispatch } from '@wordpress/data';
import { Fragment, useState, useEffect, useCallback } from '@wordpress/element';
import { times } from 'lodash';
import { getBlockFromExample } from '@wordpress/blocks';

import { getDeviceSuffix } from '../../utils/get-device-type';
import { getAllUniqueIds } from '../../utils/index';

function Edit( props ) {
    const blockProps = useBlockProps();
    const { attributes, setAttributes, clientId } = props;

    const [ selectedSectionLayout, setSelectedSectionLayout ] = useState( false );

    const [ columns, setColumns ] = useState( attributes.columns || false );

    const { getBlockOrder, getBlocksByClientId } = select('core/block-editor');
    const innerBlocks = getBlocksByClientId( clientId )[0]?.innerBlocks;
    const numInnerBlocks = getBlockOrder( clientId )?.length;

    useEffect( () => {
        // Generate a unique ID if none exists or if the same ID exists on this page.
		const allBlocks = select( 'core/block-editor' ).getBlocks();
		const uniqueIds = getAllUniqueIds( allBlocks, [], clientId );

		if ( ! attributes.uniqueId || uniqueIds.includes( attributes.uniqueId ) ) {
			setAttributes( { uniqueId: clientId.substr( 2, 9 ).replace( '-', '' ) } );
		}
    }, [] )

    useEffect( () => {
        if ( ! selectedSectionLayout || attributes.isSetColumnWidth ) {
            return;
        }
        const children = getBlocksByClientId(clientId)[0]?.innerBlocks;
        const columnsData = attributes.layout.split('-');
        children.forEach(function(child, index){
            dispatch('core/block-editor').updateBlockAttributes(child.clientId, {width: columnsData[index]})
        });

        setAttributes({isSetColumnWidth: true})

        return () => {
            setAttributes({isSetColumnWidth: false})
        }
    }, [selectedSectionLayout, attributes.isSetColumnWidth, attributes.layout] )

    const getColumnsFromLayout = ( layout ) => {
        const result = [];
		const columnsData = layout.split( '-' );

		let i = 0;
		columnsData.forEach( () => {
			const colAttrs = {
				sectionId: attributes.uniqueId,
			};

			colAttrs.width = Number( columnsData[ i ] );
			i++;

			result.push( colAttrs );
		} );

		return result;
    }

    const onSelectLayout = (layout) => {
        const columnsData = layout.split('-');
        setColumns( columnsData.length )
        setAttributes({columns: columnsData.length, layout: layout})
        setSelectedSectionLayout( layout );
    }

    const onSetColumns = useCallback( numColumns => {
        setColumns( numColumns )
        setAttributes({columns: numColumns})

        const { insertBlock, removeBlocks } = dispatch( 'core/block-editor' )

        // Remove the columns.
		if ( numColumns < numInnerBlocks ) {
			const columnClientIds = innerBlocks.slice( numColumns ).map( ( { clientId } ) => clientId )
            removeBlocks( columnClientIds, false )
		} else { // Add new blank columns.
            const numToAdd = numColumns - numInnerBlocks
			for ( let i = 0; i < numToAdd; i++ ) {
				const block = getBlockFromExample( 'wcb/column', {} )
				insertBlock( block, numInnerBlocks + i + 1, clientId, false )
			}
        }

        const blockWidth = Number.parseFloat( 100 / numColumns ).toFixed(2);
        const newInnerBlocks = getBlocksByClientId( clientId )[0]?.innerBlocks;
        newInnerBlocks.forEach(function(child, index){
            dispatch('core/block-editor').updateBlockAttributes(child.clientId, {width: blockWidth})
        });

    } )

    const getSectionLayouts = () => {
        const layouts = [
			'100',
			'50-50',
			'33-33-33',
			'25-25-25-25',

			'25-75',
			'75-25',
			'25-25-50',
			'25-50-25',

			'50-25-25',
			'20-60-20',
			'20-20-20-20-20',
			'16-16-16-16-16-16',
		];


        return (
            <Placeholder
            className='wcb-select-layout-preview-wrapper'
            label={__('Section', 'wcb')}
            instructions={__('Select one layout to get started.', 'wcb')}
            >
                <div className="wcb-section-layout-preview">
                    { layouts.map( ( layout ) => {
                        const columnsData = getColumnsFromLayout( layout );
                        return (
                                <button
                                    key={ `layout-${ layout }` }
                                    className="wcb-section-layout-preview-btn"
                                    onClick={ () => onSelectLayout(layout) }
                                >
                                    { columnsData.map( ( colAttrs, i ) => {
                                        return (
                                            <div
                                                key={ `wcb-layout-${ layout }-col-${ i }` }
                                                className={ classnames( 'wcb-col', `wcb-col-${ colAttrs.width }` ) }
                                            />
                                        );
                                    } ) }
                                </button>
                            );
                    } ) }
                </div>
            </Placeholder>
        )
    }

    return (
        <Fragment { ...blockProps }>
            <InspectorControls>
				<PanelBody title={ __( 'General Settings', 'wcb' ) }>
                    <RangeControl
                        label={__('Columns', 'wcb')}
                        value={ columns || attributes.columns }
                        onChange={ ( value ) => onSetColumns( value )}
                        min={ 1 }
                        max={ 6 }
                    />
                </PanelBody>
            </InspectorControls>
            <div className={'wcb-section-wrapper'}>
                { parseInt( columns ) > 0 || selectedSectionLayout ? (
                        <InnerBlocks 
                            template={ times( parseInt( columns ), () => [ 'wcb/column' ] ) }
                            allowedBlocks={ [ 'wcb/column' ] }
                            orientation="horizontal"
                            renderAppender={ false }
                        />
                ) : getSectionLayouts() }
            </div>
        </Fragment>
    )
}

export default Edit;
