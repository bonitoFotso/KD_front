#!/bin/bash

# Ce script initialise la configuration Docker pour votre projet React

# Créer le dossier nginx s'il n'existe pas
mkdir -p nginx

# Créer le fichier nginx.conf s'il n'existe pas déjà
if [ ! -f nginx/nginx.conf ]; then
    cp Dockerfile.prod.sample nginx/nginx.conf
fi

# Créer un .dockerignore s'il n'existe pas
if [ ! -f .dockerignore ]; then
    echo "Création du fichier .dockerignore..."
    
    cat > .dockerignore << EOL
node_modules
build
.git
.gitignore
.dockerignore
.env.local
.env.development.local
.env.test.local
.env.production.local
Dockerfile*
docker-compose*
README.md
EOL

    echo "Fichier .dockerignore créé."
fi

# Créer un .env.example s'il n'existe pas
if [ ! -f .env.example ]; then
    echo "Création du fichier .env.example..."
    
    cat > .env.example << EOL
VITE_APP_API_URL=http://localhost:8000/api
VITE_APP_ENV=development
EOL

    echo "Fichier .env.example créé."
fi

# Instructions pour l'utilisateur
echo "Configuration initiale terminée!"
echo ""
echo "Pour démarrer votre application en mode développement:"
echo "docker-compose up -d frontend-dev"
echo ""
echo "Pour construire et exécuter en mode production:"
echo "docker-compose --profile prod up -d"
echo ""
echo "Pour exécuter les tests:"
echo "docker-compose --profile test up"
echo ""
echo "Pour arrêter l'application:"
echo "docker-compose down"