FROM python:3.10

# Set the working directory to /backend
WORKDIR /backend

# Copy requirements.txt to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Copy the content of the local backend directory to the working directory
COPY . .

# Expose port 8080
EXPOSE 8080

# Define the command to run on container start
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
