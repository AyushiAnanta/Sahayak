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
                // 1. Create the directory and a dummy .env file so Docker doesn't crash
                sh 'mkdir -p ai-service && touch ai-service/.env'
                
                // 2. Use withCredentials to securely pass your Groq key
                // Note: You must first add 'GROQ_API_KEY' to Jenkins -> Manage Jenkins -> Credentials
                withCredentials([string(credentialsId: 'groq-api-key', variable: 'GROQ_KEY')]) {
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