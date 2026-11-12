# Configuração do Aero-Planes

O projeto usa o Supabase para cadastro, login e histórico das simulações. A pesquisa de tarifas usa a API Duffel por uma Edge Function, mantendo o token da Duffel no servidor. A etapa de pagamento é fictícia: não cobra, não reserva assentos e não emite passagens.

## 1. Criar e configurar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No painel do projeto, abra **SQL Editor**, execute o conteúdo de `supabase/migrations/20261112000000_create_demo_bookings.sql` e confirme que a tabela `reservas_demo` foi criada.
3. Em **Project Settings → API**, copie a Project URL e a chave pública `anon`/publishable.
4. Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` em `supabase-config.js`. A chave pública é usada no navegador; nunca coloque a `service_role` nesse arquivo.
5. Em **Authentication → URL Configuration**, adicione o endereço local ou o domínio publicado à lista de URLs permitidas. Se a confirmação de e-mail estiver habilitada, o cadastro pede que a pessoa confirme o e-mail antes de entrar.

## 2. Ativar pesquisa Duffel

1. Crie uma conta de desenvolvedor Duffel e obtenha um token de teste para desenvolvimento. Ofertas com preços reais atualizados dependem de acesso ao modo Live e da aprovação/condições da Duffel; um token de teste não deve ser tratado como tarifa disponível para compra.
2. Instale e autentique a [Supabase CLI](https://supabase.com/docs/guides/cli) e vincule o diretório ao projeto Supabase.
3. Cadastre o token como segredo do servidor e publique a função:

   ```sh
   supabase secrets set DUFFEL_API_TOKEN=SEU_TOKEN_DUFFEL
   supabase functions deploy search-flights
   ```

   Use um token de teste durante o desenvolvimento, nunca o token em `supabase-config.js` ou no código do navegador. A função exige autenticação Supabase e aceita buscas de ida em classe econômica, de aeroportos informados por código IATA. A integração exibe ofertas, mas não cria reservas nem emite passagens.

## 3. Executar e publicar

Abra o projeto por um servidor local (não diretamente com `file://`), por exemplo:

```sh
python3 -m http.server 8000
```

Acesse `http://localhost:8000/pagina-inicial.html`. Publique os arquivos HTML e JavaScript em uma hospedagem de site estático e inclua o domínio nas URLs permitidas do Supabase. Os arquivos `pagina-inicial.html`, `login.html` e `voos.html` são as páginas do site.

## Sobre a simulação de pagamento

As opções PIX e cartão apenas registram uma simulação associada à conta conectada. Nenhum dado de cartão é coletado. A integração de pagamentos reais e a emissão de passagens exigiriam provedores, credenciais e fluxos de compra próprios; não fazem parte deste projeto escolar.
