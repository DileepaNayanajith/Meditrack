pipeline {
  agent {
    label 'rootless-docker'
  }

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    COMPOSE_PROJECT_NAME = 'meditrack'
    FRONTEND_PORT = '8081'
    ENV_FILE = '.env.docker.example'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate') {
      steps {
        sh 'docker version'
        sh 'docker compose version'
        sh 'docker compose --env-file "$ENV_FILE" config --quiet'
      }
    }

    stage('Build') {
      steps {
        sh 'docker compose --env-file "$ENV_FILE" build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose --env-file "$ENV_FILE" up -d --remove-orphans'
      }
    }

    stage('Verify') {
      steps {
        sh 'docker compose --env-file "$ENV_FILE" ps'
        sh 'docker compose --env-file "$ENV_FILE" exec -T frontend wget -qO- http://127.0.0.1/api/health'
      }
    }
  }

  post {
    failure {
      sh 'docker compose --env-file "$ENV_FILE" logs --tail=100 || true'
    }
  }
}
