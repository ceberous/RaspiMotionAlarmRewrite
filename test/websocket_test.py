import websocket
import json
ws = websocket.WebSocket()

# ws.connect( "ws://127.0.0.1:10080" ) # websocket server
# ws.send( json.dumps( { "type": "pong" , "message": "this is a test remote REDIS WebSocket message" } ) )

ws.connect( "ws://127.0.0.1:6161" ) # actual redis connection
ws.send( json.dumps( { "type": "python-new-error" , "message": "this is a test error message" } ) )


#ws.send( json.dumps( { "type": "python-new-error" , "message": "this is a test error message" } ) )
# ws.send( json.dumps( { "type": "python-new-record" , "message": "MIN_MOTION_FRAMES >= 1" } ) )
# ws.send( json.dumps( { "type": "python-new-record" , "message": "MIN_MOTION_FRAMES >= 2" } ) )
# ws.send( json.dumps( { "type": "python-new-record" , "message": "MIN_MOTION_FRAMES >= 3" } ) )
# ws.send( json.dumps( { "type": "python-new-record" , "message": "MIN_MOTION_FRAMES >= 4" } ) )
# ws.send( json.dumps( { "type": "python-new-record" , "message": "MIN_MOTION_FRAMES >= 5" } ) )