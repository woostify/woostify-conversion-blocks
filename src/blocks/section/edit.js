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
import { useState, useEffect } from 'react';
import { select, dispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { times } from 'lodash';
import { createBlock } from '@wordpress/blocks';

import { getDeviceSuffix } from '../../utils/get-device-type';
import { getAllUniqueIds } from '../../utils/index';

function Edit( props ) {
    const blockProps = useBlockProps();
    const { attributes, setAttributes, clientId } = props;

    const [ selectedSectionLayout, setSelectedSectionLayout ] = useState( false );

    const [ columns, setColumns ] = useState( attributes.columns || 2 );

    useEffect( () => {
        // Generate a unique ID if none exists or if the same ID exists on this page.
		const allBlocks = select( 'core/block-editor' ).getBlocks();
		const uniqueIds = getAllUniqueIds( allBlocks, [], clientId );

		if ( ! attributes.uniqueId || uniqueIds.includes( attributes.uniqueId ) ) {
			setAttributes( { uniqueId: clientId.substr( 2, 9 ).replace( '-', '' ) } );
		}
    }, [] )

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

    const getSectionLayouts = () => {
        const layouts = [
			'100',
			'50-50',
			'33.33-33.33-33.33',
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
                                    onClick={ () => {
                                        setSelectedSectionLayout( layout );
                                        const columnsData = getColumnsFromLayout( layout );
                                        setAttributes({columns: columnsData.length})
                                        setColumns( columnsData.length )
                                    } }
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
        <div { ...blockProps }>
            <InspectorControls>
				<PanelBody title={ __( 'General Settings', 'wcb' ) }>
                    <RangeControl
                        label={__('Columns', 'wcb')}
                        value={ columns }
                        onChange={ ( value ) => {
                            setColumns( value )
                            setAttributes({columns: value})
                        } }
                        min={ 1 }
                        max={ 6 }
                    />
                </PanelBody>
            </InspectorControls>
            { columns > 0 || selectedSectionLayout ? (
                <Fragment>
                    <InnerBlocks 
                        template={ times( parseInt(columns), () => [ 'wcb/column' ] ) }
                        allowedBlocks={ [ 'wcb/column' ] }
                        renderAppender={ false }
                    />
                </Fragment>
            ) : getSectionLayouts() }
        </div>
    )
}

export default Edit;
