/**
 * Edit Screen
 *
 * @package Woostify Conversion Blocks
 */

/* global ajaxurl, wcb_edit_screen */

'use strict';

// Set delay time when user typing.
var woostifySearchDelay = function() {
	var timer = ( arguments.length > 0 && undefined !== arguments[0] ) ? arguments[0] : 0;

	return function( callback, ms ) {
		clearTimeout( timer );
		timer = setTimeout( callback, ms );
	};
}();

var wcbRegenerateCssFiles = function() {
	var button = document.querySelector( '.js-button-regenerate-css-files' );
	if ( ! button ) {
		return
	}

	var button_icon = button.querySelector('.dashicons');

	button.onclick = function() {
		if ( button.getAttribute( 'disabled' ) || button.classList.contains( 'loading' ) ) {
			return;
		}

		var request = new Request(
			wcb_edit_screen.ajax_url,
			{
				method: 'POST',
				body: 'action=regenerate_css_files&wcb_settings_form_nonce=' + wcb_edit_screen.settings_form_nonce,
				credentials: 'same-origin',
				headers: new Headers(
					{
						'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
					}
				)
			}
		);

		button.setAttribute( 'disabled', 'disabled' );
		button.classList.add( 'loading' );
		button_icon.setAttribute('class', 'dashicons dashicons-update-alt');

		fetch( request ).then(function( res ) {
			if ( 200 !== res.status ) {
				button.classList.remove( 'loading' );
				button.removeAttribute('disabled');
				button_icon.setAttribute('class', 'dashicons dashicons-update-alt');
				return;
			}

			return res.json();
		})
		.then(
			function( r ) {
				if ( !r.success) {
					return;
				}
				button.removeAttribute('disabled');
				button.classList.remove( 'loading' );
				button_icon.setAttribute('class', 'dashicons dashicons-saved');
			}
		)
		.catch(
			function( err ) {
				console.log( err );
			}
		).finally(
			function() {
				button.removeAttribute('disabled');
				button.classList.remove( 'loading' );
			}
		);
	}
}

