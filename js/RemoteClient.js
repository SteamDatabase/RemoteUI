/*
	"CRemoteControlHTTPReqStatic"       ".*" "GET"        "/static/(.*)"
	"CRemoteControlHTTPReqButtonPress"  ".*" "POST"       "/steam/(?:v1/)?button/([^/]*)/*"
	"CRemoteControlHTTPReqKeyboard"     ".*" "POST"       "/steam/(?:v1/)?keyboard/([^/]*)/*"
	"CRemoteControlHTTPReqMouse"        ".*" "POST"       "/steam/(?:v1/)?mouse/([^/]*)/*"
	"CRemoteControlHTTPReqGames"        ".*" "GET"        "/steam/(?:v1/)?games/*"
	"CRemoteControlHTTPReqGameAction"   ".*" "POST"       "/steam/(?:v1/)?games/(\\d+)/([^/]*)"
	"CRemoteControlHTTPReqSpace"        ".*" "POST|GET"   "/steam/(?:v1/)?space/*"
	"CRemoteControlHTTPReqAuthorized"   ".*" "POST|GET"   "/steam/(?:v1/)?authoriz(ed?|ation)/*"
	"CRemoteControlHTTPReqState"        ".*" "GET"        "/steam/(?:v1/)?state/*"
	"CRemoteControlHTTPReqUITenfoot"    ".*" "POST"       "/steam/(?:v1/)?ui/tenfoot/*"
	"CRemoteControlHTTPReqMusicAction"  ".*" "POST"       "/steam/(?:v1/)?music/(play|pause|next|previous)/*"
	"CRemoteControlHTTPReqMusicVolume"  ".*" "POST|GET"   "/steam/(?:v1/)?music/volume/*"
	"CRemoteControlHTTPReqMusicMode"    ".*" "POST|GET"   "/steam/(?:v1/)?music/mode/*"
	"CRemoteControlHTTPReqMusicInfo"    ".*" "GET"        "/steam/(?:v1/)?music/*"
	"CRCAPIReqStream"                   ".*" "POST"       "/steam/(?:v1/)?stream/*"
*/

