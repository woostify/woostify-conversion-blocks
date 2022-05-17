import './editor.scss';

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { head } from 'lodash';

import { getDeviceSuffix } from '../../utils/get-device-type';
import { renderGlobalStyle } from '../../utils/global-style';

import WoostifyBaseControl from '../../components/controls/base';
import WoostifyDimensionsControl from '../../components/controls/dimensions';
import WCBTypographyHelperControl from '../../components/controls/typography-helper';

import './editor.scss';

function Edit( props ) {
	const deviceSuffix = getDeviceSuffix();

	const { attributes, setAttributes, clientId } = props;
	const { uniqueId } = attributes;

	const [ bgColor, setBgColor ] = useState( attributes.bg_color || '' );
	const [ textColor, setTextColor ] = useState( attributes.text_color || '' );

	useEffect( () => {
		setAttributes( {
			uniqueId: clientId.substr( 2, 9 ).replace( '-', '' ),
		} );

		if ( typeof localStorage !== 'undefined' ) {
			localStorage.setItem(
				'wcb_global_typography',
				JSON.stringify( head( wcb_params.global_typography ) )
			);
			localStorage.setItem(
				'wcb_global_colors',
				JSON.stringify( head( wcb_params.global_colors ) )
			);
			renderGlobalStyle( true );
		} else {
			renderGlobalStyle();
		}
	}, [] );

	let lineHeightCSS =
		attributes[ 'lineHeight' + deviceSuffix ] +
		attributes[ 'lineHeightUnit' + deviceSuffix ];
	let fontSizeCSS =
		attributes[ 'fontSize' + deviceSuffix ] +
		attributes[ 'fontSizeUnit' + deviceSuffix ];
	let letterSpacingCSS = attributes[ 'letterSpacing' + deviceSuffix ] + 'px';

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'General Settings', 'wcb' ) }>
					<WoostifyBaseControl
						label={ __( 'Background Color', 'wcb' ) }
					>
						<ColorPalette
							value={ bgColor }
							onChange={ ( val ) => {
								setBgColor( val );
								setAttributes( { bg_color: val } );
							} }
						/>
					</WoostifyBaseControl>
					<WoostifyBaseControl label={ __( 'Text Color', 'wcb' ) }>
						<ColorPalette
							value={ textColor }
							onChange={ ( val ) => {
								setTextColor( val );
								setAttributes( { text_color: val } );
							} }
						/>
					</WoostifyBaseControl>
					<WCBTypographyHelperControl
						{ ...props }
						label={ __( 'Typography', 'wcb' ) }
						popoverHeading={ __( 'Heading', 'wcb' ) }
					/>
					<WoostifyBaseControl
						label={ __( 'Padding', 'wcb' ) }
						responsive={ [ 'desktop', 'tablet', 'mobile' ] }
						units={ [ 'px', 'em', 'rem', '%' ] }
						selectedUnit={
							attributes[ 'paddingUnit' + deviceSuffix ]
						}
						onUnitClick={ ( unit ) =>
							setAttributes( {
								[ 'paddingUnit' + deviceSuffix ]: unit,
							} )
						}
					>
						<WoostifyDimensionsControl
							{ ...props }
							type={ 'padding' }
							attrTop={ 'paddingTop' + deviceSuffix }
							attrRight={ 'paddingRight' + deviceSuffix }
							attrBottom={ 'paddingBottom' + deviceSuffix }
							attrLeft={ 'paddingLeft' + deviceSuffix }
						/>
					</WoostifyBaseControl>
					<WoostifyBaseControl
						label={ __( 'Margin', 'wcb' ) }
						responsive={ [ 'desktop', 'tablet', 'mobile' ] }
						units={ [ 'px', 'rem' ] }
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
							labelTop={ __( 'T-Left', 'wcb' ) }
							labelRight={ __( 'T-Right', 'wcbs' ) }
							labelBottom={ __( 'B-Right', 'wcb' ) }
							labelLeft={ __( 'B-Left', 'wcb' ) }
							disableInputs={ [
								'marginLeft' + deviceSuffix,
								'marginRight' + deviceSuffix,
							] }
						/>
					</WoostifyBaseControl>
				</PanelBody>
			</InspectorControls>
			<div className="wcb-block-wrapper" id={ `wcb-${ uniqueId }` }>
				<style>
					{ `#wcb-${ uniqueId } .wcb-text {
							font-family: ${ attributes.fontFamily };
							font-weight: ${ attributes.fontWeight };
							text-transform: ${ attributes.fontTransform };
							font-style: ${ attributes.fontStyle };
							line-height: ${ lineHeightCSS };
							font-size: ${ fontSizeCSS };
							letter-spacing: ${ letterSpacingCSS };
							background-color: ${ bgColor };
							color: ${ attributes.text_color };
						}` }
				</style>
				<RichText
					tagName="h2"
					className="wcb-text"
					value={ attributes.message }
					onChange={ ( val ) => setAttributes( { message: val } ) }
				/>
			</div>
		</div>
	);
}

export default Edit;
