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
                // 1. Generate the missing .env file on the fly
                sh 'echo "GOOGLE_CLIENT_ID=dummy_key\nGOOGLE_CLIENT_SECRET=dummy_secret\nPORT=5000" > backend/.env'
                
                // 2. Start Docker
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