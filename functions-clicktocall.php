function shortcode_c2c() {
?>
<html>
<head>
  <meta charset="utf-8">
  <title> ¡¡Te llamamos gratis!! </title>
  <link rel="stylesheet" href="https://www.aurus.com.do/build/css/intlTelInput.css">
  <link rel="stylesheet" href="https://www.aurus.com.do/build/css/demo.css">
</head>

<body>
	
  <h1> </h1>
  <form>
    <input class="center-block" id="phone" name="phone" type="tel">
    <!--<button type="submit" >Iniciar Llamada </button>-->
	<!--<button type="submit" >Iniciar Llamada</button>-->
  </form>
<script src="https://www.aurus.com.do/js/jquery-1.11.0.js"></script>
<script src="https://www.aurus.com.do/js/contact_me.js"></script>	
	<script src="https://www.aurus.com.do/js/custom_1.js"></script>	
  <script src="https://www.aurus.com.do/build/js/intlTelInput.js"></script>
 <script src="https://www.aurus.com.do/js/jqBootstrapValidation.js"></script>
<script src="https://www.aurus.com.do/js/custom_1.js"></script> 
	
<script>
    document.getElementById("phone").onkeyup = function() {myFunction()};	
	
function myFunction() {
  // var params = document.getElementById("fname");
data = new FormData();
data.append("phone", $('#phone').val());
  $.ajax({
            data: data,
            type: "POST",
            url: "https://www.aurus.com.do/contact_me.php",
            cache: false,
            contentType: false,
            processData: false,
            success: function(url) {
                 $('#success').html("<div class='alert alert-success'>");
            }
        });
}
	  	  
	  var input = document.querySelector("#phone");
    window.intlTelInput(input, {
      allowDropdown: true,
      autoHideDialCode: false,
      // autoPlaceholder: "off",
      dropdownContainer: document.body,
      // excludeCountries: ["us"],
       formatOnDisplay: false,
      geoIpLookup: function(callback) {
         $.get("https://ipinfo.io", function() {}, "jsonp").always(function(resp) {
           var countryCode = (resp && resp.country) ? resp.country : "";
           callback(countryCode);
         });
       },
      hiddenInput: "full_number",
      initialCountry: "auto",
      // localizedCountries: { 'de': 'Deutschland' },
      nationalMode: false,
      onlyCountries: ['us','do'],
       placeholderNumberType: "MOBILE",
      // preferredCountries: ['cn', 'jp'],
      separateDialCode: true,
      utilsScript: "https://www.aurus.com.do/build/js/utils.js",
    });
  </script>
</body>

</html>
<?php
}
add_shortcode('c2c', 'shortcode_c2c');
