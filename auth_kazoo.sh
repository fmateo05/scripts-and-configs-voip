#!/bin/bash
USER="$1"
PASS="$2"
ACC="$3"
IPADDR="$4"

CREDS="`echo -n $USER:$PASS | md5sum | awk '{print $1}'`"

DATA='"{"data":{"credentials": "$CREDS", "account_name": "$ACC", "method": "md5" }}"'

curl  -X PUT     -H "Content-Type: application/json"     -d $DATA     http://${IPADDR}:8000/v2/user_auth | python -m json.tool

echo $DATA
