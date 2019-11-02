import threading
import numpy as np
import cv2
import sys
import os
import signal
import imutils
import json

from datetime import datetime , timedelta , time
from time import localtime, strftime , sleep
from pytz import timezone
eastern_tz = timezone( "US/Eastern" )

from twilio.rest import Client

# from websocket import create_connectio
import websocket
import threading

videoPath = os.path.abspath( os.path.join( __file__ , ".." , ".." , "videos" ) )
framePathBase = os.path.abspath( os.path.join( __file__ , ".." , ".." , "client" ) )
frameLiveImagePath = os.path.abspath( os.path.join( framePathBase , "frame.jpeg" ) )
frameDeltaLiveImagePath = os.path.abspath( os.path.join( framePathBase , "frameDelta.jpeg" ) )
frameThreshLiveImagePath = os.path.abspath( os.path.join( framePathBase , "frameThresh.jpeg" ) )

personal_file_path = os.path.abspath( os.path.join( os.path.expanduser( "~" ) , ".config" , "personal" , "raspi_motion_alarm_rewrite.json" ) )
print( personal_file_path )
with open( personal_file_path , 'r' ) as f:
		Personal = json.load( f )
print( Personal )

TwilioClient = Client( Personal[ 'twilio' ][ 'twilio_sid' ] , Personal[ 'twilio' ][ 'twilio_auth_token' ] )
ws = False

# ( 0 , 0 ) = TOP LEFT
# X = LEFT TO RIGHT
# Y = TOP TO BOTTOM
# [ y1:y2 , x1:x2 ]
# frame = frame[ 0:250 , 0:500 ]
DEFAULT_CLIPPING = { 'x': { '1': 0 , '2': 500 } , 'y': { '1': 0 , '2': 250 } }
LOADED_CLIPPING = DEFAULT_CLIPPING
# Personal[ 'camera' ][ 'clipping' ][ "y1" ]
# Personal[ 'camera' ][ 'clipping' ][ "y2" ]
# Personal[ 'camera' ][ 'clipping' ][ "x1" ]
# Personal[ 'camera' ][ 'clipping' ][ "x2" ]


def inside_message_time_window():
	result = True
	# window_hours = [ 22 , 23 , 24 , 0 , 1 , 2 ]
	# now = datetime.now( eastern_tz )
	# if now.hour in window_hours:
	#   if now.hour == 22:
	#       if now.minute >= 30:
	#           result = True
	#       else:
	#           result = False
	#   elif now.hour == 2:
	#       if now.minute <= 30:
	#           result = True
	#       else:
	#           result = False
	#   else:
	#       result = True
	return result

def ignore_extra_alert_call():
	result = False
	# ignore_hours = [ 22 , 23 , 24 , 0 , 1 ]
	# now = datetime.now( eastern_tz )
	# if now.hour in window_hours:
	#   result = True
	return result

def twilio_message( number , message ):
	try:
		if inside_message_time_window() == False:
			send_web_socket_message( "log" , "Outside SMS Alert Time Window" )
			return;
		message = TwilioClient.messages.create( number ,
			body=message ,
			from_=Personal[ 'twilio' ][ 'fromSMSNumber' ] ,
		)
		print( "sent sms" )
		send_web_socket_message( "log" , "Sent SMS to: " + str( number ) )
	except Exception as e:
		print ( e )
		print ( "failed to send sms" )
		broadcast_error( "failed to send sms" )

def send_web_socket_message( channel , message ):
	try:
		json_string = json.dumps( { "type": "python-script" , "channel": channel , "message": message } )
		print ( json_string )
		ws.send( json_string )
	except Exception as e:
		print( "Couldn't Send WebSocket Message" )

def broadcast_error( message ):
	send_web_socket_message( "errors" , message )

def broadcast_log( message ):
	send_web_socket_message( "events" , message )

def broadcast_record( message ):
	twilio_message( Personal[ 'twilio' ][ 'toSMSNumber' ] , message )
	#twilio_message( Personal[ 'twilio' ][ 'toSMSExtraNumber' ] , message ) # testing
	send_web_socket_message( "records" , message )

