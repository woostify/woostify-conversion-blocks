import rgba from 'color-rgba';

/**
 * Creates a new random color.
 */
export const wcbCreateColor = () => {
	return `#${ ( ( ( 1 << 24 ) * Math.random() ) | 0 ).toString( 16 ) }`;
};
/**
 * Returns an rgb string of the hex color.
 *
 * @param {string} hex Color
 */
export const wcbGetRgb = ( hex ) => {
	const rgbColor = rgba( hex.match( /^#/ ) ? hex : `#${ hex }` );
	rgbColor.splice( 3, 1 );
	return rgbColor.join( ', ' );
};
