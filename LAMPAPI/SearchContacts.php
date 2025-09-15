
<?php

	$inData = getRequestInfo();

	$searchEntries = "";
    $searchSize = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?) AND userID = ?");
		$searchTerm = "%" . $inData["search"] . "%"; # "Contains"-style search via %.
        $stmt->bind_param('ss', $searchTerm, $userId);
		$stmt->execute();
		$result = $stmt->get_result();

        if($result->num_rows > 0)
        {
            while($row = $result->fetch_assoc())
            {
                # Iterative concatenation of search records.
                if($searchSize > 0){
                    $searchEntries = sprintf(',%s', $searchEntries);
                }
                $searchEntries = sprintf 
                (
                    '%s{
                    "ID": "%s",
                    "FirstName": "%s",
                    "LastName": "%s",
                    "Phone": "%s",
                    "Email": "%s",
                    "UserID": "%s"
                    }',
                    $searchEntries, $row["ID"], $row["FirstName"], $row["LastName"], $row["Phone"], $row["Email"], $row["UserID"]
                );
                $searchSize++;
            }
        }
		if($searchSize != 0)
		{
			returnWithInfo($searchEntries);
		}
		else
		{
			returnWithError("No Contacts Found");
		}

		$stmt->close();
		$conn->close();
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
		$retValue = '{"entries":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchEntries )
	{
		$retValue = '{"entries": [' . $searchEntries . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
