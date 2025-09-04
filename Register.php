<?php
	$inData = getRequestInfo();
	
	$userId = $inData["userId"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $login = $inData["login"];
    $password = $inData["password"];
	
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		#Determine whether desired login name is available.
        $stmt = $conn->prepare("SELECT * FROM Users WHERE Login = ?");
        $stmt->bind_param("s", $login);
        $stmt->execute();
        $result = $stmt->get_result();
        $loginexists = mysqli_num_rows($result);
		$stmt->close();

        if($loginexists != 0){
            #Report login already exists to user.
            returnWithError("Login taken; please try another.");
        }else{
            #Prepare and send registration packet.
            $stmt = $conn->prepare("INSERT into Users (FirstName, LastName, Login, Password) VALUES(?, ?, ?, ?)");
		    $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
		    $stmt->execute();
		    $stmt->close();
		    $conn->close();
		    returnWithError("");
        }
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>