// Multi select.
var woostifyMultiSelect = function() {
	var meta = document.querySelectorAll( '.woostify-multi-selection' );
	if ( ! meta.length ) {
		return;
	}

	meta.forEach(
		function( element ) {
			var input     = element.querySelector( '.woostify-multi-select-value' ),
				selection = element.querySelector( '.woostify-multi-select-selection' ),
				inner     = selection.querySelector( '.woostify-multi-selection-inner' ),
				search    = selection.querySelector( '.woostify-multi-select-search' ),
				dropdown  = element.querySelector( '.woostify-multi-select-dropdown' );

			// Save value.
			var saveItem = function( echo ) {
				var selectionItem = inner.querySelectorAll( '.woostify-multi-select-id' );
				if ( ! selectionItem.length ) {
					input.value = 'default';
					return;
				}

				var data = [];
				selectionItem.forEach(
					function( ele ) {
						var saveId = ele.getAttribute( 'data-id' );

						if ( ! saveId || data.includes( saveId ) ) {
							return;
						}

						data.push( saveId );
					}
				);

				if ( true === echo ) {
					return data;
				}

				input.value = data.join( '|' );
			}

			// Remove item.
			var removeItem = function() {
				var selectionItem = inner.querySelectorAll( '.woostify-multi-select-id' );
				if ( ! selectionItem.length ) {
					return;
				}

				selectionItem.forEach(
					function( el ) {
						var selectedId   = el.getAttribute( 'data-id' ),
							removeButton = el.querySelector( '.woostify-multi-remove-id' );

						if ( ! removeButton ) {
							return;
						}

						removeButton.onclick = function() {
							if ( ! el.parentNode ) {
								return;
							}

							// Show dropdown item.
							element.classList.add( 'active' );

							// Remove class 'disabled' on dropdown item.
							var isThis = dropdown.querySelector( '[data-id="' + selectedId + '"]' );
							if ( isThis ) {
								isThis.classList.remove( 'disabled' );
							}

							// Remove it.
							el.remove();

							// Save item.
							saveItem();
						}
					}
				);
			}
			removeItem();

			// Add item.
			var addItem = function() {
				var dropdownItem = dropdown.querySelectorAll( '.woostify-multi-select-id' );
				if ( ! dropdownItem.length ) {
					return;
				}

				for ( var i = 0, j = dropdownItem.length; i < j; i++ ) {
					dropdownItem[i].onclick = function() {
						var t        = this,
							disabled = t.classList.contains( 'disabled' ),
							dataId   = t.getAttribute( 'data-id' );

						if ( disabled ) {
							return;
						}

						t.classList.add( 'disabled' );

						var currentId = '<span class="woostify-multi-select-id" data-id="' + dataId + '">' + t.innerHTML + '<i class="woostify-multi-remove-id dashicons dashicons-no-alt"></i></span>';

						inner.insertAdjacentHTML( 'afterbegin', currentId );

						// Save item.
						saveItem();

						// Remove item.
						removeItem();
					}
				}
			}

			// Show dropdown item.
			if ( search ) {
				search.addEventListener(
					'input',
					function() {
						var that        = this,
							nonce       = that.getAttribute( 'data-nonce' ),
							searchValue = that.value.trim(),
							searchName  = that.name, // Action name.
							immediate   = that.getAttribute( 'data-search' ),
							request     = new Request(
								ajaxurl,
								{
									method: 'POST',
									body: 'action=' + searchName + '&security_nonce=' + nonce + '&keyword=' + searchValue,
									credentials: 'same-origin',
									headers: new Headers(
										{
											'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
										}
									)
								}
							);

						if ( 'immediate' === immediate ) {
							addItem();
						} else {
							// Must enter one or more character.
							if ( searchValue.length < 1 ) {
								// Reset dropdown html.
								dropdown.innerHTML = '';

								return;
							}

							// Fetch API.
							woostifySearchDelay(
								function() {
									fetch( request )
										.then(
											function( res ) {
												if ( 200 !== res.status ) {
													console.log( 'Status Code: ' + res.status );
													return;
												}

												res.json().then(
													function( r ) {
														if ( ! r.success ) {
															return;
														}

														// Update category state.
														var parser       = new DOMParser(),
															doc          = parser.parseFromString( r.data, 'text/html' ),
															ajaxDropdown = doc.querySelectorAll( '.woostify-multi-select-id' );

														if ( ajaxDropdown.length ) {
															ajaxDropdown.forEach(
																function( ajaxItem ) {
																	var ajaxItemId = ajaxItem.getAttribute( 'data-id' ) || '',
																		saveValue  = saveItem( true ) || [];

																	if ( saveValue.length ) {
																		if ( saveValue.includes( ajaxItemId ) ) {
																			ajaxItem.classList.add( 'disabled' );
																		} else {
																			ajaxItem.classList.remove( 'disabled' );
																		}
																	}
																}
															);
														}

														// Append updated html.
														dropdown.innerHTML = doc.body.innerHTML;

														// Add item.
														addItem();
													}
												);
											}
										).catch(
											function( err ) {
												dropdown.innerHTML = '';
												console.log( err );
											}
										);
								},
								500
							);
						}
					}
				);

				search.addEventListener(
					'focus',
					function( e ) {
						element.classList.add( 'active' );
						removeItem();

						if ( 'immediate' === this.getAttribute( 'data-search' ) ) {
							addItem();
						}
					}
				);
			}

			// Hide dropdown item.
			document.addEventListener(
				'click',
				function( e ) {
					var current  = e.target,
						isParent = current.closest( '.woostify-multi-selection' ),
						isRemove = current.classList.contains( 'woostify-multi-remove-id' ),
						isSelect = current.classList.contains( 'woostify-multi-select-id' ),
						isSearch = current.classList.contains( 'woostify-multi-select-search' );

					// Not same parent, remove active, return.
					if ( isParent != element ) {
						element.classList.remove( 'active' );

						return;
					}

					if ( selection === current || isRemove || isSelect || isSearch ) {
						return;
					}

					element.classList.remove( 'active' );

					return;
				}
			);
		}
	);
}

