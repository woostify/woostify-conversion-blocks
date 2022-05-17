import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { PanelBody } from '@wordpress/components';
import { loadPromise, models } from '@wordpress/api';
import { useEffect, useState } from '@wordpress/element';
import { head } from 'lodash';

import WCBTypoPicker from './typo/picker';
import WCBGlobalColors from './colors';

import { renderGlobalStyle } from '../../utils';

const sidebarName = 'woostify-block-sidebar';
const sidebarTitle = __( 'Woostify Block Settings', 'wcb' );
const sidebarIcon = 'smiley';

let saveSettingsTime = null;

const WoostifyBlockSidebarContent = ( props ) => {
	const [ typoSettings, setTypoSettings ] = useState( [] );

	const TYPO_LIST = [
		{ label: 'Heading 1', tag: 'h1' },
		{ label: 'Heading 2', tag: 'h2' },
		{ label: 'Heading 3', tag: 'h3' },
		{ label: 'Heading 4', tag: 'h4' },
		{ label: 'Heading 5', tag: 'h5' },
		{ label: 'Heading 6', tag: 'h6' },
	];
	useEffect( () => {
		// Get settings.
		loadPromise.then( () => {
			const settings = new models.Settings();
			settings.fetch().then( ( response ) => {
				setTypoSettings( head( response.wcb_global_typography ) || {} );
			} );
		} );
	}, [] );

	const handleOnChangeValue = ( selector, styles ) => {
		Object.keys( styles ).forEach( ( key ) => {
			if ( styles[ key ] === '' ) {
				delete styles[ key ];
			}
		} );

		const newSettings = {
			...typoSettings,
			[ selector ]: styles,
		};
		setTypoSettings( newSettings );

		if ( typeof localStorage !== 'undefined' ) {
			localStorage.setItem(
				'wcb_global_typography',
				JSON.stringify( newSettings )
			);
			renderGlobalStyle( true );
		}

		clearTimeout( saveSettingsTime );
		saveSettingsTime = setTimeout( () => {
			const model = new models.Settings( {
				wcb_global_typography: [ newSettings ], // eslint-disable-line
			} );
			model.save();

			if ( typeof localStorage === 'undefined' ) {
				setTimeout( () => {
					renderGlobalStyle();
				}, 300 );
			}
		}, 500 );
	};

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Global Color Palette', 'wcb' ) }
				initialOpen={ true }
			>
				<WCBGlobalColors />
			</PanelBody>
			<PanelBody
				title={ __( 'Global Typography', 'wcb' ) }
				initialOpen={ false }
			>
				{ TYPO_LIST.map( ( { label, tag }, index ) => {
					return (
						<WCBTypoPicker
							label={ label }
							key={ index }
							selector={ tag }
							value={ typoSettings[ tag ] || {} }
							onChange={ ( value ) =>
								handleOnChangeValue( tag, value )
							}
						/>
					);
				} ) }
			</PanelBody>
		</Fragment>
	);
};

const WoostifyBlockPluginSidebar = () => {
	return (
		<Fragment>
			<PluginSidebarMoreMenuItem
				target={ sidebarName }
				icon={ sidebarIcon }
			>
				{ sidebarTitle }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name={ sidebarName }
				title={ sidebarTitle }
				icon={ sidebarIcon }
			>
				<div className="woostify-block-sidebar-content">
					<WoostifyBlockSidebarContent />
				</div>
			</PluginSidebar>
		</Fragment>
	);
};

registerPlugin( sidebarName, {
	render: WoostifyBlockPluginSidebar,
} );
