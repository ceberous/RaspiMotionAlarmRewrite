import requests
import base64
import json

options = { "command": "publish_new_image_set" , "message": "new image set ready" }
#json_string = json.dumps( options )

data = {
  "command": "publish_new_image_set" , "message": "new image set ready"
}
response = requests.post( 'http://localhost:6161/python-script' , data=data )
print( response.text )