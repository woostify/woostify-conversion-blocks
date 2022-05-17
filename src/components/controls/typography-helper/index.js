import { Fragment } from '@wordpress/element';

import WoostifyButtonPopoverControl from '../button-popover';
import WCBTypographyControl from '../typography';

const WCBTypographyHelperControl = ( props ) => {
	const onChange = ( selector, value ) => {
		props.setAttributes( {
			[ selector ]: value,
		} );
	};

	const { attributes, setAttributes } = props;

	return (
		<Fragment>
			<WoostifyButtonPopoverControl
				buttonLabel={ props.label }
				popoverHeading={ props.popoverHeading }
			>
				<WCBTypographyControl
					fontSizeUnits={ [ 'px', 'em', 'rem' ] }
					fontSize={ attributes.fontSize }
					fontSizeTablet={ attributes.fontSizeTablet }
					fontSizeMobile={ attributes.fontSizeMobile }
					fontSizeUnit={ attributes.fontSizeUnit }
					fontSizeUnitTablet={ attributes.fontSizeUnitTablet }
					fontSizeUnitMobile={ attributes.fontSizeUnitMobile }
					fontFamily={ attributes.fontFamily }
					fontWeight={ attributes.fontWeight }
					fontStyle={ attributes.fontStyle }
					textTransform={ attributes.fontTransform }
					lineHeight={ attributes.lineHeight }
					lineHeightTablet={ attributes.lineHeightTablet }
					lineHeightMobile={ attributes.lineHeightMobile }
					lineHeightUnit={ attributes.lineHeightUnit }
					lineHeightUnitTablet={ attributes.lineHeightUnitTablet }
					lineHeightUnitMobile={ attributes.lineHeightUnitMobile }
					letterSpacing={ attributes.letterSpacing }
					letterSpacingTablet={ attributes.letterSpacingTablet }
					letterSpacingMobile={ attributes.letterSpacingMobile }
					onChangeFontStyle={ ( value ) =>
						onChange( 'fontStyle', value )
					}
					onChangeTextTransform={ ( value ) =>
						onChange( 'fontTransform', value )
					}
					onChangeFontWeight={ ( value ) =>
						onChange( 'fontWeight', value )
					}
					onChangeFontFamily={ ( value ) =>
						onChange( 'fontFamily', value )
					}
					onChangeFontSize={ ( value ) =>
						onChange( 'fontSize', value )
					}
					onChangeFontSizeTablet={ ( value ) =>
						onChange( 'fontSizeTablet', value )
					}
					onChangeFontSizeMobile={ ( value ) =>
						onChange( 'fontSizeMobile', value )
					}
					onChangeFontSizeUnit={ ( value ) =>
						onChange( 'fontSizeUnit', value )
					}
					onChangeFontSizeUnitTablet={ ( value ) =>
						onChange( 'fontSizeUnitTablet', value )
					}
					onChangeFontSizeUnitMobile={ ( value ) =>
						onChange( 'fontSizeUnitMobile', value )
					}
					onChangeLineHeight={ ( value ) =>
						onChange( 'lineHeight', value )
					}
					onChangeLineHeightTablet={ ( value ) =>
						onChange( 'lineHeightTablet', value )
					}
					onChangeLineHeightMobile={ ( value ) =>
						onChange( 'lineHeightMobile', value )
					}
					onChangeLineHeightUnit={ ( value ) =>
						onChange( 'lineHeightUnit', value )
					}
					onChangeLineHeightUnitTablet={ ( value ) =>
						onChange( 'lineHeightUnitTablet', value )
					}
					onChangeLineHeightUnitMobile={ ( value ) =>
						onChange( 'lineHeightUnitMobile', value )
					}
					onChangeLetterSpacing={ ( value ) =>
						onChange( 'letterSpacing', value )
					}
					onChangeLetterSpacingTablet={ ( value ) =>
						onChange( 'letterSpacingTablet', value )
					}
					onChangeLetterSpacingMobile={ ( value ) =>
						onChange( 'letterSpacingMobile', value )
					}
				/>
			</WoostifyButtonPopoverControl>
		</Fragment>
	);
};
export default WCBTypographyHelperControl;
