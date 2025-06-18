1. #!/bin/bash
git add .
git commit -m "Corrige dependências"
git pushLimpar node_modules
rm -rf node_modules package-lock.json
2. Reinstalar
npm install
3. Commitar
#!/bin/bash

# Adiciona todas as alterações
git add .

# Faz commit das alterações
git commit -m "Corrige dependências"

# Faz push para o repositório remoto
git push

# Limpa node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstala as dependências
npm install

# Adiciona e faz commit das alterações após reinstalar dependências
git add .
git commit -m "Corrige dependências"
git push
