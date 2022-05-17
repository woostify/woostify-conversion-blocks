import { isEqual } from 'lodash';

import { dispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

const WCBGlobalColorPaletteUpdater = () => {
	const { wcbColors, defaultColors, isInitializing, colors } = useSelect(
		( select ) => ( {
			wcbColors: select( 'wcb/global-colors' ).getSettings().wcbColors,
			defaultColors: select( 'wcb/global-colors' ).getSettings()
				.defaultColors,
			isInitializing: select( 'wcb/global-colors' ).getSettings()
				.isInitializing,
			colors: select( 'core/block-editor' ).getSettings().colors,
		} ),
		[]
	);

	useEffect( () => {
		if ( isInitializing ) {
			return;
		}

		const newColors = [ ...defaultColors, ...wcbColors ];

		// When the colors change, update the color picker.
		if ( ! isEqual( colors, newColors ) ) {
			dispatch( 'core/block-editor' ).updateSettings( {
				colors: newColors,

				/**
				 * withColorContext now gets the colors from features object.
				 *
				 * @since v2.7.2
				 */
				__experimentalFeatures: {
					colors: { palette: { theme: [ ...newColors ] } },
				},
			} );
		}
	}, [
		JSON.stringify( colors ),
		JSON.stringify( defaultColors ),
		JSON.stringify( wcbColors ),
		isInitializing,
	] );

	return null;
};

registerPlugin( 'wcb-update-global-color-palette', {
	render: WCBGlobalColorPaletteUpdater,
} );