// Get all Prev element siblings.
var prevSiblings = function( target ) {
	var siblings = [],
		n        = target;

	while ( n = n.previousElementSibling ) {
		siblings.push( n );
	}

	return siblings;
}

// Get all Next element siblings.
var nextSiblings = function( target ) {
	var siblings = [],
		n        = target;

	while ( n = n.nextElementSibling ) {
		siblings.push( n );
	}

	return siblings;
}

// Get all element siblings.
var siblings = function( target ) {
	var prev = prevSiblings( target ) || [],
		next = nextSiblings( target ) || [];

	return prev.concat( next );
}

// Multi Dependency settings.
var woostifyMultiDependency = function() {
	var dep = document.querySelectorAll( '.woostify-multi-dependency' );
	if ( ! dep.length ) {
		return;
	}

	dep.forEach(
		function( element ) {
			var item = element.querySelectorAll( '.woostify-multi-dependency-item [name]' );
			if ( ! item.length ) {
				return;
			}

			item.forEach(
				function( ele, index ) {
					var parent      = ele.closest( '.woostify-multi-dependency-item' ),
						parentStart = parent.getAttribute( 'data-dependency' );

					if ( ! parentStart ) {
						return;
					}

					ele.addEventListener(
						'change',
						function() {
							var currentValue  = ele.value,
								currentChild  = parseInt( index ) + 1,
								allDependency = element.querySelectorAll( '.woostify-multi-dependency-item:nth-child(' + currentChild + ') ~ .woostify-multi-dependency-item[data-required="' + currentValue + '"]' ),
								allNext       = siblings( parent );

							// First, remove all child if not equal value.
							if ( allNext.length ) {
								allNext.forEach(
									function( en ) {
										var nextRequired = en.getAttribute( 'data-required' );
										if ( ! nextRequired ) {
											return;
										}

										en.classList.remove( 'active' );
									}
								);
							}

							// Then, update child if equal value.
							if ( allDependency.length ) {
								allDependency.forEach(
									function( el ) {
										var required = el.getAttribute( 'data-required' ),
											updated  = el.getAttribute( 'data-value' ),
											onChange = new Event( 'change' ),
											_name    = el.querySelector( '[name]' );

										_name.dispatchEvent( onChange );

										if ( 'checkbox' == ele.type ) {
											if ( ele.checked ) {
												el.classList.add( 'active' );
											} else {
												el.classList.remove( 'active' );
											}
										} else {
											if ( currentValue == required ) {
												el.classList.add( 'active' );
											} else {
												el.classList.remove( 'active' );
											}
										}
									}
								);
							}
						}
					);
				}
			);
		}
	);
}

// Update value for checkbox filed.
var woostifyUpdateValue = function() {
	var box = document.querySelector( '.woostify-featured-setting' );
	if ( ! box ) {
		return;
	}

	var field = box.querySelectorAll( '[type="checkbox"]' );
	if ( ! field.length ) {
		return;
	}

	field.forEach(
		function( el ) {
			el.onchange = function() {
				el.value = 1 == el.value ? 0 : 1;
			}
		}
	);
}

// COUNTDOWN URGENCY FEATURED SETTINGS.
var woostifyDependency = function() {
	var filter = document.querySelectorAll( '.woostify-filter-value' );
	if ( ! filter.length ) {
		return;
	}

	filter.forEach(
		function( fil ) {
			fil.addEventListener(
				'change',
				function() {
					var parent   = fil.closest( '.woostify-filter-item' ),
						siblings = nextSiblings( parent );

					if ( ! siblings.length || ! fil.value.trim() ) {
						return;
					}

					siblings.forEach(
						function( sib ) {
							var type = sib.getAttribute( 'data-type' );
							if ( ! type ) {
								return;
							}

							if ( 'checkbox' === fil.type ) {
								if ( fil.checked && type == fil.value  ) {
									sib.classList.remove( 'hidden' );
								} else {
									sib.classList.add( 'hidden' );
								}
							} else {
								if ( type.includes( fil.value )  ) {
									sib.classList.remove( 'hidden' );
								} else {
									sib.classList.add( 'hidden' );
								}
							}
						}
					);
				}
			);
		}
	);
}

