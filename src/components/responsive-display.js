import { getDeviceSuffix } from '../utils/get-device-type';

/**
 * WordPress dependencies
 */
import { Children, cloneElement, Fragment } from '@wordpress/element';

const ResponsiveDisplay = ( props ) => {
	const deviceType = getDeviceSuffix();

	const children = Children.toArray( props.children ).map( ( child ) => {
		return cloneElement( child, {
			devices: props.devices,
			device: deviceType.toLowerCase(),
		} );
	} );

	// If this is the currently selected screen.
	const isCurrentScreen = !! deviceType
		? deviceType?.toLowerCase() === props.device // If there's a device type, check if it's the current screen.
		: props.device.toLowerCase() === 'desktop'; // If there's no device type, then only show desktop.

	// If there is no screen available, then just show the desktop. For
	// example, if only desktop & tablet are assigned to the screens prop,
	// and we're currently showing the mobile screen option, since there's
	// no option available, then just show the desktop screen option.
	const isNoScreen =
		! props.devices.includes( deviceType.toLowerCase() ) &&
		! isCurrentScreen &&
		deviceType === 'Desktop';

	return (
		<Fragment>{ ( isCurrentScreen || isNoScreen ) && children }</Fragment>
	);
};

ResponsiveDisplay.defaultProps = {
	device: 'desktop',
	devices: [ 'desktop', 'tablet', 'mobile' ],
};

export default ResponsiveDisplay;
