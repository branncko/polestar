/**
 * File jquery.theme.js.
 *
 * Handles the primary JavaScript functions for the theme.
 */
jQuery( function( $ ) {

	// Element viewport visibility.
	$.fn.polestarIsVisible = function() {
		var rect = this[0].getBoundingClientRect();
		return (
			rect.bottom >= 0 &&
			rect.right >= 0 &&
			rect.top <= ( window.innerHeight || document.documentElement.clientHeight ) &&
			rect.left <= ( window.innerWidth || document.documentElement.clientWidth )
		);
	};	

	// Entry thumbnail container size.
	$( window ).load( function() {
		$( '.entry-thumbnail' ).each( function() {
			img = $( this ).find( 'img' );
			img_width = img.width();
			img_height = img.height();
			$( this ).css( {
				maxWidth: img_width,
				maxHeight: img_height,
			} );
		} );		
	} );

	// Setup FitVids for entry content, Page Builder by SiteOrigin and WooCommerce. Ignore Tableau.
	if ( typeof $.fn.fitVids !== 'undefined' ) {
		$( '.entry-content, .entry-content .panel, .woocommerce #main' ).fitVids( { ignore: '.tableauViz' } );
	}

	// FlexSlider.
	$( window ).on( 'load', function() {
		$( '.flexslider' ).each( function() {
			$( this ).flexslider( {
				animation: 'slide',
				controlNav: false,
				customDirectionNav: $( this ).find( '.flex-direction-nav a' ),
				start: function() {
					$( '.flexslider .slides img' ).show();
				}				
			} );
		} );
	} );	

	// Scroll to top.
	var sttWindowScroll = function () {
		var top = window.pageYOffset || document.documentElement.scrollTop;

		if ( top > $( '#masthead' ).outerHeight() ) {
			if ( ! $( '#scroll-to-top' ).hasClass( 'show' ) ) {
				$( '#scroll-to-top' ).css( 'pointer-events', 'auto' ).addClass( 'show' );
			}
		} else {
			if ( $( '#scroll-to-top' ).hasClass( 'show' ) ) {
				$( '#scroll-to-top' ).css( 'pointer-events', 'none' ).removeClass( 'show' );
			}
		}
	};
	sttWindowScroll();
	$( window ).scroll( sttWindowScroll );
	$( '#scroll-to-top' ).click( function () {
		$( 'html, body' ).animate( { scrollTop: 0 } );
	} );

	// Top bar.
	function polestarToggleTopBar( selector, breakpointWidth ) {
		return {
			_selector: selector,
			_breakpointWidth: breakpointWidth,
			_duration: 500,
			_firstRun: true,
			_forceToShow: false,
			_animating: false,
			_currentState: '',
			_startingState: '',
			_eventCb: { stateStart: false, stateEnd: false },

			_get: function() {
				return $( this._selector );
			},
			_getState: function() {
				if ( window.innerWidth >= this._breakpointWidth ) return 'show';
				if ( this._forceToShow ) return 'force';
				return 'hide';
			},
			_setNewState: function( newState, start ) {
				if ( this._currentState == newState ) return;
				if ( start ) {
					if ( this._startingState != newState ) {
						this._startingState = newState;
						if ( this._eventCb.stateStart ) this._eventCb.stateStart( newState );
					}
				} else {
					this._currentState = newState;
					if ( this._eventCb.stateEnd ) this._eventCb.stateEnd( newState );
				}
			},
			_hide: function( animate ) {
				var header = this._get();
				var self = this;
				var css = {
					'margin-top': -header.height()+'px'
				};
				this._setNewState( 'hide', true );
				if ( animate ) {
					this._animating = true;
					header.animate( css, {
						duration: this._duration,
						step: function( now, fx ) {
							if ( -self._get().height() != fx.end ) fx.end = -self._get().height();
						},
						done: function() {
							self._animating = false;
							self._setNewState( 'hide' );
							self.adjust();
						}
					} );
				} else {
					header.css( css );
					this._setNewState( 'hide' );
				}
			},
			_show: function( animate ) {
				var css = {
					'margin-top': '0px'
				};
				var self = this;
				var state = this._getState();
				this._setNewState( state, true );
				if ( animate ) {
					this._animating = true;
					this._get().animate( css, {
						duration: this._duration,
						step: function( now, fx ) {
							var margin = -self._get().height();
							if ( margin != fx.start ) fx.start = margin;
						},
						done: function() {
							self._animating = false;
							self._setNewState( state );
							self.adjust();
						}
					} );
				} else {
					this._get().css( css );
					this._setNewState( state );
				}
			},
			toggle: function() {
				switch ( this._currentState ) {
					case 'force':
						this._forceToShow = false;
						break;
					case 'hide':
						this._forceToShow = true;
						break;
					default:
						break;
				}
				this.adjust();
			},
			adjust: function() {
				if ( this._animating ) {
					return this;
				}
				if ( this._firstRun ) {
					switch ( this._getState() ) {
						case 'hide': this._hide(); break;
						default: this._show();
					}
					this._firstRun = false;
				} else {
					var state = this._getState();
					switch( state ) {
						case 'hide':
							if ( this._currentState == 'hide' ) this._hide();
							else this._hide( true );
							break;
						default:
							if ( this._currentState == 'hide' ) this._show( true );
							else if( this._currentState != state ) this._show();
					}
				}
				return this;
			},
			getCurrentState: function() {
				return this._currentState;
			},
			on: function( event, cb ) {
				switch ( event ) {
					case 'statestart': 
						this._eventCb.stateStart = cb; 
						break;
					case 'stateend': 
						this._eventCb.stateEnd = cb; 
						break;
					default:
					throw 'unknown event: '+event;
				}
				return this;
			}
		};
	}

	$( document ).ready( function() {
		$( '.top-bar-arrow' ).css( 'display', 'none' );
		var header = polestarToggleTopBar( '#top-bar .polestar-container', polestar_top_bar_params.collapse )
		.on( 'stateend', function( state ) {
			switch ( state ) {
				case 'force':
					$('.top-bar-arrow').removeClass( 'show' ).addClass( 'close' );
					break;
				case 'hide':
					$('.top-bar-arrow').removeClass( 'close' ).addClass( 'show' );
					break;
				default:
					$('.top-bar-arrow').removeClass( 'show' ).removeClass( 'close' );
					break;
			}
		} )
		.on( 'statestart', function( state ) {
			switch ( state ) {
				case 'force':
					$( '.top-bar-arrow' ).css( 'display', '' );
					break;
				case 'hide':
					$( '.top-bar-arrow' ).css( 'display', '' );
					break;
				default:
					$( '.top-bar-arrow' ).css( 'display', 'none' );
					break;
			}
		} )
		.adjust();
		window.onresize = function() { 
			header.adjust();
		}
		$( '.top-bar-arrow' ).on( 'click', function() { header.toggle(); } );
	} );

	// Sticky header.
	if ( $( '#masthead' ).hasClass( 'sticky' ) ) {
		var $mhs = false,
			pageTop = $( '#page' ).offset().top,
			$mh = $( '#masthead' ),
			$tb = $( '#top-bar' ),
			$tbwc = $( '#top-bar .woocommerce-store-notice[style*="display: none"]' );

		var smSetup = function() {

			if ( $( 'body' ).hasClass( 'mobile-header-ns' ) && ( $( window ).width() < polestar_resp_menu_params.collapse ) ) return;
			
			if ( $mhs === false ) {
				$mhs = $( '<div class="masthead-sentinel"></div>' ).insertAfter( $mh );
				$mhs.css( 'height', $mh.outerHeight() );
			}

			if ( ! $( 'body' ).hasClass( 'no-top-bar' ) && ! $tb.polestarIsVisible() ) {
				$( 'body' ).addClass( 'top-bar-out' );
			}

			if ( $tb.length && $( 'body' ).hasClass( 'top-bar-out' ) && $tb.polestarIsVisible() ) {
				$( 'body' ).removeClass( 'top-bar-out' );
			}

			if ( $( 'body' ).hasClass( 'no-top-bar' ) && ! $( window ).scrollTop() ) {
				$( 'body' ).addClass( 'top-bar-out' );
			}			

			if ( $( 'body' ).hasClass( 'no-top-bar' ) || ( ! $( 'body' ).hasClass( 'no-top-bar' ) &&  $( 'body' ).hasClass( 'top-bar-out' ) ) || $tbwc.length ) {
				$mh.css( 'position', 'fixed' );
			} else if ( ! $( 'body' ).hasClass( 'no-top-bar' ) && ! $( 'body' ).hasClass( 'top-bar-out' ) ) {
				$mh.css( 'position', 'absolute' );
			}											

		};
		smSetup();
		$( window ).resize( smSetup ).scroll( smSetup );

		// Sticky header shadow.
		var smShadow = function() {
			if ( $( window ).scrollTop() > 0 ) {
				$( $mh ).addClass( 'stuck' );
			} else {
				$( $mh ).removeClass( 'stuck' );
			}			
		};
		smShadow();
		$( window ).scroll( smShadow );

		// Header padding to be used if logo scaling is enabled.
		var mhPadding = {
			top: parseInt( $mh.css( 'padding-top' ) ),
			bottom: parseInt( $mh.css( 'padding-bottom' ) )
		};

		// Sticky header logo scaling.
		if ( $mh.data( 'scale-logo' ) ) {
			var smResizeLogo = function () {
				var top = window.pageYOffset || document.documentElement.scrollTop;
				top -= pageTop;

				var $img = $mh.find( '.site-branding img' ),
					$branding = $mh.find( '.site-branding > *' );

				$img.removeAttr( 'style' );
				var imgWidth = $img.width(),
					imgHeight = $img.height();

				if ( top > 0 ) {
					var scale = 0.775 + ( Math.max( 0, 48 - top ) / 48 * ( 1 - 0.775 ) );

					if ( $img.length ) {

						$img.css( {
							width: imgWidth * scale,
							height: imgHeight * scale,
							'max-width' : 'none'
						} );
					} else {
						$branding.css( 'transform', 'scale(' + scale + ')' );
					}

					$mh.css( {
						'padding-top': mhPadding.top * scale,
						'padding-bottom': mhPadding.bottom * scale
					} ).addClass( 'stuck' );
				} else {
					if ( ! $img.length ) {
						$branding.css( 'transform', 'scale(1)' );
					}

					$mh.css( {
						'padding-top': mhPadding.top,
						'padding-bottom': mhPadding.bottom
					} ).removeClass( 'stuck' );
				}
			};
			smResizeLogo();
			$( window ).scroll( smResizeLogo ).resize( smResizeLogo );
		}
	}

	// Header search.
	var $hs = $( '#header-search' );
	$( '#masthead .search-icon' ).click( function() {
		$hs.fadeIn( 'fast' );
		$hs.find( 'form' ).css( 'margin-top', - $hs.find( 'form' ).innerHeight() / 2 );
		$hs.find( 'input[type="search"]' ).focus().select();
		$hs.find( '#close-search' ).addClass( 'animate-in' );
	} );
	$hs.find( '#close-search' ).click( function() {
		$hs.fadeOut( 350 );
		$( this ).removeClass( 'animate-in' );
	} );
	$( window ).scroll( function () {
		if ( $hs.is( ':visible' ) ) {
			$hs.find( 'form' ).css( 'margin-top', - $hs.find( 'form' ).outerHeight() / 2 );
		}
	} );

	// Close the header search with the escape key.
	$( document ).keyup( function( e ) {
		if ( e.keyCode == 27 ) { // Escape key maps to keycode 27.
			$( '#close-search.animate-in' ).trigger( 'click' );
		}
	} );	

	// Main menu.
	// Remove the no-js body class.
	$( 'body.no-js' ).removeClass( 'no-js' );	
	if ( $( 'body' ).hasClass( 'css3-animations' ) ) {

		var polestarResetMenu = function() {
			$( '.main-navigation ul ul' ).each( function() {
				var $$ = $( this );
				var width = Math.max.apply( Math, $$.find( '> li:not(.mini_cart_item) > a' ).map( function() {
					return $( this ).width();
				} ).get() );
				$$.find( '> li > a' ).width( width );
			} );
		};
		polestarResetMenu();
		$( window ).resize( polestarResetMenu );

		// Add keyboard access to the menu.
		$( '.menu-item' ).children( 'a' ).focus( function() {
			$( this ).parents( 'ul, li' ).addClass( 'focus' );
		} );

		// Click event fires after focus event.
		$( '.menu-item' ).children( 'a' ).click( function() {
			$( this ).parents( 'ul, li' ).removeClass( 'focus' );
		} );
		
		$( '.menu-item' ).children( 'a' ).focusout( function() {
			$( this ).parents( 'ul, li' ).removeClass( 'focus' );
		} );
	}

	// Main menu current menu item indication.
	jQuery( document ).ready( function( $ ) {
		if ( window.location.hash ) {
			return;
		} else {
			$( '#site-navigation a[href="'+ window.location.href +'"]' ).parent( 'li' ).addClass( 'current-menu-item' );
		}
		$( window ).scroll( function() {
			if ( $( '#site-navigation ul li' ).hasClass( 'current' ) ) {
			   $( '#site-navigation li' ).removeClass( 'current-menu-item' ); 
			}
		} );
	} ); 

	// Smooth scroll from internal page anchors.
	var adminBarHeight = $( '#wpadminbar' ).outerHeight(),
		isAdminBar = $( 'body' ).hasClass( 'admin-bar' ),
		isStickyHeader = $( 'header' ).hasClass( 'sticky' );

	// Header height. 2px to account for header shadow.
	if ( isStickyHeader && isAdminBar && jQuery( window ).width() > 600 ) { // From 600px the admin bar isn't sticky so we shouldn't take its height into account.
		var headerHeight = adminBarHeight + $( 'header' ).outerHeight() - 2;
	} else if ( isStickyHeader ) {
		var headerHeight = $( 'header' ).outerHeight() - 2;              
	} else {
		var headerHeight = 0;
	}    	

	$.fn.polestarSmoothScroll = function() {
		$( this ).click( function( e ) {

			var hash    = this.hash;
			var idName  = hash.substring( 1 );	// Get ID name.
			var alink   = this;                 // This button pressed.

			// Check if there is a section that had same id as the button pressed.
			if ( jQuery( '.panel-grid [id*=' + idName + ']' ).length > 0 ) {
				jQuery( '#site-navigation .current' ).removeClass('current');
				jQuery( alink).parent( 'li' ).addClass( 'current' );
			} else {
				jQuery( '#site-navigation .current' ).removeClass( 'current' );
			}
			if ( location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname ) {
				var target = jQuery( this.hash );
				target = target.length ? target : jQuery( '[name=' + this.hash.slice( 1 ) +']' );
				if ( target.length ) {
					jQuery( 'html, body' ).animate( {
						scrollTop: target.offset().top - headerHeight
					}, 1200 );
					return false; 
				}
			}
		} );
	};

	jQuery( window ).load( function() {
		$( '#site-navigation a[href*="#"]:not([href="#"]), .comments-link a[href*="#"]:not([href="#"]), .puro-scroll[href*="#"]:not([href="#"])' ).polestarSmoothScroll();
	} );

		// Adjust for sticky header when linking from external anchors.
		jQuery( window ).load( function() {

			if ( location.pathname.replace( /^\//,'' ) == window.location.pathname.replace( /^\//,'' ) && location.hostname == window.location.hostname ) {
				var target = jQuery( window.location.hash );
				if ( target.length ) {
					jQuery( 'html, body' ).animate( {
						scrollTop: target.offset().top - headerHeight
					}, 0 );
					return false;
				}
			}
		} );   

	// Indicate which section of the page we're viewing with selected menu classes.
	function polestarSelected() {  

		// Cursor position.
		var scrollTop = jQuery( window ).scrollTop();       

		// Used for checking if the cursor is in one section or not.
		var isInOneSection = 'no';                                        

		// For all sections check if the cursor is inside a section.
		jQuery( '.panel-row-style' ).each( function() {

			// Section ID.
			var thisID = '#' + jQuery( this ).attr( 'id' );    

			// Distance between top and our section. Minus 2px to compensate for an extra pixel produced when a Page Builder row bottom margin is set to 0.              
			var offset = jQuery( this ).offset().top - 2;   

			// Section height.                      
			var thisHeight = jQuery( this ).outerHeight();                     
			
			// Where the section begins.
			var thisBegin = offset - headerHeight;
				  
			// Where the section ends.                            
			var thisEnd = offset + thisHeight - headerHeight;               

			// If position of the cursor is inside of the this section.
			if ( scrollTop >= thisBegin && scrollTop <= thisEnd ) {
				isInOneSection = 'yes';
				jQuery( '#site-navigation .current' ).removeClass( 'current' );
				// Find the menu button with the same ID section.
				jQuery( '#site-navigation a[href$="' + thisID + '"]' ).parent( 'li' ).addClass( 'current' );	// Find the menu button with the same ID section.
				return false;
			}
			if ( isInOneSection === 'no' ) {
				jQuery( '#site-navigation .current' ).removeClass( 'current' );
			}
		} );
	}

	jQuery( window ).on( 'scroll', polestarSelected );

	// Mobile menu.
	var $mobileMenu = false;
	$( '#mobile-menu-button' ).click( function ( e ) {
		e.preventDefault();
		var $$ = $( this );
		$$.toggleClass( 'to-close' );

		if ( $mobileMenu === false ) {
			$mobileMenu = $( '<div></div>' )
				.append( $( '.main-navigation ul' ).first().clone() )
				.attr( 'id', 'mobile-navigation' )
				.appendTo( '#masthead' ).hide();	

			if ( $( '#header-search form' ).length ) {
				$mobileMenu.append( $( '#header-search form' ).clone() );
			}

			if ( $( '.main-navigation .shopping-cart' ).length ) {
				$mobileMenu.append( $( '.main-navigation .shopping-cart .shopping-cart-link' ).clone() );
			}
			
			$mobileMenu.find( '#primary-menu' ).show().css( 'opacity', 1 );
			$mobileMenu.find( '.menu-item-has-children > a' ).addClass( 'has-dropdown' );
			$mobileMenu.find( '.menu-item-has-children > a, .page_item_has_children > a' ).after( '<button class="dropdown-toggle" aria-expanded="false"><i class="icon-chevron-down" aria-hidden="true"></i></button>' );
			$mobileMenu.find( '.dropdown-toggle' ).click( function( e ) {
				e.preventDefault();
				$( this ).toggleClass( 'toggle-open' ).next( '.children, .sub-menu' ).slideToggle( 'fast' );
			} );

			$mobileMenu.find( '.has-dropdown' ).click( function( e ) {
				if ( typeof $( this ).attr( 'href' ) === "undefined" ) {
					e.preventDefault();
					$( this ). siblings( '.dropdown-toggle' ).trigger( 'click' );
				}
			} );			

			var mmOverflow = function() {
				if ( $( '#masthead' ).hasClass( 'sticky' ) ) {
					var adminBarHeight = $( '#wpadminbar' ).css( 'position' ) === 'fixed' ? $( '#wpadminbar' ).outerHeight() : 0;
					var mhHeight = $( '#masthead' ).innerHeight();
					var mobileMenuHeight = $( window ).height() - mhHeight - adminBarHeight;
					$( '#mobile-navigation' ).css( 'max-height', mobileMenuHeight );
				}
			}
			mmOverflow();

			$( window ).resize( mmOverflow );
			$( '#mobile-navigation' ).scroll( mmOverflow );

		}

		$mobileMenu.slideToggle( 'fast' );

		$( '#mobile-navigation a' ).click( function( e ) {
			if ( ! $( this ).hasClass( 'has-dropdown' ) || ( typeof $( this ).attr( 'href' ) !== "undefined" && $( this ).attr( 'href' )  !== "#" ) ) {
				if ( $mobileMenu.is(' :visible' ) ) {
					$mobileMenu.slideUp( 'fast' );
				}
			}
			$$.removeClass( 'to-close' );
		} );

		$( '#mobile-navigation a[href*="#"]:not([href="#"])' ).polestarSmoothScroll();

	} );	  

} );	
