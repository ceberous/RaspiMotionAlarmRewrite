import websocket
import json
ws = websocket.WebSocket()
#ws.connect( "ws://127.0.0.1:6161" )
ws.connect( "ws://127.0.0.1:10080" )
#ws.send( "ping" )
ws.send( json.dumps( { "type": "pong" , "message": "this is a test remote REDIS WebSocket message" } ) )

#ws.send( json.dumps( { "type": "python-new-error" , "message": "this is a test error message" } ) )
#ws.send( json.dumps( { "type": "python-new-record" , "message": "MIN_MOTION_FRAMES >= 4" } ) )