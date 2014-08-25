(function()
{
	SteamRemoteClient.ShowAlerts = true;
	
	SteamRemoteClient.Authorize( 'SteamDB', 'PraiseLordGaben', function() {} );
	
	var trapArea = $( '.mousetrap' ),
	    input = $( '.js-steam-input' ),
	    lastPosition = { x: 0.0, y: 0.0 },
	    isMouseInTrapArea = false;
	
	trapArea.one( 'click', function( )
	{
		trapArea.find( 'h3' ).text( 'It\'s a trap!' );
		
		// We have to use keydown event on document because trapArea can't really be in focus when pressing keys
		$( document ).on( 'keydown', function( e )
		{
			if( isMouseInTrapArea )
			{
				var key = 'key_' + Keycode.GetValueByEvent( e );
				
				trapArea.find( 'h3' ).text( key );
				
				SteamRemoteClient.Keyboard.Key( key );
				
				return false;
			}
		} );
		
		$( trapArea ).on( {
			click: function( )
			{
				SteamRemoteClient.DoPOST( 'mouse/click', { button: 'mouse_left' } );
			},
			
			mouseenter: function( )
			{
				isMouseInTrapArea = true;
			},
			
			mouseleave: function( )
			{
				isMouseInTrapArea = false;
			},
			
			mousewheel: function( e )
			{
				SteamRemoteClient.Keyboard.Key( e.originalEvent.wheelDelta > 0 ? 'key_left' : 'key_right' ); // Ideally it should be up/down for dropdowns
				
				return false;
			},
			
			mousemove: function( e )
			{
				var deltaX = e.clientX - lastPosition.x,
				    deltaY = e.clientY - lastPosition.y;
				
				lastPosition =
				{
					x: e.clientX,
					y: e.clientY
				};
				
				SteamRemoteClient.DoPOST( 'mouse/move',
					{
						delta_x: deltaX,
						delta_y: deltaY
					}
				);
			}
		} );
	} );
	
	// Get state
	$( '.js-steam-get-state' ).click( function( e )
	{
		e.preventDefault( );
		
		SteamRemoteClient.State();
	} );

	// Tenfoot
	$( '.js-steam-launch-bp' ).click( function( e )
	{
		e.preventDefault( );
		
		SteamRemoteClient.State( function( response )
		{
			if( response.success === true && response.data.tenfoot === 0 )
			{
				SteamRemoteClient.UI.Tenfoot();
			}
		} );
	} );

	// Get list
	$( '.js-steam-get-games' ).click( function( e )
	{
		e.preventDefault( );
		
		SteamRemoteClient.Games.Index( function( data )
		{
			var list = $( '.js-steam-games-list' ).empty( );
			
			for( var i in data.data )
			{
				var link = $( '<a></a>', { class: 'list-group-item', href: '#', 'data-appid': i } );
				
				var game = data.data[ i ];
				
				var name = game.name;
				
				if( game.installed )
				{
					name = '<b>' + name + '</b>';
				}
				else
				{
					name = '<i>' + name + ' (' + ( 0 | game.estimated_disk_bytes / 1000000 ) + ' MB)</i>';
				}
				
				link.html( name ).click( function( e )
				{
					e.preventDefault( );
					
					input.val( $( this ).data( 'appid' ) );
				} );
				
				list.append( link );
			}
			
			if( list.is( ':empty' ) )
			{
				list.append( $( '<span></span>', { class: 'list-group-item' } ).text( 'The list is empty :(' ) );
			}
		} );
	} );

	$( '.js-steam-space' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Space.Set( input.val() );
	} );

	$( '.js-steam-sequence' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Keyboard.Sequence( input.val() );
	} );

	$( '.js-steam-key' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Keyboard.Key( input.val() );
	} );

	$( '.js-steam-button' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Button.Press( $( this ).data( 'button' ) || input.val() );
	} );

	$( '.js-steam-games' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Games.Action( input.val(), 'run' );
	} );
}());
