pipeline {
    // This tells Jenkins it can run on any available server
    agent any 

    stages {
        // STAGE 1: Pull the latest code from GitHub
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // STAGE 2: Make sure the Backend isn't broken
        stage('Test Backend') {
            steps {
                // The 'dir' command tells Jenkins to cd into the backend folder
                dir('backend') {
                    sh 'npm install'
                    // sh 'npm test'  <-- Uncomment this later when you write unit tests!
                }
            }
        }

        // STAGE 3: Make sure the Frontend isn't broken
        stage('Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    // sh 'npm run test' <-- Uncomment this later when you write unit tests!
                }
            }
        }

        // STAGE 4: Build and turn on the Docker containers
        stage('Deploy Application') {
            steps {
                // The -d flag runs it in "detached" mode so it runs in the background
                sh 'docker-compose up -d --build'
            }
        }
    }
    
    // This runs after all stages finish, whether they succeeded or failed
    post {
        success {
            echo 'ChugliManch deployed successfully! 🎉'
        }
        failure {
            echo 'Oh no, the build failed. Check the logs! 🚨'
        }
    }
}