// SECTION TAB SETTINGS.
var woostifyTabSettings = function() {
	var section = document.querySelector( '.woostify-settings-section-tab' );
	if ( ! section ) {
		return;
	}

	var button = section.querySelectorAll( '.tab-head-button' );
	if ( ! button.length ) {
		return;
	}

	button.forEach(
		function( element ) {
			element.onclick = function() {
				var id          = element.hash ? element.hash.substr( 1 ) : '',
					idSiblings  = siblings( element ),
					tab         = section.querySelector( '.woostify-setting-tab-content[data-tab="' + id + '"]' ),
					tabSiblings = siblings( tab );

				// Active current tab heading.
				element.classList.add( 'active' );
				if ( idSiblings.length ) {
					idSiblings.forEach(
						function( el ) {
							el.classList.remove( 'active' );
						}
					);
				}

				// Active current tab content.
				tab.classList.add( 'active' );
				if ( tabSiblings.length ) {
					tabSiblings.forEach(
						function( el ) {
							el.classList.remove( 'active' );
						}
					);
				}
			}
		}
	);

	// Trigger first click. Active tab.
	window.addEventListener(
		'load',
		function() {
			var currentTab = section.querySelector( 'a[href="' + window.location.hash + '"]' ),
				generalTab = section.querySelector( 'a[href="#general"]' );

			if ( currentTab ) {
				currentTab.click();
			} else if ( generalTab ) {
				generalTab.click();
			}
		}
	);
}

// AJAX SAVE OPTIONS.
var woostifySaveOptions = function() {
	var box = document.querySelector( '.woostify-featured-setting' );
	if ( ! box ) {
		return;
	}

	var _id     = box.getAttribute( 'data-id' ) || '',
		_nonce  = box.getAttribute( 'data-nonce' ) || '',
		buttons = box.querySelectorAll( '.save-options' );

	if ( ! buttons.length || ! _id || ! _nonce ) {
		return;
	}

	buttons.forEach(
		function( button ) {
			button.onclick = function() {
				if ( button.getAttribute( 'disabled' ) || box.classList.contains( 'loading' ) ) {
					return;
				}

				var t        = this,
					likeId   = _id.replace( /-/g, '_' ), // Same id but replare '-' to '_'.
					options  = box.querySelectorAll( '[name*=wcb_' + likeId + ']' ),
					value    = {},
					required = box.querySelectorAll( '[required="required"]' ),
					isEmpty  = false;

				// For Ajax search setting only.
				if ( box.classList.contains( 'woostify-ajax-search-product-setting' ) ) {
					var mustChooseOption = box.querySelector( '.must-choose-one-option' ),
						checkboxInput    = mustChooseOption ? mustChooseOption.querySelector( '[type="checkbox"]' ) : false,
						checkedOption    = mustChooseOption ? mustChooseOption.querySelectorAll( '[type="checkbox"]:checked' ) : [];

					if ( ! checkedOption.length && checkboxInput ) {
						checkboxInput.focus();

						return;
					}
				}

				// Required field must not be empty.
				if ( required.length ) {
					required.forEach(
						function( field ) {
							var fieldValue  = field.value.trim(),
								fieldParent = field.closest( '.woostify-setting-tab-content' ),
								isHidden    = field.closest( '.woostify-filter-item.hidden' ),
								fieldInTab  = fieldParent ? fieldParent.getAttribute( 'data-tab' ) : '';

							// If field in hidden setting. No need check.
							if ( isHidden ) {
								return;
							}

							if ( ! fieldValue ) {
								// Focus tab have required empty field.
								var emptyTab = box.querySelector( 'a[href="#' + fieldInTab + '"]' );
								if ( emptyTab && ! emptyTab.classList.contains( 'active' ) ) {
									emptyTab.click();
								}

								// Focus required empty field.
								isEmpty = true;
								field.focus();

								return;
							}
						}
					);
				}

				// If has required field empty, return.
				if ( isEmpty ) {
					return;
				}

				// Loading animation.
				box.classList.add( 'loading' );
				t.setAttribute( 'disabled', 'disabled' );
				t.innerHTML = wcb_edit_screen.saving + '...';

				// Get all value.
				if ( options.length ) {
					options.forEach(
						function( el, index ) {
							if ( ! el.value.trim() ) {
								return;
							}

							if ( el.name.includes( '[]' ) ) {
								value[ el.name + '[' + index + ']' ] = el.value;
							} else {
								value[ el.name ] = el.value;
							}
						}
					);
				}

				// Request.
				var request = new Request(
					ajaxurl,
					{
						method: 'POST',
						body: 'action=save_' + likeId + '_options&security_nonce=' + _nonce + '&setting_id=' + _id + '&options=' + JSON.stringify( value ),
						credentials: 'same-origin',
						headers: new Headers(
							{
								'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
							}
						)
					}
				);

				// Fetch API.
				fetch( request )
					.then(
						function( res ) {
							if ( 200 !== res.status ) {
								console.log( 'Status Code: ' + res.status );
								return;
							}

							// Update success status.
							let infoSuccess = box.querySelector( '.woostify-settings-section-footer .info-success' );
							if ( ! infoSuccess ) {
								button.insertAdjacentHTML( 'afterend', '<span class="info-success">' + wcb_edit_screen.saved_success + '</span>' );
							}

							// Remove loading.
							box.classList.remove( 'loading' );
						}
					).catch(
						function() {
							// Remove loading.
							box.classList.remove( 'loading' );
						}
					).finally(
						function() {
							// Update button html.
							t.innerHTML = wcb_edit_screen.saved;
							setTimeout(
								function() {
									t.innerHTML = wcb_edit_screen.save;
									t.removeAttribute( 'disabled' );
								},
								1000
							);
						}
					);
			}
		}
	);
}

