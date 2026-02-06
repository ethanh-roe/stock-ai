This is the FastAPI Backend used for our REST API.
Right now, it takes a little bit of work to run; this will likely change once it's running on the actual server.

SSH Tunnel
	In order to run, you will first need to create an SSH tunnel to the server in a separate command line window:
		ssh -L 3307:localhost:3306 your_username@coms-4020-029.class.las.iastate.edu
	use NetID username & password
	Keep this window open so the tunnel remains open; the app is using it to connect.

To run the FastAPI app itself:
	In command line, navigate to backend/FastAPI

	Build / Rebuild virtual environment, if needed:
		Clear old venv
			Windows: rmdir /s /q venv
			Linux:   rm -rf venv
		Create new
			Windows: python -m venv venv
			Linux:   python3 -m venv venv

	To start virtual environment:
		Windows:  venv\Scripts\activate
		Linux:    source venv/bin/activate
		pip install -r requirements.txt

	To save new dependencies:
		pip freeze  > requirements.txt

	To run app in virtual environment:
		uvicorn app.main:app --reload
	
	FastAPI should now be running.
	If you want to check, you can go to http://LOCALHOST:8000/docs