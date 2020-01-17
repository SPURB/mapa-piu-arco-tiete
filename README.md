# Mapa PIU Arco Tietê
Mapa interativo da consulta pública do Projeto de Intervenção Urbana Arco Tietê

## Pré-requisitos para desenvolvimento. 
São necessárias as seguintes instalações globais para iniciar o desenvolvimento:
* [git-fls](https://git-lfs.github.com/)
* [nodejs e npm](https://nodejs.org/)

### Setup para desenvolvimento

1. Clone o repositório e instale as dependências do projeto.
```bash
# clone este repositório
git clone https://github.com/SPURB/mapa-consulta-arco-tiete.git

cd mapa-consulta-arco-tiete

# instale as dependências deste projeto
npm i
```

2. Inicie a aplicação para desenvolvimento em `http://localhost:1234`.
```
npm run start
```
A aplicação deve estar funcionando em [localhost:1234](http://localhost:1234/) no seu browser. 

## Variáveis de ambiente
Configure as variáveis de ambiente. A partir do arquivo `.env` crie dois arquivos `.env.development.local` e `.env.production.local`. As variáveis serão trocadas de acordo com a tabela abaixo:

| Comandos             | Variáveis                   |
| -------------------- |:----------------------------|
| `npm run start`      | `.env.development.local`    |
| `npm run build`      | `.env.production.local`     |

As variáveis a serem configuraddas nos arquivo `*.env` são:

```
API_URL=https://api.gestaourbana.prefeitura.sp.gov.br/v3/
API_TOKEN=algum-token
APP_URL=https://participe.gestaourbana.prefeitura.sp.gov.br/mapas/piu-arco-tiete-2/
BING_API_KEY=algum-token
GOOGLE_SHEET_ID=1pHVx_5KbNpAc7wvsnOX10wpv8GiUEHqq-1qlhjKRSSY
```

> Arquivos no padrão `env.*.local` são ingnorados pelo git. Cuidado para **não comitar**  estas variáveis em outros arquivos. Não comitar deleção ou alterações no arquivo `.env`.

> Crie uma [chave no bing maps](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key) e atualize o valor de `BING_API_KEY` para visualizar a base do mapa localmente. 

## Compile os arquivos para publicação
1. Crie um arquivo `.env.production.local` com os mesmos parâmetros do arquivo `.env` atualizando os valores do seu ambiente da publicação.

2. Compile os arquivos no diretório `dist/`

```
npm run build
```

Publique os arquivos criados em `dist/` para endereço especificado em `.env.production.local`.

## Atualização de dados 
Os dados da aplicação (`data-src/json/*.json`) são arquivos compilados da [planilha do google docs](https://docs.google.com/spreadsheets/d/1pHVx_5KbNpAc7wvsnOX10wpv8GiUEHqq-1qlhjKRSSY/). Havendo atualizações nesta planilha será necessário compilar novamente. Para fazer isso rodar o comando abaixo antes de `npm run start` ou `build`:
```
npm run files
```
Para que os dados da aplicação funcionem será necessário publicar a planilha para a web.
![mapa-piu-arco-tiete](https://user-images.githubusercontent.com/4117768/72641048-f428d780-3947-11ea-99f8-c9730986b730.png)


## Documentação de bugs
Toda contribuição é bem vinda. Crie uma [issue](https://github.com/SPURB/piu-arco-tiete/issues).

## Licença
[GNU General Public License v3.0](https://github.com/SPURB/piu-arco-tiete/blob/master/LICENSE).
