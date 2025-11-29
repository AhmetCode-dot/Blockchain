FROM node:20
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# Konteyner kapanmasın diye sleep komutu
CMD ["bash", "-c", "npx hardhat compile && sleep infinity"]