/*
	"CRemoteControlHTTPReqStatic",      ".*", "GET",      "/static/(.*)"
	"CRemoteControlHTTPReqButtonPress", ".*", "POST",     "/steam/button/([^/]*)/*"
	"CRemoteControlHTTPReqKeyboard",    ".*", "POST",     "/steam/keyboard/([^/]*)/*"
	"CRemoteControlHTTPReqMouse",       ".*", "POST",     "/steam/mouse/([^/]*)/*"
	"CRemoteControlHTTPReqGames",       ".*", "GET",      "/steam/games/*"
	"CRemoteControlHTTPReqGameAction",  ".*", "POST",     "/steam/games/(\\d+)/([^/]*)"
	"CRemoteControlHTTPReqSpace",       ".*", "POST|GET", "/steam/space/*"
	"CRemoteControlHTTPReqAuthorized",  ".*", "GET",      "/steam/authorized/*"
*/

var SteamRemoteClient =
{
	Address: location.protocol + '//' + location.host + '/steam/',
	DeviceName: 'SteamDB Remote Control',
	DeviceToken: 'PraiseLordGaben',
	RequestDelay: 0, // Set this to 2000 to delay all requests for 2 seconds
	AlertTimeout: 0,
	
	Keyboard:
	{
		Sequence: function( sequence )
		{
			SteamRemoteClient.DoPOST( 'keyboard/sequence/', { sequence: sequence } );
		},
		
		Key: function( name )
		{
			SteamRemoteClient.DoPOST( 'keyboard/key/', { name: name } );
		}
	},
	
	Button:
	{
		Press: function( button )
		{
			SteamRemoteClient.DoPOST( 'button/' + button + '/' );
		}
	},
	
	Games:
	{
		Index: function( callback )
		{
			SteamRemoteClient.DoGET( 'games/', {}, callback );
		},
		
		Action: function( appid, action )
		{
			SteamRemoteClient.DoPOST( 'games/' + appid + '/' + action );
		}
	},
	
	Space:
	{
		Current: function( callback )
		{
			SteamRemoteClient.DoGET( 'space/', {}, callback );
		},
		
		Set: function( space )
		{
			SteamRemoteClient.DoPOST( 'space/', { name: space } ); // Known spaces: webbrowser, library, friends
		}
	},
	
	DoGET: function( url, additionalParameters, callback )
	{
		if( SteamRemoteClient.RequestDelay > 0 )
		{
			setTimeout( SteamRemoteClient._DoGET, SteamRemoteClient.RequestDelay, url, additionalParameters, callback );
		}
		else
		{
			SteamRemoteClient._DoGET( url, additionalParameters, callback );
		}
	},
	
	DoPOST: function( url, additionalParameters )
	{
		if( SteamRemoteClient.RequestDelay > 0 )
		{
			setTimeout( SteamRemoteClient._DoPOST, SteamRemoteClient.RequestDelay, url, additionalParameters );
		}
		else
		{
			SteamRemoteClient._DoPOST( url, additionalParameters );
		}
	},
	
	_DoGET: function( url, additionalParameters, callback )
	{
		var data = jQuery.extend(
		{
			device_name: SteamRemoteClient.DeviceName,
			device_token: SteamRemoteClient.DeviceToken
		}, additionalParameters );
		
		jQuery.ajax( {
			url: SteamRemoteClient.Address + url,
			data: data,
			method: 'GET',
			dataType: 'json',
			timeout: 5000,
			success: function( response )
			{
				SteamRemoteClient.ShowAlert( 'success', '<b>Request Executed:</b> /' + url, data );
				
				if( typeof callback === 'function' )
				{
					callback( response );
				}
			},
			error: function( )
			{
				SteamRemoteClient.ShowAlert( 'danger', '<b>Request Failed:</b> /' + url, data );
			}
		} );
	},
	
	_DoPOST: function( url, additionalParameters )
	{
		var data = jQuery.extend(
		{
			device_name: SteamRemoteClient.DeviceName,
			device_token: SteamRemoteClient.DeviceToken
		}, additionalParameters );
		
		jQuery.ajax( {
			url: SteamRemoteClient.Address + url,
			data: data,
			method: 'POST',
			dataType: 'json',
			timeout: 5000,
			success: function( )
			{
				SteamRemoteClient.ShowAlert( 'success', '<b>Request Executed:</b> /steam/' + url, data );
			},
			error: function( )
			{
				SteamRemoteClient.ShowAlert( 'danger', '<b>Request Failed:</b> /steam/' + url, data );
			}
		} );
	},
	
	ShowAlert: function( cssClass, text, data )
	{
		$( '.alert' )
			.removeClass( 'alert-' + ( cssClass === 'success' ? 'danger' : 'success' ) )
			.addClass( 'alert-' + cssClass + ' in' )
			.find( '.title' )
			.html( text )
			.end( )
			.find( '.data' )
			.text( data ? JSON.stringify( data ) : 'No payload.' );
		
		clearInterval( SteamRemoteClient.AlertTimeout );
		
		SteamRemoteClient.AlertTimeout = setTimeout( function( )
		{
			$( '.alert' ).removeClass( 'in' );
		}, 2500 );
	}
};
