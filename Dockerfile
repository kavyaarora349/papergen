FROM node:20-slim

# Install Python, pip, and venv
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Create a virtual environment and add it to PATH
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy and install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend package.json and install Node dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy the rest of the application
WORKDIR /app
COPY . .

# Ensure the backend runs on Koyeb's expected port
EXPOSE 8000
ENV PORT=8000

# Start the backend server
WORKDIR /app/backend
CMD ["npm", "start"]
