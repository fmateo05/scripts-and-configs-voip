<?php
 


//$creds = shell_exec($gen_creds);
function get_data($acco,$crede) {

//$gen_creds = "echo -n" . $arguments['u'] . ':' . $arguments['p'] . '  ' . '|' . 'md5sum | cut -d" " -f1'; 
//$creds = shell_exec(rtrim($gen_creds));
//echo $creds;
    
$var = '{ "data": { "account_name":' . '"' . "$acco" . '"' . ',' . '"' . "credentials"  . '"' . ':' . '"' . trim($crede) . '"' . ',' . '"' . "method" .  '"' .  ':' . '"' . "md5" . '"' . '}' . '}';

return $var;

     
 
} 

function add_user($firstname,$lastname,$extuser,$extpass) {

//$gen_creds = "echo -n" . $arguments['u'] . ':' . $arguments['p'] . '  ' . '|' . 'md5sum | cut -d" " -f1'; 
//$creds = shell_exec(rtrim($gen_creds));
//echo $creds;
    
$var_dev = '{"data":{"first_name": ' .  '"' . $firstname . '"' . "," . '"' . "last_name" . '"' . ':' . '"' .  "$lastname" . '"'  . ',' . '"' .  "username" . '"' . ':' . '"' . $extuser . '"' . ',' . '"' . "password" . '"' . ":" . '"' . $extpass . '"' . '}'. '}';

return $var_dev;

     
 
} 



//$character = json_decode($data);

//$curl = 'curl -v -X PUT     -H  "Content-Type: application/json" -d' . '  ' . "'" .  $data . "'" . '    ' . "http://$url:8000/v2/user_auth/" . '   ' ;

//shell_exec(trim($curl));






// $curl = 'curl -v -X PUT     -H' . "Content-Type: application/json"   . ' ' .  '-'   . 'd' . ' ' . "'" . '{' . '"' . 'data' . '"' . ':' . '{' . '"' . 'credentials' . '"' . ':' . $creds .  ',' .  '"' . 'account_name' . '"' . ':' .  '"' . $account .  '"' .  ',' .  '"' . 'method' . '"' .  ':' .  '"' . 'md5' . '"' .  '}' . '}' . "'" .  '  ' .   'http' . ':' . '/' . '/' . $ipaddr . ':' . '8000' . '/' . 'v2' . '/' . 'user_auth' .  ' ' . '|' . ' '  .  'python' . '  ' .  '-' . 'm' .  'json.tool' ;

$row = 3;
function read_csv($file){
if (($handle = fopen($file, "r")) !== FALSE) {
  while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    $num = count($data);
    //echo "<p> $num fields in line $row: <br /></p>\n";
    $row++;
    for ($c=0; $c < $num; $c++) {
       //echo $data[$c] . ' ';// "<br />\n";
       return $data[$c];
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

$arguments = getopt("u:p:a:i:d:c:");
$acc = rtrim($arguments['a']);
$accrtr = implode(" ", $arguments['a']);
//print_r($arguments);

$gen_creds = "echo -n " . $arguments['u'] . ':' . $arguments['p'] . '  ' . '|' . 'md5sum | cut -d" " -f1'; 
$creds = shell_exec($gen_creds);
$user_auth = 'http://' . $arguments['i'] . ':8000/v2/user_auth/';

$test = get_data($acc,$creds);
//
//print $data;
//    

 
 
 
 



exec('curl  -X PUT -H "Content-Type: application/json"' . '  ' . '-d' . '  ' . "'". $test . "'". "   " . $user_auth . '|' . 'python -mjson.tool',$output);
//shell_exec($cmd);
// print_r($output);
$token = trim(substr($output[1],19,-2));
$acc_id = trim(substr($output[3],23,-2));
print($acc_id);
print($token);
//echo $cmd1;

$user_account = 'http://' . $arguments['i'] . ':8000/v2/accounts/' . $acc_id . '/users';   

$csvarr = array_map('str_getcsv', file($arguments['c']));

 $result = print_r($csvarr);
$cnt = count($csvarr);
for ($a =0; $a < $cnt ; $a++) {
 
 exec('curl  -X PUT -H "Content-Type: application/json" -H "X-Auth-Token:' . ' '. $token . '"' . ' ' . '-d ' . "'" .  add_user($csvarr[$a][0],$csvarr[$a][1],$csvarr[$a][2],$csvarr[$a][3]) . "'" . '  ' . $user_account . '|' . 'python -mjson.tool',$outfor);
 // echo 'curl  -X PUT -H "Content-Type: application/json" -H "X-Auth-Token:' . ' '. $token . '"' . ' ' . '-d ' . "'" .  add_user($csvarr[$a][0],$csvarr[$a][1],$csvarr[$a][2],$csvarr[$a][3]) . "'" . '  ' . $user_account . '|' . 'python -mjson.tool';
 print_r($outfor);
}