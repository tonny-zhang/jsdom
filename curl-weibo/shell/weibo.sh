#/bin/bash

RESULT_PATH=/home/sam/nodejs/jsdom/curl-weibo/weibo
# mk result path
mkdir -p $RESULT_PATH
# run curl weibo
/usr/local/bin/node /home/sam/nodejs/jsdom/curl-weibo/weibo.js

# rsync result html to target server
su - sam << EOF
/usr/bin/rsync -WPaz -e 'ssh -p 2222' $RESULT_PATH/ sam@61.4.185.211:/home/sam/www/newweather/htdocs/weibo/
EOF