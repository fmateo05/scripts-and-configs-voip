<?php
    header('content-type:application/json');
global $agent ;
global $arrlength ;

function queue($a){ 

global $agents ;
$agents = agents();
?>
	 {"module":"user"
   ,"data":{"id":"<?php echo $agents[$a]; ?>"}
   ,"children":{
	<?php   children()  ; ?>
     }
   }

<?php

           }
function children_continue(){
?> 
	"_":{
       "module":"pivot"
       ,"data":{"voice_url":"http://192.168.2.120:8089/pivot-queue-cc-1.php"}
     }

<?php
		}
function children_break(){
?>

"_":{
       "module":"play"
       ,"data":{"id":"http://192.168.2.120:8089/vm-not_available.wav"}
     }



<?php
}

function agents() {
$out['0'] = '7b19859f751adb5e225e9a98dda1178f';
$out['1'] = '0dcfc1e559a54917ef3de930dc3e0838';

return $out;


	}
function tst() {

$out['0'] = '0';
$out['1'] = '1';

return $out ;
	}



function children() {
$tst = tst();
$b = array_rand($tst);
if ($b == 1) {
   children_continue();

} else {
	children_break();
}
}




$agents = agents();

$test = array_rand($agents);
queue($test);

?>
