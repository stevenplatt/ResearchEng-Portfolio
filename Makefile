# Makefile for ResearchEng-Portfolio

.PHONY: help install telecomsteve clean deploy-demo deploy-prod

# Default target
help:
	@echo "Available commands:"
	@echo "  make install         - Install dependencies (http-server)"
	@echo "  make telecomsteve    - Run local development server"
	@echo "  make clean           - Clean any temporary files"
	@echo "  make deploy-demo     - Deploy to demo environment (requires GCP credentials)"
	@echo "  make deploy-prod     - Deploy to production environment (requires GCP credentials)"

# Install dependencies
install:
	@echo "Installing dependencies..."
	sudo npm install http-server -g

# Run local development server using telecomsteve example code
telecomsteve:
	@echo "Starting telecomsteve example site on http://localhost:8081"
	npx http-server examples/telecomsteve -p 8081 -o

# Clean any temporary files
clean:
	@echo "Cleaning temporary files..."
	find . -name '*DS_Store*' -type f -delete
	find . -name '*.log' -type f -delete

# Deploy to demo environment (Google Cloud Storage)
deploy-demo:
	@echo "Deploying to demo environment..."
	gsutil -m cp 404.html gs://demo.telecomsteve.com/
	gsutil -m cp index.html gs://demo.telecomsteve.com/
	gsutil -m cp portfolio.html gs://demo.telecomsteve.com/
	gsutil -m cp research.html gs://demo.telecomsteve.com/
	gsutil -m cp resume.html gs://demo.telecomsteve.com/
	gsutil -m cp sidenav.html gs://demo.telecomsteve.com/
	gsutil -m cp blog.html gs://demo.telecomsteve.com/
	gsutil -m cp -r blog-posts gs://demo.telecomsteve.com/
	gsutil -m cp -r css gs://demo.telecomsteve.com/
	gsutil -m cp -r img gs://demo.telecomsteve.com/
	gsutil -m cp -r js gs://demo.telecomsteve.com/
	gsutil -m cp LICENSE gs://demo.telecomsteve.com/
	gsutil -m cp README.md gs://demo.telecomsteve.com/
	gsutil web set -m index.html -e 404.html gs://demo.telecomsteve.com/
	@echo "Demo deployment complete: https://demo.telecomsteve.com"

# Deploy to production environment (Google Cloud Storage)
deploy-prod:
	@echo "Deploying to production environment..."
	gsutil -m cp -r examples/telecomsteve/* gs://telecomsteve.com/
	gsutil web set -m index.html -e 404.html gs://telecomsteve.com/
	@echo "Production deployment complete: https://telecomsteve.com"