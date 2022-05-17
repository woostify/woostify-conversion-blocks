import { omit, compact, head, isPlainObject } from 'lodash';

import { registerStore, dispatch, select } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { loadPromise, models } from '@wordpress/api';

const DEFAULT_STATE = {
	defaultColors: [],
	wcbColors: [],
	isInitializing: true,
};

const STORE_ACTIONS = {
	updateSettings: ( payload = {} ) => ( {
		type: 'UPDATE_SETTINGS',
		payload: omit( payload, 'type' ),
	} ),
};

const STORE_SELECTORS = {
	getSettings: ( state ) => state,
};

const STORE_REDUCER = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'UPDATE_SETTINGS': {
			return {
				...state,
				...action.payload,
			};
		}
		default: {
			return state;
		}
	}
};

registerStore( 'wcb/global-colors', {
	reducer: STORE_REDUCER,
	actions: STORE_ACTIONS,
	selectors: STORE_SELECTORS,
} );

domReady( () => {
	loadPromise.then( () => {
		const settings = new models.Settings();

		settings.fetch().then( ( response ) => {
			const { wcb_global_colors: _wcbColors } = response;

			let wcbColors = head( _wcbColors ) || [];

			let wcbColorSlugs = wcbColors.map( ( color ) => color.slug );

			let colors;

			// Added compatibility from Global Settings Beta to Release Version.
			const _colors = compact(
				select( 'core/block-editor' ).getSettings().colors
			);
			if (
				( _colors || [] ).some(
					( color ) => color.fallback && color.colorVar
				)
			) {
				dispatch( 'core/block-editor' ).updateSettings( { colors } );
				wcbColors = colors.filter( ( { slug } ) =>
					slug.match( /^wcb-global-color/ )
				);
				wcbColorSlugs = wcbColors.map( ( color ) => color.slug );
			} else {
				colors = _colors || [];
			}
			const defaultColors = colors.filter(
				( { slug } ) => ! wcbColorSlugs.includes( slug )
			);

			dispatch( 'wcb/global-colors' ).updateSettings( {
				defaultColors,
				wcbColors,
				isInitializing: false,
			} );
		} );
	} );
} );
