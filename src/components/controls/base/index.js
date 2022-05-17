import classnames from 'classnames';

import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

import IconToggleControl from './../icon-toggle';
import ResponsiveToggle from '../responsive-toggle';

const WoostifyBaseControl = ( props ) => {
	const units =
		useMemo(
			() =>
				props.units &&
				props.units?.map( ( unit ) => {
					return { value: unit };
				} ),
			[ props.units ]
		) || [];

	const hasResponsive = !! props.responsive?.length;
	const hasUnit = !! props.units?.length;

	const classNames = classnames(
		'components-base-control',
		'components-woostify-base-control',
		'components-wcb-base-control',
		props.className
	);

	return (
		<div className={ classNames }>
			<div className="wb-control-label">
				<div className="wb-base-control__label">{ props.label }</div>
				<div className="wb-base-control__responsive">
					{ hasResponsive && (
						<ResponsiveToggle devices={ props.responsive } />
					) }
				</div>
				<div className="wb-base-control__responsive wb-base-control__units">
					{ hasUnit && (
						<IconToggleControl
							value={ props.selectedUnit }
							options={ units }
							onChange={ ( unit ) => props.onUnitClick( unit ) }
							labelPosition="left"
							label={ __( 'Unit', 'wcb' ) }
							buttonsLabel={ false }
						/>
					) }
				</div>
			</div>
			<div className="wb-base-content">{ props.children }</div>
			{ !! props.help && (
				<div className="wb-base-help">
					<p className="components-base-control__help">
						{ props.help }
					</p>
				</div>
			) }
		</div>
	);
};

export default WoostifyBaseControl;