// SALE NOTIFICATION SETTINGS.
// Remove message.
var woostifySaleNotificationRemoveMessage = function() {
	var messages = document.querySelector( '.woostify-sale-notification-box-message' );

	if ( ! messages ) {
		return;
	}

	var removeMessageButton = messages.querySelectorAll( '.woostify-sale-notification-remove-message' );
	if ( ! removeMessageButton.length ) {
		return;
	}

	removeMessageButton.forEach(
		function( element ) {
			element.onclick = function() {
				var t        = this,
					disabled = t.getAttribute( 'disabled' ) || '';

				if ( 'disabled' === disabled ) {
					return;
				}

				t.parentNode.remove();

				if ( messages.querySelectorAll( '.woostify-sale-notification-remove-message' ).length <= 1 ) {
					var lastEvent = new Event( 'lastMessage' );
					document.documentElement.dispatchEvent( lastEvent );
				}
			}
		}
	);

	// Set disaled attribute if only one message available.
	document.documentElement.addEventListener(
		'lastMessage',
		function() {
			var lastMessage = messages.querySelector( '.woostify-sale-notification-remove-message' );
			if ( ! lastMessage ) {
				return;
			}

			lastMessage.setAttribute( 'disabled', 'disabled' );
		}
	);
}

// Add new message.
var woostifySaleNotificationAddNewMessage = function() {
	var box          = document.querySelector( '.woostify-featured-setting' ),
		messages     = box ? document.querySelector( '.woostify-sale-notification-box-message' ) : false,
		firstMessage = messages ? messages.querySelector( '.woostify-sale-notification-message-inner' ) : '',
		removeLabel  = firstMessage ? firstMessage.querySelector( '.woostify-sale-notification-remove-message' ).innerHTML : '',

		// Markup message html.
		markupMessage  = '<div class="woostify-sale-notification-message-inner">';
		markupMessage += '<textarea name="woostify_sale_notification_message[]" required="required"></textarea>';
		markupMessage += '<span class="woostify-sale-notification-remove-message button">' + removeLabel + '</span>';
		markupMessage += '</div>';

	if ( ! box || ! messages || ! firstMessage ) {
		return;
	}

	var addNewButton = box.querySelector( '.woostify-sale-notification-add-message' );
	if ( ! addNewButton ) {
		return;
	}

	addNewButton.onclick = function() {
		// Insert markup message html.
		messages.insertAdjacentHTML( 'beforeend', markupMessage );

		// Run remove message script.
		woostifySaleNotificationRemoveMessage();

		// Focus last message added.
		var lastMessage = messages.querySelector( '.woostify-sale-notification-message-inner:last-of-type' ),
			lastField   = lastMessage ? lastMessage.querySelector( 'textarea' ) : false;

		if ( lastField ) {
			lastField.focus();
		}

		// Remove disabled attribute for remove button.
		var removeDisabledAttr = messages.querySelector( '.woostify-sale-notification-remove-message[disabled="disabled"]' );
		if ( removeDisabledAttr ) {
			removeDisabledAttr.removeAttribute( 'disabled' );
		}
	}
}

