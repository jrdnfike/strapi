pipeline {
    agent {
        docker {
            image 'node:lts-buster-slim'
            args '-p 3000:3000'
        }
    }
    environment {
        CI = 'true' 
    }
    stages {
        stage('Setup and Build') {
            steps {
                sh 'npm install --global yarn'
		sh 'npm run setup'
            }
        }
        stage('Unit Test and Code Coverage') { 
            steps {
		sh 'npm install --global codecov'
		sh 'npm run test:unit-codecov'
            }
        }
    }
}
