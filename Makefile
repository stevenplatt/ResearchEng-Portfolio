# Makefile for ResearchEng-Portfolio

.PHONY: help install demo telecomsteve clean test deploy-demo

# Default target
help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies (http-server, test tooling)"
	@echo "  make demo          - Run local development server"
	@echo "  make telecomsteve  - Run local development server"
	@echo "  make clean         - Clean any temporary files"
	@echo "  make test          - Run the test suite with coverage"
	@echo "  make deploy-demo   - Deploy to demo environment (requires GCP credentials)"

# Install dependencies
install:
	@echo "Installing dependencies..."
	sudo npm install http-server -g
	npm install

# Run local development server
demo:
	@echo "Starting local server on http://localhost:8080"
	npx http-server -p 8080 -o

# Run local development server using telecomsteve example code
telecomsteve:
	@echo "Starting telecomsteve example site on http://localhost:8081"
	npx http-server examples/telecomsteve -p 8081 -o

# Run the test suite with coverage (fails below 100% coverage)
test:
	npm test

# Clean any temporary files
clean:
	@echo "Cleaning temporary files..."
	find . -name '*DS_Store*' -type f -delete
	find . -name '*.log' -type f -delete

# Deploy to demo environment (Google Cloud Storage)
deploy-demo:
	@echo "Deploying to demo environment..."
	gcloud storage cp 404.html gs://demo.telecomsteve.com/
	gcloud storage cp index.html gs://demo.telecomsteve.com/
	gcloud storage cp portfolio.html gs://demo.telecomsteve.com/
	gcloud storage cp research.html gs://demo.telecomsteve.com/
	gcloud storage cp resume.html gs://demo.telecomsteve.com/
	gcloud storage cp sidenav.html gs://demo.telecomsteve.com/
	gcloud storage cp blog.html gs://demo.telecomsteve.com/
	gcloud storage cp -r blog-posts gs://demo.telecomsteve.com/
	gcloud storage cp -r css gs://demo.telecomsteve.com/
	gcloud storage cp -r img gs://demo.telecomsteve.com/
	gcloud storage cp -r js gs://demo.telecomsteve.com/
	gcloud storage cp LICENSE gs://demo.telecomsteve.com/
	gcloud storage cp README.md gs://demo.telecomsteve.com/
	gcloud storage buckets update gs://demo.telecomsteve.com --web-main-page-suffix=index.html --web-error-page=404.html
	@echo "Demo deployment complete: https://demo.telecomsteve.com"

# The production site (telecomsteve.com) is built and deployed from
# https://github.com/stevenplatt/telecomsteve — this repo only feeds
# demo.telecomsteve.com.