def broadcast_extra_record( message ):
	print( "Broadcasting Extra Event" )
	send_web_socket_message( "python-new-extra" , message )
	#twilio_message( Personal[ 'twilio' ][ 'toSMSNumber' ] , message )
	twilio_message( Personal[ 'twilio' ][ 'toSMSExtraNumber' ] , message )

def broadcast_video_ready( wTodayDateString , wEventNumber ):
	print( "Today Date String == " + wTodayDateString )
	print( "Current Event Number == " + wEventNumber )
	send_web_socket_message( "new-video" , wTodayDateString + "-" + wEventNumber )

def make_folder( path ):
	try:
		print( "Trying to Make Folder Path --> " )
		print( path )
		os.makedirs( path )
	except OSError as exception:
		pass
		#if exception.errno != errno.EEXIST:
			#raise

def twilio_call( number ):
	try:
		new_call = TwilioClient.calls.create( url=Personal[ 'twilio' ][ 'twilio_response_server_url' ] , to=Personal[ 'twilio' ][ 'toSMSExtraNumber' ] , from_=Personal[ 'twilio' ][ 'fromSMSNumber' ] , method="POST" )
	except Exception as e:
		print( e )
		print( "failed to make twilio call" )
		send_web_socket_message( "errors" , "Failed to Make Twilio Call to: " + str( number ) )

def update_loaded_clipping( options ):
	print( options )
	if 'reset' in options:
		if options[ 'reset' ] == True or options[ 'reset' ] == "true" or options[ 'reset' ] == "True":
			LOADED_CLIPPING = DEFAULT_CLIPPING
		send_web_socket_message( "log" , "LOADED_CLIPPING == DEFAULT_CLIPPING" )
		return
	if 'x' in options:
		if '1' in options[ 'x' ]:
			LOADED_CLIPPING[ 'x' ][ '1' ] = options[ 'x' ][ '1' ]
			send_web_socket_message( "log" , "LOADED_CLIPPING[ 'x' ][ '1' ] == " + str( options[ 'x' ][ '1' ] ) )
		if '2' in options[ 'x' ]:
			LOADED_CLIPPING[ 'x' ][ '2' ] = options[ 'x' ][ '2' ]
			send_web_socket_message( "log" , "LOADED_CLIPPING[ 'x' ][ '2' ] == " + str( options[ 'x' ][ '2' ] ) )
	if 'y' in options:
		if '1' in options[ 'y' ]:
			LOADED_CLIPPING[ 'y' ][ '1' ] = options[ 'y' ][ '1' ]
			send_web_socket_message( "log" , "LOADED_CLIPPING[ 'y' ][ '1' ] == " + str( options[ 'y' ][ '1' ] ) )
		if '2' in options[ 'y' ]:
			LOADED_CLIPPING[ 'y' ][ '2' ] = options[ 'y' ][ '2' ]
			send_web_socket_message( "log" , "LOADED_CLIPPING[ 'y' ][ '2' ] == " + str( options[ 'y' ][ '2' ] ) )


ws = False
def on_message( ws , message ):
	try:
		print message
		message = json.loads( message )
		if 'type' in message:
			if message[ 'type' ] == 'python-script-command':
				update_loaded_clipping( options )

	except Exception as e:
		print( e )
		print( "Failed to Parse WebSocket Message JSON")
		send_web_socket_message( "errors" , "Failed to Parse WebSocket Message JSON" )

def on_close( ws ):
	print( "### closed ###" )
	send_web_socket_message( "errors" , "WebSocket Connection Closed" )

try:
	#ws = create_connection( "ws://localhost:6161" )
	websocket.enableTrace( True )
	ws = websocket.WebSocketApp( "ws://localhost:6161" , on_message = on_message , on_close = on_close )
	wst = threading.Thread( target=ws.run_forever )
	wst.daemon = True
	wst.start()
except Exception as e:
	print( e )
	print( "failed to connect to websocket server" )


def signal_handler( signal , frame ):
	message_string = "motion_simple_rewrite_fixed.py closed , Signal = " + str( signal )
	print( message_string )
	broadcast_error( message_string )
	sys.exit( 0 )

