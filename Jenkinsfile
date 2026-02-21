pipeline {
    agent any 
    
    // This tells Jenkins exactly where Mac installed Docker
    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:$PATH"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // We skipped the redundant NPM steps and go straight to Docker!
        stage('Deploy Application') {
            steps {
                sh 'docker-compose up -d --build'
            }
        }
    }
    
    post {
        success {
            echo 'ChugliManch deployed successfully! 🎉'
        }
        failure {
            echo 'Oh no, the build failed. Check the logs! 🚨'
        }
    }
}