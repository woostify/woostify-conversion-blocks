import './color-palette-updater';
import './store';

import './editor.scss';

import classnames from 'classnames';
import { Fragment, useState } from '@wordpress/element';
import { select, dispatch, useSelect } from '@wordpress/data';
import {
	ColorPicker,
	Popover,
	BaseControl,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { cloneDeep, isPlainObject } from 'lodash';

import { wcbCreateColor, wcbGetRgb, renderGlobalStyle } from '../../../utils';

import { models } from '@wordpress/api';

import WoostifyBaseControl from '../../../components/controls/base';

const WCBColorOption = ( props ) => {
	const { color, name } = props;

	if ( props.locked ) {
		return (
			<div className="components-circular-option-picker__option-wrapper wcb-global-settings__color-picker-disabled-color">
				<div
					className="components-circular-option-picker__option"
					style={ { backgroundColor: color, color } }
				></div>
			</div>
		);
	}

	return (
		<Fragment>
			<div className="components-circular-option-picker__option-wrapper">
				<Button
					className="components-circular-option-picker__option"
					label={ name }
					style={ { backgroundColor: color, color } }
					onClick={ () => props.onClick( color ) }
					onMouseDown={ ( event ) => event.preventDefault() } // Prevents the onFocusOutside from triggering when clicking the button.
				/>
				{ props.children }
			</div>
		</Fragment>
	);
};

WCBColorOption.defaultProps = {
	color: '#f5f5f5',
	name: __( 'Untitled', 'wcb' ),
	locked: false,
	onClick: () => {},
};

const WCBAddColorButton = ( props ) => (
	<Button
		{ ...props }
		isSecondary
		className="wcb-global-settings-color-picker__add-icon"
		label={ __( 'Add New Color', 'wcb' ) }
		icon={ 'plus-alt2' }
	/>
);

let saveTimeout = null;

const WCBGlobalColors = ( props ) => {
	const [ selectedIndex, setSelectedIndex ] = useState( null );

	const _colors =
		useSelect(
			( select ) => select( 'core/block-editor' ).getSettings().colors
		) || [];
	const colors = Array.isArray( _colors ) ? _colors : [];

	/**
	 * Function used to update the colors in @wordpress/data,
	 *
	 * @param {Array} newColors colors passed.
	 */
	const handleUpdateColors = ( newColors ) => {
		const updatedColors = newColors.filter( ( color ) =>
			color.slug.match( /^wcb-global-color/ )
		);

		if ( typeof localStorage !== 'undefined' ) {
			localStorage.setItem(
				'wcb_global_colors',
				JSON.stringify( updatedColors )
			);
			renderGlobalStyle( true );
		}

		// Save settings.
		clearTimeout( saveTimeout );
		saveTimeout = setTimeout( () => {
			const settings = new models.Settings( {
				wcb_global_colors: [ updatedColors ],
			} );
			settings.save();

			if ( typeof localStorage === 'undefined' ) {
				setTimeout( () => {
					renderGlobalStyle();
				}, 300 );
			}
		}, 300 );

		// Update our store.
		dispatch( 'wcb/global-colors' ).updateSettings( {
			wcbColors: updatedColors,
		} );
	};

	// Called when adding a new color.
	const handleOnAddColor = () => {
		const newIndex =
			colors && Array.isArray( colors ) ? colors.length + 1 : 1;
		const slugId =
			Math.floor( Math.random() * new Date().getTime() ) % 100000;
		const color = wcbCreateColor();

		const updatedColors = [
			...select( 'core/block-editor' ).getSettings().colors,
			{
				name: sprintf( __( 'Custom Color %s', 'wcb' ), newIndex ),
				slug: `wcb-global-color-${ slugId }`,
				color,
				rgb: wcbGetRgb( color ),
			},
		];

		// Update the colors.
		handleUpdateColors( updatedColors );

		setSelectedIndex( newIndex - 1 );
	};

	const handleOnChangeColorName = ( value ) => {
		const updatedColors = cloneDeep( colors );

		// Overwrite the selected style name and slug to a new style name and slug.
		updatedColors[ selectedIndex ].name = value;

		// Update the colors.
		handleUpdateColors( updatedColors );
	};

	const handleOnChangeColor = ( value ) => {
		const updatedColors = cloneDeep( colors );

		// Overwrite the selected color to a new color.
		updatedColors[ selectedIndex ].color = value.hex;
		updatedColors[ selectedIndex ].rgb = wcbGetRgb( value.hex );

		// Update the colors.
		handleUpdateColors( updatedColors );
	};

	const handleOnDeleteColor = () => {
		const updatedColors = cloneDeep( colors );

		// Delete the specific color based on the selected index.
		updatedColors.splice( selectedIndex, 1 );

		// Update the colors.
		handleUpdateColors( updatedColors );
		setSelectedIndex( null );
	};

	const classNames = classnames(
		'wcb-global-settings-color-picker',
		'components-circular-option-picker',
		'editor-color-palette-control__color-palette',
		props.className
	);

	return (
		<Fragment>
			<WoostifyBaseControl
				className={ classNames }
				label={ __( 'Default Colors', 'wcb' ) }
			>
				{ colors.map( ( color, index ) => {
					if ( ! isPlainObject( color ) ) {
						return null;
					}

					if ( ( color.slug || '' ).startsWith( 'wcb-' ) ) {
						return;
					}

					return (
						<WCBColorOption
							key={ index }
							color={ color.color }
							name={ color.name }
							locked={
								! ( color.slug || '' ).startsWith( 'wcb-' )
							}
							onClick={ () =>
								setSelectedIndex(
									selectedIndex !== index ? index : null
								)
							}
						/>
					);
				} ) }
			</WoostifyBaseControl>
			<WoostifyBaseControl
				className={ classNames }
				label={ __( 'WCB Custom Colors', 'wcb' ) }
			>
				{ colors.map( ( color, index ) => {
					if ( ! isPlainObject( color ) ) {
						return null;
					}

					if ( ! ( color.slug || '' ).startsWith( 'wcb-' ) ) {
						return;
					}

					return (
						<WCBColorOption
							key={ index }
							color={ color.color }
							name={ color.name }
							locked={
								! ( color.slug || '' ).startsWith( 'wcb-' )
							}
							onClick={ () =>
								setSelectedIndex(
									selectedIndex !== index ? index : null
								)
							}
						>
							{ selectedIndex === index && (
								<Popover
									className="components-dropdown__content"
									onFocusOutside={ () =>
										setSelectedIndex( null )
									}
								>
									<ColorPicker
										color={ color.color }
										onChangeComplete={ handleOnChangeColor }
										disableAlpha
									/>
									<BaseControl
										id="wcb-color-picker-text-name"
										className="components-color-picker__input-field"
										label={ __( 'Color Name', 'wcb' ) }
									>
										<input
											className="components-text-control__input"
											id="wcb-color-picker-text-name"
											onChange={ ( event ) =>
												handleOnChangeColorName(
													event.target.value
												)
											}
											value={ color.name || '' }
										/>
									</BaseControl>
									<Button
										className="wcb-global-settings-color-picker__remove"
										onClick={ handleOnDeleteColor }
										icon={ 'trash' }
									>
										Delete
									</Button>
								</Popover>
							) }
						</WCBColorOption>
					);
				} ) }
				<WCBAddColorButton onClick={ handleOnAddColor } />
			</WoostifyBaseControl>
		</Fragment>
	);
};

export default WCBGlobalColors;
