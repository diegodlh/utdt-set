<?php
if ($_SERVER['REQUEST_METHOD']=='POST') {
	$filename = $_POST["filename"];
	$name = "..data/$filename";

	if (move_uploaded_file($_FILES["blob"]["tmp_name"], $name)) {
   		http_response_code(200);
	} else {
		http_response_code(500);
	}
}
?>