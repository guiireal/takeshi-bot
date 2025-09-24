const assert = require("node:assert");
const { describe, it } = require("node:test");
const { isLink } = require("../middlewares");

describe("isLink Middleware", () => {
  const testCases = [
    {
      input: "site com espaços.com",
      expected: true,
      description: "Domínio com espaços",
    },
    {
      input: "site-legal.com",
      expected: true,
      description: "Domínio com hífen",
    },
    {
      input: "site.com.br",
      expected: true,
      description: "Domínio com múltiplas extensões",
    },
    {
      input: "www.google.com",
      expected: true,
      description: "Domínio com www",
    },
    {
      input: "ab.xyz",
      expected: true,
      description: "Domínio curto válido",
    },
    {
      input: "site123.com",
      expected: true,
      description: "Domínio que termina com número",
    },
    {
      input: "youtube.com",
      expected: true,
      description: "Domínio popular",
    },
    {
      input: "123site.com",
      expected: true,
      description: "Domínio que começa com número",
    },
    {
      input: "https://elfopg.net?id=462167794&currency=BRL&type=2",
      expected: true,
      description: "Domínio que estava passando antes",
    },
    {
      input: "google.com",
      expected: true,
      description: "Domínio simples",
    },
    {
      input: "texto.sem",
      expected: true,
      description: "Extensão muito curta",
    },
    {
      input: "200.155.65.12",
      expected: true,
      description: "IP address",
    },
    {
      input: "github.com",
      expected: true,
      description: "Outro domínio popular",
    },
    {
      input: "arquivo.txt",
      expected: false,
      description: "Permitir arquivo local",
    },
    {
      input: "documento.pdf",
      expected: false,
      description: "Permitir arquivo PDF",
    },
    {
      input: "   ",
      expected: false,
      description: "Permitir apenas espaços",
    },
    {
      input: "12345",
      expected: false,
      description: "Permitir apenas números",
    },
    {
      input: ".com",
      expected: false,
      description: "Permitir começar com ponto",
    },
    {
      input: "a.b",
      expected: false,
      description: "Permitir domínio muito curto",
    },
    {
      input: "email@domain",
      expected: false,
      description: "Permitir e-mail sem extensão",
    },
    {
      input: "123",
      expected: false,
      description: "Permitir números pequenos",
    },
    {
      input: "versão 1.0.5",
      expected: false,
      description: "Permitir número de versão",
    },
    {
      input: "site..com",
      expected: false,
      description: "Permitir pontos consecutivos",
    },
    {
      input: "",
      expected: false,
      description: "Permitir string vazia",
    },
    {
      input: "site.",
      expected: false,
      description: "Permitir terminar com ponto",
    },
    {
      input: "site...com",
      expected: false,
      description: "Permitir três pontos consecutivos",
    },
    {
      input: "subdomain.example.org",
      expected: true,
      description: "Subdomínio",
    },
    {
      input: "Acesse google.com para buscar",
      expected: true,
      description: "Texto com URL no meio",
    },
    {
      input: "https://github.com/user/repo",
      expected: true,
      description: "Texto com URL completa",
    },
    {
      input: "Link: https://github.com/user/repo",
      expected: true,
      description: "Texto com URL completa",
    },
    {
      input: "Visite www.example.com hoje",
      expected: true,
      description: "Texto com www",
    },
    {
      input: "apenas texto",
      expected: false,
      description: "Texto normal sem domínio",
    },
    {
      input: "http://example.com",
      expected: true,
      description: "URL completa com http",
    },
    {
      input: "https://google.com",
      expected: true,
      description: "URL completa com https",
    },
    {
      input: "facebook.com/profile",
      expected: true,
      description: "URL com caminho",
    },
    {
      input: "site.com.br/pagina?param=valor",
      expected: true,
      description: "URL com query params",
    },
    {
      input: "  google.com  ",
      expected: true,
      description: "URL com espaços nas bordas",
    },
    {
      input: "GOOGLE.COM",
      expected: true,
      description: "URL em maiúscula",
    },
  ];

  testCases.forEach(({ input, expected, description }) => {
    it(description, () => {
      const result = isLink(input);
      assert.strictEqual(
        result,
        expected,
        `Para entrada "${input}", esperado ${expected} mas recebeu ${result}`
      );
    });
  });
});
