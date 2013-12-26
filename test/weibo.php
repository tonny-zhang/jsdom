<?php
 
class Sina_Proxy {
 
    private $app_ids = array(
        'weichengshi' => '1485301852'
    );
 
    private $_statistics_path;
 
    /**
     *
     * @param string $url
     * @param array $post_data
     * @return string/array/int/boolean
     */
    private function wget($url, $post_data = '') {
        $data = '';
 
        $ch = curl_init();
        $option = array(
            CURLOPT_URL            => $url,
            CURLOPT_HEADER         => 0,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_COOKIEJAR      => $this->_statistics_path . 'cookie.log',
            CURLOPT_COOKIEFILE     => $this->_statistics_path . 'cookie.log'
        );
 
        if ($post_data) {
            $option[CURLOPT_POST] = 1;
            $option[CURLOPT_POSTFIELDS] = $post_data;
        }
        curl_setopt_array($ch, $option);
        $data = curl_exec($ch);
        curl_close($ch);
 
        return $data;
    }
 
    /**
     *
     * @param string $statistics_path
     */
    public function set_statistics_path($statistics_path) {
        $this->_statistics_path = $statistics_path ? $statistics_path : '/var/log/';
    }
 
    /**
     *
     * @param string $username
     * @param string $password
     */
    public function login($username, $password) {
        $prelogin_data = $this->wget("http://login.sina.com.cn/sso/prelogin.php?entry=weibo&callback=sinaSSOController.preloginCallBack&su=" . base64_encode($username) . "&client=ssologin.js(v1.3.16)");
        echo "http://login.sina.com.cn/sso/prelogin.php?entry=weibo&callback=sinaSSOController.preloginCallBack&su=" . base64_encode($username) . "&client=ssologin.js(v1.3.16)";
        if ($prelogin_data) {
            $prelogin_data = @json_decode(substr($prelogin_data, 35, -1), true);
            if (is_array($prelogin_data)
                    && isset($prelogin_data['retcode'])
                    && isset($prelogin_data['servertime'])
                    && isset($prelogin_data['nonce'])
                    && $prelogin_data['servertime']
                    && $prelogin_data['nonce']
                    && 0 == $prelogin_data['retcode']) {
                //NODO
            } else {
                die(date("Y-m-d H:i:s") . "|error prelogin data\n");
            }
        } else {
            die(date("Y-m-d H:i:s") . "|error wget prelogin\n");
        }
 
        $post_data = array(
            'entry'          => 'weibo',
            'gateway'        => 1,
            'from'           => '',
            'savestate'      => 7,
            'useticket'      => 1,
            'ssosimplelogin' => 1,
            'su'             => base64_encode($username),
            'service'        => 'miniblog',
            'servertime'     => $prelogin_data['servertime'],
            'nonce'          => $prelogin_data['nonce'],
            'pwencode'       => 'wsse',
            'sp'             => sha1(sha1(sha1($password)) . $prelogin_data['servertime'] . $prelogin_data['nonce']),
            'encoding'       => 'UTF-8',
            'url'            => 'http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack',
            'returntype'     => 'META'
        );
 
        $login_response = $this->wget('http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.3.16)', $post_data);
        if (empty($login_response)) {
            die(date("Y-m-d H:i:s") . "|login failured\n");
        }    
    var_dump($login_response);
        preg_match("/replace\(\'(.*?)\'\)/", $login_response, $matches);
        if ($matches && isset($matches[1])) {
            $this->wget($matches[1]);
            $logs = '';
            foreach ($this->app_ids as $app_name => $app_id) {
                $player_count = 0;
                $resposne = $this->wget('http://game.weibo.com/home/game?appId=' . $app_id);
                if ($resposne) {
                    preg_match("/<p>有多少人在玩：(.*?)<\/p>/", $resposne, $matches);
                    if ($matches && isset($matches[1])) {
                        $player_count = $matches[1];
                    }
                }
                echo date('Y-m-d H:i:s') . "|success|" . $app_name . "|" . $player_count . "\n";
                $logs .= date("Y-m-d H:i:s") . "|" . $app_name . "|" .  $player_count . "\n";
            }
            if ($logs) {
                file_put_contents($this->_statistics_path. 'statistics_' . date('Y-m-d') . '.log', $logs, FILE_APPEND);
            }
        } else {
            die(date("Y-m-d H:i:s") . "|get cookie failured\n");
        }
    }
}
 
$sina_proxy_handle = new Sina_Proxy();
$sina_proxy_handle->set_statistics_path('/data/taskCron/tasklist/');
$sina_proxy_handle->login('wodexintiao@sina.com', '1988221');//注意账号 = urlencode(微博账号)
?>