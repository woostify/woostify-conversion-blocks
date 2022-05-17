import { useSelect } from '@wordpress/data';

export const getDeviceType = () => {
	const { deviceType } = useSelect( ( select ) => {
		const { __experimentalGetPreviewDeviceType: getPreviewDeviceType } =
			select( 'core/edit-post' ) || false;

		if ( ! getPreviewDeviceType ) {
			return {
				deviceType: null,
			};
		}

		return {
			deviceType: getPreviewDeviceType(),
		};
	}, [] );

	return deviceType;
};

export const getDeviceSuffix = () => {
	let deviceSuffix = '';
	let currDevice = getDeviceType();
	if ( 'Tablet' === currDevice ) {
		deviceSuffix = 'Tablet';
	}
	if ( 'Mobile' === currDevice ) {
		deviceSuffix = 'Mobile';
	}

	return deviceSuffix;
};