var woostifyHeaderFooterBuilderSelectTemplate = function () {
	var templateEl = document.getElementById( 'woostify-header-footer-builder-template' );

	if ( templateEl ) {
		templateEl.addEventListener(
			'change',
			function () {
				var btn      = this;
				var template = btn.value;
				if ( 'default' === template ) {
					btn.closest( '.input-wrapper' ).nextElementSibling.remove();
				} else {
					var inputWrapper = btn.closest( '.input-wrapper' );
					var check        = nextSiblings( inputWrapper );
					var nonce        = document.getElementById( 'woostify-hfb-nonce' ).value;
					if ( check.length === 0 ) {
						// Request.
						var request = new Request(
							ajaxurl,
							{
								method: 'POST',
								body: 'action=woostify_pro_select_template&_ajax_nonce=' + nonce + '&template=' + template,
								credentials: 'same-origin',
								headers: new Headers(
									{
										'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
									}
								)
							}
						);
						fetch( request ).then(
							function (res) {
								if ( 200 !== res.status ) {
									console.log( 'Status Code: ' + res.status );
									return;
								}

								res.json().then(
									function (r) {
										if ( ! r.success ) {
											return;
										}

										if ('' !== r.data) {
											var parser           = new DOMParser(),
												data             = parser.parseFromString( r.data, 'text/html' ),
												ajaxInputWrapper = data.querySelector( '.input-wrapper' );
											document.querySelector( '.woostify-pro-hfb-options-wrapper' ).append( ajaxInputWrapper );
										}
									}
								)
							}
						)
					}
					var sticky = document.querySelector( '.condition-group.sticky' );
					if ( sticky !== null ) {
						if ( 'header' === template ) {
							if ( sticky.classList.contains( 'hidden' ) ) {
								sticky.classList.remove( 'hidden' );
							}
						} else {
							if ( ! sticky.classList.contains( 'hidden' ) ) {
								sticky.classList.add( 'hidden' );
							}
						}
					}
				}
			}
		)
	}
}

