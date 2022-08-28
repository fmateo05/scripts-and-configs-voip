#!/bin/bash
from=${1}
to=${2}
msg=${3}

curl -s -u rabbit:rabbit01 -H "Content-Type:application/json" -X POST -d '{
    "vhost": "/",
    "name": "im",
    "properties": {
        "delivery_mode": 1,
        "headers": {},
	"content_type": "application/json"
    },
    "routing_key": "sms.inbound.*.*",
    "delivery_mode": 1,
    "payload":"'"{\\\"Event-Category\\\":\\\"sms\\\",\\\"Event-Name\\\":\\\"inbound\\\",\\\"Call-ID\\\":\\\"t@t\\\",\\\"Message-ID\\\":\\\"t@t\\\",\\\"Route-Type\\\":\\\"offnet\\\",\\\"Route-ID\\\":\\\"Kamailio@kamailio.\\\",\\\"From\\\":\\\"${from}\\\",\\\"To\\\":\\\"${to}\\\",\\\"Body\\\":\\\"${msg}\\\",\\\"Custom-SIP-Headers\\\":{},\\\"App-Name\\\":\\\"Test\\\",\\\"App-Version\\\":\\\"4.0\\\",\\\"Msg-ID\\\":\\\"8cdf1742b8864334a615f92333c40cb6\\\"}"'",
    "headers": {},
    "props": {   },
    "payload_encoding": "string"
}'   http://localhost:15672/api/exchanges/%2F/im/publish
