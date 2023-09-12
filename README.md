# ApiRest
API de Gerenciamento de Usuários e Arquivos, Esta API foi desenvolvida usando o Node.js e o ORM Prisma. Ela oferece recursos para gerenciar usuários e arquivos, incluindo a criação, exclusão, atualização e listagem de usuários, consulta de informações de usuário na API pública do GitHub.

#  Executar projeto:

## Execute o comando npm install para instalar todas as dependências do projeto, incluindo as dependências do Prisma.<br>

## Configuração do banco de dados:<br><h4> Se o projeto usa o Prisma como ORM, você precisará configurar o banco de dados na máquina de destino. Verifique o arquivo prisma/schema.prisma para obter informações sobre o banco de dados usado (por exemplo, MySQL, PostgreSQL, SQLite) e certifique-se de que o banco de dados esteja instalado e configurado corretamente na máquina.<br></h4>

## Geração das migrations:<br><h4> Você precisará gerar as migrations antes de executar o projeto. No terminal, execute o comando <b>npx prisma migrate dev</b> para criar e aplicar as migrations ao banco de dados.</h4>

## Compilação do código TypeScript:<br> <h4>Você precisará compilar o código antes de executá-lo. No terminal, execute o comando <b>npm run build</b> para compilar o código TypeScript para JavaScript. Isso gerará a pasta dist ou build, que conterá o código JavaScript compilado.</h4>

## Execução do projeto:<br> <h4>Após a instalação das dependências, a configuração do banco de dados e a compilação do código, você pode executar o projeto. No terminal, execute o comando <b>npm start</b>.</h4>


