<?php
 


//$creds = shell_exec($gen_creds);
function get_data($acco,$crede) {

//$gen_creds = "echo -n" . $arguments['u'] . ':' . $arguments['p'] . '  ' . '|' . 'md5sum | cut -d" " -f1'; 
//$creds = shell_exec(rtrim($gen_creds));
//echo $creds;
    
$var = '{ "data": { "account_name":' . '"' . "$acco" . '"' . ',' . '"' . "credentials"  . '"' . ':' . '"' . trim($crede) . '"' . ',' . '"' . "method" .  '"' .  ':' . '"' . "md5" . '"' . '}' . '}';

return $var;

     
 
} 

//$character = json_decode($data);

//$curl = 'curl -v -X PUT     -H  "Content-Type: application/json" -d' . '  ' . "'" .  $data . "'" . '    ' . "http://$url:8000/v2/user_auth/" . '   ' ;

//shell_exec(trim($curl));






// $curl = 'curl -v -X PUT     -H' . "Content-Type: application/json"   . ' ' .  '-'   . 'd' . ' ' . "'" . '{' . '"' . 'data' . '"' . ':' . '{' . '"' . 'credentials' . '"' . ':' . $creds .  ',' .  '"' . 'account_name' . '"' . ':' .  '"' . $account .  '"' .  ',' .  '"' . 'method' . '"' .  ':' .  '"' . 'md5' . '"' .  '}' . '}' . "'" .  '  ' .   'http' . ':' . '/' . '/' . $ipaddr . ':' . '8000' . '/' . 'v2' . '/' . 'user_auth' .  ' ' . '|' . ' '  .  'python' . '  ' .  '-' . 'm' .  'json.tool' ;

$row = 3;
function read_csv(){
if (($handle = fopen($argv[1], "r")) !== FALSE) {
  while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    $num = count($data);
    echo "<p> $num fields in line $row: <br /></p>\n";
    $row++;
    for ($c=0; $c < $num; $c++) {
 //       echo $data[$c] . "<br />\n";
    }
  }
  fclose($handle);
}
}


//$arguments = getopt("u:p:a:i:");
//
//$accrtr = implode(" ", $arguments);
//print_r($arguments);
//

//echo $creds;

$arguments = getopt("u:p:a:i:");
$acc = rtrim($arguments['a']);
$accrtr = implode(" ", $arguments['a']);
print_r($arguments);

$gen_creds = "echo -n " . $arguments['u'] . ':' . $arguments['p'] . '  ' . '|' . 'md5sum | cut -d" " -f1'; 
$creds = shell_exec($gen_creds);
$user_auth = 'http://' . $arguments['i'] . ':8000/v2/user_auth/';

$test = get_data($acc,$creds);
//
//print $data;
//    

 
 
 
 



$cmd='curl -v -X PUT -H "Content-Type: application/json"' . '  ' . '-d' . '  ' . "'". $test . "'". "   " . $user_auth;
shell_exec($cmd);
echo $cmd;
echo $gen_creds;