var SteamRemoteClient =
{
	Address: location.protocol + '//' + location.host + '/steam/',
	DeviceToken: '',
	RequestDelay: 0, // Set this to 2000 to delay all requests for 2 seconds
	ShowAlerts: false, // Used by RemoteUI.html
	
	Authorize: function( deviceName, deviceToken, callback )
	{
		SteamRemoteClient.DeviceToken = deviceToken;
		SteamRemoteClient.DoPOST( 'authorization/', { device_name: deviceName }, callback );
	},
	
	State: function( callback )
	{
		// data: {"long_poll": +!firstPoll, "session_name": "playerControls"}
		SteamRemoteClient.DoGET( 'state/', { }, callback );
	},
	
	UI:
	{
		Tenfoot: function( callback )
		{
			SteamRemoteClient.DoPOST( 'ui/tenfoot/', {}, callback );
		}	
	},
	
	Keyboard:
	{
		Sequence: function( sequence, callback )
		{
			SteamRemoteClient.DoPOST( 'keyboard/sequence/', { sequence: sequence }, callback );
		},
		
		Key: function( name, callback )
		{
			SteamRemoteClient.DoPOST( 'keyboard/key/', { name: name }, callback );
		}
	},
	
	Mouse:
	{
		Move: function( delta_x, delta_y, callback )
		{
			SteamRemoteClient.DoPOST( 'mouse/move/', { delta_x: delta_x, delta_y: delta_y }, callback );
		},
		
		Click: function( button, callback )
		{
			SteamRemoteClient.DoPOST( 'mouse/click/', { button: button }, callback ); // Button: mouse_left, mouse_right
		}
	},
	
	Button:
	{
		Press: function( button, callback )
		{
			// TODO: state param, up/down buttons, timeout param
			SteamRemoteClient.DoPOST( 'button/' + button + '/', {}, callback );
		}
	},
	
	Games:
	{
		Get: function( callback )
		{
			SteamRemoteClient.DoGET( 'games/', {}, callback );
		},
		
		Run: function( appid, callback )
		{
			SteamRemoteClient.DoPOST( 'games/' + appid + '/run', {}, callback );
		}
	},
	
	Space:
	{
		Get: function( callback )
		{
			SteamRemoteClient.DoGET( 'space/', { }, callback );
		},
		
		Set: function( space, callback )
		{
			SteamRemoteClient.DoPOST( 'space/', { space: space }, callback ); // Known spaces: webbrowser, library, friends
		}
	},
	
	Music:
	{
		Get: function( callback )
		{
			SteamRemoteClient.DoGET( 'music/', { }, callback );
		},
		
		GetMode: function( callback )
		{
			SteamRemoteClient.DoGET( 'music/mode/', { }, callback );
		},
		
		SetMode: function( looped, shuffled, callback )
		{
			SteamRemoteClient.DoPOST( 'music/mode/', { looped: looped, shuffled: shuffled }, callback );
		},
		
		GetVolume: function( callback )
		{
			SteamRemoteClient.DoGET( 'music/volume/', { }, callback );
		},
		
		SetVolume: function( volume, callback )
		{
			SteamRemoteClient.DoPOST( 'music/volume/', { volume: volume }, callback );
		},
		
		Play: function( callback )
		{
			SteamRemoteClient.DoPOST( 'music/play/', { }, callback );
		},
		
		Pause: function( callback )
		{
			SteamRemoteClient.DoPOST( 'music/pause/', { }, callback );
		},
		
		Next: function( callback )
		{
			SteamRemoteClient.DoPOST( 'music/next/', { }, callback );
		},
		
		Previous: function( callback )
		{
			SteamRemoteClient.DoPOST( 'music/previous/', { }, callback );
		}
	},
	
	Stream: function( callback )
	{
		SteamRemoteClient.DoPOST( 'stream/', { }, callback );
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
	
	DoPOST: function( url, additionalParameters, callback )
	{
		if( SteamRemoteClient.RequestDelay > 0 )
		{
			setTimeout( SteamRemoteClient._DoPOST, SteamRemoteClient.RequestDelay, url, additionalParameters, callback );
		}
		else
		{
			SteamRemoteClient._DoPOST( url, additionalParameters, callback );
		}
	},
	
	_DoGET: function( url, additionalParameters, callback )
	{
		var data = jQuery.extend(
		{
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
				SteamRemoteClient.ShowAlert( 'success', '<b>Request Executed:</b> /steam/' + url, data, response );
				
				if( typeof callback === 'function' )
				{
					callback( response );
				}
			},
			error: function( response )
			{
				SteamRemoteClient.ShowAlert( 'danger', '<b>Request Failed:</b> /steam/' + url, data, response );
			}
		} );
	},
	
	_DoPOST: function( url, additionalParameters, callback )
	{
		var data = jQuery.extend(
		{
			device_token: SteamRemoteClient.DeviceToken
		}, additionalParameters );
		
		jQuery.ajax( {
			url: SteamRemoteClient.Address + url,
			data: data,
			method: 'POST',
			dataType: 'json',
			timeout: 5000,
			success: function( response )
			{
				SteamRemoteClient.ShowAlert( 'success', '<b>Request Executed:</b> /steam/' + url, data, response );
				
				if( typeof callback === 'function' )
				{
					callback( response );
				}
			},
			error: function( response )
			{
				SteamRemoteClient.ShowAlert( 'danger', '<b>Request Failed:</b> /steam/' + url, data, response );
			}
		} );
	},
	
	ShowAlert: function( cssClass, text, data, response )
	{
		if( !SteamRemoteClient.ShowAlerts )
		{
			return;
		}
		
		jQuery( '.alert' )
			.removeClass( 'alert-' + ( cssClass === 'success' ? 'danger' : 'success' ) )
			.addClass( 'alert-' + cssClass + ' in' )
			.find( '.title' )
			.html( text )
			.end( )
			.find( '.data' )
			.text( data ? JSON.stringify( data ) : 'No payload.' )
			.end( )
			.find( '.data-response' )
			.text( response ? SteamRemoteClient.Stringify( response ) : 'No response.' );
	},
	
	Stringify: function( input )
	{
		input = JSON.stringify( input );
		
		if( input.length > 150 )
		{
			input = input.substring( 0, 150 ) + '...';
		}
		
		return input;
	}
};
