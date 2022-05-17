import { getDocumentBody, JSToCSS, isEditingPost } from '.';

import { head } from 'lodash';
import { loadPromise, models } from '@wordpress/api';

export const convertToResponsiveStyle = ( body, issetLocalStorage = false ) => {
	const _convertToResponsiveStyle = ( typoSettings, colorsSettings ) => {
		if ( typoSettings && colorsSettings ) {
			let currentCss = '';
			let css = [];
			let coreCss = [];

			const typography = typoSettings;
			const colors = colorsSettings;

			// GENERATE COLORS.
			for ( let i = 0; i < colors.length; i++ ) {
				let color = colors[ i ];
				let colorName = color[ 'slug' ].toLowerCase();
				// Convert the name to kebab casing.
				let colorTypographyName =
					'body .has-' +
					colorName.split( ' ' ).join( '-' ) +
					'-color';
				let colorBackgroundName =
					'body .has-' +
					colorName.split( ' ' ).join( '-' ) +
					'-background-color';

				// Only do this for our global colors.
				if ( color[ 'color' ] && color[ 'slug' ] ) {
					// Add the custom css property.
					css.push(
						'--' + color[ 'slug' ] + ': ' + color[ 'color' ] + ';'
					);
					css.push(
						'--' +
							color[ 'slug' ] +
							'-rgba: ' +
							color[ 'rgb' ] +
							';'
					);

					// Add custom css class rule for other blocks.
					// For typography colors.
					coreCss.push(
						colorTypographyName +
							' { color: ' +
							color[ 'color' ] +
							' !important; }'
					);

					// For background colors.
					coreCss.push(
						colorBackgroundName +
							' { background-color: ' +
							color[ 'color' ] +
							' !important; }'
					);
				}
			}

			if ( 0 < css.length ) {
				let generatedColorCss = '/* Global colors */\n';
				generatedColorCss += ':root {' + css.join( ' ' ) + '}';
				currentCss += generatedColorCss;
			}

			if ( 0 < coreCss.length ) {
				currentCss += coreCss.join( ' ' );
			}

			let typoCSS = [];
			let typoCSSTablet = [];
			let typoCSSMobile = [];
			let typoCSSPrefix = '.edit-post-visual-editor .wcb-block-wrapper ';
			// GENERATE TYPOGRAPHY.
			for ( const selector in typography ) {
				const attrs = typography[ selector ];
				const typoCSSSelector =
					typoCSSPrefix +
					selector +
					', .editor-styles-wrapper .wcb-block-wrapper ' +
					selector +
					' {';
				let typoAttrs = [];
				let typoAttrsTablet = [];
				let typoAttrsMobile = [];
				for ( const attrName in attrs ) {
					if (
						! attrName.includes( 'Tablet' ) &&
						! attrName.includes( 'Mobile' )
					) {
						typoAttrs[ attrName ] = attrs[ attrName ];
					}
					if ( attrName.includes( 'Tablet' ) ) {
						typoAttrsTablet[ attrName ] = attrs[ attrName ];
					}
					if ( attrName.includes( 'Mobile' ) ) {
						typoAttrsMobile[ attrName ] = attrs[ attrName ];
					}
				}
				typoCSS.push(
					typoCSSSelector + JSToCSS( typoAttrs, attrs ) + '}'
				);
				typoCSSTablet.push(
					typoCSSSelector + JSToCSS( typoAttrsTablet, attrs ) + '}'
				);
				typoCSSMobile.push(
					typoCSSSelector + JSToCSS( typoAttrsMobile, attrs ) + '}'
				);
			}

			currentCss += '\n/* Global Typography */\n';
			if ( 0 < typoCSS.length ) {
				currentCss += typoCSS.join( ' ' );
			}
			if ( 0 < typoCSSTablet.length ) {
				currentCss +=
					'\n@media(max-width:' +
					wcb_params.breakpoints[ 'tablet' ] +
					'px) {';
				currentCss += typoCSSTablet.join( ' ' );
				currentCss += '}';
			}
			if ( 0 < typoCSSMobile.length ) {
				currentCss +=
					'\n@media(max-width:' +
					wcb_params.breakpoints[ 'mobile' ] +
					'px) {';
				currentCss += typoCSSMobile.join( ' ' );
				currentCss += '}';
			}

			removeOldStyleTag( body );

			const style = document.createElement( 'style' );
			style.classList.add( 'wcb-global-style' );
			style.textContent = currentCss;

			body.appendChild( style );
		}
	};

	if ( ! issetLocalStorage ) {
		loadPromise.then( () => {
			const settings = new models.Settings();
			settings.fetch().then( ( response ) => {
				const typography = head( response.wcb_global_typography );
				const colors = head( response.wcb_global_colors );
				_convertToResponsiveStyle( typography, colors );
			} );
		} );
	} else {
		const typography = JSON.parse(
			localStorage.getItem( 'wcb_global_typography' )
		);
		const colors = JSON.parse(
			localStorage.getItem( 'wcb_global_colors' )
		);
		_convertToResponsiveStyle( typography, colors );
	}
};

export const renderGlobalStyle = ( issetLocalStorage = false ) => {
	setTimeout( () => {
		const _renderGlobalStyle = ( body, issetLocalStorage = false ) => {
			if ( body ) {
				convertToResponsiveStyle( body, issetLocalStorage );
			}
		};
		const bodyElement = getDocumentBody();
		_renderGlobalStyle( bodyElement, issetLocalStorage );
		if ( bodyElement !== document.querySelector( 'body' ) ) {
			_renderGlobalStyle(
				document.querySelector( 'body' ),
				issetLocalStorage
			);
		}
	}, 50 );
};

export const createStyleTagWithGlobalStyleContent = () => {
	const style = document.createElement( 'style' );
	style.classList.add( 'wcb-global-style' );
	style.textContent = convertToResponsiveStyle();

	return style;
};

export const removeOldStyleTag = (
	body = document.querySelector( 'body' )
) => {
	if ( ! isStyleTagAdded( body ) ) {
		return;
	}

	const oldTag = body.querySelector( '.wcb-global-style' );
	oldTag.remove();
};

export const isStyleTagAdded = ( body = document.querySelector( 'body' ) ) => {
	return body.querySelector( '.wcb-global-style' );
};
