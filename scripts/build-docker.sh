#/bin/sh

# Install dependencies
cd hosting
npm install

# Copy Functions folder
rsync -av --progress ../functions . --exclude lib --exclude steps --exclude node_modules --exclude features --exclude tests


cd ../hosting
if docker build -t orderbot-image .; then
    rm -rf functions
fi