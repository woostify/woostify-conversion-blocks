import { __ } from '@wordpress/i18n';
import { Fragment, Component } from '@wordpress/element';
import { SelectControl, RangeControl } from '@wordpress/components';

import WoostifyFontFamilyPicker from '../font-family-picker';
import WoostifyBaseControl from '../base';

import ResponsiveDisplay from '../../responsive-display';

import { useState, useEffect, useCallback } from 'react';

const WCBTypographyControl = ( props ) => {
	const [ selectedFontWeight, setSelectedFontWeight ] = useState( '' );
	const [ selectedTextTransform, setSelectedTextTransform ] = useState( '' );
	const [ selectedFontStyle, setSelectedFontStyle ] = useState( '' );

	const [ selectedLineHeight, setSelectedLineHeight ] = useState( '' );
	const [ selectedLineHeightTablet, setSelectedLineHeightTablet ] = useState(
		''
	);
	const [ selectedLineHeightMobile, setSelectedLineHeightMobile ] = useState(
		''
	);

	const [ selectedFontSize, setSelectedFontSize ] = useState( '' );
	const [ selectedFontSizeTablet, setSelectedFontSizeTablet ] = useState(
		''
	);
	const [ selectedFontSizeMobile, setSelectedFontSizeMobile ] = useState(
		''
	);

	const [ selectedLetterSpacing, setSelectedLetterSpacing ] = useState( '' );
	const [
		selectedLetterSpacingTablet,
		setSelectedLetterSpacingTablet,
	] = useState( '' );
	const [
		selectedLetterSpacingMobile,
		setSelectedLetterSpacingMobile,
	] = useState( '' );

	const fontWeightList = [
		{ label: '100', value: '100' },
		{ label: '200', value: '200' },
		{ label: '300', value: '300' },
		{ label: '400', value: '400' },
		{ label: '500', value: '500' },
		{ label: '600', value: '600' },
		{ label: '700', value: '700' },
		{ label: '800', value: '800' },
		{ label: '900', value: '900' },
		{ label: __( 'Default', 'wcb' ), value: '' },
		{ label: __( 'Normal', 'wcb' ), value: 'normal' },
		{ label: __( 'Bold', 'wcb' ), value: 'bold' },
	];

	const textTransformList = [
		{ label: __( 'Default', 'wcb' ), value: '' },
		{ label: __( 'Uppercase', 'wcb' ), value: 'uppercase' },
		{ label: __( 'Lowercase', 'wcb' ), value: 'lowercase' },
		{
			label: __( 'Capitalize', 'wcb' ),
			value: 'capitalize',
		},
		{ label: __( 'Normal', 'wcb' ), value: 'none' },
	];

	const { onChangeFontSize } = props;

	return (
		<Fragment>
			<WoostifyFontFamilyPicker
				selectedFont={ props.fontFamily }
				onChange={ props.onChangeFontFamily }
			/>
			<ResponsiveDisplay>
				<WoostifyBaseControl
					label={ __( 'Size', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
					units={ props.fontSizeUnits || [ 'px', 'em' ] }
					selectedUnit={ props.fontSizeUnit || 'px' }
					onUnitClick={ props.onChangeFontSizeUnit }
				>
					<RangeControl
						value={ props.fontSize }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedFontSize( val );
							props.onChangeFontSize( val );
						} }
						max={ 200 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay device="tablet">
				<WoostifyBaseControl
					label={ __( 'Size', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
					units={ props.fontSizeUnits || [ 'px', 'em' ] }
					selectedUnit={ props.fontSizeUnitTablet || 'px' }
					onUnitClick={ props.onChangeFontSizeUnitTablet }
				>
					<RangeControl
						value={ props.fontSizeTablet || '' }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedFontSizeTablet( val );
							props.onChangeFontSizeTablet( val );
						} }
						max={ 200 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay device="mobile">
				<WoostifyBaseControl
					label={ __( 'Size', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
					units={ props.fontSizeUnits || [ 'px', 'em' ] }
					selectedUnit={ props.fontSizeUnitMobile || 'px' }
					onUnitClick={ props.onChangeFontSizeUnitMobile }
				>
					<RangeControl
						value={ props.fontSizeMobile || '' }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedFontSizeMobile( val );
							props.onChangeFontSizeMobile( val );
						} }
						max={ 200 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<SelectControl
				value={ props.fontWeight || '' }
				label={ __( 'Weight', 'wcb' ) }
				options={ fontWeightList }
				onChange={ ( val ) => {
					setSelectedFontWeight( val );
					props.onChangeFontWeight( val );
				} }
			/>
			<SelectControl
				value={ props.textTransform || '' }
				label={ __( 'Transform', 'wcb' ) }
				options={ textTransformList }
				onChange={ ( val ) => {
					setSelectedTextTransform( val );
					props.onChangeTextTransform( val );
				} }
			/>
			<SelectControl
				value={ props.fontStyle || '' }
				label={ __( 'Style', 'wcb' ) }
				options={ [
					{ label: __( 'Default', 'wcb' ), value: '' },
					{
						label: __( 'Normal', 'wcb' ),
						value: 'normal',
					},
					{
						label: __( 'Italic', 'wcb' ),
						value: 'italic',
					},
					{
						label: __( 'Oblique', 'wcb' ),
						value: 'oblique',
					},
				] }
				onChange={ ( val ) => {
					setSelectedFontStyle( val );
					props.onChangeFontStyle( val );
				} }
			/>
			<ResponsiveDisplay>
				<WoostifyBaseControl
					label={ __( 'Line-Height', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
					units={ props.fontSizeUnits || [ 'px', 'em' ] }
					selectedUnit={ props.lineHeightUnit || 'px' }
					onUnitClick={ props.onChangeLineHeightUnit }
				>
					<RangeControl
						value={ props.lineHeight }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedLineHeight( val );
							props.onChangeLineHeight( val );
						} }
						max={ 200 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay device="tablet">
				<WoostifyBaseControl
					label={ __( 'Line-Height', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
					units={ props.fontSizeUnits || [ 'px', 'em' ] }
					selectedUnit={ props.lineHeightUnitTablet || 'px' }
					onUnitClick={ props.onChangeLineHeightUnitTablet }
				>
					<RangeControl
						value={ props.lineHeightTablet }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedLineHeightTablet( val );
							props.onChangeLineHeightTablet( val );
						} }
						max={ 200 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay device="mobile">
				<WoostifyBaseControl
					label={ __( 'Line-Height', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
					units={ props.fontSizeUnits || [ 'px', 'em' ] }
					selectedUnit={ props.lineHeightUnitMobile || 'px' }
					onUnitClick={ props.onChangeLineHeightUnitMobile }
				>
					<RangeControl
						value={ props.lineHeightMobile }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedLineHeightMobile( val );
							props.onChangeLineHeightMobile( val );
						} }
						max={ 200 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay>
				<WoostifyBaseControl
					label={ __( 'Letter Spacing', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
				>
					<RangeControl
						value={ props.letterSpacing }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedLetterSpacing( val );
							props.onChangeLetterSpacing( val );
						} }
						max={ 100 }
						step={ 0.1 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay device="tablet">
				<WoostifyBaseControl
					label={ __( 'Letter Spacing', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
				>
					<RangeControl
						value={ props.letterSpacingTablet }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedLetterSpacingTablet( val );
							props.onChangeLetterSpacingTablet( val );
						} }
						max={ 100 }
						step={ 0.1 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
			<ResponsiveDisplay device="mobile">
				<WoostifyBaseControl
					label={ __( 'Letter Spacing', 'wcb' ) }
					responsive={ [ 'desktop', 'tablet', 'mobile' ] }
				>
					<RangeControl
						value={ props.letterSpacingMobile }
						min={ 0 }
						onChange={ ( val ) => {
							setSelectedLetterSpacingMobile( val );
							props.onChangeLetterSpacingMobile( val );
						} }
						max={ 100 }
						step={ 0.1 }
						allowReset={ true }
					/>
				</WoostifyBaseControl>
			</ResponsiveDisplay>
		</Fragment>
	);
};

export default WCBTypographyControl;
