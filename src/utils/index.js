export * from './font';
export * from './color';
export * from './global-style';

export const getAllUniqueIds = ( allBlocks, data, currentClientId ) => {
	Object.keys( allBlocks ).forEach( ( key ) => {
		const clientId = 'undefined' !== typeof allBlocks[ key ].clientId ? allBlocks[ key ].clientId : '';
		const blockName = 'undefined' !== typeof allBlocks[ key ].name ? allBlocks[ key ].name : '';

		if ( clientId !== currentClientId && blockName.includes( 'generateblocks' ) ) {
			data.push( allBlocks[ key ].attributes.uniqueId );
		}

		if ( 'undefined' !== typeof allBlocks[ key ].innerBlocks && allBlocks[ key ].innerBlocks.length > 0 ) {
			getAllUniqueIds( allBlocks[ key ].innerBlocks, data, currentClientId );
		}
	} );

	return data;
}


/**
 * Capitalize the first letter in string
 * @param {*} string
 * @returns
 */
export const capitalizeFirstLetter = ( string ) => {
	return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
};

export const getDocumentHead = () => {
	let head = document.querySelector( 'head' );

	if ( isEditingContent() ) {
		head = document
			.querySelector( 'iframe[name="editor-canvas"]' )
			.contentWindow.document.querySelector( 'head' );
	}

	return head;
};

export const getDocumentBody = () => {
	let body = document.querySelector( 'body' );

	if ( isEditingContent() ) {
		body = document
			.querySelector( 'iframe[name="editor-canvas"]' )
			.contentWindow.document.querySelector( 'body' );
	}

	return body;
};

export const isEditingContent = () =>
	!! document.querySelector( 'iframe[name="editor-canvas"]' );

export const isEditingPost = () => {
	if ( document.querySelector( '.edit-post-visual-editor' ) ) {
		return true;
	}

	return false;
};

export const JSToCSS = ( attrs, originAttrs ) => {
	let cssString = '';
	for ( let objectKey in attrs ) {
		if ( objectKey.includes( 'Unit' ) ) {
			continue;
		}
		let suffix = '';
		if ( objectKey.includes( 'fontFamily' ) ) {
			suffix = ', Sans-serif';
		}
		if ( objectKey.includes( 'letterSpacing' ) ) {
			suffix = 'px';
		}
		if (
			objectKey.includes( 'fontSize' ) ||
			objectKey.includes( 'lineHeight' )
		) {
			suffix = 'px';
			let realObjectKey = objectKey.replace( /Mobile|Tablet/g, '' );
			if (
				objectKey.includes( 'Tablet' ) &&
				originAttrs[ realObjectKey + 'UnitTablet' ]
			) {
				suffix = originAttrs[ realObjectKey + 'UnitTablet' ];
			}
			if (
				objectKey.includes( 'Tablet' ) &&
				originAttrs[ realObjectKey + 'UnitTablet' ]
			) {
				suffix = originAttrs[ realObjectKey + 'UnitTablet' ];
			}
			if (
				! objectKey.includes( 'Tablet' ) &&
				! objectKey.includes( 'Mobile' ) &&
				originAttrs[ objectKey + 'Unit' ]
			) {
				suffix = originAttrs[ objectKey + 'Unit' ];
			}
		}
		let cssSelector = objectKey.replace( /Mobile|Tablet/g, '' );
		cssString +=
			cssSelector.replace(
				/([A-Z])/g,
				( g ) => `-${ g[ 0 ].toLowerCase() }`
			) +
			': ' +
			originAttrs[ objectKey ] +
			suffix +
			';';
	}

	return cssString;
};
