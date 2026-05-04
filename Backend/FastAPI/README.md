This is the FastAPI Backend used for our REST API.


==== INSTRUCTIONS TO RUN ====
In command line, navigate to backend/FastAPI

Two ways to start the application:
1. Docker
	Build & run:
		Docker compose up --build

2. Podman
	Build: 
		sudo podman build -t myfastapi .
	Run Container:
		sudo podman run -d --name stock-ai-backend --env-file .env -p 8080:8080 myfastapi

2. Python virtual environment
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
		pip install --no-cache-dir -r requirements.txt

	To save new dependencies:
		pip freeze  > requirements.txt

	To run app in virtual environment:
		uvicorn app.main:app --host 0.0.0.0 --port 8080

FastAPI should now be running.
If you want to check, you can go to http://LOCALHOST:8080/docs
Obviously replace 'LOCALHOST' if not running on local machine.