var woostifyChangeDisplayOption = function () {
	if ( document.getElementById( 'woostify-hfb-nonce' ) ) {
		var nonce = document.getElementById( 'woostify-hfb-nonce' ).value
		document.addEventListener(
			'change',
			function (e) {
				var curr    = e.target,
					curr_id = curr.getAttribute( 'id' );
				if ( 'woostify-header-footer-builder-display-on' === curr_id || 'woostify-header-footer-builder-no-display-on' === curr_id ) {
					var postType = curr.options[curr.selectedIndex].value,
						type     = 'display_on';
					if ( 'woostify-header-footer-builder-no-display-on' === curr_id ) {
						type = 'no_display_on';
					}
					var request = new Request(
						ajaxurl,
						{
							method: 'POST',
							body: 'action=woostify_pro_load_autocomplete&_ajax_nonce=' + nonce + '&post_type=' + postType + '&type=' + type,
							credentials: 'same-origin',
							headers: new Headers(
								{
									'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
								}
							)
						}
					);
					fetch( request ).then(
						function (res) {
							if ( 200 !== res.status ) {
								console.log( 'Status Code: ' + res.status );
								return;
							}

							res.json().then(
								function (r) {
									if ( ! r.success ) {
										return;
									}

									var conditionGroup = curr.closest( '.condition-group' );

									conditionGroup.getElementsByClassName( 'child-item' )[0].innerHTML = r.data;
								}
							)
						}
					)
				}
			}
		)
		document.addEventListener(
			'click',
			function (e) {
				var curr       = e.target || e.currentTarget,
					curr_class = curr.getAttribute( 'class' );

				if ( curr.classList.contains( 'woostify-select-all-post' ) || curr.classList.contains( 'woostify-arrow' ) || curr.classList.contains( 'woostify-select-all' ) ) {
					var parent          = curr.closest( '.woostify-section-select-post' ),
						childItemsCount = parent.children.length,
						render;
					for ( var i = 0; i < childItemsCount; i++ ) {
						if ( parent.children[i].classList.contains( 'woostify-section-render--post' ) ) {
							render = parent.children[i];
							break;
						}
					}
					if ( render.classList.contains( 'hidden' ) ) {
						render.classList.remove( 'hidden' );
						parent.classList.remove( 'select-all' );
						parent.classList.add( 'render--post' );
						parent.getElementsByClassName( 'woostify--hf-post-name' )[0].focus();
					} else {
						render.classList.add( 'hidden' );
						parent.classList.remove( 'render--post' );
						parent.classList.add( 'select-all' );
					}
				}

				if ( curr.classList.contains( 'woostify-auto-complete-field' ) ) {
					curr.querySelector( '.woostify--hf-post-name' ).focus();
				}

				if (curr.classList.contains( 'post-item' ) && ! curr.classList.contains( 'disabled' )) {
					var inputItemWrapper = curr.closest( '.input-item-wrapper' ),
						listPost         = inputItemWrapper.querySelector( '.woostify-post-ids' ).value,
						all              = inputItemWrapper.querySelector( '.woostify-select-all-post' ),
						parentSelectPost = inputItemWrapper.querySelector( '.woostify-section-select-post' );
					if ( ! all.classList.contains( 'hidden' ) ) {
						all.classList.add( 'hidden' );
					}
					if ( ! listPost || 'all' === listPost ) {
						listPost = [];
					} else {
						listPost = listPost.split( ',' );
					}
					if ( ! parentSelectPost.classList.contains( 'has-option' ) ) {
						parentSelectPost.classList.add( 'has-option' );
					}
					var id    = curr.getAttribute( 'data-item' ),
						title = curr.textContent;
					if ( ! listPost.includes( id ) ) {
						listPost.push( id );
						var html       = '<span class="woostify-title">' + title + '</span>' +
							'<span class="btn-woostify-auto-complete-delete ion-close" data-item="' + id + '"></span>';
						var newTagItem = document.createElement( 'span' );
						newTagItem.classList.add( 'woostify-auto-complete-key' );
						newTagItem.innerHTML = html;
						inputItemWrapper.querySelector( '.woostify-auto-complete-field' ).insertBefore( newTagItem, inputItemWrapper.querySelector( '.woostify--hf-post-name' ) );
					}
					inputItemWrapper.querySelector( '.woostify-post-ids' ).value      = listPost;
					inputItemWrapper.querySelector( '.woostify--hf-post-name' ).value = '';
					curr.classList.add( 'disabled' );
				}

				if ( curr.classList.contains( 'btn-woostify-auto-complete-delete' ) ) {
					var id               = curr.getAttribute( 'data-item' ),
						inputItemWrapper = curr.closest( '.input-item-wrapper' ),
						listPost         = inputItemWrapper.querySelector( '.woostify-post-ids' ).value,
						render           = inputItemWrapper.querySelector( '.woostify-section-render--post' ),
						selectAllEl      = inputItemWrapper.querySelector( '.woostify-select-all-post' ),
						parent           = inputItemWrapper.querySelector( '.woostify-section-select-post' ),
						condition        = inputItemWrapper.closest( '.condition-group' );

					if ( ! listPost || 'all' === listPost ) {
						listPost = [];
					} else {
						listPost = listPost.replace( ',' + id, '' );
						listPost = listPost.replace( id, '' );
					}

					if ( '' === listPost || listPost == null ) {
						listPost = 'all';
						render.classList.add( 'hidden' );
						parent.classList.remove( 'render--post' );
						parent.classList.add( 'select-all' );
						parent.classList.remove( 'has-option' );
						selectAllEl.classList.remove( 'hidden' );
						inputItemWrapper.querySelector( '.woostify-data' ).innerHTML = '';
					}

					inputItemWrapper.querySelector( '.woostify-post-ids' ).value = listPost;
					curr.parentElement.remove();
				}

				if ( 'woostify-header-template-sticky' === curr.getAttribute( 'name' ) ) {
					var sticky               = document.querySelector( 'input[name="woostify-header-template-sticky"]' ).checked,
						conditionGroupSticky = curr.closest( '.condition-group' ),
					stickyChildItem          = conditionGroupSticky.querySelector( '.child-item' );
					if ( sticky ) {
						if (stickyChildItem.classList.contains( 'hidden' )) {
							stickyChildItem.classList.remove( 'hidden' );
						}
					} else {
						if ( ! stickyChildItem.classList.contains( 'hidden' )) {
							stickyChildItem.classList.add( 'hidden' );
						}
					}
				}

				if ( document.querySelectorAll( '.woostify--hf-post-name' ).length > 0 ) {
					var inputSearch      = document.querySelectorAll( '.woostify--hf-post-name' ),
						inputSearchCount = inputSearch.length;
					for ( var c = 0; c < inputSearchCount; c++ ) {
						inputSearch[c].value = '';
					}
				}

				if ( document.querySelectorAll( '.woostify-data' ).length > 0 ) {
					var dataContainer      = document.querySelectorAll( '.woostify-data' ),
						dataContainerCount = dataContainer.length;
					for ( var j = 0; j < dataContainerCount; j++ ) {
						dataContainer[j].innerHTML = '';
					}
				}

			}
		)

		// Search post.
		document.addEventListener(
			'keyup',
			function (e) {
				var btn = e.target;
				if (btn.classList.contains( 'woostify--hf-post-name' )) {
					var parentItem    = btn.closest( '.input-item-wrapper' ),
						postType      = parentItem.querySelector( '.woostify-post-type' ).value,
						selectedPosts = parentItem.querySelector( '.woostify-post-ids' ).value,
						keyword       = btn.value;
					var request       = new Request(
						ajaxurl,
						{
							method: 'POST',
							body: 'action=woostify_pro_load_post&_ajax_nonce=' + nonce + '&post_type=' + postType + '&key=' + keyword + '&selected=' + selectedPosts,
							credentials: 'same-origin',
							headers: new Headers(
								{
									'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
								}
							)
						}
					);

					fetch( request ).then(
						function (res) {
							if ( 200 !== res.status ) {
								console.log( 'Status Code: ' + res.status );
								return;
							}

							res.json().then(
								function (r) {
									if ( ! r.success ) {
										return;
									}

									parentItem.getElementsByClassName( 'woostify-data' )[0].innerHTML = r.data;
								}
							)
						}
					);
				}
			}
		)
	}
}

document.addEventListener(
	'DOMContentLoaded',
	function() {
		if ( 'function' === typeof( woostifyMoveWordpressUpdateVersionNotice ) ) {
			woostifyMoveWordpressUpdateVersionNotice();
		}
		woostifyMultiSelect();
		woostifyDependency();
		woostifyMultiDependency();
		woostifyUpdateValue();
		woostifyTabSettings();
		woostifySaveOptions();
		woostifySaleNotificationAddNewMessage();
		woostifySaleNotificationRemoveMessage();
		woostifyHeaderFooterBuilderSelectTemplate();
		woostifyChangeDisplayOption();
		wcbRegenerateCssFiles();
	}
);