signal.signal( signal.SIGABRT , signal_handler )
signal.signal( signal.SIGFPE , signal_handler )
signal.signal( signal.SIGILL , signal_handler )
signal.signal( signal.SIGSEGV , signal_handler )
signal.signal( signal.SIGTERM , signal_handler )
signal.signal( signal.SIGINT , signal_handler )

class TenvisVideo():

	def __init__( self ):

		broadcast_log( "python --> motionSave.py --> init()" )

		self.write_thread = None

		self.EVENT_TOTAL = -1
		self.EVENT_POOL = []
		self.ExtraAlertPool = [ datetime.now( eastern_tz ) - timedelta( minutes=59 ) ] * 8

		self.total_motion = 0
		self.video_index = 0
		self.last_email_time = None

		self.EMAIL_COOLOFF = 100
		#self.EMAIL_COOLOFF = 30

		#self.MIN_MOTION_FRAMES = 4
		self.MIN_MOTION_FRAMES = 2

		try:
			self.MIN_MOTION_SECONDS = int( sys.argv[1] )
			self.MOTION_EVENTS_ACCEPTABLE = int( sys.argv[2] )
			self.MAX_TIME_ACCEPTABLE = int( sys.argv[3] )
			self.MAX_TIME_ACCEPTABLE_STAGE_2 = int( sys.argv[4] )
		except:
			self.MIN_MOTION_SECONDS = 1
			self.MOTION_EVENTS_ACCEPTABLE = 4
			self.MAX_TIME_ACCEPTABLE = 45
			self.MAX_TIME_ACCEPTABLE_STAGE_2 = 90
		print ( "MIN_MOTION_SECONDS === " + str( self.MIN_MOTION_SECONDS ) )
		print ( "MOTION_EVENTS_ACCEPTABLE === " + str( self.MOTION_EVENTS_ACCEPTABLE ) )
		print ( "MAX_TIME_ACCEPTABLE === " + str( self.MAX_TIME_ACCEPTABLE ) )
		print ( "MAX_TIME_ACCEPTABLE_STAGE_2 === " + str( self.MAX_TIME_ACCEPTABLE_STAGE_2 ) )

		# Start
		if 'opencv' in Personal:
			if 'clipping' in Personal[ 'opencv' ]:
				update_loaded_clipping( Personal[ 'opencv'][ 'clipping' ] )
		self.w_Capture = cv2.VideoCapture( 0 )
		self.motionTracking()

	def cleanup( self ):
		self.w_Capture.release()
		cv2.destroyAllWindows()
		broadcast_log( "motion_simple_rewrite_fixed.py --> cleanup()" )
		ws.close()

	def motionTracking( self ):

		avg = None
		firstFrame = None

		min_area = 500
		delta_thresh = 5

		motionCounter = 0

		while( self.w_Capture.isOpened() ):

			( grabbed , frame ) = self.w_Capture.read()

			if not grabbed:
				broadcast_error( "Can't Connect to PI Camera" )
				sleep( 1 )
				break

			frame = imutils.resize( frame , width = 500 )


			# Need to Add Check from
			# Personal[ 'camera' ][ 'clipping' ][ "y1" ]
			# Personal[ 'camera' ][ 'clipping' ][ "y2" ]
			# Personal[ 'camera' ][ 'clipping' ][ "x1" ]
			# Personal[ 'camera' ][ 'clipping' ][ "x2" ]

			# And then Check from WebSocket to Adjust 'otf'

			#temp adjustment for rando corners
			# (0,0) = TOP LEFT
			# X = LEFT TO RIGHT
			# Y = TOP TO BOTTOM
			# [ y1:y2 , x1:x2 ]
			#frame = frame[ 0:250 , 0:500 ]
			frame = frame[ LOADED_CLIPPING[ 'y' ][ '1' ]:LOADED_CLIPPING[ 'y' ][ '2' ] , LOADED_CLIPPING[ 'x' ][ '1' ]:LOADED_CLIPPING[ 'x' ][ '2' ] ]

			# https://stackoverflow.com/questions/39622281/capture-one-frame-from-a-video-file-after-every-10-seconds
			cv2.imwrite( frameLiveImagePath , frame )
			sleep( .1 )

			if self.last_email_time is not None:
				wNow = datetime.now( eastern_tz )
				self.nowString = wNow.strftime( "%Y-%m-%d %H:%M:%S" )
				self.elapsedTimeFromLastEmail = int( ( wNow - self.last_email_time ).total_seconds() )
				if self.elapsedTimeFromLastEmail < self.EMAIL_COOLOFF:
					#print "sleeping"
					pass
				else:
					broadcast_log( "done sleeping" )
					self.last_email_time = None
				continue

			gray = cv2.cvtColor( frame , cv2.COLOR_BGR2GRAY )
			gray = cv2.GaussianBlur( gray , ( 21 , 21 ) , 0 )

			if firstFrame is None:
				firstFrame = gray
				continue

			if avg is None:
				avg = gray.copy().astype( "float" )
				continue

			cv2.accumulateWeighted( gray , avg , 0.5 )
			frameDelta = cv2.absdiff( gray , cv2.convertScaleAbs(avg) )

			thresh = cv2.threshold( frameDelta , delta_thresh , 255 , cv2.THRESH_BINARY )[ 1 ]
			thresh = cv2.dilate( thresh , None , iterations=2 )

			# Search for Movment
			( cnts , _ ) = cv2.findContours( thresh.copy() , cv2.RETR_EXTERNAL , cv2.CHAIN_APPROX_SIMPLE )
			for c in cnts:
				if cv2.contourArea( c ) < min_area:
					motionCounter = 0 # ???
					continue
				# wNow = datetime.now( eastern_tz )
				# self.nowString = wNow.strftime( "%Y-%m-%d %H:%M:%S" )
				motionCounter += 1

			# If Movement Is Greater than Threshold , create motion record
			if motionCounter >= self.MIN_MOTION_FRAMES:
				wNow = datetime.now( eastern_tz )
				self.nowString = wNow.strftime( "%Y-%m-%d %H:%M:%S" )
				broadcast_log( "Motion Counter: " + str( motionCounter ) + " > MIN_MOTION_FRAMES" )
				#print "setting new motion record"

				# Check if this is "fresh" in a series of new motion records
				if len( self.EVENT_POOL ) > 1:
					wElapsedTime_x = int( ( self.EVENT_POOL[ -1 ] - self.EVENT_POOL[ -2 ] ).total_seconds() )
					if wElapsedTime_x > ( self.MAX_TIME_ACCEPTABLE_STAGE_2 * 2 ):
						broadcast_log( "Not Fresh , Resetting to 1st Event === " + str( wElapsedTime_x ) )
						self.EVENT_POOL = []
						self.total_motion = 0

				self.EVENT_POOL.append( wNow )
				if len( self.EVENT_POOL ) > 10:
					self.EVENT_POOL.pop( 0 )
				motionCounter = 0
				self.total_motion += 1

			# Once Total Motion Events Reach Threshold , create alert if timing conditions are met
			if self.total_motion >= self.MOTION_EVENTS_ACCEPTABLE:
				broadcast_log( "Total Motion: " + str( self.total_motion ) + ">= " + str( self.MOTION_EVENTS_ACCEPTABLE ) + " Motion Events Acceptable" )
				self.total_motion = 0
				cv2.imwrite( frameThreshLiveImagePath , thresh )
				cv2.imwrite( frameDeltaLiveImagePath , frameDelta )
				send_web_socket_message( "save-current-image-set" , "saving current image set" )
				wNeedToAlert = False

				# Condition 1.) Check Elapsed Time Between Last 2 Motion Events
				wElapsedTime_1 = int( ( self.EVENT_POOL[ -1 ] - self.EVENT_POOL[ 0 ] ).total_seconds() )
				if wElapsedTime_1 <= self.MAX_TIME_ACCEPTABLE:
					broadcast_log( "( Stage-1-Check ) === PASSED === Elapsed Time Between Previous 2 Events: " + str( wElapsedTime_1 ) + " <= " + str( self.MAX_TIME_ACCEPTABLE ) + " Maximum Time Acceptable" )
					wNeedToAlert = True

				# Condition 2.) Check if there are multiple events in a greater window
				elif len( self.EVENT_POOL ) >= 3:
					wElapsedTime_2 = int( ( self.EVENT_POOL[ -1 ] - self.EVENT_POOL[ -3 ] ).total_seconds() )
					if wElapsedTime_2 <= self.MAX_TIME_ACCEPTABLE_STAGE_2:
						broadcast_log( "( Stage-2-Check ) === PASSED === Elapsed Time Between the First and Last Event in the Pool === " + str( wElapsedTime_2 ) + " which is >= " + str( sel.MAX_TIME_ACCEPTABLE_STAGE_2 ) + " seconds" )
						wNeedToAlert = True
					else:
						broadcast_log( "( Stage-2-Check ) === FAILED === Elapsed Time Between the First and Last Event in the Pool === " + str( wElapsedTime_2 ) + " which is <= " + str( sel.MAX_TIME_ACCEPTABLE_STAGE_2 ) + " seconds" )

				if wNeedToAlert == True:
					#print "ALERT !!!!"
					#wNowString = self.EVENT_POOL[ -1 ].strftime( "%Y-%m-%d %H:%M:%S" )
					#wTimeMsg = "Motion @@ " + wNowString
					broadcast_record( "MOTION" )
					self.last_email_time = self.EVENT_POOL[ -1 ]
					self.EVENT_POOL = []

					self.WRITING_EVENT_FRAMES = True
					self.FRAME_EVENT_COUNT = 0
					self.EVENT_TOTAL += 1

					try:
						self.ExtraAlertPool.insert( 0 , self.last_email_time )
						self.ExtraAlertPool.pop()
						num_records_in_10_minutes = 0
						num_records_in_20_minutes = 0
						num_records_in_30_minutes = 0
						for i , record in enumerate( self.ExtraAlertPool ):
							time_diff = int( ( self.last_email_time - record ).total_seconds() )
							if time_diff < 1800:
								num_records_in_30_minutes = num_records_in_30_minutes + 1
							if time_diff < 1200:
								num_records_in_20_minutes = num_records_in_20_minutes + 1
							if time_diff < 600:
								num_records_in_10_minutes = num_records_in_10_minutes + 1

						if num_records_in_10_minutes >= 2:
							wS1 = wNowString + " @@ " + str( num_records_in_10_minutes ) + " Records in 10 Minutes"
							broadcast_extra_record( wS1 )
							broadcast_log( "Messaging ExtraEventNumber because Number of Records in 10 Minutes === " + str( num_records_in_10_minutes ) + " which is >= 2" )
						if num_records_in_20_minutes >= 3:
							#if ignore_extra_alert_call() == False:
							print( "3 or More Records in 20 Minutes , making Twilio Call To ExtraEventNumber" )
							twilio_call( Personal[ 'twilio' ][ 'toSMSExtraNumber' ] )
							broadcast_log( "Calling ExtraEventNumber because Number of Records in 20 Minutes === " + str( num_records_in_20_minutes ) + " which is >= 3" )
							self.ExtraAlertPool = [ datetime.now( eastern_tz ) - timedelta( minutes=59 ) ] * 8
						if num_records_in_30_minutes >= 7:
							self.ExtraAlertPool = [ datetime.now( eastern_tz ) - timedelta( minutes=59 ) ] * 8
							#voice_call_dad()
						if num_records_in_30_minutes >= 9:
							self.ExtraAlertPool = [ datetime.now( eastern_tz ) - timedelta( minutes=59 ) ] * 8
							#voice_call_house()
					except Exception as e:
						print( "failed to process extra events que" )
						broadcast_error( "failed to process extra events que" )
						broadcast_error( e )


			# cv2.imwrite( frameThreshLiveImagePath , thresh )
			# cv2.imwrite( frameDeltaLiveImagePath , frameDelta )

			#cv2.imshow( "frame" , frame )
			#cv2.imshow( "Thresh" , thresh )
			#cv2.imshow( "Frame Delta" , frameDelta )
			#if cv2.waitKey( 1 ) & 0xFF == ord( "q" ):
				#break

		self.cleanup()

TenvisVideo()