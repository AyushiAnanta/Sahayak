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
                // Create dummy .env files for ALL services that expect them
                sh '''
                    mkdir -p ai-service && touch ai-service/.env
                    mkdir -p backend && touch backend/.env
                    mkdir -p frontend && touch frontend/.env
                '''
                
                withCredentials([string(credentialsId: 'groq-api-key', variable: 'GROQ_KEY')]) {
                    // Pass the key and run the build
                    sh "export GROQ_API_KEY=${GROQ_KEY} && docker-compose up -d --build"
                }
            }
}
        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'groq-api-key', variable: 'GROQ_API_KEY')]) {
                    sh "export GROQ_API_KEY=${GROQ_API_KEY} && docker-compose up -d --build"
        }
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