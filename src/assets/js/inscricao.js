const MAX_ATIVIDADES = 3;

// eslint-disable-next-line no-unused-vars
function inscricao() {
  return {
    data: {
      activities: [],
    },
    formulario: {
      nome: "",
      email: "",
      nascimento: "",
      estado: "",
      cidade: "",
      libras: false,
      atividades: [],
    },
    validacao: {
      nome: {
        tocado: false,
        erro: "",
      },
      email: {
        tocado: false,
        erro: "",
      },
      nascimento: {
        tocado: false,
        erro: "",
      },
      cidade: {
        tocado: false,
        erro: "",
      },
    },
    tocar(f) {
      this.validacao[f].tocado = true;
      this.validar(f);
    },
    validar(f) {
      const valor = this.formulario[f];
      const validacao = this.validacao[f];

      switch (f) {
        case "nome":
          if (!valor) {
            validacao.erro = "O nome é obrigatório.";
          } else {
            validacao.erro = "";
          }
          break;
        case "cidade":
          if (this.formulario.estado && !valor) {
            validacao.erro = "A cidade é obrigatória.";
          } else {
            validacao.erro = "";
          }
          break;
        case "email": {
          const regex = new RegExp("^\\S+@\\S+[\\.][0-9a-z]+$");

          if (!valor) {
            validacao.erro = "O e-mail é obrigatório.";
          } else if (!regex.test(valor)) {
            validacao.erro = "O e-mail precisa ser válido.";
          } else {
            validacao.erro = "";
          }
          break;
        }
        case "nascimento": {
          const regex = /(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19[0-8]\d|199\d|200\d|201\d)/;

          if (valor && !regex.test(valor)) {
            validacao.erro = "O data precisa ser válida.";
          } else {
            validacao.erro = "";
          }

          break;
        }
        default:
          validacao.erro = "";
          break;
      }
    },
    estado() {
      if (this.formulario.estado === "DF") {
        this.formulario.cidade = "Brasília";
      } else {
        this.formulario.cidade = "";
      }

      this.validar("cidade");
    },
    oficinas() {
      const oficinasSelecionadas = this.data.activities.filter((v) =>
        this.formulario.atividades.includes("" + v.id)
      );

      const oficinasMenosSelecionadas = this.data.activities.filter(
        (v) => !this.formulario.atividades.includes("" + v.id)
      );

      for (const naoSelecionada of oficinasMenosSelecionadas) {
        if (this.formulario.atividades.length === MAX_ATIVIDADES) {
          naoSelecionada._conflito = true;
          continue;
        }

        naoSelecionada._conflito = false;

        for (const naoSelecionadaEpisodio of naoSelecionada.episodes) {
          const naoSelecionadaInicio = new Date(naoSelecionadaEpisodio.start);
          const naoSelecionadaFim = new Date(naoSelecionadaEpisodio.end);

          for (const selecionada of oficinasSelecionadas) {
            for (const selecionadaEpisodio of selecionada.episodes) {
              const selecionadaInicio = new Date(selecionadaEpisodio.start);
              const selecionadaFim = new Date(selecionadaEpisodio.end);

              const comparacao =
                selecionadaInicio < naoSelecionadaFim &&
                naoSelecionadaInicio < selecionadaFim;

              if (comparacao) {
                naoSelecionada._conflito = true;
                break;
              }
            }
          }
        }
      }
    },
    async init() {
      const activities = await fetch(
        "https://capsideo.convep.org/activities/enrollment"
      );

      this.data.activities = await activities.json();
    },
    async enviar() {
      let erros = false;
      for (const [campo, valor] of Object.entries(this.validacao)) {
        valor.tocado = true;
        this.validar(campo);

        if (valor.erro) {
          erros = true;
        }
      }

      if (erros) {
        this.erro =
          "Algumas informações não foram inseridas corretamente. Por favor, verifique no formulário.";
        return;
      }

      this.erro = "";
      this.carregando = true;

      const request = {
        email: this.formulario.email,
        name: this.formulario.nome,
        birth: null,
        state: this.formulario.estado || null,
        city: this.formulario.cidade || null,
        libras: this.formulario.libras,
        activities: null,
      };

      if (this.formulario.nascimento) {
        const nascimento = this.formulario.nascimento.split("/");
        request.birth = new Date(nascimento[2], nascimento[1], nascimento[0]);
      }

      if (this.formulario.atividades.length) {
        request.activities = this.formulario.atividades.map((a) => +a);
      }

      const result = await fetch("https://capsideo.convep.org/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const response = await result.json();
      this.carregando = false;

      if (result.status !== 201) {
        switch (response.code) {
          case 2:
            this.erro =
              "Algumas informações não foram inseridas corretamente. Por favor, verifique no formulário.";
            break;
          case 5:
            this.erro =
              "O e-mail já está sendo utilizado por outro participante. Por favor, escolha um e-mail diferente.";
            break;
          default:
            this.erro = "Ocorreu um erro. Tente novamente mais tarde.";
            break;
        }

        return;
      }

      this.sucesso = true;
      window.scrollTo(0, this.$refs.inscricao.offsetTop);
    },
    erro: "",
    sucesso: false,
    carregando: false,
  };
}
