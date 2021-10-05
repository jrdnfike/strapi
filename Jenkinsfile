pipeline {
    agent {
        docker {
            image 'node:lts-buster-slim'
            args '-p 3000:3000'
        }
    }
    environment {
        CI = 'true'
	CODECOV_TOKEN='31be7cd7-381c-4d57-870b-051b1bc7b3f1' 
    }
    stages {
        stage('Setup and Build') {
            steps {
                sh 'npm install yarn'

		// Ensure no package conflicts with yarn
		sh 'rm package-lock.json'
		sh 'npm run setup'
            }
        }
        stage('Unit Test and Code Coverage') { 
            steps {
		//sh 'npm install codecov jest'
		//sh 'npm run test:unit-codecov'
		sh 'npm run test:front:ce'
            }
        }
    }
}
