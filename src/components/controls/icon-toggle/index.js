import { __ } from '@wordpress/i18n';
import { Button, Dashicon, Popover } from '@wordpress/components';
import {
	useState,
	useCallback,
	memo,
	useMemo,
	useRef,
	useEffect,
} from '@wordpress/element';

var classNames = require( 'classnames' );

const IconToggleControl = ( props ) => {
	const { value, options, labelPosition = 'right' } = props;

	const [ isMouseHover, setIsMouseHover ] = useState( false );
	const [ isOpenContent, setIsOpenContent ] = useState( false );
	const buttonRef = useRef( null );

	const toggleOffset = useMemo( () => {
		const index = props.options.findIndex(
			( el ) => el.value === value.toLowerCase()
		);
		return ( index / options.length ) * 100;
	}, [ options, value ] );

	// Close the toggle content if the user clicks outside.
	const handleOnClickOutside = useCallback( ( event ) => {
		// Do not do anything if the Media Manager is open.
		if ( window.wp?.media?.frame?.el?.clientHeight ) {
			return;
		}

		if ( isOpenContent ) {
			const closest = event.target?.closest(
				'.wb-base-control-responsive-toggle'
			);
			if ( closest !== buttonRef.current ) {
				setIsOpenContent( false );
			}
		}
	} );

	// Assign the outside click listener.
	useEffect( () => {
		document.body.addEventListener( 'click', handleOnClickOutside );
		return () =>
			document.body.removeEventListener( 'click', handleOnClickOutside );
	}, [ handleOnClickOutside ] );

	if ( options.length <= 1 ) {
		return null;
	}

	const toggleBtnClassName = classNames(
		'wb-base-control-responsive-toggle',
		{
			'is-open': isOpenContent,
		}
	);

	return (
		<div className={ toggleBtnClassName } ref={ buttonRef }>
			<div
				className="wb-base-control-toggle__wrapper"
				style={ { transform: `translateY(-${ toggleOffset }%)` } }
			>
				{ options.length > 1 &&
					options.map( ( option, i ) => {
						const label = option.label || option.value;
						const tooltip = ! isOpenContent
							? props.label || label
							: props.buttonsLabel
							? label
							: '';
						return (
							<div
								key={ i }
								onMouseEnter={ () =>
									setIsMouseHover( option.value )
								}
								onMouseLeave={ () => setIsMouseHover( false ) }
							>
								<Button
									className={
										value.toLowerCase() === option.value
											? 'is-active'
											: ''
									}
									onClick={ () => {
										if ( ! isOpenContent ) {
											setIsOpenContent( true );
										} else {
											setIsOpenContent( false );
											props.onChange( option.value );
										}
									} }
								>
									{ option.icon ? (
										<Dashicon icon={ option.icon } />
									) : (
										label
									) }
								</Button>
								{ tooltip && isMouseHover === option.value && (
									<Popover
										position={ `middle ${ labelPosition }` }
										className="wb-responsive-toggle-popover"
									>
										{ option.tooltip || tooltip }
									</Popover>
								) }
							</div>
						);
					} ) }
			</div>
		</div>
	);
};
export default memo( IconToggleControl );
